"use client";
import { TabSync } from "@/components/ui/TabSync";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Shield, FolderOpen, Settings, Award, Lightbulb } from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { PageHeader } from "@/components/ui/PageHeader";
import { TabInfoBox } from "@/components/ui/TabInfoBox";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EqavetTab } from "@/components/features/modulo/EqavetTab";
import { PropuestasTab } from "@/components/features/modulo/PropuestasTab";

export default function MejoraPage() {
  const { activeModuleId, moduleData } = useAppStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("eqavet");

  const TABS = [
    { id: "eqavet", label: <span className="flex items-center gap-2"><Award className="w-4 h-4 shrink-0" /> {t('tabs.eqavet', {defaultValue: 'EQAVET'})}</span>, cleanLabel: t('tabs.eqavet', {defaultValue: 'EQAVET'}) },
    { id: "propuestas", label: <span className="flex items-center gap-2"><Lightbulb className="w-4 h-4 shrink-0" /> Propuestas</span>, cleanLabel: "Propuestas" },
  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  const TAB_DESCRIPTIONS: Record<string, string> = {
    eqavet: 'Indicadores de calidad y cumplimiento del marco EQAVET.',
    propuestas: 'Propuestas de mejora para el próximo curso.',
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

  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />
        <main id="main-content" tabIndex={-1} className="flex-1 p-8 content-area">
          <MotionWrapper>
            <PageHeader
              icon={Shield}
              title="Mejora continua"
              description={`Gestión de la calidad, evaluación del proceso e indicadores para el módulo ${activeModuleId}.`}
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

            <TabInfoBox description={TAB_DESCRIPTIONS[activeTab] || 'Gestión de la calidad.'} />

            <div className="space-y-4">
              {activeTab === 'eqavet' && <EqavetTab />}
              {activeTab === 'propuestas' && <PropuestasTab />}
            </div>

          </MotionWrapper>
        </main>
      </div>
    </div>
  );
}
