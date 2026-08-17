import { get, set } from "idb-keyval";

// Lista de módulos-curso abiertos recientemente (ítem 35), para reabrir con
// un clic sin recordar dónde está guardado el fichero. Clave dedicada en
// IndexedDB (mismo mecanismo idb-keyval que usa el `persist` de Zustand) —
// NO dentro de `cdd-store-cache-v3`, donde `workspaceHandle` ya se excluye a
// propósito vía `partialize` (los FileSystemHandle no son JSON-serializables
// por JSON.stringify, pero sí por structured clone, que es lo que usa
// IndexedDB directamente).
const STORAGE_KEY = "cdd-recent-modules-v1";
const MAX_ENTRIES = 10;

export type RecentModuleTipo = "grupo" | "programacion" | "curso";

export interface RecentModuleEntry {
  id: string;
  nombre: string;
  tipo: RecentModuleTipo;
  fileName: string;
  lastAccessed: string;
  // 'grupo' se reabre vía directorio (loadGroupFromWorkspace necesita
  // resolver los .fpp/.fpc enlazados por nombre); 'programacion'/'curso'
  // sueltos (abiertos sin workspace) se reabren directamente por su propio
  // fileHandle. Ninguno de los dos existe si el navegador no soporta la
  // File System Access API (Firefox/Safari) — la entrada queda como
  // metadato puro, y "reabrir" cae al selector de fichero normal.
  dirHandle?: FileSystemDirectoryHandle;
  fileHandle?: FileSystemFileHandle;
}

export async function getRecentModules(): Promise<RecentModuleEntry[]> {
  const list = (await get(STORAGE_KEY)) as RecentModuleEntry[] | undefined;
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => (a.lastAccessed < b.lastAccessed ? 1 : -1));
}

export async function addOrUpdateRecentModule(entry: Omit<RecentModuleEntry, "lastAccessed">): Promise<void> {
  const list = await getRecentModules();
  const filtered = list.filter(e => e.id !== entry.id);
  const updated: RecentModuleEntry[] = [
    { ...entry, lastAccessed: new Date().toISOString() },
    ...filtered,
  ].slice(0, MAX_ENTRIES);
  await set(STORAGE_KEY, updated);
}

export async function removeRecentModule(id: string): Promise<void> {
  const list = await getRecentModules();
  await set(STORAGE_KEY, list.filter(e => e.id !== id));
}

export function supportsFileSystemAccess(): boolean {
  return typeof window !== "undefined" && "showOpenFilePicker" in window;
}
