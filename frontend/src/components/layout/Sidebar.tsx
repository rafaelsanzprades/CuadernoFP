"use client";
import { ChevronLeft, ChevronRight, CalendarDays, FolderOpen, Hourglass, Save, AlertTriangle, HelpCircle } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { navGroups, topLevelPages, inicioPage, legalPage } from '@/config/navigation';
import { getAcronym } from '@/utils/catalogFormat';
import { useEffect, useRef, useState } from 'react';
import React from 'react';
import { useMounted } from '@/hooks/useMounted';
import { Tooltip } from '@/components/ui/Tooltip';
import { InstallPwaButton } from '@/components/features/settings/InstallPwaButton';
import { fileManager } from '@/services/fileManager';
import { useTranslation } from "react-i18next";

export default function Sidebar() {
  const isMounted = useMounted();
  const pathname = usePathname();
  const { t } = useTranslation();
  const storeState = useAppStore();
  const { activeModuleId, activeCursoId, toggleSidebar, workspaceHandle, syncStatus, groupFileSource } = storeState;
  const isSidebarOpen = isMounted ? storeState.isSidebarOpen : true;
  const dataSource = isMounted ? storeState.dataSource : 'demo';
  const [localGroups, setLocalGroups] = useState<string[]>([]);

  useEffect(() => {
    if (workspaceHandle && dataSource === 'local') {
      fileManager.scanGroupsInWorkspace(workspaceHandle).then(gs => setLocalGroups(gs));
    }
  }, [workspaceHandle, dataSource]);

  // REALES sin nada cargado todavía: crea una Programación/Curso/Grupo en blanco
  // para que cualquier página muestre su formato normal en lugar de la tarjeta vacía.
  useEffect(() => {
    if (isMounted && dataSource === 'local' && !storeState.moduleData && !storeState.cursoData) {
      fileManager.createBlankLocalData();
    }
  }, [isMounted, dataSource, storeState.moduleData, storeState.cursoData]);

  // Active demo group is managed via local state now

  useEffect(() => {
    const savedScroll = sessionStorage.getItem('sidebar-scroll');
    if (savedScroll) {
      const elements = document.querySelectorAll('.sidebar-scroll-container');
      elements.forEach(el => {
        (el as HTMLElement).scrollTop = parseInt(savedScroll, 10);
      });
    }
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isSidebarOpen]);

  const [dateStr, setDateStr] = useState<string>("");
  const [timeStr, setTimeStr] = useState<string>("");
  const [dateCompactStr, setDateCompactStr] = useState<string>("");
  const [currentYear, setCurrentYear] = useState<number | string>("");
  const [displayGroup, setDisplayGroup] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const state = useAppStore.getState();
      const isDemo = state.dataSource === 'demo';
      const realNow = new Date();
      
      setCurrentYear(realNow.getFullYear());

      const currentYearVal = realNow.getFullYear();

      let day: number, monthStr: string, year: number;
      if (isDemo) {
        day = 2;
        monthStr = "mayo";
        year = currentYearVal;
      } else {
        day = realNow.getDate();
        const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
        monthStr = months[realNow.getMonth()];
        year = currentYearVal;
      }

      const hours = String(realNow.getHours()).padStart(2, '0');
      const minutes = String(realNow.getMinutes()).padStart(2, '0');

      setDateStr(`${day} de ${monthStr} de ${year}`);
      setTimeStr(`${hours}:${minutes} h`);
      
      let versionValue = process.env.NEXT_PUBLIC_APP_VERSION;
      if (!versionValue || versionValue === 'unknown') {
        versionValue = "Desconocida";
      }
      setDateCompactStr(versionValue);

      let groupStr = "";
      if (state.activeCursoId) {
        const idUpper = state.activeCursoId.toUpperCase();
        const parts = state.activeCursoId.split('-');
        let extractedYear = parts[parts.length - 1];
        if (extractedYear && extractedYear.length === 2) {
          extractedYear = `20${parseInt(extractedYear) - 1}-${extractedYear}`;
        } else if (extractedYear && extractedYear.length === 6 && !extractedYear.includes('-')) {
          extractedYear = `${extractedYear.slice(0, 4)}-${extractedYear.slice(4)}`;
        } else if (!extractedYear || !extractedYear.includes('-')) {
          extractedYear = `${currentYearVal}-${String(currentYearVal + 1).slice(-2)}`;
        }
        const matchGroup = idUpper.match(/-([1-9][A-Z])/i);
        const suffix = matchGroup ? matchGroup[1].toUpperCase() : '';
        groupStr = `Curso ${extractedYear}${suffix ? ` - ${suffix}-GM` : ''}`;
      }
      setDisplayGroup(groupStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);

    const unsub = useAppStore.subscribe((state, prevState) => {
      if (state.activeCursoId !== prevState.activeCursoId || state.dataSource !== prevState.dataSource) updateTime();
    });

    return () => {
      clearInterval(interval);
      unsub();
    };
  }, [activeModuleId, dataSource]);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    sessionStorage.setItem('sidebar-scroll', e.currentTarget.scrollTop.toString());
  };

  let moduleTitleSuffix = 'CÓDIGO';
  if (storeState.pdFileSource?.fileName) {
    moduleTitleSuffix = storeState.pdFileSource.fileName.replace(/\.fpp$/, '').replace(/\.json$/, '');
  } else if (isMounted && activeModuleId) {
    const code = activeModuleId.split('-')[0];
    moduleTitleSuffix = code;
    const nombre = storeState.moduleData?.info_modulo?.nombre;
    const foundAcronym = nombre ? getAcronym(nombre) : '';
    if (foundAcronym) {
      moduleTitleSuffix = `${code} ${foundAcronym}`;
    } else if (dataSource === 'demo') {
      const parts = activeModuleId.split('-');
      if (parts.length >= 2 && parts[1] !== 'pd' && parts[1] !== 'curso') {
        moduleTitleSuffix = `${code} ${parts[1].toUpperCase()}`;
      }
    }
  }

  const cursoTitleSuffix = (() => {
    if (storeState.cursoFileSource?.fileName) {
      return storeState.cursoFileSource.fileName.replace(/\.fpc$/, '').replace(/\.json$/, '');
    }
    if (!isMounted || !activeCursoId) return 'AÑO';
    const idUpper = activeCursoId.toUpperCase();
    let yearMatch = idUpper.match(/20\d{2}-?\d{2}/);
    let extractedYear = '';
    if (yearMatch) {
      extractedYear = yearMatch[0].replace('-', '');
    } else {
      const today = new Date();
      const currentY = today.getMonth() < 6 ? today.getFullYear() - 1 : today.getFullYear();
      extractedYear = `${currentY}${String(currentY + 1).slice(-2)}`;
    }
    const matchGroup = idUpper.match(/([1-9][A-Z])/i);
    const suffix = matchGroup ? matchGroup[1].toUpperCase() : '';
    return `${extractedYear}${suffix ? ` ${suffix}-GM` : ''}`;
  })();

  const sidebarContent = (
    <>
      {/* ── Header: título + reloj + botón colapsar ── */}
      <div className={`px-4 pt-4 pb-2 flex ${isSidebarOpen ? 'justify-between' : 'justify-center'} items-start`}>
        {isSidebarOpen && (
          <div className="flex flex-col mb-3 w-full pr-2 min-w-0">
              <Link href="/inicio?tab=bienvenida" onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}>
                <h1 className={`text-heading font-extrabold leading-tight transition-colors tracking-tight whitespace-nowrap cursor-pointer ${dataSource === 'demo' ? 'text-warning hover:text-white' : 'text-success hover:text-white'}`}>
                  Cuaderno FP
                </h1>
              </Link>
              <div className="flex flex-col items-start mt-1 w-full gap-1">
                <span suppressHydrationWarning className="text-body text-muted/80 font-mono ml-0.5">
                  {isMounted ? timeStr : '\u00A0'}
                </span>
                <div suppressHydrationWarning className="border border-[var(--glass-border)] bg-background/50 px-2 py-0.5 rounded text-body text-muted/80 font-mono whitespace-nowrap shadow-sm ml-0.5">
                  Versión: {isMounted ? dateCompactStr : '...'}
                </div>
              </div>
          </div>
        )}
        <button onClick={toggleSidebar} className="text-muted hover:text-foreground p-1 rounded-md hover:bg-foreground/10 transition-colors mb-4">
          {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Navegación principal ── */}
      <nav
        aria-label="Navegación principal"
        onScroll={handleScroll}
        className={`sidebar-scroll-container flex-1 ${isSidebarOpen ? 'px-3' : 'px-2'} py-2 space-y-3 overflow-x-hidden overflow-y-auto scrollbar-hide`}
      >

        {/* ── División Fecha DEMO/REAL + Inicio + Agenda + Equivalencia / Ayuda: todo con el mismo espaciado ── */}
        <div className="flex flex-col gap-0.5 mb-2 shrink-0">
          {isSidebarOpen ? (
            <Link
              href="/archivos"
              onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
              className="mx-1 text-caption font-semibold tracking-wide flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              style={{ color: dataSource === 'demo' ? 'var(--warning)' : 'var(--success)' }}
            >
              <CalendarDays className="w-3.5 h-3.5 shrink-0" />
              <span suppressHydrationWarning className="truncate">
                {dataSource === 'demo' ? 'Fecha DEMO: ' : 'Fecha REAL: '}{isMounted ? dateStr : ''}
              </span>
            </Link>
          ) : (
            <div className="w-8 h-px bg-foreground/10 mx-auto" />
          )}
          {isSidebarOpen && <div className="h-px bg-[var(--glass-border)] mx-1" />}
          {[{ href: inicioPage.href, label: inicioPage.label, icon: inicioPage.icon }, { href: "/agenda", label: t('sidebar.agenda'), icon: CalendarDays }, ...topLevelPages].map((page) => {
            const basePath = page.href.split('?')[0];
            const linkContent = (
              <Link
                key={page.href}
                href={page.href}
                onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
                className={`flex items-center ${isSidebarOpen ? 'gap-2.5 px-3' : 'justify-center px-0'} py-1 rounded-lg transition-all duration-150 group
                  ${pathname === basePath
                    ? 'bg-foreground/10 text-foreground'
                    : 'text-muted hover:text-foreground hover:bg-foreground/5 border border-transparent'
                  }`}
              >
                <span className={`flex items-center justify-center transition-transform duration-150 ${pathname === basePath ? (dataSource === 'demo' ? 'scale-110 text-warning' : 'scale-110 text-accent') : 'group-hover:scale-110'}`}>
                  <page.icon className="w-5 h-5" strokeWidth={1.75} />
                </span>
                {isSidebarOpen && (
                  <span className={`text-body leading-tight font-medium whitespace-nowrap ${pathname === basePath ? 'text-foreground font-semibold' : ''}`}>
                    {page.label}
                  </span>
                )}
              </Link>
            );
            return !isSidebarOpen ? (
              <Tooltip key={page.href} content={page.label} position="right" delay={0.1}>
                {linkContent}
              </Tooltip>
            ) : linkContent;
          })}
        </div>

        {/* Grupo (header + link) y ① General: items del primer grupo, mismo hueco que Programación/Curso */}
        {navGroups[0] && (
          <div className="flex flex-col gap-0.5 mt-2 relative z-20 shrink-0">
            {isSidebarOpen && (
              <div className="flex flex-col mb-0.5 gap-0.5">
                <div className="text-body font-bold text-foreground/90 tracking-wide px-1">
                  Grupo
                </div>

                <Link
                  href="/archivos"
                  onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
                  className="mx-1 text-caption font-semibold tracking-wide flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                  style={{ color: dataSource === 'demo' ? 'var(--warning)' : 'var(--success)' }}
                >
                  <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{groupFileSource.fileName ? groupFileSource.fileName.replace(/\.fpg$/, '') : t('sidebar.abrir_grupo')}</span>
                </Link>
                <div className="h-px bg-[var(--glass-border)]" />
              </div>
            )}
            {navGroups[0].items.map((item) => {
              const linkContent = (
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (item.href === "#wizard") {
                      e.preventDefault();
                      useAppStore.getState().setWizardOpen(true);
                    }
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                  className={`flex items-center ${isSidebarOpen ? 'gap-2.5 px-3' : 'justify-center px-0'} py-1 rounded-lg transition-all duration-150 group
                    ${pathname === item.href.split('?')[0]
                      ? 'bg-foreground/10 text-foreground'
                      : 'text-muted hover:text-foreground hover:bg-foreground/5 border border-transparent'
                    }`}
                >
                  <span className={`flex items-center justify-center transition-transform duration-150 ${pathname === item.href.split('?')[0] ? (dataSource === 'demo' ? 'scale-110 text-warning' : 'scale-110 text-accent') : 'group-hover:scale-110'}`}>
                    <item.icon className="w-5 h-5" strokeWidth={1.75} />
                  </span>
                  {isSidebarOpen && (
                    <span className={`text-body leading-tight font-medium whitespace-nowrap ${pathname === item.href.split('?')[0] ? 'text-foreground font-semibold' : ''}`}>
                      {t('nav.' + item.href.split('?')[0].replace('/', ''))}
                    </span>
                  )}
                </Link>
              );
              return !isSidebarOpen ? (
                <Tooltip key={item.href} content={t('nav.' + item.href.split('?')[0].replace('/', ''))} position="right" delay={0.1}>
                  {linkContent}
                </Tooltip>
              ) : (
                <React.Fragment key={item.href}>{linkContent}</React.Fragment>
              );
            })}
          </div>
        )}

        {/* ③ Programación + ④ Curso con info-box coloreada */}
        {navGroups.slice(1).map((group) => {
          // Extraer el texto base (sin corchetes) y el contenido entre corchetes
          const bracketMatch = group.title.match(/^(.*?)\s*\[.*\]$/);
          let baseTitle = bracketMatch ? bracketMatch[1].trim() : group.title;
          const translatedBaseTitle = baseTitle === "Programación" ? t('navGroups.programacion') : baseTitle === "Curso" ? t('navGroups.curso') : baseTitle;
          const isEmptyLocal = dataSource === 'local' && (
            group.title.includes('[Código del módulo]') ? !storeState.moduleData : !storeState.cursoData
          );
          const infoValue = group.title.includes('[Código del módulo]')
            ? (isEmptyLocal ? t('sidebar.abrir_grupo') : moduleTitleSuffix)
            : group.title.includes('[Año]')
              ? (isEmptyLocal ? t('sidebar.abrir_grupo') : cursoTitleSuffix)
              : null;

          return (
            <div key={group.title} className="flex flex-col gap-0.5">
              {isSidebarOpen && (
                <div className="flex flex-col mb-0.5 gap-0.5">
                  <div className="text-body font-bold text-foreground/90 tracking-wide px-1">
                    {translatedBaseTitle}
                  </div>
                  {infoValue && infoValue !== 'CÓDIGO' && infoValue !== 'AÑO' && (
                    <Link
                      href="/archivos"
                      onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
                      className="mx-1 text-caption font-semibold tracking-wide flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                      style={{
                        color: dataSource === 'demo' ? 'var(--warning)' : 'var(--success)',
                      }}
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      {infoValue}
                    </Link>
                  )}
                  <div className="h-px bg-[var(--glass-border)]" />
                </div>
              )}
              {!isSidebarOpen && group.title && (
                <div className="w-8 h-px bg-foreground/10 mx-auto my-2" />
              )}
              {group.items.map((item) => {
                const linkContent = (
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      if (item.href === "#wizard") {
                        e.preventDefault();
                        useAppStore.getState().setWizardOpen(true);
                      }
                      if (window.innerWidth < 1024) toggleSidebar();
                    }}
                    className={`flex items-center ${isSidebarOpen ? 'gap-2.5 px-3' : 'justify-center px-0'} py-1 rounded-lg transition-all duration-150 group
                      ${pathname === item.href.split('?')[0]
                        ? 'bg-foreground/10 text-foreground'
                        : 'text-muted hover:text-foreground hover:bg-foreground/5 border border-transparent'
                      }`}
                  >
                    <span className={`flex items-center justify-center transition-transform duration-150 ${pathname === item.href.split('?')[0] ? (dataSource === 'demo' ? 'scale-110 text-warning' : 'scale-110 text-accent') : 'group-hover:scale-110'}`}>
                      <item.icon className="w-5 h-5" strokeWidth={1.75} />
                    </span>
                    {isSidebarOpen && (
                      <span className={`text-body leading-tight font-medium whitespace-nowrap ${pathname === item.href.split('?')[0] ? 'text-foreground font-semibold' : ''}`}>
                        {t('nav.' + item.href.split('?')[0].replace('/', ''))}
                      </span>
                    )}
                  </Link>
                );
                return !isSidebarOpen ? (
                  <Tooltip key={item.href} content={t('nav.' + item.href.split('?')[0].replace('/', ''))} position="right" delay={0.1}>
                    {linkContent}
                  </Tooltip>
                ) : (
                  <React.Fragment key={item.href}>{linkContent}</React.Fragment>
                );
              })}
            </div>
          );
        })}
      </nav>

        {/* 🔻 Footer 🔻 */}
        <div className={`px-4 py-3 border-t border-[var(--glass-border)] flex flex-col items-center gap-1.5`}>
          {(() => {
            const isActive = pathname === '/legal';
            const linkContent = (
              <Link
                href={legalPage.href}
                onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
                className={`flex items-center w-full ${isSidebarOpen ? 'gap-2.5 px-3' : 'justify-center px-0'} py-1 rounded-lg transition-all duration-150 group
                  ${isActive
                    ? 'bg-foreground/10 text-foreground'
                    : 'text-muted hover:text-foreground hover:bg-foreground/5 border border-transparent'
                  }`}
              >
                <span className="flex items-center justify-center transition-transform duration-150 group-hover:scale-110">
                  <legalPage.icon className="w-4 h-4" strokeWidth={1.75} />
                </span>
                {isSidebarOpen && (
                  <span className="text-caption leading-tight font-medium whitespace-nowrap">
                    {legalPage.label}
                  </span>
                )}
              </Link>
            );
            return !isSidebarOpen ? (
              <Tooltip content={legalPage.label} position="right" delay={0.1}>
                {linkContent}
              </Tooltip>
            ) : linkContent;
          })()}
          {isSidebarOpen ? (
            <div className="flex w-full items-center gap-2">
              <InstallPwaButton isSidebarOpen={true} />
            </div>
          ) : (
          <div className="flex flex-col items-center gap-2 w-full">
            <InstallPwaButton isSidebarOpen={false} />
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[90] lg:hidden"
          onClick={() => toggleSidebar()}
        />
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex ${isSidebarOpen ? 'w-64' : 'w-[4.5rem]'} sticky top-0 h-screen border-r border-[var(--glass-border)] bg-background flex-col flex-shrink-0 transition-all duration-300 z-50`}>
        {sidebarContent}
      </aside>

      {/* Mobile sidebar (overlay) */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-[100] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64 border-r border-[var(--glass-border)] bg-background flex flex-col transition-transform duration-300`}>
        {sidebarContent}
      </aside>
    </>
  );
}
