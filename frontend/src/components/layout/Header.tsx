"use client";
import { AlertTriangle, ChevronRight, ChevronDown, Cloud, Hourglass, Moon, Redo2, Save, Shield, Sun, Undo2, XCircle, CalendarDays, FolderOpen } from "lucide-react";
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
  const { activeModuleId, activeCursoId, moduleData, cursoData, pdFileSource, cursoFileSource, saveModuleData, saveCursoData, isSidebarOpen, toggleSidebar, dataSource, workspaceHandle, syncStatus } = useAppStore();
  const [localGroups, setLocalGroups] = useState<string[]>([]);
  const [activeLocalGroup, setActiveLocalGroup] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cursoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef<boolean>(true);

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
  } else if (pathname === '/agenda') {
    currentItem = "Agenda de clase";
  } else if (pathname === '/archivos') {
    currentItem = "Archivos";
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

    saveTimeoutRef.current = setTimeout(async () => {
      await saveModuleData();
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
        router.push('/ayuda');
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
      const { codigo, nombre, titulo_codigo, ciclo } = moduleData.info_modulo;
      const actualCode = codigo || code;
      
      let degreeCode = actualCode;
      if (titulo_codigo) {
        degreeCode = titulo_codigo;
      } else if (ciclo) {
        const lowerCiclo = ciclo.toLowerCase();
        const firstWord = ciclo.split(' ')[0];
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
      
      friendlyModuleName = `P - ${degreeCode} - ${actualCode} - ${nombre || 'Programación'}`;
    } else {
      let foundGroup: any = null;
      let foundModule: any = null;
      for (const g of initialGroups) {
        const m = g.modules.find(mod => mod.code === code);
        if (m) { foundGroup = g; foundModule = m; break; }
      }
      if (foundGroup && foundModule) {
        const degreeCode = foundGroup.degreeName.split(' ')[0];
        friendlyModuleName = `P - ${degreeCode} - ${code} - ${foundModule.name}`;
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
    
    // Normalize year
    let year = rawYear;
    if (year === '26' || year === '202526') year = '2025-26';

    let foundGroup: any = null;
    for (const g of initialGroups) {
      if (g.modules.some(m => m.code === code)) { foundGroup = g; break; }
    }

    if (activeCursoId.includes('-1A') || activeCursoId.includes('-1B') || activeCursoId.includes('-1C')) {
      const groupSuffix = activeCursoId.split('-').pop(); // 1A, 1B, 1C
      friendlyCursoName = `C - 2025-26 - ${groupSuffix}-GM - ELE-203`;
    } else if (foundGroup) {
      const yearPrefix = foundGroup.name.charAt(0);
      const levelAbr = foundGroup.level === 'Grado Medio' ? 'GM' : foundGroup.level === 'Grado Superior' ? 'GS' : 'GB';
      const degreeCode = foundGroup.degreeName.split(' ')[0].replace(/([A-Z]+)(\d+)/, '$1-$2');
      friendlyCursoName = `C - ${year} - ${yearPrefix}-${levelAbr} - ${degreeCode}`;
    } else {
      let nameParts = parts.slice(0, -1);
      // If the second to last part is '2025' or '2026', remove it from name
      if (nameParts.length > 0 && (nameParts[nameParts.length - 1] === '2025' || nameParts[nameParts.length - 1] === '2026')) {
        nameParts = nameParts.slice(0, -1);
      }
      const namePart = nameParts.join(' ').toUpperCase();
      friendlyCursoName = `C - ${year} - ${namePart}`;
    }
  }

  return (
    <div className="w-full flex flex-col z-40 sticky top-0 bg-background/95 backdrop-blur-xl border-b border-[var(--glass-border)] pb-2 shadow-md">
      {/* Fila 1: Información del Módulo y Curso */}
      <div className="w-full px-6 py-2 bg-foreground/[0.015] border-b border-[var(--glass-border)] grid grid-cols-1 lg:grid-cols-3 items-center gap-2 sm:gap-3">
        {/* Columna Izquierda: Hamburger + Modo + Grupo */}
        <div className="flex justify-start items-center gap-3 min-w-0">
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
          
          {mounted && (
            <div className="hidden sm:flex bg-foreground/5 p-1 rounded-xl border border-[var(--glass-border)] shadow-sm shrink-0">
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
                className={`flex flex-col items-center justify-center px-3 py-0.5 rounded-lg transition-all ${
                  dataSource === 'demo'
                    ? 'bg-warning/20 text-warning shadow-md'
                    : 'text-muted hover:text-foreground hover:bg-foreground/5'
                }`}
                title="Cargar datos de demostración (Solo lectura)"
              >
                <span className="text-xs font-bold flex items-center gap-1">
                  <Cloud className="w-3 h-3" /> DEMO
                </span>
              </button>

              {/* Botón REALES / GUARDAR */}
              <button
                onClick={async () => {
                  if (dataSource === 'demo') {
                    useAppStore.getState().setModuleData(null);
                    useAppStore.getState().setCursoData(null);
                    useAppStore.getState().setActiveModuleId("");
                    useAppStore.getState().setActiveCursoId("");
                    useAppStore.getState().setPdFileSource({ type: 'none' });
                    useAppStore.getState().setCursoFileSource({ type: 'none' });
                    useAppStore.getState().setDataSource('local');
                    toast.success("Modo Datos Reales activado");
                  } else {
                    await handleSave();
                  }
                }}
                disabled={dataSource === 'local' && isSaving}
                className={`flex flex-col items-center justify-center px-3 py-0.5 rounded-lg transition-all ${
                  dataSource === 'local'
                    ? cloudSynced 
                        ? 'bg-success/20 text-success shadow-md'
                        : 'bg-accent/20 text-accent shadow-md'
                    : 'text-muted hover:text-foreground hover:bg-foreground/5'
                }`}
                title={dataSource === 'demo' ? "Cambiar a tus datos reales" : "Guardar cambios local/nube"}
              >
                <span className="text-xs font-bold flex items-center gap-1">
                  {dataSource === 'local' && isSaving ? <Hourglass className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} 
                  Reales
                </span>
              </button>
            </div>
          )}

          {dataSource === 'local' && !workspaceHandle ? (
            <button
              onClick={() => router.push('/archivos')}
              className={`w-full max-w-[200px] bg-foreground/5 border rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-success/50 cursor-pointer text-left hover:bg-foreground/10 transition-colors shrink-0`}
              style={{ color: 'var(--success)', borderColor: 'var(--success)' }}
            >
              Archivos
            </button>
          ) : (
            <div className="relative w-[180px] sm:w-[200px] shrink-0">
              <select 
                className={`w-full bg-foreground/5 border rounded-lg pl-3 pr-8 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 cursor-pointer appearance-none text-left transition-colors`}
                style={{ 
                  color: dataSource === 'demo' ? 'var(--warning)' : 'var(--success)',
                  borderColor: dataSource === 'demo' ? 'var(--warning)' : 'var(--success)'
                }}
                value={dataSource === 'demo' ? (activeCursoId?.endsWith('1A') ? '1a' : activeCursoId?.endsWith('1B') ? '1b' : activeCursoId?.endsWith('1C') ? '1c' : '1a') : activeLocalGroup}
                onChange={async (e) => {
                  if (dataSource === 'demo') {
                    fileManager.loadDemoData(e.target.value);
                    toast.success(`Cambiado a Grupo ${e.target.value.toUpperCase()}`);
                  } else {
                    if (e.target.value === 'goto_archivos') {
                      router.push('/archivos');
                    } else if (workspaceHandle && e.target.value) {
                      setActiveLocalGroup(e.target.value);
                      const ok = await fileManager.loadGroupFromWorkspace(workspaceHandle, e.target.value);
                      if (ok) {
                        toast.success("Grupo cargado correctamente");
                      } else {
                        toast.error("Error al cargar el grupo");
                      }
                    }
                  }
                }}
              >
                {dataSource === 'demo' ? (
                  <>
                    <option value="" disabled>Seleccionar Grupo...</option>
                    <option value="1a">G - 1A-GM - 0237 - 2025-26</option>
                    <option value="1b">G - 1B-GM - 0237 - 2025-26</option>
                    <option value="1c">G - 1C-GM - 0237 - 2025-26</option>
                  </>
                ) : (
                  <>
                    <option value="goto_archivos">Archivos</option>
                    {localGroups.length === 0 && <option value="" disabled>No hay grupos (.json) en la carpeta</option>}
                    {localGroups.length > 0 && <option value="" disabled>Seleccionar Grupo Local...</option>}
                    {localGroups.map(g => (
                      <option key={g} value={g}>{g.replace('.json', '')}</option>
                    ))}
                  </>
                )}
              </select>
              <div 
                className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none" 
                style={{ color: dataSource === 'demo' ? 'var(--warning)' : 'var(--success)' }}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>

        {/* Columna Central: Programación */}
        <span className={`text-[0.95rem] leading-tight tracking-wide truncate text-center transition-colors font-extrabold ${dataSource === 'demo' ? 'text-warning' : 'text-success'}`} title={friendlyModuleName}>
          Programación: {friendlyModuleName}
        </span>
        
        {/* Columna Derecha: Curso */}
        <span className={`text-[0.95rem] leading-tight tracking-wide truncate text-right transition-colors font-extrabold ${dataSource === 'demo' ? 'text-warning' : 'text-success'}`} title={friendlyCursoName}>
          Curso: {friendlyCursoName}
        </span>
      </div>

      {/* Fila 3: Breadcrumb y Buscar */}
      {currentItem && (
        <div className="w-full px-6 py-1.5 bg-white/[0.02] border-t border-[var(--glass-border)] flex items-center justify-between gap-1.5 text-sm text-muted tracking-wide">
          {/* Breadcrumb a la izquierda */}
          <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm text-muted whitespace-nowrap overflow-hidden text-ellipsis">
            <span className="font-medium text-foreground">{currentItem}</span>
            {breadcrumbSuffix && (
              <>
                <ChevronRight className="w-4 h-4 shrink-0" />
                <span className="truncate">{breadcrumbSuffix}</span>
              </>
            )}
            {/* Sync Status Indicator */}
            {dataSource === 'local' && (
              <div className="ml-4 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-foreground/5 text-xs font-medium">
                {syncStatus === 'saving' && <><Hourglass className="w-3 h-3 text-warning animate-spin" /><span className="text-warning">Guardando...</span></>}
                {syncStatus === 'saved' && <><Save className="w-3 h-3 text-success" /><span className="text-success">Guardado local</span></>}
                {syncStatus === 'error' && <><AlertTriangle className="w-3 h-3 text-danger" /><span className="text-danger">Error al guardar</span></>}
                {syncStatus === 'idle' && <><Cloud className="w-3 h-3 text-muted/50" /><span className="text-muted/60">Sincronizado</span></>}
              </div>
            )}
          </div>
        </div>

          {/* Búsqueda a la derecha */}
          <div className="flex items-center gap-3 shrink-0">
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
            
            {/* Acciones movidas desde la antigua Fila 2 */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 bg-foreground/5 p-1 rounded-lg">
                <button
                  onClick={() => undo()}
                  disabled={pastStatesLength === 0}
                  className="p-1.5 rounded text-muted hover:text-foreground hover:bg-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Deshacer (Ctrl+Z)"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => redo()}
                  disabled={futureStatesLength === 0}
                  className="p-1.5 rounded text-muted hover:text-foreground hover:bg-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Rehacer (Ctrl+Y)"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>

              {mounted && (
                <div className="flex items-center bg-foreground/5 rounded-lg p-0.5">
                  <ThemeSelector />
                </div>
              )}
            </div>
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
