"use client";
import { Download, Monitor } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { isTauri } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";

const RELEASES_URL = "https://github.com/rafaelsanzprades/CuadernoFP/releases/latest";

// Solo tiene sentido en la web app -- dentro de la propia app de escritorio
// ya la tienes instalada (ahí lo que se muestra es UpdateChecker).
export function DownloadDesktopApp() {
  const { t } = useTranslation();

  if (isTauri()) return null;

  return (
    <Card className="p-6 border border-[var(--glass-border)] bg-[var(--glass-bg)] flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-accent/20 text-accent">
          <Monitor className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-foreground">
            {t('campos.descargaEscritorio.titulo', { defaultValue: 'Cuaderno FP para Windows' })}
          </p>
          <p className="text-body text-muted">
            {t('campos.descargaEscritorio.desc', { defaultValue: 'Instala la app de escritorio: se abre más rápido y funciona sin conexión.' })}
          </p>
        </div>
      </div>
      <a href={RELEASES_URL} target="_blank" rel="noopener noreferrer">
        <Button className="gap-2 bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20">
          <Download className="w-4 h-4" /> {t('campos.descargaEscritorio.boton', { defaultValue: 'Descargar para Windows' })}
        </Button>
      </a>
    </Card>
  );
}
