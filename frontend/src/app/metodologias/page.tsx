"use client";
import { TabSync } from "@/components/ui/TabSync";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Target, Wrench, Users, Layers, FolderOpen, Lightbulb, Settings, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import type { ModuleData } from "@/types";
import { MetodologiaTab } from "@/components/features/modulo/MetodologiaTab";
import { EvaluacionRecursosTab } from "@/components/features/modulo/EvaluacionRecursosTab";
import { OtrosElementosTab } from "@/components/features/modulo/OtrosElementosTab";
import { ContingenciaTab } from "@/components/features/modulo/ContingenciaTab";
import { DiversidadTab } from "@/components/features/modulo/DiversidadTab";
import { InnovacionTab } from "@/components/features/modulo/InnovacionTab";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { StickyPageHeader } from "@/components/ui/StickyPageHeader";
import { SectionIndex } from "@/components/ui/SectionIndex";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getApiBase } from "@/services/apiBase";

export default function MetodologiaConfigPage() {
  const { t } = useTranslation();
  const { activeModuleId, moduleData, setModuleData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("estrategias");

  useEffect(() => {
    fetch(`${getApiBase()}/api/module/${activeModuleId}`)
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
            setModuleData(merged as unknown as ModuleData);
          } else {
            setModuleData(json.data);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeModuleId, setModuleData]);

  const TABS = [
    { id: "estrategias", label: <span className="flex items-center gap-2"><Target className="w-4 h-4 shrink-0" /> {t('tabs.metodologia.metodologia.label', {defaultValue: 'Estrategias e innovación'})}</span>, cleanLabel: t('tabs.metodologia.metodologia.label', {defaultValue: 'Estrategias e innovación'}) },
    { id: "instrumentos-recursos", label: <span className="flex items-center gap-2"><Wrench className="w-4 h-4 shrink-0" /> {t('tabs.metodologia.instrumentosRecursos.label', {defaultValue: 'Instrumentos y recursos'})}</span>, cleanLabel: t('tabs.metodologia.instrumentosRecursos.label', {defaultValue: 'Instrumentos y recursos'}) },
    { id: "diversidad", label: <span className="flex items-center gap-2"><Users className="w-4 h-4 shrink-0" /> {t('tabs.metodologia.diversidad.label', {defaultValue: 'Atención a la diversidad'})}</span>, cleanLabel: t('tabs.metodologia.diversidad.label', {defaultValue: 'Atención a la diversidad'}) },
    { id: "contingencia", label: <span className="flex items-center gap-2"><Shield className="w-4 h-4 shrink-0" /> {t('tabs.metodologia.contingencia.label', {defaultValue: 'Plan de contingencia'})}</span>, cleanLabel: t('tabs.metodologia.contingencia.label', {defaultValue: 'Plan de contingencia'}) },
    { id: "transversales", label: <span className="flex items-center gap-2"><Layers className="w-4 h-4 shrink-0" /> {t('tabs.metodologia.transversales.label', {defaultValue: 'Transversales'})}</span>, cleanLabel: t('tabs.metodologia.transversales.label', {defaultValue: 'Transversales'}) },
  ];

  const activeTabCleanLabel = TABS.find(tab => tab.id === activeTab)?.cleanLabel;

  const TAB_DESCRIPTIONS: Record<string, string> = {
    estrategias: t('tabs.metodologia.metodologia.desc', {defaultValue: 'Estrategias metodológicas y coordinación docente, e innovación e intermodularidad.'}),
    'instrumentos-recursos': t('tabs.metodologia.instrumentosRecursos.desc', {defaultValue: 'Instrumentos de evaluación seleccionados y recursos y espacios necesarios.'}),
    diversidad: t('tabs.metodologia.diversidad.desc', {defaultValue: 'Marco de inclusión, atención a la diversidad, plan DUA y panel de alumnado ACNEAE.'}),
    contingencia: t('tabs.metodologia.contingencia.desc', {defaultValue: 'Planes de contingencia y adaptación ante situaciones excepcionales.'}),
    transversales: t('tabs.metodologia.transversales.desc', {defaultValue: 'Elementos transversales, competencias clave, competencias digitales y estándares y objetivos del currículo.'}),
  };

  // Índice de bloques -- solo en las pestañas con 2+ bloques reales.
  const SECTION_INDEX_ITEMS: Record<string, { id: string; label: string }[]> = {
    metodologias: [
      { id: "metodologia-metodologia", label: t('campos.modulo.metodologiaTitulo', {defaultValue: 'Metodología'}) },
      { id: "metodologia-innovacion", label: t('campos.modulo.tituloInnovacionIntermodularidad', {defaultValue: 'Innovación e Intermodularidad'}) },
    ],
    diversidad: [
      { id: "metodologia-marco-inclusion", label: t('campos.modulo.marcoInclusionTitulo', {defaultValue: 'Marco de Inclusión (D 91/2024 Art. 29)'}) },
      { id: "metodologia-f1-diversidad", label: t('campos.modulo.f1AtencionDiversidadTitulo', {defaultValue: 'Atención a la diversidad'}) },
      { id: "metodologia-plan-dua", label: t('campos.modulo.planDuaTitulo', {defaultValue: 'Plan de Atención a la Diversidad (DUA)'}) },
      { id: "metodologia-acneae", label: t('campos.modulo.panelAcneaeTitulo', {defaultValue: 'Panel de ACNEAE'}) },
    ],
    contingencia: [
      { id: "metodologia-contingencia-medidas", label: t('campos.modulo.tituloMedidasContingencia', {defaultValue: 'Medidas de contingencia'}) },
      { id: "metodologia-contingencia-registro", label: t('campos.modulo.tituloRegistroEscenariosContingencia', {defaultValue: 'Registro de escenarios de contingencia'}) },
      { id: "metodologia-contingencia-plan", label: t('campos.modulo.tituloPlanContingencia', {defaultValue: 'Plan de Contingencia'}) },
    ],
    transversales: [
      { id: "metodologia-transversales", label: t('campos.modulo.transversalesCompetenciasTitulo', {defaultValue: 'Transversales y Competencias'}) },
      { id: "metodologia-digcomp", label: t('campos.modulo.competenciasDigitalesTitulo', {defaultValue: 'Competencias digitales (DigComp / DigCompEdu)'}) },
      { id: "metodologia-estandares", label: t('campos.modulo.estandaresObjetivosTitulo', {defaultValue: 'Estándares y Objetivos (Currículo)'}) },
    ],
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
                <h2 className="text-heading font-bold">{t('campos.comun.sinProgramacionCargadaTitulo', {defaultValue: 'No hay programación cargada'})}</h2>
                <p className="text-muted mb-4">{t('campos.comun.sinProgramacionCargadaDesc', {defaultValue: 'Debes abrir o crear un archivo de programación en tu Archivos.'})}</p>
                <Link href="/inicio?tab=datos">
                  <Button variant="primary" className="gap-2">
                    <FolderOpen className="w-4 h-4" /> {t('common.ir_a_mis_archivos', {defaultValue: 'Ir a mis archivos'})}
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
          <main id="main-content" tabIndex={-1} className="flex-1 p-8 content-area">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
              <p>{t('campos.contexto.cargandoDatosMetodologia', {defaultValue: 'Cargando datos de metodología...'})}</p>
            </div>
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
        <main id="main-content" tabIndex={-1} className="flex-1 content-area overflow-y-auto scrollbar-hide">
          <StickyPageHeader
            icon={Lightbulb}
            title={t('nav.metodologias', { defaultValue: 'Metodologías' })}
            description={t('pages.metodologia_desc', { defaultValue: 'Estrategias metodológicas, recursos, espacios y atención a la diversidad.' })}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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

            {/* Descripción de la pestaña activa -- texto plano, sin cajón,
                mismo patrón que Inicio/Ayuda/MagIA/Normativa/Legal */}
            <p className="text-body text-muted mt-3">
              {TAB_DESCRIPTIONS[activeTab] || 'Configuración de la metodología.'}
            </p>

            {/* Índice de bloques de la pestaña activa -- dentro del header
                fijo (sticky top-0), así que no se pierde al hacer scroll. */}
            <SectionIndex items={SECTION_INDEX_ITEMS[activeTab] || []} bare />
          </StickyPageHeader>

          <MotionWrapper className="px-8 pt-4 pb-12">

            <div className="space-y-6">
              {activeTab === 'estrategias' && <><MetodologiaTab /><InnovacionTab /></>}
              {activeTab === 'instrumentos-recursos' && <EvaluacionRecursosTab />}
              {activeTab === 'diversidad' && <DiversidadTab />}
              {activeTab === 'contingencia' && <ContingenciaTab />}
              {activeTab === 'transversales' && <OtrosElementosTab />}
            </div>

          </MotionWrapper>
        </main>
      </div>
    </div>
  );
}
