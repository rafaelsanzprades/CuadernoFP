/**
 * Autoactualización de la app de escritorio (Fase 9 del plan Tauri, RF Ideas/
 * 00 IDEAS.md) -- comprueba `src-tauri/tauri.conf.json::plugins.updater.endpoints`
 * (un `latest.json` publicado como asset de cada GitHub Release), descarga e
 * instala si hay una versión más nueva firmada con la clave privada local
 * (`src-tauri/updater-signing-key.pem`, gitignored -- nunca en el repo). No
 * tiene sentido en el navegador -- los llamadores deben comprobar `isTauri()`
 * antes de usar esto.
 */
import { check as checkForUpdate, type DownloadEvent } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export interface UpdateInfo {
  version: string;
  currentVersion: string;
  date?: string;
  body?: string;
}

/** Comprueba si hay una versión más nueva publicada. null si ya está al día. */
export async function checkForUpdates(): Promise<UpdateInfo | null> {
  const update = await checkForUpdate();
  if (!update) return null;
  return {
    version: update.version,
    currentVersion: update.currentVersion,
    date: update.date,
    body: update.body,
  };
}

/**
 * Descarga e instala la actualización ya detectada por checkForUpdates().
 * En Windows, install()/downloadAndInstall() cierra la app tras lanzar el
 * instalador -- no hace falta relanzarla a mano. En macOS/Linux (fuera de
 * alcance por ahora, Fase 11 del plan) sí haría falta relaunch().
 */
export async function downloadAndInstallUpdate(onProgress?: (event: DownloadEvent) => void): Promise<void> {
  const update = await checkForUpdate();
  if (!update) throw new Error("No hay ninguna actualización pendiente -- llama primero a checkForUpdates().");
  await update.downloadAndInstall(onProgress);
  if (navigator.platform && !/win/i.test(navigator.platform)) {
    await relaunch();
  }
}
