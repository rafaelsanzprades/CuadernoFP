"use client";
import { Award, Info, Layers } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useAppStore } from "@/store/useAppStore";

/**
 * TAB "Grados" en /modulo
 * Muestra los 5 grados formativos (A-E) según la Ley 3/2022
 * y permite al docente seleccionar el grado de su módulo.
 */

const GRADOS = [
  {
    grado: "A",
    nombre: "Acreditación parcial de competencia",
    descripcion: "Acredita competencias adquiridas por experiencia laboral o vías no formales.",
    normativa: "Art. 34.1 Ley 3/2022",
    color: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
    icon: "📋",
  },
  {
    grado: "B",
    nombre: "Certificado de competencia",
    descripcion: "Certifica competencias profesionales, personales y sociales en un ámbito productivo.",
    normativa: "Art. 34.2 Ley 3/2022",
    color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
    icon: "🏅",
  },
  {
    grado: "C",
    nombre: "Certificado profesional",
    descripcion: "Acredita la cualificación profesional completa de un nivel 1 o 2 del Catálogo Nacional.",
    normativa: "Art. 34.3 Ley 3/2022",
    color: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
    icon: "🎓",
  },
  {
    grado: "D",
    nombre: "Ciclos formativos (GM/GS)",
    descripcion: "Formación reglada de Grado Medio y Grado Superior. Incluye modalidad dual.",
    normativa: "Art. 35 Ley 3/2022",
    color: "bg-violet-500/10 border-violet-500/30 text-violet-700 dark:text-violet-300",
    icon: "📚",
    activo: true,
  },
  {
    grado: "E",
    nombre: "Cursos de especialización",
    descripcion: "Formación complementaria para titulados de FP. 1000-2000 horas.",
    normativa: "Art. 36 Ley 3/2022",
    color: "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300",
    icon: "⚡",
  },
];

export function GradosTab() {
  const { moduleData, setModuleData } = useAppStore();
  const gradoActual = (moduleData as any)?.grado_formativo || "D";

  const handleSelect = (grado: string) => {
    setModuleData({ ...moduleData, grado_formativo: grado } as any);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20">
        <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">5 Grados Formativos — Ley 3/2022</p>
          <p className="text-sm text-muted mt-1">
            La Ley Orgánica 3/2022 estructura la Formación Profesional en 5 grados (A a E).
            Selecciona el grado que corresponde a tu módulo o programa formativo.
          </p>
        </div>
      </div>

      {/* Info del grado seleccionado */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Award className="w-5 h-5 text-accent" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Grado seleccionado: <span className="text-accent">Grado {gradoActual}</span>
            </p>
            <p className="text-xs text-muted mt-1">
              {GRADOS.find((g) => g.grado === gradoActual)?.nombre}
              {gradoActual === "D" && " — Tu módulo actual pertenece a este grado."}
            </p>
          </div>
        </div>
      </Card>

      {/* Tarjetas de grados */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Layers className="w-6 h-6 text-accent" /> Grados del A al E
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {GRADOS.map((g) => (
            <button
              key={g.grado}
              onClick={() => handleSelect(g.grado)}
              className={`relative text-left p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                gradoActual === g.grado
                  ? "border-accent shadow-lg ring-2 ring-accent/20"
                  : "border-[var(--glass-border)] hover:border-accent/50"
              } ${g.color}`}
            >
              {gradoActual === g.grado && (
                <span className="absolute top-3 right-3 w-3 h-3 rounded-full bg-accent animate-pulse" />
              )}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{g.icon}</span>
                <div>
                  <span className="text-sm font-bold uppercase tracking-wider opacity-70">Grado {g.grado}</span>
                  <h3 className="text-base font-bold text-foreground leading-tight">{g.nombre}</h3>
                </div>
              </div>
              <p className="text-sm text-muted leading-relaxed">{g.descripcion}</p>
              <p className="text-sm font-semibold text-muted/80 mt-3 font-mono">{g.normativa}</p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
