"use client";
import { Download, FolderGit2, Monitor } from "lucide-react";
import { isTauri } from "@tauri-apps/api/core";
import { useMounted } from "@/hooks/useMounted";
import { useTranslation } from "react-i18next";

const RELEASES_URL = "https://github.com/rafaelsanzprades/CuadernoFP/releases/latest";
const REPO_URL = "https://github.com/rafaelsanzprades/CuadernoFP";

// Bloque "Aplicación para Windows" de Inicio->Bienvenida: mismo
// formato que los otros dos bloques de la pestaña (icono, texto, botón
// vistoso a la derecha). Texto con la versión instalada y el enlace al
// repositorio; la descarga solo se ofrece fuera de Tauri -- dentro de la app
// ya instalada no tiene sentido, ahí lo que se muestra es UpdateChecker.
// El enlace a www.rafaelsanzprades.es pasó al bloque de la guía.
export function VersionBar() {
  const { t } = useTranslation();
  const isMounted = useMounted();
  const rawVersion = process.env.NEXT_PUBLIC_APP_VERSION;
  const versionLabel = !rawVersion || rawVersion === 'unknown' ? 'Desconocida' : rawVersion;

  return (
    <div className="flex flex-1 flex-col items-center md:items-start gap-4 p-5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl shadow-sm">
      <div className="w-12 h-12 shrink-0 rounded-full bg-accent/10 flex items-center justify-center">
        <Monitor className="w-6 h-6 text-accent" />
      </div>
      <p className="text-body text-muted leading-tight">
        {t('campos.inicio.aplicacionEscritorioDesc', { defaultValue: 'Cuaderno FP como programa de Windows: instalas, abres tus archivos y trabajas, también sin conexión. Es gratuito y de código abierto.' })}
      </p>
      <p className="text-caption text-muted flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1">
        <span suppressHydrationWarning className="font-mono whitespace-nowrap">
          {t('campos.descargaEscritorio.version', { defaultValue: 'Versión' })}: {isMounted ? versionLabel : '...'}
        </span>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-foreground transition-colors font-semibold whitespace-nowrap"
        >
          <FolderGit2 className="w-4 h-4 shrink-0" /> {t('campos.descargaEscritorio.repo', { defaultValue: 'Código fuente en GitHub' })}
        </a>
      </p>
      {!isTauri() && (
        <a
          href={RELEASES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto w-full justify-center px-5 py-2.5 rounded-lg bg-accent text-background font-bold hover:bg-accent/80 transition-colors flex items-center gap-2 text-body"
        >
          <Download className="w-4 h-4" />
          {t('campos.descargaEscritorio.boton', { defaultValue: 'Descargar para Windows' })}
        </a>
      )}
    </div>
  );
}
