import withPWAInit from "@ducanh2912/next-pwa";
import { readFileSync } from "fs";

// Python (Pyodide) y los generadores de documentos se ejecutan en el navegador (ver
// src/services/generarDocumento.ts). Son ~30 MB: no se precargan con la app, se guardan en
// caché la primera vez que se genera un documento y después funcionan sin conexión.
let pyodideVersion = "0";
try {
  pyodideVersion = JSON.parse(readFileSync(new URL("./node_modules/pyodide/package.json", import.meta.url), "utf8")).version;
} catch (e) {}

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  publicExcludes: ["!noprecache/**/*", "!pyodide/**/*", "!generadores/**/*"],
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: ({ url }) => url.pathname.startsWith("/pyodide/"),
        handler: "CacheFirst",
        options: { cacheName: `pyodide-${pyodideVersion}`, expiration: { maxEntries: 40 } },
      },
      {
        // Los generadores sí cambian con la app: se sirve lo guardado y se actualiza en segundo plano
        urlPattern: ({ url }) => url.pathname.startsWith("/generadores/") || url.pathname === "/generadores-worker.js",
        handler: "StaleWhileRevalidate",
        options: { cacheName: "generadores-locales", expiration: { maxEntries: 60 } },
      },
    ],
  },
});

// Versión visible: la misma del instalador (src-tauri/tauri.conf.json, p. ej.
// 26.10.11 -> 2026.10.11), para que coincida con el nombre del release en GitHub.
let appVersion = "unknown";
try {
  const v = JSON.parse(readFileSync(new URL("../src-tauri/tauri.conf.json", import.meta.url), "utf8")).version;
  appVersion = /^\d{2}\./.test(v) ? "20" + v : v;
} catch (e) {}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
  },
  output: "standalone",
  turbopack: {},
  async rewrites() {
    // URL de la API según el entorno.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://cdd-backend-215337606799.europe-west1.run.app";
    return {
      fallback: [
        {
          source: "/api/:path*",
          destination: `${apiUrl}/api/:path*`,
        },
      ],
    };
  },
  async headers() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://cdd-backend-215337606799.europe-west1.run.app";
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com; connect-src 'self' https://accounts.google.com https://www.googleapis.com https://login.microsoftonline.com https://graph.microsoft.com ${apiUrl}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; frame-src 'self' blob: https://accounts.google.com;`
          }
        ]
      }
    ];
  }
};

export default withPWA(nextConfig);
