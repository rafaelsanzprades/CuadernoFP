"use client";
import { Calendar, CalendarRange } from "lucide-react";
import { TabSync } from "@/components/ui/TabSync";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { TodayClasses } from "@/components/features/dashboard/TodayClasses";
import { WelcomeWizard } from "@/components/features/dashboard/WelcomeWizard";
import { useModulesList } from "@/hooks/useApi";
import { useEffect } from "react";
import { PlanificacionMensualTab } from "@/components/features/dashboard/PlanificacionMensualTab";
import { WeeklyClasses } from "@/components/features/dashboard/WeeklyClasses";
import { InteractiveCalendar } from "@/components/features/dashboard/InteractiveCalendar";
import { useDynamicPlanning } from "@/hooks/useDynamicPlanning";
import { ContextoAgenda } from "@/components/features/dashboard/ContextoAgenda";
import { DesarrolloUdActual } from "@/components/features/dashboard/DesarrolloUdActual";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/ui/PageHeader";
import { TabInfoBox } from "@/components/ui/TabInfoBox";
import { TabRelacionRaUd } from "@/components/features/curriculo/TabRelacionRaUd";
import { Target } from "lucide-react";

export default function AgendaPage() {
  const { t } = useTranslation();
  const {
    isWizardOpen, setWizardOpen, activeModuleId,
    moduleData, setModuleData, activeCursoId, cursoData, setCursoData,
  } = useAppStore();
  const [activeTab, setActiveTab] = useState("actual");
  const { data: modulesList, mutate: fetchModules } = useModulesList();
  const { planningLedgerDmy } = useDynamicPlanning();

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
    { id: "actual", label: <><span className="inline-flex"><Calendar className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.agenda.actual.label', {defaultValue: 'Actual'})}</>, cleanLabel: t('tabs.agenda.actual.label', {defaultValue: 'Actual'}) },
    { id: "planificacion", label: <><span className="inline-flex"><CalendarRange className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.agenda.planificacion.label', {defaultValue: 'Planificación'})}</>, cleanLabel: t('tabs.agenda.planificacion.label', {defaultValue: 'Planificación'}) },
    { id: "progreso-ra-ud", label: <><span className="inline-flex"><Target className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.agenda.progreso-ra-ud.label', {defaultValue: 'Previsión RA y UD'})}</>, cleanLabel: t('tabs.agenda.progreso-ra-ud.label', {defaultValue: 'Previsión RA y UD'}) },
    { id: "mensual", label: <><span className="inline-flex"><Calendar className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.agenda.mensual.label', {defaultValue: 'Mensual'})}</>, cleanLabel: t('tabs.agenda.mensual.label', {defaultValue: 'Mensual'}) },

  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  const TAB_DESCRIPTIONS: Record<string, string> = {
    actual: t('tabs.agenda.actual.desc', {defaultValue: 'Resumen de las clases de hoy, contexto de la semana y desarrollo de la unidad didáctica en curso.'}),
    planificacion: t('tabs.agenda.planificacion.desc', {defaultValue: 'Planificación y seguimiento mensual de la programación.'}),
    'progreso-ra-ud': t('tabs.agenda.progreso-ra-ud.desc', {defaultValue: 'Progreso de los resultados de aprendizaje según el estado y la ponderación de las unidades didácticas impartidas.'}),
    'mensual': t('tabs.agenda.mensual.desc', {defaultValue: 'Vista mensual y calendario interactivo con fechas clave.'}),

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
                {/* 0. Contexto general de las UDs */}
                <ContextoAgenda />

                {/* 1. Hoy */}
                <TodayClasses />

                {/* 2. Semana */}
                <WeeklyClasses />

                {/* 3. Desarrollo de la UD en curso */}
                <DesarrolloUdActual />
              </div>
            )}

            {/* Contenido Pestaña Planificación */}
            {activeTab === "planificacion" && (
              <div className="animate-in fade-in duration-500 w-full space-y-4">
                <PlanificacionMensualTab />
              </div>
            )}

            {/* Contenido Pestaña Progreso y Relación RA con UD */}
            {activeTab === "progreso-ra-ud" && (
              <TabRelacionRaUd />
            )}

            {/* Contenido Pestaña Mensual */}
            {activeTab === "mensual" && (
              <div className="animate-in fade-in duration-500">
                <InteractiveCalendar
                  info_fechas={(cursoData as any)?.info_fechas || (moduleData as any)?.info_fechas || {}}
                  horario={(cursoData as any)?.horario || (moduleData as any)?.horario || {}}
                  calendar_notes={(cursoData as any)?.calendar_notes || (moduleData as any)?.calendar_notes || {}}
                  planning_ledger={planningLedgerDmy}
                  onUpdateNote={(key, val) => {
                    const storeData = cursoData || moduleData;
                    if (!storeData) return;
                    const newNotes = { ...(storeData as any).calendar_notes, [key]: val };
                    if (activeCursoId) setCursoData({ ...storeData, calendar_notes: newNotes } as any);
                    else setModuleData({ ...storeData, calendar_notes: newNotes } as any);
                  }}
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
      );
}

