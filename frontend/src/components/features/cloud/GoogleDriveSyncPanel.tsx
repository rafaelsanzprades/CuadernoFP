"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Cloud, CloudOff, Info, RefreshCw, XCircle, Key } from "lucide-react";
import toast from "react-hot-toast";
import { driveService } from "@/services/driveService";
import { Input } from "@/components/ui/Input";
import { useTranslation } from "react-i18next";

export function GoogleDriveSyncPanel() {
  const {
    isDriveConnected, driveUserEmail, autoSyncDrive, googleClientId, dataSource,
    setDriveConnected, setDriveUserEmail, setAutoSyncDrive, setGoogleClientId
  } = useAppStore();
  const { t } = useTranslation();

  const handleConnect = async () => {
    if (dataSource === 'demo') {
      toast.error(t('toasts.googleDrive.sinDemo', {defaultValue: "No puedes sincronizar con Drive en modo DEMO."}));
      return;
    }
    if (!googleClientId) {
      toast.error(t('toasts.googleDrive.faltaClientId', {defaultValue: "Introduce tu Google Client ID primero."}));
      return;
    }

    toast.loading(t('toasts.googleDrive.conectando', {defaultValue: "Conectando con Google Drive..."}), { id: "drive-connect" });
    const result = await driveService.login(googleClientId);

    if (result.success) {
      setDriveUserEmail(result.email || "Usuario de Drive");
      setDriveConnected(true);
      toast.success(t('toasts.googleDrive.conectado', {defaultValue: "Google Drive conectado correctamente."}), { id: "drive-connect" });
    } else {
      toast.error(t('toasts.googleDrive.errorConectar', {defaultValue: "Fallo al conectar con Google Drive."}), { id: "drive-connect" });
    }
  };

  const handleDisconnect = () => {
    driveService.logout();
    setDriveConnected(false);
    setDriveUserEmail(null);
    setAutoSyncDrive(false);
    toast(t('toasts.googleDrive.desconectado', {defaultValue: "Desconectado de Google Drive"}), { icon: "👋" });
  };

  const toggleAutoSync = () => {
    if (dataSource === 'demo') {
      toast.error(t('toasts.googleDrive.autoguardadoSinDemo', {defaultValue: "El autoguardado no está disponible en modo DEMO."}));
      return;
    }
    if (!isDriveConnected) {
      toast.error(t('toasts.googleDrive.faltaConectar', {defaultValue: "Conecta tu cuenta de Google Drive primero."}));
      return;
    }
    const newVal = !autoSyncDrive;
    setAutoSyncDrive(newVal);
    if (newVal) {
      toast.success(t('toasts.googleDrive.autoguardadoActivado', {defaultValue: "Autoguardado en la nube activado."}));
    } else {
      toast(t('toasts.googleDrive.autoguardadoDesactivado', {defaultValue: "Autoguardado en la nube desactivado."}));
    }
  };

  return (
    <Card className="p-8 border border-[var(--glass-border)] rounded-2xl bg-foreground/5 shadow-lg relative overflow-hidden group h-full w-full">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Cloud className="w-32 h-32 text-[#4285F4]" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 h-full">
        <div>
          <h2 className="text-subheading font-bold text-foreground flex items-center gap-2">
            <Cloud className="w-6 h-6 text-[#4285F4]" /> Google Drive
          </h2>
          <p className="text-muted mt-2">
            Guarda tus archivos .fpp y .fpc automáticamente en la nube de Google para acceder a ellos desde cualquier dispositivo sin necesidad de descargarlos manualmente.
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-4">
          {/* Estado de conexión */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-5 rounded-xl border bg-background/50 border-[var(--glass-border)]">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${isDriveConnected ? "bg-success/20 text-success" : "bg-muted/20 text-muted"}`}>
                {isDriveConnected ? <CheckCircle2 className="w-6 h-6" /> : <CloudOff className="w-6 h-6" />}
              </div>
              <div>
                <p className="font-bold text-foreground">
                  {isDriveConnected ? "Conectado" : "No conectado"}
                </p>
                <p className="text-body text-muted">
                  {isDriveConnected ? `Sincronizando con ${driveUserEmail}` : "Inicia sesión con tu cuenta de Google"}
                </p>
              </div>
            </div>
            <div>
              {isDriveConnected ? (
                <Button onClick={handleDisconnect} variant="ghost" className="text-danger hover:bg-danger/10">
                  {t('botones.cloud.desconectar', {defaultValue: 'Desconectar'})}
                </Button>
              ) : (
                <Button 
                  onClick={handleConnect} 
                  className={`border transition-all ${dataSource === 'demo' ? 'bg-muted/20 text-muted border-muted/30 cursor-not-allowed opacity-70' : 'bg-[#4285F4]/20 text-[#4285F4] hover:bg-[#4285F4]/30 border-[#4285F4]/30'}`}
                  title={dataSource === 'demo' ? t('botones.cloud.accionNoPermitidaDemo', {defaultValue: 'Acción no permitida en modo DEMO'}) : t('botones.cloud.conectarCuenta', {defaultValue: 'Conectar cuenta'})}
                >
                  {t('botones.cloud.conectarCuenta', {defaultValue: 'Conectar cuenta'})}
                </Button>
              )}
            </div>
          </div>

          {/* Auto-sync Switch */}
          <div className={`p-5 rounded-xl border transition-colors ${autoSyncDrive ? "border-success/40 bg-success/5" : "border-[var(--glass-border)] bg-background/50"} flex items-center justify-between`}>
            <div>
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${autoSyncDrive ? "text-success animate-spin-slow" : "text-muted"}`} />
                Autoguardado Automático
              </h3>
              <p className="text-body text-muted">
                Sube automáticamente a Drive cada vez que pulses "Guardar" en la app.
              </p>
            </div>
            <button
              onClick={toggleAutoSync}
              disabled={dataSource === 'demo'}
              className={`w-14 h-8 rounded-full p-1 transition-colors ${
                dataSource === 'demo' ? "bg-muted/20 cursor-not-allowed opacity-50" : autoSyncDrive ? "bg-success" : "bg-muted/30"
              }`}
              title={dataSource === 'demo' ? "Acción no permitida en modo DEMO" : ""}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${autoSyncDrive ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>

          {/* Configuración de Client ID */}
          {!isDriveConnected && (
            <div className="flex flex-col gap-3 p-5 rounded-xl border bg-background/50 border-[var(--glass-border)]">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Key className="w-5 h-5 text-[#4285F4]" /> Credenciales OAuth
              </h3>
              <p className="text-body text-muted">
                Introduce el <strong>Client ID</strong> de tu proyecto de Google Cloud para autorizar la aplicación. Este dato se guarda en tu navegador de forma segura.
              </p>
              <Input
                type="password"
                placeholder="Ej: 123456789-abcde.apps.googleusercontent.com"
                value={googleClientId}
                onChange={(e) => setGoogleClientId(e.target.value)}
                className="font-mono text-body"
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

