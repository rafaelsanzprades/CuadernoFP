/**
 * Catalog Cache Service
 * 
 * Caches RA/CE descriptions from the catalog API to avoid redundant fetches.
 * Used as fallback when module data doesn't include descriptive text (e.g., .fpp files).
 */

interface CachedCatalogData {
  ra: Map<string, string>;          // id_ra → desc_ra
  ce: Map<string, string>;          // id_ce → desc_ce
  ud: Map<string, string>;          // id_ud → desc_ud (from catalog if available)
  og: Array<{ id: string; desc: string }>;  // article_9_og
  cpps: Array<{ id: string; desc: string }>; // article_5_cpps
  loaded: number;                   // timestamp
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CachedCatalogData>();

/**
 * Fetch catalog data for a module code and cache it.
 * Returns RA descriptions as a Map keyed by "RA1", "RA2", etc.
 * Returns CE descriptions as a Map keyed by "CE1.a", "CE1.b", etc.
 * Also loads OG and CPPS from the curriculum endpoint (boa_articles).
 */
export async function loadCatalogForModule(moduleCode: string): Promise<void> {
  const existing = cache.get(moduleCode);
  if (existing && (Date.now() - existing.loaded) < CACHE_TTL_MS) return;
  
  try {
    const res = await fetch(`/api/catalog/module/${moduleCode}`);
    if (!res.ok) return;
    const json = await res.json();
    if (json.status !== 'success' || !json.data) return;
    
    const raMap = new Map<string, string>();
    const ceMap = new Map<string, string>();
    
    for (const ra of (json.data.ra || [])) {
      // API returns id like "RA1." - normalize to "RA1"
      const raId = ra.id.replace(/\.$/, '');
      raMap.set(raId, ra.descripcion);
      
      for (const ce of (ra.ce || [])) {
        ceMap.set(ce.id, ce.descripcion);
      }
    }
    
    // Load OG and CPPS from curriculum endpoint (boa_articles)
    let og: Array<{ id: string; desc: string }> = [];
    let cpps: Array<{ id: string; desc: string }> = [];
    try {
      const degreeCode = json.data.degree_code || moduleCode;
      const curRes = await fetch(`/api/catalog/curriculum/${degreeCode}`);
      if (curRes.ok) {
        const curJson = await curRes.json();
        if (curJson.status === 'success' && curJson.data?.boa_articles) {
          og = curJson.data.boa_articles.article_9_og || [];
          cpps = curJson.data.boa_articles.article_5_cpps || [];
        }
      }
    } catch { /* OG/CPPS not critical */ }
    
    cache.set(moduleCode, {
      ra: raMap,
      ce: ceMap,
      ud: new Map(),
      og,
      cpps,
      loaded: Date.now()
    });
  } catch (err) {
    console.warn(`[catalogCache] Failed to load catalog for ${moduleCode}:`, err);
  }
}

/**
 * Get RA description from cache. Returns undefined if not cached.
 */
export function getDescRa(moduleCode: string, raId: string): string | undefined {
  return cache.get(moduleCode)?.ra.get(raId);
}

/**
 * Get CE description from cache. Returns undefined if not cached.
 */
export function getDescCe(moduleCode: string, ceId: string): string | undefined {
  return cache.get(moduleCode)?.ce.get(ceId);
}

/**
 * Get the best available description for an RA:
 * 1. From the module data (desc_ra field)
 * 2. From the catalog cache
 */
export function resolveDescRa(moduleCode: string | null, ra: { id_ra: string; desc_ra?: string | null }): string {
  if (ra.desc_ra) return ra.desc_ra;
  if (moduleCode) {
    const cached = getDescRa(moduleCode, ra.id_ra);
    if (cached) return cached;
  }
  return '';
}

/**
 * Get the best available description for a CE:
 * 1. From the module data (desc_ce field)
 * 2. From the catalog cache
 */
export function resolveDescCe(moduleCode: string | null, ce: { id_ce: string; desc_ce?: string | null }): string {
  if (ce.desc_ce) return ce.desc_ce;
  if (moduleCode) {
    const cached = getDescCe(moduleCode, ce.id_ce);
    if (cached) return cached;
  }
  return '';
}

/**
 * Get OG list from the catalog cache.
 * Returns array of { id: "a", desc: "..." } from article_9_og.
 */
export function getOgList(moduleCode: string): Array<{ id: string; desc: string }> {
  return cache.get(moduleCode)?.og || [];
}

/**
 * Get a single OG description by index (0-based).
 * Returns the description string or empty.
 */
export function resolveOg(moduleCode: string | null, ogIndex: number): string {
  if (!moduleCode) return '';
  const list = cache.get(moduleCode)?.og;
  if (!list || ogIndex >= list.length) return '';
  return list[ogIndex].desc;
}

/**
 * Get CPPS list from the catalog cache.
 * Returns array of { id: "a", desc: "..." } from article_5_cpps.
 */
export function getCppsList(moduleCode: string): Array<{ id: string; desc: string }> {
  return cache.get(moduleCode)?.cpps || [];
}


