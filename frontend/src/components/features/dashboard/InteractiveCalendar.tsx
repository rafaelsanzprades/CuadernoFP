import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getAutoMilestones } from "@/utils/calendarMilestones";
import { ClipboardList, Circle } from "lucide-react";

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

export function InteractiveCalendar({ info_fechas, horario, calendar_notes, onUpdateNote, planning_ledger }: {
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
    if (inRange(date, feoS, feoE)) return "bg-warning/10 text-warning hover:bg-warning/20 cursor-pointer";
    if (inRange(date, t1s, t1e))   return "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 cursor-pointer";
    if (inRange(date, t2s, t2e))   return "bg-red-500/10 text-red-400 hover:bg-red-500/20 cursor-pointer";
    if (inRange(date, t3s, t3e))   return "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 cursor-pointer";
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
          { cls: "bg-purple-500/10 border-purple-500/30 text-purple-400",      label: t('t1', {defaultValue: "1er trimestre"}) },
          { cls: "bg-red-500/10 border-red-500/30 text-red-400", label: t('t2', {defaultValue: "2º trimestre"}) },
          { cls: "bg-amber-500/10 border-amber-500/30 text-amber-400",  label: t('t3', {defaultValue: "3er trimestre"}) },
          { cls: "bg-danger/10 border-danger/30",        label: t('festivo', {defaultValue: "Festivo"}) },
          { cls: "bg-info/10 border-info/30",      label: t('evento', {defaultValue: "Evento"}) },
        ].map(l => (
          <span key={l.label} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${l.cls}`}>
            <span className="text-foreground/80">{l.label}</span>
          </span>
        ))}
      </div>

      {/* Month grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
