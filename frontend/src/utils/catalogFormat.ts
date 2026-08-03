const IGNORE_WORDS = ['y', 'e', 'de', 'del', 'la', 'las', 'el', 'los', 'en', 'para', 'por', 'con', 'a', 'al', 'o', 'u'];

/** Derives a short acronym from a title/module name, e.g.
 * "Infraestructuras comunes de telecomunicación en viviendas y edificios" -> "ICTVE".
 * Used as a synchronous alternative to a hardcoded code->acronym lookup table:
 * any real name from the catalog or a loaded .fpp/.fpg produces a consistent acronym
 * without needing a fetch. */
export function getAcronym(name: string): string {
  let cleanName = name.replace(/\([^)]+\)/g, '').trim();
  if (cleanName.includes('-')) {
    cleanName = cleanName.split('-').slice(1).join('-').trim();
  }
  return cleanName.split(/\s+/)
    .filter((w) => !IGNORE_WORDS.includes(w.toLowerCase()) && w.length > 0)
    .map((w) => w[0].toUpperCase())
    .join('');
}
