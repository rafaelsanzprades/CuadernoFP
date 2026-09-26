// Config de build para el empaquetado de escritorio con Tauri (Fase 6 del
// plan Tauri, RF Ideas/00 IDEAS.md). Variante de next.config.mjs, no un
// reemplazo -- la web app (`npm run build`) sigue usando next.config.mjs
// tal cual, sin tocar. Nunca se importa directamente: scripts/build-tauri.mjs
// lo intercambia temporalmente por next.config.mjs justo para la duración
// de `next build`, porque Next.js no tiene un flag --config.
//
// Diferencias con next.config.mjs, todas obligatorias bajo `output: 'export'`
// (ver frontend/node_modules/next/dist/docs/01-app/02-guides/static-exports.md,
// sección "Unsupported Features" -- comprobado contra esta versión instalada
// de Next, no supuesto de memoria, por el aviso de AGENTS.md):
// - rewrites()/headers() están fuera: un export estático no tiene servidor
//   Node detrás que los ejecute, y Next directamente rompe el build si los
//   encuentra con output:'export'. El proxy a /api/* que hacían en la web
//   app lo sustituye, en el build de Tauri, la resolución en caliente de
//   frontend/src/services/apiBase.ts (Fase 6/Fase 1 del plan).
// - PWA desactivado del todo: un service worker no pinta nada dentro de un
//   webview de una app de escritorio ya instalada -- en el mejor de los
//   casos es ruido, en el peor cachea agresivamente por encima de cómo
//   Tauri sirve sus propios assets empaquetados.
import withPWAInit from "@ducanh2912/next-pwa";
import { execSync } from "child_process";

const withPWA = withPWAInit({
  dest: "public",
  disable: true,
});

let commitDate = "";
try {
  commitDate = execSync('git log -1 --format=%cd --date=format:"%Y%m%d"').toString().trim();
} catch (e) {
  commitDate = "unknown";
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: commitDate,
  },
  output: "export",
  turbopack: {},
};

export default withPWA(nextConfig);
