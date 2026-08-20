"use client";
import { Award, Info, Layers } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";

/**
 * TAB "Grados" en /modulo
 * Muestra los 5 grados formativos (A-E) según la Ley 3/2022
 * y permite al profesorado seleccionar el grado de su módulo.
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

export function TabGrados() {
  const { t } = useTranslation();
  const { moduleData, setModuleData } = useAppStore();
  const gradoActual = (moduleData as any)?.grado_formativo || "D";

  const handleSelect = (grado: string) => {
    setModuleData({ ...moduleData, grado_formativo: grado } as any);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      {/* Tarjetas de grados */}
      <Card className="p-6">
        <h2 className="text-subheading font-bold text-foreground mb-6 flex items-center gap-2">
          <Layers className="w-6 h-6 text-accent" /> {t('checks.catalogo.gradosDelAAlE', {defaultValue: 'Grados del A al E'})}
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
                <span className="text-heading">{g.icon}</span>
                <div>
                  <span className="text-body font-bold tracking-wider opacity-70">{t('checks.catalogo.grado', {defaultValue: 'Grado'})} {g.grado}</span>
                  <h3 className="text-body font-bold text-foreground leading-tight">{t(`checks.catalogo.gradoNombre_${g.grado}`, {defaultValue: g.nombre})}</h3>
                </div>
              </div>
              <p className="text-body text-muted leading-relaxed">{t(`checks.catalogo.gradoDesc_${g.grado}`, {defaultValue: g.descripcion})}</p>
              <p className="text-body font-semibold text-muted/80 mt-3 font-mono">{g.normativa}</p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

