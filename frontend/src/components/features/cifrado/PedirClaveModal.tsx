"use client";

import React, { useEffect, useRef, useState } from "react";
import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PeticionClave, responderClave, suscribirPeticionClave } from "@/services/claveSeguridad";

/**
 * Pide la clave de seguridad cuando hace falta: al abrir un fichero cifrado, o al guardar con el
 * cifrado activo cuando se acaba de abrir la aplicación (la clave nunca se guarda). Ver
 * services/claveSeguridad.ts y services/cifradoEspacio.ts.
 */
export function PedirClaveModal() {
  const { t } = useTranslation();
  const [peticion, setPeticion] = useState<PeticionClave | null>(null);
  const [clave, setClave] = useState("");
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => suscribirPeticionClave((p) => { setPeticion(p); setClave(""); }), []);
  useEffect(() => { if (peticion) campo.current?.focus(); }, [peticion]);

  if (!peticion) return null;
  const guardando = peticion.motivo === "guardar";

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="clave-titulo">
      <Card className="w-full max-w-md bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-2xl p-6 space-y-4">
        <form
          className="space-y-4"
          onSubmit={(e) => { e.preventDefault(); if (clave) responderClave({ tipo: "clave", clave }); }}
        >
          <h2 id="clave-titulo" className="text-subheading font-bold flex items-center gap-2 text-foreground">
            <Lock className="w-5 h-5 text-accent" />
            {guardando
              ? t("campos.clave.tituloGuardar", { defaultValue: "Falta tu clave para guardar" })
              : t("campos.clave.tituloAbrir", { defaultValue: "Este fichero está cifrado" })}
          </h2>
          <p className="text-body text-muted">
            {guardando
              ? t("campos.clave.descGuardar", { defaultValue: "El cifrado está activado, pero la clave no se guarda en ningún sitio y has vuelto a abrir la aplicación. Escríbela para seguir guardando cifrado." })
              : t("campos.clave.descAbrir", { defaultValue: "Escribe la clave de seguridad para abrirlo. La clave no se guarda: se pide cada vez que abres la aplicación." })}
          </p>

          <div>
            <label htmlFor="clave-campo" className="block text-body font-medium text-foreground mb-1.5">
              {t("campos.clave.label", { defaultValue: "Clave de seguridad" })}
            </label>
            <input
              id="clave-campo"
              ref={campo}
              type="password"
              autoComplete="off"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              className="w-full bg-background border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-body"
            />
            {peticion.error && <p role="alert" className="text-caption text-danger mt-2">{peticion.error}</p>}
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => responderClave({ tipo: "cancelar" })}>
              {t("campos.clave.cancelar", { defaultValue: "Cancelar" })}
            </Button>
            <Button type="submit" disabled={!clave}>
              {t("campos.clave.continuar", { defaultValue: "Continuar" })}
            </Button>
          </div>

          {guardando && (
            <div className="border-t border-[var(--glass-border)] pt-3 space-y-2">
              <p className="text-caption text-muted">
                {t("campos.clave.avisoSinCifrar", { defaultValue: "Si prefieres no usar la clave, puedes guardar sin cifrar: se desactiva el cifrado y tus ficheros se guardarán legibles para cualquiera que los abra." })}
              </p>
              <Button type="button" variant="danger" size="sm" onClick={() => responderClave({ tipo: "sin-cifrar" })}>
                {t("campos.clave.guardarSinCifrar", { defaultValue: "Guardar sin cifrar" })}
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
