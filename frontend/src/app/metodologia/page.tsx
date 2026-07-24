"use client";
import { TabSync } from "@/components/ui/TabSync";
import { Building2, Target, CheckCircle2, Layers, Award, FolderOpen, Info, Lightbulb, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";
import { MetodologiaTab } from "@/components/features/modulo/MetodologiaTab";
import { EvaluacionRecursosTab } from "@/components/features/modulo/EvaluacionRecursosTab";
import { OtrosElementosTab } from "@/components/features/modulo/OtrosElementosTab";
import { DualTab } from "@/components/features/modulo/DualTab";
import { EqavetTab } from "@/components/features/modulo/EqavetTab";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function MetodologiaConfigPage() {
  const { activeModuleId, moduleData, setModuleData } = useAppStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("metodologia");

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
    { id: "metodologia", label: <><span className="inline-flex"><Target className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.metodologia')}</>, cleanLabel: t('tabs.metodologia') },
    { id: "dual", label: <><span className="inline-flex"><Building2 className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.dual', {defaultValue: 'FP Dual'})}</>, cleanLabel: t('tabs.dual', {defaultValue: 'FP Dual'}) },
    { id: "evaluacion", label: <><span className="inline-flex"><CheckCircle2 className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.evaluacion')}</>, cleanLabel: t('tabs.evaluacion') },
    { id: "eqavet", label: <><span className="inline-flex"><Award className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.eqavet', {defaultValue: 'EQAVET'})}</>, cleanLabel: t('tabs.eqavet', {defaultValue: 'EQAVET'}) },
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
          <main id="main-content" tabIndex={-1} className="flex-1 p-8 content-area">
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
          <main id="main-content" tabIndex={-1} className="flex-1 p-8 content-area">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
              <p>Cargando datos de metodología...</p>
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
        <main id="main-content" tabIndex={-1} className="flex-1 p-8 content-area">
          <MotionWrapper>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                  <Lightbulb className="w-8 h-8 text-accent" />
                  Metodología
                </h1>
                <p className="text-muted">
                  Estrategias metodológicas, recursos, espacios y atención a la diversidad para el módulo <strong className="text-foreground">{activeModuleId}</strong>.
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
                'dual': { desc: 'Distribución de horas y competencias entre el Centro Educativo y la Empresa.' },
                'metodologia': { desc: 'Estrategias pedagógicas, agrupamientos y principios de intervención.' },
                'evaluacion': { desc: 'Criterios de calificación, instrumentos y recursos didácticos necesarios.' },
                'eqavet': { desc: 'Autoevaluación de la calidad de los procesos e indicadores de mejora continua.' },
                'otros': { desc: 'Temas transversales, innovación y proyectos intermodulares.' }
              };
              const info = infoMap[activeTab] || { desc: 'Configuración metodológica.' };
              return (
                <div className='flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6'>
                  <Info className='w-5 h-5 text-accent mt-0.5 shrink-0' />
                  <p className='text-sm text-muted'>{info.desc}</p>
                </div>
              );
            })()}

            {activeTab === "dual" && <DualTab />}
            {activeTab === "metodologia" && <MetodologiaTab />}
            {activeTab === "evaluacion" && <EvaluacionRecursosTab />}
            {activeTab === "eqavet" && <EqavetTab />}
            {activeTab === "otros" && <OtrosElementosTab />}

          </MotionWrapper>
        </main>
      </div>
    </div>
  );
}
