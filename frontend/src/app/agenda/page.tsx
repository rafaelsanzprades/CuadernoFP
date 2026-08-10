"use client";
import { Calendar, CalendarRange } from "lucide-react";
import { TabSync } from "@/components/ui/TabSync";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { TodayClasses } from "@/components/features/dashboard/TodayClasses";
import { WelcomeWizard } from "@/components/features/dashboard/WelcomeWizard";
import { useModulesList } from "@/hooks/useApi";
import { useEffect } from "react";
import { PlanificacionMensualTab } from "@/components/features/dashboard/PlanificacionMensualTab";
import { WeeklyClasses } from "@/components/features/dashboard/WeeklyClasses";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/ui/PageHeader";
import { TabInfoBox } from "@/components/ui/TabInfoBox";
import { TabRelacionRaUd } from "@/components/features/curriculo/TabRelacionRaUd";
import { Target } from "lucide-react";

export default function AgendaPage() {
  const {
    isWizardOpen, setWizardOpen, activeModuleId,
    moduleData, setModuleData, activeCursoId, cursoData, setCursoData,
  } = useAppStore();
  const [activeTab, setActiveTab] = useState("actual");
  const { data: modulesList, mutate: fetchModules } = useModulesList();

  useEffect(() => {
    if (modulesList) {
      if ((!modulesList.pd_modules || modulesList.pd_modules.length === 0) && !activeModuleId) {
        setWizardOpen(true);
      } else {
        setWizardOpen(false);
      }
    }
  }, [modulesList, activeModuleId, setWizardOpen]);

  useEffect(() => {
    if (activeModuleId && !moduleData) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/module/${activeModuleId}`)
        .then(res => res.json())
        .then(json => { if (json.status === "success") setModuleData(json.data); })
        .catch(() => {});
    }
    if (activeCursoId && !cursoData) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/module/${activeCursoId}`)
        .then(res => res.json())
        .then(json => { if (json.status === "success") setCursoData(json.data); })
        .catch(() => {});
    }
  }, [activeModuleId, moduleData, setModuleData, activeCursoId, cursoData, setCursoData]);

  const TABS = [
    { id: "actual", label: <><span className="inline-flex"><Calendar className="w-[1.2em] h-[1.2em] mr-1" /></span> Actual</>, cleanLabel: "Actual" },
    { id: "planificacion", label: <><span className="inline-flex"><CalendarRange className="w-[1.2em] h-[1.2em] mr-1" /></span> Planificación</>, cleanLabel: "Planificación" },
    { id: "relacion-ra-ud", label: <><span className="inline-flex"><Target className="w-[1.2em] h-[1.2em] mr-1" /></span> Relación RA con UD</>, cleanLabel: "Relación RA con UD" },
  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  const TAB_DESCRIPTIONS: Record<string, string> = {
    actual: 'Vista de la agenda diaria y tareas pendientes.',
    planificacion: 'Planificación y seguimiento mensual de la programación.',
    'relacion-ra-ud': 'Ponderación y relación entre unidades didácticas y resultados de aprendizaje.',
  };

  return (
    <div className="flex min-h-screen bg-background relative">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      {isWizardOpen && (
        <WelcomeWizard
          onComplete={() => setWizardOpen(false)}
          fetchModules={fetchModules}
        />
      )}
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <div className="w-full space-y-4 pb-12">

            <PageHeader
              icon={Calendar}
              title="Agenda"
              description="Resumen diario: estado de clase y UD a impartir."
            />

            {/* Pestañas */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsList className="max-w-full">
                  {TABS.map(tab => (
                    <TabsTrigger key={tab.id} value={tab.id}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <TabInfoBox description={TAB_DESCRIPTIONS[activeTab] || 'Gestión de ' + activeTab} />

            {/* Contenido Pestaña Actual */}
            {activeTab === "actual" && (
              <div className="space-y-12 animate-in fade-in duration-500">
                {/* 1. Hoy */}
                <TodayClasses />

                {/* 2. Semana */}
                <WeeklyClasses />
              </div>
            )}

            {/* Contenido Pestaña Planificación */}
            {activeTab === "planificacion" && (
              <div className="animate-in fade-in duration-500 w-full space-y-4">
                <PlanificacionMensualTab />
              </div>
            )}

            {/* Contenido Pestaña Relación RA con UD */}
            {activeTab === "relacion-ra-ud" && (
              <TabRelacionRaUd />
            )}

          </div>
        </div>
      </div>
    </div>
      );
}

