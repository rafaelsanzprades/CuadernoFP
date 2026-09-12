"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, MessageSquareText, Scale, CalendarX2, BookOpen, GraduationCap, HelpCircle, Filter } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { isAlumnoActivo } from "@/utils/alumnado";
import { buildExpediente, EventoExpediente, TipoEvento } from "@/utils/expediente";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "react-i18next";

// Expediente del alumnado: línea temporal de evidencias ya existentes en la
// app (calificaciones, autoevaluación, tutoría, reclamaciones, asistencia,
// diario de clase), agregadas por alumno -- ver utils/expediente.ts para el
// detalle de qué fuentes entran y por qué (y cuáles se dejan fuera).

const TODOS_LOS_TIPOS: TipoEvento[] = ["calificacion", "autoevaluacion", "tutoria", "reclamacion", "asistencia", "diario"];

function getTipoInfo(t: (key: string, opts?: any) => string): Record<TipoEvento, { label: string; icon: React.ReactNode; color: string }> {
  return {
    calificacion: { label: t('campos.expediente.tipoCalificacion', {defaultValue: 'Calificación'}), icon: <GraduationCap className="w-4 h-4" />, color: "text-info border-info/30 bg-info/10" },
    autoevaluacion: { label: t('campos.expediente.tipoAutoevaluacion', {defaultValue: 'Autoevaluación'}), icon: <ClipboardCheck className="w-4 h-4" />, color: "text-accent border-accent/30 bg-accent/10" },
    tutoria: { label: t('campos.expediente.tipoTutoria', {defaultValue: 'Tutoría'}), icon: <MessageSquareText className="w-4 h-4" />, color: "text-success border-success/30 bg-success/10" },
    reclamacion: { label: t('campos.expediente.tipoReclamacion', {defaultValue: 'Reclamación'}), icon: <Scale className="w-4 h-4" />, color: "text-danger border-danger/30 bg-danger/10" },
    asistencia: { label: t('campos.expediente.tipoAsistencia', {defaultValue: 'Asistencia'}), icon: <CalendarX2 className="w-4 h-4" />, color: "text-warning border-warning/30 bg-warning/10" },
    diario: { label: t('campos.expediente.tipoDiarioClase', {defaultValue: 'Diario de clase'}), icon: <BookOpen className="w-4 h-4" />, color: "text-muted border-white/10 bg-white/5" },
  };
}

export function ExpedienteTab() {
  const { t } = useTranslation();
  const TIPO_INFO = useMemo(() => getTipoInfo(t), [t]);
  const { cursoData, moduleData, activeModuleId } = useAppStore();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [tiposActivos, setTiposActivos] = useState<Set<TipoEvento>>(new Set(TODOS_LOS_TIPOS));
  const [attendanceRecords, setAttendanceRecords] = useState<{ student_id: string; date_str: string; status: string }[]>([]);

  useEffect(() => {
    if (!activeModuleId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attendance/${activeModuleId}`)
      .then((res) => res.json())
      .then((data) => setAttendanceRecords(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching attendance", err));
  }, [activeModuleId]);

  const df_al = cursoData?.df_al || [];
  const activeStudents = [...df_al.filter(isAlumnoActivo)].sort(
    (a: any, b: any) => String(a.Apellidos || "").localeCompare(String(b.Apellidos || ""))
  );

  useEffect(() => {
    if (activeStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(activeStudents[0].ID || "");
    }
  }, [activeStudents.length]);

  const { eventos, sinFecha } = useMemo(() => {
    if (!selectedStudentId) return { eventos: [] as EventoExpediente[], sinFecha: [] as EventoExpediente[] };
    return buildExpediente(selectedStudentId, cursoData, moduleData, attendanceRecords);
  }, [selectedStudentId, cursoData, moduleData, attendanceRecords]);

  const eventosFiltrados = eventos.filter((e) => tiposActivos.has(e.tipo));
  const sinFechaFiltrados = sinFecha.filter((e) => tiposActivos.has(e.tipo));

  const toggleTipo = (tipo: TipoEvento) => {
    const next = new Set(tiposActivos);
    if (next.has(tipo)) next.delete(tipo); else next.add(tipo);
    setTiposActivos(next);
  };

  const formatFecha = (d: Date) => d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });

  if (activeStudents.length === 0) {
    return (
      <Card className="p-8 text-center border-l-4 border-l-yellow-500 mt-6">
        <p className="text-foreground/80">{t('campos.expediente.sinAlumnadoActivoRegistrado', {defaultValue: 'No hay alumnado activo registrado en este curso.'})}</p>
      </Card>
    );
  }

  return (
    <div className="flex gap-6 min-h-[500px]">
      <div className="w-72 bg-foreground/5 border border-white/5 rounded-2xl flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-white/5 bg-foreground/10">
          <div className="text-xs font-medium text-muted tracking-wider">Alumnado activo ({activeStudents.length})</div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
          {activeStudents.map((al: any) => {
            const isSelected = al.ID === selectedStudentId;
            return (
              <button
                key={al.ID}
                onClick={() => setSelectedStudentId(al.ID || "")}
                className={`w-full text-left px-3.5 py-3 rounded-xl transition-all ${
                  isSelected ? "bg-accent text-background font-bold shadow-md shadow-accent/15" : "text-foreground/80 hover:bg-foreground/5"
                }`}
              >
                <div className="text-sm truncate">{al.Apellidos}, {al.Nombre}</div>
                <div className={`text-[10px] font-mono ${isSelected ? "text-background/70" : "text-muted"}`}>{al.ID}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 bg-foreground/5 border border-white/5 rounded-2xl flex flex-col overflow-hidden">
        {selectedStudentId ? (
          <>
            <div className="p-6 border-b border-white/5 bg-foreground/10 shrink-0">
              <h3 className="text-xl font-black text-foreground mb-3">
                {activeStudents.find((a: any) => a.ID === selectedStudentId)?.Nombre} {activeStudents.find((a: any) => a.ID === selectedStudentId)?.Apellidos}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                <span className="flex items-center gap-1 text-caption text-muted mr-1"><Filter className="w-3.5 h-3.5" /></span>
                {TODOS_LOS_TIPOS.map((tipo) => {
                  const info = TIPO_INFO[tipo];
                  const activo = tiposActivos.has(tipo);
                  return (
                    <button
                      key={tipo}
                      onClick={() => toggleTipo(tipo)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-caption font-semibold border transition-colors ${
                        activo ? info.color : "bg-transparent border-white/10 text-muted/50"
                      }`}
                    >
                      {info.icon} {info.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {eventosFiltrados.length === 0 && sinFechaFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted py-12">
                  <HelpCircle className="w-12 h-12 opacity-30 mb-3" />
                  <p className="font-semibold">{t('campos.expediente.sinEvidenciasTodavia', {defaultValue: 'Sin evidencias todavía'})}</p>
                  <p className="text-body opacity-70 mt-1">O están todas filtradas — revisa los tipos marcados arriba.</p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                  {eventosFiltrados.map((ev) => {
                    const info = TIPO_INFO[ev.tipo];
                    return (
                      <div key={ev.id} className="relative">
                        <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-background ${info.color.split(" ")[2]}`} />
                        <div className="bg-background/20 border border-white/5 rounded-xl p-4">
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <span className={`flex items-center gap-1.5 text-caption font-semibold px-2 py-0.5 rounded-full border ${info.color}`}>
                              {info.icon} {info.label}
                            </span>
                            <span className="text-caption text-muted font-mono">{formatFecha(ev.fecha)}</span>
                          </div>
                          <p className="text-body font-semibold text-foreground">{ev.titulo}</p>
                          {ev.detalle && <p className="text-caption text-muted mt-1 line-clamp-2">{ev.detalle}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {sinFechaFiltrados.length > 0 && (
                <div className="mt-8 pt-4 border-t border-white/5">
                  <p className="text-caption font-semibold text-muted tracking-wider mb-3">
                    SIN FECHA REGISTRADA ({sinFechaFiltrados.length})
                  </p>
                  <div className="space-y-2">
                    {sinFechaFiltrados.map((ev) => (
                      <div key={ev.id} className="bg-background/10 border border-white/5 rounded-lg p-3 flex items-center justify-between gap-3">
                        <p className="text-caption text-foreground/80">{ev.titulo}</p>
                        <span className="text-caption text-muted shrink-0">{ev.detalle}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-8 text-muted">
            <HelpCircle className="w-12 h-12 text-muted/50 mb-3" />
            <p className="font-semibold text-lg">{t('campos.expediente.ningunAlumnadoSeleccionado', {defaultValue: 'Ningún alumnado seleccionado'})}</p>
          </div>
        )}
      </div>
    </div>
  );
}
