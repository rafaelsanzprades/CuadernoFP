"use client";
import { TabSync } from "@/components/ui/TabSync";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Calendar, Circle, ClipboardList, Search, Settings, Flag, FolderOpen, Bus } from "lucide-react";
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
import { PageHeader } from "@/components/ui/PageHeader";
import { TabInfoBox } from "@/components/ui/TabInfoBox";
import { useDynamicPlanning } from "@/hooks/useDynamicPlanning";
import { getAutoMilestones } from "@/utils/calendarMilestones";
import Link from "next/link";

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

const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];
const DAY_NAMES_SHORT = ["Lu","Ma","Mi","Ju","Vi","Sa","Do"];

// ── Notes Table Component ─────────────────────────────────────────────────────
function NotesTable({ calendar_notes, onUpdateNotes, planning_ledger }: {
  calendar_notes: Record<string, string>;
  onUpdateNotes: (notes: Record<string, string>) => void;
  planning_ledger?: Record<string, string[]>;
}) {
  const { t } = useTranslation();
  const [newDate, setNewDate]         = useState("");
  const [newEndDate, setNewEndDate]   = useState("");
  const [newFestivo, setNewFestivo]   = useState("");
  const [newRelevante, setNewRelevante] = useState("");

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

  // Parsea una clave "DD/MM/YYYY" (formato actual) o "YYYY-MM-DD" (legado) a Date + ISO ordenable.
  const parseKeyDate = (dateStr: string) => {
    if (dateStr.includes("-")) {
      const [y, m, day] = dateStr.split("-");
      return { iso: `${y}-${m}-${day}`, date: new Date(Number(y), Number(m) - 1, Number(day), 12) };
    }
    const [d, m, y] = dateStr.split("/");
    return { iso: `${y}-${m}-${d}`, date: new Date(Number(y), Number(m) - 1, Number(d), 12) };
  };

  // Una fila por fecha, con festivo y relevante como columnas paralelas (un
  // mismo día puede tener ambos a la vez).
  type DayRow = { iso: string; date: Date; festivo?: string; relevante?: string };
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
  const ranges: { start: DayRow; end: DayRow; keys: string[] }[] = [];
  const keysForDay = (row: DayRow) => [
    ...(row.festivo ? [`f_${pad(row.date.getDate())}/${pad(row.date.getMonth() + 1)}/${row.date.getFullYear()}`] : []),
    ...(row.relevante ? [`r_${pad(row.date.getDate())}/${pad(row.date.getMonth() + 1)}/${row.date.getFullYear()}`] : []),
  ];
  dayRows.forEach(row => {
    const last = ranges[ranges.length - 1];
    if (last) {
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

  const fmt = (d: Date) => `${pad(d.getDate())} ${MONTH_NAMES[d.getMonth()]?.substring(0, 3).toLowerCase() || ""} ${d.getFullYear()}`;
  const docenciaFor = (row: DayRow) => {
    if (!planning_ledger) return "";
    const key = `${pad(row.date.getDate())}/${pad(row.date.getMonth() + 1)}/${row.date.getFullYear()}`;
    const uds = planning_ledger[key];
    return uds && uds.length ? uds.join(", ") : "";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-body border-collapse">
        <thead>
          <tr className="border-b border-[var(--glass-border)] text-muted">
            <th className="p-2 w-28">{t('table.fecha', {defaultValue: 'Fecha'})}</th>
            <th className="p-2 w-28">{t('table.hasta', {defaultValue: 'Hasta'})}</th>
            <th className="p-2">{t('festivo', {defaultValue: 'Festivo'})}</th>
            <th className="p-2">{t('evento', {defaultValue: 'Relevante'})}</th>
            <th className="p-2 w-36">{t('docencia', {defaultValue: 'Docencia'})}</th>
            <th className="p-2 w-10" />
          </tr>
        </thead>
        <tbody>
          {ranges.map((r, i) => {
            const monthHeader = `${MONTH_NAMES[r.start.date.getMonth()]} '${String(r.start.date.getFullYear()).substring(2)}`;
            const showHeader = i === 0
              || ranges[i - 1].start.date.getMonth() !== r.start.date.getMonth()
              || ranges[i - 1].start.date.getFullYear() !== r.start.date.getFullYear();
            const singleDay = r.start.iso === r.end.iso;

            return (
              <React.Fragment key={r.start.iso}>
                {showHeader && (
                  <tr>
                    <td colSpan={6} className="pt-6 pb-2 text-caption font-bold tracking-wider text-accent border-b border-[var(--glass-border)]/50">
                      {monthHeader}
                    </td>
                  </tr>
                )}
                <tr className="border-b border-white/5 hover:bg-foreground/5 transition-colors">
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
                  <td className="p-2 text-caption text-muted">{singleDay ? docenciaFor(r.start) : ""}</td>
                  <td className="p-2 text-center">
                    <button onClick={() => deleteRange(r.keys)} className="text-muted/80 hover:text-danger font-bold text-subheading leading-none transition-colors">×</button>
                  </td>
                </tr>
              </React.Fragment>
            );
          })}

          <tr className="border-t border-[var(--glass-border)] bg-white/3">
            <td className="p-2">
              <DatePicker value={newDate} onChange={v => setNewDate(v)} className="w-full" placeholder="Fecha" />
            </td>
            <td className="p-2">
              <DatePicker value={newEndDate} onChange={v => setNewEndDate(v)} className="w-full" placeholder={t('hasta_opc', {defaultValue: 'Hasta (Opcional)'})} />
            </td>
            <td className="p-2">
              <input type="text" value={newFestivo} onChange={e => setNewFestivo(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()} placeholder={t('festivo', {defaultValue: 'Festivo...'})} className="w-full bg-foreground/20 border border-[var(--glass-border)] rounded p-2 text-body text-foreground focus:border-warning focus:outline-none" />
            </td>
            <td className="p-2">
              <input type="text" value={newRelevante} onChange={e => setNewRelevante(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()} placeholder={t('evento', {defaultValue: 'Relevante...'})} className="w-full bg-foreground/20 border border-[var(--glass-border)] rounded p-2 text-body text-foreground focus:border-warning focus:outline-none" />
            </td>
            <td className="p-2 text-caption text-muted/60 italic">{t('automatico', {defaultValue: 'Automático'})}</td>
            <td className="p-2 text-center">
              <button onClick={addNote} disabled={!newDate || (!newFestivo && !newRelevante)} className="text-warning hover:text-warning font-bold text-heading leading-none disabled:text-gray-700 transition-colors">+</button>
            </td>
          </tr>
        </tbody>
      </table>
      {ranges.length === 0 && <p className="text-center text-muted/80 text-body py-4">{t('sin_eventos', {defaultValue: 'Sin festivos ni eventos aún. Añade uno arriba.'})}</p>}
    </div>
  );
}


// ── Interactive Calendar Component ────────────────────────────────────────────

function InteractiveCalendar({ info_fechas, horario, calendar_notes, onUpdateNote, planning_ledger }: {
  info_fechas: Record<string, string>;
  horario: Record<string, any>;
  calendar_notes: Record<string, string>;
  onUpdateNote: (key: string, val: string) => void;
  planning_ledger?: Record<string, string[]>;
}) {
  const { t } = useTranslation();
  const [popup, setPopup] = useState<{ key: string; x: number; y: number } | null>(null);
  const [noteType, setNoteType] = useState<"f" | "r">("f");
  const [noteText, setNoteText] = useState("");

  const t1s = toDate(info_fechas.ini_1t), t1e = toDate(info_fechas.fin_1t);
  const t2s = toDate(info_fechas.ini_2t), t2e = toDate(info_fechas.fin_2t);
  const t3s = toDate(info_fechas.ini_3t), t3e = toDate(info_fechas.fin_3t);
  const cs  = toDate(info_fechas.ini_curso), ce = toDate(info_fechas.fin_curso);
  const feoS = toDate(info_fechas.ini_feoe), feoE = toDate(info_fechas.fin_feoe);
  const dgenS = toDate(info_fechas.ini_dual_gen), dgenE = toDate(info_fechas.fin_dual_gen);
  const dintS = toDate(info_fechas.ini_dual_int), dintE = toDate(info_fechas.fin_dual_int);
  const autoMilestones = useMemo(() => getAutoMilestones(info_fechas), [info_fechas]);

  // Months to show: from course start to course end (default Sep-Jun)
  const refYear = cs ? cs.getFullYear() : new Date().getFullYear();
  const startMonth = cs ? new Date(cs.getFullYear(), cs.getMonth(), 1)
                        : new Date(refYear, 8, 1);
  const endMonth   = ce ? new Date(ce.getFullYear(), ce.getMonth(), 1)
                        : new Date(refYear + 1, 5, 1);

  const months: Date[] = [];
  const cur = new Date(startMonth);
  while (cur <= endMonth) {
    months.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }

  function getDayStyle(date: Date) {
    const dow = date.getDay(); // 0=Sun
    const isWeekend = dow === 0 || dow === 6;
    const dkey = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    const isFestivo = !!calendar_notes[`f_${dkey}`];
    const isEvento  = !!calendar_notes[`r_${dkey}`] || !!autoMilestones[dkey];

    if (isFestivo)            return "bg-danger/10 text-foreground font-bold ring-1 ring-danger";
    if (isEvento)             return "bg-info/10 text-foreground font-bold ring-1 ring-info";
    if (isWeekend)            return "bg-foreground/5 text-muted/80 cursor-default";
    if (inRange(date, dintS, dintE)) return "bg-orange-500/20 text-orange-600 hover:bg-orange-500/30 font-semibold cursor-pointer";
    if (inRange(date, dgenS, dgenE)) return "bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30 font-semibold cursor-pointer";
    if (inRange(date, feoS, feoE)) return "bg-warning/10 text-warning hover:bg-warning/10 cursor-pointer";
    if (inRange(date, t1s, t1e))   return "bg-info/10 text-info hover:bg-info/10 cursor-pointer";
    if (inRange(date, t2s, t2e))   return "bg-success/10 text-success hover:bg-success/10 cursor-pointer";
    if (inRange(date, t3s, t3e))   return "bg-info/10 text-info hover:bg-info/10 cursor-pointer";
    if (inRange(date, cs, ce))     return "bg-foreground/5 text-muted hover:bg-foreground/10 cursor-pointer";
    return "text-gray-700 cursor-default";
  }

  function getDayInfo(date: Date) {
    const dkey = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    const uds = planning_ledger?.[dkey] || [];
    const festivo = calendar_notes[`f_${dkey}`] || "";
    const relevante = [calendar_notes[`r_${dkey}`], autoMilestones[dkey]].filter(Boolean).join(" / ");
    const isFeoe = inRange(date, feoS, feoE) && date.getDay() !== 0 && date.getDay() !== 6;
    return { ud: uds.join(", "), festivo, relevante, isFeoe };
  }

  function openPopup(e: React.MouseEvent, date: Date) {
    const dow = date.getDay();
    if (dow === 0 || dow === 6) return;
    const dkey = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    // Toggle off if already marked
    if (calendar_notes[`f_${dkey}`]) { onUpdateNote(`f_${dkey}`, ""); return; }
    if (calendar_notes[`r_${dkey}`]) { onUpdateNote(`r_${dkey}`, ""); return; }
    setNoteText("");
    setNoteType("f");
    setPopup({ key: dkey, x: e.clientX, y: e.clientY });
  }

  function saveNote() {
    if (!popup) return;
    onUpdateNote(`${noteType}_${popup.key}`, noteText || (noteType === "f" ? t('festivo') : t('evento')));
    setPopup(null);
  }

  const noteEntries = Object.entries(calendar_notes).filter(([, v]) => v);

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-caption">
        {[
          { cls: "bg-info/10 border-info/30",      label: t('t1', {defaultValue: "1er trimestre"}) },
          { cls: "bg-success/10 border-success/30", label: t('t2', {defaultValue: "2º trimestre"}) },
          { cls: "bg-info/10 border-info/30",  label: t('t3', {defaultValue: "3er trimestre"}) },
          { cls: "bg-yellow-500/20 border-yellow-500/30 text-yellow-600",  label: t('dual_gen', {defaultValue: "FP Dual General"}) },
          { cls: "bg-orange-500/20 border-orange-500/30 text-orange-600",  label: t('dual_int', {defaultValue: "FP Dual Intensiva"}) },
          { cls: "bg-danger/10 border-danger/30",        label: t('festivo', {defaultValue: "Festivo"}) },
          { cls: "bg-info/10 border-info/30",      label: t('evento', {defaultValue: "Evento"}) },
        ].map(l => (
          <span key={l.label} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${l.cls}`}>
            <span className="text-foreground/80">{l.label}</span>
          </span>
        ))}
      </div>

      {/* Month grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {months.map(month => {
          const y = month.getFullYear(), m = month.getMonth();
          const firstDow = (new Date(y, m, 1).getDay() + 6) % 7; // Mon=0
          const daysInMonth = new Date(y, m + 1, 0).getDate();
          const cells: (number | null)[] = [
            ...Array(firstDow).fill(null),
            ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
          ];
          while (cells.length % 7 !== 0) cells.push(null);

          return (
            <div key={`${y}-${m}`} className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-4">
              <h3 className="text-center font-semibold text-body mb-3 text-foreground/90">
                {MONTH_NAMES[m]} {y}
              </h3>
              <div className="grid grid-cols-7 gap-0.5">
                {DAY_NAMES_SHORT.map(d => (
                  <div key={d} className="text-center text-caption text-muted/80 font-bold pb-1">{d}</div>
                ))}
                {cells.map((day, i) => {
                  if (!day) return <div key={`e-${i}`} />;
                  const date = new Date(y, m, day);
                  const isToday = date.toDateString() === new Date().toDateString();
                  const info = getDayInfo(date);
                  const dkeyTitle = `${pad(day)}/${pad(m + 1)}/${y}`;
                  const tooltipLines = [dkeyTitle];
                  if (info.festivo) tooltipLines.push(`Festivo: ${info.festivo}`);
                  if (info.relevante) tooltipLines.push(`Relevante: ${info.relevante}`);
                  if (info.ud) tooltipLines.push(`UD: ${info.ud}`);
                  if (info.isFeoe) tooltipLines.push("FEOE");
                  // Línea pequeña bajo el número: UD (prioridad) o si no hay,
                  // relevante (truncado) - el resto siempre visible al pasar
                  // el ratón, vía el title.
                  const subLine = info.ud || info.relevante || (info.isFeoe ? "FEOE" : "");
                  return (
                    <button
                      key={day}
                      onClick={(e) => openPopup(e, date)}
                      className={`flex flex-col items-center justify-center text-center rounded py-1 px-0.5 min-h-[2.6rem] transition-all ${getDayStyle(date)} ${isToday ? "ring-1 ring-warning ring-offset-1 ring-offset-black/50" : ""}`}
                      title={tooltipLines.join(" · ")}
                    >
                      <span className="text-caption leading-none">{day}</span>
                      {subLine && (
                        <span className="block w-full truncate text-[9px] leading-tight opacity-80 px-0.5">
                          {subLine}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes list */}
      {noteEntries.length > 0 && (
        <div className="mt-6">
          <h3 className="text-body font-semibold text-muted mb-3"><span className="inline-flex"><ClipboardList className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('notas_reg', {defaultValue: 'Notas registradas'})} ({noteEntries.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {noteEntries
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([k, v]) => {
                const isF = k.startsWith("f_");
                return (
                  <div
                    key={k}
                    className={`flex items-center gap-2 text-caption rounded-lg px-3 py-2 border ${
                      isF ? "bg-danger/10 border-danger/30 text-danger"
                          : "bg-info/10 border-info/30 text-info"
                    }`}
                  >
                    <span className="flex-1 truncate">
                      <span className="text-muted mr-1">{k.substring(2)}</span>
                      {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                    </span>
                    <button
                      onClick={() => onUpdateNote(k, "")}
                      className="text-muted/80 hover:text-danger font-bold text-body leading-none"
                    >×</button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Popup */}
      {popup && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setPopup(null)} />
          <div
            className="fixed z-50 bg-gray-900 border border-[var(--glass-border)] rounded-xl p-4 shadow-2xl w-64"
            style={{
              left: Math.min(popup.x + 8, (typeof window !== "undefined" ? window.innerWidth : 800) - 270),
              top:  Math.min(popup.y + 8, (typeof window !== "undefined" ? window.innerHeight : 600) - 170),
            }}
          >
            <p className="text-body font-semibold mb-3 text-foreground/90"> {popup.key}</p>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setNoteType("f")}
                className={`flex-1 text-caption py-1.5 rounded transition-all ${
                  noteType === "f"
                    ? "bg-danger/10 text-danger border border-danger/30"
                    : "bg-foreground/5 text-muted border border-[var(--glass-border)] hover:bg-foreground/10"
                }`}
              ><span className="inline-flex"><Circle className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('festivo')}</button>
              <button
                onClick={() => setNoteType("r")}
                className={`flex-1 text-caption py-1.5 rounded transition-all ${
                  noteType === "r"
                    ? "bg-info/10 text-info border border-info/30"
                    : "bg-foreground/5 text-muted border border-[var(--glass-border)] hover:bg-foreground/10"
                }`}
              ><span className="inline-flex"><Circle className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('evento')}</button>
            </div>
            <input
              autoFocus
              className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded p-2 text-body text-foreground mb-3 focus:border-info focus:outline-none"
              placeholder={noteType === "f" ? t('nombre_festivo', {defaultValue: 'Nombre del festivo...'}) : t('desc_evento', {defaultValue: 'Descripción del evento...'})}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") saveNote();
                if (e.key === "Escape") setPopup(null);
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={saveNote}
                className="flex-1 bg-info/10 hover:bg-info/10 text-info text-caption py-1.5 rounded border border-info/30 transition-all"
              >{t('anadir', {defaultValue: 'Añadir'})}</button>
              <button
                onClick={() => setPopup(null)}
                className="text-muted text-caption py-1.5 px-3 rounded hover:text-foreground/80 transition-all"
              >{t('cancelar', {defaultValue: 'Cancelar'})}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CalendarioPage() {
  const { activeCursoId, cursoData, setCursoData, updateCursoData, saveCursoData, activeModuleId, moduleData, setModuleData, updateDataFrame } = useAppStore();
  // cursoData.planning_ledger es un campo persistido que nunca se escribe
  // (no hay ningún punto de la app que lo guarde) — la asignación real de
  // UD por día se recalcula en memoria vía useDynamicPlanning, igual que en
  // Seguimiento y Calificaciones. Esta página usa claves dd/mm/yyyy (igual
  // que calendar_notes), no el yyyy-mm-dd ISO interno del cálculo dinámico.
  const { planningLedgerDmy: planningLedger } = useDynamicPlanning();
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();
  const [saveMessage, setSaveMessage] = useState("");
  const [activeTab, setActiveTab] = useState("fechas");

  const TABS = [
    { id: "fechas", label: <span className="flex items-center gap-2"><Settings className="w-4 h-4 shrink-0" /> Fechas y horarios</span>, cleanLabel: "Fechas y horarios" },
    { id: "eventos", label: <span className="flex items-center gap-2"><Flag className="w-4 h-4 shrink-0" /> Eventos y festivos</span>, cleanLabel: "Eventos y festivos" },
    { id: "actividades", label: <span className="flex items-center gap-2"><Bus className="w-4 h-4 shrink-0" /> Actividades extraescolares</span>, cleanLabel: "Actividades extraescolares" },
    { id: "visual", label: <span className="flex items-center gap-2"><Calendar className="w-4 h-4 shrink-0" /> Calendario visual</span>, cleanLabel: "Calendario visual" },
  ];

  const TAB_DESCRIPTIONS: Record<string, string> = {
    fechas: 'Configura los trimestres, el horario semanal y los días festivos del curso.',
    eventos: 'Registro de eventos y festivos que afectan a la docencia.',
    actividades: 'Planificación de actividades complementarias y extraescolares.',
    visual: 'Vista mensual del calendario académico completo.',
  };

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  const df_ace = moduleData?.df_ace || [];
  const df_ra = moduleData?.df_ra || [];

  const addRowAce = () => {
    const newDf = [...df_ace];
    const newId = `ACE${(newDf.length + 1).toString().padStart(2, '0')}`;
    newDf.push({ ID: newId, Tipo: "Complementaria", RA_Vinculados: "", Actividad: "", Trimestre: "1T", Entidad: "", Evaluacion: "" });
    updateDataFrame("df_ace", newDf);
  };

  const updateRowAce = (idx: number, field: string, value: any) => {
    const newDf = [...df_ace];
    newDf[idx][field] = value;
    updateDataFrame("df_ace", newDf);
  };

  const removeRowAce = (idx: number) => {
    const newDf = [...df_ace];
    newDf.splice(idx, 1);
    updateDataFrame("df_ace", newDf);
  };

  useEffect(() => {
    if (activeCursoId && !cursoData) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/module/${activeCursoId}`)
        .then(r => r.json())
        .then(json => { if (json.status === "success") setCursoData(json.data); })
        .catch(console.error);
    }
    if (activeModuleId && !moduleData) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/module/${activeModuleId}`)
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
      setSaveMessage("Guardado correctamente");
      setTimeout(() => setSaveMessage(""), 3000);
    } else {
      setSaveMessage("Error al guardar");
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
                <h2 className="text-heading font-bold">No hay curso cargado</h2>
                <p className="text-muted mb-4">Debes abrir o crear un archivo de curso en tu Archivos.</p>
                <Link href="/archivos">
                  <Button variant="primary" className="gap-2">
                    <FolderOpen className="w-4 h-4" /> Ir a mis Archivos
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
            <div className="text-subheading text-info animate-pulse">Cargando calendario...</div>
          </main>
        </div>
      </div>
    );
  }

  const info_fechas   = cursoData?.info_fechas   || {};
  const horario       = cursoData?.horario       || { Lun: 0, Mar: 0, "Mié": 0, Jue: 0, Vie: 0 };
  const calendar_notes = cursoData?.calendar_notes || {};

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
          const key = `f_${pad(curr.getDate())}/${pad(curr.getMonth() + 1)}/${curr.getFullYear()}`;
          if (!calendar_notes[key]) {
            counts[dayMap[dIdx] as keyof typeof counts]++;
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

        <main id="main-content" tabIndex={-1} className="flex-1 p-8 content-area">
          <MotionWrapper className="space-y-4 pb-12">
            <PageHeader
              icon={Calendar}
              title={t('pages.calendario_title', {defaultValue: 'Calendario académico'})}
              description={t('pages.calendario_desc', {defaultValue: 'Horarios, trimestres, festivos y eventos del curso.'})}
            />

          {/* Save message */}
          {saveMessage && (
            <p className={`text-body font-semibold ${saveMessage.includes("Error") ? "text-danger" : "text-success"}`}>
              {saveMessage}
            </p>
          )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
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

            <TabInfoBox description={TAB_DESCRIPTIONS[activeTab] || 'Gestión del calendario académico.'} />

            <div className="space-y-4">
              {activeTab === 'fechas' && (
                <div className="space-y-4 mt-4">
              {/* Fechas generales */}
              <Card className="p-6 border-t-4 border-t-blue-500 overflow-visible z-30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-subheading font-bold">Fechas generales</h2>
                  <div className="flex gap-2">

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
                      <span className="inline-flex"><Search className="w-[1.2em] h-[1.2em] mr-1" /></span> Autodetectar
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Inicio de curso",   field: "ini_curso" },
                    { label: "Inicio clases (1T)", field: "ini_1t"   },
                    { label: "Fin clases (3T)",    field: "fin_3t"   },
                    { label: "Fin de curso",       field: "fin_curso" },
                  ].map(({ label, field }) => (
                    <div key={field}>
                      <label className="text-body text-muted mb-1 block">{label}</label>
                      <DatePicker
                        value={typeof info_fechas[field] === 'string' ? info_fechas[field] : ""}
                        onChange={v => handleUpdateFechas(field, v)}
                      />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Sesiones semanales */}
              <Card className="p-6 border-t-4 border-t-purple-500">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-subheading font-bold flex items-center gap-2">Horario semanal</h2>
                  <div className="bg-foreground/15 px-4 py-2 rounded-lg border border-[var(--glass-border)] text-body">
                    Desfase con BOA ({h_sem} h/sem):{" "}
                    <span className={`font-bold ${suma_horario === h_sem ? "text-success" : "text-warning"}`}>
                      {suma_horario - h_sem} h
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  {["Lun", "Mar", "Mié", "Jue", "Vie"].map(day => (
                    <div key={day}>
                      <label className="text-body text-muted mb-1 block text-center font-bold">{day}</label>
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

              {/* Días hábiles */}
              <Card className="p-6 border-t-4 border-t-yellow-500 overflow-hidden">
                <h2 className="text-subheading font-bold mb-4 flex items-center gap-2">Información sobre días hábiles</h2>
                <div className="overflow-x-auto rounded-xl border border-[var(--glass-border)]">
                  <table className="w-full text-center text-body border-collapse">
                    <thead>
                      <tr className="bg-foreground/5 text-muted border-b border-[var(--glass-border)]">
                        <th className="p-3 text-left font-semibold">Trimestre</th>
                        {["Lun", "Mar", "Mié", "Jue", "Vie"].map(day => (
                          <th key={day} className={`p-3 font-semibold ${!Number(horario[day]) ? 'opacity-40' : ''}`}>
                            {day}
                            {Number(horario[day]) > 0 && <span className="block text-caption text-info font-normal mt-0.5">{horario[day]}h/sem</span>}
                          </th>
                        ))}
                        <th className="p-3 font-semibold border-l border-[var(--glass-border)]">Total días</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { title: "1ª Ev.", wd: wd1, bg: "bg-purple-500/10" },
                        { title: "2ª Ev.", wd: wd2, bg: "bg-red-500/10" },
                        { title: "3ª Ev.", wd: wd3, bg: "bg-amber-500/10" },
                      ].map((row, i) => {
                        const daysArr = ["Lun", "Mar", "Mié", "Jue", "Vie"] as const;
                        const totalDays = daysArr.reduce((acc, d) => acc + (row.wd[d] || 0), 0);
                        return (
    <tr key={row.title} className={`${row.bg} border-b border-[var(--glass-border)] last:border-0`}>
                            <td className="p-3 font-bold text-left">{row.title}</td>
                            {daysArr.map(day => (
                              <td key={day} className={`p-3 ${!Number(horario[day]) ? 'opacity-30' : 'font-mono text-body font-medium'}`}>
                                {row.wd[day]}
                              </td>
                            ))}
                            <td className="p-3 font-bold border-l border-[var(--glass-border)] text-body font-mono">
                              {totalDays}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Trimestres */}
              <Card className="p-6 border-t-4 border-t-emerald-500 overflow-visible z-20">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-subheading font-bold">Trimestres</h2>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { title: "1er trimestre", ini: "ini_1t", fin: "fin_1t" },
                    { title: "2º trimestre",  ini: "ini_2t", fin: "fin_2t" },
                    { title: "3er trimestre", ini: "ini_3t", fin: "fin_3t" },
                  ].map(t => (
                    <div key={t.title} className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-4">
                      <h3 className="text-center font-bold mb-4">{t.title}</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-caption text-muted">Inicio</label>
                          <DatePicker value={typeof info_fechas[t.ini] === 'string' ? info_fechas[t.ini] : ""} onChange={v => handleUpdateFechas(t.ini, v)} />
                        </div>
                        <div>
                          <label className="text-caption text-muted">Fin</label>
                          <DatePicker value={typeof info_fechas[t.fin] === 'string' ? info_fechas[t.fin] : ""} onChange={v => handleUpdateFechas(t.fin, v)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Horas reales */}
              <Card className="p-6 border-t-4 border-t-cyan-500">
                <h2 className="text-subheading font-bold mb-6">Horas lectivas reales</h2>
                <div className="grid grid-cols-3 gap-6 mb-6">
                  {[
                    { label: "1er trimestre", value: h1 },
                    { label: "2º trimestre", value: h2 },
                    { label: "3er trimestre", value: h3 },
                  ].map(t => (
                    <div key={t.label}>
                      <label className="block text-body font-semibold text-muted mb-2 text-center">{t.label}</label>
                      <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-4 text-center">
                        <div className="text-subheading font-bold text-success font-mono">{t.value} h</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "Horas oficiales (BOA)", value: `${h_boa} h`, cls: "text-foreground" },
                    { label: "Horas reales de clase", value: `${h_real} h`, cls: h_real < h_boa ? "text-warning" : "text-success" },
                  ].map(s => (
                    <div key={s.label}>
                      <label className="block text-body font-semibold text-muted mb-2 text-center">{s.label}</label>
                      <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-4 text-center">
                        <div className={`text-subheading font-bold ${s.cls}`}>{s.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* FP Dual / FEOE - 5 columnas */}
              <Card className="p-6 border-t-4 border-t-orange-500 overflow-visible">
                <h2 className="text-subheading font-bold mb-6">FP Dual (FEOE)</h2>
                <div className="grid grid-cols-5 gap-4 items-end">
                  {/* Col 1: Selector de tipo */}
                  <div>
                    <label className="text-body text-muted mb-2 block font-semibold">Tipo de dual</label>
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
                      <option value="general">Dual General</option>
                      <option value="intensiva">Dual Intensiva</option>
                    </select>
                  </div>
                  {/* Col 1.5: Selector de docencia */}
                  <div>
                    <label className="text-body text-muted mb-2 block font-semibold">Docencia</label>
                    <select
                      value={info_fechas.docencia_dual || (info_fechas.tipo_dual === "intensiva" ? "con_docencia" : "sin_docencia")}
                      onChange={e => handleUpdateFechas("docencia_dual", e.target.value)}
                      className="w-full bg-foreground/10 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground focus:border-orange-500 focus:outline-none"
                    >
                      <option value="sin_docencia">Sin docencia</option>
                      <option value="con_docencia">Con docencia</option>
                    </select>
                  </div>
                  {/* Col 2: Inicio */}
                  <div>
                    <label className="text-body text-muted mb-2 block font-semibold">Inicio FEOE</label>
                    <DatePicker
                      value={typeof info_fechas.ini_feoe === 'string' ? info_fechas.ini_feoe : ""}
                      onChange={v => handleUpdateFechas("ini_feoe", v)}
                    />
                  </div>
                  {/* Col 3: Fin */}
                  <div>
                    <label className="text-body text-muted mb-2 block font-semibold">Fin FEOE</label>
                    <DatePicker
                      value={typeof info_fechas.fin_feoe === 'string' ? info_fechas.fin_feoe : ""}
                      onChange={v => handleUpdateFechas("fin_feoe", v)}
                    />
                  </div>
                  {/* Col 4: Horas/día */}
                  <div>
                    <label className="text-body text-muted mb-2 block font-semibold">Horas/día FEOE</label>
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
              )}

              {activeTab === 'eventos' && (
                <Card className="p-6 border-t-4 border-t-yellow-500 overflow-visible z-20 mt-4">
                  <h2 className="text-subheading font-bold mb-2"> Festivos y eventos</h2>
                  <p className="text-muted text-body mb-4">
                    Introduce manualmente o haz clic en el calendario. Los festivos excluyen horas del cómputo real.
                    Festivo y Relevante son independientes: un mismo día puede tener los dos a la vez. La columna
                    Docencia es solo de referencia (viene de Planificación, no se edita aquí).
                  </p>
                  <NotesTable calendar_notes={calendar_notes} onUpdateNotes={handleUpdateNotes} planning_ledger={planningLedger} />
                </Card>
              )}

              {activeTab === 'actividades' && (
                <Card className="p-6 border-t-4 border-t-[#14a085] mt-4">
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-left text-body border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-[var(--glass-border)] text-muted">
                          <th className="p-2 w-16">Id</th>
                          <th className="p-2 w-32">Tipo</th>
                          <th className="p-2 w-32">RA vinculados</th>
                          <th className="p-2 min-w-[200px]">Descripción</th>
                          <th className="p-2 w-24">Trimestre</th>
                          <th className="p-2 w-48">Entidad</th>
                          <th className="p-2 w-48">Evaluación</th>
                          <th className="p-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {df_ace.map((row: any, idx: number) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-foreground/5">
                            <td className="p-2 font-mono text-caption">{row.ID}</td>
                            <td className="p-2 pr-2">
                              <select value={row.Tipo || "Complementaria"} onChange={e => updateRowAce(idx, "Tipo", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-[#14a085] focus:outline-none">
                                <option value="Complementaria">Complementaria</option>
                                <option value="Extraescolar">Extraescolar</option>
                              </select>
                            </td>
                            <td className="p-2 pr-2">
                              <select value={row.RA_Vinculados || ""} onChange={e => updateRowAce(idx, "RA_Vinculados", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-[#14a085] focus:outline-none">
                                <option value="">-</option>
                                {df_ra.map((ra: any) => ra.id_ra && <option key={ra.id_ra} value={ra.id_ra}>{ra.id_ra}</option>)}
                              </select>
                            </td>
                            <td className="p-2 pr-2">
                              <input type="text" value={row.Actividad || ""} onChange={e => updateRowAce(idx, "Actividad", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-[#14a085] focus:outline-none" />
                            </td>
                            <td className="p-2 pr-2">
                              <select value={row.Trimestre || "1T"} onChange={e => updateRowAce(idx, "Trimestre", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-[#14a085] focus:outline-none">
                                <option value="1T">1t</option>
                                <option value="2T">2t</option>
                                <option value="3T">3t</option>
                              </select>
                            </td>
                            <td className="p-2 pr-2">
                              <input type="text" value={row.Entidad || ""} onChange={e => updateRowAce(idx, "Entidad", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-[#14a085] focus:outline-none" />
                            </td>
                            <td className="p-2 pr-2">
                              <input type="text" value={row.Evaluacion || ""} onChange={e => updateRowAce(idx, "Evaluacion", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-[#14a085] focus:outline-none" />
                            </td>
                            <td className="p-2 text-center">
                              <button onClick={() => removeRowAce(idx)} className="text-danger hover:text-danger font-bold">×</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button onClick={addRowAce} className="text-body text-[#14a085] hover:text-[#1abc9c] font-semibold flex items-center gap-1">
                    <span>+</span> Añadir actividad complementaria
                  </button>
                </Card>
              )}

              {activeTab === 'visual' && (
                <Card className="p-6 border-t-4 border-t-purple-500 mt-4">
                  <InteractiveCalendar
                    info_fechas={info_fechas}
                    horario={horario}
                    calendar_notes={calendar_notes}
                    onUpdateNote={handleUpdateNote}
                    planning_ledger={planningLedger}
                  />
                </Card>
              )}
            </div>
          </MotionWrapper>
        </main>
      </div>
    </div>
      );
}

