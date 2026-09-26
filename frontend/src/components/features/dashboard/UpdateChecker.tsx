"use client";
import React, { useState } from "react";
import { Download, RefreshCw, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { isTauri } from "@tauri-apps/api/core";
import { checkForUpdates, downloadAndInstallUpdate, UpdateInfo } from "@/services/updater";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

// Autoactualización (Fase 9 del plan Tauri) -- solo tiene sentido dentro de
// la app de escritorio empaquetada, nunca en la web app (no hay nada que
// "actualizar" en una pestaña de navegador). No se muestra nada fuera de
// Tauri.
export function UpdateChecker() {
  const { t } = useTranslation();
  const [checking, setChecking] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const [checked, setChecked] = useState(false);

  if (!isTauri()) return null;

  const handleCheck = async () => {
    setChecking(true);
    try {
      const found = await checkForUpdates();
      setUpdate(found);
      setChecked(true);
      if (!found) {
        toast.success(t('campos.actualizaciones.yaAlDia', { defaultValue: 'Ya tienes la última versión.' }));
      }
    } catch (e) {
      console.error("Error comprobando actualizaciones", e);
      toast.error(t('campos.actualizaciones.errorComprobar', { defaultValue: 'No se pudo comprobar si hay actualizaciones.' }));
    } finally {
      setChecking(false);
    }
  };

  const handleInstall = async () => {
    setInstalling(true);
    toast.loading(t('campos.actualizaciones.descargando', { defaultValue: 'Descargando actualización...' }), { id: "update-install" });
    try {
      await downloadAndInstallUpdate();
      toast.success(t('campos.actualizaciones.instalada', { defaultValue: 'Actualización instalada, reiniciando...' }), { id: "update-install" });
    } catch (e) {
      console.error("Error instalando actualización", e);
      toast.error(t('campos.actualizaciones.errorInstalar', { defaultValue: 'No se pudo instalar la actualización.' }), { id: "update-install" });
      setInstalling(false);
    }
  };

  return (
    <Card className="p-6 border border-[var(--glass-border)] bg-[var(--glass-bg)] flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${update ? "bg-accent/20 text-accent" : "bg-muted/20 text-muted"}`}>
          {update ? <Download className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
        </div>
        <div>
          <p className="font-bold text-foreground">
            {update
              ? t('campos.actualizaciones.disponibleTitulo', { version: update.version, defaultValue: 'Versión {{version}} disponible' })
              : t('campos.actualizaciones.titulo', { defaultValue: 'Actualizaciones' })}
          </p>
          <p className="text-body text-muted">
            {update
              ? t('campos.actualizaciones.disponibleDesc', { defaultValue: 'Hay una nueva versión de Cuaderno FP lista para instalar.' })
              : checked
              ? t('campos.actualizaciones.yaAlDia', { defaultValue: 'Ya tienes la última versión.' })
              : t('campos.actualizaciones.desc', { defaultValue: 'Comprueba si hay una versión más reciente de la app.' })}
          </p>
        </div>
      </div>
      {update ? (
        <Button onClick={handleInstall} disabled={installing} className="gap-2 bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20">
          <Download className="w-4 h-4" /> {installing ? t('campos.actualizaciones.instalando', { defaultValue: 'Instalando...' }) : t('campos.actualizaciones.instalarBoton', { defaultValue: 'Instalar y reiniciar' })}
        </Button>
      ) : (
        <Button onClick={handleCheck} disabled={checking} variant="ghost" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} /> {checking ? t('campos.actualizaciones.comprobando', { defaultValue: 'Comprobando...' }) : t('campos.actualizaciones.comprobarBoton', { defaultValue: 'Buscar actualizaciones' })}
        </Button>
      )}
    </Card>
  );
}
