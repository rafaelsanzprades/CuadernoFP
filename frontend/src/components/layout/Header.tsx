"use client";
import { Search, AlertTriangle, ChevronRight, ChevronDown, Cloud, Hourglass, Moon, Redo2, Save, Shield, Sun, Undo2, XCircle, CalendarDays, FolderOpen, Menu, Send } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAppStore, useTemporalStore } from "@/store/useAppStore";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { navGroups } from "@/config/navigation";
import { initialGroups } from "@/store/initialData";
import { showRichToast } from "@/utils/toast";
import { motion } from "framer-motion";
import { fileManager } from "@/services/fileManager";
import { searchGlobal, type SearchResult } from "@/services/searchService";
import { HeaderSettings } from "@/components/layout/HeaderSettings";
import { useTranslation } from "react-i18next";


export default function Header({ title, breadcrumbSuffix }: { title?: React.ReactNode; breadcrumbSuffix?: React.ReactNode }) {
  const { activeModuleId, activeCursoId, moduleData, cursoData, pdFileSource, cursoFileSource, saveModuleData, saveCursoData, isSidebarOpen, toggleSidebar, dataSource, workspaceHandle, syncStatus } = useAppStore();
  const [localGroups, setLocalGroups] = useState<string[]>([]);
  const [activeLocalGroup, setActiveLocalGroup] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cursoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef<boolean>(true);
  const lastSavedModuleDataRef = useRef<any>(null);
  const lastSavedCursoDataRef = useRef<any>(null);

  const pastStatesLength = useTemporalStore((state) => state.pastStates.length);
  const futureStatesLength = useTemporalStore((state) => state.futureStates.length);
  const undo = useTemporalStore((state) => state.undo);
  const redo = useTemporalStore((state) => state.redo);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);
  
  // Estado para búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateStates = () => {
      setCloudSynced(fileManager.isGoogleConnected() || fileManager.isOneDriveConnected());
    };
    updateStates();
  }, []);

  useEffect(() => {
    if (workspaceHandle && dataSource === 'local') {
      fileManager.scanGroupsInWorkspace(workspaceHandle).then(groups => setLocalGroups(groups));
    }
  }, [workspaceHandle, dataSource]);

  let currentItem = "";
  if (pathname === '/inicio') {
    currentItem = "Inicio";
  } else if (pathname === '/diario') {
    currentItem = "Agenda de clase";
  } else if (pathname === '/archivos') {
    currentItem = "Archivos";
  } else {
    for (const group of navGroups) {
      const found = group.items.find(item => item.href === pathname);
      if (found) {
        currentItem = t('nav.' + found.href.replace('/', ''), { defaultValue: found.label }) as string;
        break;
      }
    }
  }


  // Autosave Effect for moduleData
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      lastSavedModuleDataRef.current = moduleData;
      return;
    }

    if (!moduleData || !activeModuleId) return;
    
    // Skip save if the data reference hasn't changed (e.g. during Fast Refresh)
    if (moduleData === lastSavedModuleDataRef.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    lastSavedModuleDataRef.current = moduleData;

    saveTimeoutRef.current = setTimeout(async () => {
      await saveModuleData();
      // Update ref to the newly saved data so it doesn't trigger another save loop
      lastSavedModuleDataRef.current = useAppStore.getState().moduleData;
    }, 3000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [moduleData, activeModuleId, saveModuleData]);

  // Autosave Effect for cursoData
  useEffect(() => {
    if (!cursoData || !activeCursoId) {
      lastSavedCursoDataRef.current = cursoData;
      return;
    }

    if (cursoData === lastSavedCursoDataRef.current) return;

    if (cursoSaveTimeoutRef.current) {
      clearTimeout(cursoSaveTimeoutRef.current);
    }

    lastSavedCursoDataRef.current = cursoData;

    cursoSaveTimeoutRef.current = setTimeout(async () => {
      await saveCursoData();
      // Update ref to the newly saved data so it doesn't trigger another save loop
      lastSavedCursoDataRef.current = useAppStore.getState().cursoData;
    }, 3000);

    return () => {
      if (cursoSaveTimeoutRef.current) clearTimeout(cursoSaveTimeoutRef.current);
    };
  }, [cursoData, activeCursoId, saveCursoData]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    let ok: boolean | "conflict" = false;
    let cursoOk: boolean | "conflict" = false;
    
    if (moduleData && activeModuleId) {
      ok = await saveModuleData();
    }
    if (cursoData && activeCursoId) {
      cursoOk = await saveCursoData();
      ok = (ok === true || cursoOk === true) ? true : (ok === "conflict" || cursoOk === "conflict" ? "conflict" : false);
    }
    
    if (ok === "conflict") {
      showRichToast.error("Conflicto de versiones", "Los datos están obsoletos. Por favor, recarga la página.");
    } else if (ok === true) {
      showRichToast.success(`Guardado con éxito`, `Datos actualizados.`);
    } else {
      showRichToast.error("Error al guardar", "Revisa la conexión o los datos.");
    }
    setIsSaving(false);
  }, [moduleData, activeModuleId, cursoData, activeCursoId, saveModuleData, saveCursoData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          if (futureStatesLength > 0) redo();
        } else {
          if (pastStatesLength > 0) undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        if (futureStatesLength > 0) redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        // Focus search input
        const searchInput = document.querySelector('input[placeholder="Buscar..." aria-label="Buscar en la aplicación" role="searchbox"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        // Navigate to help
        router.push('/inicio');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle command palette (placeholder)
        toast('Comando palette no implementado aún');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, pastStatesLength, futureStatesLength, handleSave]);

  let friendlyModuleName = "Crea o abre una Programación";
  if (activeModuleId) {
    const code = activeModuleId.split('-')[0];
    if (moduleData && moduleData.info_modulo) {
      const { codigo, nombre, titulo_codigo, titulo_fp } = moduleData.info_modulo;
      const actualCode = codigo || code;
      
      let degreeCode = actualCode;
      if (titulo_codigo) {
        degreeCode = titulo_codigo;
      } else if (titulo_fp) {
        const lowerCiclo = titulo_fp.toLowerCase();
        const firstWord = titulo_fp.split(' ')[0];
        if (/^[A-Z]{2,4}\d{2,3}$/i.test(firstWord) || /^[A-Z]+-\d+$/i.test(firstWord)) {
          degreeCode = firstWord;
        } else if (lowerCiclo.includes("superior")) {
          degreeCode = "GS";
        } else if (lowerCiclo.includes("básico") || lowerCiclo.includes("basico") || lowerCiclo.includes("profesional")) {
          degreeCode = "GB";
        } else if (lowerCiclo.includes("técnico") || lowerCiclo.includes("tecnico")) {
          degreeCode = "GM";
        } else {
          degreeCode = firstWord;
        }
      }
      
      let acronym = nombre;
      for (const g of initialGroups) {
        const m = g.modules.find(mod => mod.code === actualCode);
        if (m && m.acronym) { acronym = m.acronym; break; }
      }
      friendlyModuleName = `P - ${degreeCode} - ${actualCode} - ${acronym || 'Programación'}`;
    } else {
      let foundGroup: any = null;
      let foundModule: any = null;
      for (const g of initialGroups) {
        const m = g.modules.find(mod => mod.code === code);
        if (m) { foundGroup = g; foundModule = m; break; }
      }
      if (foundGroup && foundModule) {
        const degreeCode = foundGroup.degreeName.split(' ')[0];
        friendlyModuleName = `P - ${degreeCode} - ${code} - ${foundModule.acronym || foundModule.name}`;
      } else {
        const namePart = activeModuleId.replace('-pd', '').toUpperCase();
        friendlyModuleName = `P - ${namePart}`;
      }
    }
  }

  let friendlyCursoName = "Crea o abre un Curso";
  if (activeCursoId) {
    const parts = activeCursoId.split('-');
    const code = parts[0];
    const rawYear = parts[parts.length - 1];
    
    // Normalize year dynamically (e.g. 26 -> 2025-26, 27 -> 2026-27, 202526 -> 2025-26)
    let year = rawYear;
    if (year && year.length === 2) {
      year = `20${parseInt(year) - 1}-${year}`;
    } else if (year && year.length === 6 && !year.includes('-')) {
      year = `${year.slice(0, 4)}-${year.slice(4)}`;
    } else if (!year || !year.includes('-')) {
      const today = new Date();
      const currentY = today.getMonth() < 6 ? today.getFullYear() - 1 : today.getFullYear();
      year = `${currentY}-${String(currentY + 1).slice(-2)}`;
    }

    let foundGroup: any = null;
    for (const g of initialGroups) {
      if (g.modules.some(m => m.code === code)) { foundGroup = g; break; }
    }

    // Identify group suffix dynamically instead of hardcoding 1A/1B/1C
    const matchGroup = activeCursoId.match(/-([1-9][A-Z])$/i);
    const groupSuffix = matchGroup ? matchGroup[1].toUpperCase() : '';

    if (groupSuffix) {
      // It's a derived group from a module
      const levelAbr = foundGroup ? (foundGroup.level === 'Grado Medio' ? 'GM' : foundGroup.level === 'Grado Superior' ? 'GS' : 'GB') : 'GM';
      const family = foundGroup ? foundGroup.degreeName.split(' ')[0] : 'FP';
      friendlyCursoName = `C - ${year} - ${groupSuffix}-${levelAbr} - ${family}`;
    } else if (foundGroup) {
      const yearPrefix = foundGroup.name.charAt(0);
      const levelAbr = foundGroup.level === 'Grado Medio' ? 'GM' : foundGroup.level === 'Grado Superior' ? 'GS' : 'GB';
      const degreeCode = foundGroup.degreeName.split(' ')[0].replace(/([A-Z]+)(\d+)/, '$1-$2');
      friendlyCursoName = `C - ${year} - ${yearPrefix}-${levelAbr} - ${degreeCode}`;
    } else {
      let nameParts = parts.slice(0, -1);
      if (nameParts.length > 0 && nameParts[nameParts.length - 1].startsWith('202')) {
        nameParts = nameParts.slice(0, -1);
      }
      const namePart = nameParts.join(' ').toUpperCase();
      friendlyCursoName = `C - ${year} - ${namePart}`;
    }
  }

  return (
    <div className="w-full flex flex-col z-40 sticky top-0 bg-background/95 backdrop-blur-xl border-b border-[var(--glass-border)] pb-2 shadow-md">
      {/* Fila 2: Buscar y Acciones */}
      <div className="w-full px-4 md:px-6 py-2 bg-white/[0.02] border-t border-[var(--glass-border)] flex items-center justify-between gap-2 text-sm text-muted tracking-wide relative">
        
          {mounted && (
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-3">
              <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-500 shrink-0 shadow-sm pointer-events-none">
                <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                <span className="text-xs font-bold uppercase tracking-widest">{t('sidebar.en_obras')}</span>
              </div>
              
              {dataSource === 'local' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/5 text-xs font-medium text-muted/80 whitespace-nowrap border border-[var(--glass-border)] shadow-sm pointer-events-none">
                  {syncStatus === 'saving' && <><Hourglass className="w-3.5 h-3.5 text-warning animate-spin" /><span className="text-warning">{t('header.guardando', { defaultValue: 'Guardando...' })}</span></>}
                  {syncStatus === 'saved' && <><Save className="w-3.5 h-3.5 text-success" /><span className="text-success">{t('header.guardado', { defaultValue: 'Guardado' })}</span></>}
                  {syncStatus === 'error' && <><AlertTriangle className="w-3.5 h-3.5 text-danger" /><span className="text-danger">{t('header.error', { defaultValue: 'Error' })}</span></>}
                  {syncStatus === 'idle' && <><Cloud className="w-3.5 h-3.5 text-muted/50" /><span>{t('header.sincronizado', { defaultValue: 'Sincronizado' })}</span></>}
                </div>
              )}
            </div>
          )}
          
          {/* Búsqueda a la izquierda y menú móvil */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSidebar}
            className="block lg:hidden p-2 rounded-md text-foreground hover:bg-foreground/10 transition-colors"
            aria-label="Menú principal"
          >
            <Menu className="w-6 h-6" />
          </button>
          <a
            href="https://t.me/cuadernofp"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 md:p-2 rounded-md text-[#229ED9] hover:bg-[#229ED9]/10 transition-colors hidden sm:block"
            title="Únete a nuestro grupo de Telegram"
          >
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          </a>
          <div className="relative w-36 sm:w-48 md:w-64 shrink-0">
            <input
              type="text"
              placeholder={t('header.buscar', { defaultValue: 'Buscar...' }) as string}
              aria-label={t('header.buscar', { defaultValue: 'Buscar...' }) as string}
              role="searchbox"
              value={searchQuery}
              onChange={(e) => {
                const query = e.target.value;
                setSearchQuery(query);
                const results = searchGlobal(query);
                setSearchResults(results);
                setShowResults(results.length > 0);
              }}
              onFocus={() => setShowResults(searchResults.length > 0)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              className="bg-foreground/5 border border-[var(--glass-border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-accent/50 w-full"
            />
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 mt-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto w-64">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-foreground/10 cursor-pointer text-sm"
                    onClick={() => {
                      if (result.href) {
                        router.push(result.href);
                        setSearchQuery("");
                        setShowResults(false);
                      }
                    }}
                  >
                    <div className="font-medium text-[var(--text-primary)]">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-xs text-[var(--text-muted)]">{result.subtitle}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Acciones a la derecha */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 bg-foreground/5 p-1 rounded-lg">
            <button
              onClick={() => undo()}
              disabled={pastStatesLength === 0}
              className="p-1.5 rounded text-muted hover:text-foreground hover:bg-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title={`${t('header.deshacer', { defaultValue: 'Deshacer' })} (Ctrl+Z)`}
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => redo()}
              disabled={futureStatesLength === 0}
              className="p-1.5 rounded text-muted hover:text-foreground hover:bg-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title={`${t('header.rehacer', { defaultValue: 'Rehacer' })} (Ctrl+Y)`}
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {mounted && (
            <div className="flex items-center bg-foreground/5 rounded-lg p-0.5">
              <HeaderSettings />
            </div>
          )}
        </div>
      </div>

      {title && (
        <header className="w-full flex items-center justify-center px-8 pt-4 pb-2">
          <div className="border-2 border-[#14a085] rounded-xl px-8 py-3 shadow-[0_4px_15px_rgba(20,160,133,0.1)] bg-background/50 backdrop-blur-sm">
            <h2 className="text-2xl whitespace-nowrap font-extrabold tracking-tight primary-gradient-text m-0 leading-none">
              {title}
            </h2>
          </div>
        </header>
      )}
    </div>
  );
}
