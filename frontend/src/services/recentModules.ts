import { get, set } from "idb-keyval";
import { isTauri } from "@tauri-apps/api/core";
import type { DirRef, FileRef } from "@/types";

// Lista de módulos-curso abiertos recientemente (ítem 35), para reabrir con
// un clic sin recordar dónde está guardado el fichero.
//
// En el navegador: clave dedicada en IndexedDB (mismo mecanismo idb-keyval
// que usa el `persist` de Zustand) -- NO dentro de `cdd-store-cache-v3`,
// donde `workspaceHandle` ya se excluye a propósito vía `partialize` (los
// FileSystemHandle no son JSON-serializables por JSON.stringify, pero sí
// por structured clone, que es lo que usa IndexedDB directamente).
//
// Bajo Tauri: fichero JSON plano vía @tauri-apps/plugin-store, nunca
// IndexedDB (mismo criterio que useAppStore.ts::partialize -- lo único que
// el webview puede llegar a cachear son preferencias, no datos reales; y
// aquí ni siquiera hay datos reales, solo rutas de disco, así que un JSON
// inspeccionable es estrictamente mejor que IndexedDB de todos modos). Las
// refs bajo Tauri son siempre `{kind:'path', path}` -- JSON-serializables
// sin más, a diferencia de las `{kind:'handle', handle}` del navegador.
const STORAGE_KEY = "cdd-recent-modules-v1";
const MAX_ENTRIES = 10;

let tauriStorePromise: Promise<import("@tauri-apps/plugin-store").Store> | null = null;
async function getTauriStore() {
  if (!tauriStorePromise) {
    tauriStorePromise = import("@tauri-apps/plugin-store").then(({ Store }) => Store.load("recent-modules.json"));
  }
  return tauriStorePromise;
}

export type RecentModuleTipo = "grupo" | "programacion" | "curso";

export interface RecentModuleEntry {
  id: string;
  nombre: string;
  tipo: RecentModuleTipo;
  fileName: string;
  lastAccessed: string;
  // 'grupo' se reabre vía directorio (loadGroupFromWorkspace necesita
  // resolver los .fpp/.fpc enlazados por nombre); 'programacion'/'curso'
  // sueltos (abiertos sin workspace) se reabren directamente por su propia
  // fileRef. Bajo el navegador (no Tauri), ninguno de los dos existe si no
  // soporta la File System Access API (Firefox/Safari) — la entrada queda
  // como metadato puro, y "reabrir" cae al selector de fichero normal.
  dirRef?: DirRef;
  fileRef?: FileRef;
}

async function readList(): Promise<RecentModuleEntry[]> {
  let list: RecentModuleEntry[] | undefined;
  if (isTauri()) {
    const store = await getTauriStore();
    list = await store.get<RecentModuleEntry[]>(STORAGE_KEY);
  } else {
    list = (await get(STORAGE_KEY)) as RecentModuleEntry[] | undefined;
  }
  return Array.isArray(list) ? list : [];
}

async function writeList(list: RecentModuleEntry[]): Promise<void> {
  if (isTauri()) {
    const store = await getTauriStore();
    await store.set(STORAGE_KEY, list);
    return;
  }
  await set(STORAGE_KEY, list);
}

export async function getRecentModules(): Promise<RecentModuleEntry[]> {
  const list = await readList();
  return [...list].sort((a, b) => (a.lastAccessed < b.lastAccessed ? 1 : -1));
}

export async function addOrUpdateRecentModule(entry: Omit<RecentModuleEntry, "lastAccessed">): Promise<void> {
  const list = await readList();
  const filtered = list.filter(e => e.id !== entry.id);
  const updated: RecentModuleEntry[] = [
    { ...entry, lastAccessed: new Date().toISOString() },
    ...filtered,
  ].slice(0, MAX_ENTRIES);
  await writeList(updated);
}

export async function removeRecentModule(id: string): Promise<void> {
  const list = await readList();
  await writeList(list.filter(e => e.id !== id));
}

export function supportsFileSystemAccess(): boolean {
  if (isTauri()) return true;
  return typeof window !== "undefined" && "showOpenFilePicker" in window;
}
