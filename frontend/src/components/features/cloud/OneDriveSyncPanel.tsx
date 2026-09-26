"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Cloud, CloudOff, RefreshCw, Key } from "lucide-react";
import toast from "react-hot-toast";
import { signInOneDrive, signOutOneDrive } from "@/services/onedriveService";
import { connectOneDrive, disconnectOneDrive } from "@/services/nativeOAuth";
import { isTauri } from "@tauri-apps/api/core";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { useTranslation } from "react-i18next";

export function OneDriveSyncPanel() {
  const {
    dataSource, autoSyncDrive,
    oneDriveClientId, setOneDriveClientId,
    isOneDriveConnected, setOneDriveConnected,
    oneDriveUserEmail, setOneDriveUserEmail
  } = useAppStore();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);

  // Bajo Tauri, el login nativo de OneDrive necesita un Client ID de Azure
  // de tipo "Mobile and desktop applications" que todavía no está
  // registrado -- Rafael decidió publicar la app de escritorio sin esperar
  // a resolverlo (el registro en Azure se atascó con un error de tenant),
  // dejando el botón deshabilitado con un aviso en vez de un intento de
  // login que fallaría igualmente. La versión web sigue funcionando igual
  // que siempre -- esto NO la afecta.
  const oneDriveDisabledInTauri = isTauri();

  const handleConnect = async () => {
    if (oneDriveDisabledInTauri) return;
    if (dataSource === 'demo') {
      toast.error(t('toasts.oneDrive.sinDemo', {defaultValue: "No puedes sincronizar en modo DEMO."}));
      return;
    }
    if (!oneDriveClientId) {
      toast.error(t('toasts.oneDrive.faltaClientId', {defaultValue: "Introduce tu Client ID de Microsoft primero."}));
      return;
    }

    setIsLoading(true);
    toast.loading(t('toasts.oneDrive.conectando', {defaultValue: "Conectando con OneDrive..."}), { id: "onedrive-connect" });

    // Bajo Tauri, el popup de MSAL (signInOneDrive) no puede funcionar --
    // depende de un origen http(s) real ya registrado en Azure, y el origen
    // del webview de Tauri no lo es. Login nativo por navegador del sistema
    // + loopback en su lugar (Fase 7 del plan Tauri).
    if (isTauri()) {
      try {
        const result = await connectOneDrive(oneDriveClientId);
        setOneDriveUserEmail(result.email || t('campos.cloud.usuarioMicrosoft', {defaultValue: 'Usuario de Microsoft'}));
        setOneDriveConnected(true);
        toast.success(t('toasts.oneDrive.conectado', {defaultValue: "OneDrive conectado correctamente."}), { id: "onedrive-connect" });
      } catch (e) {
        console.error("Error conectando OneDrive (nativo)", e);
        toast.error(t('toasts.oneDrive.errorConectar', {defaultValue: "Fallo al conectar con OneDrive."}), { id: "onedrive-connect" });
      }
      setIsLoading(false);
      return;
    }

    const token = await signInOneDrive(oneDriveClientId);

    if (token) {
      setOneDriveUserEmail(t('campos.cloud.usuarioMicrosoft', {defaultValue: 'Usuario de Microsoft'}));
      setOneDriveConnected(true);
      toast.success(t('toasts.oneDrive.conectado', {defaultValue: "OneDrive conectado correctamente."}), { id: "onedrive-connect" });
    } else {
      toast.error(t('toasts.oneDrive.errorConectar', {defaultValue: "Fallo al conectar con OneDrive."}), { id: "onedrive-connect" });
    }
    setIsLoading(false);
  };

  const handleDisconnect = async () => {
    if (isTauri()) {
      await disconnectOneDrive().catch(() => {});
    } else {
      await signOutOneDrive();
    }
    setOneDriveConnected(false);
    setOneDriveUserEmail(null);
    toast(t('toasts.oneDrive.desconectado', {defaultValue: "Desconectado de OneDrive"}), { icon: "👋" });
  };

  return (
    <Card className="p-8 border border-[var(--glass-border)] rounded-2xl bg-foreground/5 shadow-lg relative overflow-hidden group h-full w-full">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Cloud className="w-32 h-32 text-info" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 h-full">
        <div>
          <h2 className="text-subheading font-bold text-foreground flex items-center gap-2">
            <Cloud className="w-6 h-6 text-[#0078D4]" /> Microsoft OneDrive
            {oneDriveDisabledInTauri && (
              <span className="text-caption font-normal px-2 py-0.5 rounded-full bg-warning/20 text-warning border border-warning/30">
                {t('campos.cloud.oneDriveProximamente', {defaultValue: 'Próximamente'})}
              </span>
            )}
          </h2>
          <p className="text-muted mt-2">
            {oneDriveDisabledInTauri
              ? t('campos.cloud.oneDriveNoDisponibleTauri', {defaultValue: 'Todavía no disponible en la app de escritorio -- sigue funcionando en la versión web.'})
              : t('campos.cloud.oneDriveDescripcion', {defaultValue: 'Guarda tus archivos .fpp y .fpc en tu cuenta de Microsoft OneDrive. (Requiere registro en portal de Azure).'})}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-4">
          {/* Estado de conexión */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-5 rounded-xl border bg-background/50 border-[var(--glass-border)]">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${isOneDriveConnected ? "bg-success/20 text-success" : "bg-muted/20 text-muted"}`}>
                {isOneDriveConnected ? <CheckCircle2 className="w-6 h-6" /> : <CloudOff className="w-6 h-6" />}
              </div>
              <div>
                <p className="font-bold text-foreground">
                  {isOneDriveConnected ? t('campos.cloud.conectado', {defaultValue: 'Conectado'}) : t('campos.cloud.noConectado', {defaultValue: 'No conectado'})}
                </p>
                <p className="text-body text-muted">
                  {isOneDriveConnected ? t('campos.cloud.sincronizandoCuentaMicrosoft', {defaultValue: 'Sincronizando con cuenta Microsoft'}) : t('campos.cloud.iniciaSesionMicrosoft', {defaultValue: 'Inicia sesión con Microsoft'})}
                </p>
              </div>
            </div>
            <div>
              {isOneDriveConnected ? (
                <Button onClick={handleDisconnect} variant="ghost" className="text-danger hover:bg-danger/10">
                  {t('botones.cloud.desconectar', {defaultValue: 'Desconectar'})}
                </Button>
              ) : (
                <Button
                  onClick={handleConnect}
                  disabled={isLoading || oneDriveDisabledInTauri}
                  title={oneDriveDisabledInTauri ? t('campos.cloud.oneDriveNoDisponibleTauri', {defaultValue: 'Todavía no disponible en la app de escritorio -- sigue funcionando en la versión web.'}) : undefined}
                  className={`border transition-all ${dataSource === 'demo' || oneDriveDisabledInTauri ? 'bg-muted/20 text-muted border-muted/30 cursor-not-allowed opacity-70' : 'bg-[#0078D4]/20 text-[#0078D4] hover:bg-[#0078D4]/30 border-[#0078D4]/30'}`}
                >
                  {oneDriveDisabledInTauri
                    ? t('campos.cloud.oneDriveProximamente', {defaultValue: 'Próximamente'})
                    : t('botones.cloud.conectarCuenta', {defaultValue: 'Conectar cuenta'})}
                </Button>
              )}
            </div>
          </div>

          {/* Configuración de Client ID -- oculta en Tauri, la función entera
              está deshabilitada ahí (ver oneDriveDisabledInTauri), no tiene
              sentido pedir un Client ID para algo que no se puede usar. */}
          {!isOneDriveConnected && !oneDriveDisabledInTauri && (
            <div className="flex flex-col gap-3 p-5 rounded-xl border bg-background/50 border-[var(--glass-border)]">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Key className="w-5 h-5 text-info" /> {t('campos.cloud.azureClientIdTitulo', {defaultValue: 'Azure Client ID'})}
              </h3>
              <p className="text-body text-muted">
                {t('campos.cloud.azureClientIdDesc', {defaultValue: 'Client ID de tu App registrada en Entra ID (Azure).'})}
              </p>
              <Input
                type="text"
                placeholder={t('placeholders.cloud.ejemploClientId', {defaultValue: 'Ej: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'})}
                value={oneDriveClientId || ""}
                onChange={(e) => setOneDriveClientId?.(e.target.value)}
                className="font-mono text-body"
              />
            </div>
          )}
        </div>

      </div>
    </Card>
  );
}

