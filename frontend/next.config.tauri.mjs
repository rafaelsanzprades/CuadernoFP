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
import { readFileSync } from "fs";

const withPWA = withPWAInit({
  dest: "public",
  disable: true,
});

// Versión visible: la misma del instalador (src-tauri/tauri.conf.json, p. ej.
// 26.10.11 -> 2026.10.11), para que coincida con el nombre del release en GitHub.
// Varias versiones el mismo día: el parche es día*100 + n (26.10.2201 -> 2026.10.22b, 26.10.2202 -> 2026.10.22c...).
// No se pueden usar letras en `version` (semver: un sufijo se compara como versión anterior y el actualizador no la ofrecería).
let appVersion = "unknown";
try {
  const v = JSON.parse(readFileSync(new URL("../src-tauri/tauri.conf.json", import.meta.url), "utf8")).version;
  const m = /^(\d{2})\.(\d+)\.(\d+)$/.exec(v);
  if (m) {
    const parche = Number(m[3]);
    const dia = parche >= 100 ? Math.floor(parche / 100) : parche;
    const n = parche >= 100 ? parche % 100 : 0;
    appVersion = `20${m[1]}.${m[2]}.${dia}${n ? String.fromCharCode(97 + n) : ""}`;
  } else appVersion = v;
} catch (e) {}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
  },
  output: "export",
  turbopack: {},
};

export default withPWA(nextConfig);
