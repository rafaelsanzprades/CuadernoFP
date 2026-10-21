"use client";
import { Activity, Building2, CheckCircle, Info, Lock, Map, Shield } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { navGroups, PAGE_TABS } from "@/config/navigation";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionIndex } from "@/components/ui/SectionIndex";
import Link from "next/link";
import { TabSync } from "@/components/ui/TabSync";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { StickyPageHeader } from "@/components/ui/StickyPageHeader";
import { RecentModulesPanel } from "@/components/features/dashboard/RecentModulesPanel";
import { TarjetasBienvenida } from "@/components/features/dashboard/TarjetasBienvenida";
import { WelcomeWizard } from "@/components/features/dashboard/WelcomeWizard";
import { CifradoPanel } from "@/components/features/cifrado/CifradoPanel";
import { useTranslation } from "react-i18next";
import { fileManager } from "@/services/fileManager";

// ── Página principal: bienvenida, mapa de la aplicación y privacidad ───────
export default function InicioPage() {
  const { moduleData, cursoData, activeModuleId, activeCursoId, dataSource, isWizardOpen, setWizardOpen } = useAppStore();
  const [activeTab, setActiveTab] = useState<string>("bienvenida");
  const { t } = useTranslation();

  // Auto-load demo data on first visit
  useEffect(() => {
    if (dataSource === 'demo' && (!moduleData || !cursoData)) {
      fileManager.loadDemoData();
    }
  }, [dataSource, moduleData, cursoData]);

  // Navegador nuevo / sin datos locales (ningún archivo abierto todavía): ofrecer DEMO o crear archivos propios en vez de
  // dejar el panel en blanco. Se basa en el estado local (es local-first, el backend no es la fuente de verdad). Sincroniza en
  // ambas direcciones porque la rehidratación de zustand-persist desde IndexedDB es asíncrona. En modo «Reales» el docente ya
  // ha elegido trabajar con sus ficheros: el asistente no debe taparle la pantalla.
  useEffect(() => {
    setWizardOpen(!activeModuleId && !activeCursoId && dataSource !== 'local');
  }, [activeModuleId, activeCursoId, dataSource, setWizardOpen]);

  const TABS = [
    { id: "bienvenida", label: <><span className="inline-flex"><Info className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.bienvenida')}</>, cleanLabel: t('tabs.bienvenida') },
    { id: "mapa", label: <span className="flex items-center gap-2"><Map className="w-4 h-4 shrink-0" /> {t('tabs.inicio.mapa.label', {defaultValue: 'Mapa'})}</span>, cleanLabel: t('tabs.inicio.mapa.label', {defaultValue: 'Mapa'}) },
    { id: "privacidad", label: <span className="flex items-center gap-2"><Shield className="w-4 h-4 shrink-0" /> {t('tabs.inicio.privacidad.label', {defaultValue: 'Tu privacidad'})}</span>, cleanLabel: t('tabs.inicio.privacidad.label', {defaultValue: 'Tu privacidad'}) },
  ];

  const activeTabCleanLabel = TABS.find(tab => tab.id === activeTab)?.cleanLabel;

  // Título traducido de cada grupo del Mapa (sin el «[Código del módulo]» del sidebar)
  const tituloGrupo = (title: string) => {
    const base = title.replace(/\s*\[.*\]$/, '');
    return base === "General" ? t('navGroups.general', { defaultValue: 'General' })
      : base === "Programación" ? t('navGroups.programacion', { defaultValue: 'Programación' })
      : base === "Curso" ? t('navGroups.curso', { defaultValue: 'Curso' })
      : base;
  };

  // Índice de bloques de cada pestaña (también donde solo hay uno)
  const SECTION_INDEX_ITEMS: Record<string, { id: string; label: string }[]> = {
    bienvenida: [
      { id: "bienvenida-escritorio", label: t('campos.inicio.tarjetas.escritorio.titulo', {defaultValue: 'Aplicación de escritorio'}) },
      { id: "bienvenida-telegram", label: t('campos.inicio.tarjetas.telegram.titulo', {defaultValue: 'Comunidad en Telegram'}) },
      { id: "bienvenida-guia", label: t('campos.inicio.tarjetas.web.titulo', {defaultValue: 'Web con todos los contenidos'}) },
    ],
    mapa: navGroups.map((g, i) => ({ id: `mapa-grupo-${i}`, label: tituloGrupo(g.title) })),
    privacidad: [
      { id: "inicio-privacidad", label: t('campos.archivos.privacidadDisenoTitulo', {defaultValue: 'Tu privacidad por diseño'}) },
    ],
  };

  const TAB_DESCRIPTIONS: Record<string, string> = {
    bienvenida: t('tabs.inicio.bienvenida.desc', {defaultValue: 'Panel de control de acceso rápido a todas las herramientas.'}),
    mapa: t('tabs.inicio.mapa.desc', {defaultValue: 'Todas las páginas de la aplicación y las pestañas que contiene cada una.'}),
    privacidad: t('tabs.inicio.privacidad.desc', {defaultValue: 'Dónde van tus datos, el cifrado opcional y la seguridad de la aplicación.'}),
  };

  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      {isWizardOpen && (
        <WelcomeWizard
          onComplete={() => setWizardOpen(false)}
          fetchModules={() => {}}
        />
      )}
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto scrollbar-hide">
          <StickyPageHeader icon={Activity} title={t('inicio.title')} description={t('inicio.subtitle')}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsList className="max-w-full" bare>
                  {TABS.map(tab => (
                    <TabsTrigger key={tab.id} value={tab.id}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Descripción de la pestaña activa -- texto plano, sin cajón, mismo patrón que /legal */}
            <p className="text-body text-muted mt-3">
              {TAB_DESCRIPTIONS[activeTab] || 'Gestión de ' + activeTab}
            </p>

            <SectionIndex items={SECTION_INDEX_ITEMS[activeTab] || []} bare />

          </StickyPageHeader>

          <MotionWrapper className="space-y-4 px-8 pt-4 pb-[280px]">
            {/* ── CONTENIDO: BIENVENIDA ──────────────────────────────── */}
            {activeTab === "bienvenida" && (
              <div className="animate-in fade-in duration-500 w-full">
                <div className="w-full space-y-12 pb-12">

            <TarjetasBienvenida />

            {/* Módulos recientes (ítem 35) — reabrir con un clic, no se muestra si no hay ninguno */}
            <RecentModulesPanel />

                </div>
              </div>
            )}

            {/* ── CONTENIDO: MAPA ────────────────────────────────────── */}
            {activeTab === "mapa" && (
              <div className="animate-in fade-in duration-500 w-full">
                <div className="w-full space-y-12 pb-12">

            {/* Mapa del web: los 3 bloques (Inicio, Programación, Curso), cada
                baldosín lista también las pestañas que contiene esa página. */}
            <div className="space-y-3">
              <div className="space-y-12">
                {navGroups.map((group, groupIdx) => {
                  const baseTitle = group.title.replace(/\s*\[.*\]$/, '');
                  const translatedTitle = baseTitle === "General" ? t('navGroups.general', { defaultValue: 'General' })
                    : baseTitle === "Programación" ? t('navGroups.programacion', { defaultValue: 'Programación' })
                    : baseTitle === "Curso" ? t('navGroups.curso', { defaultValue: 'Curso' })
                    : baseTitle;
                  const translatedSectionDesc = baseTitle === "General" ? t('navGroups.general_desc', { defaultValue: group.sectionDescription })
                    : baseTitle === "Programación" ? t('navGroups.programacion_desc', { defaultValue: group.sectionDescription })
                    : baseTitle === "Curso" ? t('navGroups.curso_desc', { defaultValue: group.sectionDescription })
                    : group.sectionDescription;
                  return (
                  <MotionWrapper key={group.title} delay={groupIdx * 0.1}>
                    <div className="space-y-3">
                      <h3 id={`mapa-grupo-${groupIdx}`} style={{ scrollMarginTop: "260px" }} className="text-subheading font-bold text-foreground flex items-center gap-3">
                        {translatedTitle}
                      </h3>
                      {group.sectionDescription && (
                        <div className="pb-4 border-b border-[var(--glass-border)]">
                          <p className="text-muted text-body">
                            {translatedSectionDesc}
                          </p>
                        </div>
                      )}


                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {group.items.map((item, itemIdx) => {
                          const itemBasePath = item.href.split('?')[0];
                          const itemTabs = PAGE_TABS[itemBasePath] || [];
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
                                <p className="text-body text-muted">
                                  {t('navDesc.' + itemBasePath.replace('/', ''), { defaultValue: item.description })}
                                </p>
                              )}
                              {itemTabs.length > 0 && (
                                <div className="mt-auto pt-2 pl-2 grid grid-cols-1 gap-0.5 text-caption text-muted/80 border-l-2 border-[var(--glass-border)] ml-1">
                                  {itemTabs.map(tab => (
                                    <span key={tab.id}>— {t(`checks.ayuda.mapa_${itemBasePath.slice(1)}_${tab.id.replace(/[^a-z0-9]/gi, '_')}`, {defaultValue: tab.label})}</span>
                                  ))}
                                </div>
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
              </div>
            )}

            {/* ── CONTENIDO: PRIVACIDAD ──────────────────────────────── */}
            {activeTab === "privacidad" && (
              <div className="space-y-4 animate-in fade-in duration-300">

                {/* Seguridad y privacidad -- movida aquí desde el final de
                    Bienvenida (petición de Rafael, 2026-09-30; antes al
                    final de Datos desde 2026-09-23, luego a Bienvenida el
                    2026-09-26 -- vuelve a Datos, tiene más sentido junto al
                    resto de esta pestaña). Un único Card, sin cajón por
                    apartado -- mismo patrón que los "Paso N" de Ayuda >
                    Guía. */}
                <div className="space-y-3">
                <SectionHeading id="inicio-privacidad" icon={Shield} scrollMt="260px">
                  {t('campos.archivos.privacidadDisenoTitulo', {defaultValue: 'Tu privacidad por diseño'})}
                </SectionHeading>
                <Card className="p-6 space-y-6">
                  <p className="text-muted text-body">{t('campos.archivos.privacidadDisenoDesc', {defaultValue: 'Cómo se garantiza que tus datos reales son 100% tuyos.'})}</p>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground flex items-center gap-2"><Building2 className="w-5 h-5 text-accent"/> {t('campos.archivos.servidorCiegoTitulo', {defaultValue: '1. El servidor es ciego'})}</h4>
                    <p className="text-muted leading-relaxed text-body">{t('campos.archivos.servidorCiegoDesc', {defaultValue: 'Nuestra base de datos en la nube jamás almacena datos de tus alumnos, tus programaciones, ni nada que crees. El servidor web solo existe para enviarte los Catálogos Oficiales (BOE/BOCAA). Eres invisible para nuestro backend.'})}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground flex items-center gap-2"><Lock className="w-5 h-5 text-accent"/> {t('campos.archivos.cifradoLocalTitulo', {defaultValue: '2. Cifrado opcional de tus ficheros'})}</h4>
                    <CifradoPanel />
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground flex items-center gap-2"><CheckCircle className="w-5 h-5 text-accent"/> {t('campos.archivos.defensaAtaquesTitulo', {defaultValue: '3. Defensa contra ataques en el navegador'})}</h4>
                    <p className="text-muted leading-relaxed text-body">{t('campos.archivos.defensaAtaquesDesc', {defaultValue: 'Hemos implementado una política estricta de seguridad de contenido (CSP) para bloquear scripts maliciosos de terceros.'})}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground flex items-center gap-2"><Activity className="w-5 h-5 text-accent"/> {t('campos.archivos.servidorBlindadoTitulo', {defaultValue: '4. Servidor blindado y siempre disponible'})}</h4>
                    <p className="text-muted leading-relaxed text-body">{t('campos.archivos.servidorBlindadoDesc', {defaultValue: 'Nuestro servidor backend incorpora Rate Limiting, garantizando que siempre tendrás acceso al catálogo oficial de módulos.'})}</p>
                  </div>
                </Card>
                </div>

              </div>
            )}

          </MotionWrapper>
        </main>
      </div>
    </div>
  );
}
