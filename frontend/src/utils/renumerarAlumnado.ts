// Orden alfabético del alumnado y renumeración de sus ID (AN01, AN02, ...).
//
// El número de ANxx no es un identificador de base de datos: es solo el
// ordinal del alumno/a en la lista alfabética (primer apellido, luego
// nombre). Cada vez que entra alguien nuevo se recoloca en su sitio y los
// ID de todos los demás se desplazan -- por eso la renumeración reescribe de
// una vez TODAS las referencias a esos ID dentro del curso (.fpc). Si se
// añade una colección nueva indexada por alumno, hay que añadirla aquí.
//
// Sin imports a propósito: el mismo fichero lo ejecuta tal cual Node
// (scripts/renumerar-demo.mjs) para dejar ordenados los .fpc de demo.

const COLLATOR = new Intl.Collator("es", { sensitivity: "base" });

// Campos que guardan el ID de un alumno/a en las filas de cada colección.
const CAMPOS_ID = ["ID", "id_alumno", "alumno_id", "student_id"];

export function idAlumnado(posicion: number): string {
  return `AN${String(posicion + 1).padStart(2, "0")}`;
}

function remapFilas(filas: any, mapa: Map<string, string>): any {
  if (!Array.isArray(filas)) return filas;
  return filas.map((fila) => {
    if (!fila || typeof fila !== "object") return fila;
    let nueva = fila;
    for (const campo of CAMPOS_ID) {
      const viejo = fila[campo];
      if (typeof viejo === "string" && mapa.has(viejo)) {
        const nuevoId = mapa.get(viejo)!;
        if (nueva === fila) nueva = { ...fila };
        nueva[campo] = nuevoId;
        // id_calificacion = `${id_alumno}-${instrumento}-${indicador}`
        if (campo === "id_alumno" && typeof fila.id_calificacion === "string" && fila.id_calificacion.startsWith(`${viejo}-`)) {
          nueva.id_calificacion = `${nuevoId}${fila.id_calificacion.slice(viejo.length)}`;
        }
      }
    }
    return nueva;
  });
}

function remapClaves(obj: any, mapa: Map<string, string>): any {
  if (!obj || typeof obj !== "object") return obj;
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) out[mapa.get(k) ?? k] = v;
  return out;
}

/**
 * Devuelve el curso con df_al ordenado alfabéticamente (apellidos, nombre;
 * las filas todavía vacías, al final) y los ID renumerados AN01..ANnn, con
 * todas las referencias reescritas. Si el orden y los ID ya son los
 * correctos, devuelve el mismo objeto.
 */
export function ordenarYRenumerarAlumnado<T extends Record<string, any>>(curso: T): T {
  const df_al: any[] = Array.isArray(curso?.df_al) ? curso.df_al : [];
  if (df_al.length === 0) return curso;

  const vacio = (a: any) => !String(a.Apellidos || "").trim() && !String(a.Nombre || "").trim();
  const ordenado = [...df_al].sort((a, b) => {
    if (vacio(a) !== vacio(b)) return vacio(a) ? 1 : -1;
    return COLLATOR.compare(String(a.Apellidos || ""), String(b.Apellidos || "")) ||
      COLLATOR.compare(String(a.Nombre || ""), String(b.Nombre || ""));
  });

  // viejo -> nuevo. Si hubiera ID repetidos (borrados antiguos), gana la
  // primera aparición y las referencias de los duplicados se unen a ella.
  const mapa = new Map<string, string>();
  const nuevosIds: string[] = [];
  ordenado.forEach((al, i) => {
    const nuevo = idAlumnado(i);
    nuevosIds.push(nuevo);
    if (typeof al.ID === "string" && al.ID && !mapa.has(al.ID)) mapa.set(al.ID, nuevo);
  });

  const mismoOrden = ordenado.every((al, i) => al === df_al[i]);
  const mismosIds = ordenado.every((al, i) => al.ID === nuevosIds[i]);
  if (mismoOrden && mismosIds) return curso;

  const next: Record<string, any> = { ...curso };
  next.df_al = ordenado.map((al, i) => ({ ...al, ID: nuevosIds[i] }));
  for (const clave of ["df_eval", "df_feoe", "df_calificaciones", "historial_calificaciones", "df_reclamaciones"]) {
    if (clave in next) next[clave] = remapFilas(next[clave], mapa);
  }
  if (next.attendance_ledger) {
    next.attendance_ledger = Object.fromEntries(
      Object.entries(next.attendance_ledger).map(([fecha, dia]) => [fecha, remapClaves(dia, mapa)])
    );
  }
  if (next.profesional_ledger) next.profesional_ledger = remapClaves(next.profesional_ledger, mapa);
  if (next.plano_clase?.seats) {
    next.plano_clase = {
      ...next.plano_clase,
      seats: Object.fromEntries(
        Object.entries(next.plano_clase.seats).map(([pos, id]) => [pos, typeof id === "string" ? (mapa.get(id) ?? id) : id])
      ),
    };
  }
  return next as T;
}

/** ID provisional y único (el siguiente al mayor ANxx existente) para un alumno/a recién añadido; la renumeración le da su ID definitivo. */
export function idProvisional(df_al: any[]): string {
  const max = df_al.reduce((m, a) => {
    const n = /^AN(\d+)$/.exec(String(a?.ID || ""));
    return n ? Math.max(m, Number(n[1])) : m;
  }, 0);
  return `AN${String(max + 1).padStart(2, "0")}`;
}

/** Quita a un alumno/a y todo lo que cuelga de su ID, para que ninguna referencia huérfana choque luego con un ID reasignado. */
export function eliminarAlumnado<T extends Record<string, any>>(curso: T, id: string): T {
  const next: Record<string, any> = { ...curso };
  next.df_al = (curso.df_al || []).filter((a: any) => a.ID !== id);
  for (const clave of ["df_eval", "df_feoe", "df_calificaciones", "historial_calificaciones", "df_reclamaciones"]) {
    if (Array.isArray(next[clave])) next[clave] = next[clave].filter((f: any) => !CAMPOS_ID.some((c) => f?.[c] === id));
  }
  if (next.attendance_ledger) {
    next.attendance_ledger = Object.fromEntries(
      Object.entries(next.attendance_ledger).map(([fecha, dia]: [string, any]) => {
        const { [id]: _quitado, ...resto } = dia || {};
        return [fecha, resto];
      })
    );
  }
  if (next.profesional_ledger) {
    const { [id]: _quitado, ...resto } = next.profesional_ledger;
    next.profesional_ledger = resto;
  }
  if (next.plano_clase?.seats) {
    next.plano_clase = {
      ...next.plano_clase,
      seats: Object.fromEntries(Object.entries(next.plano_clase.seats).filter(([, v]) => v !== id)),
    };
  }
  return next as T;
}
