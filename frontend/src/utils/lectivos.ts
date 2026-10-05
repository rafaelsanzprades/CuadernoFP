// Días lectivos del curso: los de lunes a viernes dentro de los 3 trimestres
// con horas de clase ese día de la semana (horario) y sin festivo (clave
// `f_dd/mm/aaaa` en calendar_notes). `iso` (aaaa-mm-dd) es la clave del
// attendance_ledger.

export interface DiaLectivo {
  iso: string;
  date: Date;
}

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie"];

function parseLocal(s?: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || "");
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

export function isoLocal(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function getDiasLectivos(cursoData: any): DiaLectivo[] {
  const info = cursoData?.info_fechas || {};
  const horario = cursoData?.horario || {};
  const notas = cursoData?.calendar_notes || {};
  const out: DiaLectivo[] = [];
  const p = (n: number) => String(n).padStart(2, "0");
  for (const t of ["1t", "2t", "3t"]) {
    const ini = parseLocal(info[`ini_${t}`]);
    const fin = parseLocal(info[`fin_${t}`]);
    if (!ini || !fin) continue;
    for (const d = new Date(ini); d <= fin; d.setDate(d.getDate() + 1)) {
      const dow = d.getDay();
      if (dow < 1 || dow > 5) continue;
      if (notas[`f_${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`]) continue;
      if ((Number(horario[DIAS[dow - 1]]) || 0) <= 0) continue;
      out.push({ iso: isoLocal(d), date: new Date(d) });
    }
  }
  return out;
}
