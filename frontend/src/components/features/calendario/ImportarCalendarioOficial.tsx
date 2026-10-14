"use client";

import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";

interface Entrada { archivo: string; nombre: string; curso: string; comunidad: string }
interface Dia { fecha: string; nombre: string }
interface Calendario {
  nombre: string;
  fuente: { titulo: string; url: string; consultado: string };
  fuente_festivos?: { titulo: string; url: string }[];
  info_fechas?: { ini_curso?: string; fin_curso?: string };
  festivos: Dia[];
  periodos: { desde: string; hasta: string; nombre: string }[];
  provinciales?: Record<string, Dia[]>;
  notas?: string[];
}

const BASE = "/calendarios/";
const dmy = (iso: string) => { const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; };

// Importa un calendario escolar oficial (carpeta public/calendarios) al curso:
// los festivos se COPIAN a `calendar_notes` (claves `f_dd/mm/aaaa`) y, si se pide,
// el inicio y el fin de curso a `info_fechas`. No se guarda ninguna referencia al
// fichero: el .fpc sigue siendo autosuficiente. Lo ya escrito por el docente no se pisa.
export function ImportarCalendarioOficial({ calendarNotes, infoFechas, provinciaInicial, ccaaInicial, onImport }: {
  calendarNotes: Record<string, string>;
  infoFechas: Record<string, any>;
  provinciaInicial?: string;
  /** Comunidad del módulo (p. ej. "aragon"): se preselecciona su calendario. */
  ccaaInicial?: string;
  onImport: (notes: Record<string, string>, fechas?: { ini_curso?: string; fin_curso?: string }) => void;
}) {
  const { t } = useTranslation();
  const [abierto, setAbierto] = useState(false);
  const [lista, setLista] = useState<Entrada[]>([]);
  const [error, setError] = useState(false);
  const [elegido, setElegido] = useState("");
  const [cal, setCal] = useState<Calendario | null>(null);
  const [provincia, setProvincia] = useState("");
  const [conFechas, setConFechas] = useState(!infoFechas?.ini_curso && !infoFechas?.fin_curso);

  useEffect(() => {
    if (!abierto || lista.length) return;
    fetch(BASE + "index.json").then(r => r.json()).then(j => {
      setLista(j.calendarios || []);
      const norm = (x: string) => x.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const propia = (j.calendarios || []).find((c: Entrada) => ccaaInicial && norm(c.comunidad) === norm(ccaaInicial));
      if (propia) setElegido(propia.archivo);
      else if (j.calendarios?.length === 1) setElegido(j.calendarios[0].archivo);
    }).catch(() => setError(true));
  }, [abierto, lista.length, ccaaInicial]);

  useEffect(() => {
    if (!elegido) { setCal(null); return; }
    fetch(BASE + encodeURIComponent(elegido)).then(r => r.json()).then((c: Calendario) => {
      setCal(c);
      const provs = Object.keys(c.provinciales || {});
      const previa = provs.find(p => p.toLowerCase() === (provinciaInicial || "").trim().toLowerCase());
      setProvincia(previa || "");
    }).catch(() => setError(true));
  }, [elegido, provinciaInicial]);

  function importar() {
    if (!cal) return;
    const nuevas: Record<string, string> = {};
    const poner = (iso: string, nombre: string) => {
      const k = `f_${dmy(iso)}`;
      if (!calendarNotes[k] && !nuevas[k]) nuevas[k] = nombre;
    };
    cal.festivos.forEach(f => poner(f.fecha, f.nombre));
    cal.periodos.forEach(p => {
      for (const d = new Date(p.desde + "T12:00:00"); d <= new Date(p.hasta + "T12:00:00"); d.setDate(d.getDate() + 1)) {
        poner(d.toISOString().slice(0, 10), p.nombre);
      }
    });
    (cal.provinciales?.[provincia] || []).forEach(f => poner(f.fecha, f.nombre));
    onImport({ ...calendarNotes, ...nuevas }, conFechas ? cal.info_fechas : undefined);
    toast.success(t('toasts.calendario.importado', { n: Object.keys(nuevas).length, defaultValue: 'Calendario importado: {{n}} días añadidos.' }));
  }

  if (!abierto) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setAbierto(true)} className="mb-4 gap-2">
        <CalendarCheck className="w-4 h-4" />
        {t('botones.calendario.importarOficial', { defaultValue: 'Importar calendario oficial' })}
      </Button>
    );
  }

  const provs = Object.keys(cal?.provinciales || {});
  return (
    <div className="mb-4 p-4 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-subheading font-bold flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-accent" /> {t('campos.calendario.importarOficialTitulo', { defaultValue: 'Importar calendario oficial' })}
        </h3>
        <Button variant="secondary" size="sm" onClick={() => setAbierto(false)}>{t('botones.comun.cerrar', { defaultValue: 'Cerrar' })}</Button>
      </div>
      <p className="text-caption text-muted">
        {t('campos.calendario.importarOficialAyuda', { defaultValue: 'Copia al curso los festivos y las vacaciones oficiales. Los festivos locales de tu localidad los añades tú. Lo que ya hayas escrito no se sobrescribe.' })}
      </p>
      {error && <p className="text-caption text-danger">{t('campos.calendario.importarOficialError', { defaultValue: 'No se pudo cargar el calendario.' })}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="text-caption text-muted flex flex-col gap-1">
          {t('campos.calendario.importarOficialCalendario', { defaultValue: 'Calendario' })}
          <select value={elegido} onChange={e => setElegido(e.target.value)} className="bg-background border border-[var(--glass-border)] rounded-lg px-3 py-2 text-body text-foreground">
            <option value="">—</option>
            {lista.map(c => <option key={c.archivo} value={c.archivo}>{c.nombre}</option>)}
          </select>
        </label>
        {provs.length > 0 && (
          <label className="text-caption text-muted flex flex-col gap-1">
            {t('campos.calendario.importarOficialProvincia', { defaultValue: 'Provincia (vacaciones provinciales)' })}
            <select value={provincia} onChange={e => setProvincia(e.target.value)} className="bg-background border border-[var(--glass-border)] rounded-lg px-3 py-2 text-body text-foreground">
              <option value="">{t('campos.calendario.importarOficialSinProvincia', { defaultValue: 'No añadir' })}</option>
              {provs.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
        )}
      </div>
      {cal?.info_fechas && (
        <label className="flex items-center gap-2 text-body">
          <input type="checkbox" checked={conFechas} onChange={e => setConFechas(e.target.checked)} />
          {t('campos.calendario.importarOficialFechas', { defaultValue: 'Poner también inicio y fin de curso' })}
          <span className="text-caption text-muted">({cal.info_fechas.ini_curso && dmy(cal.info_fechas.ini_curso)}{cal.info_fechas.fin_curso ? ` – ${dmy(cal.info_fechas.fin_curso)}` : ''})</span>
        </label>
      )}
      {cal && (
        <>
          {cal.notas && cal.notas.length > 0 && (
            <ul className="list-disc pl-5 text-caption text-muted space-y-1">{cal.notas.map((n, i) => <li key={i}>{n}</li>)}</ul>
          )}
          <p className="text-caption text-muted">
            {t('campos.calendario.importarOficialFuente', { defaultValue: 'Fuente' })}: <a href={cal.fuente.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">{cal.fuente.titulo}</a> ({t('campos.calendario.importarOficialConsultado', { defaultValue: 'consultado' })} {dmy(cal.fuente.consultado)})
            {cal.fuente_festivos?.map((x, i) => <span key={i}> · <a href={x.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">{t('campos.calendario.importarOficialFestivos', { defaultValue: 'Fiestas laborales (BOE)' })}</a></span>)}
          </p>
          <Button onClick={importar} className="gap-2"><CalendarCheck className="w-4 h-4" />{t('botones.calendario.importar', { defaultValue: 'Importar' })}</Button>
        </>
      )}
    </div>
  );
}
