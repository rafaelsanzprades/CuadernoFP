"use client";
import { AlertOctagon, BarChart, Calendar, FileText, History } from "lucide-react";
import { TabSync } from "@/components/ui/TabSync";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { WelcomeWizard } from "@/components/features/dashboard/WelcomeWizard";
import { useModulesList } from "@/hooks/useApi";
import { useEffect, useState } from "react";
import { ResumenTrimestralTab } from "@/components/features/evaluacion/ResumenTrimestralTab";
import { HistorialCalificacionesTab } from "@/components/features/evaluacion/HistorialCalificacionesTab";
import { ReclamacionesTab } from "@/components/features/evaluacion/ReclamacionesTab";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DetalleAlumnadoTab } from "@/components/features/evaluacion/DetalleAlumnadoTab";
import { StickyPageHeader } from "@/components/ui/StickyPageHeader";
import { IndiceAlumnadoPanel } from "@/components/features/alumnado/PanelPorAlumno";
import { SectionIndex } from "@/components/ui/SectionIndex";
import { getApiBase } from "@/services/apiBase";

export default function AgendaPage() {
  const { t } = useTranslation();
  const {
    isWizardOpen, setWizardOpen, activeModuleId,
    moduleData, setModuleData, activeCursoId, cursoData, setCursoData,
  } = useAppStore();
  const [activeTab, setActiveTab] = useState("academicas");
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

  // Calificaciones (ruta /calificaciones, antes /agenda): Notas (traída de
  // Alumnado, 2026-10-05) y Plano de aula.
  const reclamacionesPendientes = (cursoData?.df_reclamaciones || []).filter((r: any) => r.estado === "pendiente").length;
  const TABS = [
    { id: "academicas", label: <><span className="inline-flex"><FileText className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.alumnado.academicas.label', {defaultValue: 'Académicas'})}</>, cleanLabel: t('tabs.alumnado.academicas.label', {defaultValue: 'Académicas'}) },
    { id: "trimestral", label: <><span className="inline-flex"><BarChart className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.calificaciones.resumenTrimestral', {defaultValue: 'Trimestral'})}</>, cleanLabel: t('tabs.calificaciones.resumenTrimestral', {defaultValue: 'Trimestral'}) },
    // Traída desde Cierre (antes pestaña "Histórico", 2026-10-05).
    { id: "reclamaciones", label: <><span className="inline-flex"><AlertOctagon className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.calificaciones.reclamaciones.label', {defaultValue: 'Reclamaciones'})}
        {reclamacionesPendientes > 0 && (
          <span className="ml-1.5 inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-danger text-white text-[10px] font-bold leading-none">
            {reclamacionesPendientes}
          </span>
        )}
      </>, cleanLabel: t('tabs.calificaciones.reclamaciones.label', {defaultValue: 'Reclamaciones'}) },
  ];
  const activeTabCleanLabel = TABS.find(tab => tab.id === activeTab)?.cleanLabel;

  const TAB_DESCRIPTIONS: Record<string, string> = {
    academicas: t('tabs.alumnado.academicas.desc', {defaultValue: 'Entrada de notas numéricas por alumnado, instrumento de evaluación y nivel de adquisición de RA.'}),
    trimestral: t('tabs.calificaciones.resumen.desc', {defaultValue: 'Notas del grupo por instrumento y trimestre.'}),
    reclamaciones: t('tabs.calificaciones.historico.desc', {defaultValue: 'Registro de cambios de nota y reclamaciones presentadas por el alumnado.'}),
  };

  const SECTION_INDEX_ITEMS: Record<string, { id: string; label: string }[]> = {
    reclamaciones: [
      { id: "calificaciones-historico-cambios", label: t('tabs.calificaciones.cambiosNota', {defaultValue: 'Cambios de nota'}) },
      { id: "calificaciones-historico-reclamaciones", label: t('tabs.calificaciones.reclamaciones.label', {defaultValue: 'Reclamaciones'}) },
    ],
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

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <StickyPageHeader
            icon={Calendar}
            title={t('nav.calificaciones', { defaultValue: 'Calificaciones' })}
            description={t('pages.agenda_desc', { defaultValue: 'Notas, boletín y valoración en la empresa (FEOE) por alumnado.' })}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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

            <p className="text-body text-muted mt-3">
              {TAB_DESCRIPTIONS[activeTab]}
            </p>

            {/* Índice de bloques de la pestaña activa -- dentro del header
                fijo (sticky top-0), así que no se pierde al hacer scroll. */}
            <SectionIndex items={SECTION_INDEX_ITEMS[activeTab] || []} bare />

            {activeTab === 'academicas' && <IndiceAlumnadoPanel className="mt-3" />}
          </StickyPageHeader>

          <div className="w-full space-y-4 px-8 pt-4 pb-12">


            {activeTab === "academicas" && (
              <div className="animate-in fade-in duration-500 w-full">
                <DetalleAlumnadoTab />
              </div>
            )}

            {activeTab === "trimestral" && (
              <div className="animate-in fade-in duration-500 w-full">
                <ResumenTrimestralTab />
              </div>
            )}

            {activeTab === "reclamaciones" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-3">
                  <SectionHeading id="calificaciones-historico-cambios" icon={History} scrollMt="260px">
                    {t('tabs.calificaciones.cambiosNota', {defaultValue: 'Cambios de nota'})}
                  </SectionHeading>
                  <HistorialCalificacionesTab />
                </div>
                <div className="space-y-3">
                  <SectionHeading id="calificaciones-historico-reclamaciones" icon={AlertOctagon} scrollMt="260px">
                    <span className="inline-flex items-center gap-2">
                      {t('tabs.calificaciones.reclamaciones.label', {defaultValue: 'Reclamaciones'})}
                      {reclamacionesPendientes > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-danger text-white text-[10px] font-bold leading-none">
                          {reclamacionesPendientes}
                        </span>
                      )}
                    </span>
                  </SectionHeading>
                  <ReclamacionesTab />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
      );
}

