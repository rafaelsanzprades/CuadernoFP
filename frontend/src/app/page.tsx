"use client";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { BarChart3 } from "lucide-react";
import { DashboardKPIs } from "@/components/features/dashboard/DashboardKPIs";
import { DashboardCharts } from "@/components/features/dashboard/DashboardCharts";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

export default function Dashboard() {
  const { moduleData, cursoData } = useAppStore();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />

        <div className="flex-1 p-8 pt-4 overflow-y-auto">
          <div className="space-y-8 pb-12">

            {/* --- DASHBOARD INICIAL --- */}
            {moduleData || cursoData ? (
              <MotionWrapper className="space-y-6">
                <div>
                  <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3 mb-2">
                    <BarChart3 className="w-10 h-10 text-accent" /> Inicio
                  </h1>
                  <p className="text-muted">Panel de control con las métricas clave de tu módulo y curso activos.</p>
                </div>

                <DashboardKPIs cursoData={cursoData} moduleData={moduleData} />
                <DashboardCharts cursoData={cursoData} />
              </MotionWrapper>
            ) : (
              <EmptyState 
                icon={BarChart3}
                title="¡Bienvenido a tu Cuaderno Digital!"
                description={
                  <>
                    Para visualizar tu panel de control con métricas y gráficos interactivos, por favor, <strong className="text-foreground">carga un Módulo didáctico o un archivo de Curso</strong> desde la sección de Datos.
                  </>
                }
                action={
                  <Link href="/datos" className="glass-button bg-accent/10 text-accent hover:bg-accent/20 px-6 py-3 rounded-lg font-bold flex items-center gap-2">
                    Ir a Datos <span className="text-xl">📁</span>
                  </Link>
                }
              />
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
