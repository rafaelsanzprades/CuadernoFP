"use client";
import { TabSync } from "@/components/ui/TabSync";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Calendar, CalendarDays, Circle, ClipboardList, Search, Settings, Flag, FolderOpen, Briefcase, Lock } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import DatePicker from "@/components/ui/DatePicker";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { StickyPageHeader } from "@/components/ui/StickyPageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionIndex } from "@/components/ui/SectionIndex";
import { useDynamicPlanning } from "@/hooks/useDynamicPlanning";
import { TodayClasses } from "@/components/features/dashboard/TodayClasses";
import { WeeklyClasses } from "@/components/features/dashboard/WeeklyClasses";
import { ContextoAgenda } from "@/components/features/dashboard/ContextoAgenda";
import { DesarrolloUdActual } from "@/components/features/dashboard/DesarrolloUdActual";
import { InteractiveCalendar } from "@/components/features/dashboard/InteractiveCalendar";
import { getAutoMilestones } from "@/utils/calendarMilestones";
import { getSimulatedToday } from "@/utils/planningGenerator";
import Link from "next/link";
import { getApiBase } from "@/services/apiBase";

// ── Helpers ───────────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, "0");
const toDate = (s: string): Date | null => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};
const inRange = (d: Date, s: Date | null, e: Date | null) =>
  !!(s && e && d >= s && d <= e);

const getMonthNames = (t: (key: string, opts?: any) => string) => [
  t('campos.calendario.mesEnero', {defaultValue: 'Enero'}), t('campos.calendario.mesFebrero', {defaultValue: 'Febrero'}), t('campos.calendario.mesMarzo', {defaultValue: 'Marzo'}),
  t('campos.calendario.mesAbril', {defaultValue: 'Abril'}), t('campos.calendario.mesMayo', {defaultValue: 'Mayo'}), t('campos.calendario.mesJunio', {defaultValue: 'Junio'}),
  t('campos.calendario.mesJulio', {defaultValue: 'Julio'}), t('campos.calendario.mesAgosto', {defaultValue: 'Agosto'}), t('campos.calendario.mesSeptiembre', {defaultValue: 'Septiembre'}),
  t('campos.calendario.mesOctubre', {defaultValue: 'Octubre'}), t('campos.calendario.mesNoviembre', {defaultValue: 'Noviembre'}), t('campos.calendario.mesDiciembre', {defaultValue: 'Diciembre'}),
];
const DAY_NAMES_SHORT = ["Lu","Ma","Mi","Ju","Vi","Sa","Do"];

// Parsea una clave "DD/MM/YYYY" (formato actual) o "YYYY-MM-DD" (legado) a Date + ISO ordenable.
const parseKeyDate = (dateStr: string) => {
  if (dateStr.includes("-")) {
    const [y, m, day] = dateStr.split("-");
    return { iso: `${y}-${m}-${day}`, date: new Date(Number(y), Number(m) - 1, Number(day), 12) };
  }
  const [d, m, y] = dateStr.split("/");
  return { iso: `${y}-${m}-${d}`, date: new Date(Number(y), Number(m) - 1, Number(d), 12) };
};


type DayRow = { iso: string; date: Date; festivo?: string; relevante?: string };
type RangeT = { start: DayRow; end: DayRow; keys: string[]; auto?: boolean };

// Rangos de festivos/eventos ordenados por fecha (los que pinta la tabla de
// Eventos y festivos); también los usa la página para el índice de meses.
function buildEventRanges(
  calendar_notes: Record<string, string>,
  autoMilestones: Record<string, string>,
  feoeIni?: string,
  feoeFin?: string,
): RangeT[] {
  // Una fila por fecha, con festivo y relevante como columnas paralelas (un
  // mismo día puede tener ambos a la vez).
  const byDate = new Map<string, DayRow>();
  Object.entries(calendar_notes).forEach(([k, v]) => {
    if (!v) return;
    const type = k.charAt(0); // "f" | "r"
    const { iso, date } = parseKeyDate(k.substring(2));
    const entry = byDate.get(iso) || { iso, date };
    if (type === "f") entry.festivo = v; else entry.relevante = v;
    byDate.set(iso, entry);
  });
  const dayRows = Array.from(byDate.values()).sort((a, b) => a.iso.localeCompare(b.iso));

  // Fusiona días consecutivos en un rango solo si festivo Y relevante coinciden en ambos.
  const ranges: RangeT[] = [];
  const keysForDay = (row: DayRow) => [
    ...(row.festivo ? [`f_${pad(row.date.getDate())}/${pad(row.date.getMonth() + 1)}/${row.date.getFullYear()}`] : []),
    ...(row.relevante ? [`r_${pad(row.date.getDate())}/${pad(row.date.getMonth() + 1)}/${row.date.getFullYear()}`] : []),
  ];
  dayRows.forEach(row => {
    const last = ranges[ranges.length - 1];
    if (last && !last.auto) {
      const diffDays = Math.round((row.date.getTime() - last.end.date.getTime()) / 86400000);
      const sameContent = last.end.festivo === row.festivo && last.end.relevante === row.relevante;
      const consecutive = diffDays === 1 || (diffDays === 3 && last.end.date.getDay() === 5) || (diffDays === 2 && last.end.date.getDay() === 6);
      if (sameContent && consecutive) {
        last.end = row;
        last.keys.push(...keysForDay(row));
        return;
      }
    }
    ranges.push({ start: row, end: row, keys: keysForDay(row) });
  });

  // Hitos automáticos (Inicio/Fin de curso y de cada trimestre, derivados de
  // Fechas generales) + FEOE (una sola fila con su intervalo completo) — de
  // solo lectura, sin `calendar_notes` propio que borrar.
  Object.entries(autoMilestones).forEach(([dkey, label]) => {
    const { iso, date } = parseKeyDate(dkey);
    const row: DayRow = { iso, date, relevante: label };
    ranges.push({ start: row, end: row, keys: [], auto: true });
  });
  if (feoeIni) {
    const start = parseKeyDate(feoeIni);
    const end = parseKeyDate(feoeFin || feoeIni);
    ranges.push({
      start: { iso: start.iso, date: start.date, relevante: "FEOE" },
      end: { iso: end.iso, date: end.date, relevante: "FEOE" },
      keys: [],
      auto: true,
    });
  }
  ranges.sort((a, b) => a.start.iso.localeCompare(b.start.iso));
  return ranges;
}

// ── Notes Table Component ─────────────────────────────────────────────────────
function NotesTable({ calendar_notes, onUpdateNotes, autoMilestones, feoeIni, feoeFin, currentMonthKey }: {
  calendar_notes: Record<string, string>;
  onUpdateNotes: (notes: Record<string, string>) => void;
  autoMilestones: Record<string, string>;
  feoeIni?: string;
  feoeFin?: string;
  currentMonthKey: string | null;
}) {
  const { t } = useTranslation();
  const MONTH_NAMES = React.useMemo(() => getMonthNames(t), [t]);
  const [newDate, setNewDate]         = useState("");
  const [newEndDate, setNewEndDate]   = useState("");
  const [newFestivo, setNewFestivo]   = useState("");
  const [newRelevante, setNewRelevante] = useState("");
  const [allOpen, setAllOpen] = useState(false);

  function addNote() {
    if (!newDate || (!newFestivo && !newRelevante)) return;

    const startD = new Date(newDate + "T12:00:00");
    const endD = newEndDate ? new Date(newEndDate + "T12:00:00") : startD;

    if (endD < startD) return;

    const newNotes = { ...calendar_notes };

    let curr = new Date(startD);
    while (curr <= endD) {
      const d = String(curr.getDate()).padStart(2, "0");
      const m = String(curr.getMonth() + 1).padStart(2, "0");
      const y = curr.getFullYear();
      if (newFestivo) newNotes[`f_${d}/${m}/${y}`] = newFestivo;
      if (newRelevante) newNotes[`r_${d}/${m}/${y}`] = newRelevante;
      curr.setDate(curr.getDate() + 1);
    }

    onUpdateNotes(newNotes);
    setNewDate(""); setNewEndDate(""); setNewFestivo(""); setNewRelevante("");
  }

  function deleteRange(keys: string[]) {
    const newNotes = { ...calendar_notes };
    keys.forEach(k => delete newNotes[k]);
    onUpdateNotes(newNotes);
  }

  const ranges = buildEventRanges(calendar_notes, autoMilestones, feoeIni, feoeFin);

  const fmt = (d: Date) => `${pad(d.getDate())} ${MONTH_NAMES[d.getMonth()]?.substring(0, 3).toLowerCase() || ""} ${d.getFullYear()}`;

  // Un acordeón por mes (mismo aspecto que el Diario de Seguimiento -> Clases,
  // petición de Rafael, 2026-10-03): solo el mes en curso arranca abierto.
  const groups: { key: string; year: number; month: number; items: RangeT[] }[] = [];
  ranges.forEach(r => {
    const year = r.start.date.getFullYear();
    const month = r.start.date.getMonth();
    const key = `${year}-${pad(month + 1)}`;
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(r);
    else groups.push({ key, year, month, items: [r] });
  });

  const colgroup = (
    <colgroup>
      <col style={{ width: "7.5rem" }} />
      <col style={{ width: "7.5rem" }} />
      <col />
      <col />
      <col style={{ width: "2.5rem" }} />
    </colgroup>
  );

  return (
    <div>
      {groups.length > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              setAllOpen(prev => !prev);
              document.querySelectorAll('.eventos-details').forEach((el) => {
                (el as HTMLDetailsElement).open = !allOpen;
              });
            }}
            className="text-body font-semibold px-4 py-2 rounded-lg border border-[var(--glass-border)] bg-foreground/15 text-foreground/80 hover:bg-foreground/10 hover:text-foreground transition-colors flex items-center gap-2"
          >
            <span>{allOpen ? '▲' : '▼'}</span>
            {allOpen ? t('common.colapsar_todos', {defaultValue: 'Colapsar todos'}) : t('common.expandir_todos', {defaultValue: 'Expandir todos'})}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {groups.map(g => (
          <details
            key={g.key}
            id={`eventos-mes-${g.key}`}
            style={{ scrollMarginTop: "260px" }}
            open={currentMonthKey !== null && g.key === currentMonthKey}
            className="eventos-details group bg-[var(--glass-bg)] rounded-lg border border-[var(--glass-border)] overflow-hidden transition-colors"
          >
            <summary className="p-4 cursor-pointer flex items-center justify-between font-semibold text-subheading select-none hover:bg-foreground/5">
              <div className="flex items-center gap-3">
                <span className="text-info"><span className="inline-flex"><Calendar className="w-[1.2em] h-[1.2em] mr-1" /></span></span>
                <span>{MONTH_NAMES[g.month]} {g.year}</span>
              </div>
              <div className="text-body text-muted">
                {t('campos.calendario.nEntradasMes', {count: g.items.length, defaultValue_one: '{{count}} entrada', defaultValue_other: '{{count}} entradas'})} <span className="ml-4 group-open:rotate-180 inline-block transition-transform">▼</span>
              </div>
            </summary>
            <div className="p-6 border-t border-[var(--glass-border)] bg-transparent overflow-x-auto">
              <table className="w-full text-left text-body border-collapse table-fixed">
                {colgroup}
                <thead>
                  <tr className="border-b border-[var(--glass-border)] text-muted">
                    <th className="p-2">{t('table.fecha', {defaultValue: 'Fecha'})}</th>
                    <th className="p-2">{t('table.hasta', {defaultValue: 'Hasta'})}</th>
                    <th className="p-2">{t('festivo', {defaultValue: 'Festivo'})}</th>
                    <th className="p-2">{t('evento', {defaultValue: 'Relevante'})}</th>
                    <th className="p-2" />
                  </tr>
                </thead>
                <tbody>
                  {g.items.map((r, i) => {
                    const singleDay = r.start.iso === r.end.iso;
                    return (
                      <tr key={`${r.start.iso}-${r.auto ? "auto" : "real"}-${i}`} className="border-b border-white/5 hover:bg-foreground/5 transition-colors">
                        <td className="p-2 font-mono text-foreground/80">{fmt(r.start.date)}</td>
                        <td className="p-2 font-mono text-foreground/60">{singleDay ? "" : fmt(r.end.date)}</td>
                        <td className="p-2 text-foreground/90">
                          {r.start.festivo && (
                            <span className="text-caption px-2 py-0.5 rounded-full font-semibold bg-danger/10 text-danger">
                              <span className="inline-flex"><Circle className="w-[1.2em] h-[1.2em] mr-1" /></span> {r.start.festivo}
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-foreground/90">
                          {r.start.relevante && (
                            <span className="text-caption px-2 py-0.5 rounded-full font-semibold bg-info/10 text-info">
                              <span className="inline-flex"><Circle className="w-[1.2em] h-[1.2em] mr-1" /></span> {r.start.relevante}
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {r.auto ? (
                            <span className="text-muted/50" title={t('tooltips.calendario.derivadoFechasGenerales', {defaultValue: 'Derivado de fechas generales, no se borra aquí'})}>
                              <Lock className="w-[1em] h-[1em] inline-block" />
                            </span>
                          ) : (
                            <button onClick={() => deleteRange(r.keys)} className="text-muted/80 hover:text-danger font-bold text-subheading leading-none transition-colors">×</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </div>
      {ranges.length === 0 && <p className="text-center text-muted/80 text-body py-4">{t('sin_eventos', {defaultValue: 'Sin festivos ni eventos aún. Añade uno abajo.'})}</p>}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-body border-collapse table-fixed">
          {colgroup}
          <tbody>
            <tr className="border-t border-[var(--glass-border)] bg-white/3">
              <td className="p-2">
                <DatePicker value={newDate} onChange={v => setNewDate(v)} className="w-full" placeholder={t('fecha', {defaultValue: 'Fecha'})} />
              </td>
              <td className="p-2">
                <DatePicker value={newEndDate} onChange={v => setNewEndDate(v)} className="w-full" placeholder={t('hasta_opc', {defaultValue: 'Hasta (opcional)'})} />
              </td>
              <td className="p-2">
              <input type="text" value={newFestivo} onChange={e => setNewFestivo(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()} placeholder={t('festivo', {defaultValue: 'Festivo...'})} className="w-full bg-foreground/20 border border-[var(--glass-border)] rounded p-2 text-body text-foreground focus:border-warning focus:outline-none" />
              </td>
              <td className="p-2">
              <input type="text" value={newRelevante} onChange={e => setNewRelevante(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()} placeholder={t('evento', {defaultValue: 'Relevante...'})} className="w-full bg-foreground/20 border border-[var(--glass-border)] rounded p-2 text-body text-foreground focus:border-warning focus:outline-none" />
              </td>
              <td className="p-2 text-center">
              <button onClick={addNote} disabled={!newDate || (!newFestivo && !newRelevante)} className="text-warning hover:text-warning font-bold text-heading leading-none disabled:text-gray-700 transition-colors">+</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ── Interactive Calendar Component ────────────────────────────────────────────


// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CalendarioPage() {
  const { activeCursoId, cursoData, setCursoData, updateCursoData, saveCursoData, activeModuleId, moduleData, setModuleData, dataSource } = useAppStore();
  // cursoData.planning_ledger es un campo persistido que nunca se escribe
  // (no hay ningún punto de la app que lo guarde) — la asignación real de
  // UD por día se recalcula en memoria vía useDynamicPlanning, igual que en
  // Seguimiento y Calificaciones. Esta página usa claves dd/mm/yyyy (igual
  // que calendar_notes), no el yyyy-mm-dd ISO interno del cálculo dinámico.
  const { planningLedgerDmy: planningLedger } = useDynamicPlanning();
  const [saving, setSaving] = useState(false);
  const { t, i18n } = useTranslation();
  const [saveMessage, setSaveMessage] = useState("");
  const [saveIsError, setSaveIsError] = useState(false);
  const [activeTab, setActiveTab] = useState("fechas");
  // Mes en curso ("aaaa-mm"), null hasta montar en cliente (el HTML de SSR no
  // conoce el reloj del navegador). En DEMO, la fecha simulada del curso.
  const [currentMonthKey, setCurrentMonthKey] = useState<string | null>(null);
  useEffect(() => {
    const ref = dataSource === 'demo' && cursoData ? getSimulatedToday(cursoData) : new Date();
    setCurrentMonthKey(`${ref.getFullYear()}-${pad(ref.getMonth() + 1)}`);
  }, [dataSource, cursoData]);

  const TABS = [
    { id: "fechas", label: <span className="flex items-center gap-2"><Settings className="w-4 h-4 shrink-0" /> {t('tabs.calendario.fechas.label', {defaultValue: 'Fechas y horario'})}</span>, cleanLabel: t('tabs.calendario.fechas.label', {defaultValue: 'Fechas y horario'}) },
    { id: "eventos", label: <span className="flex items-center gap-2"><Flag className="w-4 h-4 shrink-0" /> {t('tabs.calendario.eventos.label', {defaultValue: 'Eventos y festivos'})}</span>, cleanLabel: t('tabs.calendario.eventos.label', {defaultValue: 'Eventos y festivos'}) },
    // Traída desde Agenda (2026-10-02, petición de Rafael): vista mensual del
    // calendario con las sesiones planificadas.
    { id: "mensual", label: <span className="flex items-center gap-2"><CalendarDays className="w-4 h-4 shrink-0" /> {t('tabs.calendario.mensual.label', {defaultValue: 'Mensual'})}</span>, cleanLabel: t('tabs.calendario.mensual.label', {defaultValue: 'Mensual'}) },
    // Traída desde Clases (2026-10-05, petición de Rafael): lo de hoy, la
    // semana y la unidad en curso.
    { id: "agenda", label: <span className="flex items-center gap-2"><Calendar className="w-4 h-4 shrink-0" /> {t('tabs.agenda.agenda.label', {defaultValue: 'Agenda'})}</span>, cleanLabel: t('tabs.agenda.agenda.label', {defaultValue: 'Agenda'}) },
  ];

  const TAB_DESCRIPTIONS: Record<string, string> = {
    fechas: t('tabs.calendario.fechas.desc', {defaultValue: 'Configura las fechas generales, el horario semanal, los trimestres y el periodo FEOE del curso.'}),
    eventos: t('tabs.calendario.eventos.desc', {defaultValue: 'Registro de eventos y festivos que afectan a la docencia.'}),
    agenda: t('tabs.agenda.agenda.desc', {defaultValue: 'Tus clases de hoy, la semana y la unidad en curso.'}),
    mensual: t('tabs.calendario.mensual.desc', {defaultValue: 'Vista mensual y calendario interactivo con fechas clave y sesiones planificadas.'}),
  };

  // Índice de bloques -- solo en las pestañas con 2+ bloques reales.
  const SECTION_INDEX_ITEMS: Record<string, { id: string; label: string }[]> = {
    agenda: [
      { id: "agenda-clases-hoy", label: 'Tus clases de hoy' },
      { id: "agenda-prevision-semanal", label: t('campos.dashboard.previsionSemanalTitulo', {defaultValue: 'Previsión semanal'}) },
      { id: "agenda-desarrollo-ud", label: t('campos.dashboard.desarrolloUnidadEnCursoTitulo', {defaultValue: 'Desarrollo de la unidad en curso'}) },
    ],
    fechas: [
      { id: "calendario-fechas-generales", label: t('campos.calendario.fechasGeneralesTitulo', {defaultValue: 'Fechas generales'}) },
      { id: "calendario-horario-semanal", label: t('campos.calendario.horarioSemanalTitulo', {defaultValue: 'Horario semanal'}) },
      { id: "calendario-semana-lectiva", label: t('campos.calendario.semanaLectivaTitulo', {defaultValue: 'Semana lectiva'}) },
      { id: "calendario-trimestres", label: t('campos.calendario.trimestresTitulo', {defaultValue: 'Trimestres'}) },
      { id: "calendario-periodo-feoe", label: t('campos.calendario.periodoFeoeTitulo', {defaultValue: 'Periodo FEOE'}) },
    ],
  };

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  // Nombres completos de los días en el idioma de la interfaz (Lunes, Martes...).
  // El balear y el valenciano comparten los nombres del catalán.
  const idiomaDias = ({ ba: "ca", va: "ca" } as Record<string, string>)[i18n.language] || i18n.language;
  const nombreDia = (idx: number) => {
    const n = new Date(2024, 0, 1 + idx).toLocaleDateString(idiomaDias, { weekday: "long" });
    return n.charAt(0).toUpperCase() + n.slice(1);
  };
  // Separador y franja alterna para distinguir las columnas de los días.
  const colDia = (idx: number) => `border-l border-[var(--glass-border)] ${idx % 2 === 0 ? "bg-foreground/[0.04]" : ""}`;

  useEffect(() => {
    if (activeCursoId && !cursoData) {
      fetch(`${getApiBase()}/api/module/${activeCursoId}`)
        .then(r => r.json())
        .then(json => { if (json.status === "success") setCursoData(json.data); })
        .catch(console.error);
    }
    if (activeModuleId && !moduleData) {
      fetch(`${getApiBase()}/api/module/${activeModuleId}`)
        .then(r => r.json())
        .then(json => { if (json.status === "success") setModuleData(json.data); })
        .catch(console.error);
    }
  }, [activeCursoId, cursoData, setCursoData, activeModuleId, moduleData, setModuleData]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage("");
    const ok = await saveCursoData();
    if (ok) {
      setSaveIsError(false);
      setSaveMessage(t('toasts.comun.guardadoCorrectamente', {defaultValue: 'Guardado correctamente'}));
      setTimeout(() => setSaveMessage(""), 3000);
    } else {
      setSaveIsError(true);
      setSaveMessage(t('toasts.comun.errorGuardar', {defaultValue: 'Error al guardar'}));
    }
    setSaving(false);
  };

  if (!activeCursoId) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1 p-8 content-area">
            <MotionWrapper>

              <Card className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl">
                <Calendar className="w-16 h-16 text-muted-foreground opacity-50" />
                <h2 className="text-heading font-bold">{t('campos.comun.sinCursoCargadoTitulo', {defaultValue: 'No hay curso cargado'})}</h2>
                <p className="text-muted mb-4">{t('campos.comun.sinCursoCargadoDesc', {defaultValue: 'Debes abrir o crear un archivo de curso en tu Archivos.'})}</p>
                <Link href="/inicio?tab=datos">
                  <Button variant="primary" className="gap-2">
                    <FolderOpen className="w-4 h-4" /> {t('common.ir_a_mis_archivos', {defaultValue: 'Ir a mis archivos'})}
                  </Button>
                </Link>
              </Card>
            </MotionWrapper>
          </main>
        </div>
      </div>
    );
  }

  if (!cursoData) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1 flex items-center justify-center content-area">
            <div className="text-subheading text-info animate-pulse">{t('campos.calendario.cargandoCalendario', {defaultValue: 'Cargando calendario...'})}</div>
          </main>
        </div>
      </div>
    );
  }

  const info_fechas   = cursoData?.info_fechas   || {};
  const horario       = cursoData?.horario       || { Lun: 0, Mar: 0, "Mié": 0, Jue: 0, Vie: 0 };
  const calendar_notes = cursoData?.calendar_notes || {};

  // Índice dinámico de meses de Eventos y festivos (petición de Rafael,
  // 2026-10-03; mismo criterio que el Diario de Seguimiento -> Clases):
  // empieza por el mes en curso ("ACTUAL. Mayo"), sigue en orden cronológico
  // y, tras el último mes con entradas, vuelve al primero hasta el mes
  // anterior al actual. Si el mes en curso no tiene entradas, arranca por
  // el siguiente que sí las tenga.
  const eventRanges = buildEventRanges(
    calendar_notes,
    getAutoMilestones(info_fechas),
    typeof info_fechas.ini_feoe === 'string' ? info_fechas.ini_feoe : undefined,
    typeof info_fechas.fin_feoe === 'string' ? info_fechas.fin_feoe : undefined,
  );
  const monthKeysEventos = Array.from(new Set(eventRanges.map(r => `${r.start.date.getFullYear()}-${pad(r.start.date.getMonth() + 1)}`)));
  const idxStartEventos = currentMonthKey === null ? -1 : monthKeysEventos.findIndex(k => k >= currentMonthKey);
  const monthKeysOrdenados = idxStartEventos > 0
    ? [...monthKeysEventos.slice(idxStartEventos), ...monthKeysEventos.slice(0, idxStartEventos)]
    : monthKeysEventos;
  const nombresMes = getMonthNames(t);
  const mesesRepetidos = new Set(monthKeysEventos.map(k => k.slice(5)).filter((m, i, a) => a.indexOf(m) !== i));
  const eventosIndexItems = monthKeysOrdenados.map(k => {
    const [y, m] = k.split("-");
    const nombre = nombresMes[Number(m) - 1] + (mesesRepetidos.has(m) ? ` '${y.slice(2)}` : "");
    return {
      id: `eventos-mes-${k}`,
      label: k === currentMonthKey ? `${t('campos.seguimiento.mesActualPrefijo', { defaultValue: 'Actual' })}. ${nombre}` : nombre,
    };
  });

  // Índice de Mensual: un ancla por trimestre, al mes en que empieza (los
  // trimestres sin fecha de inicio no aparecen). Orden cronológico, sin
  // priorizar el mes actual.
  const mensualIndexItems = [1, 2, 3]
    .filter(n => /^\d{4}-\d{2}/.test(info_fechas?.[`ini_${n}t`] || ""))
    .map(n => ({
      id: `mensual-mes-${info_fechas[`ini_${n}t`].slice(0, 7)}`,
      label: t(`campos.calendario.trimestre${n}`, { defaultValue: `${n}.º trimestre` }),
    }));

  const h_boa = Number(moduleData?.info_modulo?.h_boa) || 0;
  const h_sem = Number(moduleData?.info_modulo?.h_sem) || 0;

  const handleUpdateFechas = (field: string, value: string | number) =>
    updateCursoData("info_fechas", { ...info_fechas, [field]: value });

  const handleUpdateNote = (key: string, val: string) =>
    updateCursoData("calendar_notes", { ...calendar_notes, [key]: val });

  const handleUpdateNotes = (notes: Record<string, string>) =>
    updateCursoData("calendar_notes", notes);

  const handleUpdateHorario = (day: string, val: number) =>
    updateCursoData("horario", { ...horario, [day]: val });

  const calculateRealHours = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 0;
    try {
      const [sy, sm, sd] = startStr.split("-").map(Number);
      const [ey, em, ed] = endStr.split("-").map(Number);
      if (!sy || !ey) return 0;
      const start = new Date(sy, sm - 1, sd);
      const end = new Date(ey, em - 1, ed);
      const dayMap = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      let total = 0, curr = new Date(start);
      while (curr <= end) {
        if (curr.getDay() !== 0 && curr.getDay() !== 6) {
          const key = `f_${pad(curr.getDate())}/${pad(curr.getMonth() + 1)}/${curr.getFullYear()}`;
          if (!calendar_notes[key]) total += Number(horario[dayMap[curr.getDay()]]) || 0;
        }
        curr.setDate(curr.getDate() + 1);
      }
      return total;
    } catch { return 0; }
  };

  const calculateWorkingDays = (startStr: string, endStr: string) => {
    const counts = { Lun: 0, Mar: 0, "Mié": 0, Jue: 0, Vie: 0 };
    if (!startStr || !endStr) return counts;
    try {
      const [sy, sm, sd] = startStr.split("-").map(Number);
      const [ey, em, ed] = endStr.split("-").map(Number);
      if (!sy || !ey) return counts;
      const start = new Date(sy, sm - 1, sd);
      const end = new Date(ey, em - 1, ed);
      const dayMap = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as const;
      let curr = new Date(start);
      while (curr <= end) {
        const dIdx = curr.getDay();
        if (dIdx !== 0 && dIdx !== 6) {
          const dayName = dayMap[dIdx];
          const key = `f_${pad(curr.getDate())}/${pad(curr.getMonth() + 1)}/${curr.getFullYear()}`;
          if (!calendar_notes[key] && Number(horario[dayName]) > 0) {
            counts[dayName as keyof typeof counts]++;
          }
        }
        curr.setDate(curr.getDate() + 1);
      }
    } catch {}
    return counts;
  };

  const h1 = calculateRealHours(info_fechas.ini_1t, info_fechas.fin_1t);
  const h2 = calculateRealHours(info_fechas.ini_2t, info_fechas.fin_2t);
  const h3 = calculateRealHours(info_fechas.ini_3t, info_fechas.fin_3t);
  const h_real = h1 + h2 + h3;
  const suma_horario = ["Lun", "Mar", "Mié", "Jue", "Vie"].reduce((acc, day) => acc + (Number(horario[day]) || 0), 0);

  const wd1 = calculateWorkingDays(info_fechas.ini_1t, info_fechas.fin_1t);
  const wd2 = calculateWorkingDays(info_fechas.ini_2t, info_fechas.fin_2t);
  const wd3 = calculateWorkingDays(info_fechas.ini_3t, info_fechas.fin_3t);



  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />

        <main id="main-content" tabIndex={-1} className="flex-1 content-area overflow-y-auto scrollbar-hide">
          <StickyPageHeader
            icon={Calendar}
            title={t('nav.calendario', {defaultValue: 'Calendario'})}
            description={t('pages.calendario_desc', {defaultValue: 'Horarios, trimestres, festivos y eventos del curso.'})}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsList className="max-w-full">
                  {TABS.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Descripción de la pestaña activa -- texto plano, sin cajón,
                mismo patrón que Inicio/Ayuda/MagIA/Normativa/Legal */}
            <p className="text-body text-muted mt-3">
              {TAB_DESCRIPTIONS[activeTab] || 'Gestión del calendario académico.'}
            </p>

            {/* Índice de bloques de la pestaña activa -- dentro del header
                fijo (sticky top-0), así que no se pierde al hacer scroll. */}
            <SectionIndex items={activeTab === 'eventos' ? eventosIndexItems : activeTab === 'mensual' ? mensualIndexItems : (SECTION_INDEX_ITEMS[activeTab] || [])} bare onItemClick={(id) => { const el = document.getElementById(id); if (el instanceof HTMLDetailsElement) el.open = true; }} />
          </StickyPageHeader>

          <MotionWrapper className="space-y-4 px-8 pt-4 pb-12">
          {/* Save message */}
          {saveMessage && (
            <p className={`text-body font-semibold ${saveIsError ? "text-danger" : "text-success"}`}>
              {saveMessage}
            </p>
          )}

            <div className="space-y-4">
              {activeTab === 'fechas' && (
                <div className="space-y-4 mt-4">
              {/* Fechas generales */}
              <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <SectionHeading id="calendario-fechas-generales" scrollMt="260px" className="flex-1">
                  {t('campos.calendario.fechasGeneralesTitulo', {defaultValue: 'Fechas generales'})}
                </SectionHeading>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const ledger = planningLedger || {};
                      const dates = Object.keys(ledger)
                        .map(d => { const [dd,mm,yyyy] = d.split("/"); return `${yyyy}-${mm}-${dd}`; })
                        .sort();
                      if (dates.length > 0) {
                        handleUpdateFechas("ini_curso", dates[0]);
                        handleUpdateFechas("fin_curso", dates[dates.length - 1]);
                      }
                    }}
                    className="text-caption text-info hover:text-info border border-[var(--glass-border)]"
                  >
                    <span className="inline-flex"><Search className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('botones.calendario.autodetectar', {defaultValue: 'Autodetectar'})}
                  </Button>
                </div>
              </div>
              <Card className="p-6 border-t-4 border-t-blue-500 overflow-visible z-30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Inicio de curso",   field: "ini_curso", key: "checks.dashboard.fechaCampo_ini_curso" },
                    { label: "Inicio clases (1T)", field: "ini_1t",   key: "checks.calendario.inicioClases1t" },
                    { label: "Fin clases (3T)",    field: "fin_3t",   key: "checks.calendario.finClases3t" },
                    { label: "Fin de curso",       field: "fin_curso", key: "checks.dashboard.fechaCampo_fin_curso" },
                  ].map(({ label, field, key }) => (
                    <div key={field}>
                      <label className="text-body font-semibold text-foreground mb-1 block">{t(key, {defaultValue: label})}</label>
                      <DatePicker
                        value={typeof info_fechas[field] === 'string' ? info_fechas[field] : ""}
                        onChange={v => handleUpdateFechas(field, v)}
                      />
                    </div>
                  ))}
                </div>
              </Card>
              </div>

              {/* Sesiones semanales */}
              <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <SectionHeading id="calendario-horario-semanal" scrollMt="260px" className="flex-1">
                  {t('campos.calendario.horarioSemanalTitulo', {defaultValue: 'Horario semanal'})}
                </SectionHeading>
                <div className="bg-foreground/15 px-4 py-2 rounded-lg border border-[var(--glass-border)] text-body shrink-0">
                  {t('campos.calendario.desfaseBoa', {h_sem, defaultValue: 'Desfase con BOA ({{h_sem}} h/sem):'})}{" "}
                  <span className={`font-bold ${suma_horario === h_sem ? "text-success" : "text-warning"}`}>
                    {suma_horario - h_sem} h
                  </span>
                </div>
              </div>
              <Card className="p-6 border-t-4 border-t-purple-500">
                <div className="grid grid-cols-5 gap-4">
                  {["Lun", "Mar", "Mié", "Jue", "Vie"].map((day, di) => (
                    <div key={day} className={`rounded-lg border border-[var(--glass-border)] p-3 ${di % 2 === 0 ? "bg-foreground/[0.04]" : ""}`}>
                      <label className="text-body text-foreground mb-2 block text-center font-bold">{nombreDia(di)}</label>
                      <input 
                        type="number" min="0" max="8"
                        value={Number(horario[day]) || 0}
                        onChange={e => handleUpdateHorario(day, Number(e.target.value))}
                        className="w-full text-center text-subheading font-mono bg-background border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </Card>
              </div>

              {/* Semana lectiva */}
              <div className="space-y-3">
              <SectionHeading id="calendario-semana-lectiva" scrollMt="260px">
                {t('campos.calendario.semanaLectivaTitulo', {defaultValue: 'Semana lectiva'})}
              </SectionHeading>
              <Card className="p-6 border-t-4 border-t-yellow-500 overflow-hidden">
                <div className="overflow-x-auto rounded-xl border border-[var(--glass-border)]">
                  <table className="w-full text-center text-body border-collapse table-fixed">
                    <thead>
                      <tr className="bg-foreground/5 text-muted border-b border-[var(--glass-border)]">
                        <th className="p-3 text-left font-semibold">{t('tablas.calendario.trimestre', {defaultValue: 'Trimestre'})}</th>
                        {["Lun", "Mar", "Mié", "Jue", "Vie"].map((day, di) => (
                          <th key={day} className={`p-3 font-semibold ${colDia(di)} ${!Number(horario[day]) ? 'opacity-40' : ''}`}>
                            {nombreDia(di)}
                            {Number(horario[day]) > 0 && <span className="block text-caption text-info font-normal mt-0.5">{horario[day]}h/sem</span>}
                          </th>
                        ))}
                          <th className="p-3 font-semibold border-l border-[var(--glass-border)]">{t('common.total', {defaultValue: 'Total'})}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { title: t('campos.calendario.eval1Abrev', {defaultValue: '1ª Ev.'}), wd: wd1, bg: "bg-purple-500/10" },
                        { title: t('campos.calendario.eval2Abrev', {defaultValue: '2ª Ev.'}), wd: wd2, bg: "bg-red-500/10" },
                        { title: t('campos.calendario.eval3Abrev', {defaultValue: '3ª Ev.'}), wd: wd3, bg: "bg-amber-500/10" },
                      ].map((row, i) => {
                        const daysArr = ["Lun", "Mar", "Mié", "Jue", "Vie"] as const;
                        const totalDays = daysArr.reduce((acc, d) => acc + (row.wd[d] || 0), 0);
                        const totalHours = daysArr.reduce((acc, d) => acc + (row.wd[d] || 0) * (Number(horario[d]) || 0), 0);
                        return (
                          <tr key={row.title} className={`${row.bg} border-b border-[var(--glass-border)] last:border-0`}>
                            <td className="p-3 font-bold text-left">{row.title}</td>
                            {daysArr.map((day, di) => {
                              const dh = Number(horario[day]) || 0;
                              const days = row.wd[day] || 0;
                              return (
                                <td key={day} className={`p-3 ${colDia(di)} ${!dh ? 'opacity-30' : 'font-mono text-body font-medium'}`}>
                                  {dh > 0 ? (
                                    <div className="flex items-center justify-center gap-2">
                                      <span title={t('tooltips.calendario.dias', {defaultValue: 'Días'})}>{days}d</span>
                                      <span className="text-muted/30">|</span>
                                      <span className="text-info" title={t('tooltips.calendario.horas', {defaultValue: 'Horas'})}>{days * dh}h</span>
                                    </div>
                                  ) : '-'}
                                </td>
                              );
                            })}
                            <td className="p-3 font-bold border-l border-[var(--glass-border)] text-body font-mono">
                              <div className="flex items-center justify-center gap-2">
                                <span title={t('tooltips.calendario.dias', {defaultValue: 'Días'})}>{totalDays}d</span>
                                <span className="text-muted/30">|</span>
                                <span className="text-success" title={t('tooltips.calendario.horas', {defaultValue: 'Horas'})}>{totalHours}h</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-foreground/5 border-t-2 border-[var(--glass-border)] text-body font-bold">
                        <td className="p-3 text-left">{t('common.total', {defaultValue: 'Total'})}</td>
                        {["Lun", "Mar", "Mié", "Jue", "Vie"].map((day, di) => {
                          const dh = Number(horario[day]) || 0;
                          const daysTotal = (wd1[day as keyof typeof wd1] + wd2[day as keyof typeof wd2] + wd3[day as keyof typeof wd3]);
                          const hoursTotal = daysTotal * dh;
                          return (
                            <td key={day} className={`p-3 font-mono ${colDia(di)} ${dh === 0 ? 'opacity-30' : ''}`}>
                              {dh > 0 ? (
                                <div className="flex items-center justify-center gap-2">
                                  <span title={t('tooltips.calendario.dias', {defaultValue: 'Días'})}>{daysTotal}d</span>
                                  <span className="text-muted/30">|</span>
                                  <span className="text-info" title={t('tooltips.calendario.horas', {defaultValue: 'Horas'})}>{hoursTotal}h</span>
                                </div>
                              ) : '-'}
                            </td>
                          );
                        })}
                        <td className="p-3 border-l border-[var(--glass-border)] font-mono text-subheading">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-body mt-0.5" title={t('tooltips.calendario.dias', {defaultValue: 'Días'})}>
                              {["Lun", "Mar", "Mié", "Jue", "Vie"].reduce((acc, d) => acc + (wd1[d as keyof typeof wd1] + wd2[d as keyof typeof wd2] + wd3[d as keyof typeof wd3]), 0)}d
                            </span>
                            <span className="text-muted/30">|</span>
                            <span className="text-success" title={t('tooltips.calendario.horas', {defaultValue: 'Horas'})}>{h_real}h</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
              </div>

              {/* Trimestres */}
              <div className="space-y-3">
              <SectionHeading id="calendario-trimestres" scrollMt="260px">
                {t('campos.calendario.trimestresTitulo', {defaultValue: 'Trimestres'})}
              </SectionHeading>
              <Card className="p-6 border-t-4 border-t-emerald-500 overflow-visible z-20">
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { title: t('t1', {defaultValue: '1er trimestre'}), ini: "ini_1t", fin: "fin_1t", hours: h1 },
                    { title: t('t2', {defaultValue: '2º trimestre'}),  ini: "ini_2t", fin: "fin_2t", hours: h2 },
                    { title: t('t3', {defaultValue: '3er trimestre'}), ini: "ini_3t", fin: "fin_3t", hours: h3 },
                  ].map(tri => (
                    <div key={tri.title} className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-4 flex flex-col">
                      <h3 className="text-center font-bold mb-4">{tri.title}</h3>
                      <div className="space-y-3 flex-1">
                        <div>
                          <label className="text-caption text-muted">{t('campos.calendario.inicioLabel', {defaultValue: 'Inicio'})}</label>
                          <DatePicker value={typeof info_fechas[tri.ini] === 'string' ? info_fechas[tri.ini] : ""} onChange={v => handleUpdateFechas(tri.ini, v)} />
                        </div>
                        <div>
                          <label className="text-caption text-muted">{t('campos.calendario.finLabel', {defaultValue: 'Fin'})}</label>
                          <DatePicker value={typeof info_fechas[tri.fin] === 'string' ? info_fechas[tri.fin] : ""} onChange={v => handleUpdateFechas(tri.fin, v)} />
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-[var(--glass-border)] text-center">
                        <span className="text-caption text-muted block mb-1">{t('campos.calendario.horasLectivasReales', {defaultValue: 'Horas lectivas reales'})}</span>
                        <span className="text-subheading font-bold text-success font-mono">{tri.hours} h</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              </div>

              {/* Periodo FEOE (antes pestaña propia, movida aquí 2026-10-02,
                  petición de Rafael) */}
                  {/* FP Dual / FEOE - 5 columnas */}
                  <div className="space-y-3">
                  <SectionHeading id="calendario-periodo-feoe" scrollMt="260px">
                    {t('campos.calendario.periodoFeoeTitulo', {defaultValue: 'Periodo FEOE'})}
                  </SectionHeading>
                  <Card className="p-6 border-t-4 border-t-orange-500 overflow-visible">
                    <div className="grid grid-cols-5 gap-4 items-end">
                      {/* Col 1: Selector de tipo */}
                      <div>
                        <label className="text-body font-semibold text-foreground mb-2 block">{t('campos.calendario.tipoDualLabel', {defaultValue: 'Tipo de dual'})}</label>
                        <select
                          value={info_fechas.tipo_dual || "general"}
                          onChange={e => {
                            const newType = e.target.value;
                            const defaultDocencia = newType === "intensiva" ? "con_docencia" : "sin_docencia";
                            updateCursoData("info_fechas", {
                              ...info_fechas,
                              tipo_dual: newType,
                              docencia_dual: defaultDocencia
                            });
                          }}
                          className="w-full bg-foreground/10 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground focus:border-orange-500 focus:outline-none"
                        >
                          <option value="general">{t('campos.calendario.dualGeneral', {defaultValue: 'Dual general'})}</option>
                          <option value="intensiva">{t('campos.calendario.dualIntensiva', {defaultValue: 'Dual intensiva'})}</option>
                        </select>
                      </div>
                      {/* Col 1.5: Selector de docencia */}
                      <div>
                        <label className="text-body font-semibold text-foreground mb-2 block">{t('campos.calendario.docenciaLabel', {defaultValue: 'Docencia'})}</label>
                        <select
                          value={info_fechas.docencia_dual || (info_fechas.tipo_dual === "intensiva" ? "con_docencia" : "sin_docencia")}
                          onChange={e => handleUpdateFechas("docencia_dual", e.target.value)}
                          className="w-full bg-foreground/10 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground focus:border-orange-500 focus:outline-none"
                        >
                          <option value="sin_docencia">{t('campos.calendario.sinDocencia', {defaultValue: 'Sin docencia'})}</option>
                          <option value="con_docencia">{t('campos.calendario.conDocencia', {defaultValue: 'Con docencia'})}</option>
                        </select>
                      </div>
                      {/* Col 2: Inicio */}
                      <div>
                        <label className="text-body font-semibold text-foreground mb-2 block">{t('campos.calendario.inicioFeoeLabel', {defaultValue: 'Inicio FEOE'})}</label>
                        <DatePicker
                          value={typeof info_fechas.ini_feoe === 'string' ? info_fechas.ini_feoe : ""}
                          onChange={v => handleUpdateFechas("ini_feoe", v)}
                        />
                      </div>
                      {/* Col 3: Fin */}
                      <div>
                        <label className="text-body font-semibold text-foreground mb-2 block">{t('campos.calendario.finFeoeLabel', {defaultValue: 'Fin FEOE'})}</label>
                        <DatePicker
                          value={typeof info_fechas.fin_feoe === 'string' ? info_fechas.fin_feoe : ""}
                          onChange={v => handleUpdateFechas("fin_feoe", v)}
                        />
                      </div>
                      {/* Col 4: Horas/día */}
                      <div>
                        <label className="text-body font-semibold text-foreground mb-2 block">{t('campos.calendario.horasDiaFeoeLabel', {defaultValue: 'Horas/día FEOE'})}</label>
                        <input
                          type="number"
                          value={Number(info_fechas.h_sem_feoe) || 8}
                          onChange={e => handleUpdateFechas("h_sem_feoe", Number(e.target.value))}
                          className="w-full bg-foreground/10 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground focus:border-orange-500 focus:outline-none text-center"
                        />
                      </div>
                    </div>
                  </Card>
                  </div>

                </div>
              )}

              {activeTab === 'eventos' && (
                <div className="space-y-3 mt-4 pb-[40vh]">
                <SectionHeading id="calendario-festivos-eventos" scrollMt="260px">
                  {t('campos.calendario.festivosEventosTitulo', {defaultValue: 'Festivos y eventos'})}
                </SectionHeading>
                <Card className="p-6 border-t-4 border-t-yellow-500 overflow-visible z-20">
                  <p className="text-muted text-body mb-4">
                    {t('campos.calendario.festivosEventosInstruccionesPre', {defaultValue: 'Introduce manualmente o haz clic en el calendario. Los festivos excluyen horas del cómputo real. Festivo y Relevante son independientes: un mismo día puede tener los dos a la vez. Las filas con'})}
                    <Lock className="w-[1em] h-[1em] inline-block mx-1" />
                    {t('campos.calendario.festivosEventosInstruccionesPost', {defaultValue: '(Inicio/Fin de curso y de trimestre, FEOE) vienen de Fechas generales / Periodo FEOE — se editan ahí, no aquí.'})}
                  </p>
                  <NotesTable
                    currentMonthKey={currentMonthKey}
                    calendar_notes={calendar_notes}
                    onUpdateNotes={handleUpdateNotes}
                    autoMilestones={getAutoMilestones(info_fechas)}
                    feoeIni={typeof info_fechas.ini_feoe === 'string' ? info_fechas.ini_feoe : undefined}
                    feoeFin={typeof info_fechas.fin_feoe === 'string' ? info_fechas.fin_feoe : undefined}
                  />
                </Card>
                </div>
              )}

              {activeTab === 'agenda' && (
                <div className="space-y-12 mt-4 animate-in fade-in duration-500">
                  <ContextoAgenda />
                  <TodayClasses />
                  <WeeklyClasses />
                  <DesarrolloUdActual />
                </div>
              )}

              {activeTab === 'mensual' && (
                <div className="mt-4 animate-in fade-in duration-500">
                  <InteractiveCalendar
                    info_fechas={info_fechas}
                    horario={horario}
                    calendar_notes={calendar_notes}
                    planning_ledger={planningLedger}
                    onUpdateNote={(key, val) => {
                      if (!cursoData) return;
                      setCursoData({ ...cursoData, calendar_notes: { ...cursoData.calendar_notes, [key]: val } });
                    }}
                  />
                </div>
              )}

            </div>
          </MotionWrapper>
        </main>
      </div>
    </div>
      );
}

