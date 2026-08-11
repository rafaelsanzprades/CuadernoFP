"use client";
import { TabSync } from "@/components/ui/TabSync";
import { FileEdit, FileText, Settings, Map, FolderOpen, Scale } from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";
import { DatosTab } from "@/components/features/modulo/DatosTab";
import { ContextoTab } from "@/components/features/modulo/ContextoTab";
import { PlanesTab } from "@/components/features/modulo/PlanesTab";
import { ProcedimientosTab } from "@/components/features/evaluacion/ProcedimientosTab";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/ui/PageHeader";
import { TabInfoBox } from "@/components/ui/TabInfoBox";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ContextoConfigPage() {
  const { activeModuleId, moduleData, setModuleData, dataSource } = useAppStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("identificacion");

  useEffect(() => {
    if (dataSource === 'demo' && moduleData) {
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
    { id: "identificacion", label: <span className="flex items-center gap-2"><FileText className="w-4 h-4 shrink-0" /> Identificación</span>, cleanLabel: "Identificación" },
    { id: "contextualizacion", label: <span className="flex items-center gap-2"><FileEdit className="w-4 h-4 shrink-0" /> Contextualización</span>, cleanLabel: "Contextualización" },
    { id: "feoe", label: <span className="flex items-center gap-2"><FileText className="w-4 h-4 shrink-0" /> FEOE y régimen dual</span>, cleanLabel: "FEOE y régimen dual" },
    { id: "criterios", label: <span className="flex items-center gap-2"><Scale className="w-4 h-4 shrink-0" /> Evaluación y calificación</span>, cleanLabel: "Evaluación y calificación" },
  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  const TAB_DESCRIPTIONS: Record<string, string> = {
    identificacion: 'Identificación del módulo: código, denominación, centro, curso académico y profesorado. Cap. 1.1 del PD+.',
    contextualizacion: 'Entorno geográfico, socioeconómico y escolar del módulo. Cap. 1.3 del PD+.',
    feoe: 'Formación en empresa u organismo equiparado (FEOE): modalidad, seguimiento y régimen dual. Cap. 5 del PD+.',
    criterios: 'Procedimiento de evaluación y de calificación: información al alumnado, pérdida de evaluación continua, recuperación. Cap. 4 del PD+.',
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
            <PageHeader
              icon={FileEdit}
              title="Contexto"
              description="Información general, características del entorno, alumnado y módulo."
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

            <TabInfoBox description={TAB_DESCRIPTIONS[activeTab] || 'Configuración del contexto.'} />

            {activeTab === "identificacion" && <DatosTab />}
            {activeTab === "contextualizacion" && <ContextoTab />}
            {activeTab === "feoe" && <PlanesTab />}
            {activeTab === "criterios" && <ProcedimientosTab />}

          </MotionWrapper>
        </main>
      </div>
    </div>
  );
}

