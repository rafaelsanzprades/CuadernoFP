import { ModuleData, CursoData } from '@/types';

export function generatePlanning(moduleData: ModuleData, cursoData: CursoData) {
  const info_fechas = cursoData.info_fechas || {};
  const horario = cursoData.horario || {};
  const calendar_notes = cursoData.calendar_notes || {};
  const df_ud = moduleData.df_ud || [];
  const docencia_dual = info_fechas.docencia_dual || 'sin_docencia';

  const parseDate = (s: string) => {
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
  };

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
  
  // Track predicted hours per month per UD: { id_ud: { Sep_Prv: 0, ... } }
  const prvTracker: Record<string, Record<string, number>> = {};
  udQueue.forEach(ud => {
    prvTracker[ud.id_ud] = {};
  });
  // Tracker for FEOE
  prvTracker["FEOE"] = {};

  let currentUdIndex = 0;
  let totalScheduledHours = 0;

  datesList.forEach((d) => {
    const rawDay = d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const dayIndex = rawDay - 1; // 0 = Lun, ..., 4 = Vie
    const lookupDateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const isFestivo = !!calendar_notes[`f_${lookupDateStr}`];

    const dayKeyMap = ["lunes", "martes", "miercoles", "jueves", "viernes", "Lun", "Mar", "Mié", "Jue", "Vie"];
    // Note: scheduleSimulator uses dayKeyMap[dayIndex] or dayKeyMap[dayIndex+5]
    let horarioStr = horario[dayKeyMap[dayIndex]] || horario[dayKeyMap[dayIndex+5]] || "";
    
    // In demo files, 'horario' uses "Lun", "Mar", "Mié", "Jue", "Vie" mapping directly to numbers, e.g. "Lun": "2"
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

    if (isFestivo || hours <= 0) return;

    // Check FEOE logic
    const isFeoe = inRange(d, feoS, feoE);
    if (isFeoe && docencia_dual === 'sin_docencia') {
      newPlanningLedger[lookupDateStr] = ["FEOE"];
      const monthPrefix = monthKeys[d.getMonth()];
      const key = `${monthPrefix}_Prv`;
      prvTracker["FEOE"][key] = (prvTracker["FEOE"][key] || 0) + hours;
      return; // Skip consuming UD hours
    }

    // Allocate available hours to UDs
    let hoursLeft = hours;
    const assignedUds: string[] = [];

    while (hoursLeft > 0 && currentUdIndex < udQueue.length) {
      const currentUd = udQueue[currentUdIndex];
      const monthPrefix = monthKeys[d.getMonth()];
      const key = `${monthPrefix}_Prv`;

      if (!assignedUds.includes(currentUd.id_ud)) {
        assignedUds.push(currentUd.id_ud);
      }

      if (currentUd.h_rem > hoursLeft) {
        currentUd.h_rem -= hoursLeft;
        prvTracker[currentUd.id_ud][key] = (prvTracker[currentUd.id_ud][key] || 0) + hoursLeft;
        totalScheduledHours += hoursLeft;
        hoursLeft = 0;
      } else {
        hoursLeft -= currentUd.h_rem;
        prvTracker[currentUd.id_ud][key] = (prvTracker[currentUd.id_ud][key] || 0) + currentUd.h_rem;
        totalScheduledHours += currentUd.h_rem;
        currentUd.h_rem = 0;
        currentUdIndex++; // Fully consumed, move to next UD
      }
    }

    if (assignedUds.length > 0) {
      newPlanningLedger[lookupDateStr] = assignedUds;
    }
  });

  // 4. Build new df_sgmt
  // We want to preserve existing _Imp values.
  const oldDfSgmt = cursoData.df_sgmt || [];
  
  const newDfSgmt: any[] = [];

  // Add UDs
  df_ud.forEach((ud: any) => {
    const id = ud.id_ud;
    const oldRow = oldDfSgmt.find((r: any) => r.id_ud === id) || {};
    
    const newRow: any = {
      id_ud: id,
      horas_ud: ud.duracion || ud.horas_ud || 0,
      ...oldRow // Keep old data including _Imp
    };

    // Overwrite _Prv fields
    const months = ["Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun"];
    months.forEach(m => {
      newRow[`${m}_Prv`] = prvTracker[id]?.[`${m}_Prv`] || 0;
      if (newRow[`${m}_Imp`] === undefined) newRow[`${m}_Imp`] = 0;
    });

    newDfSgmt.push(newRow);
  });

  // Add FEOE row if it has any hours or if it existed before
  const hasFeoeHours = Object.keys(prvTracker["FEOE"]).length > 0;
  const oldFeoeRow = oldDfSgmt.find((r: any) => String(r.id_ud).includes("FEOE")) || null;
  
  if (hasFeoeHours || oldFeoeRow) {
    const feoeRow: any = {
      id_ud: "FEOE (Sin docencia)",
      horas_ud: "-", // or calculate sum of FEOE hours
      ...(oldFeoeRow || {})
    };
    const months = ["Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun"];
    let sumPrv = 0;
    months.forEach(m => {
      const prv = prvTracker["FEOE"]?.[`${m}_Prv`] || 0;
      feoeRow[`${m}_Prv`] = prv;
      if (feoeRow[`${m}_Imp`] === undefined) feoeRow[`${m}_Imp`] = 0;
      sumPrv += prv;
    });
    feoeRow.horas_ud = sumPrv || "-";
    newDfSgmt.push(feoeRow);
  }

  return { newPlanningLedger, newDfSgmt, totalUdHours, totalScheduledHours };
}
