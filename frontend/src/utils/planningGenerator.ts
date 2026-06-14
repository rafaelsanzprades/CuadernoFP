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

  let simulatedToday = new Date();
  if (info_fechas.fin_curso) {
    const finDate = parseDate(info_fechas.fin_curso);
    if (finDate) {
      simulatedToday = new Date(finDate.getFullYear(), 4, 2); // Month 4 is May (0-indexed)
    }
  }

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

    if (isFestivo || hours <= 0) return;

    const isPastOrToday = d.getTime() <= simulatedToday.getTime();

    // Check FEOE logic
    const isFeoe = inRange(d, feoS, feoE);
    if (isFeoe && docencia_dual === 'sin_docencia') {
      newPlanningLedger[lookupDateStr] = ["FEOE"];
      const monthPrefix = monthKeys[d.getMonth()];
      const prvKey = `${monthPrefix}_Prv`;
      const impKey = `${monthPrefix}_Imp`;
      prvTracker["FEOE"][prvKey] = (prvTracker["FEOE"][prvKey] || 0) + hours;
      if (isPastOrToday) {
        prvTracker["FEOE"][impKey] = (prvTracker["FEOE"][impKey] || 0) + hours;
      }
      return; // Skip consuming UD hours
    }

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

  // 4. Build new df_sgmt
  const newDfSgmt: any[] = [];
  const months = ["Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun"];

  // Add UDs
  df_ud.forEach((ud: any) => {
    const id = ud.id_ud;
    const newRow: any = {
      id_ud: id,
      horas_ud: ud.duracion || ud.horas_ud || 0
    };

    months.forEach(m => {
      newRow[`${m}_Prv`] = prvTracker[id]?.[`${m}_Prv`] || 0;
      newRow[`${m}_Imp`] = prvTracker[id]?.[`${m}_Imp`] || 0;
    });

    newDfSgmt.push(newRow);
  });

  // Add FEOE row if it has any hours
  const hasFeoeHours = Object.keys(prvTracker["FEOE"]).length > 0;
  if (hasFeoeHours) {
    const feoeRow: any = {
      id_ud: `FEOE (${docencia_dual === 'con_docencia' ? 'Con docencia' : 'Sin docencia'})`,
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
    newDfSgmt.push(feoeRow);
  }

  return { newPlanningLedger, newDfSgmt, totalUdHours, totalScheduledHours };
}
