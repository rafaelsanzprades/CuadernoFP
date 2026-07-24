"use client";
import { TabSync } from "@/components/ui/TabSync";
import { FileEdit, FolderOpen, Wrench, Crosshair } from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import Link from "next/link";
import { InstrumentosListTab } from "@/components/features/instrumentos/InstrumentosListTab";
import { IndicadoresTab } from "@/components/features/instrumentos/IndicadoresTab";

export default function InstrumentosPage() {
  const { activeModuleId, moduleData, setModuleData } = useAppStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  const TABS = [
    { id: "instrumentos", label: <span className="flex items-center gap-2"><FileEdit className="w-4 h-4 shrink-0" /> Instrumentos</span>, cleanLabel: "Instrumentos" },
    { id: "indicadores", label: <span className="flex items-center gap-2"><Crosshair className="w-4 h-4 shrink-0" /> Indicadores</span>, cleanLabel: "Indicadores" },
  ];

  const [activeTab, setActiveTab] = useState("instrumentos");
  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeModuleId && !moduleData) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/module/${activeModuleId}`);
          const data = await res.json();
          if (data.status === "success") setModuleData(data.data);
        } else if (moduleData && !moduleData.df_instr) {
          // Force demo seed if completely empty
          import('@/services/fileManager').then(({ fileManager }) => {
            const db = fileManager.getDb();
            if (db['0237-ictve-pd']) {
              setModuleData(db['0237-ictve-pd']);
            }
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
      setLoading(false);
    };

    if (activeModuleId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [activeModuleId, moduleData, setModuleData]);

  if (!activeModuleId) {
    return (
      <div className="flex min-h-screen bg-background">
        <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header breadcrumbSuffix={activeTabCleanLabel} />
          <main className="flex-1 p-8 content-area">
            <MotionWrapper>
              <Card className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl">
                <FileEdit className="w-16 h-16 text-muted-foreground opacity-50" />
                <h2 className="text-2xl font-bold">No hay programación cargada</h2>
                <p className="text-muted mb-4">Debes abrir o crear un archivo de programación en tu Archivos.</p>
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

  if (loading || !moduleData) {
    return <LoadingSpinner text="Cargando..." />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />
        
        <main className="flex-1 p-8 content-area overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-4 pb-12">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Wrench className="w-6 h-6 text-accent" /> Configuración de instrumentos e indicadores
              </h1>
              <p className="text-muted mt-2 text-lg">Define los instrumentos de calificación, rúbricas y los indicadores de evaluación vinculados a los resultados de aprendizaje.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 max-w-full">
                {TABS.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {activeTab === 'instrumentos' && <InstrumentosListTab />}
            {activeTab === 'indicadores' && <IndicadoresTab />}
            
          </MotionWrapper>
        </main>
      </div>
    </div>
  );
}
