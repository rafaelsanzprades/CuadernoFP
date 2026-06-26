"use client";
import { Shield, Info, CheckCircle2, Target, BarChart3, FileText, RefreshCw } from "lucide-react";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

/**
 * Página /calidad - Calidad del Centro (Marco EQAVET)
 * Ciclo de mejora continua: Planificación → Implementación → Evaluación → Revisión
 * 5 dimensiones: Pertinencia, Eficacia, Eficiencia, Impacto social, Sostenibilidad
 */

const DIMENSIONES = [
  { id: "pertinencia", nombre: "Pertinencia", descripcion: "¿Las enseñanzas responden a las necesidades del sistema productivo?", color: "bg-blue-500/10 border-blue-500/30" },
  { id: "eficacia", nombre: "Eficacia", descripcion: "¿Se alcanzan los objetivos de aprendizaje establecidos?", color: "bg-emerald-500/10 border-emerald-500/30" },
  { id: "eficiencia", nombre: "Eficiencia", descripcion: "¿Se optimizan los recursos disponibles?", color: "bg-amber-500/10 border-amber-500/30" },
  { id: "impacto", nombre: "Impacto social", descripcion: "¿Qué efecto tiene la formación en la empleabilidad?", color: "bg-violet-500/10 border-violet-500/30" },
  { id: "sostenibilidad", nombre: "Sostenibilidad", descripcion: "¿El modelo es viable a largo plazo?", color: "bg-rose-500/10 border-rose-500/30" },
];

const CICLO = [
  { fase: "1. Planificación", descripcion: "Definir objetivos de calidad del curso", icon: Target, completado: false },
  { fase: "2. Implementación", descripcion: "Ejecutar acciones formativas planificadas", icon: FileText, completado: false },
  { fase: "3. Evaluación", descripcion: "Autoevaluación del centro con rúbricas EQAVET", icon: BarChart3, completado: false },
  { fase: "4. Revisión", descripcion: "Plan de mejora con acciones correctivas", icon: RefreshCw, completado: false },
];

export default function CalidadPage() {
  const [dimensionActiva, setDimensionActiva] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen bg-background relative">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-8 pb-12">
            <div className="bg-warning/10 border-l-4 border-warning text-warning p-4 rounded-r-xl flex items-center gap-3 mb-6">
              <span className="text-2xl">🚧</span>
              <div>
                <h3 className="font-bold">Sección en Construcción</h3>
                <p className="text-sm">Estamos trabajando en esta funcionalidad para la próxima versión.</p>
              </div>
            </div>
            <div>
              <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Shield className="w-6 h-6 text-accent" /> Calidad del Centro
              </h1>
              <p className="text-muted mt-2 text-lg">Autoevaluación y mejora continua (EQAVET).</p>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20">
              <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Marco EQAVET - Ciclo de Mejora Continua</p>
                <p className="text-sm text-muted mt-1">
                  El Marco Común establece un ciclo de 4 fases y 5 dimensiones de calidad.
                  Cada dimensión se evalúa con rúbricas de 0 a 4 niveles de madurez.
                </p>
              </div>
            </div>

            {/* Ciclo de mejora continua */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-foreground mb-4">Ciclo de Mejora Continua</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {CICLO.map((fase, i) => {
                  const Icon = fase.icon;
                  return (
                    <div key={i} className="relative p-4 rounded-xl border border-[var(--glass-border)] bg-foreground/5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-accent" />
                        </div>
                        <span className="text-xs font-bold text-accent">Fase {i + 1}</span>
                      </div>
                      <h4 className="text-sm font-bold text-foreground">{fase.fase}</h4>
                      <p className="text-xs text-muted mt-1">{fase.descripcion}</p>
                      {i < CICLO.length - 1 && (
                        <span className="hidden lg:block absolute top-1/2 -right-3 text-accent text-lg">→</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* 5 Dimensiones */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-4">5 Dimensiones de Calidad</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DIMENSIONES.map((dim) => (
                  <button
                    key={dim.id}
                    onClick={() => setDimensionActiva(dimensionActiva === dim.id ? null : dim.id)}
                    className={`text-left p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                      dimensionActiva === dim.id
                        ? "border-accent shadow-lg ring-2 ring-accent/20"
                        : "border-[var(--glass-border)] hover:border-accent/50"
                    } ${dim.color}`}
                  >
                    <h4 className="text-sm font-bold text-foreground">{dim.nombre}</h4>
                    <p className="text-xs text-muted mt-1">{dim.descripcion}</p>
                    {dimensionActiva === dim.id && (
                      <div className="mt-3 pt-3 border-t border-[var(--glass-border)]">
                        <p className="text-xs text-muted">Rúbrica de evaluación pendiente de configurar.</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Estado */}
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-muted" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Estado: Configuración inicial</p>
                  <p className="text-xs text-muted mt-1">
                    Completa las 4 fases del ciclo y evalúa las 5 dimensiones para generar el informe de calidad del centro.
                  </p>
                </div>
              </div>
            </Card>
          </MotionWrapper>
        </div>
      </div>
    </div>
  );
}

