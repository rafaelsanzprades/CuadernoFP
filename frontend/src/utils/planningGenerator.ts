import { ModuleData, CursoData } from '@/types';

// "Hoy" para el modo Datos DEMO: el 2 de mayo del año en que termina el curso
// de ejemplo, no la fecha real del sistema — así la demo siempre se ve a
// mitad de curso, con trimestres ya impartidos y trimestres aún por delante,
// en vez de mostrar un curso completo (si "hoy" cae después de fin de curso)
// o sin empezar (si cae antes de que arranque). Usado tanto para generar el
// planning_ledger (más abajo) como para el auto-scroll del diario de clases
// en /seguimiento?tab=clases (ver seguimiento/page.tsx).
export function getSimulatedToday(cursoData: CursoData): Date {
  const info_fechas = (cursoData as any)?.info_fechas || {};
  let simulatedToday = new Date();
  if (info_fechas.fin_curso) {
    const finDate = parseDateDDMMYYYY(info_fechas.fin_curso);
    if (finDate) {
      simulatedToday = new Date(finDate.getFullYear(), 4, 2); // Month 4 is May (0-indexed)
    }
  }
  return simulatedToday;
}

function parseDateDDMMYYYY(s: string): Date | null {
  if (!s) return null;
  if (String(s).includes("-")) {
    const parts = String(s).split("-").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
  } else {
    const parts = String(s).split("/").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
}

export function generatePlanning(moduleData: ModuleData, cursoData: CursoData) {
  const info_fechas = cursoData.info_fechas || {};
  const horario = cursoData.horario || {};
  const calendar_notes = cursoData.calendar_notes || {};
  const df_ud = moduleData.df_ud || [];
  const docencia_dual = info_fechas.docencia_dual || 'sin_docencia';

  const parseDate = parseDateDDMMYYYY;

  const termRanges = [
    { ini: parseDate(info_fechas.inicio || info_fechas.ini_1t), fin: parseDate(info_fechas.evaluacion_1 || info_fechas.fin_1t) },
    { ini: parseDate(info_fechas.evaluacion_1 || info_fechas.ini_2t), fin: parseDate(info_fechas.evaluacion_2 || info_fechas.fin_2t) },
    { ini: parseDate(info_fechas.evaluacion_2 || info_fechas.ini_3t), fin: parseDate(info_fechas.fin || info_fechas.evaluacion_final || info_fechas.fin_3t) }
  ];

  const feoS = parseDate(info_fechas.ini_feoe);
  const feoE = parseDate(info_fechas.fin_feoe);

  const inRange = (d: Date, start: Date | null, end: Date | null) => {
    if (!start || !end) return false;
    const dTime = d.getTime();
    return dTime >= start.getTime() && dTime <= end.getTime();
  };

  // 1. Gather all calendar dates in sorted order across the terms
  const datesList: Date[] = [];
  termRanges.forEach(({ ini, fin }) => {
    if (!ini || !fin) return;
    let curr = new Date(ini);
    while (curr <= fin) {
      if (curr.getDay() >= 1 && curr.getDay() <= 5) {
        // Only push if it's not already in the list (avoid overlaps if terms overlap)
        if (!datesList.some(d => d.getTime() === curr.getTime())) {
          datesList.push(new Date(curr));
        }
      }
      curr.setDate(curr.getDate() + 1);
    }
  });

  // Sort dates just in case
  datesList.sort((a, b) => a.getTime() - b.getTime());

  const pad = (n: number) => String(n).padStart(2, "0");
  const monthKeys = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  const simulatedToday = getSimulatedToday(cursoData);

  // Prepare a queue of UDs with remaining hours
  let totalUdHours = 0;
  const udQueue = df_ud.map((ud: any) => {
    const h = Number(ud.duracion || ud.horas_ud || 0);
    totalUdHours += h;
    return {
      id_ud: ud.id_ud,
      horas: h,
      h_rem: h
    };
  });

  const newPlanningLedger: Record<string, string[]> = {};
  
  // Track predicted and imparted hours per month per UD: { id_ud: { Sep_Prv: 0, Sep_Imp: 0, ... } }
  const prvTracker: Record<string, Record<string, number>> = {};
  udQueue.forEach(ud => {
    prvTracker[ud.id_ud] = {};
  });
  // Tracker for FEOE
  prvTracker["FEOE"] = {};

  let currentUdIndex = 0;
  let totalScheduledHours = 0;
  // Primera fecha en la que se han asignado horas a cada UD — las UD se
  // asignan al trimestre en el que EMPIEZAN, no en el que terminan (una UD
  // que arranca a final de trimestre y se alarga unos días al siguiente
  // sigue perteneciendo al primero).
  const udFirstDate: Record<string, Date> = {};

  datesList.forEach((d) => {
    const rawDay = d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const dayIndex = rawDay - 1; // 0 = Lun, ..., 4 = Vie
    const lookupDateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const isFestivo = !!calendar_notes[`f_${lookupDateStr}`];

    const dayKeyMap = ["lunes", "martes", "miercoles", "jueves", "viernes", "Lun", "Mar", "Mié", "Jue", "Vie"];
    let horarioStr = horario[dayKeyMap[dayIndex]] || horario[dayKeyMap[dayIndex+5]] || "";
    
    let hours = 0;
    if (horarioStr) {
      if (!isNaN(Number(horarioStr))) {
        hours = Number(horarioStr);
      } else {
        const [start, end] = horarioStr.split("-");
        if (start && end) {
          const startParts = start.split(":");
          const endParts = end.split(":");
          if (startParts.length === 2 && endParts.length === 2) {
            const startH = Number(startParts[0]) + Number(startParts[1]) / 60;
            const endH = Number(endParts[0]) + Number(endParts[1]) / 60;
            hours = Math.max(0, Math.round(endH - startH));
          }
        }
      }
    }

    if (isFestivo) return;

    const isPastOrToday = d.getTime() <= simulatedToday.getTime();

    // La FEOE ocupa todos los días lectivos de lunes a viernes de su rango,
    // independientemente del horario semanal habitual del módulo (que solo
    // define los días/horas de clase normal) — por eso se comprueba antes
    // del "hours <= 0 return" de más abajo, no después.
    const isFeoe = inRange(d, feoS, feoE);
    if (isFeoe && docencia_dual === 'sin_docencia') {
      newPlanningLedger[lookupDateStr] = ["FEOE"];
      if (hours > 0) {
        const monthPrefix = monthKeys[d.getMonth()];
        const prvKey = `${monthPrefix}_Prv`;
        const impKey = `${monthPrefix}_Imp`;
        prvTracker["FEOE"][prvKey] = (prvTracker["FEOE"][prvKey] || 0) + hours;
        if (isPastOrToday) {
          prvTracker["FEOE"][impKey] = (prvTracker["FEOE"][impKey] || 0) + hours;
        }
      }
      return; // Skip consuming UD hours
    }

    if (hours <= 0) return;

    // Allocate available hours to UDs
    let hoursLeft = hours;
    const assignedUds: string[] = [];

    while (hoursLeft > 0 && currentUdIndex < udQueue.length) {
      const currentUd = udQueue[currentUdIndex];
      const monthPrefix = monthKeys[d.getMonth()];
      const prvKey = `${monthPrefix}_Prv`;
      const impKey = `${monthPrefix}_Imp`;

      if (!assignedUds.includes(currentUd.id_ud)) {
        assignedUds.push(currentUd.id_ud);
      }

      const assignedNow = Math.min(hoursLeft, currentUd.h_rem);

      currentUd.h_rem -= assignedNow;
      if (assignedNow > 0 && udFirstDate[currentUd.id_ud] === undefined) {
        udFirstDate[currentUd.id_ud] = d;
      }
      prvTracker[currentUd.id_ud][prvKey] = (prvTracker[currentUd.id_ud][prvKey] || 0) + assignedNow;
      if (isPastOrToday) {
        prvTracker[currentUd.id_ud][impKey] = (prvTracker[currentUd.id_ud][impKey] || 0) + assignedNow;
      }
      
      totalScheduledHours += assignedNow;
      hoursLeft -= assignedNow;

      if (currentUd.h_rem <= 0) {
        currentUdIndex++; // Fully consumed, move to next UD
      }
    }

    if (assignedUds.length > 0) {
      newPlanningLedger[lookupDateStr] = assignedUds;
    }
  });

  // Evaluación (1/2/3) en la que cae una fecha, según los rangos de trimestre.
  const getEvaluacion = (d: Date | null | undefined): number | null => {
    if (!d) return null;
    let closestTerm = 1;
    let minDiff = Infinity;
    for (let i = 0; i < termRanges.length; i++) {
      if (inRange(d, termRanges[i].ini, termRanges[i].fin)) return i + 1;
      
      // Fallback: si cae en un hueco (ej. vacaciones de navidad), buscar el más cercano
      if (termRanges[i].ini) {
        const diffIni = Math.abs(d.getTime() - termRanges[i].ini!.getTime());
        if (diffIni < minDiff) { minDiff = diffIni; closestTerm = i + 1; }
      }
      if (termRanges[i].fin) {
        const diffFin = Math.abs(d.getTime() - termRanges[i].fin!.getTime());
        if (diffFin < minDiff) { minDiff = diffFin; closestTerm = i + 1; }
      }
    }
    return closestTerm;
  };

  // 4. Build new df_sgmt
  const newDfSgmt: any[] = [];
  const months = ["Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun"];

  // Add UDs
  df_ud.forEach((ud: any) => {
    const id = ud.id_ud;
    const newRow: any = {
      id_ud: id,
      horas_ud: ud.duracion || ud.horas_ud || 0,
      ev: getEvaluacion(udFirstDate[id])
    };

    months.forEach(m => {
      newRow[`${m}_Prv`] = prvTracker[id]?.[`${m}_Prv`] || 0;
      newRow[`${m}_Imp`] = prvTracker[id]?.[`${m}_Imp`] || 0;
    });

    newDfSgmt.push(newRow);
  });

  // Una UD sin ninguna fecha asignada (el calendario se acaba antes de que
  // le toque turno en la cola) no tiene ev propio — hereda el de la UD
  // anterior, así que la última UD del módulo cae en el mismo trimestre
  // que la última UD que sí llegó a impartirse, en vez de quedar en blanco.
  let lastKnownEv = 1;
  newDfSgmt.forEach(row => {
    if (row.ev == null) row.ev = lastKnownEv;
    else lastKnownEv = row.ev;
  });

  // Add FEOE row if it has any hours — insertada por orden cronológico real
  // (no siempre al final, y es distinto en cada programación según sus
  // fechas): va justo DESPUÉS de la última UD que ya había empezado cuando
  // arrancó la FEOE, ya que es esa UD la que la FEOE interrumpe (aunque esa
  // UD siga impartiéndose más adelante, tras acabar la FEOE) — de ahí
  // comparar la PRIMERA fecha de cada UD (cuándo empieza) contra el inicio
  // de la FEOE, no la última.
  const hasFeoeHours = Object.keys(prvTracker["FEOE"]).length > 0;
  if (hasFeoeHours) {
    const feoeRow: any = {
      id_ud: "FEOE",
      ev: getEvaluacion(feoS),
    };
    let sumPrv = 0;
    months.forEach(m => {
      const prv = prvTracker["FEOE"]?.[`${m}_Prv`] || 0;
      const imp = prvTracker["FEOE"]?.[`${m}_Imp`] || 0;
      feoeRow[`${m}_Prv`] = prv;
      feoeRow[`${m}_Imp`] = imp;
      sumPrv += prv;
    });
    feoeRow.horas_ud = sumPrv || "-";

    let insertAt = newDfSgmt.length;
    if (feoS) {
      const idx = newDfSgmt.findIndex(row => {
        const first = udFirstDate[row.id_ud];
        return !first || first.getTime() > feoS.getTime();
      });
      if (idx !== -1) insertAt = idx;
    }
    newDfSgmt.splice(insertAt, 0, feoeRow);
  }

  return { newPlanningLedger, newDfSgmt, totalUdHours, totalScheduledHours };
}

/** planning_ledger se calcula con claves ISO (yyyy-mm-dd), pero calendar_notes,
 * el resto de UI de /calendario y los generadores de PDF del backend usan
 * dd/mm/yyyy — convierte para esos consumidores en vez de duplicar la lógica. */
export function ledgerToDmy(ledger: Record<string, string[]>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [iso, uds] of Object.entries(ledger)) {
    const [y, m, d] = iso.split('-');
    if (y && m && d) out[`${d}/${m}/${y}`] = uds;
  }
  return out;
}
