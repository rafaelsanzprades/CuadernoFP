"use client";
import { TabSync } from "@/components/ui/TabSync";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Shield, FolderOpen, Info, Settings, Award } from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EqavetTab } from "@/components/features/modulo/EqavetTab";

export default function CalidadPage() {
  const { activeModuleId, moduleData } = useAppStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("eqavet");

  const TABS = [
    { id: "eqavet", label: <span className="flex items-center gap-2"><Award className="w-4 h-4 shrink-0" /> {t('tabs.eqavet', {defaultValue: 'EQAVET'})}</span>, cleanLabel: t('tabs.eqavet', {defaultValue: 'EQAVET'}) },
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
                  <Shield className="w-8 h-8 text-accent" />
                  Calidad y Mejora Continua
                </h1>
                <p className="text-muted">
                  Gestión de la calidad, evaluación del proceso e indicadores para el módulo <strong className="text-foreground">{activeModuleId}</strong>.
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
                'eqavet': { desc: 'Indicadores de calidad y cumplimiento del marco EQAVET.' },
              };
              const info = infoMap[activeTab] || { desc: 'Gestión de la calidad.' };
              return (
                <div className='flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6'>
                  <Info className='w-5 h-5 text-accent mt-0.5 shrink-0' />
                  <p className='text-sm text-muted'>{info.desc}</p>
                </div>
              );
            })()}

            <div className="space-y-4">
              {activeTab === 'eqavet' && <EqavetTab />}
            </div>

          </MotionWrapper>
        </main>
      </div>
    </div>
  );
}
