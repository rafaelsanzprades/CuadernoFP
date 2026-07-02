"use client";
import { ChevronLeft, ChevronRight, CalendarDays, ChevronDown, Cloud, HardDrive, FolderOpen, Hourglass, Save, AlertTriangle } from "lucide-react";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { navGroups } from '@/config/navigation';
import { initialGroups } from '@/store/initialData';
import { useEffect, useRef, useState } from 'react';
import React from 'react';
import { Tooltip } from '@/components/ui/Tooltip';
import { InstallPwaButton } from '@/components/features/settings/InstallPwaButton';
import toast from 'react-hot-toast';
import { fileManager } from '@/services/fileManager';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeModuleId, activeCursoId, isSidebarOpen, toggleSidebar, dataSource, setDataSource, workspaceHandle, syncStatus } = useAppStore();
  const [localGroups, setLocalGroups] = useState<string[]>([]);

  useEffect(() => {
    if (workspaceHandle && dataSource === 'local') {
      fileManager.scanGroupsInWorkspace(workspaceHandle).then(gs => setLocalGroups(gs));
    }
  }, [workspaceHandle, dataSource]);

  const demoGroupValue = activeCursoId?.toUpperCase().includes('1B') ? '1b'
    : activeCursoId?.toUpperCase().includes('1C') ? '1c' : '1a';

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
  const [displayGroup, setDisplayGroup] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const state = useAppStore.getState();
      const isDemo = state.activeModuleId === '0237-ictve-pd';
      const realNow = new Date();
      const currentYear = realNow.getFullYear();

      let day: number, monthStr: string, year: number;
      if (isDemo) {
        day = 2;
        monthStr = "mayo";
        year = currentYear;
      } else {
        day = realNow.getDate();
        const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
        monthStr = months[realNow.getMonth()];
        year = currentYear;
      }

      const hours = String(realNow.getHours()).padStart(2, '0');
      const minutes = String(realNow.getMinutes()).padStart(2, '0');

      setDateStr(`${day} de ${monthStr} de ${year}`);
      setTimeStr(`${hours}:${minutes} h`);

      let groupStr = "";
      if (state.activeCursoId) {
        if (state.activeCursoId.includes('-1A') || state.activeCursoId.endsWith('1a')) groupStr = "Curso 2025-26 - 1A-GM";
        else if (state.activeCursoId.includes('-1B') || state.activeCursoId.endsWith('1b')) groupStr = "Curso 2025-26 - 1B-GM";
        else if (state.activeCursoId.includes('-1C') || state.activeCursoId.endsWith('1c')) groupStr = "Curso 2025-26 - 1C-GM";
        else groupStr = "Curso 2025-26";
      }
      setDisplayGroup(groupStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);

    const unsub = useAppStore.subscribe((state, prevState) => {
      if (state.activeCursoId !== prevState.activeCursoId) updateTime();
    });

    return () => {
      clearInterval(interval);
      unsub();
    };
  }, [activeModuleId]);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    sessionStorage.setItem('sidebar-scroll', e.currentTarget.scrollTop.toString());
  };

  let moduleTitleSuffix = activeModuleId ? activeModuleId.split('-')[0] : 'CÓDIGO';
  if (activeModuleId) {
    const code = activeModuleId.split('-')[0];
    for (const g of initialGroups) {
      const m = g.modules.find(mod => mod.code === code);
      if (m && m.acronym) {
        moduleTitleSuffix = `${code} ${m.acronym}`;
        break;
      }
    }
  }

  const cursoTitleSuffix = (() => {
    if (!activeCursoId) return 'AÑO';
    const idUpper = activeCursoId.toUpperCase();
    let group = '';
    if (idUpper.includes('-1A') || idUpper.endsWith('1A')) group = ' 1A-GM';
    else if (idUpper.includes('-1B') || idUpper.endsWith('1B')) group = ' 1B-GM';
    else if (idUpper.includes('-1C') || idUpper.endsWith('1C')) group = ' 1C-GM';
    else if (idUpper.includes('-2A') || idUpper.endsWith('2A')) group = ' 2A-GM';
    else if (idUpper.includes('-2B') || idUpper.endsWith('2B')) group = ' 2B-GM';
    return '2025-26' + group;
  })();

  const sidebarContent = (
    <>
      {/* ── Header: título + reloj + botón colapsar ── */}
      <div className={`px-4 pt-4 pb-2 flex ${isSidebarOpen ? 'justify-between' : 'justify-center'} items-start`}>
        {isSidebarOpen && (
          <div className="flex flex-col mb-3">
            <Link href="/inicio" onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}>
              <h1 className="text-[1.3rem] font-extrabold leading-tight text-foreground hover:text-info transition-colors tracking-tight whitespace-nowrap cursor-pointer">
                Cuaderno FP
              </h1>
            </Link>
            <span className="text-sm text-muted/80 font-mono mt-0.5 ml-0.5">{timeStr}</span>
          </div>
        )}
        <button onClick={toggleSidebar} className="text-muted hover:text-foreground p-1 rounded-md hover:bg-foreground/10 transition-colors mb-4">
          {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Agenda fijada (fuera del scroll) ── */}
      {isSidebarOpen && (
        <div className="px-3 pb-2 shrink-0">
          {(() => {
            const linkContent = (
              <Link
                href="/agenda"
                onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
                className={`flex items-center gap-2.5 px-3 py-3 rounded-lg transition-all duration-150 group shadow-md bg-gradient-to-r ${dataSource === 'demo' ? 'from-warning/20 to-warning/5 border border-warning/40 text-foreground hover:bg-warning/20' : 'from-accent/20 to-accent/5 border border-accent/40 text-foreground hover:bg-accent/20'}`}
              >
                <span className={`flex items-center justify-center transition-transform duration-150 ${pathname === '/agenda' ? (dataSource === 'demo' ? 'scale-110 text-warning' : 'scale-110 text-accent') : (dataSource === 'demo' ? 'text-warning group-hover:scale-110' : 'text-accent group-hover:scale-110')}`}>
                  <CalendarDays className="w-5 h-5" strokeWidth={2} />
                </span>
                <div className="flex flex-col gap-1 items-start">
                  <span className={`text-[0.95rem] leading-tight whitespace-nowrap font-bold ${pathname === '/agenda' ? (dataSource === 'demo' ? 'text-warning' : 'text-accent') : ''}`}>
                    Agenda
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs border font-semibold tracking-wider leading-none ${dataSource === 'demo' ? 'text-warning bg-warning/10 border-warning/30' : 'text-accent bg-accent/10 border-accent/30'}`}>
                    {dateStr}
                  </span>
                </div>
              </Link>
            );
            return linkContent;
          })()}
        </div>
      )}
      {!isSidebarOpen && (
        <div className="px-2 pb-2 shrink-0">
          <Tooltip content="Agenda" position="right" delay={0.1}>
            <Link
              href="/agenda"
              onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
              className={`flex justify-center px-0 py-3 rounded-lg transition-all duration-150 group shadow-md bg-gradient-to-r ${dataSource === 'demo' ? 'from-warning/20 to-warning/5 border border-warning/40 text-foreground' : 'from-accent/20 to-accent/5 border border-accent/40 text-foreground'}`}
            >
              <span className={`flex items-center justify-center ${pathname === '/agenda' ? (dataSource === 'demo' ? 'text-warning' : 'text-accent') : (dataSource === 'demo' ? 'text-warning' : 'text-accent')}`}>
                <CalendarDays className="w-5 h-5" strokeWidth={2} />
              </span>
            </Link>
          </Tooltip>
        </div>
      )}

      {/* ── Navegación principal ── */}
      <nav
        aria-label="Navegación principal"
        onScroll={handleScroll}
        className={`sidebar-scroll-container flex-1 ${isSidebarOpen ? 'px-3' : 'px-2'} py-2 space-y-3 overflow-x-hidden overflow-y-auto scrollbar-hide`}
      >
        {/* ① General: items del grupo sin título (Archivos, Catálogo, Docs, Descargas, Ayuda) */}
        {navGroups[0] && (
          <div className="flex flex-col gap-0.5">
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
                  className={`flex items-center ${isSidebarOpen ? 'gap-2.5 px-3' : 'justify-center px-0'} py-2 rounded-lg transition-all duration-150 group
                    ${pathname === item.href
                      ? (dataSource === 'demo' ? 'bg-warning/10 border border-warning/30 text-foreground shadow-sm shadow-warning/10' : 'bg-accent/10 border border-accent/30 text-foreground shadow-sm shadow-accent/10')
                      : 'text-muted hover:text-foreground hover:bg-foreground/5 border border-transparent'
                    }`}
                >
                  <span className={`flex items-center justify-center transition-transform duration-150 ${pathname === item.href ? (dataSource === 'demo' ? 'scale-110 text-warning' : 'scale-110 text-accent') : 'group-hover:scale-110'}`}>
                    <item.icon className="w-5 h-5" strokeWidth={1.75} />
                  </span>
                  {isSidebarOpen && (
                    <>
                      <span className={`text-sm leading-tight font-medium whitespace-nowrap ${pathname === item.href ? 'text-foreground font-semibold' : ''}`}>
                        {item.label}
                      </span>
                      {pathname === item.href && (
                        <div className={`ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0 ${dataSource === 'demo' ? 'bg-warning shadow-[0_0_6px_var(--warning-color)]' : 'bg-accent shadow-[0_0_6px_var(--accent-color)]'}`} />
                      )}
                    </>
                  )}
                </Link>
              );
              return !isSidebarOpen ? (
                <Tooltip key={item.href} content={item.label} position="right" delay={0.1}>
                  {linkContent}
                </Tooltip>
              ) : (
                <React.Fragment key={item.href}>{linkContent}</React.Fragment>
              );
            })}
          </div>
        )}

        {/* ② Bloque GRUPO: DEMO/REALES + selector */}
        {isSidebarOpen && (
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex flex-col">
              <div className="flex items-center justify-between px-1 mb-1.5">
                <div className="text-[0.95rem] font-bold text-foreground/90 tracking-wide">Datos</div>
                {/* Sync Status Indicator */}
                {dataSource === 'local' && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-foreground/5 text-xs font-medium">
                    {syncStatus === 'saving' && <><Hourglass className="w-3 h-3 text-warning animate-spin" /><span className="text-warning">Guardando...</span></>}
                    {syncStatus === 'saved' && <><Save className="w-3 h-3 text-success" /><span className="text-success">Guardado</span></>}
                    {syncStatus === 'error' && <><AlertTriangle className="w-3 h-3 text-danger" /><span className="text-danger">Error</span></>}
                    {syncStatus === 'idle' && <><Cloud className="w-3 h-3 text-muted/50" /><span className="text-muted/60">Sincronizado</span></>}
                  </div>
                )}
              </div>
              <div className="h-px bg-[var(--glass-border)]" />
            </div>
            <div className="flex bg-foreground/5 rounded-lg p-0.5 w-full gap-0.5">
              <button
                onClick={() => { setDataSource('demo'); fileManager.loadDemoData('1a'); toast.success('Modo DEMO'); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-bold transition-all ${dataSource === 'demo'
                  ? 'bg-warning/20 text-warning shadow-sm ring-1 ring-warning/30'
                  : 'text-muted hover:bg-foreground/10 hover:text-foreground'}`}
              >
                <Cloud className="w-3.5 h-3.5" /> DEMO
              </button>
              <button
                onClick={() => { setDataSource('local'); toast.success('Modo REALES'); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-bold transition-all ${dataSource === 'local'
                  ? 'bg-success/20 text-success shadow-sm ring-1 ring-success/30'
                  : 'text-muted hover:bg-foreground/10 hover:text-foreground'}`}
              >
                <HardDrive className="w-3.5 h-3.5" /> REALES
              </button>
            </div>
            <div className="flex flex-col">
              <div className="text-[0.95rem] font-bold text-foreground/90 tracking-wide px-1 mb-1.5">Grupo</div>
              <div className="h-px bg-[var(--glass-border)]" />
            </div>
            {dataSource === 'demo' ? (
              <div className="relative w-full">
                <select
                  className="w-full bg-foreground/5 border rounded-lg pl-3 pr-7 py-2 text-sm font-semibold focus:outline-none cursor-pointer appearance-none transition-colors"
                  style={{ color: 'var(--warning)', borderColor: 'var(--warning)' }}
                  value={demoGroupValue}
                  onChange={(e) => { fileManager.loadDemoData(e.target.value); toast.success(`Grupo ${e.target.value.toUpperCase()}`); }}
                >
                  <option value="1a">2025-26 1A-GM {moduleTitleSuffix !== 'CÓDIGO' ? moduleTitleSuffix : ''}</option>
                  <option value="1b">2025-26 1B-GM {moduleTitleSuffix !== 'CÓDIGO' ? moduleTitleSuffix : ''}</option>
                  <option value="1c">2025-26 1C-GM {moduleTitleSuffix !== 'CÓDIGO' ? moduleTitleSuffix : ''}</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--warning)' }} />
              </div>
            ) : !workspaceHandle ? (
              <button
                onClick={() => router.push('/archivos')}
                className="w-full bg-foreground/5 border border-success/30 rounded-lg py-2 text-sm font-semibold text-success hover:bg-success/10 transition-colors"
              >
                No hay grupos
              </button>
            ) : (
              <div className="relative w-full">
                <select
                  className="w-full bg-foreground/5 border rounded-lg pl-3 pr-7 py-2 text-sm font-semibold focus:outline-none cursor-pointer appearance-none transition-colors"
                  style={{ color: 'var(--success)', borderColor: 'var(--success)' }}
                  value={activeCursoId || ''}
                  onChange={(e) => useAppStore.getState().setActiveCursoId(e.target.value)}
                >
                  {localGroups.length === 0
                    ? <option value="" disabled>No hay grupos</option>
                    : localGroups.map(g => <option key={g} value={g}>{g}</option>)
                  }
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--success)' }} />
              </div>
            )}
          </div>
        )}

        {/* ③ Programación + ④ Curso con info-box coloreada */}
        {navGroups.slice(1).map((group) => {
          // Extraer el texto base (sin corchetes) y el contenido entre corchetes
          const bracketMatch = group.title.match(/^(.*?)\s*\[.*\]$/);
          const baseTitle = bracketMatch ? bracketMatch[1].trim() : group.title;
          const infoValue = group.title.includes('[Código del módulo]')
            ? moduleTitleSuffix
            : group.title.includes('[Año]')
              ? cursoTitleSuffix
              : null;

          return (
            <div key={group.title} className="flex flex-col gap-0.5">
              {isSidebarOpen && (
                <div className="flex flex-col mb-2 mt-1 gap-1.5">
                  <div className="text-[0.95rem] font-bold text-foreground/90 tracking-wide px-1">
                    {baseTitle}
                  </div>
                  {infoValue && infoValue !== 'CÓDIGO' && infoValue !== 'AÑO' && (
                    <Link
                      href="/archivos"
                      onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
                      className="mx-1 px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wide flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                      style={{
                        color: dataSource === 'demo' ? 'var(--warning)' : 'var(--success)',
                        borderColor: dataSource === 'demo' ? 'var(--warning)' : 'var(--success)',
                        background: dataSource === 'demo' ? 'color-mix(in srgb, var(--warning) 8%, transparent)' : 'color-mix(in srgb, var(--success) 8%, transparent)',
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
                    className={`flex items-center ${isSidebarOpen ? 'gap-2.5 px-3' : 'justify-center px-0'} py-2 rounded-lg transition-all duration-150 group
                      ${pathname === item.href
                        ? (dataSource === 'demo' ? 'bg-warning/10 border border-warning/30 text-foreground shadow-sm shadow-warning/10' : 'bg-accent/10 border border-accent/30 text-foreground shadow-sm shadow-accent/10')
                        : 'text-muted hover:text-foreground hover:bg-foreground/5 border border-transparent'
                      }`}
                  >
                    <span className={`flex items-center justify-center transition-transform duration-150 ${pathname === item.href ? (dataSource === 'demo' ? 'scale-110 text-warning' : 'scale-110 text-accent') : 'group-hover:scale-110'}`}>
                      <item.icon className="w-5 h-5" strokeWidth={1.75} />
                    </span>
                    {isSidebarOpen && (
                      <>
                        <span className={`text-sm leading-tight font-medium whitespace-nowrap ${pathname === item.href ? 'text-foreground font-semibold' : ''}`}>
                          {item.label}
                        </span>
                        {pathname === item.href && (
                          <div className={`ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0 ${dataSource === 'demo' ? 'bg-warning shadow-[0_0_6px_var(--warning-color)]' : 'bg-accent shadow-[0_0_6px_var(--accent-color)]'}`} />
                        )}
                      </>
                    )}
                  </Link>
                );
                return !isSidebarOpen ? (
                  <Tooltip key={item.href} content={item.label} position="right" delay={0.1}>
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

      {/* ── Footer ── */}
      <div className={`px-4 py-3 border-t border-[var(--glass-border)] flex flex-col items-center gap-1.5`}>
        {isSidebarOpen ? (
          <div className="w-full">
            <InstallPwaButton isSidebarOpen={true} />
            <p className="text-center text-sm font-medium text-muted/90 mt-1 whitespace-nowrap">
              © {new Date().getFullYear()} Rafael Sanz Prades
            </p>
            <div className="flex items-center justify-center w-full mt-1">
              <Link href="/legal" className="text-sm font-semibold text-info hover:text-info hover:underline" onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}>
                Legal
              </Link>
            </div>
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
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex ${isSidebarOpen ? 'w-64' : 'w-[4.5rem]'} sticky top-0 h-screen border-r border-[var(--glass-border)] bg-background flex-col flex-shrink-0 transition-all duration-300 z-50`}>
        {sidebarContent}
      </aside>

      {/* Mobile sidebar (overlay) */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64 border-r border-[var(--glass-border)] bg-background flex flex-col transition-transform duration-300`}>
        {sidebarContent}
      </aside>
    </>
  );
}
