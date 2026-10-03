"use client";
import { Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { TodayClasses } from "@/components/features/dashboard/TodayClasses";
import { WelcomeWizard } from "@/components/features/dashboard/WelcomeWizard";
import { useModulesList } from "@/hooks/useApi";
import { useEffect } from "react";
import { WeeklyClasses } from "@/components/features/dashboard/WeeklyClasses";
import { ContextoAgenda } from "@/components/features/dashboard/ContextoAgenda";
import { DesarrolloUdActual } from "@/components/features/dashboard/DesarrolloUdActual";
import { StickyPageHeader } from "@/components/ui/StickyPageHeader";
import { SectionIndex } from "@/components/ui/SectionIndex";
import { getApiBase } from "@/services/apiBase";

export default function AgendaPage() {
  const { t } = useTranslation();
  const {
    isWizardOpen, setWizardOpen, activeModuleId,
    moduleData, setModuleData, activeCursoId, cursoData, setCursoData,
  } = useAppStore();
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
      fetch(`${getApiBase()}/api/module/${activeModuleId}`)
        .then(res => res.json())
        .then(json => { if (json.status === "success") setModuleData(json.data); })
        .catch(() => {});
    }
    if (activeCursoId && !cursoData) {
      fetch(`${getApiBase()}/api/module/${activeCursoId}`)
        .then(res => res.json())
        .then(json => { if (json.status === "success") setCursoData(json.data); })
        .catch(() => {});
    }
  }, [activeModuleId, moduleData, setModuleData, activeCursoId, cursoData, setCursoData]);

  // Agenda ya no tiene pestañas (2026-10-02, petición de Rafael): una sola
  // página con bloques e índice. El calendario mensual pasó a Calendario ->
  // Mensual.
  const SECTION_INDEX_ITEMS: { id: string; label: string }[] = [
    { id: "agenda-clases-hoy", label: 'Tus clases de hoy' },
    { id: "agenda-prevision-semanal", label: t('campos.dashboard.previsionSemanalTitulo', {defaultValue: 'Previsión semanal'}) },
    { id: "agenda-desarrollo-ud", label: t('campos.dashboard.desarrolloUnidadEnCursoTitulo', {defaultValue: 'Desarrollo de la unidad en curso'}) },
  ];

  return (
    <div className="flex min-h-screen bg-background relative">
      {isWizardOpen && (
        <WelcomeWizard
          onComplete={() => setWizardOpen(false)}
          fetchModules={fetchModules}
        />
      )}
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <StickyPageHeader
            icon={Calendar}
            title={t('nav.agenda', { defaultValue: 'Agenda' })}
            description={t('pages.agenda_desc', { defaultValue: 'Tus clases de hoy, la semana y la unidad en curso.' })}
          >
            {/* Índice de bloques -- dentro del header fijo (sticky top-0), así
                que no se pierde al hacer scroll. */}
            <SectionIndex items={SECTION_INDEX_ITEMS} bare />
          </StickyPageHeader>

          <div className="w-full space-y-4 px-8 pt-4 pb-12">


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

          </div>
        </div>
      </div>
    </div>
      );
}

