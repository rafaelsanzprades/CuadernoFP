"use client";
import { TabSync } from "@/components/ui/TabSync";
import { BarChart, ClipboardList, Save, TrendingUp, User, FolderOpen, History, AlertOctagon } from "lucide-react";
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { loadCatalogForModule } from "@/services/catalogCache";
import { isAlumnoActivo } from "@/utils/alumnado";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useTranslation } from "react-i18next";
import { AnalisisGrupalTab } from "@/components/features/analisis/AnalisisGrupalTab";
import { AnalisisIndividualTab } from "@/components/features/analisis/AnalisisIndividualTab";
import EstadisticasTab from "@/components/features/evaluacion/EstadisticasTab";
import { HistorialCalificacionesTab } from "@/components/features/evaluacion/HistorialCalificacionesTab";
import { ReclamacionesTab } from "@/components/features/evaluacion/ReclamacionesTab";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { PageHeader } from "@/components/ui/PageHeader";
import { TabInfoBox } from "@/components/ui/TabInfoBox";
import Link from "next/link";
import { DEFAULT_INSTRUMENTOS_PCT } from "@/data/defaultInstrumentosPct";

export default function ProgresoPage() {
  const {
    activeModuleId,
    moduleData,
    setModuleData,
    activeCursoId,
    cursoData,
    setCursoData,
    saveCursoData
  } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("resumen");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeModuleId && !moduleData) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/module/${activeModuleId}`);
          const data = await res.json();
          if (data.status === "success") setModuleData(data.data);
          loadCatalogForModule(activeModuleId);
        }
        if (activeCursoId && !cursoData) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/module/${activeCursoId}`);
          const data = await res.json();
          if (data.status === "success") setCursoData(data.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
      setLoading(false);
    };

    if (activeModuleId || activeCursoId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [activeModuleId, moduleData, activeCursoId, cursoData, setModuleData, setCursoData]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage("");
    const ok = await saveCursoData();
    if (ok) {
      setSaveMessage("Guardado correctamente");
      setTimeout(() => setSaveMessage(""), 3000);
    } else {
      setSaveMessage("Error al guardar");
    }
    setSaving(false);
  };

  if (!activeModuleId || !activeCursoId) {
    return (
      <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1 p-8 content-area">
            <MotionWrapper>

              <Card className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl">
                <TrendingUp className="w-16 h-16 text-muted-foreground opacity-50" />
                <h2 className="text-heading font-bold">No hay curso ni programación cargada</h2>
                <p className="text-muted mb-4">Debes abrir o crear un archivo de programación y curso en tu Archivos.</p>
                <Link href="/archivos">
                  <Button variant="primary" className="gap-2">
                    <FolderOpen className="w-4 h-4" /> Ir a mis Archivos
                  </Button>
                </Link>
              </Card>
            </MotionWrapper>
          </main>
        </div>
      </div>
    );
  }

  if (loading || !cursoData || !moduleData) {
    return <LoadingSpinner text="Cargando datos de progreso académico..." />;
  }

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

  const TABS = [
    { id: "resumen", label: <><span className="inline-flex"><BarChart className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.resumen')}</>, cleanLabel: t('tabs.resumen') },
    { id: "estadisticas", label: <><span className="inline-flex"><BarChart className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.calificaciones.estadisticas.label', {defaultValue: 'Estadísticas'})}</>, cleanLabel: t('tabs.calificaciones.estadisticas.label', {defaultValue: 'Estadísticas'}) },
    { id: "grupal", label: <><span className="inline-flex"><ClipboardList className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.grupal')}</>, cleanLabel: t('tabs.grupal') },
    { id: "individual", label: <><span className="inline-flex"><User className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.individual')}</>, cleanLabel: t('tabs.individual') },
    { id: "historico", label: <><span className="inline-flex"><History className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.calificaciones.historico.label', {defaultValue: 'Histórico'})}</>, cleanLabel: t('tabs.calificaciones.historico.label', {defaultValue: 'Histórico'}) },
    { id: "reclamaciones", label: <><span className="inline-flex"><AlertOctagon className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.calificaciones.reclamaciones.label', {defaultValue: 'Reclamaciones'})}</>, cleanLabel: t('tabs.calificaciones.reclamaciones.label', {defaultValue: 'Reclamaciones'}) }
  ];

  const TAB_DESCRIPTIONS: Record<string, string> = {
    resumen: t('tabs.calificaciones.resumen.desc', {defaultValue: 'Panel global de rendimiento y calificaciones medias.'}),
    estadisticas: t('tabs.calificaciones.estadisticas.desc', {defaultValue: 'Estadísticas descriptivas y visualizaciones del rendimiento del grupo.'}),
    grupal: t('tabs.calificaciones.grupal.desc', {defaultValue: 'Desempeño y estadísticas comparativas del grupo.'}),
    individual: t('tabs.calificaciones.individual.desc', {defaultValue: 'Hoja de progreso individual para tutorías.'}),
    historico: t('tabs.calificaciones.historico.desc', {defaultValue: 'Registro de cada cambio de nota: cuándo y de qué valor a qué valor.'}),
    reclamaciones: t('tabs.calificaciones.reclamaciones.desc', {defaultValue: 'Registro de reclamaciones de nota, su motivo y su resolución.'}),
  };

  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={TABS.find(t => t.id === activeTab)?.label} />

        <main className="flex-1 p-8 content-area overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-3 pb-12">
            <PageHeader icon={TrendingUp} title={t('nav.calificaciones', {defaultValue: 'Calificación'})} description={t('pages.evaluacion_desc')} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsList className="max-w-full">
                  {TABS.map(tab => (
                    <TabsTrigger key={tab.id} value={tab.id}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Save Button */}
              <div className="flex items-center gap-4 shrink-0">
                {saveMessage && (
                  <span className={`text-body font-semibold ${saveMessage.includes("Error") ? "text-danger" : "text-success"}`}>
                    {saveMessage}
                  </span>
                )}
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-accent text-background hover:bg-accent/80 font-bold px-6 py-2 rounded-xl flex items-center gap-2"
                >
                  {saving ? "Guardando..." : <>Guardar cambios <span className="inline-flex"><Save className="w-[1.2em] h-[1.2em] mr-1" /></span></>}
                </Button>
              </div>
            </div>

          <TabInfoBox description={TAB_DESCRIPTIONS[activeTab] || 'Gestión de ' + activeTab} />

          {/* TAB 1: RESUMEN */}
          {activeTab === "resumen" && (
            <div className="space-y-4 animate-in fade-in duration-500">
              
              {/* Bloque 1: Resumen de calificaciones por trimestres */}
              <Card className="p-6 border-t-4 border-t-blue-500">
                <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-5">
                  <span><span className="inline-flex"><BarChart className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Resumen de calificaciones por trimestres
                </h2>
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
                            <th className="p-3 text-left text-muted font-semibold w-[30%]" rowSpan={2}>Instrumento</th>
                            <th className="p-3 text-left text-muted font-semibold w-[14%]" rowSpan={2}>Tipo</th>
                            {tris.map(tri => (
                              <th key={tri.key} colSpan={3} className="p-2 text-center text-foreground font-semibold border-l border-[var(--glass-border)] w-[14%]">{tri.label}</th>
                            ))}
                            <th colSpan={3} className="p-2 text-center text-foreground font-semibold border-l border-[var(--glass-border)] w-[14%]">Total</th>
                          </tr>
                          <tr className="border-b border-[var(--glass-border)] text-caption text-muted">
                            {tris.map(tri => (
                              <React.Fragment key={tri.key}>
                                <th className="p-2 text-center border-l border-[var(--glass-border)]">Mín</th>
                                <th className="p-2 text-center">Media</th>
                                <th className="p-2 text-center">Máx</th>
                              </React.Fragment>
                            ))}
                            <th className="p-2 text-center border-l border-[var(--glass-border)]">Mín</th>
                            <th className="p-2 text-center">Media</th>
                            <th className="p-2 text-center">Máx</th>
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
                            <td colSpan={2} className="p-4 font-extrabold text-foreground text-subheading">Total</td>
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
              </Card>
            </div>
          )}

          {/* TAB ESTADISTICAS */}
          {activeTab === "estadisticas" && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <EstadisticasTab />
            </div>
          )}

          {/* TAB 3: GRUPAL */}
          {activeTab === "grupal" && (
            <div className="animate-in fade-in duration-500">
              <AnalisisGrupalTab />
            </div>
          )}

          {/* TAB 4: INDIVIDUAL */}
          {activeTab === "individual" && (
            <div className="animate-in fade-in duration-500">
              <AnalisisIndividualTab />
            </div>
          )}

          {/* TAB 5: HISTÓRICO */}
          {activeTab === "historico" && <HistorialCalificacionesTab />}

          {/* TAB 6: RECLAMACIONES */}
          {activeTab === "reclamaciones" && <ReclamacionesTab />}
          </MotionWrapper>
        </main>
      </div>
    </div>
      );
}
