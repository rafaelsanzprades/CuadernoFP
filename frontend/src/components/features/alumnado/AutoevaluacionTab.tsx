"use client";
import React, { useState } from "react";
import { ClipboardCheck, ChevronDown } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { isAlumnoActivo } from "@/utils/alumnado";
import { Card } from "@/components/ui/Card";

const VALORES = [
  { valor: "SI" as const, label: "SÍ", cls: "bg-success/15 text-success border-success/30" },
  { valor: "DUDAS" as const, label: "Dudas", cls: "bg-warning/15 text-warning border-warning/30" },
  { valor: "NO" as const, label: "NO", cls: "bg-danger/15 text-danger border-danger/30" },
];

export function AutoevaluacionTab() {
  const { moduleData, cursoData, updateCursoData } = useAppStore();
  const df_al = (cursoData?.df_al || []).filter(isAlumnoActivo);
  const df_ce = moduleData?.df_ce || [];
  const df_autoevaluacion = cursoData?.df_autoevaluacion || [];

  const [openAlumnos, setOpenAlumnos] = useState<Set<string>>(new Set());

  const toggleAlumno = (id: string) => {
    const next = new Set(openAlumnos);
    next.has(id) ? next.delete(id) : next.add(id);
    setOpenAlumnos(next);
  };

  const entryFor = (alumnoId: string, ceId: string) =>
    df_autoevaluacion.find((e: any) => e.alumno_id === alumnoId && e.ce_id === ceId);

  const upsertEntry = (alumnoId: string, ceId: string, patch: { valor?: "SI" | "DUDAS" | "NO"; dificultades?: string }) => {
    const existing = entryFor(alumnoId, ceId);
    let updated;
    if (existing) {
      updated = df_autoevaluacion.map((e: any) =>
        e.alumno_id === alumnoId && e.ce_id === ceId
          ? { ...e, ...patch, fecha: new Date().toISOString() }
          : e
      );
    } else {
      updated = [...df_autoevaluacion, {
        id: `AEV-${alumnoId}-${ceId}-${Date.now()}`,
        alumno_id: alumnoId, ce_id: ceId,
        valor: patch.valor || "DUDAS", dificultades: patch.dificultades || "",
        fecha: new Date().toISOString(),
      }];
    }
    updateCursoData("df_autoevaluacion", updated);
  };

  if (df_ce.length === 0) {
    return (
      <Card className="p-6 border-l-4 border-l-warning">
        <p className="text-body text-muted">
          No hay Criterios de Evaluación definidos todavía en la Programación. Ve a Currículo para añadirlos.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <Card className="p-6 border-t-4 border-t-purple-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-2">
          <ClipboardCheck className="w-[1.2em] h-[1.2em]" /> Autoevaluación del alumnado
        </h2>
        <p className="text-caption text-muted mb-5">
          Registro de la autoevaluación recogida al alumnado por CE (SÍ / Dudas / NO) y las dificultades
          que declara — insumo del Plan de Trabajo Individual en Seguimiento.
        </p>

        <div className="space-y-2">
          {df_al.map((al: any) => {
            const abierto = openAlumnos.has(al.ID);
            const entradasAlumno = df_autoevaluacion.filter((e: any) => e.alumno_id === al.ID);
            return (
              <div key={al.ID} className="border border-[var(--glass-border)] rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleAlumno(al.ID)}
                  className="w-full flex items-center justify-between p-4 bg-foreground/5 hover:bg-foreground/10 transition-colors text-left"
                >
                  <span className="font-semibold text-foreground">{al.Apellidos}, {al.Nombre}</span>
                  <span className="flex items-center gap-3">
                    <span className="text-caption text-muted">{entradasAlumno.length} / {df_ce.length} CE registrados</span>
                    <ChevronDown className={`w-4 h-4 text-muted transition-transform ${abierto ? "rotate-180" : ""}`} />
                  </span>
                </button>
                {abierto && (
                  <div className="p-4 space-y-2 bg-background/50">
                    {df_ce.filter((ce: any) => ce.id_ce).map((ce: any) => {
                      const entry = entryFor(al.ID, ce.id_ce);
                      return (
                        <div key={ce.id_ce} className="flex flex-wrap items-center gap-3 p-2 rounded-lg hover:bg-foreground/5">
                          <div className="w-24 shrink-0">
                            <span className="font-mono text-caption text-info">{ce.id_ce}</span>
                          </div>
                          <div className="flex-1 min-w-[200px] text-caption text-muted truncate" title={ce.desc_ce || ce.Descripción}>
                            {ce.desc_ce || ce.Descripción || ""}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {VALORES.map(v => (
                              <button
                                key={v.valor}
                                onClick={() => upsertEntry(al.ID, ce.id_ce, { valor: v.valor })}
                                className={`px-2.5 py-1 rounded-md text-caption font-semibold border transition-colors ${
                                  entry?.valor === v.valor ? v.cls : "bg-white/5 border-white/10 text-muted hover:bg-white/10"
                                }`}
                              >
                                {v.label}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            value={entry?.dificultades || ""}
                            onChange={(e) => upsertEntry(al.ID, ce.id_ce, { valor: entry?.valor, dificultades: e.target.value })}
                            placeholder="Dificultades (opcional)"
                            className="flex-1 min-w-[160px] bg-foreground/10 border border-[var(--glass-border)] rounded-lg px-2 py-1 text-caption text-foreground focus:border-info focus:outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
