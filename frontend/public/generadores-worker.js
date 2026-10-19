/* Worker que genera los documentos (PDF y .docx) en el navegador con Pyodide (Python en WebAssembly).
 *
 * Los datos del alumnado no salen del equipo: este worker carga Pyodide y los generadores
 * desde el propio sitio (public/pyodide y public/generadores, creados por
 * scripts/preparar-generadores.mjs) y trabaja sin red. Ver backend/pdf_dispatch.py.
 *
 * Mensajes:  { id, peticion: <string JSON> }  ->  { id, ok, mime, headers, data: ArrayBuffer }
 *                                                | { id, ok: false, status, detail }
 */
let listo = null;
let pyodide = null;

function iniciar() {
  if (listo) return listo;
  listo = (async () => {
    const base = new URL("./", self.location.href);
    importScripts(new URL("pyodide/pyodide.js", base).href);
    pyodide = await self.loadPyodide({
      indexURL: new URL("pyodide/", base).href,
      lockFileURL: new URL("pyodide/pyodide-lock.json", base).href,
    });
    const manifiesto = await (await fetch(new URL("generadores/manifest.json", base))).json();
    await pyodide.loadPackage(manifiesto.paquetes);
    pyodide.FS.mkdirTree("/app/templates");
    await Promise.all(manifiesto.ficheros.map(async (f) => {
      const res = await fetch(new URL("generadores/" + f, base));
      if (!res.ok) throw new Error("No se pudo cargar " + f);
      pyodide.FS.writeFile("/app/" + f, new Uint8Array(await res.arrayBuffer()));
    }));
    pyodide.runPython("import sys\nsys.path.insert(0, '/app')\nimport pdf_local");
  })().catch((e) => { listo = null; throw e; });
  return listo;
}

self.onmessage = async (ev) => {
  if (ev.data && ev.data.precalentar) { // carga Pyodide sin generar nada
    iniciar().then(() => self.postMessage({ precalentado: true }), () => {});
    return;
  }
  const { id, peticion } = ev.data;
  try {
    await iniciar();
    pyodide.globals.set("_peticion", peticion);
    const proxy = pyodide.runPython("pdf_local.generar_desde_json(_peticion)");
    const r = proxy.toJs({ dict_converter: Object.fromEntries });
    proxy.destroy();
    pyodide.globals.delete("_peticion");
    if (!r.ok) {
      self.postMessage({ id, ok: false, status: r.status, detail: r.detail });
      return;
    }
    const bytes = new Uint8Array(r.data);
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    self.postMessage({ id, ok: true, mime: r.mime, headers: r.headers, data: buffer }, [buffer]);
  } catch (e) {
    self.postMessage({ id, ok: false, status: 500, detail: "No se pudo generar el documento en el equipo: " + (e && e.message ? e.message : String(e)) });
  }
};
