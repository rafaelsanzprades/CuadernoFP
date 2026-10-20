"use client";
import { TabSync } from "@/components/ui/TabSync";
import { FileEdit, FileText, Settings, Map, FolderOpen, Users } from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import type { ModuleData } from "@/types";
import { useTranslation } from "react-i18next";
import { DatosTab } from "@/components/features/modulo/DatosTab";
import { ContextoTab } from "@/components/features/modulo/ContextoTab";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { StickyPageHeader } from "@/components/ui/StickyPageHeader";
import { SectionIndex } from "@/components/ui/SectionIndex";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getApiBase } from "@/services/apiBase";

export default function ContextoConfigPage() {
  const { activeModuleId, moduleData, setModuleData, dataSource } = useAppStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("identificacion");

  // Enlaces antiguos: Evaluación y Procedimientos pasaron a la página Instrumentos
  useEffect(() => {
    if (activeTab === "evaluacion" || activeTab === "procedimientos") window.location.replace(`/instrumentos?tab=${activeTab}`);
  }, [activeTab]);

  useEffect(() => {
    if (dataSource === 'demo' && moduleData) {
      setLoading(false);
      return;
    }

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
  }, [activeModuleId, setModuleData, dataSource]);

  const TABS = [
    { id: "identificacion", label: <span className="flex items-center gap-2"><FileText className="w-4 h-4 shrink-0" /> {t('tabs.contexto.identificacion.label', {defaultValue: 'Identificación'})}</span>, cleanLabel: t('tabs.contexto.identificacion.label', {defaultValue: 'Identificación'}) },
    { id: "entorno", label: <span className="flex items-center gap-2"><Map className="w-4 h-4 shrink-0" /> {t('tabs.contexto.entorno.label', {defaultValue: 'Entorno'})}</span>, cleanLabel: t('tabs.contexto.entorno.label', {defaultValue: 'Entorno'}) },
    { id: "alumnado", label: <span className="flex items-center gap-2"><Users className="w-4 h-4 shrink-0" /> {t('tabs.contexto.alumnado.label', {defaultValue: 'Alumnado'})}</span>, cleanLabel: t('tabs.contexto.alumnado.label', {defaultValue: 'Alumnado'}) },
  ];

  const activeTabCleanLabel = TABS.find(tab => tab.id === activeTab)?.cleanLabel;

  const TAB_DESCRIPTIONS: Record<string, string> = {
    identificacion: t('tabs.contexto.identificacion.desc', {defaultValue: 'Centro y docente, módulo didáctico y datos de autoría y publicidad de la programación.'}),
    entorno: t('tabs.contexto.entorno.desc', {defaultValue: 'Entorno geográfico, socioeconómico, escolar e infraestructura, actividades complementarias y plan FEOE.'}),
    alumnado: t('tabs.contexto.alumnado.desc', {defaultValue: 'Alumnado con necesidades específicas (ACNEAE), datos y rasgos característicos del grupo y evaluación inicial.'}),
  };

  // Índice de bloques -- solo en las pestañas con 2+ bloques reales.
  const SECTION_INDEX_ITEMS: Record<string, { id: string; label: string }[]> = {
    identificacion: [
      { id: "datos-centro-docente", label: t('campos.modulo.tituloCentroDocente', {defaultValue: 'Centro y docente'}) },
      { id: "datos-modulo-didactico", label: t('campos.modulo.tituloModuloDidactico', {defaultValue: 'Módulo didáctico'}) },
      { id: "contexto-autoria-publicidad", label: t('campos.contexto.tituloAutoriaPublicidad', {defaultValue: 'Datos de autoría y publicidad'}) },
    ],
    entorno: [
      { id: "contexto-escolar", label: t('campos.contexto.tituloContextoEscolar', {defaultValue: 'Contexto escolar'}) },
      { id: "contexto-actividades", label: t('campos.contexto.tituloActividades', {defaultValue: 'Actividades complementarias y extraescolares'}) },
      { id: "planes-feoe", label: t('campos.modulo.tituloFeoe', {defaultValue: 'FEOE. Formación en empresa u organismo equiparado'}) },
    ],
    alumnado: [
      { id: "contexto-alumnado-acneae", label: t('campos.contexto.tituloAlumnadoAcneae', {defaultValue: 'Alumnado (ACNEAE)'}) },
      { id: "alumnado-rasgos-grupo", label: t('campos.alumnado.rasgosGrupoTitulo', {defaultValue: 'Rasgos característicos del grupo'}) },
      { id: "alumnado-perfil-pd", label: t('campos.alumnado.perfilPdTitulo', {defaultValue: 'Procedencia, implicación y expectativas'}) },
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
                <Link href="/archivos?tab=datos">
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
              <p>{t('campos.contexto.cargandoDatos', {defaultValue: 'Cargando datos del contexto...'})}</p>
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
            icon={FileEdit}
            title={t('nav.contexto', { defaultValue: 'Contexto' })}
            description={t('pages.contexto_desc', { defaultValue: 'Identificación, entorno y alumnado de la programación.' })}
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
              {TAB_DESCRIPTIONS[activeTab] || 'Configuración del contexto.'}{" "}
              <Link href="/archivos?tab=verificacion" className="text-accent hover:underline whitespace-nowrap">
                {t('botones.verificacion.verificarTrabajo', {defaultValue: 'Verificar mi trabajo'})} →
              </Link>
            </p>

            {/* Índice de bloques de la pestaña activa -- dentro del header
                fijo (sticky top-0), así que no se pierde al hacer scroll. */}
            <SectionIndex items={SECTION_INDEX_ITEMS[activeTab] || []} bare />
          </StickyPageHeader>

          <MotionWrapper className="px-8 pt-4 pb-12">

            {activeTab === "identificacion" && (
              <div className="space-y-8">
                <DatosTab bloques={["datos-centro-docente", "datos-modulo-didactico"]} />
                <ContextoTab bloques={["contexto-autoria-publicidad"]} />
              </div>
            )}
            {activeTab === "entorno" && <ContextoTab bloques={["contexto-escolar", "contexto-actividades", "planes-feoe"]} />}
            {activeTab === "alumnado" && (
              <div className="space-y-8">
                <ContextoTab bloques={["contexto-alumnado-acneae", "alumnado-rasgos-grupo"]} />
              </div>
            )}

          </MotionWrapper>
        </main>
      </div>
    </div>
  );
}

