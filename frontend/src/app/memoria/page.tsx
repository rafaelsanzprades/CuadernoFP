"use client";
import { TabSync } from "@/components/ui/TabSync";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { FileText, FolderOpen, Info, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function MemoriaPage() {
  const { activeModuleId, moduleData } = useAppStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("memoria");

  const TABS = [
    { id: "memoria", label: <span className="flex items-center gap-2"><FileText className="w-4 h-4 shrink-0" /> Memoria</span>, cleanLabel: "Memoria" },
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
                  <FileText className="w-8 h-8 text-accent" />
                  Memoria Final
                </h1>
                <p className="text-muted">
                  Memoria final del curso y valoración de resultados para el módulo <strong className="text-foreground">{activeModuleId}</strong>.
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

            <div className='flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6'>
              <Info className='w-5 h-5 text-accent mt-0.5 shrink-0' />
              <p className='text-sm text-muted'>Sección en construcción.</p>
            </div>

            <div className="space-y-4">
              {activeTab === 'memoria' && (
                <div className="p-12 text-center text-muted">
                  Próximamente disponible.
                </div>
              )}
            </div>

          </MotionWrapper>
        </main>
      </div>
    </div>
  );
}
