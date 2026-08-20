"use client";
import { Target } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";

export function MetodologiaTab() {
  const { t } = useTranslation();
  const { moduleData, updateModuleData } = useAppStore();
  const config_contexto = moduleData?.config_contexto || {};
  const config_aula = moduleData?.config_aula || {};

  const handleChange = (field: string, value: string) => {
    updateModuleData("config_contexto", { ...config_contexto, [field]: value });
  };

  const handleAulaChange = (field: string, value: string) => {
    updateModuleData("config_aula", { ...config_aula, [field]: value });
  };

  const METODOLOGIAS = [
    { id: "ABP", label: "Aprendizaje Basado en Proyectos" },
    { id: "ABR", label: "Aprendizaje Basado en Retos" },
    { id: "FLIP", label: "Flipped Classroom (Aula Invertida)" },
    { id: "COLAB", label: "Aprendizaje Cooperativo / Colaborativo" },
    { id: "SIM", label: "Simulación de Entornos Profesionales" },
    { id: "CASOS", label: "Método del Caso" },
    { id: "GAMIF", label: "Gamificación / Aprendizaje Basado en Juegos" },
    { id: "ApS", label: "Aprendizaje-Servicio" },
    { id: "DEMO", label: "Demostración Práctica" },
    { id: "MAGIS", label: "Exposición Didáctica Interactiva apoyada en TIC" },
    { id: "ETHAZI", label: "Ethazi / Aprendizaje Colaborativo basado en Retos (ACbR)" },
    { id: "AGIL", label: "Metodologías Ágiles (Design Thinking, Lean Startup, Scrum)" },
    { id: "CONTR", label: "Contrato de Aprendizaje (Learning Contract)" },
    { id: "DEBATE", label: "Debates y Diálogo Educativo" },
    { id: "PARES", label: "Aprendizaje entre Pares (Peer Teaching)" },
    { id: "ESTAC", label: "Estaciones de Aprendizaje" }
  ];

  const metodologias_seleccionadas = moduleData?.metodologias_seleccionadas || [];
  
  const toggleMetodologia = (id: string) => {
    const updated = metodologias_seleccionadas.includes(id)
      ? metodologias_seleccionadas.filter((m: string) => m !== id)
      : [...metodologias_seleccionadas, id];
    updateModuleData("metodologias_seleccionadas", updated);
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-6 border-t-4 border-t-green-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><Target className="w-[1.2em] h-[1.2em] mr-1 text-green-400" /></span> Metodología
        </h2>
        <div className="space-y-6">
          
          <div>
            <label className="text-body font-semibold text-foreground mb-2 block">Metodologías activas (selección múltiple)</label>
            <p className="text-caption text-muted mb-3">Elige las metodologías que sustentan el desarrollo del módulo. Se redactarán automáticamente en tu Programación Didáctica.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {METODOLOGIAS.map((met) => {
                const isSelected = metodologias_seleccionadas.includes(met.id);
                return (
                  <label key={met.id} className={`flex items-center gap-3 p-2 rounded border cursor-pointer transition-colors ${isSelected ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleMetodologia(met.id)}
                      className="rounded border-white/20 bg-transparent text-green-500 focus:ring-green-500"
                    />
                    <span className="text-body"><strong>{met.id}</strong> - {met.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Principios metodológicos</label>
            <p className="text-caption text-muted mb-2">Principios pedagógicos generales que guiarán el módulo.</p>
            <textarea
              value={config_contexto["principios_metodologicos"] || ""}
              onChange={e => handleChange("principios_metodologicos", e.target.value)}
              placeholder={t('placeholders.modulo.metodologiaPrincipios', {defaultValue: 'Ej: Aprendizaje significativo, funcionalidad de los aprendizajes...'})}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Estrategias metodológicas</label>
            <p className="text-caption text-muted mb-2">Estrategias y actividades de enseñanza-aprendizaje a emplear en el aula y taller.</p>
            <textarea
              value={config_contexto["estrategias_metodologicas"] || config_contexto["D2_actividades_ea"] || ""}
              onChange={e => handleChange("estrategias_metodologicas", e.target.value)}
              placeholder={t('placeholders.modulo.metodologiaTipo', {defaultValue: 'Relación de metodologías tipo como teoría, taller, prácticas simuladas...'})}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Estrategias metodológicas. Espacios <span className="text-caption font-normal text-muted">(campo histórico, próximo a fusionarse con el de arriba)</span></label>
            <textarea
              value={config_contexto.metodologia || ""}
              onChange={e => handleChange("metodologia", e.target.value)}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Metodología general (ej. ABR / ABP) <span className="text-caption font-normal text-muted">(campo histórico)</span></label>
            <textarea
              value={config_aula.Metodología || ""}
              onChange={e => handleAulaChange("Metodología", e.target.value)}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>

          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Anotaciones libres de metodología</label>
            <p className="text-caption text-muted mb-2">Párrafo personalizado que se añadirá al final del apartado de metodologías generadas automáticamente.</p>
            <textarea
              value={moduleData?.texto_metodologia_libre || ""}
              onChange={e => updateModuleData("texto_metodologia_libre", e.target.value)}
              placeholder={t('placeholders.modulo.metodologiaEspecificidad', {defaultValue: 'Escribe aquí cualquier especificidad sobre tu forma de impartir clases que no esté cubierta en la selección anterior...'})}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>

          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Plan de aplicación de los desdobles</label>
            <p className="text-caption text-muted mb-2">Justificación y organización si el módulo tiene desdobles.</p>
            <textarea
              value={config_contexto["plan_desdobles"] || config_contexto["D3_agrupamientos"] || ""}
              onChange={e => handleChange("plan_desdobles", e.target.value)}
              placeholder={t('placeholders.modulo.metodologiaOrganizacionGrupo', {defaultValue: 'Organización del grupo, desdobles por prevención de riesgos o ratios...'})}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Aprendizaje colaborativo basado en proyectos y/o retos (ABP/ABR)</label>
            <p className="text-caption text-muted mb-2">Descripción de la aplicación de metodologías activas.</p>
            <textarea
              value={config_contexto["aprendizaje_colaborativo"] || ""}
              onChange={e => handleChange("aprendizaje_colaborativo", e.target.value)}
              placeholder={t('placeholders.modulo.metodologiaAplicada', {defaultValue: 'Se aplicará la metodología basada en retos para...'})}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Coordinación con otros módulos y su profesorado</label>
            <p className="text-caption text-muted mb-2">Cómo se coordina este módulo con otros módulos/profesorado del ciclo (reuniones de equipo docente, dependencias entre módulos, sustitución de tareas en caso de ausencia, etc.).</p>
            <textarea
              value={moduleData?.textos_pd_metodologia_labor_coordinada || ""}
              onChange={e => updateModuleData("textos_pd_metodologia_labor_coordinada", e.target.value)}
              placeholder={t('placeholders.modulo.metodologiaCoordinacion', {defaultValue: 'Escribe aquí sobre coordinación con otros módulos y su profesorado...'})}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

