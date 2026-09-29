"use client";
import { Download, FolderGit2 } from "lucide-react";
import { isTauri } from "@tauri-apps/api/core";
import { useMounted } from "@/hooks/useMounted";
import { useTranslation } from "react-i18next";

const RELEASES_URL = "https://github.com/rafaelsanzprades/CuadernoFP/releases/latest";
const REPO_URL = "https://github.com/rafaelsanzprades/CuadernoFP";

// Fila de versión + enlaces, dentro de la sección "Aplicación de escritorio
// para Windows" de Inicio->Bienvenida (antes vivía suelta, fuera de
// cualquier pestaña; movida dentro por petición de Rafael, 2026-09-29):
// versión instalada (antes vivía en el Sidebar) + acceso al repositorio +
// descarga de la app de escritorio -- esta última solo fuera de Tauri,
// dentro de la app ya instalada no tiene sentido, ahí lo que se muestra es
// UpdateChecker. Sin caja propia -- ya vive dentro de una Card.
export function VersionBar() {
  const { t } = useTranslation();
  const isMounted = useMounted();
  const rawVersion = process.env.NEXT_PUBLIC_APP_VERSION;
  const versionLabel = !rawVersion || rawVersion === 'unknown' ? 'Desconocida' : rawVersion;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 sm:gap-3 text-body">
      <span suppressHydrationWarning className="justify-self-center sm:justify-self-start text-muted font-mono whitespace-nowrap">
        {t('campos.descargaEscritorio.version', { defaultValue: 'Versión' })}: {isMounted ? versionLabel : '...'}
      </span>
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="justify-self-center flex items-center gap-1.5 text-muted hover:text-foreground transition-colors font-semibold whitespace-nowrap"
      >
        <FolderGit2 className="w-4 h-4 shrink-0" /> {t('campos.descargaEscritorio.repo', { defaultValue: 'Código fuente en GitHub' })}
      </a>
      <div className="justify-self-center sm:justify-self-end">
        {!isTauri() && (
          <a
            href={RELEASES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-accent hover:text-accent/80 transition-colors font-semibold whitespace-nowrap"
          >
            <Download className="w-4 h-4 shrink-0" /> {t('campos.descargaEscritorio.boton', { defaultValue: 'Descargar para Windows' })}
          </a>
        )}
      </div>
    </div>
  );
}
