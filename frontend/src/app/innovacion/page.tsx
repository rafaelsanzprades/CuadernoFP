"use client";
import { Sparkles, Info, Lightbulb, Rocket, Users, Building2, FileText, Award } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

/**
 * Página /innovacion - Innovación y Emprendimiento
 * Indicador 7.3 del Sistema Estatal
 * Proyectos de innovación, emprendimiento, Hubs de FP
 */

const TIPOS_PROYECTO = [
  { nombre: "Proyecto de innovación", descripcion: "Proyectos colaborativos entre centro y empresa para innovar en procesos o productos.", icon: Lightbulb, color: "bg-blue-500/10 border-blue-500/30" },
  { nombre: "Proyecto emprendedor", descripcion: "Plan de negocio desarrollado por el alumnado como proyecto final de ciclo.", icon: Rocket, color: "bg-emerald-500/10 border-emerald-500/30" },
  { nombre: "Hub de FP", descripcion: "Espacio de innovación compartido entre centro educativo, empresa y administración.", icon: Building2, color: "bg-violet-500/10 border-violet-500/30" },
  { nombre: "Coordinación de innovación", descripcion: "Figura del coordinador o coordinadora de innovación en el centro.", icon: Users, color: "bg-amber-500/10 border-amber-500/30" },
];

const INDICADORES = [
  { id: "7.3", nombre: "Proyectos de emprendimiento e innovación", descripcion: "Número de proyectos activos por centro y familia profesional." },
  { id: "7.3a", nombre: "Proyectos finales emprendedores", descripcion: "Número de proyectos finales con componente emprendedor." },
  { id: "7.3b", nombre: "Hubs de FP activos", descripcion: "Número de hubs de innovación vinculados al centro." },
];

export default function InnovacionPage() {
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
                <Sparkles className="w-6 h-6 text-accent" /> Innovación y Emprendimiento
              </h1>
              <p className="text-muted mt-2 text-lg">Proyectos de innovación y emprendimiento (Ind. 7.3).</p>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20">
              <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Ley 3/2022 - Emprendimiento obligatorio</p>
                <p className="text-sm text-muted mt-1">
                  La ley establece que todos los ciclos formativos deben incluir un módulo de
                  emprendimiento y que los proyectos finales deben tener componente emprendedor.
                </p>
              </div>
            </div>

            {/* Tipos de proyectos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TIPOS_PROYECTO.map((tipo, i) => {
                const Icon = tipo.icon;
                return (
                  <Card key={i} className={`p-5 hover:shadow-md transition-shadow border ${tipo.color}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{tipo.nombre}</h3>
                        <p className="text-xs text-muted mt-1">{tipo.descripcion}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Indicadores */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-accent" /> Indicadores de innovación
              </h3>
              <div className="space-y-3">
                {INDICADORES.map((ind) => (
                  <div key={ind.id} className="flex items-start gap-3 p-3 rounded-lg bg-foreground/5 border border-[var(--glass-border)]">
                    <span className="text-xs font-bold text-accent font-mono shrink-0">{ind.id}</span>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{ind.nombre}</h4>
                      <p className="text-xs text-muted mt-1">{ind.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Registro de proyectos */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-5 h-5 text-accent" />
                <h3 className="text-sm font-bold text-foreground">Registro de proyectos</h3>
              </div>
              <p className="text-xs text-muted">
                Próximamente: registro de proyectos de innovación y emprendimiento del centro,
                con seguimiento de fases, participantes y resultados.
              </p>
            </Card>
          </MotionWrapper>
        </div>
      </div>
    </div>
  );
}

