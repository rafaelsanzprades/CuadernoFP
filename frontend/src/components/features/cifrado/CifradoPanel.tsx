"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { LONGITUD_MINIMA_CLAVE } from "@/services/cifrado";
import { activarCifrado, desactivarCifrado, type AlmacenCifrado } from "@/services/cifradoEspacio";

const almacen: AlmacenCifrado = {
  getState: () => useAppStore.getState(),
  setState: (parcial) => useAppStore.setState(parcial),
};

const estiloCampo =
  "w-full bg-background border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-body";

/**
 * Inicio > Datos > Cifrado de tus ficheros. Activa o desactiva el cifrado opcional y explica, sin
 * rodeos, qué protege y qué no. La clave solo vive en memoria (ver services/cifrado.ts).
 */
export function CifradoPanel() {
  const { t } = useTranslation();
  const cifradoActivo = useAppStore((s) => s.cifradoActivo);
  const claveEnMemoria = useAppStore((s) => !!s.encryptionKey);
  const [clave, setClave] = useState("");
  const [repetir, setRepetir] = useState("");
  const [trabajando, setTrabajando] = useState(false);

  const valida = clave.length >= LONGITUD_MINIMA_CLAVE && clave === repetir;

  const activar = async () => {
    setTrabajando(true);
    try {
      await activarCifrado(almacen, clave);
      setClave("");
      setRepetir("");
      // Cifra ya lo que está abierto, en vez de esperar al próximo guardado
      const { saveModuleData, saveCursoData } = useAppStore.getState();
      await Promise.all([saveModuleData(), saveCursoData()]);
      toast.success(t("campos.cifrado.activado", { defaultValue: "Cifrado activado. Lo que guardes a partir de ahora irá cifrado." }));
    } finally {
      setTrabajando(false);
    }
  };

  const desactivar = () => {
    const ok = window.confirm(
      t("campos.cifrado.confirmarDesactivar", { defaultValue: "Si desactivas el cifrado, tus ficheros se guardarán sin cifrar la próxima vez que guardes. ¿Quieres desactivarlo?" }),
    );
    if (!ok) return;
    desactivarCifrado(almacen);
    toast(t("campos.cifrado.desactivado", { defaultValue: "Cifrado desactivado. Tus ficheros se guardarán sin cifrar." }));
  };

  return (
    <div className="space-y-3">
      <p className="text-muted leading-relaxed text-body">
        {t("campos.cifrado.desc", { defaultValue: "Es opcional. Si pones una clave, lo que guardes (en tu equipo y en Google Drive) se cifra en tu navegador antes de salir de él y solo se abre con esa clave. Si no la pones, se guarda sin cifrar." })}
      </p>

      {cifradoActivo ? (
        <div className="rounded-lg border border-success/40 bg-success/10 p-3 space-y-2">
          <p className="text-body font-medium text-foreground flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            {t("campos.cifrado.estadoActivo", { defaultValue: "Cifrado activado" })}
          </p>
          <p className="text-caption text-muted">
            {claveEnMemoria
              ? t("campos.cifrado.claveEnMemoria", { defaultValue: "La clave está en memoria en esta sesión." })
              : t("campos.cifrado.clavePendiente", { defaultValue: "Te pediremos la clave al abrir un fichero cifrado o al guardar." })}
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={desactivar}>
            {t("campos.cifrado.desactivar", { defaultValue: "Desactivar el cifrado" })}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <label htmlFor="cifrado-clave" className="block text-body font-medium text-foreground">
            {t("campos.cifrado.claveLabel", { defaultValue: "Clave de seguridad (mínimo 8 caracteres)" })}
          </label>
          <input id="cifrado-clave" type="password" autoComplete="new-password" className={estiloCampo} value={clave} onChange={(e) => setClave(e.target.value)} />
          <label htmlFor="cifrado-repetir" className="block text-body font-medium text-foreground">
            {t("campos.cifrado.repetirLabel", { defaultValue: "Repite la clave" })}
          </label>
          <input id="cifrado-repetir" type="password" autoComplete="new-password" className={estiloCampo} value={repetir} onChange={(e) => setRepetir(e.target.value)} />
          {repetir && clave !== repetir && (
            <p className="text-caption text-danger">{t("campos.cifrado.noCoinciden", { defaultValue: "Las dos claves no coinciden." })}</p>
          )}
          <Button type="button" size="sm" disabled={!valida || trabajando} onClick={activar}>
            {t("campos.cifrado.activar", { defaultValue: "Activar el cifrado" })}
          </Button>
        </div>
      )}

      <p className="text-caption text-muted flex gap-1">
        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-warning" />
        <span>
          {t("campos.cifrado.avisoClave", { defaultValue: "La clave no se guarda en ningún sitio: la escribirás de nuevo cada vez que abras la aplicación. Si la olvidas, nadie podrá recuperar tus ficheros cifrados." })}
        </span>
      </p>

      <div className="text-caption text-muted space-y-1">
        <p className="font-medium text-foreground">{t("campos.cifrado.alcanceTitulo", { defaultValue: "Qué protege y qué no" })}</p>
        <p>{t("campos.cifrado.alcanceCubre", { defaultValue: "Protege los ficheros .fpp y .fpc que guardas y lo que se sincroniza con Google Drive." })}</p>
        <p>{t("campos.cifrado.alcanceNoCubre", { defaultValue: "No protege la copia de trabajo que la versión web guarda en este navegador para que no pierdas cambios: se queda en este equipo y no va cifrada. En un ordenador compartido, usa la aplicación de escritorio o borra los datos del sitio al terminar." })}</p>
      </div>
    </div>
  );
}
