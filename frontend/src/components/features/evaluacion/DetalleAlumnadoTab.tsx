"use client";
import React, { useState } from "react";
import { BarChart, Target, User, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { useAppStore } from "@/store/useAppStore";
import { resolveDescRa } from "@/services/catalogCache";
import { useDynamicPlanning } from "@/hooks/useDynamicPlanning";
import { isAlumnoActivo } from "@/utils/alumnado";
import { calcularNotas, getSigadInfo, DEFAULT_CONFIG_REDONDEO } from "@/utils/calificaciones";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";

export function DetalleAlumnadoTab() {
  const { activeModuleId, moduleData, cursoData, updateCursoData } = useAppStore();
  const { planningLedger } = useDynamicPlanning();

  const [activeTabByStudent, setActiveTabByStudent] = useState<Record<string, string>>({});
  const [allStudentsOpen, setAllStudentsOpen] = useState(false);
  const [openStudents, setOpenStudents] = useState<Set<string>>(new Set());

  const df_al = cursoData?.df_al || [];
  const df_eval = cursoData?.df_eval || [];
  const historial_calificaciones = cursoData?.historial_calificaciones || [];
  const df_act = moduleData?.df_act || [];
  const df_ce = moduleData?.df_ce || [];
  const df_ra = moduleData?.df_ra || [];
  const df_ud = moduleData?.df_ud || [];
  const df_pr = moduleData?.df_pr || [];
  const info_fechas = cursoData?.info_fechas || {};
  const planning_ledger = planningLedger || {};

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
  const pushHistorial = (al_id: string, campo: string, valor_anterior: number | null, valor_nuevo: number | null) => {
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

    const { nota_final } = calcularNotas(newEval[evRowIdx], df_ra, df_ce, df_act, config_redondeo);
    newEval[evRowIdx]["Nota_Final_FO"] = nota_final !== null ? Number(nota_final.toFixed(2)) : 0;

    updateCursoData("df_eval", newEval);
    pushHistorial(al_id, act_id, valorAnterior, val);
  };

  const handleOverrideNotaFinalFO = (al_id: string, val: number) => {
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

  const handleOverrideNotaFinalFE = (al_id: string, val: number) => {
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

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-subheading font-bold text-foreground flex items-center gap-2">
            <span className="inline-flex"><Users className="w-[1.2em] h-[1.2em] mr-1" /></span> Detalle por alumnado
          </h2>
          <p className="text-caption text-muted mt-1">Notas individuales por alumnado, instrumento de evaluación y nivel de adquisición de RA.</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            if (allStudentsOpen) {
              setOpenStudents(new Set());
            } else {
              setOpenStudents(new Set(df_evaluable.map((a: any) => a.ID)));
            }
            setAllStudentsOpen(!allStudentsOpen);
          }}
        >
          <span>{allStudentsOpen ? '▲' : '▼'}</span>
          {allStudentsOpen ? 'Colapsar todos' : 'Expandir todos'}
        </Button>
      </div>

      <div className="space-y-4">
        {df_evaluable.map((al: any) => {
          const al_id = al.ID;
          const evRow = df_eval.find((e: any) => e.ID === al_id) || { ID: al_id, Nota_Final_FO: 0, Nota_Final_FE: 0 };

          const nota_prev = Number(evRow.Nota_Final_FO) || 0;
          const nota_prev_fe = Number(evRow.Nota_Final_FE) || 0;
          const sigad = getSigadInfo(nota_prev);
          const activeStudentTab = activeTabByStudent[al_id] || "1T";

          // Motor A (Indicador->CE->RA->Módulo, ver utils/calificaciones.ts) — sustituye al
          // cálculo por trimestre (Motor B, nunca alimentado por la UI: 1T_Nota/2T_Nota/3T_Nota
          // no los escribe nada del frontend, decisión C de la Fase 2).
          const notasCalc = calcularNotas(evRow, df_ra, df_ce, df_act, config_redondeo);

          const resultados_ra: any[] = [];

          Object.keys(ra_info).forEach(ra_id => {
            const info = ra_info[ra_id];
            const r_data = ra_to_tri[ra_id];
            const nota_ra = notasCalc.notas_ra[ra_id] ?? null;
            const topeActivo = notasCalc.ra_tope_activo[ra_id] || false;

            const prop = nota_ra === null ? 0 : Math.min(100.0, Math.max(0.0, (nota_ra / 5.0) * 100.0));

            resultados_ra.push({
              id: ra_id, desc: info.desc, pond: info.pond, prop, nota: nota_ra, topeActivo,
              tris: r_data.tris, uds: r_data.uds, prs: r_data.prs
            });
          });

          return (
            <div key={al_id} className="group bg-foreground/5 rounded-lg border border-[var(--glass-border)] overflow-hidden transition-colors">
              <div
                onClick={() => {
                  const newSet = new Set(openStudents);
                  if (newSet.has(al_id)) newSet.delete(al_id);
                  else newSet.add(al_id);
                  setOpenStudents(newSet);
                }}
                className="p-4 cursor-pointer flex items-center justify-between font-semibold text-subheading select-none hover:bg-foreground/10 transition-colors"
              >
                <div className="flex items-center gap-4 w-1/3">
                  <span className="text-heading"><span className="inline-flex"><User className="w-[1.2em] h-[1.2em] mr-1" /></span></span>
                  <span>{al.Apellidos}, {al.Nombre}</span>
                </div>

                {/* Sparkline (Tendencia) */}
                <div className="flex-1 h-10 flex items-center px-4 opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {(() => {
                    const allVals: number[] = [];
                    df_act.forEach((act: any) => {
                      const v = Number(evRow[act.id_act]);
                      if (!isNaN(v) && v > 0) allVals.push(v);
                    });
                    const data = allVals.map((v, i) => ({ name: i, value: v }));
                    if (data.length < 2) return <span className="text-caption text-muted italic">Sin datos suficientes para tendencia</span>;

                    return (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                          <YAxis domain={[0, 10]} hide />
                          <Line type="monotone" dataKey="value" stroke={sigad.col} strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </div>

                <div className="flex items-center gap-6 text-body w-1/4 justify-end">
                  <span className="font-bold text-subheading" style={{ color: sigad.col }}>
                    {sigad.n} · {sigad.cod} <span className="text-body font-normal text-muted">({sigad.txt})</span>
                  </span>
                  <span className={`ml-4 inline-block transition-transform duration-300 text-muted ${openStudents.has(al_id) ? 'rotate-180' : ''}`}>▼</span>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {openStudents.has(al_id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden bg-foreground/10 border-t border-[var(--glass-border)]"
                  >
                    <div className="p-6 space-y-4">

                      {/* BLOQUE 1: Detalle de calificaciones por instrumento */}
                      <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1">
                          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                            <span><span className="inline-flex"><BarChart className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Detalle de calificaciones por instrumento
                          </h3>
                          <div onClick={(e) => e.stopPropagation()}>
                            <Tabs value={activeStudentTab} onValueChange={(val) => setActiveTabByStudent(prev => ({ ...prev, [al_id]: val }))}>
                              <TabsList className="mb-4 max-w-full">
                                {["1T", "2T", "3T"].map(t => (
                                  <TabsTrigger key={t} value={t}>
                                    {t === "1T" ? "1º trimestre" : t === "2T" ? "2º trimestre" : "3º trimestre"}
                                  </TabsTrigger>
                                ))}
                              </TabsList>
                            </Tabs>
                          </div>
                          <div className="space-y-4">
                            {acts_by_tri[activeStudentTab].length === 0 ? (
                              <div className="text-muted text-body italic">No hay actividades evaluables definidas para este trimestre.</div>
                            ) : (
                              acts_by_tri[activeStudentTab].map(act => {
                                const act_id = act.id_act;
                                const val = Number(evRow[act_id]) || 0;
                                return (
                                  <div key={act_id} className="flex items-center justify-between gap-4">
                                    <label className="text-body text-foreground/85 flex-1 truncate" title={act.desc_act}>
                                      <span className="text-muted font-medium text-caption tracking-wider bg-foreground/5 border border-white/5 px-2 py-0.5 rounded-md mr-2">
                                        {act.Tipo || "Act"}
                                      </span>
                                      {act.desc_act || act_id}
                                    </label>
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
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* Right: Overrides & Official Badge */}
                        <div className="w-full lg:w-72 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-foreground mb-4">Calificación de acta</h4>
                            <div className="mb-4">
                              <label className="text-caption text-muted tracking-wider mb-1.5 block font-bold">Nota final ordinaria — FO (manual / calc)</label>
                              <input
                                type="number"
                                min="1" max="10" step="0.1"
                                value={nota_prev || ""}
                                onChange={(e) => handleOverrideNotaFinalFO(al_id, Number(e.target.value) || 0)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-background/50 border border-[var(--glass-border)] rounded px-3 py-2 text-subheading font-bold text-foreground focus:border-info focus:outline-none"
                              />
                            </div>
                            <div className="mb-4">
                              <label className="text-caption text-muted tracking-wider mb-1.5 block font-bold">Nota final extraordinaria — FE (manual)</label>
                              <input
                                type="number"
                                min="1" max="10" step="0.1"
                                value={nota_prev_fe || ""}
                                onChange={(e) => handleOverrideNotaFinalFE(al_id, Number(e.target.value) || 0)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-background/50 border border-[var(--glass-border)] rounded px-3 py-2 text-subheading font-bold text-foreground focus:border-info focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="rounded-xl flex flex-col items-center justify-center p-5 border-2 text-center" style={{ borderColor: sigad.col, backgroundColor: `${sigad.col}11` }}>
                            <div className="text-heading font-black mb-2" style={{ color: sigad.col, lineHeight: 1 }}>{sigad.n}</div>
                            <div className="text-subheading font-bold" style={{ color: sigad.col }}>{sigad.cod}</div>
                            <div className="text-caption text-muted mt-1 tracking-wider font-semibold">{sigad.txt}</div>
                          </div>
                        </div>
                      </div>

                      {/* BLOQUE 2: Grado de consecución de los RA por alumnado */}
                      <div className="pt-6 border-t border-[var(--glass-border)] space-y-4">
                        <h3 className="font-bold text-foreground flex items-center gap-2">
                          <span><span className="inline-flex"><Target className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Consecución de resultados de aprendizaje (RA)
                        </h3>
                        <div className="space-y-5">
                          {resultados_ra.map((r, idx) => {
                            let bar_color = "#dc3545";
                            if (r.prop >= 100) bar_color = "#198754";
                            else if (r.prop >= 80) bar_color = "#0d6efd";
                            else if (r.prop >= 50) bar_color = "#ffc107";

                            return (
                              <div key={idx} className="flex flex-col md:flex-row gap-4 items-start bg-background/30 p-4 rounded-xl border border-white/5">
                                <div className="flex-1 w-full">
                                  <div className="mb-1.5 flex items-center gap-2">
                                    <span className="font-extrabold text-foreground">{r.id}</span>
                                    <span className="text-caption text-muted font-semibold">({r.pond.toFixed(1)}%)</span>
                                    {r.nota === null && (
                                      <span className="text-caption font-semibold px-2 py-0.5 rounded-full bg-muted/10 text-muted border border-muted/30">Sin evaluar</span>
                                    )}
                                    {r.topeActivo && (
                                      <span className="text-caption font-semibold px-2 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/30" title="Nº de CE suspensos supera el máximo compensable de este módulo (Datos → Reglas de redondeo)">Tope compensables activo</span>
                                    )}
                                  </div>
                                  <div className="text-caption text-muted mb-3 line-clamp-1">{r.desc}</div>

                                  <div className="w-full bg-background/50 rounded-full h-4.5 border border-white/5 overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2 text-caption font-black text-foreground shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]"
                                      style={{ width: `${Math.max(r.prop, 5)}%`, backgroundColor: bar_color }}
                                    >
                                      {r.prop > 15 ? `${r.prop.toFixed(0)}%` : ''}
                                    </div>
                                  </div>
                                </div>

                                <div className="w-full md:w-60 bg-foreground/5 border border-white/5 rounded-lg p-2.5 text-caption text-foreground/80 space-y-1 self-stretch flex flex-col justify-center">
                                  <div className="flex justify-between">
                                    <span className="text-info font-semibold">Evaluado en:</span>
                                    <span>{r.tris.join(", ") || "-"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-warning font-semibold">UDs:</span>
                                    <span className="truncate max-w-[120px]" title={r.uds.join(", ")}>{r.uds.join(", ") || "-"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-warning font-semibold">Prácticas:</span>
                                    <span className="truncate max-w-[120px]" title={r.prs.join(", ")}>{r.prs.join(", ") || "-"}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
