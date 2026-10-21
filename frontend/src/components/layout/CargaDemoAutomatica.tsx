"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { fileManager } from "@/services/fileManager";

// Si se entra (o se recarga con F5) en cualquier página estando en modo demo y sin datos en memoria, se carga la demo.
// En la app de escritorio los datos no se guardan en el webview (viven en los ficheros), así que tras recargar siempre faltan;
// sin esto, las páginas interiores esperaban datos que nunca llegaban («Cargando…» para siempre).
// Se espera a que termine de rehidratarse el estado guardado, para no pisarlo.
export function CargaDemoAutomatica() {
  const dataSource = useAppStore((s) => s.dataSource);
  const moduleData = useAppStore((s) => s.moduleData);
  const cursoData = useAppStore((s) => s.cursoData);
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    const persist = useAppStore.persist;
    setHidratado(persist.hasHydrated());
    return persist.onFinishHydration(() => setHidratado(true));
  }, []);

  useEffect(() => {
    if (hidratado && dataSource === "demo" && (!moduleData || !cursoData)) {
      fileManager.loadDemoData(undefined, true);
    }
  }, [hidratado, dataSource, moduleData, cursoData]);

  return null;
}
