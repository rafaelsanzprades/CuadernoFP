"use client";
import { Award, Info, Users, FileText, CheckCircle2, Search, ClipboardList } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

/**
 * Página /acreditacion — Acreditación de Competencias
 * Eje 8 del Sistema Estatal: 7 indicadores
 * Fases: Solicitud → Asesoramiento → Evaluación → Acreditación → Reconocimiento
 */

const FASES = [
  { id: 1, nombre: "Solicitud", descripcion: "La persona interesada presenta la solicitud de acreditación.", icon: FileText },
  { id: 2, nombre: "Asesoramiento", descripcion: "Una persona asesora analiza la experiencia y propone un itinerario.", icon: Search },
  { id: 3, nombre: "Evaluación", descripcion: "Una persona evaluadora verifica las competencias alegadas.", icon: ClipboardList },
  { id: 4, nombre: "Acreditación", descripcion: "Se emite el certificado de profesionalidad o acreditación parcial.", icon: Award },
  { id: 5, nombre: "Reconocimiento", descripcion: "Las competencias acreditadas se reconocen en el sistema educativo.", icon: CheckCircle2 },
];

const INDICADORES = [
  { id: "8.1", nombre: "Personas asesoras", descripcion: "Número de personas asesoras por centro y familia profesional." },
  { id: "8.2", nombre: "Personas evaluadoras", descripcion: "Número de personas evaluadoras por centro y familia profesional." },
  { id: "8.3", nombre: "Estándares acreditados", descripcion: "Número de estándares de competencia acreditados." },
  { id: "8.4", nombre: "Ratio estándares/persona", descripcion: "Media de estándares acreditados por persona." },
  { id: "8.5", nombre: "Tasa de acreditación", descripcion: "Porcentaje de personas que obtienen la acreditación." },
  { id: "8.6", nombre: "Reconocimiento", descripcion: "Número de reconocimientos de competencias acreditadas." },
  { id: "8.7", nombre: "Perfil sociodemográfico", descripcion: "Distribución por sexo, edad y nacionalidad." },
];

export default function AcreditacionPage() {
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
                <Award className="w-6 h-6 text-accent" /> Acreditación de Competencias
              </h1>
              <p className="text-muted mt-2 text-lg">Procedimiento de acreditación y reconocimiento de CPPS (Eje 8).</p>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20">
              <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Procedimiento RD 1224/2009 modificado por RD 69/2025</p>
                <p className="text-sm text-muted mt-1">
                  El procedimiento de acreditación tiene 5 fases. Los centros de FP pueden participar como centros de evaluación.
                </p>
              </div>
            </div>

            {/* Fases del procedimiento */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-foreground mb-4">Fases del Procedimiento</h3>
              <div className="flex flex-col gap-3">
                {FASES.map((fase, i) => {
                  const Icon = fase.icon;
                  return (
                    <div key={fase.id} className="flex items-start gap-4 p-4 rounded-xl bg-foreground/5 border border-[var(--glass-border)]">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-accent">Fase {fase.id}</span>
                          <h4 className="text-sm font-bold text-foreground">{fase.nombre}</h4>
                        </div>
                        <p className="text-xs text-muted mt-1">{fase.descripcion}</p>
                      </div>
                      {i < FASES.length - 1 && (
                        <span className="text-accent text-lg hidden sm:block">↓</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Indicadores */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-4">7 Indicadores del Eje 8</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {INDICADORES.map((ind) => (
                  <Card key={ind.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold text-accent font-mono shrink-0">{ind.id}</span>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{ind.nombre}</h4>
                        <p className="text-xs text-muted mt-1">{ind.descripcion}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="p-5">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-muted" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Gestión de personas asesoras y evaluadoras</p>
                  <p className="text-xs text-muted mt-1">
                    Próximamente: registro de personas asesoras y evaluadoras asignadas al centro,
                    con seguimiento de estándares evaluados y resultados.
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
