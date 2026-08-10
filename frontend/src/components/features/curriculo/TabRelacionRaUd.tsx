import React, { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Target, CheckCircle2, Clock, Calendar as CalendarIcon } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useDynamicPlanning } from "@/hooks/useDynamicPlanning";

export function TabRelacionRaUd() {
  const { moduleData } = useAppStore();
  const { planningLedger } = useDynamicPlanning();
  const df_ra = moduleData?.df_ra || [];
  const df_ud = moduleData?.df_ud || [];

  const udStatus = useMemo(() => {
    const dates: Record<string, { start: Date, end: Date }> = {};
    Object.entries(planningLedger || {}).forEach(([dateStr, uds]) => {
      const d = new Date(dateStr);
      (uds as string[]).forEach(ud => {
        if (!dates[ud]) dates[ud] = { start: new Date(d), end: new Date(d) };
        if (d < dates[ud].start) dates[ud].start = new Date(d);
        if (d > dates[ud].end) dates[ud].end = new Date(d);
      });
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const status: Record<string, { state: string, colorClass: string, icon: any }> = {};
    df_ud.forEach((ud: any) => {
      const id = ud.id_ud;
      const d = dates[id];
      if (!d) {
        status[id] = { state: "Pendiente", colorClass: "text-muted bg-foreground/5 border-foreground/10", icon: <CalendarIcon className="w-3 h-3" /> };
      } else if (today > d.end) {
        status[id] = { state: "Completada", colorClass: "text-success bg-success/10 border-success/20", icon: <CheckCircle2 className="w-3 h-3" /> };
      } else if (today >= d.start && today <= d.end) {
        status[id] = { state: "En curso", colorClass: "text-info bg-info/10 border-info/20", icon: <Clock className="w-3 h-3" /> };
      } else {
        status[id] = { state: "Pendiente", colorClass: "text-muted bg-foreground/5 border-foreground/10", icon: <CalendarIcon className="w-3 h-3" /> };
      }
    });
    return status;
  }, [planningLedger, df_ud]);

  // Determine RA status based on its UDs
  const getRaStatus = (uds: any[]) => {
    if (!uds || uds.length === 0) return { colorClass: "border-[var(--glass-border)] bg-foreground/5" };
    const states = uds.map(ud => udStatus[ud.id_ud]?.state || "Pendiente");
    if (states.every(s => s === "Completada")) return { colorClass: "border-success/30 bg-success/5 shadow-[inset_0_0_20px_rgba(34,197,94,0.05)]" };
    if (states.some(s => s === "En curso" || s === "Completada")) return { colorClass: "border-info/30 bg-info/5 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]" };
    return { colorClass: "border-[var(--glass-border)] bg-foreground/5" };
  };

  return (
    <div className="animate-in fade-in duration-500 w-full">
      <Card className="p-6 border-t-4 border-t-amber-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-heading font-bold flex items-center gap-2 text-foreground">
            <span><span className="inline-flex"><Target className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Progreso y relación entre Resultados de aprendizaje y Unidades didácticas o de trabajo
          </h2>
          <div className="flex items-center gap-4 text-caption bg-background/50 p-2 rounded-lg border border-[var(--glass-border)]">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Completado</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-info" /> En curso</span>
            <span className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5 text-muted" /> Pendiente</span>
          </div>
        </div>
        {df_ra && df_ra.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
            {df_ra.map((ra: any, idx: number) => {
              const uds = df_ud?.filter((ud: any) => ud[ra.id_ra] > 0) || [];
              const raSt = getRaStatus(uds);
              return (
                <div key={idx} className={`rounded-xl border p-4 transition-colors ${raSt.colorClass}`}>
                  <div className="font-bold text-foreground mb-1">
                    {ra.id_ra} <span className="text-muted font-normal text-body">({ra.peso_ra}%)</span>
                  </div>
                  {uds.length > 0 && (() => {
                    const totalHoras = uds.reduce((sum: number, ud: any) => sum + Number(ud.horas_ud || ud.Horas || 0), 0);
                    const completadasHoras = uds.filter((ud: any) => udStatus[ud.id_ud]?.state === "Completada").reduce((sum: number, ud: any) => sum + Number(ud.horas_ud || ud.Horas || 0), 0);
                    const totalPct = uds.reduce((sum: number, ud: any) => sum + Number(ud[ra.id_ra] || 0), 0);
                    const completadoPct = uds.filter((ud: any) => udStatus[ud.id_ud]?.state === "Completada").reduce((sum: number, ud: any) => sum + Number(ud[ra.id_ra] || 0), 0);

                    return (
                      <div className="space-y-2 mb-4 mt-2">
                        <div>
                          <div className="flex justify-between text-[10px] text-muted mb-1 font-semibold">
                            <span>Avance RA</span>
                            <span>{completadoPct}% / {totalPct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${Math.min(100, (completadoPct / (totalPct || 1)) * 100)}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] text-muted mb-1 font-semibold">
                            <span>Horas lectivas</span>
                            <span>{completadasHoras}h / {totalHoras}h</span>
                          </div>
                          <div className="h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.min(100, (completadasHoras / (totalHoras || 1)) * 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  {uds.length > 0 ? (
                    <div className="space-y-2">
                      {uds.map((ud: any, uIdx: number) => {
                        const st = udStatus[ud.id_ud] || { colorClass: "text-muted bg-foreground/5", icon: null };
                        return (
                          <div key={uIdx} className={`text-caption flex items-center justify-between border rounded-md px-2.5 py-1.5 ${st.colorClass}`}>
                            <div className="flex items-center gap-1.5">
                              {st.icon}
                              <span className="font-semibold">{ud.id_ud}</span>
                              <span className="opacity-70">({ud.horas_ud || ud.Horas || 0}h)</span>
                            </div>
                            <span className="font-bold">{ud[ra.id_ra]}%</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-caption text-muted italic">Sin UDs asignadas</div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-muted p-8">No hay Resultados de aprendizaje definidos.</div>
        )}
      </Card>
    </div>
  );
}
