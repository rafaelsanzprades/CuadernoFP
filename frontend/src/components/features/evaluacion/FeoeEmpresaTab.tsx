"use client";
import React, { useState } from "react";
import { Building2, CheckCircle2, XCircle, HelpCircle, Sparkles, ThumbsUp } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { isAlumnoActivo } from "@/utils/alumnado";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "react-i18next";

// ─── Ítem 12 (resto): evaluación del RA desarrollado en empresa (FEOE) ──────
// El tutor de empresa valora, para los CE que el profesor designe, del 1 al 4
// (escala real del Anexo XI b) del Gobierno de Aragón: 1 Suspenso, 2
// Aprobado, 3 Notable, 4 Sobresaliente). El profesor transcribe esos valores
// aquí (por teléfono o desde el propio Anexo ya firmado) -- no hay ningún
// acceso externo de la empresa a la app.
//
// Se apoya al completo en Motor JEG ya existente, sin dataframe nuevo: un
// único Instrumento fijo "FEOE-EMPRESA" (origen "empresa", ya contemplado en
// InstrumentoSchema desde el Ítem 12 original) con un Indicador por CE
// designado, guardado en df_calificaciones exactamente igual que cualquier
// otra nota -- calcularNotasJEG() lo pondera junto con el resto de
// Indicadores de ese CE sin necesitar ningún caso especial.
//
// El 1-4 se convierte a la escala 0-10 de forma proporcional y estricta:
// (valor-1)/3*10 -> 1=0, 2=3.3, 3=6.7, 4=10. Con esto un "2" (por debajo del
// aprobado real) no empuja la nota del RA por encima de 5, coherente con la
// propia regla del Anexo: "Superado" exige una media de las actividades
// ESTRICTAMENTE superior a 2, no un 2 raso.

const ID_INSTRUMENTO_FEOE = "FEOE-EMPRESA";
const idIndicadorFeoe = (ce_id: string) => `FEOE-${ce_id}`;

const valorA10 = (valor1a4: number) => Math.round((((valor1a4 - 1) / 3) * 10) * 10) / 10;
const valor10A1 = (valor0a10: number | null | undefined): number | null => {
  if (valor0a10 === null || valor0a10 === undefined) return null;
  return Math.round((valor0a10 / 10) * 3) + 1;
};

const getScoreOptions = (t: (key: string, opts?: any) => string) => [
  { value: 1, label: t('campos.feoe.score1', {defaultValue: '1 · Suspenso'}), color: "border-danger text-danger bg-danger/10" },
  { value: 2, label: t('campos.feoe.score2', {defaultValue: '2 · Aprobado'}), color: "border-warning text-warning bg-warning/10" },
  { value: 3, label: t('campos.feoe.score3', {defaultValue: '3 · Notable'}), color: "border-info text-info bg-info/10" },
  { value: 4, label: t('campos.feoe.score4', {defaultValue: '4 · Sobresaliente'}), color: "border-success text-success bg-success/10" },
];

export function FeoeEmpresaTab() {
  const { t } = useTranslation();
  const SCORE_OPTIONS = React.useMemo(() => getScoreOptions(t), [t]);
  const { moduleData, cursoData, updateModuleData, updateCursoData } = useAppStore();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const df_ra = moduleData?.df_ra || [];
  const df_ce = moduleData?.df_ce || [];
  const df_al = cursoData?.df_al || [];
  const df_calificaciones = cursoData?.df_calificaciones || [];
  const df_instr = moduleData?.df_instr || [];

  const activeStudents = [...df_al.filter(isAlumnoActivo)].sort(
    (a: any, b: any) => String(a.Apellidos || "").localeCompare(String(b.Apellidos || ""))
  );

  React.useEffect(() => {
    if (activeStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(activeStudents[0].ID || "");
    }
  }, [activeStudents.length]);

  const ceDesignados = df_ce.filter((ce: any) => ce.feoe === true);
  const raConDesignados = df_ra.filter((ra: any) => ceDesignados.some((ce: any) => ce.id_ra === ra.id_ra));

  const toggleFeoe = (ce_id: string) => {
    const newDfCe = df_ce.map((ce: any) => (ce.id_ce === ce_id ? { ...ce, feoe: !ce.feoe } : ce));
    updateModuleData("df_ce", newDfCe);
  };

  const ensureInstrumento = (currentInstr: any[]) => {
    if (currentInstr.some((i) => i.id_instrumento === ID_INSTRUMENTO_FEOE)) return currentInstr;
    return [
      ...currentInstr,
      {
        id_instrumento: ID_INSTRUMENTO_FEOE,
        titulo: "Evaluación del tutor de empresa (FEOE)",
        tipo: "escala_valoracion",
        escala: "discreta_4",
        evaluacion: "Ev3",
        agente: "heteroevaluacion",
        peso_global: 1,
        indicadores_vinculados: ceDesignados.map((ce: any) => idIndicadorFeoe(ce.id_ce)),
        origen: "empresa",
        procedimiento: "ordinario",
      },
    ];
  };

  const ensureIndicadores = (currentInd: any[]) => {
    let next = [...currentInd];
    ceDesignados.forEach((ce: any) => {
      const id_indicador = idIndicadorFeoe(ce.id_ce);
      if (!next.some((i) => i.id_indicador === id_indicador)) {
        next.push({ id_indicador, id_ce: ce.id_ce, descripcion: `Tutor de empresa — ${ce.desc_ce || ce.id_ce}`, peso: 1 });
      }
    });
    return next;
  };

  // Escritura pura (sin tocar el store) de una fila de df_calificaciones --
  // separada de la escritura real para poder aplicar varios CE de golpe
  // (rellenarTodo) sin que cada llamada lea el snapshot ya obsoleto del
  // anterior (el bug real: useAppStore() se desestructura una vez por
  // render, así que dos updateCursoData seguidos en el mismo evento pisan
  // el resultado del primero si cada uno parte del mismo `df_calificaciones`
  // capturado al inicio del render).
  const conCalificacion = (base: any[], al_id: string, ce_id: string, valor1a4: number | null, justificacion?: string) => {
    const id_indicador = idIndicadorFeoe(ce_id);
    const idx = base.findIndex(
      (c: any) => c.id_alumno === al_id && c.id_instrumento === ID_INSTRUMENTO_FEOE && c.id_indicador === id_indicador
    );
    const next = [...base];
    if (valor1a4 === null) {
      if (idx >= 0) next.splice(idx, 1);
      return next;
    }
    const row = {
      id_calificacion: idx >= 0 ? next[idx].id_calificacion : `${al_id}-${ID_INSTRUMENTO_FEOE}-${id_indicador}`,
      id_alumno: al_id,
      id_instrumento: ID_INSTRUMENTO_FEOE,
      id_indicador,
      valor: valorA10(valor1a4),
      justificacion: justificacion ?? (idx >= 0 ? next[idx].justificacion : undefined),
      timestamp: Date.now(),
    };
    if (idx >= 0) next[idx] = row; else next.push(row);
    return next;
  };

  const asegurarInstrumentoEIndicadores = () => {
    const df_indicadores = moduleData?.df_indicadores || [];
    const nextInstr = ensureInstrumento(df_instr);
    const nextInd = ensureIndicadores(df_indicadores);
    if (nextInstr !== df_instr) updateModuleData("df_instr", nextInstr);
    if (nextInd !== df_indicadores) updateModuleData("df_indicadores", nextInd);
  };

  const updateCalificacion = (al_id: string, ce_id: string, valor1a4: number | null, justificacion?: string) => {
    asegurarInstrumentoEIndicadores();
    updateCursoData("df_calificaciones", conCalificacion(df_calificaciones, al_id, ce_id, valor1a4, justificacion));
  };

  const getValor = (al_id: string, ce_id: string): number | null => {
    const c = df_calificaciones.find(
      (c: any) => c.id_alumno === al_id && c.id_instrumento === ID_INSTRUMENTO_FEOE && c.id_indicador === idIndicadorFeoe(ce_id)
    );
    return valor10A1(c?.valor);
  };

  const getObservaciones = (al_id: string, ce_id: string): string => {
    const c = df_calificaciones.find(
      (c: any) => c.id_alumno === al_id && c.id_instrumento === ID_INSTRUMENTO_FEOE && c.id_indicador === idIndicadorFeoe(ce_id)
    );
    return c?.justificacion || "";
  };

  const rellenarTodo = (al_id: string, valor: number) => {
    asegurarInstrumentoEIndicadores();
    let next = df_calificaciones;
    ceDesignados.forEach((ce: any) => { next = conCalificacion(next, al_id, ce.id_ce, valor); });
    updateCursoData("df_calificaciones", next);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-t-4 border-t-amber-500">
        <div className="flex items-start gap-3 mb-4">
          <Building2 className="w-6 h-6 text-amber-500 mt-1 shrink-0" />
          <div>
            <h3 className="text-subheading font-bold text-foreground">{t('campos.feoe.criteriosDesignadosTitulo', {defaultValue: 'Criterios designados para FEOE'})}</h3>
            <p className="text-muted text-body mt-1">
              {t('campos.feoe.criteriosDesignadosDesc', {defaultValue: 'Marca los CE que se evalúan en empresa (Anexo XI b) — el tutor de empresa los valora del 1 al 4 y tú transcribes el resultado más abajo, por alumno.'})}
            </p>
          </div>
        </div>
        {df_ra.length === 0 ? (
          <p className="text-body text-muted">{t('campos.feoe.sinRaCe', {defaultValue: 'No hay RA/CE cargados en este módulo todavía.'})}</p>
        ) : (
          <div className="space-y-4">
            {df_ra.map((ra: any) => {
              const cesDeRa = df_ce.filter((ce: any) => ce.id_ra === ra.id_ra);
              if (cesDeRa.length === 0) return null;
              return (
                <div key={ra.id_ra}>
                  <p className="text-caption font-semibold text-muted mb-1.5">{ra.id_ra} — {ra.desc_ra || ""}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {cesDeRa.map((ce: any) => (
                      <label key={ce.id_ce} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${ce.feoe ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                        <input
                          type="checkbox"
                          checked={!!ce.feoe}
                          onChange={() => toggleFeoe(ce.id_ce)}
                          className="rounded border-white/20 bg-transparent text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-caption">{ce.id_ce} — {ce.desc_ce || ""}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {ceDesignados.length === 0 ? (
        <Card className="p-8 text-center border-l-4 border-l-amber-500">
          <p className="text-foreground/80">{t('campos.feoe.marcaAlMenosUnCe', {defaultValue: 'Marca al menos un CE arriba para empezar a registrar valoraciones de empresa.'})}</p>
        </Card>
      ) : activeStudents.length === 0 ? (
        <Card className="p-8 text-center border-l-4 border-l-yellow-500">
          <p className="text-foreground/80">{t('campos.feoe.sinAlumnadoActivo', {defaultValue: 'No hay alumnado activo registrado en este curso.'})}</p>
        </Card>
      ) : (
        <div className="flex gap-6 min-h-[500px]">
          <div className="w-72 bg-foreground/5 border border-white/5 rounded-2xl flex flex-col overflow-hidden shrink-0">
            <div className="p-4 border-b border-white/5 bg-foreground/10">
              <div className="text-xs font-medium text-muted tracking-wider">{t('campos.feoe.alumnadoActivoCount', {count: activeStudents.length, defaultValue: 'Alumnado activo ({{count}})'})}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
              {activeStudents.map((al: any) => {
                const isSelected = al.ID === selectedStudentId;
                const hasData = ceDesignados.some((ce: any) => getValor(al.ID, ce.id_ce) !== null);
                return (
                  <button
                    key={al.ID}
                    onClick={() => setSelectedStudentId(al.ID || "")}
                    className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between ${
                      isSelected ? "bg-accent text-background font-bold shadow-md shadow-accent/15" : "text-foreground/80 hover:bg-foreground/5"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="text-sm truncate">{al.Apellidos}, {al.Nombre}</div>
                      <div className={`text-[10px] font-mono ${isSelected ? "text-background/70" : "text-muted"}`}>{al.ID}</div>
                    </div>
                    {hasData && <div className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? "bg-background/60" : "bg-amber-500/70"}`} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 bg-foreground/5 border border-white/5 rounded-2xl flex flex-col overflow-hidden">
            {selectedStudentId ? (
              <>
                <div className="p-6 border-b border-white/5 bg-foreground/10 flex flex-wrap justify-between items-center gap-3 shrink-0">
                  <h3 className="text-xl font-black text-foreground">
                    {activeStudents.find((a: any) => a.ID === selectedStudentId)?.Nombre} {activeStudents.find((a: any) => a.ID === selectedStudentId)?.Apellidos}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => rellenarTodo(selectedStudentId, 4)}
                      className="flex items-center gap-1.5 text-caption font-semibold px-3 py-1.5 rounded-full border border-success/30 text-success bg-success/10 hover:bg-success/20 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> {t('botones.feoe.excelenteTodoA4', {defaultValue: 'Excelente (todo a 4)'})}
                    </button>
                    <button
                      onClick={() => rellenarTodo(selectedStudentId, 3)}
                      className="flex items-center gap-1.5 text-caption font-semibold px-3 py-1.5 rounded-full border border-info/30 text-info bg-info/10 hover:bg-info/20 transition-colors"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> {t('botones.feoe.suficienteTodoA3', {defaultValue: 'Suficiente (todo a 3)'})}
                    </button>
                  </div>
                </div>
                <p className="px-6 pt-3 text-caption text-muted">
                  {t('campos.feoe.rellenaConBotonDesc', {defaultValue: 'Rellena con un botón y corrige a mano lo que haga falta — es solo un punto de partida, no un valor definitivo.'})}
                </p>

                <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide">
                  {raConDesignados.map((ra: any) => {
                    const cesDeRa = ceDesignados.filter((ce: any) => ce.id_ra === ra.id_ra);
                    const valores = cesDeRa.map((ce: any) => getValor(selectedStudentId, ce.id_ce)).filter((v: any) => v !== null) as number[];
                    const media = valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : null;
                    const superado = media !== null ? media > 2 : null;

                    return (
                      <div key={ra.id_ra} className="bg-background/20 border border-white/5 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="font-bold text-foreground">{ra.id_ra}</span>
                            <span className="text-caption text-muted ml-2">{ra.desc_ra || ""}</span>
                          </div>
                          {superado === null ? (
                            <span className="flex items-center gap-1.5 text-caption text-muted"><HelpCircle className="w-4 h-4" /> {t('campos.feoe.sinEvaluar', {defaultValue: 'Sin evaluar'})}</span>
                          ) : superado ? (
                            <span className="flex items-center gap-1.5 text-caption font-semibold text-success" title={t('campos.feoe.mediaSuperiorA2', {defaultValue: 'Media de las actividades > 2, según el Anexo XI b)'})}>
                              <CheckCircle2 className="w-4 h-4" /> {t('campos.feoe.superado', {defaultValue: 'Superado'})}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-caption font-semibold text-danger" title={t('campos.feoe.mediaInferiorIgualA2', {defaultValue: 'Media de las actividades ≤ 2, según el Anexo XI b)'})}>
                              <XCircle className="w-4 h-4" /> {t('campos.feoe.noSuperado', {defaultValue: 'No superado'})}
                            </span>
                          )}
                        </div>

                        <div className="space-y-3">
                          {cesDeRa.map((ce: any) => {
                            const valorActual = getValor(selectedStudentId, ce.id_ce);
                            return (
                              <div key={ce.id_ce} className="p-3 rounded-lg bg-foreground/5 border border-white/5">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                  <p className="text-body text-foreground/90 flex-1">{ce.id_ce} — {ce.desc_ce || ""}</p>
                                  <div className="flex flex-wrap gap-1.5 shrink-0">
                                    {SCORE_OPTIONS.map((opt) => (
                                      <button
                                        key={opt.value}
                                        onClick={() => updateCalificacion(selectedStudentId, ce.id_ce, opt.value)}
                                        className={`px-2.5 py-1 text-caption rounded-full border transition-colors ${
                                          valorActual === opt.value ? opt.color : "bg-transparent border-white/10 text-muted hover:border-white/30"
                                        }`}
                                      >
                                        {opt.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <input
                                  type="text"
                                  value={getObservaciones(selectedStudentId, ce.id_ce)}
                                  onChange={(e) => updateCalificacion(selectedStudentId, ce.id_ce, valorActual, e.target.value)}
                                  placeholder={t('campos.feoe.observacionesTutorPlaceholder', {defaultValue: 'Observaciones del tutor de empresa (opcional)...'})}
                                  className="w-full mt-2 bg-transparent border-b border-transparent hover:border-[var(--glass-border)] focus:border-accent focus:outline-none text-caption text-foreground/80 placeholder:text-muted/40 py-1"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-8 text-muted">
                <HelpCircle className="w-12 h-12 text-muted/50 mb-3" />
                <p className="font-semibold text-lg">{t('campos.comun.ningunAlumnadoSeleccionado', {defaultValue: 'Ningún alumnado seleccionado'})}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
