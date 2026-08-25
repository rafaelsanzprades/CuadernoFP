"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { TabSync } from "@/components/ui/TabSync";
import { useTranslation } from "react-i18next";
import { Calendar, FileEdit, MapPin, ClipboardCheck, Target, Users, FolderOpen } from "lucide-react";
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { useDynamicPlanning } from "@/hooks/useDynamicPlanning";
import { getSimulatedToday } from "@/utils/planningGenerator";
import { AsistenciaTab } from "@/components/features/diario/AsistenciaTab";
import { ProgresoRaTab } from "@/components/features/evaluacion/ProgresoRaTab";
import { DetalleAlumnadoTab } from "@/components/features/evaluacion/DetalleAlumnadoTab";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { PageHeader } from "@/components/ui/PageHeader";
import { TabInfoBox } from "@/components/ui/TabInfoBox";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const DIAS_SEMANA_LIST = ["Lun", "Mar", "Mié", "Jue", "Vie"];

// Recalcula todos los días lectivos del curso (los 3 trimestres), fuera del
// closure de render, para poder usarlo también en el useEffect de auto-scroll
// sin duplicar la lógica de fechas del render principal.
function getTodosLosLectivos(cursoData: any): { dateStr: string; date: Date }[] {
  const info_fechas = cursoData?.info_fechas || {};
  const horario = cursoData?.horario || {};
  const calendar_notes = cursoData?.calendar_notes || {};
  const lectivos: { dateStr: string; date: Date }[] = [];

  const checkFechas = (ini_str: string, fin_str: string) => {
    if (!ini_str || !fin_str) return;
    const ini = new Date(ini_str);
    const fin = new Date(fin_str);
    let curr = new Date(ini);
    while (curr <= fin) {
      if (curr.getDay() >= 1 && curr.getDay() <= 5) {
        const diaSemana = DIAS_SEMANA_LIST[curr.getDay() - 1];
        const dateStr = curr.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        if (!calendar_notes[`f_${dateStr}`] && (Number(horario[diaSemana]) || 0) > 0) {
          lectivos.push({ dateStr, date: new Date(curr) });
        }
      }
      curr.setDate(curr.getDate() + 1);
    }
  };
  checkFechas(info_fechas.ini_1t, info_fechas.fin_1t);
  checkFechas(info_fechas.ini_2t, info_fechas.fin_2t);
  checkFechas(info_fechas.ini_3t, info_fechas.fin_3t);
  return lectivos;
}

// Día lectivo más cercano a hoy (si hoy mismo es lectivo, es ese; si no, el
// más próximo en el tiempo). El punto de referencia lo decide el llamante:
// la fecha real en modo REAL, o la fecha simulada (2 de mayo) en modo DEMO.
function findFechaMasCercanaA(lectivos: { dateStr: string; date: Date }[], referencia: Date): string | null {
  if (lectivos.length === 0) return null;
  const ref = new Date(referencia);
  ref.setHours(0, 0, 0, 0);
  let best = lectivos[0];
  let bestDiff = Math.abs(lectivos[0].date.getTime() - ref.getTime());
  for (const l of lectivos) {
    const diff = Math.abs(l.date.getTime() - ref.getTime());
    if (diff < bestDiff) {
      best = l;
      bestDiff = diff;
    }
  }
  return best.dateStr;
}

export default function SeguimientoPage() {
  const { activeModuleId, moduleData, setModuleData, activeCursoId, cursoData, setCursoData, updateCursoData, saveCursoData, dataSource } = useAppStore();
  const { t } = useTranslation();
  const TABS = [
    { id: "clases", label: <span className="flex items-center gap-2"><FileEdit className="w-4 h-4 shrink-0" /> {t('tabs.seguimiento.clases.label', {defaultValue: 'Clases'})}</span>, cleanLabel: t('tabs.seguimiento.clases.label', {defaultValue: 'Clases'}) },
    { id: "asistencia", label: <span className="flex items-center gap-2"><ClipboardCheck className="w-4 h-4 shrink-0" /> {t('tabs.seguimiento.asistencia.label', {defaultValue: 'Asistencia'})}</span>, cleanLabel: t('tabs.seguimiento.asistencia.label', {defaultValue: 'Asistencia'}) },
    { id: "progreso-ra-ud", label: <span className="flex items-center gap-2"><Target className="w-4 h-4 shrink-0" /> {t('tabs.seguimiento.progreso-ra-ud.label', {defaultValue: 'Progreso de RA y UD'})}</span>, cleanLabel: t('tabs.seguimiento.progreso-ra-ud.label', {defaultValue: 'Progreso de RA y UD'}) },
    { id: "detalle", label: <span className="flex items-center gap-2"><Users className="w-4 h-4 shrink-0" /> {t('tabs.seguimiento.detalle.label', {defaultValue: 'Detalle por alumnado'})}</span>, cleanLabel: t('tabs.seguimiento.detalle.label', {defaultValue: 'Detalle por alumnado'}) },
  ];
  const TAB_DESCRIPTIONS: Record<string, string> = {
    clases: t('tabs.seguimiento.clases.desc', {defaultValue: 'Diario de clases, sesiones lectivas y registro de contingencias.'}),
    asistencia: t('tabs.seguimiento.asistencia.desc', {defaultValue: 'Control de asistencia del alumnado.'}),
    'progreso-ra-ud': t('tabs.seguimiento.progreso-ra-ud.desc', {defaultValue: 'Grado de consecución de los resultados de aprendizaje y las unidades didácticas por trimestre.'}),
    detalle: t('tabs.seguimiento.detalle.desc', {defaultValue: 'Entrada de notas numéricas por alumnado, instrumento de evaluación y nivel de adquisición de RA.'}),
  };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [activeTab, setActiveTab] = useState("clases");
  const [allDiarioOpen, setAllDiarioOpen] = useState(false);
  // Calculado solo en cliente (useEffect, no en el cuerpo del render) para no
  // desincronizar el HTML servido por SSR del primer render en cliente — "hoy"
  // depende del reloj del navegador (o, en DEMO, de cursoData), que el
  // servidor no puede conocer al generar el HTML inicial. En DEMO usa la
  // misma fecha simulada (2 de mayo) que el auto-scroll de abajo, para que
  // la etiqueta "Hoy" marque la fila correcta.
  const [todayStr, setTodayStr] = useState<string | null>(null);
  useEffect(() => {
    const ref = dataSource === 'demo' && cursoData ? getSimulatedToday(cursoData) : new Date();
    setTodayStr(ref.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }));
  }, [dataSource, cursoData]);
  const { planningLedger } = useDynamicPlanning();

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel || activeTab;


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeModuleId && !moduleData) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/module/${activeModuleId}`);
          const data = await res.json();
          if (data.status === "success") setModuleData(data.data);
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
  }, [activeModuleId, moduleData, activeCursoId, cursoData]);

  // Al entrar en la pestaña "Clases", desplaza la vista al día lectivo más
  // cercano y lo resalta un momento. En modo REAL usa la fecha real de hoy;
  // en modo DEMO usa la misma fecha simulada (2 de mayo del año de fin de
  // curso) que ya usa generatePlanning() para la previsión — así la demo
  // siempre "aterriza" a mitad de curso en vez de en la fecha real del
  // sistema, que normalmente cae fuera del curso académico de ejemplo.
  useEffect(() => {
    if (activeTab !== 'clases' || !cursoData) return;
    const lectivos = getTodosLosLectivos(cursoData);
    const referencia = dataSource === 'demo' ? getSimulatedToday(cursoData) : new Date();
    const targetDateStr = findFechaMasCercanaA(lectivos, referencia);
    if (!targetDateStr) return;

    // Reintentos periódicos (no un único setTimeout): la app tiene un
    // problema de hidratación preexistente (no introducido aquí, se
    // reproduce igual en /inicio) que fuerza uno o más re-renders completos
    // del cliente poco después del primer montaje, deshaciendo cualquier
    // scroll ya aplicado antes de que eso termine de asentarse — volver a
    // pedir el mismo scroll es idempotente. El resaltado se aplica una sola
    // vez, en el último intento, para no parpadear.
    let intentos = 0;
    const TOTAL_INTENTOS = 6;
    const intervalId = setInterval(() => {
      intentos += 1;
      const el = document.getElementById(`diario-dia-${targetDateStr}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (intentos >= TOTAL_INTENTOS) {
        clearInterval(intervalId);
        if (el) {
          el.classList.add('ring-2', 'ring-accent', 'ring-offset-2', 'ring-offset-background');
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-accent', 'ring-offset-2', 'ring-offset-background');
          }, 2000);
        }
      }
    }, 300);
    return () => clearInterval(intervalId);
  }, [activeTab, cursoData, dataSource]);

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
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1 p-8 content-area">
            <MotionWrapper>
              <div className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl">
                <ClipboardCheck className="w-16 h-16 text-muted-foreground opacity-50" />
                <h2 className="text-heading font-bold">No hay curso ni programación cargada</h2>
                <p className="text-muted mb-4">Debes abrir o crear un archivo de programación y curso en tu Archivos.</p>
                <Link href="/archivos">
                  <Button variant="primary" className="gap-2">
                    <FolderOpen className="w-4 h-4" /> {t('common.ir_a_mis_archivos', {defaultValue: 'Ir a mis archivos'})}
                  </Button>
                </Link>
              </div>
            </MotionWrapper>
          </main>
        </div>
      </div>
    );
  }

  if (loading || !moduleData || !cursoData) {
    return <LoadingSpinner text="Cargando datos de seguimiento..." />;
  }
  const daily_ledger = cursoData?.daily_ledger || {};
  const planning_ledger = planningLedger;
  const info_fechas = cursoData?.info_fechas || {};
  const horario = cursoData?.horario || {};
  const calendar_notes = cursoData?.calendar_notes || {};

  // Calculo de horas sin docencia
  let h_real_total = 0;
  let h_sin_docencia = 0;
  const dias_semana_list = ["Lun", "Mar", "Mié", "Jue", "Vie"];

  const processTrimestre = (ini_str: string, fin_str: string) => {
    if (!ini_str || !fin_str) return;
    const ini = new Date(ini_str);
    const fin = new Date(fin_str);
    let curr = new Date(ini);

    while (curr <= fin) {
      if (curr.getDay() >= 1 && curr.getDay() <= 5) {
        const diaSemana = dias_semana_list[curr.getDay() - 1];
        const dateStr = curr.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

        if (!calendar_notes[`f_${dateStr}`]) {
          const h_dia = Number(horario[diaSemana]) || 0;
          h_real_total += h_dia;
          if (daily_ledger[dateStr]?.sin_docencia) {
            h_sin_docencia += h_dia;
          }
        }
      }
      curr.setDate(curr.getDate() + 1);
    }
  };

  processTrimestre(info_fechas.ini_1t, info_fechas.fin_1t);
  processTrimestre(info_fechas.ini_2t, info_fechas.fin_2t);
  processTrimestre(info_fechas.ini_3t, info_fechas.fin_3t);

  const meses_display = ["Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun"];
  const meses_nombres = { "Sep": "Septiembre", "Oct": "Octubre", "Nov": "Noviembre", "Dic": "Diciembre", "Ene": "Enero", "Feb": "Febrero", "Mar": "Marzo", "Abr": "Abril", "May": "Mayo", "Jun": "Junio" };
  const meses_num: any = { "Sep": 9, "Oct": 10, "Nov": 11, "Dic": 12, "Ene": 1, "Feb": 2, "Mar": 3, "Abr": 4, "May": 5, "Jun": 6 };

  const getLectivosMes = (mes_num: number) => {
    const lectivos: Date[] = [];
    const checkFechas = (ini_str: string, fin_str: string) => {
      if (!ini_str || !fin_str) return;
      const ini = new Date(ini_str);
      const fin = new Date(fin_str);
      let curr = new Date(ini);
      while (curr <= fin) {
        if (curr.getMonth() + 1 === mes_num && curr.getDay() >= 1 && curr.getDay() <= 5) {
          const diaSemana = dias_semana_list[curr.getDay() - 1];
          const dateStr = curr.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
          if (!calendar_notes[`f_${dateStr}`] && (Number(horario[diaSemana]) || 0) > 0) {
            lectivos.push(new Date(curr));
          }
        }
        curr.setDate(curr.getDate() + 1);
      }
    };
    checkFechas(info_fechas.ini_1t, info_fechas.fin_1t);
    checkFechas(info_fechas.ini_2t, info_fechas.fin_2t);
    checkFechas(info_fechas.ini_3t, info_fechas.fin_3t);
    return lectivos;
  };

  const handleLedgerChange = (dateStr: string, field: string, value: any) => {
    const newLedger = { ...daily_ledger };
    if (!newLedger[dateStr]) {
      newLedger[dateStr] = { sin_docencia: false, seguimiento: "", publico: false };
    }
    newLedger[dateStr][field] = value;
    updateCursoData("daily_ledger", newLedger);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />
        <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-8 content-area overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-4">
            <PageHeader
              icon={MapPin}
              title={t('nav.seguimiento', { defaultValue: 'Seguimiento' })}
              description={t('pages.seguimiento_desc', { defaultValue: 'Diario de clases, asistencia, progreso de RA y notas por alumnado.' })}
            />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                  <TabsList className="max-w-full">
                    {TABS.map((tab) => (
                      <TabsTrigger key={tab.id} value={tab.id}>
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <TabInfoBox description={TAB_DESCRIPTIONS[activeTab] || 'Seguimiento del alumnado.'} />

              {activeTab === 'clases' && (
                <div className="mt-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground">
                    <FileEdit className="w-5 h-5 text-accent" /> Diario de clases y contingencias
                  </h2>
                  <button
                    onClick={() => {
                      setAllDiarioOpen(prev => !prev);
                      document.querySelectorAll('.diario-details').forEach((el) => {
                        (el as HTMLDetailsElement).open = !allDiarioOpen ? true : false;
                      });
                    }}
                    className="text-body font-semibold px-4 py-2 rounded-lg border border-[var(--glass-border)] bg-foreground/15 text-foreground/80 hover:bg-foreground/10 hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <span>{allDiarioOpen ? '▲' : '▼'}</span>
                    {allDiarioOpen ? t('common.colapsar_todos', {defaultValue: 'Colapsar todos'}) : t('common.expandir_todos', {defaultValue: 'Expandir todos'})}
                  </button>
                </div>
                <div className="space-y-4">
                  {meses_display.map((m_short) => {
                    const lectivos = getLectivosMes(meses_num[m_short]);
                    if (lectivos.length === 0) return null;

                    return (
                      <details key={m_short} open className="diario-details group bg-[var(--glass-bg)] rounded-lg border border-[var(--glass-border)] overflow-hidden transition-colors">
                        <summary className="p-4 cursor-pointer flex items-center justify-between font-semibold text-subheading select-none hover:bg-foreground/5">
                          <div className="flex items-center gap-3">
                            <span className="text-info"><span className="inline-flex"><Calendar className="w-[1.2em] h-[1.2em] mr-1" /></span></span>
                            <span>{meses_nombres[m_short as keyof typeof meses_nombres]} {lectivos[0].getFullYear()}</span>
                          </div>
                          <div className="text-body text-muted">
                            {lectivos.length} días lectivos <span className="ml-4 group-open:rotate-180 inline-block transition-transform">▼</span>
                          </div>
                        </summary>
                        <div className="p-6 border-t border-[var(--glass-border)] bg-transparent">
                          <div className="relative border-l-2 border-[var(--glass-border)] ml-4 space-y-4 pb-4">
                            {lectivos.map((d: Date, i: number) => {
                              const dateStr = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                              const diaSemana = dias_semana_list[d.getDay() - 1];
                              const udPrev = planning_ledger[dateStr] ? planning_ledger[dateStr].join(', ') : '';
                              const ledgerEntry = daily_ledger[dateStr] || { sin_docencia: false, seguimiento: "", publico: false };

                              const nodeColor = ledgerEntry.sin_docencia ? 'bg-warning' : (ledgerEntry.seguimiento ? 'bg-info' : 'bg-gray-600');
                              const esHoy = dateStr === todayStr;

                              return (
    <div key={i} id={`diario-dia-${dateStr}`} className="relative pl-8 group">
                                  {/* Timeline Node */}
                                  <div className={`absolute -left-[9px] top-4 w-4 h-4 rounded-full border-4 border-black ${nodeColor} shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-colors duration-300 group-hover:scale-125 z-10`} />

                                  <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-4 hover:bg-foreground/5 transition-all duration-300 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center gap-3">
                                        <span className="font-mono text-subheading font-bold text-foreground tracking-widest">{dateStr.substring(0,5)}</span>
                                        <span className="text-caption font-medium text-muted tracking-wider bg-foreground/5 px-2 py-1 rounded">{diaSemana}</span>
                                        {esHoy && <span className="bg-accent/10 text-accent border border-accent/30 px-2 py-0.5 rounded text-caption font-bold shadow-sm">Hoy</span>}
                                        {udPrev && <span className="bg-info/10 text-info border border-info/30 px-2 py-0.5 rounded text-caption font-medium shadow-sm">UD: {udPrev}</span>}
                                      </div>
                                      <div className="flex items-center gap-5">
                                        <label className="flex items-center gap-2 text-caption font-medium text-muted cursor-pointer hover:text-warning transition-colors tracking-wider">
                                          <input
                                            type="checkbox"
                                            checked={ledgerEntry.sin_docencia}
                                            onChange={(e) => handleLedgerChange(dateStr, 'sin_docencia', e.target.checked)}
                                            className="w-4 h-4 accent-orange-500 rounded bg-foreground/25 border-[var(--glass-border)] cursor-pointer"
                                          />
                                          Sin docencia
                                        </label>
                                        <label className="flex items-center gap-2 text-caption font-medium text-muted cursor-pointer hover:text-success transition-colors tracking-wider">
                                          <input
                                            type="checkbox"
                                            checked={ledgerEntry.publico}
                                            onChange={(e) => handleLedgerChange(dateStr, 'publico', e.target.checked)}
                                            className="w-4 h-4 accent-green-500 rounded bg-foreground/25 border-[var(--glass-border)] cursor-pointer"
                                          />
                                          Público
                                        </label>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                      <span className="text-subheading mt-2 opacity-50 select-none"><span className="inline-flex"><FileEdit className="w-[1.2em] h-[1.2em] mr-1" /></span></span>
                                      <textarea
                                        value={ledgerEntry.seguimiento}
                                        onChange={(e) => handleLedgerChange(dateStr, 'seguimiento', e.target.value)}
                                        placeholder={t('placeholders.seguimiento.escribeSeguimientoClase', {defaultValue: 'Escribe aquí el seguimiento de la clase, incidencias o progreso real...'})}
                                        className="w-full bg-foreground/20 border border-white/5 hover:border-[var(--glass-border)] rounded-lg px-4 py-3 text-foreground focus:border-info focus:bg-black/60 focus:outline-none transition-all resize-none overflow-hidden min-h-[60px] text-body"
                                        rows={1}
                                        onInput={(e) => {
                                          const target = e.target as HTMLTextAreaElement;
                                          target.style.height = 'auto';
                                          target.style.height = target.scrollHeight + 'px';
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </details>
                    );
                  })}
                </div>
                </div>
              )}

              {activeTab === 'asistencia' && (
                <div className="mt-4">
                  <AsistenciaTab />
                </div>
              )}

              {activeTab === 'progreso-ra-ud' && (
                <div className="mt-4">
                  <ProgresoRaTab />
                </div>
              )}

              {activeTab === 'detalle' && (
                <div className="mt-4">
                  <DetalleAlumnadoTab />
                </div>
              )}
          </MotionWrapper>
        </main>
      </div>
    </div>
      );
}

