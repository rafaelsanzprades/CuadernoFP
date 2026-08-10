import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { format } from 'date-fns';
import { simulateSchedule } from '@/utils/scheduleSimulator';
import { useDynamicPlanning } from '@/hooks/useDynamicPlanning';
import { BookOpen } from "lucide-react";
import { TAXONOMY_ASPECTOS_CLAVE, TAXONOMY_RECURSOS, AspectoClaveCode, RecursoCode } from '@/constants/taxonomies';

export const DesarrolloUdActual = () => {
  const { moduleData, cursoData, dataSource } = useAppStore();
  const { planningLedger } = useDynamicPlanning();

  if (!moduleData || !moduleData.df_sesiones) return null;

  const isDemo = dataSource === 'demo';
  const now = isDemo ? new Date(new Date().getFullYear(), 4, 2, 10, 0, 0) : new Date();

  const simulation = simulateSchedule(moduleData, cursoData ? { ...cursoData, planning_ledger: planningLedger } : cursoData);

  const todayStr = format(now, 'dd/MM/yyyy');
  const todaySchedule = simulation[todayStr];
  let currentUdId = todaySchedule?.udId;
  let currentUdDesc = todaySchedule?.udDesc;

  if (!currentUdId) {
    let lastClassBeforeNow: any = null;
    let firstClassAfterNow: any = null;
    
    for (const [dateStr, sched] of Object.entries(simulation)) {
      if (!sched || sched.isFestivo || !sched.udId) continue;
      const [d, m, y] = dateStr.split('/');
      const schedDate = new Date(Number(y), Number(m) - 1, Number(d));
      if (schedDate <= now) {
        if (!lastClassBeforeNow || schedDate > lastClassBeforeNow.date) {
          lastClassBeforeNow = { date: schedDate, udId: sched.udId, udDesc: sched.udDesc };
        }
      } else {
        if (!firstClassAfterNow || schedDate < firstClassAfterNow.date) {
          firstClassAfterNow = { date: schedDate, udId: sched.udId, udDesc: sched.udDesc };
        }
      }
    }
    
    if (lastClassBeforeNow) {
      currentUdId = lastClassBeforeNow.udId;
      currentUdDesc = lastClassBeforeNow.udDesc;
    } else if (firstClassAfterNow) {
      currentUdId = firstClassAfterNow.udId;
      currentUdDesc = firstClassAfterNow.udDesc;
    }
  }

  if (!currentUdId) return null;

  const sesiones = moduleData.df_sesiones.filter((s: any) => s.id_ud === currentUdId);
  sesiones.sort((a: any, b: any) => (Number(a.Num_Orden) || 0) - (Number(b.Num_Orden) || 0));

  return (
    <Card className="p-6 mt-8">
      <div className="mb-4 flex flex-col gap-1">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground">
          <BookOpen className="w-6 h-6" /> Desarrollo de la unidad en curso
        </h2>
        <div className="text-subheading font-bold text-foreground ml-8">
          {currentUdId} - {currentUdDesc}
        </div>
      </div>
      <div className="p-4 bg-foreground/5 rounded-xl border border-[var(--glass-border)] overflow-x-auto">
        <div className="min-w-[800px] text-body">
          <div className="flex text-muted border-b border-[var(--glass-border)] pb-2 mb-2 items-center">
            <div className="w-16">Nº</div>
            <div className="w-16 pr-2">Horas</div>
            <div className="w-40 pr-2">Tipo</div>
            <div className="w-32 pr-2">RA/CE</div>
            <div className="flex-1 pr-2">Contenidos</div>
          </div>
          <div className="space-y-2">
            {sesiones.map((ses: any, idx: number) => (
              <div key={idx} className="border-b border-white/5 pb-3">
                {/* Primera Línea */}
                <div className="flex items-center mb-2">
                  <div className="w-16 pr-2 text-muted">{ses.Num_Orden}</div>
                  <div className="w-16 pr-2">{ses.Horas}h</div>
                  <div className="w-40 pr-2">
                    <span className="bg-foreground/10 px-2 py-0.5 rounded text-sm text-foreground/80">
                      {ses.Tipo_Actividad}
                    </span>
                  </div>
                  <div className="w-32 pr-2 text-muted truncate" title={ses.RA_CE}>{ses.RA_CE}</div>
                  <div className="flex-1 pr-2 text-foreground/90">{ses.Contenidos}</div>
                </div>
                
                {/* Segunda Línea: Identada y con los listados */}
                {(ses.Aspectos_Clave || ses.Recursos) && (
                  <div className="flex items-center gap-4 pl-[8.5rem]">
                    {ses.Aspectos_Clave && (
                      <div className="flex-1 flex flex-col">
                        <span className="text-caption text-muted-foreground tracking-wider mb-1 font-semibold">Aspectos clave</span>
                        <div className="text-sm text-muted">
                          {ses.Aspectos_Clave.split(',').map((s: string) => TAXONOMY_ASPECTOS_CLAVE[s.trim() as AspectoClaveCode]).filter(Boolean).join(', ')}
                        </div>
                      </div>
                    )}
                    {ses.Recursos && (
                      <div className="flex-1 flex flex-col pr-10">
                        <span className="text-caption text-muted-foreground tracking-wider mb-1 font-semibold">Recursos</span>
                        <div className="text-sm text-muted">
                          {ses.Recursos.split(',').map((s: string) => TAXONOMY_RECURSOS[s.trim() as RecursoCode]).filter(Boolean).join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
