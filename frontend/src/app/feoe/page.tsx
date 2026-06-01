"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

export default function FeoePage() {
  const [activeTab, setActiveTab] = useState("empresas");

  const TABS = [
    { id: "empresas", label: "🏢 Empresas FEOE", cleanLabel: "Empresas FEOE" },
    { id: "alumnos", label: "👥 Asignación Alumnos", cleanLabel: "Asignación Alumnos" },
    { id: "seguimiento", label: "📋 Seguimiento Dual/FCT", cleanLabel: "Seguimiento Dual/FCT" }
  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-8 pb-12">
            {/* Title */}
            <div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                🏢 Prácticas FEOE
              </h1>
              <p className="text-muted mt-2 text-lg">
                Gestión de la asignación de empresas, alumnos y tutores de prácticas duales y FCT.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[var(--glass-border)] overflow-x-auto scrollbar-hide">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-accent text-accent'
                      : 'border-transparent text-muted hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Empresas FEOE */}
            {activeTab === "empresas" && (
              <Card className="p-12 text-center text-muted border border-[var(--glass-border)] rounded-xl bg-foreground/5">
                <h2 className="text-2xl font-bold mb-4 text-foreground">Gestión de Empresas</h2>
                <p className="max-w-xl mx-auto">
                  Esta sección estará disponible próximamente para la gestión del catálogo de empresas colaboradoras, convenios activos y datos de contacto de los tutores de empresa.
                </p>
              </Card>
            )}

            {/* Tab 2: Asignación Alumnos */}
            {activeTab === "alumnos" && (
              <Card className="p-12 text-center text-muted border border-[var(--glass-border)] rounded-xl bg-foreground/5">
                <h2 className="text-2xl font-bold mb-4 text-foreground">Asignación de Alumnos</h2>
                <p className="max-w-xl mx-auto">
                  Esta sección estará disponible próximamente para asociar a cada estudiante con una empresa, asignar su tutor docente y configurar el periodo de prácticas.
                </p>
              </Card>
            )}

            {/* Tab 3: Seguimiento */}
            {activeTab === "seguimiento" && (
              <Card className="p-12 text-center text-muted border border-[var(--glass-border)] rounded-xl bg-foreground/5">
                <h2 className="text-2xl font-bold mb-4 text-foreground">Seguimiento FCT / Dual</h2>
                <p className="max-w-xl mx-auto">
                  Esta sección estará disponible próximamente para registrar las horas realizadas por los alumnos, las visitas de seguimiento y la valoración final de las prácticas.
                </p>
              </Card>
            )}
          </MotionWrapper>
        </div>
      </div>
    </div>
  );
}
