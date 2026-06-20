"use client";
import { AlertTriangle, ChevronRight, Cloud, Hourglass, Moon, Redo2, Save, Shield, Sun, Undo2, XCircle, CalendarDays, FolderOpen } from "lucide-react";
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
import { ThemeSelector } from "@/components/features/settings/ThemeSelector";


export default function Header({ title, breadcrumbSuffix }: { title?: React.ReactNode; breadcrumbSuffix?: React.ReactNode }) {
  const { activeModuleId, activeCursoId, moduleData, cursoData, pdFileSource, cursoFileSource, saveModuleData, saveCursoData, isSidebarOpen, toggleSidebar, dataSource } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cursoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef<boolean>(true);

  const { undo, redo, pastStates, futureStates } = useTemporalStore((state) => state);

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

  let currentItem = "";
  if (pathname === '/inicio') {
    currentItem = "Inicio";
  } else if (pathname === '/agenda') {
    currentItem = "Agenda de clase";
  } else if (pathname === '/entorno') {
    currentItem = "Entorno";
  } else {
    for (const group of navGroups) {
      const found = group.items.find(item => item.href === pathname);
      if (found) {
        currentItem = found.label;
        break;
      }
    }
  }


  // Autosave Effect for moduleData
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    if (!moduleData || !activeModuleId) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setAutosaveStatus("idle");

    saveTimeoutRef.current = setTimeout(async () => {
      setAutosaveStatus("saving");
      const ok = await saveModuleData();
      if (ok) {
        setAutosaveStatus("saved");
        setTimeout(() => setAutosaveStatus("idle"), 2000);
      } else {
        setAutosaveStatus("error");
      }
    }, 3000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [moduleData, activeModuleId, saveModuleData]);

  // Autosave Effect for cursoData
  useEffect(() => {
    if (!cursoData || !activeCursoId) return;

    if (cursoSaveTimeoutRef.current) {
      clearTimeout(cursoSaveTimeoutRef.current);
    }

    cursoSaveTimeoutRef.current = setTimeout(async () => {
      await saveCursoData();
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
          if (futureStates.length > 0) redo();
        } else {
          if (pastStates.length > 0) undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        if (futureStates.length > 0) redo();
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
        router.push('/ayuda');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle command palette (placeholder)
        toast('Comando palette no implementado aún');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, pastStates.length, futureStates.length, handleSave]);

  let friendlyModuleName = "Crea o abre una programación";
  if (activeModuleId) {
    const code = activeModuleId.split('-')[0];
    let foundName = "";
    for (const g of initialGroups) {
      const m = g.modules.find(mod => mod.code === code);
      if (m) { foundName = m.name; break; }
    }
    friendlyModuleName = foundName ? `${code} - ${foundName}` : activeModuleId;
  }

  let friendlyCursoName = "Crea o abre un curso";
  if (activeCursoId) {
    const parts = activeCursoId.split('-');
    const code = parts[0];
    const year = parts[parts.length - 1];
    let foundName = "";
    for (const g of initialGroups) {
      if (g.modules.some(m => m.code === code)) { foundName = g.name; break; }
    }
    friendlyCursoName = foundName ? `${foundName} (${year})` : activeCursoId;
  }

  return (
    <div className="w-full flex flex-col z-40 sticky top-0 bg-background/95 backdrop-blur-xl border-b border-[var(--glass-border)] pb-2 shadow-md">
      {/* Menú superior */}
      <nav className="w-full px-6 py-2 flex items-center justify-between">
        {/* Left Side: Mobile Hamburger + Datos Reales/Ficticios + Module Info */}
        <div className="flex justify-start items-center gap-4 min-w-0">
          {/* Mobile hamburger */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-muted hover:text-foreground p-2 rounded-lg hover:bg-foreground/5 transition-colors shrink-0"
            aria-label="Toggle sidebar" aria-expanded={isSidebarOpen} aria-controls="sidebar" tabIndex={0}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          
          {/* Segmented Control: Modo de Datos / Guardado */}
          {mounted && (
            <div className="flex bg-foreground/5 p-1 rounded-xl border border-[var(--glass-border)] shadow-sm shrink-0">
              {/* Botón DEMO */}
              <button
                onClick={async () => {
                  if (dataSource === 'demo') return;
                  if (moduleData || cursoData) {
                    const wantToSave = window.confirm("Vas a cambiar a modo DEMO. ¿Quieres GUARDAR tus datos reales antes de cambiar?\n(Aceptar = Guardar, Cancelar = Descartar)");
                    if (wantToSave) {
                      await handleSave();
                    }
                  }
                  useAppStore.getState().setDataSource('demo');
                  fileManager.loadDemoData();
                  toast.success("Modo DEMO activado");
                }}
                className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-lg transition-all ${
                  dataSource === 'demo'
                    ? 'bg-warning/20 text-warning shadow-md'
                    : 'text-muted hover:text-foreground hover:bg-foreground/5'
                }`}
                title="Cargar datos de demostración (Solo lectura)"
              >
                <span className="text-sm font-bold flex items-center gap-1">
                  <Cloud className="w-4 h-4" /> Datos DEMO
                </span>
                <span className="text-[0.65rem] uppercase tracking-wider opacity-80 font-semibold">
                  Solo lectura
                </span>
              </button>

              {/* Botón REALES / GUARDAR */}
              <button
                onClick={async () => {
                  if (dataSource === 'demo') {
                    // Switch to local mode
                    useAppStore.getState().setModuleData(null);
                    useAppStore.getState().setCursoData(null);
                    useAppStore.getState().setActiveModuleId("");
                    useAppStore.getState().setActiveCursoId("");
                    useAppStore.getState().setPdFileSource({ type: 'none' });
                    useAppStore.getState().setCursoFileSource({ type: 'none' });
                    useAppStore.getState().setDataSource('local');
                    toast.success("Modo Datos Reales activado");
                  } else {
                    // We are already in real mode, so this acts as the SAVE button
                    await handleSave();
                  }
                }}
                disabled={dataSource === 'local' && isSaving}
                className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-lg transition-all ${
                  dataSource === 'local'
                    ? cloudSynced 
                        ? 'bg-success/20 text-success shadow-md'
                        : 'bg-accent/20 text-accent shadow-md'
                    : 'text-muted hover:text-foreground hover:bg-foreground/5'
                }`}
                title={dataSource === 'demo' ? "Cambiar a tus datos reales" : "Guardar cambios local/nube"}
              >
                <span className="text-sm font-bold flex items-center gap-1">
                  {dataSource === 'local' && isSaving ? <Hourglass className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                  Datos Reales
                </span>
                <span className={`text-[0.65rem] uppercase tracking-wider font-semibold ${dataSource === 'local' && isSaving ? 'animate-pulse' : 'opacity-80'}`}>
                  {dataSource === 'demo' 
                    ? 'Cambiar' 
                    : isSaving 
                      ? 'Guardando...' 
                      : autosaveStatus === 'saving'
                        ? 'Autoguardando...'
                        : cloudSynced 
                          ? 'Sincronizado' 
                          : 'Guardar (Ctrl+S)'}
                </span>
              </button>
            </div>
          )}

        </div>

        {/* Right Side: Undo/Redo + Tema */}
        <div className="flex justify-end items-center gap-3 shrink-0">
          {mounted && moduleData && dataSource !== 'demo' && (
            <div className="hidden md:flex items-center">
              {autosaveStatus === "saved" && <span className="text-success text-sm font-medium"><span className="inline-flex"><Cloud className="w-[1.2em] h-[1.2em] mr-1" /></span> Guardado</span>}
              {autosaveStatus === "saving" && <span className="text-warning text-sm font-medium animate-pulse">⏳ Guardando...</span>}
              {autosaveStatus === "error" && <span className="text-danger text-sm font-medium"><span className="inline-flex"><XCircle className="w-[1.2em] h-[1.2em] mr-1" /></span> Error al guardar</span>}
              {autosaveStatus === "idle" && <span className="text-[var(--text-muted)] text-sm font-medium"><span className="inline-flex"><Cloud className="w-[1.2em] h-[1.2em] mr-1" /></span> Sincronizado</span>}
            </div>
          )}

          <div className="flex items-center gap-1 bg-foreground/5 p-1 rounded-lg">
            <button
              onClick={() => undo()}
              disabled={pastStates.length === 0}
              className={`p-2 rounded-md transition-colors ${pastStates.length > 0 ? 'text-foreground hover:bg-foreground/10 cursor-pointer' : 'text-muted opacity-50 cursor-not-allowed'}`}
              title="Deshacer (Ctrl+Z)" aria-label="Deshacer" tabIndex={0}
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={() => redo()}
              disabled={futureStates.length === 0}
              className={`p-2 rounded-md transition-colors ${futureStates.length > 0 ? 'text-foreground hover:bg-foreground/10 cursor-pointer' : 'text-muted opacity-50 cursor-not-allowed'}`}
              title="Rehacer (Ctrl+Y)" aria-label="Rehacer" tabIndex={0}
            >
              <Redo2 size={16} />
            </button>
          </div>


          {mounted && (
            <div className="flex items-center">
              <ThemeSelector />
            </div>
          )}
        </div>
      </nav>

      {/* Fila 2: Información del Módulo y Curso */}
      <div className="w-full px-6 py-2 bg-foreground/[0.015] border-t border-[var(--glass-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
        <span className={`text-[0.95rem] leading-tight tracking-wide truncate flex-1 transition-colors ${!activeModuleId ? `font-medium ${dataSource === 'demo' ? 'text-warning/70' : 'text-success/70'}` : `font-extrabold ${dataSource === 'demo' ? 'text-warning' : 'text-success'}`}`} title={friendlyModuleName}>
          {activeModuleId ? `Programación: ${friendlyModuleName}` : friendlyModuleName}
        </span>
        <span className={`text-[0.95rem] leading-tight tracking-wide truncate flex-1 text-right transition-colors ${!activeCursoId ? `font-medium ${dataSource === 'demo' ? 'text-warning/70' : 'text-success/70'}` : `font-extrabold ${dataSource === 'demo' ? 'text-warning' : 'text-success'}`}`} title={friendlyCursoName}>
          {activeCursoId ? `Curso: ${friendlyCursoName}` : friendlyCursoName}
        </span>
      </div>

      {/* Fila 3: Breadcrumb y Buscar */}
      {currentItem && (
        <div className="w-full px-6 py-1.5 bg-white/[0.02] border-t border-[var(--glass-border)] flex items-center justify-between gap-1.5 text-sm text-muted tracking-wide">
          {/* Breadcrumb a la izquierda */}
          <div className="flex items-center gap-1.5 min-w-0">
            {pathname !== '/inicio' && (
              <>
                <Link href="/inicio" className="font-medium text-muted hover:text-foreground transition-colors">Inicio</Link>
                <ChevronRight className="w-3 h-3 text-muted/80" />
              </>
            )}
            <span className="text-foreground/90 font-semibold">{currentItem}</span>
            {breadcrumbSuffix && (
              <>
                <ChevronRight className="w-3 h-3 text-muted/80" />
                <span className="text-foreground/90 font-semibold">{breadcrumbSuffix}</span>
              </>
            )}
          </div>

          {/* Búsqueda a la derecha */}
          <div className="relative w-48 md:w-64 shrink-0">
            <input
              type="text"
              placeholder="Buscar..."
              aria-label="Buscar en la aplicación"
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
              className="bg-foreground/5 border border-[var(--glass-border)] rounded-lg px-3 py-1 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-accent/50 w-full"
            />
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full right-0 mt-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto w-64">
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
      )}

      {title && (
        <header className="w-full flex items-center justify-center px-8 pt-4 pb-2">
          <div className="border-2 border-[#14a085] rounded-xl px-8 py-3 shadow-[0_4px_15px_rgba(20,160,133,0.1)] bg-background/50 backdrop-blur-sm">
            <h2 className="text-3xl whitespace-nowrap font-extrabold tracking-tight primary-gradient-text m-0 leading-none">
              {title}
            </h2>
          </div>
        </header>
      )}
    </div>
  );
}
