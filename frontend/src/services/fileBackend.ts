/**
 * Capa de abstracción sobre el sistema de ficheros real (Fase 4 del plan
 * Tauri, RF Ideas/00 IDEAS.md). fileManager.ts, moduleSlice.ts y
 * RecentModulesPanel.tsx dependen de esto en vez de llamar directamente a
 * `window.showOpenFilePicker`/`FileSystemFileHandle` -- así el mismo código
 * sirve tanto a la web app (File System Access API, solo Chrome/Edge) como
 * a la build de escritorio con Tauri (plugin-dialog + plugin-fs, que no
 * tienen el concepto de "handle", solo rutas de texto).
 *
 * Los imports de los plugins de Tauri son dinámicos (`await import(...)`)
 * para que el bundle de la web app no incluya ni intente cargar en runtime
 * un módulo que solo existe dentro de un webview Tauri.
 */
import type { FileRef, DirRef } from "@/types";
import { isTauri } from "@tauri-apps/api/core";
export { isTauri };

interface FilterSpec {
  description: string;
  /** Sin el punto, p.ej. ['fpp', 'json']. */
  extensions: string[];
}

function toBrowserAccept(extensions: string[]): Record<string, string[]> {
  return { "application/json": extensions.map((e) => `.${e}`) };
}

function isAbort(e: any): boolean {
  return e?.name === "AbortError";
}

function notFound(detail: string): Error {
  const err = new Error(detail) as Error & { name: string };
  err.name = "NotFoundError";
  return err;
}

/** Abre el selector de "abrir fichero" nativo y devuelve su contenido ya leído. null si el usuario cancela. */
export async function pickOpenFile(filter: FilterSpec): Promise<{ ref: FileRef; name: string; content: string } | null> {
  if (isTauri()) {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const path = await open({ multiple: false, filters: [{ name: filter.description, extensions: filter.extensions }] });
    if (!path || Array.isArray(path)) return null;
    const { readTextFile } = await import("@tauri-apps/plugin-fs");
    const { basename } = await import("@tauri-apps/api/path");
    const [content, name] = await Promise.all([readTextFile(path), basename(path)]);
    return { ref: { kind: "path", path }, name, content };
  }
  try {
    const [handle] = await window.showOpenFilePicker({
      types: [{ description: filter.description, accept: toBrowserAccept(filter.extensions) }],
      multiple: false,
    });
    const file = await handle.getFile();
    const content = await file.text();
    return { ref: { kind: "handle", handle }, name: file.name, content };
  } catch (e: any) {
    if (isAbort(e)) return null;
    throw e;
  }
}

/** Abre el selector de "guardar como" nativo. No escribe nada todavía -- usar writeFile() con el ref devuelto. null si el usuario cancela. */
export async function pickSaveFile(suggestedName: string, filter: FilterSpec): Promise<{ ref: FileRef; name: string } | null> {
  if (isTauri()) {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const path = await save({ defaultPath: suggestedName, filters: [{ name: filter.description, extensions: filter.extensions }] });
    if (!path) return null;
    const { basename } = await import("@tauri-apps/api/path");
    const name = await basename(path);
    return { ref: { kind: "path", path }, name };
  }
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: [{ description: filter.description, accept: toBrowserAccept(filter.extensions) }],
    });
    return { ref: { kind: "handle", handle }, name: handle.name };
  } catch (e: any) {
    if (isAbort(e)) return null;
    throw e;
  }
}

/** Escribe el contenido en la ref (sobrescribe si ya existe). */
export async function writeFile(ref: FileRef, content: string): Promise<void> {
  if (ref.kind === "path") {
    const { writeTextFile } = await import("@tauri-apps/plugin-fs");
    await writeTextFile(ref.path, content);
    return;
  }
  const writable = await ref.handle.createWritable();
  await writable.write(content);
  await writable.close();
}

/** Lee el contenido actual de la ref. */
export async function readFile(ref: FileRef): Promise<{ name: string; content: string }> {
  if (ref.kind === "path") {
    const { readTextFile } = await import("@tauri-apps/plugin-fs");
    const { basename } = await import("@tauri-apps/api/path");
    const [content, name] = await Promise.all([readTextFile(ref.path), basename(ref.path)]);
    return { name, content };
  }
  const file = await ref.handle.getFile();
  const content = await file.text();
  return { name: file.name, content };
}

/**
 * Comprueba/pide permiso de lectoescritura antes de reabrir un fichero
 * "reciente" guardado de una sesión anterior. Bajo Tauri no hace falta: el
 * propio selector nativo ya concedió acceso a esa ruta a nivel de SO, no
 * hay un permiso de página web que pueda haber caducado.
 */
export async function ensureReadWritePermission(ref: FileRef | DirRef): Promise<boolean> {
  if (ref.kind === "path") return true;
  const opts: FileSystemHandlePermissionDescriptor = { mode: "readwrite" };
  if ((await ref.handle.queryPermission(opts)) === "granted") return true;
  return (await ref.handle.requestPermission(opts)) === "granted";
}

/** Abre el selector de carpeta nativo. null si el usuario cancela. */
export async function pickDirectory(): Promise<DirRef | null> {
  if (isTauri()) {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const path = await open({ directory: true, multiple: false });
    if (!path || Array.isArray(path)) return null;
    return { kind: "path", path };
  }
  try {
    const handle = await window.showDirectoryPicker({ mode: "readwrite" });
    return { kind: "handle", handle };
  } catch (e: any) {
    if (isAbort(e)) return null;
    throw e;
  }
}

/** Lista los ficheros de una carpeta que empiezan por `prefix` (opcional) y acaban en alguna de `extensions`. Solo un nivel, no recursivo. */
export async function listDirFileNames(dir: DirRef, opts: { prefix?: string; extensions: string[] }): Promise<string[]> {
  const matches = (name: string) =>
    (!opts.prefix || name.startsWith(opts.prefix)) && opts.extensions.some((ext) => name.endsWith(`.${ext}`));

  if (dir.kind === "path") {
    const { readDir } = await import("@tauri-apps/plugin-fs");
    const entries = await readDir(dir.path);
    return entries.filter((e) => e.isFile && matches(e.name)).map((e) => e.name).sort();
  }
  const names: string[] = [];
  for await (const entry of dir.handle.values()) {
    if (entry.kind === "file" && matches(entry.name)) names.push(entry.name);
  }
  return names.sort();
}

/** Obtiene la ref de un fichero dentro de una carpeta ya elegida, sin leerlo todavía. Lanza NotFoundError si no existe y create no es true. */
export async function getFileRefInDir(dir: DirRef, filename: string, opts?: { create?: boolean }): Promise<FileRef> {
  if (dir.kind === "path") {
    const { join } = await import("@tauri-apps/api/path");
    const path = await join(dir.path, filename);
    if (!opts?.create) {
      const { exists } = await import("@tauri-apps/plugin-fs");
      if (!(await exists(path))) throw notFound(`No existe: ${filename}`);
    }
    return { kind: "path", path };
  }
  const handle = await dir.handle.getFileHandle(filename, { create: opts?.create });
  return { kind: "handle", handle };
}

/** Lee un fichero dentro de una carpeta ya elegida (grupo/programación/curso enlazados por nombre). */
export async function readFileInDir(dir: DirRef, filename: string): Promise<{ content: string; ref: FileRef }> {
  const ref = await getFileRefInDir(dir, filename);
  const { content } = await readFile(ref);
  return { content, ref };
}

/** Crea (si hace falta) y escribe un fichero dentro de una carpeta ya elegida. Devuelve la ref para guardarla como fuente del fichero. */
export async function writeFileInDir(dir: DirRef, filename: string, content: string): Promise<FileRef> {
  const ref = await getFileRefInDir(dir, filename, { create: true });
  await writeFile(ref, content);
  return ref;
}
