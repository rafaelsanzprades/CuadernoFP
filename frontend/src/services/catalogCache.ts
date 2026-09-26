/**
 * Catalog Cache Service
 * 
 * Caches RA/CE descriptions from the catalog API to avoid redundant fetches.
 * Used as fallback when module data doesn't include descriptive text (e.g., .fpp files).
 */

interface ModuloInfo {
  nombre: string;
  horas: number | null;
  curso: string;
  familia: string;
  tituloFp: string;
  nivel: string;
}

interface CachedCatalogData {
  ra: Map<string, string>;          // id_ra → desc_ra
  ce: Map<string, string>;          // id_ce → desc_ce
  ud: Map<string, string>;          // id_ud → desc_ud (from catalog if available)
  og: Array<{ id: string; desc: string }>;  // article_9_og
  cpps: Array<{ id: string; desc: string }>; // article_5_cpps
  modulo: ModuloInfo | null;        // nombre/horas/familia/título/nivel oficiales
  loaded: number;                   // timestamp
}

// La BBDD guarda degrees.level en corto ("BASICO"/"MEDIO"/"SUPERIOR"); el
// resto de la app (VerificacionTab, ContextoTab...) compara contra el
// texto largo ("Grado Medio") que se guardaba antes a mano en info_modulo.
function normalizeNivel(raw: string): string {
  const key = raw.trim().toUpperCase();
  if (key === 'BASICO' || key === 'BÁSICO') return 'Grado Básico';
  if (key === 'MEDIO') return 'Grado Medio';
  if (key === 'SUPERIOR') return 'Grado Superior';
  return raw;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CachedCatalogData>();
// Varios componentes (RaOgMatrix, curriculo/page.tsx, ...) piden el mismo
// moduleId en su propio useEffect al montar -- sin este dedup, cada uno
// dispara su propio fetch en paralelo (visto: 3x peticiones identicas a la
// vez), lo que alarga sin necesidad la ventana en la que el catalogo todavia
// no esta listo.
const inFlight = new Map<string, Promise<void>>();

/**
 * Fetch catalog data for a module code and cache it.
 * Returns RA descriptions as a Map keyed by "RA1", "RA2", etc.
 * Returns CE descriptions as a Map keyed by "CE1.a", "CE1.b", etc.
 * Also loads OG and CPPS from the curriculum endpoint (boa_articles).
 *
 * `degreeCodeHint`: código del título (p.ej. "ELE203"), si se conoce --
 * un mismo código de módulo puede existir en varios títulos con contenido
 * distinto (p.ej. '0237' es a la vez un módulo de ELE203 y de ELE202), así
 * que sin esta pista el backend puede devolver el módulo equivocado. Viene
 * normalmente de `moduleData.info_modulo.titulo_codigo`, guardado al crear
 * la programación desde el catálogo (`catalogo/page.tsx`) -- los ficheros
 * DEMO y los importados de antes de que existiera ese campo no lo tienen,
 * y el backend cae a su comportamiento anterior (el primer módulo que
 * encuentre con ese código) si no se pasa o no encaja.
 */
export async function loadCatalogForModule(moduleId: string, degreeCodeHint?: string | null): Promise<void> {
  const moduleCode = moduleId.split('-')[0];
  const existing = cache.get(moduleCode);
  if (existing && (Date.now() - existing.loaded) < CACHE_TTL_MS) return;

  const pending = inFlight.get(moduleCode);
  if (pending) return pending;

  const promise = fetchCatalogForModule(moduleCode, degreeCodeHint).finally(() => {
    inFlight.delete(moduleCode);
  });
  inFlight.set(moduleCode, promise);
  return promise;
}

async function fetchCatalogForModule(moduleCode: string, degreeCodeHint?: string | null): Promise<void> {
  try {
    const url = degreeCodeHint
      ? `/api/catalog/module/${moduleCode}?degree_code=${encodeURIComponent(degreeCodeHint)}`
      : `/api/catalog/module/${moduleCode}`;
    const res = await fetch(url);
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
    
    // Load OG, CPPS y datos de título/familia del endpoint de currículo
    let og: Array<{ id: string; desc: string }> = [];
    let cpps: Array<{ id: string; desc: string }> = [];
    let familia = '';
    let tituloFp = '';
    let nivel = '';
    try {
      const degreeCode = json.data.degree_code || moduleCode;
      const curRes = await fetch(`/api/catalog/curriculum/${degreeCode}`);
      if (curRes.ok) {
        const curJson = await curRes.json();
        if (curJson.status === 'success' && curJson.data) {
          if (curJson.data.boa_articles) {
            og = curJson.data.boa_articles.article_9_og || [];
            cpps = curJson.data.boa_articles.article_5_cpps || [];
          }
          familia = curJson.data.familia || '';
          tituloFp = curJson.data.titulo_fp || '';
          nivel = curJson.data.nivel || '';
        }
      }
    } catch { /* OG/CPPS/título no críticos */ }

    const modulo: ModuloInfo = {
      nombre: json.data.nombre || '',
      horas: typeof json.data.horas === 'number' ? json.data.horas : null,
      curso: json.data.curso || '',
      familia,
      tituloFp,
      nivel: normalizeNivel(nivel),
    };

    cache.set(moduleCode, {
      ra: raMap,
      ce: ceMap,
      ud: new Map(),
      modulo,
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
  const code = moduleCode.split('-')[0];
  return cache.get(code)?.ra.get(raId);
}

/**
 * Get CE description from cache. Returns undefined if not cached.
 */
export function getDescCe(moduleCode: string, ceId: string): string | undefined {
  const code = moduleCode.split('-')[0];
  const ceMap = cache.get(code)?.ce;
  if (!ceMap) return undefined;
  
  if (ceMap.has(ceId)) return ceMap.get(ceId);
  
  const parts = ceId.split('.');
  if (parts.length === 2) {
    const suffix = parts[1];
    if (/[a-z]/i.test(suffix)) {
      const num = suffix.toLowerCase().charCodeAt(0) - 96;
      const numCeId = `${parts[0]}.${num}`;
      if (ceMap.has(numCeId)) return ceMap.get(numCeId);
    } else if (/[0-9]+/.test(suffix)) {
      const char = String.fromCharCode(96 + parseInt(suffix));
      const charCeId = `${parts[0]}.${char}`;
      if (ceMap.has(charCeId)) return ceMap.get(charCeId);
    }
  }
  
  return undefined;
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
export function getOgList(moduleId: string): Array<{ id: string; desc: string }> {
  const code = moduleId.split('-')[0];
  return cache.get(code)?.og || [];
}

/**
 * Get a single OG description by index (0-based).
 * Returns the description string or empty.
 */
export function resolveOg(moduleId: string | null, ogIndex: number): string {
  if (!moduleId) return '';
  const code = moduleId.split('-')[0];
  const list = cache.get(code)?.og;
  if (!list || ogIndex >= list.length) return '';
  return list[ogIndex].desc;
}

/**
 * Get CPPS list from the catalog cache.
 * Returns array of { id: "a", desc: "..." } from article_5_cpps.
 */
export function getCppsList(moduleId: string): Array<{ id: string; desc: string }> {
  const code = moduleId.split('-')[0];
  return cache.get(code)?.cpps || [];
}

/**
 * Resuelve un campo informativo del módulo (nombre, horas, familia,
 * título de FP, nivel) con el mismo criterio que resolveDescRa/resolveDescCe:
 * 1. El valor ya guardado en info_modulo, si viene informado.
 * 2. El del catálogo, cacheado por loadCatalogForModule().
 * moduleCode acepta tanto el código puro ("0237") como un activeModuleId
 * con sufijo ("0237-pd").
 */
function resolveModuloField<K extends keyof ModuloInfo>(
  moduleCode: string | null | undefined,
  storedValue: ModuloInfo[K] | null | undefined,
  field: K
): ModuloInfo[K] | undefined {
  if (storedValue !== undefined && storedValue !== null && storedValue !== '') return storedValue;
  if (!moduleCode) return undefined;
  const code = moduleCode.split('-')[0];
  const modulo = cache.get(code)?.modulo;
  return modulo ? modulo[field] : undefined;
}

export function resolveModuloNombre(moduleCode: string | null | undefined, storedNombre?: string | null): string {
  return resolveModuloField(moduleCode, storedNombre, 'nombre') || '';
}

export function resolveModuloHoras(moduleCode: string | null | undefined, storedHoras?: number | null): number | null {
  const v = resolveModuloField(moduleCode, storedHoras, 'horas');
  return v ?? null;
}

export function resolveModuloFamilia(moduleCode: string | null | undefined, storedFamilia?: string | null): string {
  return resolveModuloField(moduleCode, storedFamilia, 'familia') || '';
}

export function resolveModuloTituloFp(moduleCode: string | null | undefined, storedTituloFp?: string | null): string {
  return resolveModuloField(moduleCode, storedTituloFp, 'tituloFp') || '';
}

export function resolveModuloNivel(moduleCode: string | null | undefined, storedNivel?: string | null): string {
  return resolveModuloField(moduleCode, storedNivel, 'nivel') || '';
}

/**
 * `info_modulo` ya no guarda nombre/horas/familia/titulo_fp/nivel (vienen
 * siempre del catálogo -- Ítem 51, RF Ideas/00 IDEAS.md). Los generadores de
 * documentos del backend (routers/pdf.py y afines) sí esperan encontrarlos
 * en el payload que reciben, así que cualquier fetch que mande `module_data`
 * al backend debe enviar el `info_modulo` pasado por esta función en vez del
 * de `moduleData` tal cual -- no muta el store, solo enriquece la copia que
 * se envía. Llamar solo después de que `loadCatalogForModule(moduleCode)`
 * haya tenido ocasión de resolver (los componentes que generan documentos ya
 * lo hacen para poder mostrar RA/CE, así que normalmente ya está en cache).
 */
export function enrichInfoModulo(moduleCode: string | null | undefined, infoModulo: any): any {
  return {
    ...infoModulo,
    nombre: resolveModuloNombre(moduleCode, infoModulo?.nombre),
    horas: resolveModuloHoras(moduleCode, infoModulo?.horas) ?? infoModulo?.horas,
    familia: resolveModuloFamilia(moduleCode, infoModulo?.familia),
    titulo_fp: resolveModuloTituloFp(moduleCode, infoModulo?.titulo_fp),
    nivel: resolveModuloNivel(moduleCode, infoModulo?.nivel),
  };
}


