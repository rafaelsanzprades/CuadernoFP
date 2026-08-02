import React from "react";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { NarrativeField } from "@/components/ui/NarrativeField";
import { Scale } from "lucide-react";

export function ProcedimientosTab() {
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
        </div>
      </div>
    </MotionWrapper>
  );
}
