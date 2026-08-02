"use client";
import { CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

export function PropuestasTab() {
  const { moduleData, updateModuleData } = useAppStore();

  if (!moduleData) return null;

  const eqavet = moduleData.eqavet_evaluacion || {};

  const handleTextChange = (id: string, value: string) => {
    updateModuleData("eqavet_evaluacion", { ...eqavet, [id]: value });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-success/5 border-success/20">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="w-6 h-6 text-success mt-1" />
          <div>
            <h3 className="text-subheading font-semibold">Propuestas de Mejora (PDCA)</h3>
            <p className="text-muted text-body mt-1">
              Registro de puntos fuertes y áreas de mejora para planificar las acciones del próximo curso.
            </p>
          </div>
        </div>
      </Card>

      <MotionWrapper className="space-y-6">
        <Card className="p-6">
          <h3 className="text-subheading font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Propuestas de Mejora (PDCA)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-body font-medium mb-1">Puntos fuertes (lo que ha funcionado bien)</label>
              <textarea
                value={eqavet.puntos_fuertes || ""}
                onChange={(e) => handleTextChange("puntos_fuertes", e.target.value)}
                className="w-full h-24 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] p-3 text-body focus:outline-none focus:border-success resize-none transition-colors"
                placeholder="Ej. La implicación del alumnado en los proyectos..."
              />
            </div>
            <div>
              <label className="block text-body font-medium mb-1">Áreas de mejora y acciones para el próximo curso</label>
              <textarea
                value={eqavet.areas_mejora || ""}
                onChange={(e) => handleTextChange("areas_mejora", e.target.value)}
                className="w-full h-24 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] p-3 text-body focus:outline-none focus:border-success resize-none transition-colors"
                placeholder="Ej. Incluir más prácticas con material real, actualizar documentación..."
              />
            </div>
          </div>
        </Card>
      </MotionWrapper>
    </div>
  );
}
