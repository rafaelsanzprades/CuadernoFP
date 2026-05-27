"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import DatePicker from "@/components/ui/DatePicker";

export function HorariosTab() {
  const { moduleData, updateModuleData } = useAppStore();

  const data = moduleData?.info_modulo || {};
  const horario = moduleData?.horario || { Lun: 0, Mar: 0, "Mié": 0, Jue: 0, Vie: 0 };
  const info_fechas = moduleData?.info_fechas || {};
  const calendar_notes = moduleData?.calendar_notes || {};

  const h_sem = Number(data.h_sem) || 0;
  const suma_horario = ["Lun", "Mar", "Mié", "Jue", "Vie"].reduce((acc, day) => acc + (Number(horario[day]) || 0), 0);

  const handleUpdateHorario = (day: string, val: number) =>
    updateModuleData("horario", { ...horario, [day]: val });

  const handleUpdateFechas = (field: string, value: string | number) =>
    updateModuleData("info_fechas", { ...info_fechas, [field]: value });

  const pad = (n: number) => String(n).padStart(2, "0");

  const calculateRealHours = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 0;
    try {
      const [sy, sm, sd] = startStr.split("-").map(Number);
      const [ey, em, ed] = endStr.split("-").map(Number);
      if (!sy || !ey) return 0;
      const start = new Date(sy, sm - 1, sd);
      const end = new Date(ey, em - 1, ed);
      const dayMap = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      let total = 0, curr = new Date(start);
      while (curr <= end) {
        if (curr.getDay() !== 0 && curr.getDay() !== 6) {
          const key = `f_${pad(curr.getDate())}/${pad(curr.getMonth() + 1)}/${curr.getFullYear()}`;
          if (!calendar_notes[key]) total += Number(horario[dayMap[curr.getDay()]]) || 0;
        }
        curr.setDate(curr.getDate() + 1);
      }
      return total;
    } catch { return 0; }
  };

  const h1 = calculateRealHours(info_fechas.ini_1t, info_fechas.fin_1t);
  const h2 = calculateRealHours(info_fechas.ini_2t, info_fechas.fin_2t);
  const h3 = calculateRealHours(info_fechas.ini_3t, info_fechas.fin_3t);
  const h_real = h1 + h2 + h3;
  const h_boa = Number(data.h_boa) || 0;
  const p_ev = Number(data.p_ev) || 15;
  const h_p_ev = Math.round((p_ev / 100) * h_real);

  // We should update h_real in the store or state if needed by GeneralTab,
  // but for now, computing it on the fly is fine.

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <Card className="p-6 border-l-4 border-l-purple-500">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span>🕒</span> Sesiones semanales
          </h4>
          <div className="bg-foreground/15 px-4 py-2 rounded-lg border border-[var(--glass-border)] text-sm">
            Desfase con H/Semanal:{" "}
            <span className={`font-bold ${suma_horario === h_sem ? "text-green-400" : "text-yellow-400"}`}>
              {suma_horario - h_sem} h
            </span>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {["Lun", "Mar", "Mié", "Jue", "Vie"].map(day => (
            <Input 
              key={day}
              label={day}
              type="number" min="0" max="8"
              value={Number(horario[day]) || 0}
              onChange={e => handleUpdateHorario(day, Number(e.target.value))}
              className="text-center text-xl font-mono"
            />
          ))}
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-emerald-500">
        <h4 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
          <span>📅</span> Sesiones trimestrales
        </h4>
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "1er trimestre", value: h1 },
            { label: "2º trimestre", value: h2 },
            { label: "3er trimestre", value: h3 },
          ].map(t => (
            <div key={t.label}>
              <label className="block text-sm font-semibold text-muted mb-2 text-center">{t.label}</label>
              <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400 font-mono">{t.value} h</div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-6 mt-4">
          {[
            { label: "Horas BOA", value: `${h_boa} h`, cls: "text-foreground" },
            { label: "Horas clases real", value: `${h_real} h`, cls: "text-emerald-400" },
            { label: `Horas P.Ev. (${p_ev}%)`, value: `${h_p_ev} h`, cls: "text-yellow-400" },
          ].map(s => (
            <div key={s.label}>
              <label className="block text-sm font-semibold text-muted mb-2 text-center">{s.label}</label>
              <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-4 text-center">
                <div className={`text-2xl font-bold ${s.cls}`}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-pink-500 hover:shadow-lg hover:shadow-pink-500/10 transition-shadow">
        <h4 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2"><span>🏢</span> Formación en Empresa (FEOE)</h4>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-muted mb-2 block font-semibold text-center">Inicio FEOE</label>
            <DatePicker value={info_fechas.ini_feoe || ""} onChange={v => handleUpdateFechas("ini_feoe", v)} className="text-center" />
          </div>
          <div>
            <label className="text-sm text-muted mb-2 block font-semibold text-center">Fin FEOE</label>
            <DatePicker value={info_fechas.fin_feoe || ""} onChange={v => handleUpdateFechas("fin_feoe", v)} className="text-center" />
          </div>
          <Input 
            label="Horas/día FEOE"
            type="number" value={Number(info_fechas.h_sem_feoe) || 8}
            onChange={e => handleUpdateFechas("h_sem_feoe", Number(e.target.value))}
            className="text-center" 
          />
        </div>
      </Card>
    </div>
  );
}
