import React from "react";
import { Card } from "@/components/ui/Card";
import { Target } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function TabRelacionRaUd() {
  const { moduleData } = useAppStore();
  const df_ra = moduleData?.df_ra || [];
  const df_ud = moduleData?.df_ud || [];

  return (
    <div className="animate-in fade-in duration-500 w-full">
      <Card className="p-6 border-t-4 border-t-amber-500">
        <h2 className="text-heading font-bold flex items-center gap-2 text-foreground mb-4">
          <span><span className="inline-flex"><Target className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Relación entre Resultados de aprendizaje y Unidades didácticas o de trabajo
        </h2>
        {df_ra && df_ra.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {df_ra.map((ra: any, idx: number) => {
              const uds = df_ud?.filter((ud: any) => ud[ra.id_ra] > 0) || [];
              return (
                <div key={idx} className="rounded-xl border border-[var(--glass-border)] bg-foreground/5 p-4">
                  <div className="font-bold text-foreground mb-3">
                    {ra.id_ra} <span className="text-muted font-normal text-body">({ra.peso_ra}%)</span>
                  </div>
                  {uds.length > 0 ? (
                    <div className="space-y-1.5">
                      {uds.map((ud: any, uIdx: number) => (
                        <div key={uIdx} className="text-caption text-[#ffe599] bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-md px-2 py-1">
                          {ud.id_ud} ({ud.horas_ud || ud.Horas || 0}h) · {ud[ra.id_ra]}%
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-caption text-muted italic">Sin UDs asignadas</div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-muted">No hay Resultados de aprendizaje definidos.</div>
        )}
      </Card>
    </div>
  );
}
