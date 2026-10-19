/**
 * Generación de documentos (PDF y .docx) sin enviar datos del alumnado a ningún servidor.
 *
 * Es un sustituto directo de `fetch(`${getApiBase()}/api/pdf?...`, { method: "POST", body })`:
 * recibe la misma URL y el mismo cuerpo y devuelve un `Response` con el documento.
 *
 *  - En el navegador, los generadores de backend/ se ejecutan en el propio equipo con Pyodide
 *    (Python en WebAssembly) dentro de un Worker: public/generadores-worker.js. Los datos
 *    (`curso_data`, `module_data`) no viajan por la red. Al servidor solo se le pide, para las
 *    programaciones, el texto oficial del currículo del módulo, enviando únicamente su código.
 *  - En la app de escritorio (Tauri), el "servidor" es el sidecar local (127.0.0.1), así que se
 *    mantiene la llamada HTTP de siempre: tampoco sale nada del equipo.
 */
import { isTauri } from "@tauri-apps/api/core";
import { getApiBase } from "./apiBase";

type Respuesta =
  | { id: number; ok: true; mime: string; headers: Record<string, string>; data: ArrayBuffer }
  | { id: number; ok: false; status: number; detail: string };

let worker: Worker | null = null;
let siguienteId = 1;
const pendientes = new Map<number, (r: Respuesta) => void>();

function obtenerWorker(): Worker {
  if (!worker) {
    worker = new Worker("/generadores-worker.js");
    worker.onmessage = (ev: MessageEvent) => {
      const r = ev.data as Respuesta;
      const resolver = pendientes.get(r.id);
      if (resolver) {
        pendientes.delete(r.id);
        resolver(r);
      }
    };
    worker.onerror = () => {
      for (const [id, resolver] of pendientes) resolver({ id, ok: false, status: 500, detail: "El generador local no pudo arrancar" });
      pendientes.clear();
      worker = null;
    };
  }
  return worker;
}

/** Empieza a cargar el generador sin esperar a que el usuario pida un documento (la primera vez descarga unos 30 MB, luego queda en caché). */
export function precalentarGeneradores(): void {
  if (typeof window === "undefined" || isTauri()) return;
  obtenerWorker().postMessage({ precalentar: true });
}

function ejecutar(peticion: Record<string, unknown>): Promise<Respuesta> {
  const id = siguienteId++;
  return new Promise((resolve) => {
    pendientes.set(id, resolve);
    obtenerWorker().postMessage({ id, peticion: JSON.stringify(peticion) });
  });
}

/** Catálogo oficial para las programaciones. Solo envía el código de módulo; si no hay red, se genera sin él. */
async function contextoCatalogo(moduleData: any): Promise<{ curriculo_data?: unknown; grado_info?: unknown }> {
  const codigo = moduleData?.info_modulo?.codigo;
  if (!codigo) return {};
  try {
    const res = await fetch(`${getApiBase()}/api/catalog/pd-context/${encodeURIComponent(String(codigo))}`);
    if (!res.ok) return {};
    const json = await res.json();
    return json?.data ?? {};
  } catch {
    return {};
  }
}

export async function fetchDocumento(url: string, init: RequestInit): Promise<Response> {
  if (isTauri()) return fetch(url, init); // sidecar local de la app de escritorio

  const params = new URL(url, window.location.origin).searchParams;
  const cuerpo = JSON.parse(String(init.body ?? "{}"));
  const tipo = params.get("type") ?? "";
  const esProgramacion = tipo.startsWith("programacion_");
  const catalogo = esProgramacion ? await contextoCatalogo(cuerpo.module_data) : {};

  const r = await ejecutar({
    type: tipo,
    module_data: cuerpo.module_data ?? {},
    curso_data: cuerpo.curso_data ?? {},
    fecha_corte: cuerpo.fecha_corte ?? null,
    extra: cuerpo.extra ?? null,
    al_id: params.get("al_id"),
    item_id: params.get("item_id"),
    file_format: params.get("file_format") ?? "pdf",
    ...catalogo,
  });

  if (!r.ok) {
    return new Response(JSON.stringify({ detail: r.detail }), { status: r.status, headers: { "Content-Type": "application/json" } });
  }
  return new Response(r.data, { status: 200, headers: { "Content-Type": r.mime, ...r.headers } });
}
