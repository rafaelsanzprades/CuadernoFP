"use client";
import { BarChart2, CheckCircle, ClipboardEdit, Clock, OctagonAlert, Settings, Users, XCircle } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PanelPorAlumno, SeccionAcordeon } from "@/components/features/alumnado/PanelPorAlumno";
import { useDateFnsLocale, useDateFormatPatterns } from "@/hooks/useDateFnsLocale";
import { AttendanceStatus, getAttendanceStatus, withAttendanceStatus } from "@/utils/attendance";
import { getDiasLectivos, isoLocal } from "@/utils/lectivos";
import { getSimulatedToday } from "@/utils/planningGenerator";
import { useResumenAsistencia } from "./useResumenAsistencia";
import Link from "next/link";
import { useTranslation } from "react-i18next";

// Seguimiento -> Asistencia: lista de alumnado a la izquierda (con el estado
// del día seleccionado, que se puede cambiar con un clic) y, por alumno/a,
// el control de asistencia día a día y su acumulado trimestral. El resumen
// de riesgo de abandono vive ahora en Cierre -> Asistencia.

const ESTADOS: { value: Exclude<AttendanceStatus, "">; icon: React.ReactNode; color: string; activo: string }[] = [
  { value: "presente", icon: <CheckCircle className="w-4 h-4" />, color: "text-success", activo: "bg-success/10 text-success border-success/30" },
  { value: "falta", icon: <XCircle className="w-4 h-4" />, color: "text-danger", activo: "bg-danger/10 text-danger border-danger/30" },
  { value: "retraso", icon: <Clock className="w-4 h-4" />, color: "text-warning", activo: "bg-warning/10 text-warning border-warning/30" },
];

function BotonesEstado({ status, onSet, grande = false }: { status: AttendanceStatus; onSet: (s: AttendanceStatus) => void; grande?: boolean }) {
  return (
    <div className="inline-flex gap-1.5">
      {ESTADOS.map((e) => (
        <button
          key={e.value}
          onClick={() => onSet(status === e.value ? "" : e.value)}
          title={e.value}
          className={`${grande ? "px-4 py-2 gap-2" : "px-2 py-1"} rounded-md border font-semibold flex items-center transition-all ${
            status === e.value ? e.activo : "bg-background/40 text-muted border-[var(--glass-border)] hover:bg-foreground/5"
          }`}
        >
          {e.icon}
          {grande && <span className="text-body">{e.value}</span>}
        </button>
      ))}
    </div>
  );
}

function ChipEstado({ status, onCycle }: { status: AttendanceStatus; onCycle: () => void }) {
  const e = ESTADOS.find((x) => x.value === status);
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(ev) => { ev.stopPropagation(); onCycle(); }}
      onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); ev.stopPropagation(); onCycle(); } }}
      title={status || "Sin registrar"}
      className={`shrink-0 w-7 h-7 rounded-md border flex items-center justify-center bg-background/80 ${e ? `${e.activo}` : "text-muted border-[var(--glass-border)]"}`}
    >
      {e ? e.icon : "-"}
    </span>
  );
}

// Lleva la vista a la fila del día seleccionado (el mes en curso, abierto) al
// entrar y al cambiar de alumno/a.
function IrAlDia({ iso, studentId }: { iso: string; studentId: string }) {
  useEffect(() => {
    // Varios intentos (idempotentes) y con retraso: mientras corren las
    // animaciones de entrada la posición de la fila aún no es la definitiva
    // (y la hidratación inicial puede deshacer el primer scroll, igual que en
    // Seguimiento -> Clases). Se desplaza solo el contenedor del panel.
    let intentos = 0;
    const id = setInterval(() => {
      const fila = document.getElementById(`dia-${iso}`);
      const cont = fila?.closest<HTMLElement>(".overflow-y-auto");
      if (fila && cont) {
        const rf = fila.getBoundingClientRect();
        const rc = cont.getBoundingClientRect();
        cont.scrollTop += rf.top - rc.top - (cont.clientHeight - rf.height) / 2;
      }
      if (++intentos >= 6) clearInterval(id);
    }, 400);
    return () => clearInterval(id);
  }, [iso, studentId]);
  return null;
}

export function AsistenciaTab() {
  const { t } = useTranslation();
  const { activeModuleId, cursoData, dataSource, updateCursoData } = useAppStore();
  const dateFnsLocale = useDateFnsLocale();
  const dateFormats = useDateFormatPatterns();
  const { totalHours, p_ev_pct, limiteFaltas, resumenAlumno } = useResumenAsistencia();

  // "Hoy" (en DEMO, la fecha simulada) y el día lectivo más cercano a hoy,
  // que es el que se muestra seleccionado al entrar.
  const hoy = dataSource === "demo" && cursoData ? getSimulatedToday(cursoData) : new Date();
  const hoyIso = isoLocal(hoy);
  const lectivos = useMemo(() => getDiasLectivos(cursoData), [cursoData?.info_fechas, cursoData?.horario, cursoData?.calendar_notes]);
  const [seleccion, setSeleccion] = useState<Date | null>(null);
  const masCercano = lectivos.reduce<Date | null>(
    (best, d) => (!best || Math.abs(d.date.getTime() - hoy.getTime()) < Math.abs(best.getTime() - hoy.getTime()) ? d.date : best),
    null
  );
  const fecha: Date = seleccion ?? masCercano ?? hoy;
  const iso = format(fecha, "yyyy-MM-dd");
  const ledger = cursoData?.attendance_ledger;
  const setFecha = (d: Date) => setSeleccion(d);

  if (!activeModuleId || !cursoData) {
    return (
      <EmptyState
        icon={Users}
        title={t('tooltips.diario.ningunCursoActivo', {defaultValue: 'Ningún curso activo'})}
        description={<>Para pasar lista necesitas tener un Curso activo con alumnado matriculados.</>}
        action={
          <Link href="/inicio?tab=datos" className="glass-button bg-accent/10 text-accent hover:bg-accent/20 px-6 py-3 rounded-lg font-bold flex items-center gap-2">
            Ir a Inicio <Settings className="w-5 h-5" />
          </Link>
        }
      />
    );
  }

  const estadoDe = (id: string, dia = iso) => getAttendanceStatus(ledger, dia, id);
  const poner = (id: string, dia: string, status: AttendanceStatus | null) =>
    updateCursoData("attendance_ledger", withAttendanceStatus(ledger, dia, id, status));
  const ciclar = (id: string) => {
    const actual = estadoDe(id);
    poner(id, iso, actual === "" ? "presente" : actual === "presente" ? "falta" : actual === "falta" ? "retraso" : "");
  };

  // Lectivos agrupados por mes (aaaa-mm), en orden cronológico.
  const porMes = new Map<string, typeof lectivos>();
  lectivos.forEach((d) => {
    const k = d.iso.slice(0, 7);
    porMes.set(k, [...(porMes.get(k) || []), d]);
  });
  const mesSeleccionado = iso.slice(0, 7);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <PanelPorAlumno rowExtra={(al) => <ChipEstado status={estadoDe(al.ID!)} onCycle={() => ciclar(al.ID!)} />}>
        {(al) => {
          const id = al.ID!;
          const r = resumenAlumno(id);
          return (
            <>
              <SeccionAcordeon defaultOpen title={t('campos.diario.controlAsistenciaTitulo', {defaultValue: 'Control de asistencia'})} icon={<ClipboardEdit className="w-5 h-5 text-info" />}>
                <div className="bg-background/20 border border-white/5 rounded-xl p-5 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-body font-semibold">{format(fecha, dateFormats.weekdayDayMonth, { locale: dateFnsLocale })}</p>
                    <BotonesEstado grande status={estadoDe(id)} onSet={(s) => poner(id, iso, s || null)} />
                  </div>

                  <IrAlDia iso={iso} studentId={id} />
                  {porMes.size === 0 ? (
                    <p className="text-body text-muted">{t('campos.diario.sinDiasLectivos', {defaultValue: 'No hay días lectivos: configura las fechas y el horario en Calendario.'})}</p>
                  ) : (
                    <div className="space-y-2">
                      {[...porMes.entries()].map(([mes, dias]) => (
                        <details key={mes + id} open={mes === mesSeleccionado} className="group rounded-lg border border-[var(--glass-border)] bg-foreground/5 overflow-hidden">
                          <summary className="p-3 cursor-pointer select-none flex items-center justify-between font-semibold hover:bg-foreground/5">
                            <span className="capitalize">{format(dias[0].date, "LLLL yyyy", { locale: dateFnsLocale })}</span>
                            <span className="text-caption text-muted">
                              {dias.filter((d) => estadoDe(id, d.iso) === "falta").length} {t('campos.diario.faltasAbrev', {defaultValue: 'faltas'})} <span className="ml-3 group-open:rotate-180 inline-block transition-transform">▼</span>
                            </span>
                          </summary>
                          <div className="divide-y divide-white/5">
                            {dias.map((d) => (
                              <div key={d.iso} id={`dia-${d.iso}`} className={`flex items-center justify-between px-4 py-1.5 ${d.iso === iso ? "bg-accent/15 ring-1 ring-inset ring-accent/60" : ""}`}>
                                <button onClick={() => setFecha(d.date)} className={`text-body hover:text-foreground capitalize text-left flex items-center gap-2 ${d.iso === iso ? "text-foreground font-semibold" : "text-foreground/80"}`}>
                                  {format(d.date, dateFormats.weekdayDayMonth, { locale: dateFnsLocale })}
                                  {d.iso === hoyIso && <span className="bg-accent/10 text-accent border border-accent/30 px-2 py-0.5 rounded text-caption font-bold">{t('campos.calendario.hoyBadge', {defaultValue: 'Hoy'})}</span>}
                                </button>
                                <BotonesEstado status={estadoDe(id, d.iso)} onSet={(s) => poner(id, d.iso, s || null)} />
                              </div>
                            ))}
                          </div>
                        </details>
                      ))}
                    </div>
                  )}
                </div>
              </SeccionAcordeon>

              <SeccionAcordeon title={t('checks.diario.acumuladoTrimestral', {defaultValue: 'Acumulado trimestral'})} icon={<BarChart2 className="w-5 h-5 text-accent" />}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4 border-l-4 border-l-accent flex items-center justify-between">
                      <div>
                        <p className="text-body font-semibold text-muted">{t('campos.diario.horasTotalesModulo', {defaultValue: 'Horas totales del módulo'})}</p>
                        <p className="text-heading font-extrabold text-foreground">{totalHours} h</p>
                      </div>
                      <Clock className="w-8 h-8 text-accent/80" />
                    </Card>
                    <Card className="p-4 border-l-4 border-l-yellow-500 flex items-center justify-between">
                      <div>
                        <p className="text-body font-semibold text-muted">Límite PdEvC ({p_ev_pct}%)</p>
                        <p className="text-heading font-extrabold text-foreground">{limiteFaltas} faltas</p>
                      </div>
                      <OctagonAlert className="w-8 h-8 text-warning" />
                    </Card>
                  </div>
                  <div className="bg-background/20 border border-white/5 rounded-xl p-5 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                      {[["1t", r.t1], ["2t", r.t2], ["3t", r.t3], [t('common.total', {defaultValue: 'Total'}), r.total], [t('campos.diario.retrasos', {defaultValue: 'Retrasos'}), r.retrasos]].map(([lab, val]) => (
                        <div key={String(lab)} className="rounded-lg bg-foreground/5 border border-white/5 py-3">
                          <div className="text-caption text-muted">{lab}</div>
                          <div className="text-heading font-bold font-mono">{Number(val) > 0 ? val : "-"}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-caption text-muted shrink-0">{t('tablas.diario.estadoPdevc', {defaultValue: 'Estado PdEvC'})}</span>
                      <span className={`px-3 py-1 rounded-md text-body font-semibold ${r.estado.color}`}>{r.estado.text}</span>
                      <div className="flex-1">
                        <div className="h-2 w-full bg-foreground/10 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${r.estado.color.split(" ")[0].replace("/20", "")}`} style={{ width: `${r.progreso}%` }} />
                        </div>
                        <div className="text-right text-caption text-muted mt-1">{r.estado.pct.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </SeccionAcordeon>
            </>
          );
        }}
      </PanelPorAlumno>
    </div>
  );
}
