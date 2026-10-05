import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { flattenAttendanceLedger } from "@/utils/attendance";

// Acumulado de faltas por trimestre y semáforo de pérdida de evaluación
// continua (PdEvC) -- el cálculo que antes vivía en AttendanceAccumulated
// (tabla de todo el grupo), ahora consultable por alumno/a.

const isDateInPeriod = (dateStr: string, startStr: string, endStr: string) => {
  if (!startStr || !endStr || !dateStr) return false;
  const date = new Date(dateStr);
  return date >= new Date(startStr) && date <= new Date(endStr);
};

export function useResumenAsistencia() {
  const { cursoData, moduleData } = useAppStore();
  const info_fechas = cursoData?.info_fechas || {};
  const info_modulo = moduleData?.info_modulo || {};
  const registros = useMemo(() => flattenAttendanceLedger(cursoData?.attendance_ledger), [cursoData?.attendance_ledger]);

  const calcularHoras = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 0;
    const [sy, sm, sd] = startStr.split("-").map(Number);
    const [ey, em, ed] = endStr.split("-").map(Number);
    if (!sy || !ey) return 0;
    const dayMap = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const horario = cursoData?.horario || {};
    const notas = cursoData?.calendar_notes || {};
    const pad = (n: number) => String(n).padStart(2, "0");
    let total = 0;
    for (const curr = new Date(sy, sm - 1, sd); curr <= new Date(ey, em - 1, ed); curr.setDate(curr.getDate() + 1)) {
      if (curr.getDay() === 0 || curr.getDay() === 6) continue;
      if (!notas[`f_${pad(curr.getDate())}/${pad(curr.getMonth() + 1)}/${curr.getFullYear()}`]) total += Number(horario[dayMap[curr.getDay()]]) || 0;
    }
    return total;
  };

  const h_boa = Number(info_modulo.h_boa) || 0;
  const hReal = calcularHoras(info_fechas.ini_1t, info_fechas.fin_1t) + calcularHoras(info_fechas.ini_2t, info_fechas.fin_2t) + calcularHoras(info_fechas.ini_3t, info_fechas.fin_3t);
  const totalHours = h_boa > 0 ? h_boa : hReal;
  const p_ev_pct = Number(info_modulo.p_ev) || 15; // % legal de PdEvC
  const warning1 = p_ev_pct / 3;
  const warning2 = (p_ev_pct / 3) * 2;

  const semaforo = (faltas: number) => {
    if (totalHours === 0) return { color: "bg-foreground/20 text-muted", text: "N/A", pct: 0 };
    const pct = (faltas / totalHours) * 100;
    if (pct >= p_ev_pct) return { color: "bg-danger/10 text-danger border border-danger/30", text: `PdEvC (+${p_ev_pct}%)`, pct };
    if (pct >= warning2) return { color: "bg-warning/10 text-warning border border-warning/30", text: `Alerta 2 (+${warning2.toFixed(1)}%)`, pct };
    if (pct >= warning1) return { color: "bg-warning/10 text-warning border border-warning/30", text: `Alerta 1 (+${warning1.toFixed(1)}%)`, pct };
    return { color: "bg-success/10 text-success border border-success/30", text: "Normal", pct };
  };

  const resumenAlumno = (studentId: string) => {
    const faltas = registros.filter((r) => r.student_id === studentId && r.status === "falta");
    const enTrimestre = (n: 1 | 2 | 3) => faltas.filter((r) => isDateInPeriod(r.date_str, info_fechas[`ini_${n}t`], info_fechas[`fin_${n}t`])).length;
    const retrasos = registros.filter((r) => r.student_id === studentId && r.status === "retraso").length;
    const total = faltas.length;
    const estado = semaforo(total);
    return { t1: enTrimestre(1), t2: enTrimestre(2), t3: enTrimestre(3), total, retrasos, estado, progreso: Math.min((estado.pct / p_ev_pct) * 100, 100) };
  };

  return { totalHours, p_ev_pct, limiteFaltas: Math.round(totalHours * (p_ev_pct / 100)), resumenAlumno };
}
