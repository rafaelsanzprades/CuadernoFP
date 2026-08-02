"use client";
import { TabSync } from "@/components/ui/TabSync";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Target, CheckCircle2, Layers, FolderOpen, Lightbulb, Settings, Shield, HeartHandshake } from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";
import { MetodologiaTab } from "@/components/features/modulo/MetodologiaTab";
import { EvaluacionRecursosTab } from "@/components/features/modulo/EvaluacionRecursosTab";
import { OtrosElementosTab } from "@/components/features/modulo/OtrosElementosTab";
import { ContingenciaTab } from "@/components/features/modulo/ContingenciaTab";
import { DiversidadTab } from "@/components/features/modulo/DiversidadTab";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { PageHeader } from "@/components/ui/PageHeader";
import { TabInfoBox } from "@/components/ui/TabInfoBox";
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
    { id: "diversidad", label: <span className="flex items-center gap-2"><HeartHandshake className="w-4 h-4 shrink-0" /> Medidas de inclusión</span>, cleanLabel: "Medidas de inclusión" },
    { id: "evaluacion", label: <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 shrink-0" /> Instrumentos y recursos</span>, cleanLabel: "Instrumentos y recursos" },
    { id: "contingencia", label: <span className="flex items-center gap-2"><Shield className="w-4 h-4 shrink-0" /> Plan de contingencia</span>, cleanLabel: "Plan de contingencia" },
    { id: "transversales", label: <span className="flex items-center gap-2"><Layers className="w-4 h-4 shrink-0" /> {t('tabs.otros')}</span>, cleanLabel: "Transversales" },
  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  const TAB_DESCRIPTIONS: Record<string, string> = {
    metodologia: 'Definición de las estrategias metodológicas y actividades formativas.',
    diversidad: 'Atención a la diversidad, adaptaciones curriculares (DUA) y panel de alumnado ACNEAE.',
    evaluacion: 'Instrumentos de evaluación seleccionados y recursos y espacios necesarios.',
    contingencia: 'Planes de contingencia y adaptación ante situaciones excepcionales.',
    transversales: 'Elementos transversales, competencias clave y estándares curriculares del módulo.',
  };

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
                <h2 className="text-heading font-bold">No hay programación cargada</h2>
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
            <PageHeader
              icon={Lightbulb}
              title="Metodología y recursos"
              description="Estrategias metodológicas, recursos, espacios y atención a la diversidad."
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

            <TabInfoBox description={TAB_DESCRIPTIONS[activeTab] || 'Configuración de la metodología.'} />

            <div className="space-y-4">
              {activeTab === 'metodologia' && <MetodologiaTab />}
              {activeTab === 'diversidad' && <DiversidadTab />}
              {activeTab === 'evaluacion' && <EvaluacionRecursosTab />}
              {activeTab === 'contingencia' && <ContingenciaTab />}
              {activeTab === 'transversales' && <OtrosElementosTab />}
            </div>

          </MotionWrapper>
        </main>
      </div>
    </div>
  );
}
