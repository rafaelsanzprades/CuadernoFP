// Estado de la calificación de un alumno/a en el acta del módulo (campo `Estado_Acta` de su fila de df_eval). Sin estado = calificado
// (la nota numérica de Nota_Final_FO manda). Con estado, el acta, el boletín grupal y MagIA muestran la sigla en vez de la nota, y el
// análisis de riesgo no lo cuenta como suspenso. Las siglas y su significado siguen el RD 659/2023 y las órdenes autonómicas estudiadas.
// Mismas siglas en backend/pdf_boletin_grupal.py (ESTADOS_ACTA, SIGLAS_PERFIL).
// Las siglas que fija la norma de cada comunidad (perfil de comunidad) sustituyen a las genéricas: ninguna de las tres estudiadas tiene «NP»
// (el no presentado es «NE» en Aragón y Andalucía), y la formación en empresa pendiente es «PFEOE» en Andalucía y «PFE» en Asturias.

export const ESTADOS_ACTA = ["NE", "NP", "EX", "CV", "RC", "FEP"] as const;
export type EstadoActa = (typeof ESTADOS_ACTA)[number];

export const SIGLA_ESTADO_ACTA: Record<EstadoActa, string> = { NE: "NE", NP: "NP", EX: "EX", CV: "CV", RC: "RC", FEP: "FE pend." };

/** Siglas propias de cada perfil de comunidad (las que no se indican usan SIGLA_ESTADO_ACTA). Fuentes: Aragón, Decreto 91/2024 art. 42.7-8;
 *  Andalucía, Orden de evaluación art. 19.8; Asturias, circular de inicio de curso 2026-27, apartado 2.20.4. */
export const SIGLAS_PERFIL: Record<string, Partial<Record<EstadoActa, string>>> = {
  aragon: { NP: "NE" },
  andalucia: { NP: "NE", FEP: "PFEOE" },
  asturias: { FEP: "PFE" },
};

export const siglaEstado = (e: EstadoActa, perfil?: string | null): string => SIGLAS_PERFIL[perfil || ""]?.[e] ?? SIGLA_ESTADO_ACTA[e];

/** Estados que se ofrecen en el selector: con un perfil que da la misma sigla a «No presentado» y «No evaluado» se omite el duplicado. */
export const estadosDisponibles = (perfil?: string | null): EstadoActa[] =>
  ESTADOS_ACTA.filter((e) => !(e === "NP" && siglaEstado("NP", perfil) === siglaEstado("NE", perfil)));

export const NOMBRE_ESTADO_ACTA: Record<EstadoActa, string> = {
  NE: "No evaluado",
  NP: "No presentado",
  EX: "Exento",
  CV: "Convalidado",
  RC: "Renuncia a la convocatoria",
  FEP: "Formación en empresa pendiente",
};

/** Estado de acta de una fila de df_eval, o null si está calificado (o el valor no es uno de los conocidos). */
export function estadoActa(evRow: any): EstadoActa | null {
  const e = evRow?.Estado_Acta;
  return (ESTADOS_ACTA as readonly string[]).includes(e) ? (e as EstadoActa) : null;
}

export const MAX_CONVOCATORIAS_DEFECTO = 4;

/** Máximo de convocatorias por módulo: el que se haya escrito a mano o, si no, el del grado de la oferta (RD 659/2023, art. 18.13): 4 en el
 *  Grado D y 2 en el Grado E. */
export const maxConvocatorias = (config?: { max_convocatorias?: number | null; grado_oferta?: string } | null): number =>
  config?.max_convocatorias || (config?.grado_oferta === "E" ? 2 : MAX_CONVOCATORIAS_DEFECTO);

/** Convocatorias que lleva consumidas el alumno/a en este módulo: las de cursos anteriores (`Convocatorias_Previas`, a mano) más las de
 *  este curso (la ordinaria y, si tiene nota de extraordinaria, la segunda). Exento, convalidado y renuncia no consumen ninguna (Aragón art. 22.3,
 *  Andalucía art. 19.7); en Andalucía tampoco la formación en empresa pendiente (art. 19.7.g). El «no evaluado» sí consume. */
export function convocatoriasUsadas(evRow: any, perfil?: string | null): number {
  const e = estadoActa(evRow);
  if (e === "EX" || e === "CV" || e === "RC") return 0;
  if (e === "FEP" && perfil === "andalucia") return 0;
  const previas = Math.max(0, Math.floor(Number(evRow?.Convocatorias_Previas) || 0));
  return previas + 1 + (Number(evRow?.Nota_Final_FE) > 0 ? 1 : 0);
}

/** Estados en los que el alumno/a no tiene que aprobar el módulo (exento o convalidado): no cuentan como riesgo. */
export const estadoSinRiesgo = (e: EstadoActa | null) => e === "EX" || e === "CV" || e === "RC";
