"use client";
import { TabSync } from "@/components/ui/TabSync";
import { Activity, LayoutGrid, Save, Target, Users, AlertTriangle, Compass, Map, MessageSquare, Route, FolderOpen, Mail, Phone, Calendar, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { fileManager } from "@/services/fileManager";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { ESTADOS_ALUMNO, type Alumnado } from "@/types";
import { ESTADO_ALUMNO_COLOR, parseAlumnadoCSV } from "@/utils/alumnado";
import { eliminarAlumnado, idProvisional, ordenarYRenumerarAlumnado } from "@/utils/renumerarAlumnado";

import { ContextoGrupoTab } from "@/components/features/alumnado/ContextoGrupoTab";
import { PlanoClaseTab } from "@/components/features/alumnado/PlanoClaseTab";
import { OrientacionIndividualTab } from "@/components/features/alumnado/OrientacionIndividualTab";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { StickyPageHeader } from "@/components/ui/StickyPageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IndiceAlumnadoPanel } from "@/components/features/alumnado/PanelPorAlumno";
import { SectionIndex } from "@/components/ui/SectionIndex";
import { IndiceAlfabetico } from "@/components/ui/IndiceAlfabetico";
import { GRUPOS_EVALUACION_DEFECTO } from "@/utils/calificaciones";

import Link from "next/link";
import { getApiBase } from "@/services/apiBase";

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
  const { activeCursoId, cursoData, setCursoData, updateCursoData, saveCursoData, moduleData, activeModuleId, setModuleData } = useAppStore();
  const [activeTab, setActiveTab] = useState("orientacion");
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveIsError, setSaveIsError] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const TABS = [
    // Antes sub-vistas de una sola pestaña "Perfil profesional" (switcher
    // interno) -- sacadas a pestañas principales el 2026-09-20 a petición de
    // Rafael ("luego veremos qué hacemos con ellas"). La sub-vista "Resumen"
    // se plegó de nuevo, ese mismo día, dentro de Tendencias (segundo bloque,
    // debajo de los agregados) al comprobar que duplicaba en peor una tabla
    // que ya vivía ahí.
    { id: "orientacion", label: <><span className="inline-flex"><Compass className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.alumnado.orientacion.label', {defaultValue: 'Orientación'})}</>, cleanLabel: t('tabs.alumnado.orientacion.label', {defaultValue: 'Orientación'}) },
    { id: "matricula", label: <><span className="inline-flex"><Users className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.alumnado.matricula.label', {defaultValue: 'Matrícula'})}</>, cleanLabel: t('tabs.alumnado.matricula.label', {defaultValue: 'Matrícula'}) },
    { id: "rasgos", label: <><span className="inline-flex"><Activity className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.alumnado.rasgos.label', {defaultValue: 'Rasgos'})}</>, cleanLabel: t('tabs.alumnado.rasgos.label', {defaultValue: 'Rasgos'}) },
    { id: "plano", label: <><span className="inline-flex"><LayoutGrid className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.agenda.planoAula.label', {defaultValue: 'Plano de aula'})}</>, cleanLabel: t('tabs.agenda.planoAula.label', {defaultValue: 'Plano de aula'}) },
  ];

  const activeTabCleanLabel = TABS.find(t_tab => t_tab.id === activeTab)?.cleanLabel;

  const TAB_DESCRIPTIONS: Record<string, string> = {
    matricula: t('tabs.alumnado.matricula.desc', {defaultValue: 'Gestión del listado de alumnado y ficha individual.'}),
    plano: t('tabs.agenda.planoAula.desc', {defaultValue: 'Distribución y plano visual del aula.'}),
    rasgos: t('tabs.alumnado.rasgos.desc', {defaultValue: 'Rasgos característicos del grupo y datos automáticos del grupo.'}),
    orientacion: t('tabs.alumnado.orientacion.desc', {defaultValue: 'Orientación profesional por alumno/a: motivación, experiencia laboral, aptitudes y aspiraciones.'}),
  };

  // Índice de bloques -- solo en las pestañas con 2+ bloques reales.
  const SECTION_INDEX_ITEMS: Record<string, { id: string; label: string }[]> = {
    rasgos: [
      { id: "alumnado-datos-grupo", label: t('campos.alumnado.datosGrupoTitulo', {defaultValue: 'Datos del grupo (automático)'}) },
      { id: "alumnado-rasgos-grupo", label: t('campos.alumnado.rasgosGrupoTitulo', {defaultValue: 'Rasgos característicos del grupo'}) },
    ],
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeModuleId && !moduleData) {
          const res = await fetch(`${getApiBase()}/api/module/${activeModuleId}`);
          const data = await res.json();
          if (data.status === "success") setModuleData(data.data);
        }
        if (activeCursoId && !cursoData) {
          const res = await fetch(`${getApiBase()}/api/module/${activeCursoId}`);
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
  }, [activeCursoId, cursoData, activeModuleId, moduleData]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage("");
    const ok = await saveCursoData();
    if (ok) {
      setSaveIsError(false);
      setSaveMessage(t('toasts.comun.guardadoCorrectamente', {defaultValue: 'Guardado correctamente'}));
      setTimeout(() => setSaveMessage(""), 3000);
    } else {
      setSaveIsError(true);
      setSaveMessage(t('toasts.comun.errorGuardar', {defaultValue: 'Error al guardar'}));
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
                <h2 className="text-heading font-bold">{t('campos.comun.sinCursoCargadoTitulo', {defaultValue: 'No hay curso cargado'})}</h2>
                <p className="text-muted mb-4">{t('campos.comun.sinCursoCargadoDesc', {defaultValue: 'Debes abrir o crear un archivo de curso en tu Archivos.'})}</p>
                <Link href="/inicio?tab=datos">
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
    return <LoadingSpinner text={t('campos.alumnado.cargandoDatosAlumnado', {defaultValue: 'Cargando datos de alumnado...'})} />;
  }

  const df_al = cursoData?.df_al || [];
  const gruposEvaluacion: { id: string; nombre: string }[] =
    (moduleData?.grupos_evaluacion?.length ? moduleData.grupos_evaluacion : GRUPOS_EVALUACION_DEFECTO);

  const handleAddAlumnado = () => {
    const newAl = [...df_al];
    // Fila en blanco al final con ID provisional; al escribir los apellidos
    // (onBlur) se coloca en su sitio alfabético y se renumera todo.
    const newId = idProvisional(newAl);
    newAl.push({
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
          setCursoData(ordenarYRenumerarAlumnado({ ...(cursoData as any), df_al: alumnos }));
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

  const handleUpdateAlumnado = (idx: number, field: keyof Alumnado, value: any) => {
    const newAl = [...df_al];
    newAl[idx] = { ...newAl[idx], [field]: value };
    updateCursoData("df_al", newAl);
  };

  const handleRemoveAlumnado = (idx: number) => {
    if (!cursoData || !df_al[idx]) return;
    setCursoData(eliminarAlumnado(cursoData, df_al[idx].ID!));
  };

  // Al terminar de escribir apellidos/nombre: el alumno/a se recoloca en su
  // posición alfabética y los ID de todos se desplazan (ver renumerarAlumnado.ts).
  const handleReordenar = () => {
    const actual = useAppStore.getState().cursoData;
    if (actual) setCursoData(ordenarYRenumerarAlumnado(actual));
  };

  const n_menores = df_al.filter((al: any) => al.Edad > 0 && al.Edad < 18).length;

  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />
        
        <main className="flex-1 content-area overflow-y-auto scrollbar-hide">
          <StickyPageHeader icon={Users} title={t('nav.alumnado', {defaultValue: 'Alumnado'})} description={t('pages.alumnado_desc')}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                  <span className={`text-body font-semibold ${saveIsError ? "text-danger" : "text-success"}`}>
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

            {/* Descripción de la pestaña activa -- texto plano, sin cajón,
                mismo patrón que Inicio/Ayuda/MagIA/Normativa/Legal */}
            <p className="text-body text-muted mt-3">
              {TAB_DESCRIPTIONS[activeTab] || 'Gestión de ' + activeTab}
            </p>

            {/* Índice de bloques de la pestaña activa -- dentro del header
                fijo (sticky top-0), así que no se pierde al hacer scroll. */}
            <SectionIndex items={SECTION_INDEX_ITEMS[activeTab] || []} bare />

            {activeTab === 'orientacion' && <IndiceAlumnadoPanel className="mt-3" />}

            {/* Índice tipo teclado de teléfono (ABC, DEF, ...) -- lleva al primer
                alumno/a (por orden alfabético) de cada grupo de letras. */}
            {activeTab === 'matricula' && df_al.length > 0 && (
              <IndiceAlfabetico
                className="mt-3"
                alumnos={df_al.map((al: any, idx: number) => ({ id: idx, apellidos: al.Apellidos }))}
                onSelect={(idx) => document.getElementById(`alumno-fila-${idx}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
              />
            )}
          </StickyPageHeader>

          <MotionWrapper className="space-y-4 px-8 pt-4 pb-12">

          {/* Tab 1: Alumnado */}
          {activeTab === "matricula" && (
            <>
            <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <SectionHeading id="alumnado-lista-oficial" scrollMt="260px" className="flex-1">
                  {t('campos.alumnado.listaOficialTitulo', {defaultValue: 'Lista oficial'})}
                </SectionHeading>
                <span className="text-body font-normal text-muted bg-foreground/5 px-3 py-1 rounded-full shrink-0">{t('campos.alumnado.numAlumnado', {count: df_al.length, defaultValue: '{{count}} alumnado'})}</span>
                <Button
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-accent hover:text-accent hover:bg-accent/10 font-semibold flex items-center gap-1 h-8 px-3 shrink-0"
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
                <span className="text-danger text-body font-semibold shrink-0">{t('campos.alumnado.nMenoresEdad', {count: n_menores, defaultValue: '{{count}} alumnado(s) menor(es) de 18 años'})}</span>
              )}
            </div>
            <Card className="p-6 border-t-4 border-t-blue-500">
              {df_al.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted">
                  <Users className="w-12 h-12 mb-3 opacity-20" />
                  <p>{t('campos.alumnado.sinAlumnadoRegistradoAun', {defaultValue: 'No hay alumnado registrado aún.'})}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {df_al.map((al: any, idx: number) => {
                    const isMenor = al.Edad > 0 && al.Edad < 18;
                    const fieldClass = "bg-transparent border-b border-transparent hover:border-[var(--glass-border)] focus:border-accent focus:outline-none transition-colors placeholder:text-muted/40";

                    return (
                      <div
                        key={al.ID || idx}
                        id={`alumno-fila-${idx}`}
                        style={{ scrollMarginTop: "260px" }}
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
                                onBlur={handleReordenar}
                                className={`${fieldClass} flex-1 min-w-0 rounded px-1 py-0.5 font-semibold text-foreground`}
                                placeholder={t('placeholders.alumnado.apellidos', {defaultValue: 'Apellidos...'})}
                              />
                              <input
                                type="text"
                                value={al.Nombre || ""}
                                onChange={(e) => handleUpdateAlumnado(idx, "Nombre", e.target.value)}
                                onBlur={handleReordenar}
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
                              <select
                                value={al.gev || "general"}
                                onChange={(e) => handleUpdateAlumnado(idx, "gev", e.target.value)}
                                title={t('tooltips.alumnado.grupoEvaluacionGev', {defaultValue: 'Grupo de evaluación (GEv)'})}
                                className="shrink-0 bg-transparent border border-transparent hover:border-[var(--glass-border)] rounded px-2 py-0.5 text-caption font-semibold text-muted focus:outline-none focus:ring-1 focus:ring-accent appearance-none cursor-pointer"
                              >
                                {gruposEvaluacion.map((g) => (
                                  <option key={g.id} value={g.id}>{g.nombre}</option>
                                ))}
                              </select>
                              {isMenor && (
                                <span className="shrink-0 text-caption font-semibold text-danger bg-danger/10 px-2 py-0.5 rounded-full">{t('campos.alumnado.menorEdadBadge', {defaultValue: 'Menor de edad'})}</span>
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
                                <span>{t('campos.alumnado.anosSeparador', {defaultValue: 'años ·'})}</span>
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
                                  placeholder={t('placeholders.alumnado.correoEjemplo', {defaultValue: 'correo@ejemplo.com'})}
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
            </div>

            </>
          )}

          {activeTab === "plano" && (
            <div className="mt-4">
              <PlanoClaseTab />
            </div>
          )}

          {activeTab === "rasgos" && (
            <div className="mt-4">
              <ContextoGrupoTab />
            </div>
          )}

          {activeTab === "orientacion" && (
            <div className="mt-4">
              <OrientacionIndividualTab />
            </div>
          )}

          </MotionWrapper>
        </main>
      </div>
    </div>
      );
}

