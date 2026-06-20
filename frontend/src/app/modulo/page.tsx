"use client";
import { Building2, FileEdit, FileText, Settings, Map, Target, CheckCircle2, Layers, Award, FolderOpen } from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { DatosTab } from "@/components/features/modulo/DatosTab";
import { ContextoTab } from "@/components/features/modulo/ContextoTab";
import { PlanesTab } from "@/components/features/modulo/PlanesTab";
import { ContextoFEOETab } from "@/components/features/modulo/ContextoFEOETab";
import { MetodologiaTab } from "@/components/features/modulo/MetodologiaTab";
import { EvaluacionRecursosTab } from "@/components/features/modulo/EvaluacionRecursosTab";
import { OtrosElementosTab } from "@/components/features/modulo/OtrosElementosTab";
import { GradosTab } from "@/components/features/modulo/GradosTab";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ModuloConfigPage() {
  const { activeModuleId, moduleData, setModuleData } = useAppStore();
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
    { id: "datos", label: <><span className="inline-flex"><FileText className="w-[1.2em] h-[1.2em] mr-1" /></span> Datos</>, cleanLabel: "Datos del módulo" },
    { id: "contexto", label: <><span className="inline-flex"><FileEdit className="w-[1.2em] h-[1.2em] mr-1" /></span> Contexto</>, cleanLabel: "Contexto" },
    { id: "planes", label: <><span className="inline-flex"><FileText className="w-[1.2em] h-[1.2em] mr-1" /></span> Planes</>, cleanLabel: "Planes" },
    { id: "contexto_feoe", label: <><span className="inline-flex"><Map className="w-[1.2em] h-[1.2em] mr-1" /></span> Contexto y FEOE</>, cleanLabel: "Contexto y FEOE" },
    { id: "metodologia", label: <><span className="inline-flex"><Target className="w-[1.2em] h-[1.2em] mr-1" /></span> Metodología</>, cleanLabel: "Metodología" },
    { id: "evaluacion", label: <><span className="inline-flex"><CheckCircle2 className="w-[1.2em] h-[1.2em] mr-1" /></span> Eval. y Recursos</>, cleanLabel: "Eval. y Recursos" },
    { id: "otros", label: <><span className="inline-flex"><Layers className="w-[1.2em] h-[1.2em] mr-1" /></span> Otros Elementos</>, cleanLabel: "Otros Elementos" },
    { id: "grados", label: <><span className="inline-flex"><Award className="w-[1.2em] h-[1.2em] mr-1" /></span> Grados</>, cleanLabel: "Grados formativos" }
  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  if (!activeModuleId) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header breadcrumbSuffix={activeTabCleanLabel} />
          <main className="flex-1 p-8 content-area">
            <MotionWrapper>
              <div className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl">
                <Settings className="w-16 h-16 text-muted-foreground opacity-50" />
                <h2 className="text-2xl font-bold">No hay programación cargada</h2>
                <p className="text-muted mb-4">Debes abrir o crear un archivo de programación en tu Entorno de trabajo.</p>
                <Link href="/entorno">
                  <Button variant="default" className="gap-2">
                    <FolderOpen className="w-4 h-4" /> Ir a mi Entorno
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
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-8 pb-12">

            {/* ── Título ─────────────────────────────────────────── */}
            <div>
              <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <span className="inline-flex"><Settings className="w-[1.2em] h-[1.2em] mr-1" /></span> Módulo didáctico
              </h1>
              <p className="text-muted mt-2 text-lg">Configuración de FEOE, metodología, recursos y evaluación.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-2 max-w-full">
                {TABS.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {activeTab === "datos" && <DatosTab />}
            {activeTab === "contexto" && <ContextoTab />}
            {activeTab === "planes" && <PlanesTab />}
            {activeTab === "contexto_feoe" && <ContextoFEOETab />}
            {activeTab === "metodologia" && <MetodologiaTab />}
            {activeTab === "evaluacion" && <EvaluacionRecursosTab />}
            {activeTab === "otros" && <OtrosElementosTab />}
            {activeTab === "grados" && <GradosTab />}

          </MotionWrapper>
        </div>
      </div>
    </div>
  );
}
