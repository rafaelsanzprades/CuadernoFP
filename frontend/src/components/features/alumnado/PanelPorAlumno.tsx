"use client";
import { ChevronDown, ChevronUp, HelpCircle, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Alumnado } from "@/types";
import { isAlumnoActivo } from "@/utils/alumnado";
import { useTranslation } from "react-i18next";
import { IndiceAlfabetico } from "@/components/ui/IndiceAlfabetico";

// El índice alfabético (ABC DEF ...) vive en la cabecera fija de cada página
// (fuera de este panel) y avisa por evento de a quién seleccionar.
const EVENTO_SELECCIONAR = "panel-alumno-seleccionar";

export function IndiceAlumnadoPanel({ className = "" }: { className?: string }) {
  const { cursoData } = useAppStore();
  const activos = (cursoData?.df_al || []).filter(isAlumnoActivo);
  return (
    <IndiceAlfabetico
      className={className}
      alumnos={activos.map((a: Alumnado) => ({ id: a.ID || "", apellidos: a.Apellidos }))}
      onSelect={(id) => window.dispatchEvent(new CustomEvent(EVENTO_SELECCIONAR, { detail: id }))}
    />
  );
}

// Estilo "lista de alumnado a la izquierda + panel de secciones desplegables
// a la derecha", común a Alumnado -> Orientación profesional, Calificaciones
// -> Académicas y Cierre -> Alumnado. Cada página aporta sus secciones como
// hijos (función que recibe el alumno/a seleccionado).

// ─── Sección desplegable ──────────────────────────────────────────────────────

export function SeccionAcordeon({
  title, icon, defaultOpen = false, children,
}: { title: string; icon: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="space-y-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 bg-foreground/5 hover:bg-foreground/10 rounded-xl border border-white/5 transition-all text-left font-bold text-base"
      >
        <div className="flex items-center gap-3 text-foreground">
          {icon}
          <span>{title}</span>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
      </button>
      {open && <div className="animate-in slide-in-from-top-2 duration-300">{children}</div>}
    </div>
  );
}

// ─── Campos de la ficha profesional (profesional_ledger) ──────────────────────

export function useFichaProfesional(studentId: string) {
  const { t } = useTranslation();
  const { cursoData, updateCursoData } = useAppStore();
  const profesionalLedger = cursoData?.profesional_ledger || {};
  const studentData = studentId ? (profesionalLedger[studentId] || {}) : {};

  const updateField = (field: string, value: any) => {
    if (!studentId) return;
    const newLedger = { ...profesionalLedger };
    newLedger[studentId] = { ...(newLedger[studentId] || {}), [field]: value };
    updateCursoData("profesional_ledger", newLedger);
  };

  const renderInput = (field: string, label: string, type = "text", placeholder = "") => (
    <div className="flex flex-col gap-1.5">
      <label className="text-caption font-medium text-muted tracking-wider">{label}</label>
      <input
        type={type}
        value={studentData[field] || ""}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground text-body focus:border-accent focus:outline-none focus:bg-background/40 transition-all"
      />
    </div>
  );

  const renderTextarea = (field: string, label: string, placeholder = "") => (
    <div className="flex flex-col gap-1.5">
      <label className="text-caption font-medium text-muted tracking-wider">{label}</label>
      <textarea
        value={studentData[field] || ""}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground text-body focus:border-accent focus:outline-none focus:bg-background/40 transition-all resize-none"
      />
    </div>
  );

  const renderSelect = (field: string, label: string, options: { value: string; label: string }[]) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-caption font-medium text-muted tracking-wider">{label}</label>
      <select
        value={studentData[field] || ""}
        onChange={(e) => updateField(field, e.target.value)}
        className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground text-body focus:border-accent focus:outline-none focus:bg-background/40 transition-all cursor-pointer"
      >
        <option value="" className="bg-[#0f172a] text-muted">{t('checks.orientacion.seleccionar', {defaultValue: '-- Seleccionar --'})}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#0f172a] text-foreground">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderCheckbox = (field: string, label: string) => {
    const isChecked = studentData[field] === true || studentData[field] === "X";
    return (
      <label className="flex items-center gap-2 text-body text-foreground/80 cursor-pointer hover:text-foreground transition-colors py-1.5 select-none">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => updateField(field, e.target.checked ? "X" : "")}
          className="w-4 h-4 rounded bg-foreground/15 border-[var(--glass-border)] accent-accent focus:ring-0 focus:outline-none cursor-pointer"
        />
        <span>{label}</span>
      </label>
    );
  };

  return { studentData, updateField, renderInput, renderTextarea, renderSelect, renderCheckbox };
}

// ─── Panel: lista de alumnado + secciones ─────────────────────────────────────

export function PanelPorAlumno({
  children, badge, hasData, rowExtra,
}: {
  children: (student: Alumnado) => React.ReactNode;
  // Etiqueta opcional a la derecha de la cabecera del alumno/a.
  badge?: (student: Alumnado) => React.ReactNode;
  // Punto indicador en la lista (p.ej. "ya tiene datos").
  hasData?: (studentId: string) => boolean;
  // Contenido opcional a la derecha de cada fila de la lista (p.ej. el estado
  // de asistencia del día). Recibe el alumno/a; sus clics no seleccionan la fila.
  rowExtra?: (student: Alumnado) => React.ReactNode;
}) {
  const { t } = useTranslation();
  const { cursoData } = useAppStore();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const df_al = cursoData?.df_al || [];
  const activeStudents = [...df_al.filter(isAlumnoActivo)].sort(
    (a: Alumnado, b: Alumnado) => (a.Apellidos || "").localeCompare(b.Apellidos || "")
  );
  const currentStudent = activeStudents.find((s: Alumnado) => s.ID === selectedStudentId);

  React.useEffect(() => {
    if (activeStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(activeStudents[0].ID || "");
    }
  }, [activeStudents.length]);

  useEffect(() => {
    const alSeleccionar = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setSelectedStudentId(id);
      setTimeout(() => document.getElementById(`panel-alumno-${id}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 0);
    };
    window.addEventListener(EVENTO_SELECCIONAR, alSeleccionar);
    return () => window.removeEventListener(EVENTO_SELECCIONAR, alSeleccionar);
  }, []);

  if (activeStudents.length === 0) {
    return (
      <Card className="p-8 text-center border-l-4 border-l-yellow-500 mt-6">
        <h2 className="text-subheading font-bold text-warning mb-2">{t('campos.orientacion.sinAlumnadoTitulo', {defaultValue: 'Sin alumnado'})}</h2>
        <p className="text-foreground/80">
          {t('campos.orientacion.primeroRegistraAlumnadoPre', {defaultValue: 'Primero registra alumnado en la pestaña'})} <span className="inline-flex"><Users className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('campos.orientacion.primeroRegistraAlumnadoPost', {defaultValue: 'Matrícula.'})}
        </p>
      </Card>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-280px)] min-h-[500px]">
      <div className="w-80 bg-foreground/5 border border-white/5 rounded-2xl flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-white/5 bg-foreground/10">
          <div className="text-caption font-medium text-muted tracking-wider">
            {t('campos.orientacion.alumnadoActivoCount', {count: activeStudents.length, defaultValue: 'Alumnado activo ({{count}})'})}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
          {activeStudents.map((al: Alumnado) => {
            const isSelected = al.ID === selectedStudentId;
            return (
              <button
                key={al.ID}
                id={`panel-alumno-${al.ID}`}
                onClick={() => setSelectedStudentId(al.ID || "")}
                className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between ${
                  isSelected
                    ? "bg-accent text-background font-bold shadow-md shadow-accent/15"
                    : "text-foreground/80 hover:bg-foreground/5"
                }`}
              >
                <div className="truncate pr-2">
                  <div className="text-body truncate">{al.Apellidos}, {al.Nombre}</div>
                  <div className={`text-caption font-mono ${isSelected ? "text-background/70" : "text-muted"}`}>{al.ID}</div>
                </div>
                {rowExtra?.(al)}
                {hasData?.(al.ID!) && (
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? "bg-background/60" : "bg-accent/70"}`}
                    title={t('campos.orientacion.tieneDatosOrientacion', {defaultValue: 'Tiene datos de orientación'})}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 bg-foreground/5 border border-white/5 rounded-2xl flex flex-col overflow-hidden">
        {currentStudent ? (
          <>
            <div className="p-6 border-b border-white/5 bg-foreground/10 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-heading font-black text-foreground">
                  {currentStudent.Nombre} {currentStudent.Apellidos}
                </h3>
                <div className="text-caption text-muted font-mono mt-1">
                  ID: {currentStudent.ID} · {currentStudent.Edad ? t('campos.orientacion.nAnos', {n: currentStudent.Edad, defaultValue: '{{n}} años'}) : t('campos.orientacion.edadNoRegistrada', {defaultValue: 'Edad no registrada'})}
                </div>
              </div>
              {badge?.(currentStudent)}
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {children(currentStudent)}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-8 text-muted">
            <HelpCircle className="w-12 h-12 text-muted/50 mb-3" />
            <p className="font-semibold text-subheading">{t('campos.comun.ningunAlumnadoSeleccionado', {defaultValue: 'Ningún alumnado seleccionado'})}</p>
            <p className="text-body opacity-80">{t('campos.orientacion.selectaAlumnadoDesc', {defaultValue: 'Selecciona un alumnado de la lista de la izquierda.'})}</p>
          </div>
        )}
      </div>
    </div>
  );
}
