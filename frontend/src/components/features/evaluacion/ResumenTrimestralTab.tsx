"use client";
import { BarChart } from "lucide-react";
import React from "react";
import { useAppStore } from "@/store/useAppStore";
import { isAlumnoActivo } from "@/utils/alumnado";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DEFAULT_INSTRUMENTOS_PCT } from "@/data/defaultInstrumentosPct";
import { useTranslation } from "react-i18next";

// Resumen trimestral: notas por instrumento y trimestre del grupo. Estaba en
// Cierre -> Resumen; ahora es la pestaña Trimestral de Calificaciones
// (2026-10-05).
export function ResumenTrimestralTab() {
  const { t } = useTranslation();
  const { cursoData, moduleData } = useAppStore();

  const df_al = cursoData?.df_al || [];
  const df_eval = cursoData?.df_eval || [];
  const df_act = moduleData?.df_act || [];

  const df_evaluable = df_al.filter(isAlumnoActivo);
  df_evaluable.sort((a: any, b: any) => String(a.Apellidos || "").localeCompare(String(b.Apellidos || "")));

  const acts_by_tri: Record<string, any[]> = { "1T": [], "2T": [], "3T": [] };
  df_act.forEach((act: any) => {
    if (act.id_act && String(act.id_act).trim() !== "") {
      const tri = act.tri_act || "1T";
      if (acts_by_tri[tri]) acts_by_tri[tri].push(act);
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
              <div className="space-y-3">
              <SectionHeading id="calificaciones-resumen-trimestral" icon={BarChart} scrollMt="260px">
                {t('tabs.calificaciones.resumenTrimestral', {defaultValue: 'Trimestral'})}
              </SectionHeading>
                <div className="overflow-x-auto">
                  {(() => {
                    const instrumentosPct = (moduleData?.instrumentos_pct_trimestre && moduleData.instrumentos_pct_trimestre.length > 0)
                      ? moduleData.instrumentos_pct_trimestre
                      : DEFAULT_INSTRUMENTOS_PCT;

                    const normalizeTipo = (t: string) => {
                      if (!t) return "Exámenes teóricos";
                      if (t === "Teoria") return "Exámenes teóricos";
                      if (t === "Practica") return "Exámenes prácticos";
                      if (t === "Informes") return "Informes de ejercicios";
                      if (t === "Tareas") return "Cuaderno de tareas";
                      if (t === "Recuperacion") return "Recuperaciones";
                      return t;
                    };

                    const tipos = [
                      ...instrumentosPct.filter((instr: any) => instr.categoria !== "Recuperaciones").map((instr: any, i: number) => ({
                        key: instr.nombre,
                        categoria: instr.categoria || "Teoría",
                        label: instr.nombre,
                        color: ["blue", "emerald", "orange", "purple", "pink", "indigo"][i % 6]
                      })),
                      { key: "Recuperaciones", categoria: "Recuperaciones", label: "Recuperaciones", color: "red" }
                    ];

                    const tris = [
                      { key: "1T", label: "1er trimestre" },
                      { key: "2T", label: "2º trimestre" },
                      { key: "3T", label: "3er trimestre" },
                    ];

                    const getStats = (triKey: string, tipoKey: string) => {
                      const acts = (acts_by_tri[triKey] || []).filter((a: any) => normalizeTipo(a.Tipo) === tipoKey);
                      if (acts.length === 0) return null;
                      const allGrades: number[] = [];
                      df_evaluable.forEach((al: any) => {
                        const evRow = df_eval.find((e: any) => e.ID === al.ID);
                        if (!evRow) return;
                        acts.forEach((act: any) => {
                          const v = Number(evRow[act.id_act]);
                          if (!isNaN(v) && v > 0) allGrades.push(v);
                        });
                      });
                      if (allGrades.length === 0) return { min: 0, avg: 0, max: 0 };
                      return {
                        min: Math.min(...allGrades),
                        avg: allGrades.reduce((a, b) => a + b, 0) / allGrades.length,
                        max: Math.max(...allGrades),
                      };
                    };

                    return (
                      <table className="w-full text-body border-collapse">
                        <thead>
                          <tr className="border-b border-[var(--glass-border)]">
                            <th className="p-3 text-left text-muted font-semibold w-[30%]" rowSpan={2}>{t('tablas.calificaciones.instrumento', {defaultValue: 'Instrumento'})}</th>
                            <th className="p-3 text-left text-muted font-semibold w-[14%]" rowSpan={2}>{t('common.tipo', {defaultValue: 'Tipo'})}</th>
                            {tris.map(tri => (
                              <th key={tri.key} colSpan={3} className="p-2 text-center text-foreground font-semibold border-l border-[var(--glass-border)] w-[14%]">{tri.label}</th>
                            ))}
                            <th colSpan={3} className="p-2 text-center text-foreground font-semibold border-l border-[var(--glass-border)] w-[14%]">{t('common.total', {defaultValue: 'Total'})}</th>
                          </tr>
                          <tr className="border-b border-[var(--glass-border)] text-caption text-muted">
                            {tris.map(tri => (
                              <React.Fragment key={tri.key}>
                                <th className="p-2 text-center border-l border-[var(--glass-border)]">{t('tablas.calificaciones.min', {defaultValue: 'Mín'})}</th>
                                <th className="p-2 text-center">{t('tablas.calificaciones.media', {defaultValue: 'Media'})}</th>
                                <th className="p-2 text-center">{t('tablas.calificaciones.max', {defaultValue: 'Máx'})}</th>
                              </React.Fragment>
                            ))}
                            <th className="p-2 text-center border-l border-[var(--glass-border)]">{t('tablas.calificaciones.min', {defaultValue: 'Mín'})}</th>
                            <th className="p-2 text-center">{t('tablas.calificaciones.media', {defaultValue: 'Media'})}</th>
                            <th className="p-2 text-center">{t('tablas.calificaciones.max', {defaultValue: 'Máx'})}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tipos.map(t => {
                            const allGradesTipo: number[] = [];
                            df_evaluable.forEach((al: any) => {
                              const evRow = df_eval.find((e: any) => e.ID === al.ID);
                              if (!evRow) return;
                              df_act.filter((a: any) => normalizeTipo(a.Tipo) === t.key).forEach((act: any) => {
                                const v = Number(evRow[act.id_act]);
                                if (!isNaN(v) && v > 0) allGradesTipo.push(v);
                              });
                            });
                            const sTotal = allGradesTipo.length > 0
                              ? { min: Math.min(...allGradesTipo), avg: allGradesTipo.reduce((a, b) => a + b, 0) / allGradesTipo.length, max: Math.max(...allGradesTipo) }
                              : null;

                            return (
                              <tr key={t.key} className="border-b border-white/5 hover:bg-foreground/5 transition-colors">
                                <td className={`p-3 font-semibold text-${t.color}-400`}>{t.label}</td>
                                <td className={`p-3 font-semibold text-${t.color}-400`}>{t.categoria}</td>
                                {tris.map(tri => {
                                  const s = getStats(tri.key, t.key);
                                  return (
                                    <React.Fragment key={tri.key}>
                                      <td className="p-3 text-center border-l border-[var(--glass-border)]">
                                        <span className={`text-${t.color}-400/70 font-mono`}>{s ? s.min.toFixed(1) : '-'}</span>
                                      </td>
                                      <td className="p-3 text-center">
                                        <span className={`bg-${t.color}-500/15 text-${t.color}-400 font-bold px-2 py-0.5 rounded-md`}>{s ? s.avg.toFixed(1) : '-'}</span>
                                      </td>
                                      <td className="p-3 text-center">
                                        <span className={`text-${t.color}-400/70 font-mono`}>{s ? s.max.toFixed(1) : '-'}</span>
                                      </td>
                                    </React.Fragment>
                                  );
                                })}
                                <td className="p-3 text-center border-l border-[var(--glass-border)]">
                                  <span className={`text-${t.color}-400/70 font-mono font-bold`}>{sTotal ? sTotal.min.toFixed(1) : '-'}</span>
                                </td>
                                <td className="p-3 text-center">
                                  <span className={`bg-${t.color}-500/20 text-${t.color}-400 font-bold px-2 py-0.5 rounded-md`}>{sTotal ? sTotal.avg.toFixed(1) : '-'}</span>
                                </td>
                                <td className="p-3 text-center">
                                  <span className={`text-${t.color}-400/70 font-mono font-bold`}>{sTotal ? sTotal.max.toFixed(1) : '-'}</span>
                                </td>
                              </tr>
                            );
                          })}
                          <tr className="border-t-2 border-[var(--glass-border)] bg-foreground/5">
                            <td colSpan={2} className="p-4 font-extrabold text-foreground text-subheading">{t('common.total', {defaultValue: 'Total'})}</td>
                            {tris.map(tri => {
                              const acts = acts_by_tri[tri.key] || [];
                              const allGradesTri: number[] = [];
                              df_evaluable.forEach((al: any) => {
                                const evRow = df_eval.find((e: any) => e.ID === al.ID);
                                if (!evRow) return;
                                acts.forEach((act: any) => {
                                  const v = Number(evRow[act.id_act]);
                                  if (!isNaN(v) && v > 0) allGradesTri.push(v);
                                });
                              });
                              const s = allGradesTri.length > 0
                                ? { min: Math.min(...allGradesTri), avg: allGradesTri.reduce((a, b) => a + b, 0) / allGradesTri.length, max: Math.max(...allGradesTri) }
                                : null;
                              return (
                                <React.Fragment key={tri.key}>
                                  <td className="p-4 text-center border-l border-[var(--glass-border)]">
                                    <span className="text-foreground/70 font-mono font-bold">{s ? s.min.toFixed(1) : '-'}</span>
                                  </td>
                                  <td className="p-4 text-center">
                                    <span className="bg-foreground/20 text-foreground font-extrabold text-subheading px-3 py-1 rounded-lg">{s ? s.avg.toFixed(1) : '-'}</span>
                                  </td>
                                  <td className="p-4 text-center">
                                    <span className="text-foreground/70 font-mono font-bold">{s ? s.max.toFixed(1) : '-'}</span>
                                  </td>
                                </React.Fragment>
                              );
                            })}
                            {(() => {
                              const allGradesGrand: number[] = [];
                              df_evaluable.forEach((al: any) => {
                                const evRow = df_eval.find((e: any) => e.ID === al.ID);
                                if (!evRow) return;
                                df_act.forEach((act: any) => {
                                  const v = Number(evRow[act.id_act]);
                                  if (!isNaN(v) && v > 0) allGradesGrand.push(v);
                                });
                              });
                              const s = allGradesGrand.length > 0
                                ? { min: Math.min(...allGradesGrand), avg: allGradesGrand.reduce((a, b) => a + b, 0) / allGradesGrand.length, max: Math.max(...allGradesGrand) }
                                : null;
                              return (
                                <React.Fragment>
                                  <td className="p-4 text-center border-l border-[var(--glass-border)]">
                                    <span className="text-foreground/80 font-mono font-extrabold">{s ? s.min.toFixed(1) : '-'}</span>
                                  </td>
                                  <td className="p-4 text-center">
                                    <span className="bg-foreground/30 text-foreground font-extrabold text-subheading px-3 py-1 rounded-lg">{s ? s.avg.toFixed(1) : '-'}</span>
                                  </td>
                                  <td className="p-4 text-center">
                                    <span className="text-foreground/80 font-mono font-extrabold">{s ? s.max.toFixed(1) : '-'}</span>
                                  </td>
                                </React.Fragment>
                              );
                            })()}
                          </tr>
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              </div>

    </div>
  );
}
