"use client";
import { Globe, Info, Plane, Users, Building2, MapPin, ArrowRight } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

/**
 * Página /internacionalizacion — Internacionalización
 * Eje 12 del Sistema Estatal: 3 indicadores
 * Programas Erasmus+, movilidades, centros asociados
 */

const INDICADORES = [
  { id: "12.1", nombre: "Movilidades de estudiantes", descripcion: "Número de movilidades por familia profesional, sexo y edad.", icon: Plane },
  { id: "12.2", nombre: "Movilidades de profesorado", descripcion: "Estancias formativas y docentes en el extranjero.", icon: Users },
  { id: "12.3", nombre: "Centros asociados", descripcion: "Número de centros de FP en el extranjero vinculados.", icon: Building2 },
];

const PROGRAMAS = [
  { nombre: "Erasmus+ FP", descripcion: "Movilidad de estudiantes y profesorado en países europeos.", activo: true },
  { nombre: "Erasmus Pro", descripcion: "Movilidad de larga duración para alumnado de FP (90 días a 1 año).", activo: false },
  { nombre: "FP Dual Internacional", descripcion: "Formación dual con empresas en el extranjero.", activo: false },
  { nombre: "Proyectos de Innovación", descripcion: "Cooperación internacional en proyectos de innovación FP.", activo: false },
];

export default function InternacionalizacionPage() {
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
                <Globe className="w-6 h-6 text-accent" /> Internacionalización
              </h1>
              <p className="text-muted mt-2 text-lg">Programas de movilidad y cooperación (Eje 12).</p>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20">
              <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Ley 3/2022 — Internacionalización de la FP</p>
                <p className="text-sm text-muted mt-1">
                  La nueva ley promueve la internacionalización mediante programas de movilidad,
                  proyectos de cooperación y la creación de centros de FP en el extranjero.
                </p>
              </div>
            </div>

            {/* Indicadores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {INDICADORES.map((ind) => {
                const Icon = ind.icon;
                return (
                  <Card key={ind.id} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-accent font-mono">{ind.id}</span>
                        <h3 className="text-sm font-bold text-foreground">{ind.nombre}</h3>
                      </div>
                    </div>
                    <p className="text-xs text-muted">{ind.descripcion}</p>
                    <span className="inline-block mt-3 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      ⏳ Pendiente de datos
                    </span>
                  </Card>
                );
              })}
            </div>

            {/* Programas */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Plane className="w-4 h-4 text-accent" /> Programas de movilidad disponibles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PROGRAMAS.map((prog, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-foreground/5 border border-[var(--glass-border)]">
                    <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${prog.activo ? "bg-green-500" : "bg-gray-400"}`} />
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{prog.nombre}</h4>
                      <p className="text-xs text-muted mt-1">{prog.descripcion}</p>
                      <span className={`text-[10px] font-bold mt-1 inline-block ${prog.activo ? "text-green-500" : "text-muted"}`}>
                        {prog.activo ? "✓ Activo" : "No disponible"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Mapa placeholder */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-accent" />
                <h3 className="text-sm font-bold text-foreground">Destinos de movilidad</h3>
              </div>
              <div className="h-48 rounded-xl bg-foreground/5 border border-dashed border-[var(--glass-border)] flex items-center justify-center">
                <p className="text-sm text-muted">Mapa de destinos — Próximamente</p>
              </div>
            </Card>
          </MotionWrapper>
        </div>
      </div>
    </div>
  );
}
