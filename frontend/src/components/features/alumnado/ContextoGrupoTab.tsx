"use client";
import React from "react";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { NarrativeField } from "@/components/ui/NarrativeField";
import { Users, Activity, BarChart2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const RASGOS_GRUPO = [
  { id: "GRUPO-HETEROG", label: "Grupo heterogéneo en edad y procedencia" },
  { id: "GRUPO-COHESION", label: "Buena cohesión y clima de grupo" },
  { id: "GRUPO-CONVIVENCIA", label: "Dificultades de convivencia" },
  { id: "GRUPO-MOTIV-ALTA", label: "Alta motivación e implicación" },
  { id: "GRUPO-MOTIV-BAJA", label: "Desmotivación / baja implicación" },
  { id: "GRUPO-ABSENTISMO", label: "Absentismo significativo" },
  { id: "GRUPO-TRABAJO", label: "Alumnado que compagina estudio y trabajo" },
  { id: "GRUPO-NIVEL-DISPAR", label: "Nivel competencial de partida muy dispar" },
  { id: "GRUPO-REPETIDORES", label: "Presencia significativa de repetidores" },
  { id: "GRUPO-ADULTOS", label: "Alumnado adulto / acceso por otras vías" },
];

const EDAD_TRAMOS = [
  { id: "<18", label: "Menores de 18", test: (e: number) => e < 18 },
  { id: "18-20", label: "18 a 20", test: (e: number) => e >= 18 && e <= 20 },
  { id: "21-25", label: "21 a 25", test: (e: number) => e >= 21 && e <= 25 },
  { id: "26+", label: "26 o más", test: (e: number) => e >= 26 },
];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
      <p className="text-heading font-bold text-foreground leading-none">{value}</p>
      <p className="text-caption text-muted mt-1">{label}</p>
      {sub && <p className="text-caption text-muted/70">{sub}</p>}
    </div>
  );
}

export function ContextoGrupoTab() {
  const { cursoData, updateCursoData } = useAppStore();
  const df_al = cursoData?.df_al || [];

  const rasgos_grupo = (cursoData as any)?.rasgos_grupo || [];

  const toggleRasgo = (id: string) => {
    const updated = rasgos_grupo.includes(id)
      ? rasgos_grupo.filter((r: string) => r !== id)
      : [...rasgos_grupo, id];
    updateCursoData("rasgos_grupo" as any, updated);
  };

  const total = df_al.length;
  const conEdad = df_al.filter((a: any) => typeof a.Edad === "number");
  const menores = conEdad.filter((a: any) => a.Edad < 18).length;
  const edadMedia = conEdad.length > 0
    ? (conEdad.reduce((sum: number, a: any) => sum + a.Edad, 0) / conEdad.length).toFixed(1)
    : "-";
  const repetidores = df_al.filter((a: any) => a.Repite === true).length;

  return (
    <MotionWrapper>
      <div className="space-y-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-subheading font-bold text-[var(--text-primary)]">Contexto del grupo</h2>
            <p className="text-body text-muted-foreground">Define las características psico-pedagógicas y sociológicas del alumnado (necesarias para la PD).</p>
          </div>
        </div>

        <div className="glass-card p-6 border-t-4 border-t-sky-500">
          <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-1">
            <span className="inline-flex"><BarChart2 className="w-[1.2em] h-[1.2em] mr-1 text-sky-400" /></span> Datos del grupo (automático)
          </h2>
          <p className="text-caption text-muted mb-4">Calculado a partir del alumnado registrado en esta pestaña de Curso. Ve a &quot;Listado&quot; para editar Edad/Repite si faltan.</p>
          {total === 0 ? (
            <p className="text-body text-muted">Todavía no hay alumnado registrado en este curso.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Alumnado total" value={total} />
                <StatCard label="Menores de edad" value={menores} sub={`${Math.round((menores / total) * 100)}%`} />
                <StatCard label="Edad media" value={edadMedia} />
                <StatCard label="Repetidores" value={repetidores} sub={`${Math.round((repetidores / total) * 100)}%`} />
              </div>
              <div>
                <p className="text-caption font-semibold text-muted mb-1.5">Franjas de edad</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {EDAD_TRAMOS.map((tramo) => (
                    <StatCard key={tramo.id} label={tramo.label} value={conEdad.filter((a: any) => tramo.test(a.Edad)).length} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="glass-card p-6 border-t-4 border-t-cyan-500">
          <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-1">
            <span className="inline-flex"><Activity className="w-[1.2em] h-[1.2em] mr-1 text-cyan-400" /></span> Rasgos característicos del grupo
          </h2>
          <p className="text-caption text-muted mb-3">Selección orientativa para apoyar la redacción del texto de abajo (primera versión, se irá ampliando).</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {RASGOS_GRUPO.map((r) => {
              const isSelected = rasgos_grupo.includes(r.id);
              return (
                <label key={r.id} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${isSelected ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleRasgo(r.id)}
                    className="rounded border-white/20 bg-transparent text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-caption">{r.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <NarrativeField
          id="textos_pd_caracteristicas_alumnado"
          title="Características del alumnado"
          description="Procedencia geográfica principal, franja de edad, nivel competencial inicial, expectativas e implicación, etc."
        />
      </div>
    </MotionWrapper>
  );
}
