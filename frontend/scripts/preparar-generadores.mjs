// Prepara lo necesario para generar documentos (PDF y .docx) en el navegador, sin enviar
// datos del alumnado a ningún servidor:
//
//   public/pyodide/       Python en WebAssembly (Pyodide) y sus paquetes, con un
//                         pyodide-lock.json que añade los paquetes puros de PyPI.
//   public/generadores/   Los generadores de ../backend (módulos .py y plantillas .docx)
//                         y un manifest.json con la lista.
//
// Todo se genera y está en .gitignore. Se ejecuta desde `npm run dev` / `npm run build`
// (hooks predev/prebuild) y desde el flujo de despliegue, que llama a `next build` directamente.
// Las descargas se guardan en .cache/pyodide para no repetirlas.
//
// Los paquetes puros se fijan a las mismas versiones que backend/requirements.txt.
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const frontend = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const backend = path.join(path.dirname(frontend), "backend");
const publicDir = path.join(frontend, "public");
const outPyodide = path.join(publicDir, "pyodide");
const outGen = path.join(publicDir, "generadores");
const cache = path.join(frontend, ".cache", "pyodide");

const require = createRequire(import.meta.url);
const pyodideDir = path.dirname(require.resolve("pyodide/package.json"));
const pyodideVersion = JSON.parse(readFileSync(path.join(pyodideDir, "package.json"), "utf8")).version;
const CDN = `https://cdn.jsdelivr.net/pyodide/v${pyodideVersion}/full/`;

// Paquetes que se cargan desde el lock de Pyodide (con sus dependencias)
const DE_PYODIDE = ["pandas", "lxml", "jinja2", "pillow", "typing-extensions"];
// Paquetes puros (py3-none-any) de PyPI, con versión fija. `depends` son nombres del lock.
const DE_PYPI = [
  { name: "chardet", version: "5.2.0", imports: ["chardet"], depends: [] },
  { name: "reportlab", version: "4.4.0", imports: ["reportlab"], depends: ["pillow", "chardet"] },
  { name: "python-docx", version: "1.2.0", imports: ["docx"], depends: ["lxml", "typing-extensions"] },
  { name: "docxtpl", version: "0.20.2", imports: ["docxtpl"], depends: ["python-docx", "jinja2", "lxml"] },
];
// Ficheros del backend que necesitan los generadores
const FICHERO_BACKEND = /^(pdf_.*|pdf_dispatch|pdf_local|generador_(pd_.*|ud_tarea)|helpers_(catalogo|pd_tablas)|docx_helpers|planning_generator)\.py$/;

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

async function descargar(url, destino, hashEsperado) {
  if (existsSync(destino) && (!hashEsperado || sha256(readFileSync(destino)) === hashEsperado)) return;
  process.stdout.write(`  descargando ${path.basename(destino)}\n`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (hashEsperado && sha256(buf) !== hashEsperado) throw new Error(`Hash incorrecto en ${url}`);
  writeFileSync(destino, buf);
}

mkdirSync(cache, { recursive: true });
rmSync(outPyodide, { recursive: true, force: true });
rmSync(outGen, { recursive: true, force: true });
mkdirSync(outPyodide, { recursive: true });
mkdirSync(path.join(outGen, "templates"), { recursive: true });

// 1) Núcleo de Pyodide
for (const f of ["pyodide.js", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip"]) {
  copyFileSync(path.join(pyodideDir, f), path.join(outPyodide, f));
}

// 2) Lock: el de Pyodide más los paquetes puros de PyPI
const lock = JSON.parse(readFileSync(path.join(pyodideDir, "pyodide-lock.json"), "utf8"));
const necesarios = new Set();
const visitar = (n) => {
  const k = n.toLowerCase();
  if (necesarios.has(k)) return;
  const e = lock.packages[k];
  if (!e) throw new Error(`Paquete ${n} no está en el lock de Pyodide`);
  necesarios.add(k);
  e.depends.forEach(visitar);
};
DE_PYODIDE.forEach(visitar);

for (const k of necesarios) {
  const e = lock.packages[k];
  const destino = path.join(cache, e.file_name);
  await descargar(CDN + e.file_name, destino, e.sha256);
  copyFileSync(destino, path.join(outPyodide, e.file_name));
}

for (const p of DE_PYPI) {
  const meta = await (await fetch(`https://pypi.org/pypi/${p.name}/${p.version}/json`)).json();
  const w = meta.urls.find((u) => u.packagetype === "bdist_wheel" && u.filename.endsWith("-py3-none-any.whl"));
  if (!w) throw new Error(`Sin wheel puro para ${p.name} ${p.version}`);
  const destino = path.join(cache, w.filename);
  await descargar(w.url, destino, w.digests.sha256);
  copyFileSync(destino, path.join(outPyodide, w.filename));
  lock.packages[p.name] = {
    name: p.name, version: p.version, file_name: w.filename, install_dir: "site", sha256: w.digests.sha256,
    package_type: "package", imports: p.imports, depends: p.depends, unvendored_tests: false, tool: {},
  };
}
writeFileSync(path.join(outPyodide, "pyodide-lock.json"), JSON.stringify(lock));

// 3) Generadores del backend
const ficheros = [];
for (const f of readdirSync(backend).filter((f) => FICHERO_BACKEND.test(f))) {
  copyFileSync(path.join(backend, f), path.join(outGen, f));
  ficheros.push(f);
}
for (const f of readdirSync(path.join(backend, "templates")).filter((f) => /^modelo_pd_.*\.docx$/.test(f))) {
  copyFileSync(path.join(backend, "templates", f), path.join(outGen, "templates", f));
  ficheros.push("templates/" + f);
}
writeFileSync(path.join(outGen, "manifest.json"), JSON.stringify({
  version: sha256(Buffer.from(ficheros.map((f) => f + sha256(readFileSync(path.join(outGen, f)))).join())).slice(0, 12),
  paquetes: [...necesarios, ...DE_PYPI.map((p) => p.name)],
  ficheros,
}));
console.log(`[generadores] listo: Pyodide ${pyodideVersion}, ${necesarios.size} paquetes de Pyodide, ${DE_PYPI.length} de PyPI, ${ficheros.length} ficheros del backend`);
