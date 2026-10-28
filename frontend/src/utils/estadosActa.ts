// Estado de la calificación de un alumno/a en el acta del módulo (campo `Estado_Acta` de su fila de df_eval). Sin estado = calificado
// (la nota numérica de Nota_Final_FO manda). Con estado, el acta, el boletín grupal y MagIA muestran la sigla en vez de la nota, y el
// análisis de riesgo no lo cuenta como suspenso. Las siglas y su significado siguen el RD 659/2023 y las órdenes autonómicas estudiadas.
// Mismas siglas en backend/pdf_boletin_grupal.py (ESTADOS_ACTA).

export const ESTADOS_ACTA = ["NE", "NP", "EX", "CV", "FEP"] as const;
export type EstadoActa = (typeof ESTADOS_ACTA)[number];

export const SIGLA_ESTADO_ACTA: Record<EstadoActa, string> = { NE: "NE", NP: "NP", EX: "EX", CV: "CV", FEP: "FE pend." };

export const NOMBRE_ESTADO_ACTA: Record<EstadoActa, string> = {
  NE: "No evaluado",
  NP: "No presentado",
  EX: "Exento",
  CV: "Convalidado",
  FEP: "Formación en empresa pendiente",
};

/** Estado de acta de una fila de df_eval, o null si está calificado (o el valor no es uno de los conocidos). */
export function estadoActa(evRow: any): EstadoActa | null {
  const e = evRow?.Estado_Acta;
  return (ESTADOS_ACTA as readonly string[]).includes(e) ? (e as EstadoActa) : null;
}

/** Estados en los que el alumno/a no tiene que aprobar el módulo (exento o convalidado): no cuentan como riesgo. */
export const estadoSinRiesgo = (e: EstadoActa | null) => e === "EX" || e === "CV";
