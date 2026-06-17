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


export default function Header({ title, breadcrumbSuffix }: { title?: React.ReactNode; breadcrumbSuffix?: React.ReactNode }) {
  const { activeModuleId, activeCursoId, moduleData, cursoData, saveModuleData, saveCursoData, isSidebarOpen, toggleSidebar, dataSource } = useAppStore();
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

  // Determine breadcrumb components based on pathname
  let currentItem = "";
  let breadcrumbLink = "";
  
  // Handle special pages first
  if (pathname === '/inicio') {
    currentItem = "Inicio";
    breadcrumbLink = "/inicio";
  } else if (pathname === '/agenda') {
    currentItem = "Agenda de clase";
    breadcrumbLink = "/agenda";
  } else {
    // Check navGroups for matching page
    for (const group of navGroups) {
      const found = group.items.find(item => item.href === pathname);
      if (found) {
        currentItem = found.label;
        breadcrumbLink = pathname;
        break;
      }
    }
    
    // If not found in navGroups, use pathname as fallback
    if (!currentItem) {
      // Extract meaningful name from pathname
      const pathParts = pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        currentItem = pathParts[pathParts.length - 1]
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        breadcrumbLink = pathname;
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
      try {
        await saveModuleData();
        setAutosaveStatus("saved");
        setTimeout(() => setAutosaveStatus("idle"), 2000);
      } catch (error) {
        setAutosaveStatus("error");
        showRichToast.error("Error al guardar el módulo");
      }
    }, 1000);
  }, [moduleData, activeModuleId, saveModuleData]);

  // Autosave Effect for cursoData
  useEffect(() => {
    if (initialLoadRef.current) {
      return;
    }

    if (!cursoData || !activeCursoId) return;

    if (cursoSaveTimeoutRef.current) {
      clearTimeout(cursoSaveTimeoutRef.current);
    }

    cursoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveCursoData();
      } catch (error) {
        showRichToast.error("Error al guardar el curso");
      }
    }, 1500);
  }, [cursoData, activeCursoId, saveCursoData]);

  // Search functionality
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = searchGlobal(query);
      setSearchResults(results);
      setShowResults(results.length > 0);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, []);

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setSearchQuery("");
    if (result.href) {
      router.push(result.href);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-[var(--glass-border)]">
      <div className="flex flex-col">
        {/* Top bar: Logo, nav, actions */}
        <nav className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleSidebar()}
              className="p-2 rounded-lg hover:bg-foreground/5 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent/80 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">FP</span>
              </div>
              <span className="font-semibold text-foreground hidden sm:inline">Gestión Docente FP</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => undo()}
                disabled={pastStates.length === 0}
                className="p-2 rounded-lg hover:bg-foreground/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Deshacer (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => redo()}
                disabled={futureStates.length === 0}
                className="p-2 rounded-lg hover:bg-foreground/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Rehacer (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {/* Cloud Sync Status */}
            {cloudSynced && (
              <div className="flex items-center gap-1.5 text-xs text-muted px-2 py-1 rounded-full bg-foreground/5">
                <Cloud className="w-3 h-3" />
                <span>Sincronizado</span>
              </div>
            )}

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-foreground/5 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
          </div>
        </nav>

        {/* Bottom bar: breadcrumb left + search right */}
        <div className="w-full px-6 py-1.5 bg-white/[0.02] border-t border-[var(--glass-border)] flex items-center justify-between gap-4">
          {/* Left: Breadcrumb: Inicio → Página → TAB */}
          <div className="flex items-center gap-1.5 text-sm text-muted tracking-wide min-w-0 flex-1">
            {pathname !== '/inicio' && currentItem && (
              <>
                <Link href="/inicio" className="font-medium text-muted hover:text-foreground transition-colors">Inicio</Link>
                <ChevronRight className="w-3 h-3 text-muted/80" />
              </>
            )}
            {currentItem && (
              <>
                {pathname === '/inicio' ? (
                  <span className="text-foreground/90 font-semibold">{currentItem}</span>
                ) : (
                  breadcrumbLink ? (
                    <Link href={breadcrumbLink} className="text-foreground/90 font-semibold hover:underline transition-colors">{currentItem}</Link>
                  ) : (
                    <span className="text-foreground/90 font-semibold">{currentItem}</span>
                  )
                )}
              </>
            )}
            {breadcrumbSuffix && (
              <>
                <ChevronRight className="w-3 h-3 text-muted/80" />
                <span className="text-foreground/90 font-semibold">{breadcrumbSuffix}</span>
              </>
            )}
          </div>
          
          {/* Right: Search */}
          <div className="relative w-1/2 md:w-64 lg:w-80 shrink-0">
            <input
              type="text"
              placeholder="Buscar..."
              aria-label="Buscar en la aplicación"
              role="searchbox"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowResults(searchResults.length > 0)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              className="bg-foreground/5 border border-[var(--glass-border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-accent/50 w-full"
            />
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-[var(--glass-border)] rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => handleResultClick(result)}
                    className="px-3 py-2 hover:bg-foreground/5 cursor-pointer text-xs"
                  >
                    {result.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}