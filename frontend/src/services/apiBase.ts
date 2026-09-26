/**
 * URL base del backend, resuelta en tiempo de arranque de la app -- no en
 * tiempo de compilación como `process.env.NEXT_PUBLIC_API_URL` (Next.js
 * sustituye esa referencia por un literal fijo al compilar el bundle). Eso
 * vale para la web app (apunta a Cloud Run o al backend de PM2 en dev, fijo
 * de antemano), pero no para el build de escritorio con Tauri: el sidecar
 * elige su puerto en caliente cada vez que arranca (`backend/run_sidecar.py`,
 * Fase 1 del plan Tauri), así que el valor solo se conoce en tiempo de
 * ejecución, vía el comando `get_backend_port` (`src-tauri/src/sidecar.rs`).
 *
 * `getApiBase()` es síncrono a propósito -- todos los `fetch(...)` que ya
 * usaban `${process.env.NEXT_PUBLIC_API_URL}/api/...}` lo sustituyen por
 * `${getApiBase()}/api/...}` sin más cambios. En el navegador se resuelve
 * de inmediato (mismo valor que antes). Bajo Tauri, `initApiBase()` se
 * dispara como efecto de este mismo módulo en cuanto se importa en el
 * cliente -- la llamada a `invoke` es una simple lectura de un Mutex ya
 * poblado en Rust, sin I/O real, así que en la práctica está resuelta
 * mucho antes de que el usuario llegue a pulsar nada que dispare un fetch.
 */
import { isTauri } from "@tauri-apps/api/core";

let cachedBase: string = process.env.NEXT_PUBLIC_API_URL || "";
let initPromise: Promise<void> | null = null;

// El comando devuelve None hasta que sidecar.rs lee la primera línea
// "PORT=<n>" que imprime run_sidecar.py -- en el .exe empaquetado (PyInstaller
// onefile) eso puede tardar bastante más que en dev (arranque en frío del
// intérprete, a veces con descompresión a un directorio temporal en el
// primer lanzamiento), así que hace falta reintentar, no asumir que ya está
// listo en la primera llamada.
const PORT_POLL_INTERVAL_MS = 200;
const PORT_POLL_TIMEOUT_MS = 30_000;

async function resolveTauriBase(): Promise<void> {
  const { invoke } = await import("@tauri-apps/api/core");
  const deadline = Date.now() + PORT_POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const port = await invoke<number | null>("get_backend_port");
    if (port) {
      cachedBase = `http://127.0.0.1:${port}`;
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, PORT_POLL_INTERVAL_MS));
  }
  throw new Error("Timeout esperando a que el backend arranque (get_backend_port nunca devolvió un puerto)");
}

/** Dispara (o reutiliza) la resolución del puerto real bajo Tauri. En el navegador no hace nada. */
export function initApiBase(): Promise<void> {
  if (!initPromise) {
    initPromise = isTauri()
      ? resolveTauriBase().catch((e) => {
          console.error("[apiBase] No se pudo resolver el puerto del backend Tauri", e);
        })
      : Promise.resolve();
  }
  return initPromise;
}

/** Lectura síncrona del valor ya resuelto (o del NEXT_PUBLIC_API_URL de compilación como arranque). */
export function getApiBase(): string {
  return cachedBase;
}

if (typeof window !== "undefined") {
  initApiBase();
}
