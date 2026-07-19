"use client";
import { Info, CheckCircle2, Award, ClipboardCheck } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

const EQAVET_INDICATORS = [
  { id: "ind1", category: "Planificación", label: "¿La programación se ha ajustado a las necesidades del sector productivo?" },
  { id: "ind2", category: "Planificación", label: "¿Se han planificado adecuadamente las actividades de FP Dual?" },
  { id: "ind3", category: "Desarrollo", label: "¿La metodología empleada ha fomentado el aprendizaje activo?" },
  { id: "ind4", category: "Desarrollo", label: "¿Los recursos y espacios han sido suficientes y adecuados?" },
  { id: "ind5", category: "Resultados", label: "¿El nivel de éxito escolar (aprobados) es satisfactorio?" },
  { id: "ind6", category: "Resultados", label: "¿El alumnado ha mostrado satisfacción con el módulo?" },
];

export function EqavetTab() {
  const { moduleData, updateModuleData } = useAppStore();

  if (!moduleData) return null;

  const eqavet = moduleData.eqavet_evaluacion || {};

  const handleIndicatorChange = (id: string, value: string) => {
    updateModuleData("eqavet_evaluacion", { ...eqavet, [id]: value });
  };

  const handleTextChange = (id: string, value: string) => {
    updateModuleData("eqavet_evaluacion", { ...eqavet, [id]: value });
  };

  const scoreOptions = [
    { value: "1", label: "Mejorable" },
    { value: "2", label: "Suficiente" },
    { value: "3", label: "Bueno" },
    { value: "4", label: "Excelente" },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-accent/5 border-accent/20">
        <div className="flex items-start gap-4">
          <Award className="w-6 h-6 text-accent mt-1" />
          <div>
            <h3 className="text-lg font-semibold">Calidad EQAVET</h3>
            <p className="text-muted text-sm mt-1">
              Marco de Referencia Europeo de Garantía de la Calidad. Autoevaluación del módulo para la memoria final y el ciclo de mejora continua.
            </p>
          </div>
        </div>
      </Card>

      <MotionWrapper className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            Indicadores de Calidad
          </h3>
          
          <div className="space-y-6">
            {["Planificación", "Desarrollo", "Resultados"].map(category => (
              <div key={category}>
                <h4 className="font-medium text-sm text-accent uppercase tracking-wider mb-3">{category}</h4>
                <div className="space-y-3">
                  {EQAVET_INDICATORS.filter(ind => ind.category === category).map((ind) => (
                    <div key={ind.id} className="p-4 rounded-xl border bg-[var(--glass-bg)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <p className="text-sm font-medium flex-1">{ind.label}</p>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        {scoreOptions.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => handleIndicatorChange(ind.id, opt.value)}
                            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                              eqavet[ind.id] === opt.value
                                ? 'bg-accent/20 border-accent text-accent'
                                : 'bg-transparent border-white/10 text-muted hover:border-white/30'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Propuestas de Mejora (PDCA)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Puntos Fuertes (Lo que ha funcionado bien)</label>
              <textarea
                value={eqavet.puntos_fuertes || ""}
                onChange={(e) => handleTextChange("puntos_fuertes", e.target.value)}
                className="w-full h-24 rounded-lg bg-[var(--glass-bg)] border border-white/10 p-3 text-sm focus:outline-none focus:border-accent resize-none"
                placeholder="Ej. La implicación del alumnado en los proyectos..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Áreas de Mejora y Acciones para el próximo curso</label>
              <textarea
                value={eqavet.areas_mejora || ""}
                onChange={(e) => handleTextChange("areas_mejora", e.target.value)}
                className="w-full h-24 rounded-lg bg-[var(--glass-bg)] border border-white/10 p-3 text-sm focus:outline-none focus:border-accent resize-none"
                placeholder="Ej. Incluir más prácticas con material real, actualizar documentación..."
              />
            </div>
          </div>
        </Card>
      </MotionWrapper>
    </div>
  );
}
