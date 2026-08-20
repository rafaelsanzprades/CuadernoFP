"use client";
import { Calendar } from "lucide-react";
import React from "react";
import { useAppStore } from "@/store/useAppStore";
import { useDynamicPlanning } from "@/hooks/useDynamicPlanning";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "react-i18next";

export function PlanificacionMensualTab() {
  const { t } = useTranslation();
  const { cursoData, moduleData } = useAppStore();
  const { df_sgmt } = useDynamicPlanning();

  const df_sgmt_calculated = df_sgmt.map((row: any) => {
    let total_imp = 0;
    Object.keys(row).forEach(k => {
      if (k.endsWith('_Imp') && k !== 'Total_Imp') {
        total_imp += (Number(row[k]) || 0);
      }
    });
    const horas_ud = Number(row.horas_ud) || 0;
    const pct_imp_prev = horas_ud > 0 ? Math.round((total_imp / horas_ud) * 100) : (total_imp > 0 ? 100 : 0);
    return { ...row, Total_Imp: total_imp, pct_imp_prev };
  });

  const ud_desc_map: Record<string, string> = {};
  (moduleData?.df_ud || []).forEach((ud: any) => {
    if (ud.id_ud) ud_desc_map[String(ud.id_ud)] = ud.desc_ud || '';
  });

  const getUdLabel = (row: any) => {
    if (row.id_ud === 'FEOE') return 'FEOE. Formación en Empresa u Organismo Equiparado';
    if (row.id_ud === 'Sin docencia') return 'Sin docencia';
    const desc = ud_desc_map[row.id_ud];
    return desc ? `${row.id_ud}. ${desc}` : row.id_ud;
  };

  const meses_display = ["Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun"];

  if (!cursoData || !moduleData) {
    return (
      <Card className="p-8 text-center text-muted">
        Carga una programación y curso para ver la planificación mensual.
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="p-6 overflow-x-auto">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-5">
          <span><span className="inline-flex"><Calendar className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Planificación y seguimiento mensual
        </h2>
        <table className="w-full text-left border-collapse text-body whitespace-nowrap">
          <thead>
            <tr className="border-b border-[var(--glass-border)] text-muted bg-foreground/5">
              <th className="p-3 w-[50px] max-w-[50px] sticky left-0 bg-[#111827] z-10 border-r border-[var(--glass-border)] text-center"></th>
              <th className="p-3 w-[440px] max-w-[440px] sticky left-[50px] bg-[#111827] z-10 border-r border-[var(--glass-border)]"></th>
              <th className="p-3 w-[64px] max-w-[64px] sticky left-[490px] bg-[#111827] z-10 text-center"></th>
              <th className="p-3 w-[64px] max-w-[64px] sticky left-[554px] bg-[#111827] z-10 text-center"></th>
              <th className="p-3 w-[90px] max-w-[90px] sticky left-[618px] bg-[#111827] z-10 text-center border-r border-[var(--glass-border)]"></th>
              {meses_display.map((m) => (
                <th key={m} colSpan={2} className="p-1 text-center border-r border-[var(--glass-border)]">{m}</th>
              ))}
            </tr>
            <tr className="border-b border-[var(--glass-border)] text-caption text-muted bg-foreground/5">
              <th className="p-2 w-[50px] max-w-[50px] sticky left-0 bg-[#111827] z-10 border-r border-[var(--glass-border)] text-center" title={t('tooltips.dashboard.trimestreFinUd', {defaultValue: 'Trimestre en el que termina la UD'})}>Tri.</th>
              <th className="p-2 w-[440px] max-w-[440px] sticky left-[50px] bg-[#111827] z-10 border-r border-[var(--glass-border)] text-left font-bold text-foreground">UD. Unidad didáctica</th>
              <th className="p-2 w-[64px] max-w-[64px] sticky left-[490px] bg-[#111827] z-10 text-center text-info">Prv</th>
              <th className="p-2 w-[64px] max-w-[64px] sticky left-[554px] bg-[#111827] z-10 text-center text-[#14a085]/70">Imp</th>
              <th className="p-2 w-[90px] max-w-[90px] truncate overflow-hidden sticky left-[618px] bg-[#111827] z-10 text-center text-warning border-r border-[var(--glass-border)]" title={t('tooltips.dashboard.pctImpartidoPrevisto', {defaultValue: '% impartido / previsto'})}>%Imp/Prv</th>
              {meses_display.map((m) => (
                <React.Fragment key={m}>
                  <th className="p-1 w-[40px] text-center text-info">Prv</th>
                  <th className="p-1 w-[40px] text-center text-[#14a085]/70 border-r border-[var(--glass-border)]">Imp</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {df_sgmt_calculated.map((row: any, idx: number) => {
              const bgClass = row.ev == 1 ? 'bg-purple-500/10 text-white' : row.ev == 2 ? 'bg-rose-500/10 text-white' : row.ev == 3 ? 'bg-amber-500/10 text-white' : 'bg-background hover:bg-[#111827] text-foreground';
              const stickyBg = row.ev == 1 ? 'bg-[#181530]' : row.ev == 2 ? 'bg-[#261421]' : row.ev == 3 ? 'bg-[#231d11]' : 'bg-background group-hover:bg-[#111827]';
              const textTriClass = row.ev == 1 ? 'text-purple-300' : row.ev == 2 ? 'text-rose-300' : row.ev == 3 ? 'text-amber-300' : 'text-muted';
              const isColored = !!row.ev;

              return (
              <tr key={idx} className={`border-b border-white/5 transition-colors ${bgClass}`}>
                <td className={`p-3 w-[50px] max-w-[50px] text-center sticky left-0 z-10 border-r border-[var(--glass-border)] font-bold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] ${stickyBg} ${textTriClass}`}>
                  {row.ev ? `${row.ev}ª` : ''}
                </td>
                <td
                  title={getUdLabel(row)}
                  className={`p-3 w-[440px] max-w-[440px] truncate font-mono sticky left-[50px] z-10 border-r border-[var(--glass-border)] font-bold ${stickyBg}`}
                >
                  {getUdLabel(row)}
                </td>
                <td className={`p-3 w-[64px] max-w-[64px] text-center sticky left-[490px] z-10 ${stickyBg} ${isColored ? 'text-info/90' : 'text-info'}`}>{row.horas_ud || ''}</td>
                <td className={`p-3 w-[64px] max-w-[64px] text-center sticky left-[554px] z-10 font-bold ${stickyBg} ${isColored ? 'text-[#34d399]' : 'text-[#14a085]'}`}>{row.Total_Imp || ''}</td>
                <td className={`p-3 w-[90px] max-w-[90px] text-center sticky left-[618px] z-10 border-r border-[var(--glass-border)] font-bold ${stickyBg} ${row.pct_imp_prev >= 100 ? 'text-success' : row.pct_imp_prev > 0 ? 'text-warning' : (isColored ? 'text-white/60' : 'text-muted')}`}>
                  {row.pct_imp_prev}%
                </td>
                {meses_display.map((m) => (
                  <React.Fragment key={m}>
                    <td className={`p-1 w-[40px] text-center ${isColored ? 'text-white/80' : 'text-foreground/60'}`}>{Number(row[`${m}_Prv`]) || ''}</td>
                    <td className={`p-1 w-[40px] text-center font-semibold border-r border-[var(--glass-border)] ${isColored ? 'bg-black/20 text-[#34d399]' : 'bg-[#14a085]/5 text-[#14a085]'}`}>{Number(row[`${m}_Imp`]) || ''}</td>
                  </React.Fragment>
                ))}
              </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <p className="text-caption text-muted">
        Esta previsión se calcula día a día con el calendario de festivos y el horario semanal
        que ya tienes registrados — no es una estimación proporcional. Cambiará si el calendario
        oficial del curso o la distribución definitiva del horario semanal todavía no están
        completos.
      </p>
    </div>
  );
}
