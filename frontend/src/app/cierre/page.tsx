"use client";
import { TabSync } from "@/components/ui/TabSync";
import { Save, TrendingUp, FolderOpen, Shield, CalendarRange, Target, FileText } from "lucide-react";
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { loadCatalogForModule } from "@/services/catalogCache";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useTranslation } from "react-i18next";
import { ExpedienteAlumnoTab } from "@/components/features/alumnado/ExpedienteAlumnoTab";
import { IndiceAlumnadoPanel } from "@/components/features/alumnado/PanelPorAlumno";
import { PlanificacionMensualTab } from "@/components/features/dashboard/PlanificacionMensualTab";
import { ProgresoRaTab } from "@/components/features/evaluacion/ProgresoRaTab";
import { EqavetTab } from "@/components/features/modulo/EqavetTab";
import { PropuestasTab } from "@/components/features/modulo/PropuestasTab";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { StickyPageHeader } from "@/components/ui/StickyPageHeader";
import { SectionIndex } from "@/components/ui/SectionIndex";
import { SectionHeading } from "@/components/ui/SectionHeading";
import Link from "next/link";
import { getApiBase } from "@/services/apiBase";

export default function ProgresoPage() {
  const {
    activeModuleId,
    moduleData,
    setModuleData,
    activeCursoId,
    cursoData,
    setCursoData,
    saveCursoData
  } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveIsError, setSaveIsError] = useState(false);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("expediente");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeModuleId && !moduleData) {
          const res = await fetch(`${getApiBase()}/api/module/${activeModuleId}`);
          const data = await res.json();
          if (data.status === "success") setModuleData(data.data);
          loadCatalogForModule(activeModuleId, data.data?.info_modulo?.titulo_codigo);
        }
        if (activeCursoId && !cursoData) {
          const res = await fetch(`${getApiBase()}/api/module/${activeCursoId}`);
          const data = await res.json();
          if (data.status === "success") setCursoData(data.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
      setLoading(false);
    };

    if (activeModuleId || activeCursoId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [activeModuleId, moduleData, activeCursoId, cursoData, setModuleData, setCursoData]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage("");
    const ok = await saveCursoData();
    if (ok) {
      setSaveIsError(false);
      setSaveMessage(t('toasts.comun.guardadoCorrectamente', {defaultValue: 'Guardado correctamente'}));
      setTimeout(() => setSaveMessage(""), 3000);
    } else {
      setSaveIsError(true);
      setSaveMessage(t('toasts.comun.errorGuardar', {defaultValue: 'Error al guardar'}));
    }
    setSaving(false);
  };

  if (!activeModuleId || !activeCursoId) {
    return (
      <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1 p-8 content-area">
            <MotionWrapper>

              <Card className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl">
                <TrendingUp className="w-16 h-16 text-muted-foreground opacity-50" />
                <h2 className="text-heading font-bold">{t('campos.calificaciones.sinCursoNiProgramacionTitulo', {defaultValue: 'No hay curso ni programación cargada'})}</h2>
                <p className="text-muted mb-4">{t('campos.calificaciones.sinCursoNiProgramacionDesc', {defaultValue: 'Debes abrir o crear un archivo de programación y curso en tu Archivos.'})}</p>
                <Link href="/inicio?tab=datos">
                  <Button variant="primary" className="gap-2">
                    <FolderOpen className="w-4 h-4" /> {t('common.ir_a_mis_archivos', {defaultValue: 'Ir a mis archivos'})}
                  </Button>
                </Link>
              </Card>
            </MotionWrapper>
          </main>
        </div>
      </div>
    );
  }

  if (loading || !cursoData || !moduleData) {
    return <LoadingSpinner text={t('campos.calificaciones.cargandoDatosProgreso', {defaultValue: 'Cargando datos de progreso académico...'})} />;
  }


  // Ítem "reorganización Calificación" (2026-09-23, petición de Rafael): de 5
  // pestañas a 3, cada una con un switcher interno en vez de acordeones o
  // pestañas separadas para contenido muy afín -- mismo patrón que ya
  // validó Rafael para Análisis (Grupal/Individual). Histórico+Reclamaciones
  // se fusionan (las dos son un registro que está vacío hasta que se usa) y
  // Boletines+Expediente se fusionan (las dos son "ficha de un alumno",
  // comparten el mismo selector de alumnado, solo cambia si se ve un informe
  // formateado o la línea temporal en bruto).
  const TABS = [
    { id: "expediente", label: <><span className="inline-flex"><FileText className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.cierre.expediente.label', {defaultValue: 'Expediente'})}</>, cleanLabel: t('tabs.cierre.expediente.label', {defaultValue: 'Expediente'}) },
    { id: "avance-ud", label: <><span className="inline-flex"><CalendarRange className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.agenda.avance.label', {defaultValue: 'Avance de UD'})}</>, cleanLabel: t('tabs.agenda.avance.label', {defaultValue: 'Avance de UD'}) },
    { id: "progreso-ra-ud", label: <><span className="inline-flex"><Target className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.calificaciones.progresoRaUd', {defaultValue: 'Progreso RA-UD'})}</>, cleanLabel: t('tabs.calificaciones.progresoRaUd', {defaultValue: 'Progreso RA-UD'}) },
    { id: "mejora", label: <><span className="inline-flex"><Shield className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.inicio.mejora.label', {defaultValue: 'Mejora'})}</>, cleanLabel: t('tabs.inicio.mejora.label', {defaultValue: 'Mejora'}) },
  ];

  const TAB_DESCRIPTIONS: Record<string, string> = {
    expediente: t('tabs.cierre.expediente.desc', {defaultValue: 'Boletín individual, informe de evidencias e inserción laboral por alumnado.'}),
    'avance-ud': t('tabs.agenda.avance.desc', {defaultValue: 'Planificación y seguimiento mensual de las unidades didácticas según lo impartido.'}),
    'progreso-ra-ud': t('tabs.agenda.progresoRaUd.desc', {defaultValue: 'Progreso de los resultados de aprendizaje: nota del grupo, avance, horas y estado de las unidades didácticas de cada RA.'}),
    mejora: t('tabs.inicio.mejora.desc', {defaultValue: 'Gestión de la calidad, evaluación del proceso e indicadores para el módulo.'}),
  };

  // Índice de bloques -- solo en pestañas con 2+ bloques reales. resumen e
  // historico pasaron de switcher a bloques apilados con su propio
  // SectionHeading (petición de Rafael, 2026-10-01), mismo patrón que el
  // resto de la app. individual se eliminó como pestaña propia ese mismo
  // día: Boletín y Expediente pasaron a Alumnado -> Individual (Secciones 7
  // y 8), reutilizando el alumnado ya seleccionado allí en vez de duplicar
  // el selector. mejora es una pestaña apilada normal (EqavetTab +
  // PropuestasTab).
  const SECTION_INDEX_ITEMS: Record<string, { id: string; label: string }[]> = {
    mejora: [
      { id: "calificaciones-eqavet", label: t('checks.modulo.indicadoresCalidad', {defaultValue: 'Indicadores de calidad'}) },
      { id: "calificaciones-propuestas", label: t('campos.modulo.tituloPropuestasMejora', {defaultValue: 'Propuestas de mejora (PDCA)'}) },
    ],
  };

  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={TABS.find(t => t.id === activeTab)?.label} />

        <main className="flex-1 content-area overflow-y-auto scrollbar-hide">
          <StickyPageHeader icon={TrendingUp} title={t('nav.cierre', {defaultValue: 'Cierre'})} description={t('pages.evaluacion_desc')}>
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

              {/* Save Button */}
              <div className="flex items-center gap-4 shrink-0">
                {saveMessage && (
                  <span className={`text-body font-semibold ${saveIsError ? "text-danger" : "text-success"}`}>
                    {saveMessage}
                  </span>
                )}
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-accent text-background hover:bg-accent/80 font-bold px-6 py-2 rounded-xl flex items-center gap-2"
                >
                  {saving ? t('common.guardando', {defaultValue: 'Guardando...'}) : <>{t('common.guardar_cambios', {defaultValue: 'Guardar cambios'})} <span className="inline-flex"><Save className="w-[1.2em] h-[1.2em] mr-1" /></span></>}
                </Button>
              </div>
            </div>

            {/* Descripción de la pestaña activa -- texto plano, sin cajón,
                mismo patrón que Inicio/Ayuda/MagIA/Normativa/Legal */}
            <p className="text-body text-muted mt-3">
              {TAB_DESCRIPTIONS[activeTab] || 'Gestión de ' + activeTab}
            </p>

            {/* Índice de bloques de la pestaña activa -- individual resuelve
                a [] y no pinta nada (ver comentario junto a
                SECTION_INDEX_ITEMS). */}
            <SectionIndex items={SECTION_INDEX_ITEMS[activeTab] || []} bare />

            {activeTab === 'expediente' && <IndiceAlumnadoPanel className="mt-3" />}

          </StickyPageHeader>

          <MotionWrapper className="space-y-3 px-8 pt-4 pb-12">

          {/* TAB 1: RESUMEN -- fusiona (2026-09-20) lo que antes eran 3 pestañas
              aparte (Resumen, Estadísticas, Análisis) más "Progreso de RA y UD"
              (traído desde Seguimiento) en un único acordeón, para bajar de 6 a
              4 pestañas en esta página. De paso se quitaron dos gráficos de "RA"
              que llevaban datos inventados en vez de reales (ver 01 Histórico.md,
              entrada de esta misma fecha): el "Rendimiento medio por RA" de
              Estadísticas simulaba la nota a partir de la nota final +/- un
              desplazamiento fijo por índice de RA, y el "Rendimiento por RA" de
              Análisis Grupal usaba una onda seno sobre la media del grupo -- ninguno
              de los dos leía notas reales. El único gráfico de RA que queda aquí
              (bloque "Progreso RA-UD") es el que ya calculaba esto de verdad, vía
              Motor JEG.

              2026-10-01 (petición de Rafael): los 4 bloques, que habían
              pasado por acordeón (hasta 2026-09-23) y luego por switcher,
              se apilan de nuevo como bloques independientes con su propio
              SectionHeading + ancla, mismo patrón de índice que el resto de
              la app -- el switcher ocultaba 3 de cada 4 bloques sin razón
              una vez que la página ya tiene su propio índice de navegación
              rápida en el header. */}

          {/* TAB 2: HISTÓRICO -- fusiona (2026-09-23) Histórico de cambios de
              nota y Reclamaciones: las dos son un registro que en la
              práctica está vacío hasta que se usa. 2026-10-01 (petición de
              Rafael): de switcher a bloques apilados, mismo cambio que
              Resumen más arriba. */}

          {/* TAB 3: MEJORA -- traída desde Inicio (2026-09-25, petición de Rafael):
              calidad EQAVET y propuestas de mejora del módulo. */}
          {activeTab === "mejora" && (
            <div className="mt-4 animate-in fade-in duration-500 space-y-6">
              <EqavetTab />
              <PropuestasTab />
            </div>
          )}
          {activeTab === 'avance-ud' && (
            <div className="mt-4">
              <PlanificacionMensualTab />
            </div>
          )}

          {activeTab === 'progreso-ra-ud' && (
            <div className="mt-4">
              <ProgresoRaTab />
            </div>
          )}

          {activeTab === "expediente" && (
            <div className="mt-4 animate-in fade-in duration-500">
              <ExpedienteAlumnoTab />
            </div>
          )}
          </MotionWrapper>
        </main>
      </div>
    </div>
      );
}
