"use client";
import { School, Settings, User, Info, FileText, BookOpen } from "lucide-react";
import { NarrativeField } from "@/components/ui/NarrativeField";
import { useAppStore } from "@/store/useAppStore";

export function ContextoTab() {
  const { moduleData, updateModuleData } = useAppStore();

  const config_contexto = moduleData?.config_contexto || {};
  const config_aula = moduleData?.config_aula || {};

  const handleContextoChange = (field: string, value: string) => {
    updateModuleData("config_contexto", { ...config_contexto, [field]: value });
  };

  const handleAulaChange = (field: string, value: string) => {
    updateModuleData("config_aula", { ...config_aula, [field]: value });
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-6 border-t-4 border-t-indigo-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><School className="w-[1.2em] h-[1.2em] mr-1" /></span> Contexto escolar
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-body text-muted mb-1 block">Entorno geográfico y sociocultural</label>
            <textarea
              value={config_contexto.entorno_geografico || ""}
              onChange={e => handleContextoChange("entorno_geografico", e.target.value)}
              placeholder="Ej: El IES Andalán se sitúa en el barrio X de Zaragoza..."
              className="w-full h-64 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body text-muted mb-1 block">Entorno socioeconómico y productivo</label>
            <textarea
              value={config_contexto.entorno_socioeconomico || ""}
              onChange={e => handleContextoChange("entorno_socioeconomico", e.target.value)}
              placeholder="Ej: El tejido empresarial de la zona destaca por..."
              className="w-full h-64 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body text-muted mb-1 block">Contexto escolar</label>
            <textarea
              value={config_contexto.contexto_escolar || ""}
              onChange={e => handleContextoChange("contexto_escolar", e.target.value)}
              placeholder="Ej: Centro de referencia en Formación Profesional..."
              className="w-full h-64 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body text-muted mb-1 block">Características del alumnado</label>
            <textarea
              value={config_contexto.caracteristicas_alumnado || ""}
              onChange={e => handleContextoChange("caracteristicas_alumnado", e.target.value)}
              placeholder="Ej: Grupo diverso en edades y perfiles de ingreso..."
              className="w-full h-96 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body text-muted mb-1 block">Infraestructura y recursos educativos</label>
            <textarea
              value={config_contexto.infraestructura || ""}
              onChange={e => handleContextoChange("infraestructura", e.target.value)}
              placeholder="Ej: Aula-taller informatizada con 30 puestos..."
              className="w-full h-64 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 border-t-4 border-t-purple-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><User className="w-[1.2em] h-[1.2em] mr-1" /></span> Alumnado (ACNEAE)
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-body text-muted mb-1 block">Datos de contextualización del grupo</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="text-caption text-muted mb-1 block">Ratio — Hombres</label>
                <input
                  type="number" min="0"
                  value={config_contexto.ratio_hombres ?? ""}
                  onChange={e => handleContextoChange("ratio_hombres", e.target.value)}
                  className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-2 text-foreground focus:border-info focus:outline-none"
                />
              </div>
              <div>
                <label className="text-caption text-muted mb-1 block">Ratio — Mujeres</label>
                <input
                  type="number" min="0"
                  value={config_contexto.ratio_mujeres ?? ""}
                  onChange={e => handleContextoChange("ratio_mujeres", e.target.value)}
                  className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-2 text-foreground focus:border-info focus:outline-none"
                />
              </div>
              <div>
                <label className="text-caption text-muted mb-1 block">Repetidores</label>
                <input
                  type="number" min="0"
                  value={config_contexto.num_repetidores ?? ""}
                  onChange={e => handleContextoChange("num_repetidores", e.target.value)}
                  className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-2 text-foreground focus:border-info focus:outline-none"
                />
              </div>
              <div>
                <label className="text-caption text-muted mb-1 block">Pendientes del módulo</label>
                <input
                  type="number" min="0"
                  value={config_contexto.num_pendientes ?? ""}
                  onChange={e => handleContextoChange("num_pendientes", e.target.value)}
                  className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-2 text-foreground focus:border-info focus:outline-none"
                />
              </div>
              <div>
                <label className="text-caption text-muted mb-1 block">ACNEAE</label>
                <input
                  type="number" min="0"
                  value={config_contexto.num_acneae ?? ""}
                  onChange={e => handleContextoChange("num_acneae", e.target.value)}
                  className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-2 text-foreground focus:border-info focus:outline-none"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="text-body text-muted mb-1 block">Inclusión</label>
            <textarea
              value={config_contexto.inclusion || ""}
              onChange={e => handleContextoChange("inclusion", e.target.value)}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body text-muted mb-1 block">Elenco de situaciones</label>
            <textarea
              value={config_contexto.elenco_situaciones || ""}
              onChange={e => handleContextoChange("elenco_situaciones", e.target.value)}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body text-muted mb-1 block">Circunstancias ocultas</label>
            <textarea
              value={config_contexto.circunstancias_ocultas || ""}
              onChange={e => handleContextoChange("circunstancias_ocultas", e.target.value)}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 border-t-4 border-t-pink-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><Settings className="w-[1.2em] h-[1.2em] mr-1" /></span> Configuración del aula
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-body text-muted mb-1 block">Estrategias metodológicas. Espacios</label>
            <textarea
              value={config_contexto.metodologia || ""}
              onChange={e => handleContextoChange("metodologia", e.target.value)}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-danger focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body text-muted mb-1 block">Metodología general (ej. ABR / ABP)</label>
            <textarea
              value={config_aula.Metodología || ""}
              onChange={e => handleAulaChange("Metodología", e.target.value)}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-danger focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body text-muted mb-1 block">Atención a la diversidad (A. no significativas)</label>
            <textarea
              value={config_aula["Atención a la diversidad"] || ""}
              onChange={e => handleAulaChange("Atención a la diversidad", e.target.value)}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-danger focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 border-t-4 border-t-teal-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span> Textos del modelo BOA Aragón (pd=)
        </h2>
        <p className="text-caption text-muted mb-4">
          Estos 4 campos son específicos del documento &quot;Programación suficiente&quot; (modelo oficial BOA Aragón).
          Si se dejan vacíos, se autogenera un texto por defecto razonable a partir del resto de datos del módulo.
        </p>
        <div className="space-y-4">
          <div>
            <label className="text-body text-muted mb-1 block">Introducción</label>
            <textarea
              value={config_contexto.texto_introduccion || ""}
              onChange={e => handleContextoChange("texto_introduccion", e.target.value)}
              placeholder="Párrafo introductorio del documento. Si se deja vacío, se genera uno automáticamente con el nombre del módulo, ciclo, régimen y duración."
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body text-muted mb-1 block">Unidades didácticas del módulo</label>
            <textarea
              value={config_contexto.texto_uds_modulo || ""}
              onChange={e => handleContextoChange("texto_uds_modulo", e.target.value)}
              placeholder="Descripción de cómo se organizan las unidades didácticas. Si se deja vacío, se genera automáticamente a partir de df_ud."
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body text-muted mb-1 block">FEOE</label>
            <textarea
              value={config_contexto.texto_feoe || ""}
              onChange={e => handleContextoChange("texto_feoe", e.target.value)}
              placeholder="Texto sobre la formación en empresa. Si se deja vacío, se genera automáticamente a partir de los RA marcados como dualizables (is_dual)."
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body text-muted mb-1 block">Criterios de calificación</label>
            <textarea
              value={config_contexto.texto_criterios_calificacion || ""}
              onChange={e => handleContextoChange("texto_criterios_calificacion", e.target.value)}
              placeholder="Criterios de calificación y redondeo del módulo."
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 border-t-4 border-t-amber-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><FileText className="w-[1.2em] h-[1.2em] mr-1" /></span> Datos de autoría y publicidad
        </h2>
        <div className="flex flex-col gap-6">
          <NarrativeField
            id="textos_pd_bibliografia"
            title="Bibliografía y Recursos"
            description="Bibliografía principal para el profesorado y alumnado."
          />
          <NarrativeField
            id="textos_pd_publicidad"
            title="Publicidad de la programación"
            description="Cómo y dónde se publicará o podrá consultar la programación."
          />
        </div>
      </div>
    </div>
    </>
  );
}

