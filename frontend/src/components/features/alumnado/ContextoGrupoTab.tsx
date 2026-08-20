"use client";
import React, { useState } from "react";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { NarrativeField } from "@/components/ui/NarrativeField";
import { Users, Activity, BarChart2, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

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
  const { cursoData, updateCursoData, moduleData, updateModuleData } = useAppStore();
  const { t } = useTranslation();
  const df_al = cursoData?.df_al || [];
  const [generandoIA, setGenerandoIA] = useState(false);

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
  const tramosEdad = EDAD_TRAMOS.map((tramo) => ({ label: tramo.label, count: conEdad.filter((a: any) => tramo.test(a.Edad)).length }));
  const rasgosSeleccionados = RASGOS_GRUPO.filter((r) => rasgos_grupo.includes(r.id)).map((r) => t(`checks.alumnado.rasgoGrupo_${r.id.toLowerCase().replace(/-/g, '_')}`, {defaultValue: r.label}));

  const handleGenerarIA = async () => {
    if (total === 0) {
      toast.error(t('toasts.contextoGrupo.sinAlumnado', {defaultValue: "No hay alumnado registrado en este curso todavía."}));
      return;
    }
    setGenerandoIA(true);
    try {
      const prompt = [
        "Redacta un párrafo (5-8 líneas, tono técnico-docente, sin listas ni encabezados) para la sección " +
        "\"Características del alumnado\" de una programación didáctica de Formación Profesional, a partir " +
        "de estos datos reales del grupo. No inventes datos que no estén aquí.",
        "",
        `Alumnado total: ${total}`,
        `Edad media: ${edadMedia} años`,
        `Menores de edad: ${menores} (${Math.round((menores / total) * 100)}%)`,
        `Repetidores: ${repetidores} (${Math.round((repetidores / total) * 100)}%)`,
        `Franjas de edad: ${tramosEdad.map((t) => `${t.label}: ${t.count}`).join(", ")}`,
        rasgosSeleccionados.length > 0
          ? `Rasgos característicos marcados por el profesor: ${rasgosSeleccionados.join("; ")}.`
          : "Sin rasgos característicos marcados por el profesor.",
      ].join("\n");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", parts: prompt }] }),
      });
      const data = await res.json();
      if (!res.ok || data.status !== "success") {
        throw new Error(data.detail || data.message || "Error desconocido");
      }
      updateModuleData("textos_pd_caracteristicas_alumnado" as any, data.reply);
      toast.success(t('toasts.contextoGrupo.textoGenerado', {defaultValue: "Texto generado. Revísalo y edítalo antes de guardar."}));
    } catch (err: any) {
      toast.error(err.message || t('toasts.contextoGrupo.errorGenerarIA', {defaultValue: "Error al generar el texto con IA."}));
    } finally {
      setGenerandoIA(false);
    }
  };

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
          <p className="text-caption text-muted mb-3">{t('checks.contexto.seleccionOrientativa', {defaultValue: 'Selección orientativa para apoyar la redacción del texto de abajo (primera versión, se irá ampliando).'})}</p>
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
                  <span className="text-caption">{t(`checks.alumnado.rasgoGrupo_${r.id.toLowerCase().replace(/-/g, '_')}`, {defaultValue: r.label})}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <NarrativeField
            id="textos_pd_caracteristicas_alumnado"
            title={t('campos.alumnado.caracteristicasTitulo', {defaultValue: 'Características del alumnado'})}
            description={t('campos.alumnado.caracteristicasDesc', {defaultValue: 'Procedencia geográfica principal, franja de edad, nivel competencial inicial, expectativas e implicación, etc.'})}
          />
          <button
            type="button"
            onClick={handleGenerarIA}
            disabled={generandoIA || total === 0}
            className="absolute top-0 right-0 flex items-center gap-1.5 text-caption font-semibold text-accent hover:text-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles className={`w-3.5 h-3.5 ${generandoIA ? "animate-pulse" : ""}`} />
            {generandoIA ? t('common.generando', {defaultValue: 'Generando...'}) : t('botones.alumnado.generarConIa', {defaultValue: 'Generar con IA'})}
          </button>
        </div>
      </div>
    </MotionWrapper>
  );
}
