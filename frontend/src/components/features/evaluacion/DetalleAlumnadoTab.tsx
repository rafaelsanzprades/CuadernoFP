"use client";
import React, { useState } from "react";
import { BarChart, Target, ClipboardList, FileDown, BookMarked, Building2 } from "lucide-react";
import { PanelPorAlumno, SeccionAcordeon } from "@/components/features/alumnado/PanelPorAlumno";
import { FeoeEmpresaAlumno } from "./FeoeEmpresaTab";
import { rasNoSuperadosTutor } from "@/utils/tutorEmpresa";
import { estadosDisponibles, maxConvocatorias, NOMBRE_ESTADO_ACTA, siglaEstado, convocatoriasUsadas, estadoActa } from "@/utils/estadosActa";
import { getSimulatedToday } from "@/utils/planningGenerator";
import { CalificarConRubricaModal } from "./CalificarConRubricaModal";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { useAppStore } from "@/store/useAppStore";
import { resolveDescRa, enrichInfoModulo } from "@/services/catalogCache";
import { useDynamicPlanning } from "@/hooks/useDynamicPlanning";
import { isAlumnoActivo } from "@/utils/alumnado";
import { calcularNotasJEG, getSigadInfo, notaActa, DEFAULT_CONFIG_REDONDEO, setCalificacionAuto, filtrarPorGev } from "@/utils/calificaciones";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { getApiBase } from "@/services/apiBase";
import { fetchDocumento } from "@/services/generarDocumento";
import { descargarArchivo } from "@/services/descargarArchivo";

export function DetalleAlumnadoTab() {
  const { activeModuleId, moduleData, cursoData, updateCursoData, dataSource } = useAppStore();
  const { t } = useTranslation();
  const { planningLedgerDmy } = useDynamicPlanning();

  const [activeTabByStudent, setActiveTabByStudent] = useState<Record<string, string>>({});

  const df_al = cursoData?.df_al || [];
  const df_eval = cursoData?.df_eval || [];
  const historial_calificaciones = cursoData?.historial_calificaciones || [];
  const [generandoInforme, setGenerandoInforme] = useState<string | null>(null);
  const df_act = moduleData?.df_act || [];
  const df_rubricas = moduleData?.df_rubricas || [];
  const [rubricaModal, setRubricaModal] = useState<{ al_id: string; act_id: string; act: any; alumnoNombre: string } | null>(null);
  const df_ce = moduleData?.df_ce || [];
  const df_ra = moduleData?.df_ra || [];
  const df_ud = moduleData?.df_ud || [];
  const df_pr = moduleData?.df_pr || [];
  // Motor JEG, modo automático (Ítem 42, punto 6) -- ver sincronizarIndicadorAuto()
  // en utils/calificaciones.ts. df_instr/df_indicadores viven en moduleData (config,
  // igual que df_act); df_calificaciones vive en cursoData (datos, igual que df_eval).
  const df_instr = moduleData?.df_instr || [];
  const df_indicadores = moduleData?.df_indicadores || [];
  const df_calificaciones = cursoData?.df_calificaciones || [];
  const df_feoe = cursoData?.df_feoe || [];
  const info_fechas = cursoData?.info_fechas || {};
  // Trimestre en curso (en DEMO, el de la fecha simulada): es el que se abre por
  // defecto en las notas de cada alumno/a. Si hoy cae entre trimestres, el
  // siguiente que empiece; pasado el último, el 3T.
  const trimestreActual = (() => {
    const hoy = dataSource === "demo" && cursoData ? getSimulatedToday(cursoData) : new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    const iso = `${hoy.getFullYear()}-${p(hoy.getMonth() + 1)}-${p(hoy.getDate())}`;
    for (const n of [1, 2, 3]) {
      const fin = String(info_fechas[`fin_${n}t`] || "").slice(0, 10);
      if (fin && iso <= fin) return `${n}T`;
    }
    return "3T";
  })();
  const planning_ledger = planningLedgerDmy || {}; // claves dd/mm/aaaa

  const df_evaluable = [...df_al].filter(isAlumnoActivo);
  df_evaluable.sort((a: any, b: any) => String(a.Apellidos || "").localeCompare(String(b.Apellidos || "")));

  const acts_by_tri: Record<string, any[]> = { "1T": [], "2T": [], "3T": [] };
  df_act.forEach((act: any) => {
    if (act.id_act && String(act.id_act).trim() !== "") {
      const tri = act.tri_act || "1T";
      if (acts_by_tri[tri]) acts_by_tri[tri].push(act);
    }
  });

  const config_redondeo = { ...DEFAULT_CONFIG_REDONDEO, ...(moduleData?.config_redondeo || {}) };

  // Registro append-only de cada cambio de nota (ítem 33) -- respaldo ante una
  // reclamación futura (ítem 34), independiente del undo/redo de sesión
  // (zundo), que se pierde al recargar. Sin límite ni purga (monousuario).
  const pushHistorial = (al_id: string, campo: string, valor_anterior: number | string | null, valor_nuevo: number | string | null) => {
    if (valor_anterior === valor_nuevo) return;
    const entry = {
      fecha: new Date().toISOString(),
      alumno_id: al_id,
      campo,
      valor_anterior,
      valor_nuevo,
    };
    updateCursoData("historial_calificaciones", [...historial_calificaciones, entry]);
  };

  const handleUpdateActNota = (al_id: string, act_id: string, val: number) => {
    const newEval = [...df_eval];
    let evRowIdx = newEval.findIndex(e => e.ID === al_id);

    if (evRowIdx === -1) {
      newEval.push({ ID: al_id, Nota_Final_FO: 0 });
      evRowIdx = newEval.length - 1;
    }

    const valorAnterior = newEval[evRowIdx][act_id] ?? null;
    newEval[evRowIdx][act_id] = val;

    // Motor JEG, modo automático (Ítem 42, punto 6): la misma nota se replica
    // como Calificación en cada Indicador auto-generado (uno por CE que evalúa
    // esta actividad, creado ya en instrumentos/page.tsx al marcar la casilla).
    const act = df_act.find((a: any) => a.id_act === act_id);
    let newCal = df_calificaciones;
    if (act) {
      df_ce.forEach((ce: any) => {
        if (act[ce.id_ce] === true) {
          newCal = setCalificacionAuto(newCal, al_id, act_id, `${act_id}-${ce.id_ce}`, val);
        }
      });
    }

    const { nota_final } = calcularNotasJEG(al_id, filtrarPorGev(newCal, df_instr, df_al.find((a: any) => a.ID === al_id)?.gev), df_indicadores, df_instr, df_ce, df_ra, config_redondeo);
    // Nota final oficial (FO): entera de 1 a 10 con la regla de redondeo elegida, o con 1 decimal si el centro lo admite
    // (Datos > Reglas de redondeo). El cálculo interno (calcularNotasJEG, notas_ra, notas_ce) conserva toda su precisión;
    // esto solo fija el valor que se guarda como nota de acta.
    let nf = notaActa(nota_final, config_redondeo);
    // Si el tutor de empresa no ha dado por superado algún RA, la nota de acta no puede ser positiva (RD 659/2023, art. 18.7.a;
    // Asturias lo exige expresamente): se queda en el máximo suspenso, que el docente puede cambiar a mano.
    if (nf !== null && nf >= config_redondeo.nota_aprobado && rasNoSuperadosTutor(config_redondeo, df_feoe, newCal, df_ce, al_id).length > 0) {
      nf = config_redondeo.decimales_acta === 1 ? Number((config_redondeo.nota_aprobado - 0.1).toFixed(1)) : Math.ceil(config_redondeo.nota_aprobado) - 1;
    }
    newEval[evRowIdx]["Nota_Final_FO"] = nf !== null ? nf : 0;

    updateCursoData("df_eval", newEval);
    updateCursoData("df_calificaciones", newCal);
    pushHistorial(al_id, act_id, valorAnterior, val);
  };

  // Una nota escrita a mano en el acta se ajusta a los decimales elegidos (entera, o 1 decimal)
  const decimalesActa = config_redondeo.decimales_acta === 1 ? 1 : 0;
  const ajustaActa = (v: number) => (v > 0 ? (decimalesActa === 1 ? Number(v.toFixed(1)) : Math.round(v)) : v);

  const handleOverrideNotaFinalFO = (al_id: string, rawVal: number) => {
    const val = ajustaActa(rawVal);
    const newEval = [...df_eval];
    let evRowIdx = newEval.findIndex(e => e.ID === al_id);
    if (evRowIdx === -1) {
      newEval.push({ ID: al_id, Nota_Final_FO: 0 });
      evRowIdx = newEval.length - 1;
    }
    const valorAnterior = newEval[evRowIdx]["Nota_Final_FO"] ?? null;
    newEval[evRowIdx]["Nota_Final_FO"] = val;
    updateCursoData("df_eval", newEval);
    pushHistorial(al_id, "Nota_Final_FO", valorAnterior, val);
  };

  const handleOverrideNotaFinalFE = (al_id: string, rawVal: number) => {
    const val = ajustaActa(rawVal);
    const newEval = [...df_eval];
    let evRowIdx = newEval.findIndex(e => e.ID === al_id);
    if (evRowIdx === -1) {
      newEval.push({ ID: al_id, Nota_Final_FE: 0 });
      evRowIdx = newEval.length - 1;
    }
    const valorAnterior = newEval[evRowIdx]["Nota_Final_FE"] ?? null;
    newEval[evRowIdx]["Nota_Final_FE"] = val;
    updateCursoData("df_eval", newEval);
    pushHistorial(al_id, "Nota_Final_FE", valorAnterior, val);
  };

  // Estado del alumno/a en el acta (No evaluado, No presentado, Exento, Convalidado, FE pendiente); "" = calificado.
  const handleEstadoActa = (al_id: string, val: string) => {
    const newEval = [...df_eval];
    let evRowIdx = newEval.findIndex(e => e.ID === al_id);
    if (evRowIdx === -1) {
      newEval.push({ ID: al_id, Nota_Final_FO: 0 });
      evRowIdx = newEval.length - 1;
    }
    const valorAnterior = newEval[evRowIdx]["Estado_Acta"] ?? null;
    newEval[evRowIdx] = { ...newEval[evRowIdx] };
    if (val === "") delete newEval[evRowIdx]["Estado_Acta"]; else newEval[evRowIdx]["Estado_Acta"] = val;
    updateCursoData("df_eval", newEval);
    pushHistorial(al_id, "Estado_Acta", valorAnterior, val === "" ? null : val);
  };

  // Datos libres del alumno/a en el acta: Convocatorias_Previas (número) y Estado_Motivo (resolución de exención o convalidación).
  const handleCampoActa = (al_id: string, campo: "Convocatorias_Previas" | "Estado_Motivo", val: number | string | null) => {
    const newEval = [...df_eval];
    let evRowIdx = newEval.findIndex(e => e.ID === al_id);
    if (evRowIdx === -1) {
      newEval.push({ ID: al_id, Nota_Final_FO: 0 });
      evRowIdx = newEval.length - 1;
    }
    const valorAnterior = newEval[evRowIdx][campo] ?? null;
    newEval[evRowIdx] = { ...newEval[evRowIdx] };
    if (val === null || val === "") delete newEval[evRowIdx][campo]; else newEval[evRowIdx][campo] = val;
    updateCursoData("df_eval", newEval);
    if (campo === "Convocatorias_Previas") pushHistorial(al_id, campo, valorAnterior, val === "" ? null : val);
  };

  // El Sigad se calcula solo a partir de la Nota_Final_FO (getSigadInfo), pero
  // Rafael quiere poder subirlo/bajarlo a mano sin tocar la nota numérica —
  // Sigad_Override guarda ese entero 1-10 y, si existe, manda sobre el cálculo.
  const handleOverrideSigad = (al_id: string, val: number | null) => {
    const newEval = [...df_eval];
    let evRowIdx = newEval.findIndex(e => e.ID === al_id);
    if (evRowIdx === -1) {
      newEval.push({ ID: al_id, Nota_Final_FO: 0 });
      evRowIdx = newEval.length - 1;
    }
    const valorAnterior = newEval[evRowIdx]["Sigad_Override"] ?? null;
    if (val === null) {
      delete newEval[evRowIdx]["Sigad_Override"];
    } else {
      newEval[evRowIdx]["Sigad_Override"] = val;
    }
    updateCursoData("df_eval", newEval);
    pushHistorial(al_id, "Sigad_Override", valorAnterior, val);
  };

  const handleGenerarInformeRefuerzo = async (al_id: string) => {
    setGenerandoInforme(al_id);
    try {
      const url = `${getApiBase()}/api/pdf?type=refuerzo_alumno&al_id=${al_id}&file_format=docx`;
      const response = await fetchDocumento(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curso_data: cursoData || {}, module_data: moduleData ? { ...moduleData, info_modulo: enrichInfoModulo(activeModuleId, moduleData.info_modulo) } : {} }),
      });
      if (!response.ok) throw new Error("Error generando el informe");
      const blob = await response.blob();
      await descargarArchivo(blob, `Refuerzo_${al_id}.docx`);
    } catch (err) {
      console.error(err);
      toast.error(t('toasts.detalleAlumnado.errorInformeRefuerzo', {defaultValue: "Error al generar el informe de refuerzo."}));
    } finally {
      setGenerandoInforme(null);
    }
  };

  // LÓGICA DE PROYECCIÓN DE TRIMESTRES PARA CADA RA
  const uds_por_tri: Record<string, Set<string>> = { "1T": new Set(), "2T": new Set(), "3T": new Set() };

  const mapTrimestre = (ini_key: string, fin_key: string, t_key: string) => {
    const ini_str = info_fechas[ini_key];
    const fin_str = info_fechas[fin_key];
    if (!ini_str || !fin_str) return;

    const ini = new Date(ini_str);
    const fin = new Date(fin_str);
    let curr = new Date(ini);

    while (curr <= fin) {
      const dateStr = curr.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const uds = planning_ledger[dateStr] || [];
      uds.forEach((ud: string) => uds_por_tri[t_key].add(ud));
      curr.setDate(curr.getDate() + 1);
    }
  };

  mapTrimestre("ini_1t", "fin_1t", "1T");
  mapTrimestre("ini_2t", "fin_2t", "2T");
  mapTrimestre("ini_3t", "fin_3t", "3T");

  const ra_to_tri: Record<string, any> = {};
  const ra_info: Record<string, any> = {};

  df_ra.forEach((ra: any) => {
    const ra_id = String(ra.id_ra);
    ra_info[ra_id] = {
      pond: Number(ra.peso_ra) || 0,
      desc: resolveDescRa(activeModuleId, ra)
    };

    const tris_found = new Set<string>();
    const uds_found: string[] = [];
    const prs_found: string[] = [];

    df_ud.forEach((ud: any) => {
      if (Number(ud[ra_id]) > 0) {
        const uid = String(ud.id_ud);
        uds_found.push(uid);
        ["1T", "2T", "3T"].forEach(t => {
          if (uds_por_tri[t].has(uid)) tris_found.add(t);
        });
      }
    });

    df_pr.forEach((pr: any) => {
      if (Number(pr[ra_id]) > 0) {
        prs_found.push(String(pr.ID));
      }
    });

    ra_to_tri[ra_id] = {
      tris: tris_found.size > 0 ? Array.from(tris_found) : ["1T", "2T", "3T"],
      uds: uds_found,
      prs: prs_found
    };
  });

  // Contenido de la sección "Notas" de UN alumno/a (el selector de alumnado
  // lo aporta PanelPorAlumno).
  const renderNotas = (al: any) => {
          const al_id = al.ID;
          const evRow = df_eval.find((e: any) => e.ID === al_id) || { ID: al_id, Nota_Final_FO: 0, Nota_Final_FE: 0 };

          const nota_prev = Number(evRow.Nota_Final_FO) || 0;
          const nota_prev_fe = Number(evRow.Nota_Final_FE) || 0;
          // getSigadInfo() traza el mismo umbral 1-10 tanto para una nota 0-10 como
          // para el entero Sigad directamente (5→SU, 6→BI, 7-8→NT, 9-10→SB, <5→IN),
          // así que reutilizamos la función también para el override manual.
          const sigadOverride = evRow.Sigad_Override;
          const sigad = sigadOverride != null ? getSigadInfo(Number(sigadOverride)) : getSigadInfo(nota_prev);
          const estadoDelActa = estadoActa(evRow);
          const activeStudentTab = activeTabByStudent[al_id] || trimestreActual;

          // Motor JEG, modo automático (Indicador->CE->RA->Módulo, Ítem 42 punto 6, ver
          // utils/calificaciones.ts). Con el peso repartido igual entre indicadores
          // (sincronizarIndicadorAuto), el resultado es una media simple por CE.
          const notasCalc = calcularNotasJEG(al_id, filtrarPorGev(df_calificaciones, df_instr, al.gev), df_indicadores, df_instr, df_ce, df_ra, config_redondeo);

          const resultados_ra: any[] = [];

          Object.keys(ra_info).forEach(ra_id => {
            const info = ra_info[ra_id];
            const r_data = ra_to_tri[ra_id];
            const nota_ra = notasCalc.notas_ra[ra_id] ?? null;
            // Tope de compensables (Decisión B), trasladado a Motor JEG el 2026-09-10
            // (Ítem 42 punto 6) -- solo se aplica a la vía ordinaria.
            const topeActivo = notasCalc.ra_tope_activo[ra_id] || false;

            // Grado de consecución en %: la nota 0-10 del RA x 10 (un 5 = 50%, el
            // aprobado), igual que Progreso RA-UD. Antes era nota/5, y cualquier RA
            // aprobado salía al 100% sin distinguir un 5 de un 10.
            const prop = nota_ra === null ? 0 : Math.min(100.0, Math.max(0.0, nota_ra * 10));

            resultados_ra.push({
              id: ra_id, desc: info.desc, pond: info.pond, prop, nota: nota_ra, topeActivo,
              tris: r_data.tris, uds: r_data.uds, prs: r_data.prs
            });
          });

    return (
      <div className="space-y-4">

                      {/* BLOQUE 1: Detalle de calificaciones por instrumento */}
                      <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1">
                          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                            <span><span className="inline-flex"><BarChart className="w-[1.2em] h-[1.2em] mr-1" /></span></span> {t('campos.evaluacion.detalleCalificacionesInstrumentoTitulo', {defaultValue: 'Detalle de calificaciones por instrumento'})}
                          </h3>
                          <div onClick={(e) => e.stopPropagation()}>
                            <Tabs value={activeStudentTab} onValueChange={(val) => setActiveTabByStudent(prev => ({ ...prev, [al_id]: val }))}>
                              <TabsList className="mb-4 max-w-full">
                                {["1T", "2T", "3T"].map(tri => (
                                  <TabsTrigger key={tri} value={tri}>
                                    {tri === "1T" ? t('campos.evaluacion.primerTrimestre', {defaultValue: '1º trimestre'}) : tri === "2T" ? t('campos.evaluacion.segundoTrimestre', {defaultValue: '2º trimestre'}) : t('campos.evaluacion.tercerTrimestre', {defaultValue: '3º trimestre'})}
                                  </TabsTrigger>
                                ))}
                              </TabsList>
                            </Tabs>
                          </div>
                          <div className="space-y-4">
                            {acts_by_tri[activeStudentTab].length === 0 ? (
                              <div className="text-muted text-body italic">{t('campos.evaluacion.sinActividadesTrimestre', {defaultValue: 'No hay actividades evaluables definidas para este trimestre.'})}</div>
                            ) : (
                              acts_by_tri[activeStudentTab].map(act => {
                                const act_id = act.id_act;
                                const val = Number(evRow[act_id]) || 0;
                                return (
                                  <div key={act_id} className="flex items-center justify-between gap-4">
                                    <label className="text-body text-foreground/85 flex-1 truncate" title={act.desc_act}>
                                      <span className="text-muted font-medium text-caption tracking-wider bg-foreground/5 border border-white/5 px-2 py-0.5 rounded-md mr-2">
                                        {act.Tipo || t('campos.evaluacion.actividadAbrev', {defaultValue: 'Act'})}
                                      </span>
                                      {act.desc_act || act_id}
                                    </label>
                                    <div className="flex items-center gap-1.5">
                                      {act.rubrica_id && df_rubricas.some((r: any) => r.id_rubrica === act.rubrica_id) && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setRubricaModal({ al_id, act_id, act, alumnoNombre: `${al.Apellidos || ""}, ${al.Nombre || ""}` });
                                          }}
                                          title={t('tooltips.evaluacion.calificarConRubrica', { defaultValue: 'Calificar con rúbrica' })}
                                          className="p-1.5 rounded text-indigo-400 hover:bg-white/10 transition-colors"
                                        >
                                          <BookMarked className="w-4 h-4" />
                                        </button>
                                      )}
                                      <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        value={val || ""}
                                        onChange={(e) => handleUpdateActNota(al_id, act_id, Number(e.target.value) || 0)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-20 bg-background/50 border border-[var(--glass-border)] rounded px-3 py-1.5 text-foreground focus:border-info focus:outline-none font-mono text-center text-body font-semibold"
                                      />
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* Right: Overrides & Official Badge */}
                        <div className="w-full lg:w-72 flex flex-col justify-between">
                          <div>
                            {(() => {
                              const noSuperados = rasNoSuperadosTutor(config_redondeo, df_feoe, df_calificaciones, df_ce, al_id);
                              if (noSuperados.length === 0) return null;
                              return (
                                <div role="alert" className="mb-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-caption text-danger">
                                  {t('campos.evaluacion.tutorNoSuperadoAviso', {defaultValue: 'El tutor de empresa no ha dado por superado: {{ras}}. Con esa valoración la nota de acta no debería ser positiva.', ras: noSuperados.join(", ")})}
                                </div>
                              );
                            })()}
                            <h4 className="font-bold text-foreground mb-4">{t('campos.evaluacion.calificacionActaTitulo', {defaultValue: 'Calificación de acta'})}</h4>
                            <div className="mb-4">
                              <label htmlFor={`estado-acta-${al_id}`} className="text-caption text-muted tracking-wider mb-1.5 block font-bold">{t('campos.evaluacion.estadoActaLabel', {defaultValue: 'Estado en el acta'})}</label>
                              <select
                                id={`estado-acta-${al_id}`}
                                value={estadoDelActa || ""}
                                onChange={(e) => handleEstadoActa(al_id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-background/50 border border-[var(--glass-border)] rounded px-3 py-2 text-body text-foreground focus:border-info focus:outline-none"
                              >
                                <option value="">{t('campos.evaluacion.estadoActaCalificado', {defaultValue: 'Calificado (nota numérica)'})}</option>
                                {estadosDisponibles(config_redondeo.perfil_comunidad).map((e) => (
                                  <option key={e} value={e}>{siglaEstado(e, config_redondeo.perfil_comunidad)} — {t(`campos.evaluacion.estadoActa_${e}`, {defaultValue: NOMBRE_ESTADO_ACTA[e]})}</option>
                                ))}
                              </select>
                              {(estadoDelActa === "EX" || estadoDelActa === "CV") && (
                                <input
                                  type="text"
                                  value={evRow.Estado_Motivo || ""}
                                  onChange={(e) => handleCampoActa(al_id, "Estado_Motivo", e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  placeholder={t('campos.evaluacion.estadoMotivoPlaceholder', {defaultValue: 'Resolución o motivo (n.º, fecha)…'})}
                                  aria-label={t('campos.evaluacion.estadoMotivoPlaceholder', {defaultValue: 'Resolución o motivo (n.º, fecha)…'})}
                                  className="w-full mt-2 bg-background/50 border border-[var(--glass-border)] rounded px-3 py-2 text-body text-foreground focus:border-info focus:outline-none"
                                />
                              )}
                              {estadoDelActa && (
                                <p className="text-caption text-muted mt-1">{t('campos.evaluacion.estadoActaAviso', {defaultValue: 'En el acta, el boletín grupal y MagIA se muestra la sigla en lugar de la nota.'})}</p>
                              )}
                            </div>
                            {(() => {
                              const usadas = convocatoriasUsadas(evRow, config_redondeo.perfil_comunidad);
                              const maxConv = maxConvocatorias(config_redondeo);
                              return (
                                <div className="mb-4">
                                  <label htmlFor={`conv-previas-${al_id}`} className="text-caption text-muted tracking-wider mb-1.5 block font-bold">{t('campos.evaluacion.convocatoriasPreviasLabel', {defaultValue: 'Convocatorias de cursos anteriores'})}</label>
                                  <input
                                    id={`conv-previas-${al_id}`}
                                    type="number"
                                    min="0" step="1"
                                    value={evRow.Convocatorias_Previas ?? ""}
                                    placeholder="0"
                                    onChange={(e) => handleCampoActa(al_id, "Convocatorias_Previas", e.target.value === "" ? null : Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full bg-background/50 border border-[var(--glass-border)] rounded px-3 py-2 text-body text-foreground focus:border-info focus:outline-none"
                                  />
                                  <p className={`text-caption mt-1 ${usadas >= maxConv ? "text-danger font-semibold" : "text-muted"}`} role={usadas >= maxConv ? "alert" : undefined}>
                                    {t('campos.evaluacion.convocatoriasUsadas', {defaultValue: 'Convocatorias consumidas: {{usadas}} de {{max}}.', usadas, max: maxConv})}
                                    {usadas >= maxConv && " " + t('campos.evaluacion.convocatoriasLimite', {defaultValue: 'Es la última: comprueba qué ocurre después en tu comunidad.'})}
                                  </p>
                                </div>
                              );
                            })()}
                            <div className="mb-4">
                              <label className="text-caption text-muted tracking-wider mb-1.5 block font-bold">{t('campos.evaluacion.notaFinalOrdinariaLabel', {defaultValue: 'Nota final ordinaria — FO (manual / calc)'})}</label>
                              <input
                                type="number"
                                min="1" max="10" step={decimalesActa === 1 ? "0.1" : "1"}
                                value={nota_prev || ""}
                                onChange={(e) => handleOverrideNotaFinalFO(al_id, Number(e.target.value) || 0)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-background/50 border border-[var(--glass-border)] rounded px-3 py-2 text-subheading font-bold text-foreground focus:border-info focus:outline-none"
                              />
                            </div>
                            <div className="mb-4">
                              <label className="text-caption text-muted tracking-wider mb-1.5 block font-bold">{t('campos.evaluacion.notaFinalExtraordinariaLabel', {defaultValue: 'Nota final extraordinaria — FE (manual)'})}</label>
                              <input
                                type="number"
                                min="1" max="10" step={decimalesActa === 1 ? "0.1" : "1"}
                                value={nota_prev_fe || ""}
                                onChange={(e) => handleOverrideNotaFinalFE(al_id, Number(e.target.value) || 0)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-background/50 border border-[var(--glass-border)] rounded px-3 py-2 text-subheading font-bold text-foreground focus:border-info focus:outline-none"
                              />
                            </div>
                            <div className="mb-4">
                              <label className="text-caption text-muted tracking-wider mb-1.5 block font-bold">{t('campos.evaluacion.notaSigadLabel', {defaultValue: 'Nota Sigad (1-10, manual / calc)'})}</label>
                              <input
                                type="number"
                                min="1" max="10" step="1"
                                value={sigadOverride ?? getSigadInfo(nota_prev).n}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  if (raw === "") { handleOverrideSigad(al_id, null); return; }
                                  const clamped = Math.max(1, Math.min(10, Math.round(Number(raw))));
                                  handleOverrideSigad(al_id, clamped);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                title={t('tooltips.evaluacion.notaSigadOverride', {defaultValue: 'Se calcula solo a partir de la nota final ordinaria. Cámbiala aquí a mano si quieres subirla o bajarla sin tocar esa nota.'})}
                                className="w-full bg-background/50 border border-[var(--glass-border)] rounded px-3 py-2 text-subheading font-bold text-foreground focus:border-info focus:outline-none"
                              />
                              {sigadOverride != null && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleOverrideSigad(al_id, null); }}
                                  className="text-caption text-info hover:text-info/80 mt-1"
                                >
                                  {t('botones.evaluacion.volverASigadCalculado', {defaultValue: 'Volver al valor calculado'})}
                                </button>
                              )}
                            </div>
                          </div>

                          {estadoDelActa ? (
                            <div className="rounded-xl flex flex-col items-center justify-center p-5 border-2 border-[var(--glass-border)] text-center">
                              <div className="text-heading font-black mb-2 text-foreground" style={{ lineHeight: 1 }}>{siglaEstado(estadoDelActa, config_redondeo.perfil_comunidad)}</div>
                              <div className="text-caption text-muted tracking-wider font-semibold">{t(`campos.evaluacion.estadoActa_${estadoDelActa}`, {defaultValue: NOMBRE_ESTADO_ACTA[estadoDelActa]})}</div>
                            </div>
                          ) : (
                          <div className="rounded-xl flex flex-col items-center justify-center p-5 border-2 text-center" style={{ borderColor: sigad.col, backgroundColor: `${sigad.col}11` }}>
                            <div className="text-heading font-black mb-2" style={{ color: sigad.col, lineHeight: 1 }}>{sigad.n}</div>
                            <div className="text-subheading font-bold" style={{ color: sigad.col }}>{sigad.cod}</div>
                            <div className="text-caption text-muted mt-1 tracking-wider font-semibold">{sigad.txt}</div>
                          </div>
                          )}
                        </div>
                      </div>

                      {/* BLOQUE 2: Grado de consecución de los RA por alumnado */}
                      <div className="pt-6 border-t border-[var(--glass-border)] space-y-4">
                        <h3 className="font-bold text-foreground flex items-center gap-2">
                          <span><span className="inline-flex"><Target className="w-[1.2em] h-[1.2em] mr-1" /></span></span> {t('campos.evaluacion.consecucionRaTitulo', {defaultValue: 'Consecución de resultados de aprendizaje (RA)'})}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                          {resultados_ra.map((r, idx) => {
                            let bar_color = "#dc3545";
                            if (r.prop >= 90) bar_color = "#198754";
                            else if (r.prop >= 70) bar_color = "#0d6efd";
                            else if (r.prop >= 50) bar_color = "#ffc107";

                            return (
                              <div key={r.id || idx} className="flex flex-col gap-3 bg-background/30 p-4 rounded-xl border border-white/5" title={r.desc}>
                                <div className="flex items-baseline justify-between gap-2">
                                  <span className="font-extrabold text-foreground">{r.id}</span>
                                  <span className="text-caption text-muted font-semibold">({Math.round(r.pond)}%)</span>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                  {r.nota === null ? (
                                    <span className="text-caption font-semibold px-2 py-0.5 rounded-full bg-muted/10 text-muted border border-muted/30">{t('campos.evaluacion.sinEvaluarBadge', {defaultValue: 'Sin evaluar'})}</span>
                                  ) : (
                                    <span className="text-heading font-black leading-none" style={{ color: bar_color }}>{r.prop.toFixed(0)}%</span>
                                  )}
                                  <div className="relative w-full bg-background/50 rounded-full h-2.5 border border-white/5 overflow-hidden">
                                    <div className="absolute top-0 bottom-0 w-px bg-foreground/40 z-10" style={{ left: "50%" }} title={t('campos.evaluacion.marcaAprobado', {defaultValue: 'Aprobado (50%)'})} />
                                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${r.prop}%`, backgroundColor: bar_color }} />
                                  </div>
                                  {r.topeActivo && (
                                    <span className="text-caption font-semibold px-2 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/30 text-center" title={t('tooltips.evaluacion.topeCompensablesActivo', {defaultValue: 'Nº de CE suspensos supera el máximo compensable de este módulo (Datos → Reglas de redondeo)'})}>{t('campos.evaluacion.topeCompensablesBadge', {defaultValue: 'Tope compensables activo'})}</span>
                                  )}
                                </div>

                                <div className="bg-foreground/5 border border-white/5 rounded-lg p-2 text-caption text-foreground/80 space-y-1 mt-auto">
                                  <div className="flex justify-between gap-2">
                                    <span className="text-info font-semibold">{t('campos.evaluacion.evaluadoEnLabel', {defaultValue: 'Evaluado en:'})}</span>
                                    <span>{r.tris.join(", ") || "-"}</span>
                                  </div>
                                  <div className="flex justify-between gap-2">
                                    <span className="text-warning font-semibold">{t('campos.evaluacion.udsLabel', {defaultValue: 'UDs:'})}</span>
                                    <span className="truncate max-w-[110px]" title={r.uds.join(", ")}>{r.uds.join(", ") || "-"}</span>
                                  </div>
                                  <div className="flex justify-between gap-2">
                                    <span className="text-warning font-semibold">{t('campos.evaluacion.practicasLabel', {defaultValue: 'Prácticas:'})}</span>
                                    <span className="truncate max-w-[110px]" title={r.prs.join(", ")}>{r.prs.join(", ") || "-"}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* BLOQUE 3: Plan de trabajo individual (ítem 23) — CE pendientes; convive
                          con el texto libre de recuperación ya existente, no lo sustituye. */}
                      {(() => {
                        const cePendientes = df_ce.filter((ce: any) => {
                          if (!ce.id_ce) return false;
                          const nota = notasCalc.notas_ce[ce.id_ce];
                          return nota === null || nota < config_redondeo.nota_aprobado;
                        });
                        if (cePendientes.length === 0) return null;
                        return (
                          <div className="pt-6 border-t border-[var(--glass-border)] space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-foreground flex items-center gap-2">
                                <ClipboardList className="w-[1.2em] h-[1.2em]" /> {t('campos.evaluacion.planTrabajoIndividualTitulo', {defaultValue: 'Plan de trabajo individual'})}
                              </h3>
                              <Button
                                onClick={(e) => { e.stopPropagation(); handleGenerarInformeRefuerzo(al_id); }}
                                disabled={generandoInforme === al_id}
                                className="text-caption bg-info/10 hover:bg-info/20 text-info border border-info/30 gap-2"
                              >
                                <FileDown className="w-3.5 h-3.5" /> {generandoInforme === al_id ? t('common.generando', {defaultValue: 'Generando...'}) : t('botones.evaluacion.generarInforme', {defaultValue: 'Generar informe'})}
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {cePendientes.map((ce: any) => (
                                <div key={ce.id_ce} className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-danger/5 border border-danger/20">
                                  <span className="font-mono text-caption text-danger shrink-0">{ce.id_ce}</span>
                                  <span className="flex-1 min-w-[200px] text-caption text-foreground/80 truncate" title={ce.desc_ce || ce.Descripción}>
                                    {ce.desc_ce || ce.Descripción || ""}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

      </div>
    );
  };

  const badgeSigad = (al: any) => {
    const evRow = df_eval.find((e: any) => e.ID === al.ID) || {};
    const sigad = evRow.Sigad_Override != null ? getSigadInfo(Number(evRow.Sigad_Override)) : getSigadInfo(Number(evRow.Nota_Final_FO) || 0);
    return (
      <span className="font-bold text-subheading" style={{ color: sigad.col }}>
        {sigad.n} · {sigad.cod} <span className="text-body font-normal text-muted">({sigad.txt})</span>
      </span>
    );
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      <PanelPorAlumno badge={badgeSigad}>
        {(al: any) => (
          <>
            <SeccionAcordeon title={t('campos.evaluacion.detalleAlumnadoTitulo', {defaultValue: 'Notas'})} icon={<BarChart className="w-5 h-5 text-info" />}>
              {renderNotas(al)}
            </SeccionAcordeon>
            <SeccionAcordeon title={t('tabs.seguimiento.empresaFeoe.label', {defaultValue: 'Empresa FEOE'})} icon={<Building2 className="w-5 h-5 text-warning" />}>
              <FeoeEmpresaAlumno studentId={al.ID} />
            </SeccionAcordeon>
          </>
        )}
      </PanelPorAlumno>

      {rubricaModal && (() => {
        const rubrica = df_rubricas.find((r: any) => r.id_rubrica === rubricaModal.act.rubrica_id);
        if (!rubrica) return null;
        return (
          <CalificarConRubricaModal
            isOpen={true}
            onClose={() => setRubricaModal(null)}
            rubrica={rubrica}
            alumnoNombre={rubricaModal.alumnoNombre}
            actividadDesc={rubricaModal.act.desc_act || rubricaModal.act_id}
            onGuardar={(nota) => handleUpdateActNota(rubricaModal.al_id, rubricaModal.act_id, nota)}
          />
        );
      })()}
    </div>
  );
}
