"use client";
import { CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

// Un par puntos-fuertes/áreas-de-mejora por cada categoría de EqavetTab.tsx
// (Planificación/Desarrollo/Resultados), en vez de un único par global —
// siguiendo el "Autoinforme del solicitante" de DOCENTIA-UO (Anexo 4, Tabla
// 3), que pide reflexionar por dimensión en lugar de en bloque.
const CATEGORIAS = [
  {
    key: "planificacion",
    label: "Planificación",
    fuertesPh: "Ej. Guía docente actualizada y publicada a tiempo, buena coordinación con el resto del equipo, planificación FP Dual ajustada...",
    mejoraPh: "Ej. Difundir mejor el horario de tutorías, mejorar la coordinación con las empresas de FP Dual...",
  },
  {
    key: "desarrollo",
    label: "Desarrollo",
    fuertesPh: "Ej. Buen ajuste de la metodología a las características del grupo, recursos y espacios suficientes...",
    mejoraPh: "Ej. Reforzar la atención a las dificultades detectadas, revisar el cumplimiento del calendario previsto...",
  },
  {
    key: "resultados",
    label: "Resultados",
    fuertesPh: "Ej. Buen rendimiento académico general, alta satisfacción del alumnado con el módulo...",
    mejoraPh: "Ej. Mejorar la evolución de resultados respecto a cursos anteriores...",
  },
];

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
              Puntos fuertes y áreas de mejora, reflexionados por separado en cada dimensión
              (Planificación / Desarrollo / Resultados) para planificar las acciones del próximo curso.
            </p>
          </div>
        </div>
      </Card>

      <MotionWrapper className="space-y-6">
        {CATEGORIAS.map(cat => (
          <Card key={cat.key} className="p-6">
            <h3 className="text-subheading font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              {cat.label}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-body font-medium mb-1">Puntos fuertes (lo que ha funcionado bien)</label>
                <textarea
                  value={eqavet[`puntos_fuertes_${cat.key}`] || ""}
                  onChange={(e) => handleTextChange(`puntos_fuertes_${cat.key}`, e.target.value)}
                  className="w-full h-24 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] p-3 text-body focus:outline-none focus:border-success resize-none transition-colors"
                  placeholder={cat.fuertesPh}
                />
              </div>
              <div>
                <label className="block text-body font-medium mb-1">Áreas de mejora y acciones para el próximo curso</label>
                <textarea
                  value={eqavet[`areas_mejora_${cat.key}`] || ""}
                  onChange={(e) => handleTextChange(`areas_mejora_${cat.key}`, e.target.value)}
                  className="w-full h-24 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] p-3 text-body focus:outline-none focus:border-success resize-none transition-colors"
                  placeholder={cat.mejoraPh}
                />
              </div>
            </div>
          </Card>
        ))}
      </MotionWrapper>
    </div>
  );
}
