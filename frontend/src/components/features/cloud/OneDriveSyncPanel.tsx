"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Cloud, CloudOff, RefreshCw, Key } from "lucide-react";
import toast from "react-hot-toast";
import { signInOneDrive, signOutOneDrive } from "@/services/onedriveService";
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

  const handleConnect = async () => {
    if (dataSource === 'demo') {
      toast.error(t('toasts.oneDrive.sinDemo', {defaultValue: "No puedes sincronizar en modo DEMO."}));
      return;
    }
    if (!oneDriveClientId) {
      toast.error(t('toasts.oneDrive.faltaClientId', {defaultValue: "Introduce tu Client ID de Microsoft primero."}));
      return;
    }

    // Inyectar client ID en Archivos por si se necesita (aunque Msal usa process.env.NEXT_PUBLIC...
    // idealmente se debería inicializar con la var provista aquí si queremos dinamicidad).
    // Para simplificar, asumiremos que si llegan aquí lo tienen configurado en su .env o modificaremos
    // msalConfig dinámicamente si es necesario.

    setIsLoading(true);
    toast.loading(t('toasts.oneDrive.conectando', {defaultValue: "Conectando con OneDrive..."}), { id: "onedrive-connect" });

    const token = await signInOneDrive();

    if (token) {
      setOneDriveUserEmail("Usuario de Microsoft");
      setOneDriveConnected(true);
      toast.success(t('toasts.oneDrive.conectado', {defaultValue: "OneDrive conectado correctamente."}), { id: "onedrive-connect" });
    } else {
      toast.error(t('toasts.oneDrive.errorConectar', {defaultValue: "Fallo al conectar con OneDrive."}), { id: "onedrive-connect" });
    }
    setIsLoading(false);
  };

  const handleDisconnect = async () => {
    await signOutOneDrive();
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
          </h2>
          <p className="text-muted mt-2">
            Guarda tus archivos .fpp y .fpc en tu cuenta de Microsoft OneDrive. (Requiere registro en portal de Azure).
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
                  {isOneDriveConnected ? "Conectado" : "No conectado"}
                </p>
                <p className="text-body text-muted">
                  {isOneDriveConnected ? `Sincronizando con cuenta Microsoft` : "Inicia sesión con Microsoft"}
                </p>
              </div>
            </div>
            <div>
              {isOneDriveConnected ? (
                <Button onClick={handleDisconnect} variant="ghost" className="text-danger hover:bg-danger/10">
                  Desconectar
                </Button>
              ) : (
                <Button 
                  onClick={handleConnect} 
                  disabled={isLoading}
                  className={`border transition-all ${dataSource === 'demo' ? 'bg-muted/20 text-muted border-muted/30 cursor-not-allowed opacity-70' : 'bg-[#0078D4]/20 text-[#0078D4] hover:bg-[#0078D4]/30 border-[#0078D4]/30'}`}
                >
                  Conectar cuenta
                </Button>
              )}
            </div>
          </div>

          {/* Configuración de Client ID */}
          {!isOneDriveConnected && (
            <div className="flex flex-col gap-3 p-5 rounded-xl border bg-background/50 border-[var(--glass-border)]">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Key className="w-5 h-5 text-info" /> Azure Client ID
              </h3>
              <p className="text-body text-muted">
                Client ID de tu App registrada en Entra ID (Azure).
              </p>
              <Input
                type="text"
                placeholder="Ej: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
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

