import { isTauri } from "@tauri-apps/api/core";

/**
 * Entrega un fichero generado al usuario. En el navegador, descarga directa.
 * En la app de escritorio (WebView2) el enlace con `download` no guarda nada,
 * así que se pregunta dónde guardarlo y se escribe con plugin-fs.
 * Devuelve false si el usuario cancela el cuadro de guardar.
 */
export async function descargarArchivo(blob: Blob, nombre: string): Promise<boolean> {
  if (isTauri()) {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const ext = nombre.includes(".") ? nombre.split(".").pop()! : "";
    const ruta = await save({
      defaultPath: nombre,
      filters: ext ? [{ name: ext.toUpperCase(), extensions: [ext] }] : undefined,
    });
    if (!ruta) return false;
    const { writeFile } = await import("@tauri-apps/plugin-fs");
    await writeFile(ruta, new Uint8Array(await blob.arrayBuffer()));
    return true;
  }
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  return true;
}
