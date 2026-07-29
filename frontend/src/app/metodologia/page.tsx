"use client";
import { TabSync } from "@/components/ui/TabSync";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Building2, Target, CheckCircle2, Layers, Award, FolderOpen, Lightbulb, Settings, Shield, Info } from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";
import { MetodologiaTab } from "@/components/features/modulo/MetodologiaTab";
import { EvaluacionRecursosTab } from "@/components/features/modulo/EvaluacionRecursosTab";
import { OtrosElementosTab } from "@/components/features/modulo/OtrosElementosTab";
import { EqavetTab } from "@/components/features/modulo/EqavetTab";
import { ContingenciaTab } from "@/components/features/modulo/ContingenciaTab";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
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
    { id: "metodologia", label: <span className="flex items-center gap-2"><Target className="w-4 h-4 shrink-0" /> {t('tabs.metodologia')}</span>, cleanLabel: t('tabs.metodologia') },
    { id: "evaluacion", label: <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 shrink-0" /> {t('tabs.evaluacion')}</span>, cleanLabel: t('tabs.evaluacion') },
    { id: "eqavet", label: <span className="flex items-center gap-2"><Award className="w-4 h-4 shrink-0" /> {t('tabs.eqavet', {defaultValue: 'EQAVET'})}</span>, cleanLabel: t('tabs.eqavet', {defaultValue: 'EQAVET'}) },
    { id: "contingencia", label: <span className="flex items-center gap-2"><Shield className="w-4 h-4 shrink-0" /> {t('tabs.contingencia', {defaultValue: 'Contingencia'})}</span>, cleanLabel: t('tabs.contingencia', {defaultValue: 'Contingencia'}) },
    { id: "otros", label: <span className="flex items-center gap-2"><Layers className="w-4 h-4 shrink-0" /> {t('tabs.otros')}</span>, cleanLabel: t('tabs.otros') },
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
                <h1 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-3">
                  <Lightbulb className="w-8 h-8 text-accent" />
                  Metodología y Recursos
                </h1>
                <p className="text-muted">
                  Estrategias metodológicas, recursos, espacios y atención a la diversidad para el módulo <strong className="text-foreground">{activeModuleId}</strong>.
                </p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="bg-foreground/5 border border-[var(--glass-border)] w-full justify-start h-auto p-1 rounded-xl flex-wrap">
                {TABS.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="rounded-lg px-6 py-2.5 data-[state=active]:bg-info data-[state=active]:text-foreground text-muted font-medium transition-all">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {(() => {
              const infoMap: Record<string, {desc: string}> = {
                'metodologia': { desc: 'Definición de las estrategias metodológicas y actividades formativas.' },
                'evaluacion': { desc: 'Recursos para la evaluación y criterios de calificación metodológica.' },
                'eqavet': { desc: 'Indicadores de calidad y cumplimiento del marco EQAVET.' },
                'contingencia': { desc: 'Planes de contingencia y adaptación ante situaciones excepcionales.' },
                'otros': { desc: 'Elementos transversales y otros recursos adicionales del módulo.' },
              };
              const info = infoMap[activeTab] || { desc: 'Configuración de la metodología.' };
              return (
                <div className='flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6'>
                  <Info className='w-5 h-5 text-accent mt-0.5 shrink-0' />
                  <p className='text-sm text-muted'>{info.desc}</p>
                </div>
              );
            })()}

            <div className="space-y-4">
              {activeTab === 'metodologia' && <MetodologiaTab />}
              {activeTab === 'evaluacion' && <EvaluacionRecursosTab />}
              {activeTab === 'eqavet' && <EqavetTab />}
              {activeTab === 'contingencia' && <ContingenciaTab />}
              {activeTab === 'otros' && <OtrosElementosTab />}
            </div>

          </MotionWrapper>
        </main>
      </div>
    </div>
  );
}
