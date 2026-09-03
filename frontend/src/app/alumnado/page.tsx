"use client";
import { TabSync } from "@/components/ui/TabSync";
import { BarChart, Save, Target, Users, LayoutGrid, AlertTriangle, Building2, Compass, ClipboardList, Map, MessageSquare, FileText, Route, FolderOpen, Mail, Phone, Calendar, X, ClipboardCheck } from "lucide-react";
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { fileManager } from "@/services/fileManager";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { PlanoClaseTab } from "@/components/features/alumnado/PlanoClaseTab";
import { ESTADOS_ALUMNO } from "@/types";
import { ESTADO_ALUMNO_COLOR, parseAlumnadoCSV } from "@/utils/alumnado";

import { ContextoGrupoTab } from "@/components/features/alumnado/ContextoGrupoTab";
import { TutoriaTab } from "@/components/features/alumnado/TutoriaTab";
import { AutoevaluacionTab } from "@/components/features/alumnado/AutoevaluacionTab";
import { AlertaAbandonoTab } from "@/components/features/diario/AlertaAbandonoTab";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { PageHeader } from "@/components/ui/PageHeader";
import { TabInfoBox } from "@/components/ui/TabInfoBox";

import Link from "next/link";

// Fechas en las que el alumnado cumple 16/18 años, a partir de Nacimiento
// (DD/MM/AAAA) — dato ya existente en la matrícula, no se modifica nada.
function computeMilestoneDates(nacimiento?: string): { f16: string; f18: string } | null {
  if (!nacimiento) return null;
  const parts = nacimiento.split('/');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y || isNaN(new Date(y, m - 1, d).getTime())) return null;
  const fmt = (addYears: number) => {
    const dt = new Date(y + addYears, m - 1, d);
    return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
  };
  return { f16: fmt(16), f18: fmt(18) };
}

export default function AlumnadoPage() {
  const { activeCursoId, cursoData, setCursoData, updateCursoData, saveCursoData } = useAppStore();
  const [activeTab, setActiveTab] = useState("matricula");
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const TABS = [
    { id: "matricula", label: <><span className="inline-flex"><Users className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.alumnado.matricula.label', {defaultValue: 'Matrícula'})}</>, cleanLabel: t('tabs.alumnado.matricula.label', {defaultValue: 'Matrícula'}) },
    { id: "plano", label: <><span className="inline-flex"><LayoutGrid className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.plano')}</>, cleanLabel: t('tabs.plano') },
    { id: "tutoria", label: <><span className="inline-flex"><ClipboardCheck className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.alumnado.tutoria.label', {defaultValue: 'Tutoría y alertas'})}</>, cleanLabel: t('tabs.alumnado.tutoria.label', {defaultValue: 'Tutoría y alertas'}) },
    { id: "autoevaluacion", label: <><span className="inline-flex"><ClipboardCheck className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.alumnado.autoevaluacion.label', {defaultValue: 'Autoevaluación'})}</>, cleanLabel: t('tabs.alumnado.autoevaluacion.label', {defaultValue: 'Autoevaluación'}) },
  ];

  const activeTabCleanLabel = TABS.find(t_tab => t_tab.id === activeTab)?.cleanLabel;

  const TAB_DESCRIPTIONS: Record<string, string> = {
    matricula: t('tabs.alumnado.matricula.desc', {defaultValue: 'Gestión del listado de alumnado y ficha individual y, más abajo, el perfil narrativo del grupo.'}),
    plano: t('tabs.alumnado.plano.desc', {defaultValue: 'Distribución y plano visual del aula.'}),
    tutoria: t('tabs.alumnado.tutoria.desc', {defaultValue: 'Alertas de riesgo de abandono y seguimiento tutorial del alumnado.'}),
    autoevaluacion: t('tabs.alumnado.autoevaluacion.desc', {defaultValue: 'Autoevaluación del alumnado por criterio de evaluación (SÍ/Dudas/NO) y dificultades declaradas.'}),
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
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

    if (activeCursoId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [activeCursoId, cursoData]);

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

  if (!activeCursoId) {
    return (
      <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header breadcrumbSuffix={activeTabCleanLabel} />
          <main id="main-content" tabIndex={-1} className="flex-1 p-8 content-area">
            <MotionWrapper>
              <Card className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl">
                <Users className="w-16 h-16 text-muted-foreground opacity-50" />
                <h2 className="text-heading font-bold">No hay curso cargado</h2>
                <p className="text-muted mb-4">Debes abrir o crear un archivo de curso en tu Archivos.</p>
                <Link href="/archivos">
                  <Button variant="primary" className="gap-2">
                    <FolderOpen className="w-4 h-4" /> {t('common.ir_a_mis_archivos', {defaultValue: 'Ir a mis archivos'})}
                  </Button>
                </Link>
              </Card>
            </MotionWrapper>
          </main>
        </div>
      </div>
    );
  }

  if (loading || !cursoData) {
    return <LoadingSpinner text="Cargando datos de alumnado..." />;
  }

  const df_al = cursoData?.df_al || [];

  const handleAddAlumnado = () => {
    const newAl = [...df_al];
    const newId = `AN${(newAl.length + 1).toString().padStart(2, '0')}`;
    (newAl as any[]).push({
      ID: newId,
      Estado: "Alta",
      Apellidos: "",
      Nombre: "",
      Edad: null,
      Nacimiento: "",
      Repite: false,
      Matricula: "",
      Comentarios: "",
      email: "",
      Movil: ""
    });
    updateCursoData("df_al", newAl);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const { alumnos, importedCount, error } = parseAlumnadoCSV(text, df_al);
        if (error) {
          toast.error(error);
        } else {
          updateCursoData("df_al", alumnos);
          if (importedCount > 0) {
            toast.success(t('toasts.alumnado.importados', {count: importedCount, defaultValue: "Se han importado {{count}} estudiantes."}));
          } else {
            toast.error(t('toasts.alumnado.errorImportarNinguno', {defaultValue: "No se pudo importar ningún estudiante válido."}));
          }
        }
      } catch (err) {
        console.error("Error parsing CSV:", err);
        toast.error(t('toasts.alumnado.errorLeerCsv', {defaultValue: "Hubo un problema al leer el archivo CSV."}));
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file, "UTF-8"); // "UTF-8" default, can try ISO-8859-1 for spanish chars
  };

  const handleUpdateAlumnado = (idx: number, field: string, value: any) => {
    const newAl = [...df_al];
    (newAl[idx] as any)[field] = value;
    updateCursoData("df_al", newAl);
  };

  const handleRemoveAlumnado = (idx: number) => {
    const newAl = [...df_al];
    // updateCursoData("df_al", newAl);
    newAl.splice(idx, 1);
    updateCursoData("df_al", newAl);
  };

  const n_menores = df_al.filter((al: any) => al.Edad > 0 && al.Edad < 18).length;

  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />
        
        <main className="flex-1 p-8 content-area overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-4 pb-12">
            <PageHeader icon={Users} title={t('nav.alumnado', {defaultValue: 'Alumnado'})} description={t('pages.alumnado_desc')} />

          {/* Navigation Tabs */}
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
                {saving ? t('common.guardando', {defaultValue: 'Guardando...'}) : <>{t('common.guardar_cambios', {defaultValue: 'Guardar cambios'})} <span className="inline-flex"><Save className="w-[1.2em] h-[1.2em] mr-1" /></span></>}
              </Button>
            </div>
          </div>

          <TabInfoBox description={TAB_DESCRIPTIONS[activeTab] || 'Gestión de ' + activeTab} />

          {/* Tab 1: Alumnado */}
          {activeTab === "matricula" && (
            <>
            <Card className="p-6 border-t-4 border-t-blue-500">
              <div className="flex justify-between items-end mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground">
                    <span>Lista oficial</span>
                    <span className="text-body font-normal text-muted bg-foreground/5 px-3 py-1 rounded-full">{df_al.length} alumnado</span>
                  </h2>
                  <Button 
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-accent hover:text-accent hover:bg-accent/10 font-semibold flex items-center gap-1 h-8 px-3 ml-2"
                    title={t('tooltips.alumnado.importarCsv', {defaultValue: 'Importar CSV (Nombre, Apellidos...)'})}
                  >
                    <FolderOpen className="w-4 h-4" /> {t('botones.alumnado.importarCsv', {defaultValue: 'Importar CSV'})}
                  </Button>
                  <input 
                    type="file" 
                    accept=".csv" 
                    ref={fileInputRef} 
                    onChange={handleImportCSV} 
                    className="hidden" 
                  />
                </div>
                {n_menores > 0 && (
                  <span className="text-danger text-body font-semibold"> {n_menores} alumnado(s) menor(es) de 18 años</span>
                )}
              </div>
              
              {df_al.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted">
                  <Users className="w-12 h-12 mb-3 opacity-20" />
                  <p>No hay alumnado registrado aún.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {df_al.map((al: any, idx: number) => {
                    const isMenor = al.Edad > 0 && al.Edad < 18;
                    const fieldClass = "bg-transparent border-b border-transparent hover:border-[var(--glass-border)] focus:border-accent focus:outline-none transition-colors placeholder:text-muted/40";

                    return (
                      <div
                        key={idx}
                        className={`group relative rounded-xl border p-4 transition-colors bg-[var(--glass-bg)] hover:bg-foreground/5 ${isMenor ? "border-danger/30" : "border-[var(--glass-border)]"}`}
                      >
                        <button
                          onClick={() => handleRemoveAlumnado(idx)}
                          className="absolute top-3 right-3 text-danger/50 hover:text-danger opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                          title={t('tooltips.alumnado.eliminarAlumnado', {defaultValue: 'Eliminar alumnado'})}
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-start gap-3 pr-8">
                          <span className={`shrink-0 pt-1.5 w-11 text-caption font-mono font-semibold ${isMenor ? "text-danger" : "text-muted"}`}>
                            {al.ID}
                          </span>

                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={al.Apellidos || ""}
                                onChange={(e) => handleUpdateAlumnado(idx, "Apellidos", e.target.value)}
                                className={`${fieldClass} flex-1 min-w-0 rounded px-1 py-0.5 font-semibold text-foreground`}
                                placeholder={t('placeholders.alumnado.apellidos', {defaultValue: 'Apellidos...'})}
                              />
                              <input
                                type="text"
                                value={al.Nombre || ""}
                                onChange={(e) => handleUpdateAlumnado(idx, "Nombre", e.target.value)}
                                className={`${fieldClass} flex-1 min-w-0 rounded px-1 py-0.5 text-foreground`}
                                placeholder={t('placeholders.alumnado.nombre', {defaultValue: 'Nombre...'})}
                              />
                              <select
                                value={al.Estado || "Alta"}
                                onChange={(e) => handleUpdateAlumnado(idx, "Estado", e.target.value)}
                                className={`shrink-0 bg-transparent border border-transparent hover:border-[var(--glass-border)] rounded px-2 py-0.5 text-caption font-semibold focus:outline-none focus:ring-1 focus:ring-accent appearance-none cursor-pointer ${ESTADO_ALUMNO_COLOR[(al.Estado as typeof ESTADOS_ALUMNO[number]) || "Alta"]}`}
                              >
                                {ESTADOS_ALUMNO.map((estado) => (
                                  <option key={estado} value={estado} className={ESTADO_ALUMNO_COLOR[estado]}>{estado}</option>
                                ))}
                              </select>
                              {isMenor && (
                                <span className="shrink-0 text-caption font-semibold text-danger bg-danger/10 px-2 py-0.5 rounded-full">Menor de edad</span>
                              )}
                            </div>

                            <div className="flex items-center gap-x-5 gap-y-1.5 text-body text-muted">
                              <span className="shrink-0 inline-flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 opacity-60 shrink-0" />
                                <input
                                  type="number"
                                  value={al.Edad ?? ""}
                                  onChange={(e) => handleUpdateAlumnado(idx, "Edad", e.target.value === "" ? null : Number(e.target.value))}
                                  className={`${fieldClass} w-14`}
                                  placeholder={t('placeholders.alumnado.edad', {defaultValue: 'edad'})}
                                />
                                <span>años ·</span>
                                <input
                                  type="text"
                                  value={al.Nacimiento || ""}
                                  onChange={(e) => handleUpdateAlumnado(idx, "Nacimiento", e.target.value)}
                                  className={`${fieldClass} w-28`}
                                  placeholder="DD/MM/YYYY"
                                />
                                {(() => {
                                  const milestones = computeMilestoneDates(al.Nacimiento);
                                  if (!milestones) return null;
                                  return (
                                    <span className="text-caption text-muted/70" title={t('tooltips.alumnado.fechasCalculadasNacimiento', {defaultValue: 'Fechas calculadas a partir de nacimiento, relevantes para FEOE y mayoría de edad'})}>
                                      · 16: {milestones.f16} · 18: {milestones.f18}
                                    </span>
                                  );
                                })()}
                              </span>

                              <label className="shrink-0 inline-flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={al.Repite === true}
                                  onChange={(e) => handleUpdateAlumnado(idx, "Repite", e.target.checked)}
                                  className="w-3.5 h-3.5 accent-accent rounded cursor-pointer"
                                />
                                Repite
                              </label>

                              <span className="flex-1 min-w-[10rem] inline-flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 opacity-60 shrink-0" />
                                <input
                                  type="email"
                                  value={al.email || ""}
                                  onChange={(e) => handleUpdateAlumnado(idx, "email", e.target.value)}
                                  className={`${fieldClass} flex-1 min-w-0`}
                                  placeholder="correo@ejemplo.com"
                                />
                              </span>

                              <span className="shrink-0 w-36 inline-flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 opacity-60 shrink-0" />
                                <input
                                  type="text"
                                  value={al.Movil || ""}
                                  onChange={(e) => handleUpdateAlumnado(idx, "Movil", e.target.value)}
                                  className={`${fieldClass} flex-1 min-w-0`}
                                  placeholder={t('placeholders.alumnado.telefono', {defaultValue: 'Teléfono'})}
                                />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-4 flex items-center">
                <Button
                  variant="ghost"
                  onClick={handleAddAlumnado}
                  className="text-info hover:text-info font-semibold flex items-center gap-1"
                >
                  <span>+</span> {t('botones.alumnado.anadirAlumnado', {defaultValue: 'Añadir alumnado'})}
                </Button>
              </div>
            </Card>

            <div className="flex items-center gap-3 pt-2">
              <div className="h-px flex-1 bg-[var(--glass-border)]" />
              <span className="text-caption text-muted uppercase tracking-wider">Perfil del grupo</span>
              <div className="h-px flex-1 bg-[var(--glass-border)]" />
            </div>
            <ContextoGrupoTab />
            </>
          )}

          {activeTab === "plano" && <PlanoClaseTab />}
          {activeTab === "tutoria" && (
            <div className="mt-4 space-y-6">
              <AlertaAbandonoTab />
              <TutoriaTab />
            </div>
          )}

          {activeTab === "autoevaluacion" && (
            <div className="mt-4">
              <AutoevaluacionTab />
            </div>
          )}

          </MotionWrapper>
        </main>
      </div>
    </div>
      );
}

