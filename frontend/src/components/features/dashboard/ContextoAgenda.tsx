import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { MotionWrapper } from '@/components/ui/MotionWrapper';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { simulateSchedule, DaySchedule } from '@/utils/scheduleSimulator';
import { useDynamicPlanning } from '@/hooks/useDynamicPlanning';
import { BookOpen, CalendarDays, History, ArrowRight } from "lucide-react";

export const ContextoAgenda = () => {
  const { moduleData, cursoData, dataSource } = useAppStore();
  const { planningLedger } = useDynamicPlanning();

  if (!moduleData) return null;

  const isDemo = dataSource === 'demo';
  const now = isDemo ? new Date(new Date().getFullYear(), 4, 2, 10, 0, 0) : new Date();

  const simulation = simulateSchedule(moduleData, cursoData ? { ...cursoData, planning_ledger: planningLedger } : cursoData);

  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const mondayCurrent = getMonday(now);
  
  const prevWeekDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(mondayCurrent);
    d.setDate(mondayCurrent.getDate() - 7 + i);
    return d;
  });

  const nextWeekDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(mondayCurrent);
    d.setDate(mondayCurrent.getDate() + 7 + i);
    return d;
  });

  const summarizeWeek = (days: Date[]) => {
    const summary: Record<string, { desc: string, sessions: any[], daysCount: number }> = {};
    days.forEach(d => {
      const dStr = format(d, 'dd/MM/yyyy');
      const sched = simulation[dStr];
      if (sched && !sched.isFestivo && sched.udId) {
        if (!summary[sched.udId]) summary[sched.udId] = { desc: sched.udDesc || '', sessions: [], daysCount: 0 };
        summary[sched.udId].daysCount++;
        if (sched.sessions && sched.sessions.length > 0) {
          summary[sched.udId].sessions.push(...sched.sessions);
        }
      }
    });
    
    return Object.entries(summary).map(([udId, data]) => {
      let label = "";
      if (data.sessions.length > 0) {
        const sorted = data.sessions.sort((a, b) => Number(a.Num_Orden || 0) - Number(b.Num_Orden || 0));
        const minS = sorted[0].Num_Orden;
        const maxS = sorted[sorted.length - 1].Num_Orden;
        label = minS === maxS ? `S${minS}` : `S${minS}-S${maxS}`;
      } else {
        label = `Planificado (${data.daysCount} días)`;
      }
      return { udId, desc: data.desc, label, count: data.sessions.length };
    });
  };

  const prevSummary = summarizeWeek(prevWeekDays);
  const nextSummary = summarizeWeek(nextWeekDays);

  // Determinar UD actual
  const todayStr = format(now, 'dd/MM/yyyy');
  const todaySchedule = simulation[todayStr];
  let currentUdId = todaySchedule?.udId;
  let currentUdDesc = todaySchedule?.udDesc;

  // Si hoy no hay clases, buscamos la última UD impartida o la próxima
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

  // Progreso de la UD actual
  let currentUdTotal = 0;
  let currentUdImpartidas = 0;
  
  if (currentUdId) {
    const udSesiones = moduleData.df_sesiones?.filter((s: any) => s.id_ud === currentUdId) || [];
    currentUdTotal = udSesiones.length;
    
    // Contamos cuántas sesiones han pasado hasta 'now' inclusive
    for (const [dateStr, sched] of Object.entries(simulation)) {
      if (sched && !sched.isFestivo && sched.udId === currentUdId) {
        // Parse dd/MM/yyyy
        const [d, m, y] = dateStr.split('/');
        const schedDate = new Date(Number(y), Number(m) - 1, Number(d));
        if (schedDate <= now) {
          currentUdImpartidas += sched.sessions?.length || 0;
        }
      }
    }
  }

  const renderSummaryList = (summary: {udId: string, desc: string, label: string, count: number}[]) => {
    if (summary.length === 0) return <div className="text-muted text-sm italic">Sin clases lectivas</div>;
    return (
      <div className="space-y-2">
        {summary.map(s => (
          <div key={s.udId} className="flex flex-col">
            <span className="text-body font-bold text-foreground">{s.udId} <span className="font-normal text-muted text-sm ml-1">({s.count} sesiones)</span></span>
            <span className="text-sm text-muted-foreground truncate" title={s.desc}>{s.desc}</span>
            <span className="text-xs text-accent mt-1 bg-accent/10 px-2 py-0.5 rounded-full w-fit">
              Sesiones: {s.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <MotionWrapper className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Semana Anterior */}
        <Card className="p-5 opacity-80 hover:opacity-100 transition-opacity flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-muted-foreground font-semibold">
            <History className="w-4 h-4" /> Semana anterior
          </div>
          {renderSummaryList(prevSummary)}
        </Card>

        {/* UD en Curso */}
        <Card className="p-6 relative overflow-hidden transform md:scale-105 shadow-xl z-10 border-info/50 flex flex-col">
          <div className="absolute -right-6 -bottom-6 text-info opacity-10">
            <BookOpen className="w-32 h-32" />
          </div>
          <div className="flex flex-col h-full justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2 text-info font-bold uppercase tracking-wider text-sm">
                <CalendarDays className="w-4 h-4" /> UD en curso
              </div>
              {currentUdId ? (
                <>
                  <h3 className="text-heading font-bold text-foreground">{currentUdId}</h3>
                  <p className="text-body text-muted mt-1 line-clamp-2" title={currentUdDesc}>{currentUdDesc}</p>
                </>
              ) : (
                <p className="text-muted italic">Ninguna UD activa actualmente.</p>
              )}
            </div>
            
            {currentUdId && currentUdTotal > 0 && (
              <div className="mt-6">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progreso de la UD</span>
                  <span>{Math.min(currentUdImpartidas, currentUdTotal)} de {currentUdTotal} sesiones</span>
                </div>
                <div className="w-full bg-foreground/10 rounded-full h-2">
                  <div 
                    className="bg-info h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((currentUdImpartidas / currentUdTotal) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Semana Posterior */}
        <Card className="p-5 opacity-80 hover:opacity-100 transition-opacity flex flex-col">
          <div className="flex items-center justify-end gap-2 mb-4 text-muted-foreground font-semibold">
            Semana próxima <ArrowRight className="w-4 h-4" />
          </div>
          <div className="text-right">
            {renderSummaryList(nextSummary)}
          </div>
        </Card>
      </div>
    </MotionWrapper>
  );
};
