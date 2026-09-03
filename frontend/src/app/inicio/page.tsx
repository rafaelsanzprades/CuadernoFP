"use client";
import { Activity, ArrowRight, BookOpen, GraduationCap, Users, Send, Info, Shield, Map, MessageCircle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { navGroups } from "@/config/navigation";
import { EqavetTab } from "@/components/features/modulo/EqavetTab";
import { PropuestasTab } from "@/components/features/modulo/PropuestasTab";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { TabSync } from "@/components/ui/TabSync";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/ui/PageHeader";
import { TabInfoBox } from "@/components/ui/TabInfoBox";
import { AIWizardModal } from "@/components/features/ai/AIWizardModal";
import { TabDocumentos } from "@/components/features/ayuda/TabDocumentos";
import { RecentModulesPanel } from "@/components/features/dashboard/RecentModulesPanel";
import { Button } from "@/components/ui/Button";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

// ── Página Principal ──────────────────────────────────────────────────────
export default function InicioPage() {
  const { moduleData, cursoData, globalData, activeModuleId, activeCursoId, dataSource } = useAppStore();
  const [activeTab, setActiveTab] = useState<string>("bienvenida");
  const { t } = useTranslation();
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const TABS = [
    { id: "bienvenida", label: <><span className="inline-flex"><Info className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.bienvenida')}</>, cleanLabel: t('tabs.bienvenida') },
    { id: "contribuciones", label: <><span className="inline-flex"><Users className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.inicio.contribuciones.label', {defaultValue: 'Contribuciones'})}</>, cleanLabel: t('tabs.inicio.contribuciones.label', {defaultValue: 'Contribuciones'}) },
    { id: "documentos", label: <><span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.ayuda.documentos.label', {defaultValue: 'Documentos'})}</>, cleanLabel: t('tabs.ayuda.documentos.label', {defaultValue: 'Documentos'}) },
    { id: "mejora", label: <><span className="inline-flex"><Shield className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.inicio.mejora.label', {defaultValue: 'Mejora'})}</>, cleanLabel: t('tabs.inicio.mejora.label', {defaultValue: 'Mejora'}) },
  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  const TAB_DESCRIPTIONS: Record<string, string> = {
    bienvenida: t('tabs.inicio.bienvenida.desc', {defaultValue: 'Panel de control de acceso rápido a todas las herramientas.'}),
    contribuciones: t('tabs.inicio.contribuciones.desc', {defaultValue: 'Comunidad de Telegram y listado de personas que contribuyen activamente al proyecto.'}),
    documentos: t('tabs.ayuda.documentos.desc', {defaultValue: 'Currículos, guías y documentos de referencia descargables.'}),
    mejora: t('tabs.inicio.mejora.desc', {defaultValue: 'Gestión de la calidad, evaluación del proceso e indicadores para el módulo.'}),
  };

  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar />
      <AIWizardModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onSuccess={(data) => {
          toast.success(t('toasts.inicio.estructuraGuardada', {defaultValue: "Estructura guardada."}));
        }}
      />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />
        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-4 pb-12">


            <PageHeader icon={Activity} title={t('inicio.title')} description={t('inicio.subtitle')} />

            {/* Pestañas de Navegación */}
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

            {/* ── CONTENIDO: BIENVENIDA ──────────────────────────────── */}
            {activeTab === "bienvenida" && (
              <div className="animate-in fade-in duration-500 w-full">

          <div className="w-full space-y-12 pb-12">

            {/* Módulos recientes (ítem 35) — reabrir con un clic, no se muestra si no hay ninguno */}
            <RecentModulesPanel />

            {/* Posicionamiento: metodología experta detrás de la app */}
            <Card className="p-6 border border-accent/20 bg-accent/5">
              <div className="flex items-start gap-3 mb-4">
                <GraduationCap className="w-6 h-6 text-accent mt-0.5 shrink-0" />
                <div>
                  <h2 className="text-subheading font-bold text-foreground">Una herramienta construida sobre metodología específica</h2>
                  <p className="text-body text-muted mt-1">
                    Cuaderno FP sigue las referencias bibliográficas actualizadas a la nueva ley de FP, las orientaciones de la Inspección Educativa, los principales autores de referencia y las guías oficiales de las administraciones educativas: <strong className="text-foreground">los Resultados de Aprendizaje (RA) son el eje causal</strong> del que se considera debe derivar todo lo demás en una programación didáctica.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-3 text-body font-semibold text-muted border-t border-[var(--glass-border)] pt-4">
                {[
                  "Identificación", "Introducción, justificación y normativa", "Contextualización",
                  "Objetivos y competencias", "Carácter intermodular y dual", "Contenidos centrados en RA",
                  "Situaciones de aprendizaje", "Metodología e inclusión",
                  "Evaluación (aprendizaje / prácticas / excepciones)", "Actividades complementarias",
                  "Atención a la diversidad y recursos",
                ].map((step, i, arr) => (
                  <span key={step} className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-full bg-foreground/5 border border-[var(--glass-border)] text-foreground/80">{step}</span>
                    {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-muted/50 shrink-0" />}
                  </span>
                ))}
              </div>
            </Card>

            {/* Menus Grid: los 4 bloques (Inicio, Grupo, Programación, Curso), todos con el mismo trato */}
            <div className="space-y-12">
              {navGroups.map((group, groupIdx) => {
                const baseTitle = group.title.replace(/\s*\[.*\]$/, '');
                const translatedTitle = baseTitle === "Inicio" ? t('navGroups.inicio', { defaultValue: 'Inicio' })
                  : baseTitle === "Grupo" ? t('navGroups.grupo', { defaultValue: 'Grupo' })
                  : baseTitle === "Programación" ? t('navGroups.programacion', { defaultValue: 'Programación' })
                  : baseTitle === "Curso" ? t('navGroups.curso', { defaultValue: 'Curso' })
                  : baseTitle;
                const translatedSectionDesc = baseTitle === "Inicio" ? t('navGroups.inicio_desc', { defaultValue: group.sectionDescription })
                  : baseTitle === "Grupo" ? t('navGroups.grupo_desc', { defaultValue: group.sectionDescription })
                  : baseTitle === "Programación" ? t('navGroups.programacion_desc', { defaultValue: group.sectionDescription })
                  : baseTitle === "Curso" ? t('navGroups.curso_desc', { defaultValue: group.sectionDescription })
                  : group.sectionDescription;
                return (
                <MotionWrapper key={group.title} delay={groupIdx * 0.1}>
                  <div className="space-y-3">
                    <h2 className="text-subheading font-bold text-foreground flex items-center gap-3">
                      {translatedTitle}
                    </h2>
                    {group.sectionDescription && (
                      <div className="pb-4 border-b border-[var(--glass-border)]">
                        <p className="text-muted text-body">
                          {translatedSectionDesc}
                        </p>
                      </div>
                    )}


                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {group.items.map((item, itemIdx) => {
                        const itemBasePath = item.href.split('?')[0];
                        return (
                        <Link key={item.href} href={item.href} className="block group">
                          <Card className="h-full p-5 flex flex-col gap-3 border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-accent/5 hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="text-heading group-hover:scale-110 transition-transform duration-300">
                                <item.icon className="w-8 h-8" strokeWidth={1.5} />
                              </div>
                              <h3 className="font-bold text-body text-foreground group-hover:text-accent transition-colors leading-tight">
                                {t('nav.' + itemBasePath.replace('/', ''), { defaultValue: item.label })}
                              </h3>
                            </div>
                            {item.description && (
                              <p className="text-body text-muted mt-auto">
                                {t('navDesc.' + itemBasePath.replace('/', ''), { defaultValue: item.description })}
                              </p>
                            )}
                          </Card>
                        </Link>
                        );
                      })}
                    </div>
                  </div>
                </MotionWrapper>
                );
              })}
            </div>

          </div>

              </div>
            )}

            {/* ── CONTENIDO: CONTRIBUCIONES ──────────────────────────────────────── */}
            {activeTab === "contribuciones" && (
              <div className="space-y-12 animate-in fade-in duration-500">
                <section className="space-y-6">
                  <div className="flex flex-col md:flex-row items-center gap-5 p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl shadow-sm mb-8">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-[#229ED9]/10 flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-[#229ED9]" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-body font-bold text-foreground">Grupo oficial de Telegram</h3>
                      <p className="text-body text-muted leading-tight mt-1">
                        Grupo oficial de desarrollo y testeo de la App web gratuita de Cuaderno FP. Sube tus sugerencias, reporta bugs o colabora aportando el currículo oficial de tu Comunidad Autónoma.
                      </p>
                    </div>
                    <a
                      href="https://t.me/cuadernofp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 px-5 py-2.5 rounded-lg bg-[#229ED9] text-white font-medium hover:bg-[#229ED9]/90 transition-colors flex items-center gap-2 text-body"
                    >
                      <Send className="w-4 h-4" />
                      Unirme al grupo en Telegram
                    </a>
                  </div>

                  <h3 className="text-heading font-bold text-foreground border-b border-[var(--glass-border)] pb-2">Contribuidores por Comunidad Autónoma</h3>
                  <p className="text-muted mb-4">
                    Mención especial al profesorado que está ayudando a mejorar y a integrar los currículos de las Comunidades Autónomas
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      "Andalucía", "Aragón", "Asturias", "Baleares", "Canarias",
                      "Cantabria", "Castilla y León", "Castilla-La Mancha", "Cataluña", "Ceuta",
                      "Comunidad Valenciana", "Extremadura", "Galicia", "La Rioja", "Madrid",
                      "Melilla", "Murcia", "Navarra", "País Vasco"
                    ].map((comunidad) => (
                      <div key={comunidad} className="p-4 rounded-xl border border-[var(--glass-border)] bg-background/50 flex flex-col gap-2 transition-all hover:bg-background/80">
                        <div className="flex items-center gap-2 border-b border-[var(--glass-border)] pb-2 mb-1">
                          <Map className="w-5 h-5 text-accent" />
                          <span className="font-bold text-foreground">{comunidad}</span>
                        </div>
                        <ul className="text-body text-muted space-y-1.5 pl-2">
                          {comunidad === "Aragón" ? (
                            <li className="flex items-center gap-2 text-foreground"><Users className="w-4 h-4 text-accent" /> Jose Javier García</li>
                          ) : (
                            <li className="flex items-center gap-2 italic opacity-60"><Users className="w-4 h-4 text-muted-foreground" /> ¡Anímate a contribuir!</li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* ── CONTENIDO: DOCUMENTOS ──────────────────────────────────────── */}
            {activeTab === "documentos" && (
              <div className="animate-in fade-in duration-500 w-full">
                <TabDocumentos />
              </div>
            )}

            {/* ── CONTENIDO: MEJORA ──────────────────────────────────────── */}
            {activeTab === "mejora" && (
              <div className="space-y-6 animate-in fade-in duration-500 w-full">
                <EqavetTab />
                <PropuestasTab />
              </div>
            )}

            </MotionWrapper>
        </div>
      </div>
    </div>
      );
}

