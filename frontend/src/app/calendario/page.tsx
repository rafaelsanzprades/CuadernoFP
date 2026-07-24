"use client";
import { TabSync } from "@/components/ui/TabSync";
import { Calendar, Circle, ClipboardList, Search, Settings, Flag , Info, FolderOpen } from "lucide-react";
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import DatePicker from "@/components/ui/DatePicker";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { generatePlanning } from "@/utils/planningGenerator";
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
function NotesTable({ calendar_notes, onUpdateNotes }: { calendar_notes: Record<string, string>; onUpdateNotes: (notes: Record<string, string>) => void }) {
  const { t } = useTranslation();
  const [newDate, setNewDate]     = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newType, setNewType]     = useState<"f" | "r">("f");
  const [newText, setNewText]     = useState("");

  function addNote() {
    if (!newDate || !newText) return;
    
    const startD = new Date(newDate + "T12:00:00");
    const endD = newEndDate ? new Date(newEndDate + "T12:00:00") : startD;
    
    if (endD < startD) return;

    const newNotes = { ...calendar_notes };
    
    let curr = new Date(startD);
    while (curr <= endD) {
      const d = String(curr.getDate()).padStart(2, "0");
      const m = String(curr.getMonth() + 1).padStart(2, "0");
      const y = curr.getFullYear();
      const key = `${newType}_${d}/${m}/${y}`;
      newNotes[key] = newText;
      curr.setDate(curr.getDate() + 1);
    }
    
    onUpdateNotes(newNotes);
    setNewDate(""); setNewEndDate(""); setNewText("");
  }

  function deleteRange(keys: string[]) {
    const newNotes = { ...calendar_notes };
    keys.forEach(k => delete newNotes[k]);
    onUpdateNotes(newNotes);
  }

  const entries = Object.entries(calendar_notes).filter(([, v]) => v).sort(([a], [b]) => {
    const toSortable = (k: string) => { 
      const str = k.substring(2);
      if (str.includes("-")) return str; // already YYYY-MM-DD
      const parts = str.split("/"); 
      if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
      return str;
    };
    return toSortable(a).localeCompare(toSortable(b));
  });

  const ranges: { start: string, end: string, type: string, desc: string, keys: string[] }[] = [];
  
  entries.forEach(([k, v]) => {
    const type = k.charAt(0);
    const dateStr = k.substring(2);
    
    // Parse Date properly regardless of format
    let d: Date;
    if (dateStr.includes("-")) {
      const [y, m, day] = dateStr.split("-");
      d = new Date(Number(y), Number(m)-1, Number(day), 12);
    } else {
      const parts = dateStr.split("/");
      d = new Date(Number(parts[2]||0), Number(parts[1]||1)-1, Number(parts[0]||1), 12);
    }
    
    if (ranges.length > 0) {
      const last = ranges[ranges.length - 1];
      const lastDateStr = last.end.substring(2);
      let lastD: Date;
      if (lastDateStr.includes("-")) {
        const [y, m, day] = lastDateStr.split("-");
        lastD = new Date(Number(y), Number(m)-1, Number(day), 12);
      } else {
        const lastParts = lastDateStr.split("/");
        lastD = new Date(Number(lastParts[2]||0), Number(lastParts[1]||1)-1, Number(lastParts[0]||1), 12);
      }
      
      const diffDays = Math.round((d.getTime() - lastD.getTime()) / (1000 * 3600 * 24));
      
      // Merge if consecutive day, or if gap is weekend
      if (last.type === type && last.desc === v && (diffDays === 1 || (diffDays === 3 && lastD.getDay() === 5) || (diffDays === 2 && lastD.getDay() === 6))) {
        last.end = k;
        last.keys.push(k);
        return;
      }
    }
    ranges.push({ start: k, end: k, type, desc: v, keys: [k] });
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-[var(--glass-border)] text-muted">
            <th className="p-2 w-32">{t('table.fecha', {defaultValue: 'Fecha'})}</th>
            <th className="p-2 w-32">{t('table.hasta', {defaultValue: 'Hasta'})}</th>
            <th className="p-2 w-24">{t('table.tipo', {defaultValue: 'Tipo'})}</th>
            <th className="p-2">{t('table.descripcion', {defaultValue: 'Descripción'})}</th>
            <th className="p-2 w-10" />
          </tr>
        </thead>
        <tbody>
          {ranges.map((r, i) => {
            const getMonthYear = (dateString: string) => {
              if (dateString.includes("-")) {
                const [y, m] = dateString.split("-");
                return { m: Number(m), y: y.substring(2) };
              }
              const parts = dateString.split("/");
              return { m: Number(parts[1]), y: (parts[2]||"").substring(2) };
            };
            
            const startMY = getMonthYear(r.start.substring(2));
            const monthName = MONTH_NAMES[startMY.m - 1] || "Mes";
            const monthHeader = `${monthName} '${startMY.y}`;
            
            let showHeader = false;
            if (i === 0) showHeader = true;
            else {
              const prevMY = getMonthYear(ranges[i-1].start.substring(2));
              if (prevMY.m !== startMY.m || prevMY.y !== startMY.y) showHeader = true;
            }

            const isF = r.type === "f";
            const fmt = (dateString: string) => {
              if (dateString.includes("-")) {
                const [y, m, d] = dateString.split("-");
                return `${d} ${MONTH_NAMES[Number(m)-1]?.substring(0,3).toLowerCase()||""} ${y}`;
              }
              const p = dateString.split("/");
              return `${p[0]} ${MONTH_NAMES[Number(p[1])-1]?.substring(0,3).toLowerCase()||""} ${p[2]}`;
            };
            
            return (
              <React.Fragment key={r.start + r.desc}>
                {showHeader && (
                  <tr>
                    <td colSpan={5} className="pt-6 pb-2 text-xs font-bold uppercase tracking-wider text-accent border-b border-[var(--glass-border)]/50">
                      {monthHeader}
                    </td>
                  </tr>
                )}
                <tr className="border-b border-white/5 hover:bg-foreground/5 transition-colors">
                  <td className="p-2 font-mono text-foreground/80">{fmt(r.start.substring(2))}</td>
                  <td className="p-2 font-mono text-foreground/60">{r.start === r.end ? "" : fmt(r.end.substring(2))}</td>
                  <td className="p-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isF ? "bg-danger/10 text-danger" : "bg-info/10 text-info"
                    }`}>
                      {isF ? <><span className="inline-flex"><Circle className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('festivo', {defaultValue: 'Festivo'})}</> : <><span className="inline-flex"><Circle className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('evento', {defaultValue: 'Evento'})}</>}
                    </span>
                  </td>
                  <td className="p-2 text-foreground/90">{r.desc}</td>
                  <td className="p-2 text-center">
                    <button onClick={() => deleteRange(r.keys)} className="text-muted/80 hover:text-danger font-bold text-lg leading-none transition-colors">×</button>
                  </td>
                </tr>
              </React.Fragment>
            );
          })}

          <tr className="border-t border-[var(--glass-border)] bg-white/3">
            <td className="p-2">
              <DatePicker value={newDate} onChange={v => setNewDate(v)} className="w-full" placeholder={t('inicio', {defaultValue: 'Inicio...'})} />
            </td>
            <td className="p-2">
              <DatePicker value={newEndDate} onChange={v => setNewEndDate(v)} className="w-full" placeholder={t('hasta_opc', {defaultValue: 'Hasta (Opcional)'})} />
            </td>
            <td className="p-2">
              <select value={newType} onChange={e => setNewType(e.target.value as "f" | "r")} className="w-full bg-foreground/20 border border-[var(--glass-border)] rounded p-2 text-sm text-foreground focus:border-warning focus:outline-none">
                <option value="f">{t('festivo', {defaultValue: 'Festivo'})}</option>
                <option value="r">{t('evento', {defaultValue: 'Evento'})}</option>
              </select>
            </td>
            <td className="p-2">
              <input type="text" value={newText} onChange={e => setNewText(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()} placeholder={t('descripcion', {defaultValue: 'Descripción...'})} className="w-full bg-foreground/20 border border-[var(--glass-border)] rounded p-2 text-sm text-foreground focus:border-warning focus:outline-none" />
            </td>
            <td className="p-2 text-center">
              <button onClick={addNote} disabled={!newDate || !newText} className="text-warning hover:text-warning font-bold text-2xl leading-none disabled:text-gray-700 transition-colors">+</button>
            </td>
          </tr>
        </tbody>
      </table>
      {ranges.length === 0 && <p className="text-center text-muted/80 text-sm py-4">{t('sin_eventos', {defaultValue: 'Sin festivos ni eventos aún. Añade uno arriba.'})}</p>}
    </div>
  );
}


// ── Interactive Calendar Component ────────────────────────────────────────────

function InteractiveCalendar({ info_fechas, horario, calendar_notes, onUpdateNote }: { info_fechas: Record<string, string>; horario: Record<string, any>; calendar_notes: Record<string, string>; onUpdateNote: (key: string, val: string) => void }) {
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
    const isEvento  = !!calendar_notes[`r_${dkey}`];

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
      <div className="flex flex-wrap gap-4 mb-6 text-xs">
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
              <h3 className="text-center font-semibold text-sm mb-3 text-foreground/90">
                {MONTH_NAMES[m]} {y}
              </h3>
              <div className="grid grid-cols-7 gap-0.5">
                {DAY_NAMES_SHORT.map(d => (
                  <div key={d} className="text-center text-xs text-muted/80 font-bold pb-1">{d}</div>
                ))}
                {cells.map((day, i) => {
                  if (!day) return <div key={`e-${i}`} />;
                  const date = new Date(y, m, day);
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <button
                      key={day}
                      onClick={(e) => openPopup(e, date)}
                      className={`text-center text-xs rounded py-1 transition-all ${getDayStyle(date)} ${isToday ? "ring-1 ring-warning ring-offset-1 ring-offset-black/50" : ""}`}
                      title={`${pad(day)}/${pad(m + 1)}/${y}`}
                    >
                      {day}
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
          <h3 className="text-sm font-semibold text-muted mb-3"><span className="inline-flex"><ClipboardList className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('notas_reg', {defaultValue: 'Notas registradas'})} ({noteEntries.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {noteEntries
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([k, v]) => {
                const isF = k.startsWith("f_");
                return (
                  <div
                    key={k}
                    className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 border ${
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
                      className="text-muted/80 hover:text-danger font-bold text-sm leading-none"
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
            <p className="text-sm font-semibold mb-3 text-foreground/90"> {popup.key}</p>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setNoteType("f")}
                className={`flex-1 text-xs py-1.5 rounded transition-all ${
                  noteType === "f"
                    ? "bg-danger/10 text-danger border border-danger/30"
                    : "bg-foreground/5 text-muted border border-[var(--glass-border)] hover:bg-foreground/10"
                }`}
              ><span className="inline-flex"><Circle className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('festivo')}</button>
              <button
                onClick={() => setNoteType("r")}
                className={`flex-1 text-xs py-1.5 rounded transition-all ${
                  noteType === "r"
                    ? "bg-info/10 text-info border border-info/30"
                    : "bg-foreground/5 text-muted border border-[var(--glass-border)] hover:bg-foreground/10"
                }`}
              ><span className="inline-flex"><Circle className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('evento')}</button>
            </div>
            <input
              autoFocus
              className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded p-2 text-sm text-foreground mb-3 focus:border-info focus:outline-none"
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
                className="flex-1 bg-info/10 hover:bg-info/10 text-info text-xs py-1.5 rounded border border-info/30 transition-all"
              >{t('anadir', {defaultValue: 'Añadir'})}</button>
              <button
                onClick={() => setPopup(null)}
                className="text-muted text-xs py-1.5 px-3 rounded hover:text-foreground/80 transition-all"
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
  const { activeCursoId, cursoData, setCursoData, updateCursoData, saveCursoData, activeModuleId, moduleData, setModuleData } = useAppStore();
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();
  const [saveMessage, setSaveMessage] = useState("");
  const [activeTab, setActiveTab] = useState("fechas");

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
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1 p-8 content-area">
            <MotionWrapper>

              <Card className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl">
                <Calendar className="w-16 h-16 text-muted-foreground opacity-50" />
                <h2 className="text-2xl font-bold">No hay curso cargado</h2>
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
            <div className="text-lg text-info animate-pulse">Cargando calendario...</div>
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



  const TABS = [
    { id: "fechas", label: <><span className="inline-flex"><Settings className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.fechas', {defaultValue: 'Fechas'})}</>, cleanLabel: t('tabs.fechas', {defaultValue: 'Fechas'}) },
    { id: "eventos", label: <span className="flex items-center gap-2"><Flag className="w-[1.2em] h-[1.2em] mr-1 shrink-0" /> {t('tabs.eventos', {defaultValue: 'Eventos'})}</span>, cleanLabel: t('tabs.eventos', {defaultValue: 'Eventos'}) },
    { id: "visual", label: <><span className="inline-flex"><Calendar className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.visual', {defaultValue: 'Visual'})}</>, cleanLabel: t('tabs.visual', {defaultValue: 'Visual'}) }
  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />

        <main className="flex-1 p-8 content-area overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-4 pb-12">
            {/* Page heading */}
            <div>
              <h1 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Calendar className="w-6 h-6 text-accent" /> {t('pages.calendario_title', {defaultValue: 'Calendario académico'})}
              </h1>
              <p className="text-muted mt-2 text-sm">{t('pages.calendario_desc', {defaultValue: 'Horarios, trimestres, festivos y eventos del curso.'})}</p>
            </div>

          {/* Save message */}
          {saveMessage && (
            <p className={`text-sm font-semibold ${saveMessage.includes("Error") ? "text-danger" : "text-success"}`}>
              {saveMessage}
            </p>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-2 max-w-full">
              {TABS.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

                        {(() => {
                const infoMap: Record<string, {title: string, desc: string}> = {
          'fechas': {
                    'title': 'Configuración de Fechas',
                    'desc': 'Configuración de fechas de inicio, fin y trimestres.'
          },
          'eventos': {
                    'title': 'Eventos y Festivos',
                    'desc': 'Gestión de festivos locales, provinciales y eventos de centro.'
          },
          'visual': {
                    'title': 'Calendario visual',
                    'desc': 'Calendario visual con el horario semanal y eventos asignados.'
          }
};
                const info = infoMap[activeTab] || { title: 'Herramienta operativa', desc: 'Gestión de ' + activeTab };
                return (
                  <div className='flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6'>
                    <Info className='w-5 h-5 text-accent mt-0.5 shrink-0' />
                    <div>
                      <p className="text-sm text-muted">{info.desc}</p>
                    </div>
                  </div>
                );
              })()}

          {activeTab === "fechas" && (
            <div className="space-y-4">
              {/* Fechas generales */}
              <Card className="p-6 border-t-4 border-t-blue-500 overflow-visible z-30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Fechas generales</h2>
                  <div className="flex gap-2">

                    <Button
                      variant="ghost"
                      onClick={() => {
                        const ledger = cursoData?.planning_ledger || {};
                        const dates = Object.keys(ledger)
                          .map(d => { const [dd,mm,yyyy] = d.split("/"); return `${yyyy}-${mm}-${dd}`; })
                          .sort();
                        if (dates.length > 0) {
                          handleUpdateFechas("ini_curso", dates[0]);
                          handleUpdateFechas("fin_curso", dates[dates.length - 1]);
                        }
                      }}
                      className="text-xs text-info hover:text-info border border-[var(--glass-border)]"
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
                      <label className="text-sm text-muted mb-1 block">{label}</label>
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
                  <h2 className="text-lg font-bold flex items-center gap-2">Horario semanal</h2>
                  <div className="bg-foreground/15 px-4 py-2 rounded-lg border border-[var(--glass-border)] text-sm">
                    Desfase con BOA ({h_sem} h/sem):{" "}
                    <span className={`font-bold ${suma_horario === h_sem ? "text-success" : "text-warning"}`}>
                      {suma_horario - h_sem} h
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  {["Lun", "Mar", "Mié", "Jue", "Vie"].map(day => (
                    <div key={day}>
                      <label className="text-sm text-muted mb-1 block text-center font-bold">{day}</label>
                      <input 
                        type="number" min="0" max="8"
                        value={Number(horario[day]) || 0}
                        onChange={e => handleUpdateHorario(day, Number(e.target.value))}
                        className="w-full text-center text-lg font-mono bg-background border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Días hábiles */}
              <Card className="p-6 border-t-4 border-t-yellow-500 overflow-hidden">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">Información sobre días hábiles</h2>
                <div className="overflow-x-auto rounded-xl border border-[var(--glass-border)]">
                  <table className="w-full text-center text-sm border-collapse">
                    <thead>
                      <tr className="bg-foreground/5 text-muted border-b border-[var(--glass-border)]">
                        <th className="p-3 text-left font-semibold">Trimestre</th>
                        {["Lun", "Mar", "Mié", "Jue", "Vie"].map(day => (
                          <th key={day} className={`p-3 font-semibold ${!Number(horario[day]) ? 'opacity-40' : ''}`}>
                            {day}
                            {Number(horario[day]) > 0 && <span className="block text-xs text-info font-normal mt-0.5">{horario[day]}h/sem</span>}
                          </th>
                        ))}
                        <th className="p-3 font-semibold border-l border-[var(--glass-border)]">Total Días</th>
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
                              <td key={day} className={`p-3 ${!Number(horario[day]) ? 'opacity-30' : 'font-mono text-sm font-medium'}`}>
                                {row.wd[day]}
                              </td>
                            ))}
                            <td className="p-3 font-bold border-l border-[var(--glass-border)] text-sm font-mono">
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
                  <h2 className="text-lg font-bold">Trimestres</h2>
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
                          <label className="text-xs text-muted">Inicio</label>
                          <DatePicker value={typeof info_fechas[t.ini] === 'string' ? info_fechas[t.ini] : ""} onChange={v => handleUpdateFechas(t.ini, v)} />
                        </div>
                        <div>
                          <label className="text-xs text-muted">Fin</label>
                          <DatePicker value={typeof info_fechas[t.fin] === 'string' ? info_fechas[t.fin] : ""} onChange={v => handleUpdateFechas(t.fin, v)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Horas reales */}
              <Card className="p-6 border-t-4 border-t-cyan-500">
                <h2 className="text-lg font-bold mb-6">Horas lectivas reales</h2>
                <div className="grid grid-cols-3 gap-6 mb-6">
                  {[
                    { label: "1er trimestre", value: h1 },
                    { label: "2º trimestre", value: h2 },
                    { label: "3er trimestre", value: h3 },
                  ].map(t => (
                    <div key={t.label}>
                      <label className="block text-sm font-semibold text-muted mb-2 text-center">{t.label}</label>
                      <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-4 text-center">
                        <div className="text-lg font-bold text-success font-mono">{t.value} h</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "Horas Oficiales (BOA)", value: `${h_boa} h`, cls: "text-foreground" },
                    { label: "Horas Reales de Clase", value: `${h_real} h`, cls: h_real < h_boa ? "text-warning" : "text-success" },
                  ].map(s => (
                    <div key={s.label}>
                      <label className="block text-sm font-semibold text-muted mb-2 text-center">{s.label}</label>
                      <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-4 text-center">
                        <div className={`text-lg font-bold ${s.cls}`}>{s.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* FP Dual / FEOE - 5 columnas */}
              <Card className="p-6 border-t-4 border-t-orange-500 overflow-visible">
                <h2 className="text-lg font-bold mb-6">FP Dual (FEOE)</h2>
                <div className="grid grid-cols-5 gap-4 items-end">
                  {/* Col 1: Selector de tipo */}
                  <div>
                    <label className="text-sm text-muted mb-2 block font-semibold">Tipo de dual</label>
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
                    <label className="text-sm text-muted mb-2 block font-semibold">Docencia</label>
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
                    <label className="text-sm text-muted mb-2 block font-semibold">Inicio FEOE</label>
                    <DatePicker
                      value={typeof info_fechas.ini_feoe === 'string' ? info_fechas.ini_feoe : ""}
                      onChange={v => handleUpdateFechas("ini_feoe", v)}
                    />
                  </div>
                  {/* Col 3: Fin */}
                  <div>
                    <label className="text-sm text-muted mb-2 block font-semibold">Fin FEOE</label>
                    <DatePicker
                      value={typeof info_fechas.fin_feoe === 'string' ? info_fechas.fin_feoe : ""}
                      onChange={v => handleUpdateFechas("fin_feoe", v)}
                    />
                  </div>
                  {/* Col 4: Horas/día */}
                  <div>
                    <label className="text-sm text-muted mb-2 block font-semibold">Horas/día FEOE</label>
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

          {activeTab === "eventos" && (
            <Card className="p-6 border-t-4 border-t-yellow-500 overflow-visible z-20">
              <h2 className="text-lg font-bold mb-2"> Festivos y eventos</h2>
              <p className="text-muted text-sm mb-4">
                Introduce manualmente o haz clic en el calendario. Los festivos excluyen horas del cómputo real.
              </p>
              {/* Manual entry table */}
              <NotesTable calendar_notes={calendar_notes} onUpdateNotes={handleUpdateNotes} />
            </Card>
          )}

          {activeTab === "visual" && (
            <Card className="p-6 border-t-4 border-t-purple-500">
              <h3 className="text-lg font-bold mb-4 text-foreground/80"><span className="inline-flex"><Calendar className="w-[1.2em] h-[1.2em] mr-1" /></span> Calendario visual</h3>
              <InteractiveCalendar
                info_fechas={info_fechas}
                horario={horario}
                calendar_notes={calendar_notes}
                onUpdateNote={handleUpdateNote}
              />
            </Card>
          )}
          </MotionWrapper>
        </main>
      </div>
    </div>
      );
}

