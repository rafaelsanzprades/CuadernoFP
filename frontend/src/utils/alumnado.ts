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

export interface ParsedAlumnadoCSV {
  alumnos: any[];
  importedCount: number;
  error?: string;
}

// Parseo de CSV de alumnado (Nombre/Apellidos/correo), compartido entre la
// importación manual de alumnado/page.tsx y el asistente "Nuevo curso a
// partir de esta programación" (ítem 32) — antes vivía solo inline en
// alumnado/page.tsx, duplicarlo para el asistente habría sido el mismo error
// que ya causó el bug de defaultInstrumentosPct.ts.
export function parseAlumnadoCSV(text: string, existingAl: any[] = []): ParsedAlumnadoCSV {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) {
    return { alumnos: existingAl, importedCount: 0, error: "El archivo CSV no tiene datos válidos." };
  }

  const headerLine = lines[0];
  const separator = headerLine.includes(';') ? ';' : ',';

  const headers = headerLine.split(separator).map(h => h.trim().toLowerCase().replace(/"/g, ''));
  const nameIdx = headers.findIndex(h => h.includes('nombre'));
  const surnameIdx = headers.findIndex(h => h.includes('apellido'));
  const emailIdx = headers.findIndex(h => h.includes('correo') || h.includes('email'));

  if (nameIdx === -1 && surnameIdx === -1) {
    return { alumnos: existingAl, importedCount: 0, error: "No se han detectado columnas de Nombre/Apellidos en el CSV." };
  }

  const newAl = [...existingAl];
  let importedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(separator).map(c => c.trim().replace(/"/g, ''));
    if (cols.length <= Math.max(nameIdx, surnameIdx)) continue;

    let name = nameIdx !== -1 ? cols[nameIdx] : "";
    let surname = surnameIdx !== -1 ? cols[surnameIdx] : "";
    const email = emailIdx !== -1 && emailIdx < cols.length ? cols[emailIdx] : "";

    if (surnameIdx === -1 && name.includes(',')) {
      const parts = name.split(',');
      surname = parts[0].trim();
      name = parts.slice(1).join(',').trim();
    }

    if (!name && !surname) continue;

    const newId = `AN${(newAl.length + 1).toString().padStart(2, '0')}`;
    newAl.push({
      ID: newId,
      Estado: "Alta",
      Apellidos: surname,
      Nombre: name,
      Edad: null,
      Nacimiento: "",
      Repite: false,
      Matricula: "",
      Comentarios: "",
      email: email,
      Movil: ""
    });
    importedCount++;
  }

  return { alumnos: newAl, importedCount };
}
