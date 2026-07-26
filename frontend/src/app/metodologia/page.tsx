"use client";
import { AccordionBlock } from "@/components/ui/AccordionBlock";
import { Building2, Target, CheckCircle2, Layers, Award, FolderOpen, Lightbulb, Settings, Shield } from "lucide-react";
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
import { ContingenciaTab } from "@/components/features/modulo/ContingenciaTab";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function MetodologiaConfigPage() {
  const { activeModuleId, moduleData, setModuleData } = useAppStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

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

  if (!activeModuleId) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
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
          <Header />
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
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
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

            <div className="space-y-4">
              <AccordionBlock
                title={t('tabs.metodologia')}
                icon={<Target className="w-5 h-5" />}
                defaultOpen={true}
              >
                <MetodologiaTab />
              </AccordionBlock>

              <AccordionBlock
                title={t('tabs.dual', {defaultValue: 'FP Dual'})}
                icon={<Building2 className="w-5 h-5" />}
              >
                <DualTab />
              </AccordionBlock>

              <AccordionBlock
                title={t('tabs.evaluacion')}
                icon={<CheckCircle2 className="w-5 h-5" />}
              >
                <EvaluacionRecursosTab />
              </AccordionBlock>

              <AccordionBlock
                title={t('tabs.eqavet', {defaultValue: 'EQAVET'})}
                icon={<Award className="w-5 h-5" />}
              >
                <EqavetTab />
              </AccordionBlock>

              <AccordionBlock
                title={t('tabs.contingencia', {defaultValue: 'Contingencia'})}
                icon={<Shield className="w-5 h-5" />}
              >
                <ContingenciaTab />
              </AccordionBlock>

              <AccordionBlock
                title={t('tabs.otros')}
                icon={<Layers className="w-5 h-5" />}
              >
                <OtrosElementosTab />
              </AccordionBlock>
            </div>

          </MotionWrapper>
        </main>
      </div>
    </div>
  );
}
