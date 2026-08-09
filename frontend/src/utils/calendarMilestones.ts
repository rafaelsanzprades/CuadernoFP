/** Hitos que se muestran solos como "relevante" en el calendario (visual y
 * en el PDF/DOCX exportado), derivados de fechas que el profesor ya
 * configura en Fechas generales — sin que haga falta añadirlos también a
 * mano en Eventos y festivos. */
const MILESTONE_FIELDS: [string, string][] = [
  ["ini_curso", "Inicio de curso"],
  ["fecha_presentacion", "Presentación"],
  ["ini_1t", "Inicio clases"],
  ["fin_1t", "Fin 1er trimestre"],
  ["ini_2t", "Inicio 2º trimestre"],
  ["fin_2t", "Fin 2º trimestre"],
  ["ini_3t", "Inicio 3er trimestre"],
  ["fin_3t", "Fin 3er trimestre"],
  ["fin_curso", "Fin de curso"],
];

/** Devuelve { "dd/mm/yyyy": "Etiqueta" }, combinando con " / " si varios
 * hitos caen en el mismo día. Las fechas de info_fechas están en formato
 * yyyy-mm-dd (input type="date"). */
export function getAutoMilestones(info_fechas: Record<string, any> | undefined | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!info_fechas) return out;
  for (const [field, label] of MILESTONE_FIELDS) {
    const raw = info_fechas[field];
    if (typeof raw !== "string" || !raw) continue;
    const parts = raw.split("-");
    if (parts.length !== 3) continue;
    const [y, m, d] = parts;
    const key = `${d}/${m}/${y}`;
    out[key] = out[key] ? `${out[key]} / ${label}` : label;
  }
  return out;
}
