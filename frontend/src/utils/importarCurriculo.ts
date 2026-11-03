// Mezcla lo que la IA extrae de un PDF de currículo (RA, CE y UD) con lo que ya hay en el módulo. Solo añade: lo que ya existe (mismo id) no se toca,
// así que importar nunca destruye trabajo previo. Los pesos solo se reparten solos cuando no había nada que repartir (RA) o dentro de un RA nuevo (CE).

import { repartoIgualitario } from "./calificaciones";

export interface CurriculoExtraido {
  resultados_aprendizaje?: any[];
  criterios_evaluacion?: any[];
  unidades_didacticas?: any[];
}

export interface ResumenImportacion {
  ra: number;
  ce: number;
  ud: number;
  /** Elementos ignorados: ya existían, venían sin id o un CE apuntaba a un RA que no existe. */
  omitidos: number;
}

const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const entero = (v: unknown) => Math.max(0, Math.round(Number(v) || 0));

export function mezclarCurriculo(
  extraido: CurriculoExtraido,
  df_ra: any[],
  df_ce: any[],
  df_ud: any[]
): { df_ra: any[]; df_ce: any[]; df_ud: any[]; resumen: ResumenImportacion } {
  let omitidos = 0;
  const idsRa = new Set(df_ra.map((r) => r.id_ra));
  const idsCe = new Set(df_ce.map((c) => c.id_ce));
  const idsUd = new Set(df_ud.map((u) => u.id_ud));

  const raNuevos: any[] = [];
  for (const r of extraido.resultados_aprendizaje || []) {
    const id = texto(r?.id_ra);
    if (!id || idsRa.has(id)) { omitidos++; continue; }
    idsRa.add(id);
    raNuevos.push({ id_ra: id, desc_ra: texto(r.desc_ra), peso_ra: entero(r.peso_ra), is_dual: false });
  }
  // Sin RA previos, los pesos son lo que dice el documento si suman 100; si no, a partes iguales
  if (df_ra.length === 0 && raNuevos.length > 0 && raNuevos.reduce((s, r) => s + r.peso_ra, 0) !== 100) {
    const reparto = repartoIgualitario(raNuevos.length);
    raNuevos.forEach((r, i) => { r.peso_ra = reparto[i]; });
  }
  const raNuevosIds = new Set(raNuevos.map((r) => r.id_ra));

  const ceNuevos: any[] = [];
  for (const c of extraido.criterios_evaluacion || []) {
    const id = texto(c?.id_ce);
    const idRa = texto(c?.id_ra);
    if (!id || idsCe.has(id) || !idsRa.has(idRa)) { omitidos++; continue; }
    idsCe.add(id);
    ceNuevos.push({ id_ce: id, id_ra: idRa, desc_ce: texto(c.desc_ce), peso_ce: 0, is_dual: false });
  }
  // Los CE de un RA nuevo reparten el 100 % a partes iguales; los que se suman a un RA que ya existía quedan sin peso para que lo ajustes tú
  for (const idRa of raNuevosIds) {
    const delRa = ceNuevos.filter((c) => c.id_ra === idRa);
    const reparto = repartoIgualitario(delRa.length);
    delRa.forEach((c, i) => { c.peso_ce = reparto[i]; });
  }

  const udNuevas: any[] = [];
  for (const u of extraido.unidades_didacticas || []) {
    const id = texto(u?.id_ud);
    if (!id || idsUd.has(id)) { omitidos++; continue; }
    idsUd.add(id);
    udNuevas.push({ id_ud: id, desc_ud: texto(u.desc_ud), horas_ud: entero(u.horas_ud) });
  }

  return {
    df_ra: [...df_ra, ...raNuevos],
    df_ce: [...df_ce, ...ceNuevos],
    df_ud: [...df_ud, ...udNuevas],
    resumen: { ra: raNuevos.length, ce: ceNuevos.length, ud: udNuevas.length, omitidos },
  };
}
