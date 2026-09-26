// Build estático para el empaquetado de escritorio con Tauri (Fase 6 del
// plan Tauri, RF Ideas/00 IDEAS.md). Invocado por `npm run build:tauri`
// (y por src-tauri/tauri.conf.json::build.beforeBuildCommand cuando se
// hace `tauri build`/`tauri dev` en release). Nunca tocar next.config.mjs
// ni src/app/api/auth a mano mientras este script corre -- si se
// interrumpe a media ejecución, volver a lanzarlo se autorrepara solo
// (ver restoreIfInterrupted más abajo).
//
// Tres cosas que hacen falta y que Next.js/Windows no dan gratis:
// 1. `next build` no tiene un --config <fichero> -- la config activa
//    SIEMPRE es next.config.mjs. Para usar next.config.tauri.mjs (con
//    output:'export', sin rewrites/headers -- ver ese fichero) hay que
//    intercambiarlo temporalmente con el de la web app y restaurarlo
//    después, pase lo que pase.
// 2. Un export estático no puede contener app/api/auth/[...nextauth]/
//    (usa cookies/sesión real, Next rompe el build entero si lo detecta
//    bajo output:'export') -- se saca de src/app temporalmente. Lo
//    sustituye el login nativo de la Fase 7 del plan; hasta que exista,
//    el build de Tauri simplemente no lleva NextAuth.
// 3. En Windows, mover/renombrar un directorio bajo src/app mientras
//    `next dev` lo tiene abierto con su watcher revienta con EPERM (visto
//    en real la primera vez que se probó este script, con
//    cuadernofp-frontend corriendo bajo PM2) -- así que este script para
//    los procesos de PM2 antes de tocar nada y los vuelve a levantar al
//    terminar, pase lo que pase. Si PM2 no está instalado o no hay nada
//    corriendo, esto no hace nada (best-effort, nunca bloquea el build).
import { execSync } from "node:child_process";
import { existsSync, renameSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const activeConfig = path.join(frontendDir, "next.config.mjs");
const tauriConfig = path.join(frontendDir, "next.config.tauri.mjs");
const webConfigBackup = path.join(frontendDir, "next.config.web.mjs.bak");
const authRoute = path.join(frontendDir, "src", "app", "api", "auth");
const authRouteBackup = path.join(frontendDir, ".tauri-build-excluded-auth");

function restoreIfInterrupted() {
  // Una ejecución anterior de este script murió a medias (p.ej. Ctrl+C
  // entre el rename de la config y el de la ruta) y dejó el intercambio a
  // medio hacer -- recomponer el estado normal de la web app ANTES de
  // empezar un build nuevo.
  if (existsSync(webConfigBackup)) {
    console.warn("[build-tauri] next.config.mjs de la web app encontrado en backup de una ejecución anterior interrumpida -- restaurando antes de continuar.");
    rmSync(activeConfig, { force: true });
    renameSync(webConfigBackup, activeConfig);
  }
  if (existsSync(authRouteBackup)) {
    console.warn("[build-tauri] app/api/auth encontrado fuera de su sitio de una ejecución anterior interrumpida -- restaurando antes de continuar.");
    rmSync(authRoute, { recursive: true, force: true });
    renameSync(authRouteBackup, authRoute);
  }
}

function swapIn() {
  // Si el segundo/tercer rename falla (p.ej. EPERM), deshace lo ya hecho en
  // esta misma llamada en vez de confiar solo en que la PRÓXIMA ejecución
  // del script repare el desaguisado -- un dev server que quede sirviendo
  // next.config.tauri.mjs por error, aunque sea un rato, rompe rewrites/
  // headers de la web app real.
  renameSync(activeConfig, webConfigBackup);
  try {
    renameSync(tauriConfig, activeConfig);
  } catch (e) {
    renameSync(webConfigBackup, activeConfig);
    throw e;
  }
  try {
    renameSync(authRoute, authRouteBackup);
  } catch (e) {
    renameSync(activeConfig, tauriConfig);
    renameSync(webConfigBackup, activeConfig);
    throw e;
  }
}

function swapOut() {
  // next build puede haber regenerado/tocado next.config.mjs (no debería,
  // pero por si acaso) -- se descarta sin más, la fuente de verdad de la
  // config de Tauri sigue siendo next.config.tauri.mjs en git.
  renameSync(activeConfig, tauriConfig);
  renameSync(webConfigBackup, activeConfig);
  renameSync(authRouteBackup, authRoute);
}

function pm2ListRunning() {
  // Solo el proceso del FRONTEND -- es el único con un watcher abierto sobre
  // src/app que pueda bloquear los renames de más abajo (visto en real:
  // EPERM moviendo src/app/api/auth con `next dev` corriendo). El backend no
  // toca nada de esto, así que no hace falta pararlo también.
  try {
    const json = execSync("npx pm2 jlist", { cwd: frontendDir, stdio: ["ignore", "pipe", "ignore"] }).toString();
    return JSON.parse(json)
      .filter((p) => p.pm2_env?.status === "online" && p.name?.includes("frontend"))
      .map((p) => p.name);
  } catch {
    return []; // PM2 no instalado, o sin nada corriendo -- no bloquea el build.
  }
}

function pm2Stop(names) {
  for (const name of names) {
    try {
      execSync(`npx pm2 stop ${name}`, { cwd: frontendDir, stdio: "inherit" });
    } catch (e) {
      console.warn(`[build-tauri] No se pudo parar el proceso PM2 "${name}":`, e.message);
    }
  }
}

function pm2Restart(names) {
  for (const name of names) {
    try {
      execSync(`npx pm2 restart ${name}`, { cwd: frontendDir, stdio: "inherit" });
    } catch (e) {
      console.warn(`[build-tauri] No se pudo reiniciar el proceso PM2 "${name}" tras el build -- arráncalo a mano si hace falta.`, e.message);
    }
  }
}

restoreIfInterrupted();

const pm2Running = pm2ListRunning();
if (pm2Running.length > 0) {
  console.log(`[build-tauri] Parando procesos PM2 activos mientras dura el build: ${pm2Running.join(", ")}`);
  pm2Stop(pm2Running);
}

try {
  swapIn();
  try {
    // .next/ puede llevar artefactos cacheados del `next dev` que compartía
    // el mismo directorio de salida (p.ej. .next/dev/types/validator.ts, que
    // referencia rutas -- como app/api/auth -- que el propio next dev vio en
    // su día pero que este build ya no incluye) -- limpiar antes de construir
    // en vez de arriesgarse a que `next build` falle o sirva algo mezclado.
    rmSync(path.join(frontendDir, ".next"), { recursive: true, force: true });
    execSync("npx next build", { cwd: frontendDir, stdio: "inherit" });
  } finally {
    swapOut();
  }
} finally {
  if (pm2Running.length > 0) {
    console.log(`[build-tauri] Reiniciando procesos PM2: ${pm2Running.join(", ")}`);
    pm2Restart(pm2Running);
  }
}
