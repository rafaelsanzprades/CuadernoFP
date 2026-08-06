"use client";
import { Calendar } from "lucide-react";
import React from "react";
import { useAppStore } from "@/store/useAppStore";
import { useDynamicPlanning } from "@/hooks/useDynamicPlanning";
import { Card } from "@/components/ui/Card";

export function PlanificacionMensualTab() {
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
    if (row.id_ud === 'FEOE' || row.id_ud === 'FEOE (Sin docencia)' || row.id_ud === 'FEOE (Con docencia)') {
      return `FEOE (${cursoData?.info_fechas?.docencia_dual === 'con_docencia' ? 'Con docencia' : 'Sin docencia'})`;
    }
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
      <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground">
        <span><span className="inline-flex"><Calendar className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Planificación y seguimiento mensual
      </h2>

      <section className="glass-card p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse text-body whitespace-nowrap">
          <thead>
            <tr className="border-b border-[var(--glass-border)] text-muted bg-foreground/5">
              <th className="p-3 w-[220px] max-w-[220px] sticky left-0 bg-[#111827] z-10 border-r border-[var(--glass-border)]"></th>
              <th className="p-3 w-[50px] max-w-[50px] sticky left-[220px] bg-[#111827] z-10 text-center"></th>
              <th className="p-3 w-[64px] max-w-[64px] sticky left-[270px] bg-[#111827] z-10 text-center"></th>
              <th className="p-3 w-[64px] max-w-[64px] sticky left-[334px] bg-[#111827] z-10 text-center"></th>
              <th className="p-3 w-[90px] max-w-[90px] sticky left-[398px] bg-[#111827] z-10 text-center border-r border-[var(--glass-border)]"></th>
              {meses_display.map((m) => (
                <th key={m} colSpan={2} className="p-2 text-center border-r border-[var(--glass-border)]">{m}</th>
              ))}
            </tr>
            <tr className="border-b border-[var(--glass-border)] text-caption text-muted bg-foreground/5">
              <th className="p-2 w-[220px] max-w-[220px] sticky left-0 bg-[#111827] z-10 border-r border-[var(--glass-border)] text-left font-bold text-foreground">UD</th>
              <th className="p-2 w-[50px] max-w-[50px] sticky left-[220px] bg-[#111827] z-10 text-center" title="Evaluación en la que termina la UD">Ev.</th>
              <th className="p-2 w-[64px] max-w-[64px] sticky left-[270px] bg-[#111827] z-10 text-center text-info">Prv</th>
              <th className="p-2 w-[64px] max-w-[64px] sticky left-[334px] bg-[#111827] z-10 text-center text-[#14a085]/70">Imp</th>
              <th className="p-2 w-[90px] max-w-[90px] truncate overflow-hidden sticky left-[398px] bg-[#111827] z-10 text-center text-warning border-r border-[var(--glass-border)]" title="% Impartido / Previsto">%Imp/Prv</th>
              {meses_display.map((m) => (
                <React.Fragment key={m}>
                  <th className="p-2 text-center text-info">Prv</th>
                  <th className="p-2 text-center text-[#14a085]/70 border-r border-[var(--glass-border)]">Imp</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {df_sgmt_calculated.map((row: any, idx: number) => (
              <tr key={idx} className="border-b border-white/5 hover:bg-foreground/5 transition-colors">
                <td
                  title={getUdLabel(row)}
                  className="p-3 w-[220px] max-w-[220px] truncate font-mono sticky left-0 bg-background group-hover:bg-[#111827] border-r border-[var(--glass-border)] font-bold"
                >
                  {getUdLabel(row)}
                </td>
                <td className="p-3 w-[50px] max-w-[50px] text-center sticky left-[220px] bg-background group-hover:bg-[#111827]">{row.ev ? `${row.ev}ª` : ''}</td>
                <td className="p-3 w-[64px] max-w-[64px] text-center sticky left-[270px] bg-background group-hover:bg-[#111827] text-info">{row.horas_ud || ''}</td>
                <td className="p-3 w-[64px] max-w-[64px] text-center sticky left-[334px] bg-background group-hover:bg-[#111827] text-[#14a085] font-bold">{row.Total_Imp || ''}</td>
                <td className={`p-3 w-[90px] max-w-[90px] text-center sticky left-[398px] bg-background group-hover:bg-[#111827] border-r border-[var(--glass-border)] font-bold ${row.pct_imp_prev >= 100 ? 'text-success' : row.pct_imp_prev > 0 ? 'text-warning' : 'text-muted'}`}>
                  {row.pct_imp_prev}%
                </td>
                {meses_display.map((m) => (
                  <React.Fragment key={m}>
                    <td className="p-3 text-center text-foreground/60">{Number(row[`${m}_Prv`]) || ''}</td>
                    <td className="p-3 text-center text-[#14a085] font-semibold border-r border-[var(--glass-border)] bg-[#14a085]/5">{Number(row[`${m}_Imp`]) || ''}</td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
