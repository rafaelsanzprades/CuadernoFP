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
  // ind7/ind8: revisión de la propia práctica docente, según el capítulo 9 de
  // Solbes ("Programaciones didácticas para FP") — no evalúan al alumnado,
  // evalúan la programación y la coordinación docente.
  { id: "ind7", category: "Desarrollo", label: "¿Ha habido diferencia relevante entre lo planificado y lo realmente impartido?" },
  { id: "ind8", category: "Desarrollo", label: "¿La programación ha facilitado la coordinación con el resto del equipo docente?" },
  { id: "ind5", category: "Resultados", label: "¿El nivel de éxito escolar (aprobados) es satisfactorio?" },
  { id: "ind6", category: "Resultados", label: "¿El alumnado ha mostrado satisfacción con el módulo?" },
];

export function EqavetTab() {
  const { moduleData, cursoData, updateModuleData } = useAppStore();

  if (!moduleData) return null;

  const eqavet = moduleData.eqavet_evaluacion || {};

  // Dato real ya calculado por Magia › Programación › Planificación (horas
  // previstas vs. impartidas) — se muestra aquí como apoyo al indicador ind7
  // en vez de dejar la autoevaluación puramente subjetiva.
  const df_ud = moduleData.df_ud || [];
  const df_sgmt = (cursoData as any)?.df_sgmt || [];
  const totalPrevisto = df_ud.reduce((acc: number, u: any) => acc + (Number(u.horas_ud) || 0), 0);
  const totalImpartido = df_sgmt.reduce((acc: number, row: any) => {
    const imp = Object.keys(row)
      .filter(k => k.endsWith("_Imp") && k !== "Total_Imp")
      .reduce((s, k) => s + (Number(row[k]) || 0), 0);
    return acc + imp;
  }, 0);
  const pctProgreso = totalPrevisto > 0 ? Math.round((totalImpartido / totalPrevisto) * 100) : null;

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
            <h3 className="text-subheading font-semibold">Calidad EQAVET</h3>
            <p className="text-muted text-body mt-1">
              Marco de Referencia Europeo de Garantía de la Calidad. Autoevaluación del módulo para la memoria final y el ciclo de mejora continua.
            </p>
            <p className="text-muted text-caption mt-2">
              Los indicadores de autoevaluación docente (Planificación / Desarrollo / Resultados) siguen las dimensiones
              del programa <a href="https://www.aneca.es/docentia" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">DOCENTIA de ANECA</a>.
            </p>
          </div>
        </div>
      </Card>

      <MotionWrapper className="space-y-6">
        <Card className="p-6">
          <h3 className="text-subheading font-semibold mb-4 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            Indicadores de Calidad
          </h3>
          
          <div className="space-y-6">
            {["Planificación", "Desarrollo", "Resultados"].map(category => (
              <div key={category}>
                <h4 className="font-medium text-body text-accent tracking-wider mb-3">{category}</h4>
                <div className="space-y-3">
                  {EQAVET_INDICATORS.filter(ind => ind.category === category).map((ind) => (
                    <div key={ind.id} className="p-4 rounded-xl border bg-[var(--glass-bg)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <p className="text-body font-medium">{ind.label}</p>
                        {ind.id === "ind7" && pctProgreso !== null && (
                          <p className="text-caption text-muted mt-1">
                            Dato real (Magia › Programación › Planificación): <span className="font-semibold text-foreground">{pctProgreso}%</span> impartido sobre lo previsto.
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        {scoreOptions.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => handleIndicatorChange(ind.id, opt.value)}
                            className={`px-3 py-1 text-caption rounded-full border transition-colors ${
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
      </MotionWrapper>
    </div>
  );
}
