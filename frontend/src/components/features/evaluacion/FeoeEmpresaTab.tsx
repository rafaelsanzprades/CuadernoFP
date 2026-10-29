"use client";
import React from "react";
import { Building2, CheckCircle2, XCircle, HelpCircle, Sparkles, ThumbsUp, GraduationCap, FileDown } from "lucide-react";
import toast from "react-hot-toast";
import { getApiBase } from "@/services/apiBase";
import { fetchDocumento } from "@/services/generarDocumento";
import { descargarArchivo } from "@/services/descargarArchivo";
import { enrichInfoModulo } from "@/services/catalogCache";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { DEFAULT_CONFIG_REDONDEO } from "@/utils/calificaciones";
import {
  ID_INSTRUMENTO_FEOE, idIndicadorFeoe, valorA10, valor10A1, modoTutor, filaFeoe, conValoracionRa, conInforme, conPlan, mediaEscalaRa, resultadoRaTutor,
} from "@/utils/tutorEmpresa";

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
//
// Con el modo «superado» del perfil de comunidad (Datos > Reglas de redondeo), en cambio, el tutor da cada RA por «Superado» o «No
// superado» con su motivación, sin escala por criterio (RD 659/2023, art. 18.7.a); ver utils/tutorEmpresa.ts. En los dos modos hay
// además una valoración cualitativa del tutor.

const getScoreOptions = (t: (key: string, opts?: any) => string) => [
  { value: 1, label: t('campos.feoe.score1', {defaultValue: '1 · Suspenso'}), color: "border-danger text-danger bg-danger/10" },
  { value: 2, label: t('campos.feoe.score2', {defaultValue: '2 · Aprobado'}), color: "border-warning text-warning bg-warning/10" },
  { value: 3, label: t('campos.feoe.score3', {defaultValue: '3 · Notable'}), color: "border-info text-info bg-info/10" },
  { value: 4, label: t('campos.feoe.score4', {defaultValue: '4 · Sobresaliente'}), color: "border-success text-success bg-success/10" },
];

// Valoración del tutor de empresa de UN alumno/a (sección "Empresa FEOE" de
// Calificaciones > Académicas, que aporta el selector de alumnado).
export function FeoeEmpresaAlumno({ studentId }: { studentId: string }) {
  const { t } = useTranslation();
  const SCORE_OPTIONS = React.useMemo(() => getScoreOptions(t), [t]);
  const { activeModuleId, moduleData, cursoData, updateModuleData, updateCursoData } = useAppStore();
  const [generandoPlan, setGenerandoPlan] = React.useState(false);

  const df_ra = moduleData?.df_ra || [];
  const df_ce = moduleData?.df_ce || [];
  const df_calificaciones = cursoData?.df_calificaciones || [];
  const df_instr = moduleData?.df_instr || [];
  const df_feoe = cursoData?.df_feoe || [];
  const modo = modoTutor({ ...DEFAULT_CONFIG_REDONDEO, ...(moduleData?.config_redondeo || {}) });
  const filaAlumno = filaFeoe(df_feoe, studentId);

  // La designación de qué CE evalúa el tutor de empresa es la misma que
  // is_dual (FEOE) en Currículo › Relación RA <- CE -- antes había aquí un checkbox
  // propio (campo "feoe") que duplicaba esa selección sin enterarse de ella;
  // se unificaron el 2026-09-20 a petición de Rafael.
  const ceDesignados = df_ce.filter((ce: any) => ce.is_dual === true);
  const raConDesignados = df_ra.filter((ra: any) => ceDesignados.some((ce: any) => ce.id_ra === ra.id_ra));

  const plan = filaAlumno.plan || {};

  const descargarPlan = async (formato: "pdf" | "docx") => {
    setGenerandoPlan(true);
    try {
      const url = `${getApiBase()}/api/pdf?type=plan_formacion&al_id=${studentId}&file_format=${formato}`;
      const response = await fetchDocumento(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curso_data: cursoData || {}, module_data: moduleData ? { ...moduleData, info_modulo: enrichInfoModulo(activeModuleId, moduleData.info_modulo) } : {} }),
      });
      if (!response.ok) throw new Error("Error generando el plan");
      await descargarArchivo(await response.blob(), `Plan_formacion_${studentId}.${formato}`);
    } catch (err) {
      console.error(err);
      toast.error(t('toasts.feoe.errorPlanFormacion', {defaultValue: "Error al generar el plan de formación."}));
    } finally {
      setGenerandoPlan(false);
    }
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

  const setResultado = (al_id: string, id_ra: string, resultado: "superado" | "no_superado") =>
    updateCursoData("df_feoe", conValoracionRa(df_feoe, al_id, id_ra, { resultado }));
  const setMotivacion = (al_id: string, id_ra: string, motivacion: string) =>
    updateCursoData("df_feoe", conValoracionRa(df_feoe, al_id, id_ra, { motivacion }));
  const todoSuperado = (al_id: string) => {
    let next = df_feoe;
    raConDesignados.forEach((ra: any) => { next = conValoracionRa(next, al_id, ra.id_ra, { resultado: "superado" }); });
    updateCursoData("df_feoe", next);
  };

  if (ceDesignados.length === 0) {
    return (
        <Card className="p-8 text-center border-l-4 border-l-amber-500">
          <p className="text-foreground/80">{t('campos.feoe.marcaAlMenosUnCe', {defaultValue: 'Este módulo no está dualizado: marca al menos un CE como FEOE en Currículo › Relación RA <- CE para empezar a registrar valoraciones de empresa.'})}</p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Link href="/curriculo?tab=relacion-ra-ce">
              <Button variant="secondary" className="gap-2">
                <GraduationCap className="w-4 h-4" /> {t('botones.feoe.gestionarEnCurriculo', {defaultValue: 'Gestionar en Currículo'})}
              </Button>
            </Link>
            <Link href="/contexto?tab=entorno">
              <Button variant="secondary" className="gap-2">
                <Building2 className="w-4 h-4" /> {t('botones.feoe.configurarEnPlanFeoe', {defaultValue: 'Configurar horas y régimen de la FEOE'})}
              </Button>
            </Link>
          </div>
        </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-caption text-muted flex-1 min-w-[240px]">
          {modo === "superado"
            ? t('campos.feoe.modoSuperadoDesc', {defaultValue: 'Anota para cada RA si el tutor de empresa lo da por «Superado» o «No superado». Si no lo supera, escribe el motivo.'})
            : t('campos.feoe.rellenaConBotonDesc', {defaultValue: 'Rellena con un botón y corrige a mano lo que haga falta — es solo un punto de partida, no un valor definitivo.'})}
        </p>
                  {modo === "superado" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => todoSuperado(studentId)}
                        className="flex items-center gap-1.5 text-caption font-semibold px-3 py-1.5 rounded-full border border-success/30 text-success bg-success/10 hover:bg-success/20 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t('botones.feoe.todoSuperado', {defaultValue: 'Todos los RA superados'})}
                      </button>
                    </div>
                  ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => rellenarTodo(studentId, 4)}
                      className="flex items-center gap-1.5 text-caption font-semibold px-3 py-1.5 rounded-full border border-success/30 text-success bg-success/10 hover:bg-success/20 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> {t('botones.feoe.excelenteTodoA4', {defaultValue: 'Excelente (todo a 4)'})}
                    </button>
                    <button
                      onClick={() => rellenarTodo(studentId, 3)}
                      className="flex items-center gap-1.5 text-caption font-semibold px-3 py-1.5 rounded-full border border-info/30 text-info bg-info/10 hover:bg-info/20 transition-colors"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> {t('botones.feoe.suficienteTodoA3', {defaultValue: 'Suficiente (todo a 3)'})}
                    </button>
                  </div>
                  )}
      </div>
                  {raConDesignados.map((ra: any) => {
                    const cesDeRa = ceDesignados.filter((ce: any) => ce.id_ra === ra.id_ra);
                    const media = mediaEscalaRa(df_calificaciones, cesDeRa, studentId);
                    const resultado = resultadoRaTutor(modo, filaAlumno, ra.id_ra, media);
                    const superado = resultado === null ? null : resultado === "superado";
                    const motivacion = filaAlumno.ra?.[ra.id_ra]?.motivacion || "";

                    return (
                      <div key={ra.id_ra} className="bg-background/20 border border-white/5 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="font-bold text-foreground">{ra.id_ra}</span>
                            <span className="text-caption text-muted ml-2">{ra.desc_ra || ""}</span>
                          </div>
                          {modo === "superado" ? (
                            <div className="flex gap-1.5 shrink-0" role="group" aria-label={t('campos.feoe.resultadoDelRa', {defaultValue: 'Resultado del tutor de empresa para este RA'})}>
                              <button
                                onClick={() => setResultado(studentId, ra.id_ra, "superado")}
                                aria-pressed={resultado === "superado"}
                                className={`flex items-center gap-1.5 px-3 py-1 text-caption font-semibold rounded-full border transition-colors ${
                                  resultado === "superado" ? "border-success text-success bg-success/10" : "bg-transparent border-white/10 text-muted hover:border-white/30"
                                }`}
                              >
                                <CheckCircle2 className="w-4 h-4" /> {t('campos.feoe.superado', {defaultValue: 'Superado'})}
                              </button>
                              <button
                                onClick={() => setResultado(studentId, ra.id_ra, "no_superado")}
                                aria-pressed={resultado === "no_superado"}
                                className={`flex items-center gap-1.5 px-3 py-1 text-caption font-semibold rounded-full border transition-colors ${
                                  resultado === "no_superado" ? "border-danger text-danger bg-danger/10" : "bg-transparent border-white/10 text-muted hover:border-white/30"
                                }`}
                              >
                                <XCircle className="w-4 h-4" /> {t('campos.feoe.noSuperado', {defaultValue: 'No superado'})}
                              </button>
                            </div>
                          ) : superado === null ? (
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

                        {resultado === "no_superado" && (
                          <div className="mb-4">
                            <input
                              type="text"
                              value={motivacion}
                              onChange={(e) => setMotivacion(studentId, ra.id_ra, e.target.value)}
                              placeholder={t('campos.feoe.motivacionPlaceholder', {defaultValue: 'Motivo por el que no se supera (obligatorio)…'})}
                              aria-label={t('campos.feoe.motivacionPlaceholder', {defaultValue: 'Motivo por el que no se supera (obligatorio)…'})}
                              aria-invalid={motivacion.trim() === ""}
                              className={`w-full bg-transparent border-b text-body text-foreground placeholder:text-muted/50 py-1 focus:outline-none ${
                                motivacion.trim() === "" ? "border-danger/60 focus:border-danger" : "border-[var(--glass-border)] focus:border-accent"
                              }`}
                            />
                            {motivacion.trim() === "" && (
                              <p className="text-caption text-danger mt-1">{t('campos.feoe.motivacionFalta', {defaultValue: 'Falta el motivo: la norma pide motivar cada «No superado».'})}</p>
                            )}
                          </div>
                        )}

                        <div className="space-y-3">
                          {cesDeRa.map((ce: any) => {
                            const valorActual = getValor(studentId, ce.id_ce);
                            if (modo === "superado") {
                              return (
                                <p key={ce.id_ce} className="text-body text-foreground/80 px-1">{ce.id_ce} — {ce.desc_ce || ""}</p>
                              );
                            }
                            return (
                              <div key={ce.id_ce} className="p-3 rounded-lg bg-foreground/5 border border-white/5">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                  <p className="text-body text-foreground/90 flex-1">{ce.id_ce} — {ce.desc_ce || ""}</p>
                                  <div className="flex flex-wrap gap-1.5 shrink-0">
                                    {SCORE_OPTIONS.map((opt) => (
                                      <button
                                        key={opt.value}
                                        onClick={() => updateCalificacion(studentId, ce.id_ce, opt.value)}
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
                                  value={getObservaciones(studentId, ce.id_ce)}
                                  onChange={(e) => updateCalificacion(studentId, ce.id_ce, valorActual, e.target.value)}
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

      <div className="bg-background/20 border border-white/5 rounded-xl p-5 space-y-3">
        <h4 className="font-bold text-foreground">{t('campos.feoe.planTitulo', {defaultValue: 'Plan de formación individual'})}</h4>
        <p className="text-caption text-muted">{t('campos.feoe.planDesc', {defaultValue: 'Datos de la empresa y actividades previstas para cada RA. Con ellos se genera el documento del plan, con los RA y criterios designados para la empresa (Currículo › Relación RA ← CE).'})}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {([
            ["empresa", t('campos.feoe.planEmpresa', {defaultValue: 'Empresa'}), "text"],
            ["tutor_empresa", t('campos.feoe.planTutorEmpresa', {defaultValue: 'Tutor/a de la empresa'}), "text"],
            ["tutor_docente", t('campos.feoe.planTutorDocente', {defaultValue: 'Tutor/a del centro'}), "text"],
            ["horas", t('campos.feoe.planHoras', {defaultValue: 'Horas'}), "number"],
            ["inicio", t('campos.feoe.planInicio', {defaultValue: 'Inicio'}), "date"],
            ["fin", t('campos.feoe.planFin', {defaultValue: 'Fin'}), "date"],
          ] as const).map(([campo, etiqueta, tipo]) => (
            <label key={campo} className="text-caption text-muted font-bold block">
              {etiqueta}
              <input
                type={tipo}
                value={(plan as any)[campo] ?? ""}
                onChange={(e) => updateCursoData("df_feoe", conPlan(df_feoe, studentId, { [campo]: e.target.value }))}
                className="mt-1 w-full bg-background/50 border border-[var(--glass-border)] rounded px-3 py-2 text-body text-foreground font-normal focus:border-accent focus:outline-none"
              />
            </label>
          ))}
        </div>
        {raConDesignados.map((ra: any) => (
          <label key={ra.id_ra} className="text-caption text-muted font-bold block">
            {t('campos.feoe.planActividades', {defaultValue: 'Actividades previstas en la empresa — {{ra}}', ra: ra.id_ra})}
            <textarea
              rows={2}
              value={plan.actividades?.[ra.id_ra] ?? ""}
              onChange={(e) => updateCursoData("df_feoe", conPlan(df_feoe, studentId, {}, { id_ra: ra.id_ra, texto: e.target.value }))}
              className="mt-1 w-full bg-background/50 border border-[var(--glass-border)] rounded px-3 py-2 text-body text-foreground font-normal focus:border-accent focus:outline-none"
            />
          </label>
        ))}
        <div className="flex gap-2">
          <Button onClick={() => descargarPlan("pdf")} disabled={generandoPlan} className="text-caption gap-2">
            <FileDown className="w-3.5 h-3.5" /> {generandoPlan ? t('common.generando', {defaultValue: 'Generando...'}) : t('botones.feoe.planPdf', {defaultValue: 'Plan .pdf'})}
          </Button>
          <Button variant="secondary" onClick={() => descargarPlan("docx")} disabled={generandoPlan} className="text-caption gap-2">
            <FileDown className="w-3.5 h-3.5" /> {t('botones.feoe.planDocx', {defaultValue: 'Plan editable .docx'})}
          </Button>
        </div>
      </div>

      <div className="bg-background/20 border border-white/5 rounded-xl p-5">
        <label className="font-bold text-foreground block mb-1" htmlFor={`informe-tutor-${studentId}`}>
          {t('campos.feoe.informeCualitativo', {defaultValue: 'Valoración cualitativa del tutor de empresa'})}
        </label>
        <p className="text-caption text-muted mb-2">{t('campos.feoe.informeCualitativoDesc', {defaultValue: 'Adaptación a la empresa, iniciativa, trabajo en equipo, comunicación… Es el informe cualitativo que acompaña a la valoración de los RA.'})}</p>
        <textarea
          id={`informe-tutor-${studentId}`}
          value={filaAlumno.informe || ""}
          onChange={(e) => updateCursoData("df_feoe", conInforme(df_feoe, studentId, e.target.value))}
          rows={3}
          className="w-full bg-background/50 border border-[var(--glass-border)] rounded px-3 py-2 text-body text-foreground focus:border-accent focus:outline-none"
        />
      </div>
    </div>
  );
}
