"use client";
import React from "react";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { NarrativeField } from "@/components/ui/NarrativeField";
import { useAppStore } from "@/store/useAppStore";
import { Scale } from "lucide-react";

const MODELO_RECUPERACION = [
  { id: "R1", label: "R1 — Recuperación tras 1ª evaluación" },
  { id: "R2", label: "R2 — Recuperación tras 2ª evaluación" },
  { id: "R3", label: "R3 — Recuperación tras 3ª evaluación / final ordinaria" },
  { id: "RF", label: "RF — Recuperación final (tras impartir todas las UD)" },
  { id: "EvFE", label: "EvFE — Evaluación final extraordinaria (segunda convocatoria)" },
];

export function ProcedimientosTab() {
  const { moduleData, updateModuleData } = useAppStore();
  const config_contexto = moduleData?.config_contexto || {};

  const handleChange = (field: string, value: any) => {
    updateModuleData("config_contexto", { ...config_contexto, [field]: value });
  };

  const modelo_recuperacion = config_contexto.modelo_recuperacion || [];

  const toggleModelo = (id: string) => {
    const updated = modelo_recuperacion.includes(id)
      ? modelo_recuperacion.filter((m: string) => m !== id)
      : [...modelo_recuperacion, id];
    handleChange("modelo_recuperacion", updated);
  };

  return (
    <MotionWrapper>
      <div className="space-y-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-subheading font-bold text-[var(--text-primary)]">Procedimientos normativos</h2>
            <p className="text-body text-muted-foreground">Configura los aspectos normativos y burocráticos de la evaluación para la Programación Didáctica.</p>
          </div>
        </div>

        <div className="glass-card p-6 border-t-4 border-t-rose-500">
          <h2 className="text-subheading font-bold text-foreground mb-1">Modelo de recuperación</h2>
          <p className="text-caption text-muted mb-3">
            Marca los tipos de recuperación/convocatoria extraordinaria que aplicas en este módulo, según el modelo
            R1/R2/R3/RF/EvFE del autor de PD+. <strong>Primera versión</strong>: esto documenta tu modelo en la
            programación, pero el cálculo automático de notas siguiendo este esquema (indicador → directo a RA,
            saltando CE) todavía no está implementado en Calificaciones.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            {MODELO_RECUPERACION.map((m) => {
              const isSelected = modelo_recuperacion.includes(m.id);
              return (
                <label key={m.id} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${isSelected ? 'bg-rose-500/10 border-rose-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleModelo(m.id)}
                    className="rounded border-white/20 bg-transparent text-rose-500 focus:ring-rose-500"
                  />
                  <span className="text-caption">{m.label}</span>
                </label>
              );
            })}
          </div>
          <textarea
            value={config_contexto.texto_modelo_recuperacion || ""}
            onChange={e => handleChange("texto_modelo_recuperacion", e.target.value)}
            placeholder="Describe cómo aplicas estas recuperaciones: qué cubren, cómo se pondera cada una..."
            className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
          />
        </div>

        <NarrativeField
          id="textos_pd_eval_informacion"
          title="Información al alumnado y familias"
          description="Cómo se dan a conocer los criterios de evaluación y calificación."
        />
        <NarrativeField
          id="textos_pd_eval_perdida_continua"
          title="Pérdida de evaluación continua"
          description="Criterios de asistencia y procedimiento cuando se pierde el derecho."
        />
        <NarrativeField
          id="textos_pd_eval_recuperacion"
          title="Procedimiento de recuperación"
          description="Cómo se recuperan las partes no superadas y formato de las pruebas extraordinarias."
        />
        <NarrativeField
          id="textos_pd_eval_pendientes"
          title="Plan de recuperación de módulos pendientes"
          description="Organización para alumnado de 2º curso con este módulo pendiente."
        />

        <div className="glass-card p-6 border-t-4 border-t-teal-500">
          <h2 className="text-subheading font-bold text-foreground mb-1">Criterios de calificación (texto específico modelo Simplificado, pd=)</h2>
          <p className="text-caption text-muted mb-3">Si se deja vacío, se genera automáticamente. Criterios de calificación y redondeo del módulo.</p>
          <textarea
            value={config_contexto.texto_criterios_calificacion || ""}
            onChange={e => handleChange("texto_criterios_calificacion", e.target.value)}
            placeholder="Criterios de calificación y redondeo del módulo."
            className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
          />
        </div>
      </div>
    </MotionWrapper>
  );
}
