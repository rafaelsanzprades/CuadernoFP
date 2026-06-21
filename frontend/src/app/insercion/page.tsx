"use client";
import { TrendingUp, Info, Building2, Users, Briefcase, BarChart3, Globe } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

/**
 * Página /insercion — Inserción Laboral
 * Indicadores Eje 6 del Sistema Estatal:
 * Tasa de afiliación, rama de actividad, tamaño empresa, régimen de afiliación
 */

const INDICADORES = [
  { id: "6.1", nombre: "Tasa de afiliación media de graduados", descripcion: "Porcentaje de titulados afiliados a la Seguridad Social en los 3 años posteriores a la finalización.", icon: TrendingUp, estado: "pendiente" },
  { id: "6.2", nombre: "Afiliación por rama de actividad", descripcion: "Distribución de titulados afiliados por rama de actividad económica.", icon: Building2, estado: "pendiente" },
  { id: "6.3", nombre: "Tamaño de empresa", descripcion: "Distribución por micro, pequeña, mediana y gran empresa.", icon: Users, estado: "pendiente" },
  { id: "6.4", nombre: "Régimen de afiliación", descripcion: "Cuenta ajena vs cuenta propia (autónomos).", icon: Briefcase, estado: "pendiente" },
];

const RAMAS = [
  "Agricultura, ganadería, silvicultura y pesca",
  "Industria",
  "Construcción",
  "Comercio, transporte y hostelería",
  "Información y comunicaciones",
  "Actividades financieras e inmobiliarias",
  "Actividades profesionales",
  "Administración pública, educación y sanidad",
];

export default function InsercionPage() {
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
                <TrendingUp className="w-6 h-6 text-accent" /> Inserción Laboral
              </h1>
              <p className="text-muted mt-2 text-lg">Inserción laboral de titulados (Eje 6).</p>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20">
              <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Fuente de datos: SEPE e INE</p>
                <p className="text-sm text-muted mt-1">
                  Los datos de inserción provienen de la Seguridad Social (SEPE) y el INE.
                  Cuando haya API pública disponible, se integrarán automáticamente.
                  De momento, puedes importar datos manualmente.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INDICADORES.map((ind) => {
                const Icon = ind.icon;
                return (
                  <Card key={ind.id} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-accent font-mono">{ind.id}</span>
                        <h3 className="text-sm font-bold text-foreground">{ind.nombre}</h3>
                        <p className="text-xs text-muted mt-1">{ind.descripcion}</p>
                        <span className="inline-block mt-2 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          ⏳ Pendiente de datos
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <Card className="p-5">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-accent" /> Ramas de actividad económica
              </h3>
              <p className="text-xs text-muted mb-3">
                Clasificación de ramas donde se insertan los titulados (indicador 6.2):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {RAMAS.map((rama, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent/40 shrink-0" />
                    {rama}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-accent" /> Importar datos del SEPE
              </h3>
              <p className="text-xs text-muted">
                Próximamente: importación de datos de afiliación desde ficheros del SEPE.
                Los datos se cruzarán con el alumnado del centro para calcular tasas de inserción por titulación.
              </p>
            </Card>
          </MotionWrapper>
        </div>
      </div>
    </div>
  );
}
