"use client";
import { TabSync } from "@/components/ui/TabSync";
import { Building2, FileEdit, FileText, Settings, Map, Target, CheckCircle2, Layers, Award, FolderOpen, Info, HeartHandshake } from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";
import { DatosTab } from "@/components/features/modulo/DatosTab";
import { ContextoTab } from "@/components/features/modulo/ContextoTab";
import { PlanesTab } from "@/components/features/modulo/PlanesTab";
import { ContextoFEOETab } from "@/components/features/modulo/ContextoFEOETab";
import { MetodologiaTab } from "@/components/features/modulo/MetodologiaTab";
import { EvaluacionRecursosTab } from "@/components/features/modulo/EvaluacionRecursosTab";
import { OtrosElementosTab } from "@/components/features/modulo/OtrosElementosTab";
import { DiversidadTab } from "@/components/features/modulo/DiversidadTab";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ModuloConfigPage() {
  const { activeModuleId, moduleData, setModuleData } = useAppStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("datos");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/module/${activeModuleId}`)
      .then(res => res.json())
      .then(json => {
        if (json.status === "success") {
          // Merge API data with existing data (don't overwrite DEMO data)
          const existing = useAppStore.getState().moduleData;
          if (existing) {
            const merged: Record<string, any> = { ...json.data };
            for (const key of Object.keys(existing)) {
              if (merged[key] === undefined || merged[key] === null) {
                merged[key] = (existing as Record<string, any>)[key];
              }
            }
            setModuleData(merged as any);
          } else {
            setModuleData(json.data);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeModuleId, setModuleData]);

  const TABS = [
    { id: "datos", label: <><span className="inline-flex"><FileText className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.datos')}</>, cleanLabel: t('tabs.datos') },
    { id: "contexto", label: <><span className="inline-flex"><FileEdit className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.contexto')}</>, cleanLabel: t('tabs.contexto') },
    { id: "planes", label: <><span className="inline-flex"><FileText className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.planes')}</>, cleanLabel: t('tabs.planes') },
    { id: "contexto_feoe", label: <><span className="inline-flex"><Map className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.contexto_feoe')}</>, cleanLabel: t('tabs.contexto_feoe') },
    { id: "metodologia", label: <><span className="inline-flex"><Target className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.metodologia')}</>, cleanLabel: t('tabs.metodologia') },
    { id: "evaluacion", label: <><span className="inline-flex"><CheckCircle2 className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.evaluacion')}</>, cleanLabel: t('tabs.evaluacion') },
    { id: "diversidad", label: <><span className="inline-flex"><HeartHandshake className="w-[1.2em] h-[1.2em] mr-1" /></span> Diversidad</>, cleanLabel: "Diversidad" },
    { id: "otros", label: <><span className="inline-flex"><Layers className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.otros')}</>, cleanLabel: t('tabs.otros') }
  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  if (!activeModuleId) {
    return (
      <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header breadcrumbSuffix={activeTabCleanLabel} />
          <main className="flex-1 p-8 content-area">
            <MotionWrapper>
              <div className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl">
                <Settings className="w-16 h-16 text-muted-foreground opacity-50" />
                <h2 className="text-2xl font-bold">No hay programación cargada</h2>
                <p className="text-muted mb-4">Debes abrir o crear un archivo de programación en tu Archivos.</p>
                <Link href="/archivos">
                  <Button variant="primary" className="gap-2">
                    <FolderOpen className="w-4 h-4" /> Ir a mis Archivos
                  </Button>
                </Link>
              </div>
            </MotionWrapper>
          </main>
        </div>
      </div>
    );
  }

  if (loading || !moduleData) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header breadcrumbSuffix={activeTabCleanLabel} />
          <main className="flex-1 p-8 content-area">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
              <p>Cargando datos del módulo...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />
        <main className="flex-1 p-8 content-area">
          <MotionWrapper>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                  <Building2 className="w-8 h-8 text-accent" />
                  {t('modulo.title', { defaultValue: 'Diseño Curricular y Contexto' })}
                </h1>
                <p className="text-muted">
                  {t('modulo.subtitle', { defaultValue: 'Configura todos los aspectos del diseño y metodología para el módulo' })} <strong className="text-foreground">{activeModuleId}</strong>.
                </p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="bg-foreground/5 border border-foreground/10 p-1 flex-wrap h-auto gap-1">
                {TABS.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="text-sm flex-1 whitespace-nowrap min-w-[100px]">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
              
            {(() => {
              const infoMap: Record<string, {desc: string}> = {
                'datos': { desc: 'Configuración inicial y datos generales del módulo profesional.' },
                'contexto': { desc: 'Análisis del entorno socioeconómico, centro educativo y perfil del alumnado.' },
                'planes': { desc: 'Vinculación con los planes estratégicos y proyectos institucionales del centro.' },
                'contexto_feoe': { desc: 'Análisis específico del sector productivo y oportunidades de empleo.' },
                'metodologia': { desc: 'Estrategias pedagógicas, agrupamientos y principios de intervención.' },
                'evaluacion': { desc: 'Criterios de calificación, instrumentos y recursos didácticos necesarios.' },
                'diversidad': { desc: 'Atención a la diversidad, adaptaciones curriculares y panel de alumnado ACNEAE.' },
                'otros': { desc: 'Temas transversales, innovación y proyectos intermodulares.' }
              };
              const info = infoMap[activeTab] || { desc: 'Configuración del módulo.' };
              return (
                <div className='flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6'>
                  <Info className='w-5 h-5 text-accent mt-0.5 shrink-0' />
                  <p className='text-sm text-muted'>{info.desc}</p>
                </div>
              );
            })()}

            {activeTab === "datos" && <DatosTab />}
            {activeTab === "contexto" && <ContextoTab />}
            {activeTab === "planes" && <PlanesTab />}
            {activeTab === "contexto_feoe" && <ContextoFEOETab />}
            {activeTab === "metodologia" && <MetodologiaTab />}
            {activeTab === "evaluacion" && <EvaluacionRecursosTab />}
            {activeTab === "diversidad" && <DiversidadTab />}
            {activeTab === "otros" && <OtrosElementosTab />}

          </MotionWrapper>
        </main>
      </div>
    </div>
  );
}
