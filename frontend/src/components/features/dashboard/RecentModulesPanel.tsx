"use client";
import React, { useEffect, useState } from "react";
import { Clock, FolderOpen, X, FileStack, BookOpen, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { fileManager } from "@/services/fileManager";
import {
  getRecentModules, removeRecentModule, supportsFileSystemAccess,
  RecentModuleEntry,
} from "@/services/recentModules";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const ICONO_TIPO = { grupo: FileStack, programacion: BookOpen, curso: Users } as const;
const LABEL_TIPO = { grupo: "Grupo", programacion: "Programación", curso: "Curso" } as const;

function tiempoRelativo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "ahora mismo";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return `hace ${d} d`;
}

async function ensurePermission(handle: FileSystemFileHandle | FileSystemDirectoryHandle): Promise<boolean> {
  const opts = { mode: "readwrite" as const };
  const anyHandle = handle as any;
  if ((await anyHandle.queryPermission(opts)) === "granted") return true;
  return (await anyHandle.requestPermission(opts)) === "granted";
}

export function RecentModulesPanel() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<RecentModuleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [reopening, setReopening] = useState<string | null>(null);
  const soportado = supportsFileSystemAccess();

  const refresh = () => {
    getRecentModules().then(list => { setEntries(list); setLoading(false); });
  };

  useEffect(() => { refresh(); }, []);

  const handleQuitar = async (id: string) => {
    await removeRecentModule(id);
    refresh();
  };

  const handleReabrir = async (entry: RecentModuleEntry) => {
    setReopening(entry.id);
    // Sin handle guardado (Firefox/Safari, o entrada solo-metadato): cae al
    // selector de fichero normal. openProgramacionWithHandle/openCursoWithHandle
    // ya devuelven false sin más en caso de AbortError (usuario cancela el
    // selector) -- eso NO es un fallo real, así que aquí nunca se quita la
    // entrada ni se muestra un error alarmante por ese caso.
    if (!entry.dirHandle && !entry.fileHandle) {
      if (entry.tipo === "grupo") {
        toast(t('toasts.recientes.irAAbrirGrupo', {fileName: entry.fileName, defaultValue: 'Ve a Archivo → Abrir grupo y selecciona la carpeta que contiene "{{fileName}}".'}));
        setReopening(null);
        return;
      }
      toast(t('toasts.recientes.seleccionaDeNuevo', {fileName: entry.fileName, defaultValue: 'Selecciona de nuevo "{{fileName}}" — tu navegador no permite reabrirlo directamente.'}));
      try {
        const ok = entry.tipo === "curso"
          ? await fileManager.openCursoWithHandle()
          : await fileManager.openProgramacionWithHandle();
        if (ok) toast.success(t('toasts.recientes.reabierto', {nombre: entry.nombre, defaultValue: '"{{nombre}}" reabierto.'}));
      } finally {
        setReopening(null);
        refresh();
      }
      return;
    }

    try {
      const handle = (entry.tipo === "grupo" ? entry.dirHandle : entry.fileHandle)!;
      if (!(await ensurePermission(handle))) {
        // Permiso denegado esta vez -- el fichero sigue existiendo, no se
        // quita la entrada, el profesor puede volver a intentarlo.
        toast.error(t('toasts.recientes.permisoDenegado', {defaultValue: "Permiso denegado para acceder al archivo o carpeta."}));
        return;
      }

      let ok = false;
      if (entry.tipo === "grupo" && entry.dirHandle) {
        // loadGroupFromWorkspace se traga sus propios errores internamente
        // (se comparte con el flujo normal de abrir grupo, que no distingue
        // "no encontrado" de otros fallos) -- comprobación previa aparte para
        // poder detectar aquí un NotFoundError real y limpiar la entrada.
        await entry.dirHandle.getFileHandle(entry.fileName);
        useAppStore.getState().setWorkspaceHandle(entry.dirHandle);
        ok = await fileManager.loadGroupFromWorkspace(entry.dirHandle, entry.fileName);
      } else if (entry.tipo === "programacion" && entry.fileHandle) {
        useAppStore.getState().setDataSource("local");
        ok = await fileManager.openProgramacionFromHandle(entry.fileHandle);
      } else if (entry.tipo === "curso" && entry.fileHandle) {
        useAppStore.getState().setDataSource("local");
        ok = await fileManager.openCursoFromHandle(entry.fileHandle);
      }

      if (ok) {
        toast.success(t('toasts.recientes.reabierto', {nombre: entry.nombre, defaultValue: '"{{nombre}}" reabierto.'}));
      } else {
        // Fallo sin excepción (p.ej. formato de fichero inválido) -- no se
        // sabe si es reversible, no se quita la entrada automáticamente.
        toast.error(t('toasts.recientes.errorReabrir', {nombre: entry.nombre, defaultValue: 'No se pudo reabrir "{{nombre}}".'}));
      }
    } catch (e: any) {
      if (e?.name === "NotFoundError") {
        toast.error(t('toasts.recientes.yaNoExiste', {nombre: entry.nombre, defaultValue: '"{{nombre}}" ya no se encuentra donde estaba. Se quita de recientes.'}));
        await removeRecentModule(entry.id);
      } else if (e?.name !== "AbortError") {
        console.error("Error reabriendo módulo reciente", e);
        toast.error(t('toasts.recientes.errorGenerico', {defaultValue: "Error al reabrir el archivo."}));
      }
    } finally {
      setReopening(null);
      refresh();
    }
  };

  if (loading || entries.length === 0) return null;

  return (
    <Card className="p-6 border border-[var(--glass-border)] bg-[var(--glass-bg)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-subheading font-bold text-foreground flex items-center gap-2">
          <Clock className="w-[1.2em] h-[1.2em]" /> Módulos recientes
        </h2>
        {!soportado && (
          <span className="text-caption text-muted">
            Reapertura con un clic solo disponible en Chrome/Edge — en este navegador se te pedirá elegir el archivo.
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {entries.map(entry => {
          const Icono = ICONO_TIPO[entry.tipo];
          return (
            <div key={entry.id} className="p-4 rounded-xl border border-[var(--glass-border)] bg-foreground/5 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Icono className="w-4 h-4 text-accent shrink-0" />
                  <span className="font-semibold text-foreground truncate" title={entry.nombre}>{entry.nombre}</span>
                </div>
                <button
                  onClick={() => handleQuitar(entry.id)}
                  className="text-muted hover:text-danger transition-colors shrink-0"
                  title="Quitar de recientes"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-caption text-muted">
                {LABEL_TIPO[entry.tipo]} · {tiempoRelativo(entry.lastAccessed)}
              </div>
              <Button
                onClick={() => handleReabrir(entry)}
                disabled={reopening === entry.id}
                className="mt-1 text-caption bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 gap-2 justify-center"
              >
                <FolderOpen className="w-3.5 h-3.5" /> {reopening === entry.id ? "Abriendo..." : "Reabrir"}
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
