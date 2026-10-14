"use client";

import { useEffect, useState } from "react";
import { Library } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { fileManager } from "@/services/fileManager";

interface Entrada {
  archivo: string;
  familia: string;
  titulo: string;
  modulo: string;
  comunidad: string;
  curso?: string;
  autoria?: string;
  licencia?: string;
  estado?: string;
}

const BASE = "/biblioteca/";

// Importa una programación de la biblioteca (carpeta public/biblioteca) como
// punto de partida: se COPIA al .fpp activo y no queda ninguna referencia al
// fichero de origen. Las programaciones de la biblioteca no llevan centro,
// profesorado, contexto del grupo ni datos del alumnado.
export function ImportarDeBiblioteca({ hayProgramacion, onImported }: {
  /** Si ya hay una programación abierta, se pide confirmación antes de sustituirla. */
  hayProgramacion: boolean;
  onImported: () => void;
}) {
  const { t } = useTranslation();
  const [abierto, setAbierto] = useState(false);
  const [lista, setLista] = useState<Entrada[] | null>(null);
  const [error, setError] = useState(false);
  const [trabajando, setTrabajando] = useState(false);

  useEffect(() => {
    if (!abierto || lista) return;
    fetch(BASE + "index.json").then(r => r.json())
      .then(j => setLista((j.programaciones || []).filter((p: Entrada) => (p.estado || "disponible") === "disponible")))
      .catch(() => setError(true));
  }, [abierto, lista]);

  async function importar(p: Entrada) {
    if (hayProgramacion && !window.confirm(t('campos.inicio.bibliotecaConfirmar', { defaultValue: 'Sustituirá la programación abierta. Si tienes cambios sin guardar, se perderán. ¿Continuar?' }))) return;
    setTrabajando(true);
    try {
      const texto = await fetch(BASE + encodeURIComponent(p.archivo)).then(r => { if (!r.ok) throw new Error(); return r.text(); });
      const ok = await fileManager.importProgramacion(texto, p.archivo);
      if (!ok) throw new Error();
      toast.success(t('toasts.archivos.bibliotecaImportada', { defaultValue: 'Programación importada. Adáptala a tu centro y guárdala con tu nombre.' }));
      setAbierto(false);
      onImported();
    } catch {
      toast.error(t('toasts.archivos.bibliotecaError', { defaultValue: 'No se pudo importar la programación.' }));
    } finally {
      setTrabajando(false);
    }
  }

  if (!abierto) {
    return (
      <Button onClick={() => setAbierto(true)} title={t('tooltips.archivos.bibliotecaImportar', { defaultValue: 'Programaciones compartidas por otros docentes, como punto de partida. Sin datos de centro ni de alumnado.' })}
        className="w-full bg-foreground/5 hover:bg-foreground/10 text-muted border border-[var(--glass-border)] transition-all text-caption h-9">
        <Library className="w-3 h-3 mr-1" /> {t('botones.archivos.bibliotecaImportar', { defaultValue: 'Importar de la biblioteca' })}
      </Button>
    );
  }

  return (
    <div className="w-full p-3 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-body font-bold flex items-center gap-2"><Library className="w-4 h-4 text-accent" /> {t('campos.inicio.bibliotecaTitulo', { defaultValue: 'Biblioteca de programaciones' })}</h4>
        <Button variant="secondary" size="sm" onClick={() => setAbierto(false)}>{t('botones.comun.cerrar', { defaultValue: 'Cerrar' })}</Button>
      </div>
      {error && <p className="text-caption text-danger">{t('campos.inicio.bibliotecaSinConexion', { defaultValue: 'No se pudo cargar la biblioteca.' })}</p>}
      {lista && lista.length === 0 && <p className="text-caption text-muted">{t('campos.inicio.bibliotecaVacia', { defaultValue: 'Todavía no hay programaciones publicadas.' })}</p>}
      <ul className="space-y-2">
        {(lista || []).map(p => (
          <li key={p.archivo} className="flex items-start justify-between gap-3 text-caption">
            <span className="min-w-0">
              <span className="block font-semibold text-foreground">{p.modulo}</span>
              <span className="block text-muted">{p.titulo} · {p.comunidad}{p.curso ? ` · ${p.curso}` : ''}</span>
              {p.autoria && <span className="block text-muted">{t('campos.inicio.bibliotecaAutoria', { defaultValue: 'Autoría' })}: {p.autoria}{p.licencia ? ` (${p.licencia})` : ''}</span>}
            </span>
            <Button size="sm" disabled={trabajando} onClick={() => importar(p)}>{t('botones.archivos.bibliotecaUsar', { defaultValue: 'Usar' })}</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
