"use client";
import { BarChart3, Info, TrendingUp, Users, GraduationCap, Building2, Globe, Wrench } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

/**
 * Página /indicadores - Dashboard de Indicadores del Sistema Estatal
 * 12 ejes × 34 indicadores de Evaluación y Calidad de la FP
 */

const EJES = [
  { id: 1, nombre: "Demanda de enseñanzas", indicadores: ["1.1 Tasa bruta de escolarización", "1.2 Tasa neta de escolarización", "1.3 Satisfacción del alumnado", "1.4 Itinerario formativo", "1.5 Tasa de abandono"], icon: Users },
  { id: 2, nombre: "Oferta de enseñanzas", indicadores: ["2.1 Centros que imparten FP", "2.2 Grupos por nivel", "2.3 Alumnado por grupo"], icon: GraduationCap },
  { id: 3, nombre: "Empresas y organismos", indicadores: ["3.1 Empresas de FP Dual", "3.2 Alumnado en Dual"], icon: Building2 },
  { id: 4, nombre: "Profesorado", indicadores: ["4.1 Ratio profesorado/alumnado", "4.2 Personal no docente", "4.3 Formación permanente"], icon: Users },
  { id: 5, nombre: "Inversión y financiación", indicadores: ["5.1 Gasto por estudiante"], icon: TrendingUp },
  { id: 6, nombre: "Inserción profesional", indicadores: ["6.1 Tasa de afiliación graduados", "6.2 Afiliación por rama", "6.3 Tamaño empresa", "6.4 Régimen de afiliación"], icon: TrendingUp },
  { id: 7, nombre: "Digitalización y sostenibilidad", indicadores: ["7.1 Módulos digitalización", "7.2 Módulos sostenibilidad", "7.3 Proyectos emprendimiento"], icon: Wrench },
  { id: 8, nombre: "Acreditación de competencias", indicadores: ["8.1 Personas asesoras", "8.2 Personas evaluadoras", "8.3 Estándares acreditados", "8.4 Ratio estándares/persona", "8.5 Tasa acreditación", "8.6 Reconocimiento", "8.7 Perfil sociodemográfico"], icon: GraduationCap },
  { id: 9, nombre: "Financiación", indicadores: ["9.1 Gasto por estudiante"], icon: TrendingUp },
  { id: 10, nombre: "Orientación profesional", indicadores: ["10.1 Servicios de orientación"], icon: Info },
  { id: 11, nombre: "Equidad", indicadores: ["11.1 Necesidades específicas de apoyo"], icon: Users },
  { id: 12, nombre: "Internacionalización", indicadores: ["12.1 Movilidades estudiantes", "12.2 Movilidades profesorado", "12.3 Centros asociados"], icon: Globe },
];

export default function IndicadoresPage() {
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
                <BarChart3 className="w-6 h-6 text-accent" /> Indicadores de Calidad
              </h1>
              <p className="text-muted mt-2 text-lg">Indicadores del Sist. Estatal de Evaluación y Calidad.</p>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20">
              <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Sistema Estatal de Indicadores - Junio 2025</p>
                <p className="text-sm text-muted mt-1">
                  12 ejes temáticos, 34 indicadores. Los datos se mostrarán conforme se vayan integrando fuentes externas (SEPE, INE, BOE).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {EJES.map((eje) => {
                const Icon = eje.icon;
                return (
                  <Card key={eje.id} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-accent">Eje {eje.id}</span>
                        <h3 className="text-sm font-bold text-foreground">{eje.nombre}</h3>
                      </div>
                    </div>
                    <ul className="space-y-1">
                      {eje.indicadores.map((ind, i) => (
                        <li key={i} className="text-xs text-muted flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent/40 shrink-0" />
                          {ind}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 pt-3 border-t border-[var(--glass-border)]">
                      <span className="text-[10px] text-muted/60 font-mono">Pendiente de datos</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </MotionWrapper>
        </div>
      </div>
    </div>
  );
}

