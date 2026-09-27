"use client";
import { Menu } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAppStore, useTemporalStore } from "@/store/useAppStore";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { navGroups } from "@/config/navigation";
import { getAcronym } from "@/utils/catalogFormat";
import { showRichToast } from "@/utils/toast";
import { useTranslation } from "react-i18next";


export default function Header({ title, breadcrumbSuffix }: { title?: React.ReactNode; breadcrumbSuffix?: React.ReactNode }) {
  const { activeModuleId, activeCursoId, moduleData, cursoData, pdFileSource, cursoFileSource, saveModuleData, saveCursoData, toggleSidebar } = useAppStore();
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

  let currentItem = "";
  if (pathname === '/inicio') {
    currentItem = t('nav.inicio', {defaultValue: 'Inicio'});
  } else if (pathname === '/ayuda') {
    currentItem = t('nav.ayuda', {defaultValue: 'Ayuda'});
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
      showRichToast.error(t('toasts.header.conflictoVersionesTitulo', {defaultValue: 'Conflicto de versiones'}), t('toasts.header.conflictoVersionesDesc', {defaultValue: 'Los datos están obsoletos. Por favor, recarga la página.'}));
    } else if (ok === true) {
      showRichToast.success(t('toasts.header.guardadoConExitoTitulo', {defaultValue: 'Guardado con éxito'}), t('toasts.header.datosActualizadosDesc', {defaultValue: 'Datos actualizados.'}));
    } else {
      showRichToast.error(t('toasts.comun.errorGuardar', {defaultValue: 'Error al guardar'}), t('toasts.header.revisaConexionDatosDesc', {defaultValue: 'Revisa la conexión o los datos.'}));
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
      } else if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        // Navigate to help
        router.push('/inicio');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle command palette (placeholder)
        toast(t('toasts.header.paletaNoImplementada', {defaultValue: "Paleta de comandos no implementada todavía."}));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, pastStatesLength, futureStatesLength, handleSave]);

  let friendlyModuleName = t('campos.header.creaOAbreProgramacion', {defaultValue: 'Crea o abre una Programación'});
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
      
      const acronym = (nombre && getAcronym(nombre)) || nombre;
      friendlyModuleName = `P - ${degreeCode} - ${actualCode} - ${acronym || t('campos.archivos.programacionFallback', {defaultValue: 'Programación'})}`;
    } else {
      const namePart = activeModuleId.replace('-pd', '').toUpperCase();
      friendlyModuleName = `P - ${namePart}`;
    }
  }

  let friendlyCursoName = t('campos.header.creaOAbreCurso', {defaultValue: 'Crea o abre un Curso'});
  if (activeCursoId) {
    const parts = activeCursoId.split('-');
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

    // Identify group suffix dynamically instead of hardcoding 1A/1B/1C
    const matchGroup = activeCursoId.match(/-([1-9][A-Z])$/i);
    const groupSuffix = matchGroup ? matchGroup[1].toUpperCase() : '';

    if (groupSuffix) {
      // It's a derived group from a module
      friendlyCursoName = `C - ${year} - ${groupSuffix}-GM - FP`;
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
    <>
      {/* Barra solo-móvil: el resto de la fila (Telegram, deshacer/rehacer,
          configuración, En obras) vive ahora en la zona fija del Sidebar --
          en escritorio no queda ninguna barra aquí, para dar más espacio a
          la página. */}
      <div className="lg:hidden w-full flex items-center z-40 sticky top-0 bg-background/95 backdrop-blur-xl border-b border-[var(--glass-border)]">
        <button
          onClick={toggleSidebar}
          className="p-2 m-1 rounded-md text-foreground hover:bg-foreground/10 transition-colors"
          aria-label={t('aria.header.menuPrincipal', {defaultValue: 'Menú principal'})}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {title && (
        <header className="w-full flex items-center justify-center px-8 pt-4 pb-2">
          <div className="border-2 border-[#14a085] rounded-xl px-8 py-3 shadow-[0_4px_15px_rgba(20,160,133,0.1)] bg-background/50 backdrop-blur-sm">
            <h2 className="text-heading whitespace-nowrap font-extrabold tracking-tight primary-gradient-text m-0 leading-none">
              {title}
            </h2>
          </div>
        </header>
      )}
    </>
  );
}
