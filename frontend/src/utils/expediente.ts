// Expediente del alumnado — línea temporal de evidencias (backlog, análisis
// Aularis 2026-08-23). Agrega SOLO datos que ya existen repartidos por la
// app, sin dato nuevo: calificaciones, autoevaluación, tutoría,
// reclamaciones, asistencia y diario de clase.
//
// Fuentes deliberadamente fuera: `historial_calificaciones` (redundante con
// `df_calificaciones.timestamp`, ya poblado por todos los puntos de guardado
// desde el 2026-09-11 -- surgirían dos eventos por el mismo cambio de nota);
// "rúbrica aplicada" como evento propio (no queda ninguna marca de qué nota
// vino de una rúbrica ni cuándo, se funde en la nota normal -- decisión de
// Rafael, dejarlo fuera de esta ronda).

export type TipoEvento =
  | "calificacion"
  | "autoevaluacion"
  | "tutoria"
  | "reclamacion"
  | "asistencia"
  | "diario";

export interface EventoExpediente {
  id: string;
  fecha: Date;
  sinFecha?: boolean; // true = no se pudo ubicar en el tiempo (ver notas de calificación)
  tipo: TipoEvento;
  titulo: string;
  detalle?: string;
}

const parseFechaFlexible = (raw: string | undefined | null): Date | null => {
  if (!raw) return null;
  // yyyy-mm-dd (tutoría, autoevaluación ISO, reclamaciones) o ISO completo.
  const iso = new Date(raw);
  if (!isNaN(iso.getTime())) return iso;
  // dd/mm/yyyy (daily_ledger, asistencia con formato libre en algunos casos).
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    if (!isNaN(d.getTime())) return d;
  }
  return null;
};

export function buildExpediente(
  al_id: string,
  cursoData: any,
  moduleData: any,
  attendanceRecords: { student_id: string; date_str: string; status: string }[]
): { eventos: EventoExpediente[]; sinFecha: EventoExpediente[] } {
  const eventos: EventoExpediente[] = [];
  const sinFecha: EventoExpediente[] = [];

  const df_indicadores = moduleData?.df_indicadores || [];
  const df_instr = moduleData?.df_instr || [];
  const df_ce = moduleData?.df_ce || [];
  const ceById: Record<string, any> = {};
  df_ce.forEach((ce: any) => { if (ce.id_ce) ceById[ce.id_ce] = ce; });
  const indicadorById: Record<string, any> = {};
  df_indicadores.forEach((ind: any) => { if (ind.id_indicador) indicadorById[ind.id_indicador] = ind; });
  const instrById: Record<string, any> = {};
  df_instr.forEach((i: any) => { if (i.id_instrumento) instrById[i.id_instrumento] = i; });

  // 1. Calificaciones (Motor JEG). Un instrumento normalmente reparte la
  // misma nota entre varios Indicadores (uno por CE vinculado, "modo
  // automático") -- sin agrupar, una sola nota de examen generaría una
  // entrada por cada CE. Se agrupa por (instrumento, fecha) y, si el valor
  // coincide en todo el grupo (caso normal), se muestra una vez con la
  // lista de CE; si difiere (nota corregida a mano por indicador), se listan
  // los valores por CE.
  const df_calificaciones = cursoData?.df_calificaciones || [];
  const gruposCalificacion = new Map<string, any[]>();
  df_calificaciones
    .filter((c: any) => c.id_alumno === al_id && c.valor !== null && c.valor !== undefined)
    .forEach((c: any) => {
      const tieneFecha = typeof c.timestamp === "number" && c.timestamp > 0;
      const clave = `${c.id_instrumento}|${tieneFecha ? c.timestamp : "sin_fecha"}`;
      if (!gruposCalificacion.has(clave)) gruposCalificacion.set(clave, []);
      gruposCalificacion.get(clave)!.push(c);
    });

  gruposCalificacion.forEach((grupo) => {
    const primero = grupo[0];
    const instr = instrById[primero.id_instrumento];
    const tituloInstr = instr?.titulo || primero.id_instrumento;
    const tieneFecha = typeof primero.timestamp === "number" && primero.timestamp > 0;

    const cesConValor = grupo.map((c: any) => {
      const ind = indicadorById[c.id_indicador];
      const ce = ind ? ceById[ind.id_ce] : null;
      const idCe = ce?.id_ce || ind?.id_ce || c.id_indicador;
      const valorTxt = typeof c.valor === "number" ? c.valor.toFixed(1) : String(c.valor);
      return { idCe, valorTxt };
    });
    const mismoValor = cesConValor.every((x) => x.valorTxt === cesConValor[0].valorTxt);
    const valorTitulo = mismoValor ? cesConValor[0].valorTxt : "varios valores";
    const detalle = mismoValor
      ? `${cesConValor.length} CE: ${cesConValor.map((x) => x.idCe).join(", ")}`
      : cesConValor.map((x) => `${x.idCe}: ${x.valorTxt}`).join(" · ");

    const evento: EventoExpediente = {
      id: `cal-${primero.id_instrumento}-${tieneFecha ? primero.timestamp : "sf"}`,
      fecha: tieneFecha ? new Date(primero.timestamp) : new Date(0),
      tipo: "calificacion",
      titulo: `Nota en "${tituloInstr}": ${valorTitulo}`,
      detalle,
    };
    if (tieneFecha) {
      eventos.push(evento);
    } else {
      sinFecha.push({ ...evento, sinFecha: true });
    }
  });

  // 2. Autoevaluación.
  const df_autoevaluacion = cursoData?.df_autoevaluacion || [];
  df_autoevaluacion
    .filter((a: any) => a.alumno_id === al_id)
    .forEach((a: any) => {
      const fecha = parseFechaFlexible(a.fecha);
      if (!fecha) return;
      eventos.push({
        id: `auto-${a.id}`,
        fecha,
        tipo: "autoevaluacion",
        titulo: `Autoevaluación ${a.ce_id}: ${a.valor}`,
        detalle: a.dificultades || undefined,
      });
    });

  // 3. Tutoría.
  const tutorias = cursoData?.tutoria_ledger?.[al_id] || [];
  tutorias.forEach((t: any) => {
    const fecha = parseFechaFlexible(t.fecha);
    if (!fecha) return;
    eventos.push({
      id: `tut-${t.id}`,
      fecha,
      tipo: "tutoria",
      titulo: `Tutoría (${t.ambito || "—"})`,
      detalle: t.tema || t.acuerdos || undefined,
    });
  });

  // 4. Reclamaciones -- hasta 2 eventos por reclamación (presentada + resuelta).
  const df_reclamaciones = cursoData?.df_reclamaciones || [];
  df_reclamaciones
    .filter((r: any) => r.alumno_id === al_id)
    .forEach((r: any) => {
      const fechaPresentada = parseFechaFlexible(r.fecha_reclamacion);
      if (fechaPresentada) {
        eventos.push({
          id: `recl-${r.id}-presentada`,
          fecha: fechaPresentada,
          tipo: "reclamacion",
          titulo: `Reclamación presentada (${r.referencia})`,
          detalle: r.motivo,
        });
      }
      if (r.estado === "resuelta") {
        const fechaResolucion = parseFechaFlexible(r.fecha_resolucion);
        if (fechaResolucion) {
          eventos.push({
            id: `recl-${r.id}-resuelta`,
            fecha: fechaResolucion,
            tipo: "reclamacion",
            titulo: `Reclamación resuelta (${r.referencia})`,
            detalle: r.resolucion,
          });
        }
      }
    });

  // 5. Asistencia -- solo faltas/retrasos, "presente" es el caso normal y
  // aportaría más ruido que información en una línea temporal de evidencias.
  const faltasPorFecha = new Set<string>();
  attendanceRecords
    .filter((rec) => rec.student_id === al_id)
    .forEach((rec) => {
      const fecha = parseFechaFlexible(rec.date_str);
      if (!fecha) return;
      if (rec.status === "falta") faltasPorFecha.add(rec.date_str);
      if (rec.status === "falta" || rec.status === "retraso") {
        eventos.push({
          id: `asist-${al_id}-${rec.date_str}`,
          fecha,
          tipo: "asistencia",
          titulo: rec.status === "falta" ? "Falta de asistencia" : "Retraso",
        });
      }
    });

  // 6. Diario de clase -- es por grupo-clase, no por alumno; se muestra en el
  // expediente de un alumno solo si ese día no consta como falta suya (si
  // faltó, lo que se hizo en clase no es evidencia de SU evolución).
  const daily_ledger = cursoData?.daily_ledger || {};
  Object.entries(daily_ledger).forEach(([dateStr, entry]: [string, any]) => {
    if (!entry || entry.sin_docencia || !entry.seguimiento) return;
    if (faltasPorFecha.has(dateStr)) return;
    const fecha = parseFechaFlexible(dateStr);
    if (!fecha) return;
    eventos.push({
      id: `diario-${dateStr}`,
      fecha,
      tipo: "diario",
      titulo: "Sesión de clase",
      detalle: entry.seguimiento,
    });
  });

  eventos.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  return { eventos, sinFecha };
}
