"use client";
import { TabSync } from "@/components/ui/TabSync";
import { FileEdit, FileText, Settings, Map, HeartHandshake, FolderOpen, Info } from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";
import { DatosTab } from "@/components/features/modulo/DatosTab";
import { ContextoTab } from "@/components/features/modulo/ContextoTab";
import { PlanesTab } from "@/components/features/modulo/PlanesTab";
import { DiversidadTab } from "@/components/features/modulo/DiversidadTab";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ContextoConfigPage() {
  const { activeModuleId, moduleData, setModuleData, dataSource } = useAppStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("presentacion");

  useEffect(() => {
    if (dataSource === 'demo') {
      setLoading(false);
      return;
    }

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
  }, [activeModuleId, setModuleData, dataSource]);

  const TABS = [
    { id: "presentacion", label: <span className="flex items-center gap-2"><FileText className="w-4 h-4 shrink-0" /> Presentación</span>, cleanLabel: "Presentación" },
    { id: "entorno", label: <span className="flex items-center gap-2"><FileEdit className="w-4 h-4 shrink-0" /> Entorno</span>, cleanLabel: "Entorno" },
    { id: "planes", label: <span className="flex items-center gap-2"><FileText className="w-4 h-4 shrink-0" /> {t('tabs.planes')}</span>, cleanLabel: t('tabs.planes') },
    { id: "diversidad", label: <span className="flex items-center gap-2"><HeartHandshake className="w-4 h-4 shrink-0" /> Diversidad</span>, cleanLabel: "Diversidad" },
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
              <p>Cargando datos del contexto...</p>
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
                  <FileEdit className="w-8 h-8 text-accent" />
                  Contexto
                </h1>
                <p className="text-muted">
                  Información general, características del entorno, alumnado y módulo.
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
                'presentacion': { desc: 'Configuración inicial y datos generales del módulo profesional.' },
                'entorno': { desc: 'Análisis del entorno socioeconómico, centro educativo y perfil del alumnado.' },
                'planes': { desc: 'Vinculación con los planes estratégicos y proyectos institucionales del centro.' },
                'diversidad': { desc: 'Atención a la diversidad, adaptaciones curriculares y panel de alumnado ACNEAE.' },
              };
              const info = infoMap[activeTab] || { desc: 'Configuración del contexto.' };
              return (
                <div className='flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6'>
                  <Info className='w-5 h-5 text-accent mt-0.5 shrink-0' />
                  <p className='text-sm text-muted'>{info.desc}</p>
                </div>
              );
            })()}

            {activeTab === "presentacion" && <DatosTab />}
            {activeTab === "entorno" && <ContextoTab />}
            {activeTab === "planes" && <PlanesTab />}
            {activeTab === "diversidad" && <DiversidadTab />}

          </MotionWrapper>
        </main>
      </div>
    </div>
  );
}

