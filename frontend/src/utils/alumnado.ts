import { Alumnado, EstadoAlumno } from "@/types";

// Un alumno sin Estado explícito cuenta como "Alta" (valor por defecto en las
// altas de alumnado/page.tsx). Solo "Alta" participa en las vistas activas:
// asistencia, evaluación, boletines, plano de aula y previsiones. Los demás
// estados se conservan en el fichero para no romper el histórico.
export function isAlumnoActivo(al: Pick<Alumnado, "Estado">): boolean {
  return (al.Estado ?? "Alta") === "Alta";
}

// Color semántico de cada estado, para selectores y badges.
export const ESTADO_ALUMNO_COLOR: Record<EstadoAlumno, string> = {
  "Alta": "text-success",
  "Baja": "text-danger",
  "Convalidado": "text-info",
  "No matriculado": "text-muted",
};
