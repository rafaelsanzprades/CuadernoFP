"use client";
import { Layers, Rocket, Leaf, ShieldAlert, Cpu } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function OtrosElementosTab() {
  const { moduleData, updateModuleData } = useAppStore();
  const config_contexto = moduleData?.config_contexto || {};

  const handleChange = (field: string, value: any) => {
    updateModuleData("config_contexto", { ...config_contexto, [field]: value });
  };

  const TRANSVERSALES = [
    { id: "TRANS-DIG", label: "Competencia Digital / Tecnologías" },
    { id: "TRANS-SOST", label: "Sostenibilidad y Transición Ecológica" },
    { id: "TRANS-IGUAL", label: "Igualdad de Género" },
    { id: "TRANS-PRL", label: "Prevención de Riesgos Laborales" },
    { id: "TRANS-EMPRE", label: "Cultura Emprendedora" }
  ];

  const EXTRAESCOLARES = [
    { id: "EXT-VISITA", label: "Visita técnica a empresa" },
    { id: "EXT-CHARLA", label: "Charla de expertos" },
    { id: "EXT-FERIA", label: "Asistencia a ferias/congresos" },
    { id: "EXT-TALLER", label: "Taller práctico externo" },
    { id: "EXT-CONC", label: "Concursos / Hackathons" }
  ];

  const elementos_transversales = moduleData?.elementos_transversales || [];
  const actividades_complementarias = moduleData?.actividades_complementarias || [];

  const toggleTransversal = (id: string) => {
    const updated = elementos_transversales.includes(id) ? elementos_transversales.filter((i: string) => i !== id) : [...elementos_transversales, id];
    updateModuleData("elementos_transversales", updated);
  };

  const toggleExtraescolar = (id: string) => {
    const updated = actividades_complementarias.includes(id) ? actividades_complementarias.filter((i: string) => i !== id) : [...actividades_complementarias, id];
    updateModuleData("actividades_complementarias", updated);
  };

  const toggleCompetencia = (comp: string) => {
    const current = config_contexto.competencias_clave || [];
    const updated = current.includes(comp) 
      ? current.filter((c: string) => c !== comp)
      : [...current, comp];
    handleChange("competencias_clave", updated);
  };

  const COMPETENCIAS_CLAVE = [
    { id: "CL", label: "Comunicación Lingüística" },
    { id: "CSTEM", label: "Competencia Matemática y en Ciencia, Tecnología e Ingeniería" },
    { id: "CD", label: "Competencia Digital" },
    { id: "CPSAA", label: "Competencia Personal, Social y de Aprender a Aprender" },
    { id: "CCEC", label: "Competencia en Conciencia y Expresión Culturales" },
    { id: "CE", label: "Competencia Emprendedora" },
    { id: "CIEC", label: "Competencia Ciudadana" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Competencias y Transversales */}
      <div className="glass-card p-6 border-t-4 border-t-cyan-500">
        <h2 className="text-lg font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><Layers className="w-[1.2em] h-[1.2em] mr-1 text-cyan-400" /></span> Transversales y Competencias
        </h2>
        <div className="space-y-6">
          
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
              <Cpu className="w-4 h-4 text-muted" /> Competencias Clave
            </label>
            <p className="text-xs text-muted mb-3">Selecciona las competencias clave (LOMLOE/LO 3/2022) que se desarrollarán en este módulo.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {COMPETENCIAS_CLAVE.map((comp) => {
                const isSelected = (config_contexto.competencias_clave || []).includes(comp.id);
                return (
                  <label key={comp.id} className={`flex items-center gap-3 p-2 rounded border cursor-pointer transition-colors ${isSelected ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleCompetencia(comp.id)}
                      className="rounded border-white/20 bg-transparent text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-sm"><strong>{comp.id}</strong> - {comp.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block flex items-center gap-2">
              <Leaf className="w-4 h-4 text-muted" /> Elementos transversales
            </label>
            <p className="text-xs text-muted mb-2">Selecciona los elementos que integrarás en el módulo.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              {TRANSVERSALES.map((trans) => {
                const isSelected = elementos_transversales.includes(trans.id);
                return (
                  <label key={trans.id} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${isSelected ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleTransversal(trans.id)}
                      className="rounded border-white/20 bg-transparent text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-xs"><strong>{trans.id}</strong> - {trans.label}</span>
                  </label>
                );
              })}
            </div>
            <textarea
              value={config_contexto["I1_transversales"] || ""}
              onChange={e => handleChange("I1_transversales", e.target.value)}
              placeholder="Detalla cómo se integrarán los elementos transversales obligatorios..."
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-sm text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Innovación y Proyectos */}
      <div className="glass-card p-6 border-t-4 border-t-amber-500">
        <h2 className="text-lg font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><Rocket className="w-[1.2em] h-[1.2em] mr-1 text-amber-400" /></span> Innovación e Intermodularidad
        </h2>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">Registro de innovación</label>
            <p className="text-xs text-muted mb-2">Proyectos de emprendimiento, metodologías activas y proyectos de equidad/DUA.</p>
            <textarea
              value={config_contexto["registro_innovacion"] || ""}
              onChange={e => handleChange("registro_innovacion", e.target.value)}
              placeholder="Describe los proyectos de innovación del módulo..."
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-sm text-foreground focus:border-info focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">IPE y proyecto intermodular continuo</label>
            <p className="text-xs text-muted mb-2">Vinculación con el Itinerario Personal para la Empleabilidad o participación en el Proyecto Intermodular (D 91/2024).</p>
            <textarea
              value={config_contexto["ipe_intermodular"] || ""}
              onChange={e => handleChange("ipe_intermodular", e.target.value)}
              placeholder="Detalla la participación en proyectos intermodulares..."
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-sm text-foreground focus:border-info focus:outline-none"
            />
          </div>
          
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">H1. Propuestas del departamento / actividades extraescolares</label>
            <p className="text-xs text-muted mb-2">Selecciona actividades tipo y aporta más detalle abajo.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              {EXTRAESCOLARES.map((ext) => {
                const isSelected = actividades_complementarias.includes(ext.id);
                return (
                  <label key={ext.id} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${isSelected ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleExtraescolar(ext.id)}
                      className="rounded border-white/20 bg-transparent text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-xs"><strong>{ext.id}</strong> - {ext.label}</span>
                  </label>
                );
              })}
            </div>
            <textarea
              value={config_contexto["H1_complementarias"] || ""}
              onChange={e => handleChange("H1_complementarias", e.target.value)}
              placeholder="Anota lugares a visitar, nombres de empresas, fechas aproximadas o temáticas concretas..."
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-sm text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Desarrollo Curricular: ECP, CPE, OG */}
      <div className="glass-card p-6 border-t-4 border-t-indigo-500">
        <h2 className="text-lg font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><Layers className="w-[1.2em] h-[1.2em] mr-1 text-indigo-400" /></span> Estándares y Objetivos (Currículo)
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">Estándares de competencia profesional (ECP)</label>
            <p className="text-xs text-muted mb-2">Asociados al módulo profesional según el Real Decreto del título.</p>
            <textarea
              value={config_contexto["ecp"] || ""}
              onChange={e => handleChange("ecp", e.target.value)}
              placeholder="Ej: UC0001_3: Gestionar..."
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-sm text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">Competencias profesionales y para la empleabilidad (CPE)</label>
            <textarea
              value={config_contexto["cpe"] || ""}
              onChange={e => handleChange("cpe", e.target.value)}
              placeholder="Competencias específicas y transversales..."
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-sm text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">Objetivos generales (OG)</label>
            <textarea
              value={config_contexto["og"] || ""}
              onChange={e => handleChange("og", e.target.value)}
              placeholder="Objetivos generales del título aplicables al módulo..."
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-sm text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Contingencia */}
      <div className="glass-card p-6 border-t-4 border-t-rose-500">
        <h2 className="text-lg font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><ShieldAlert className="w-[1.2em] h-[1.2em] mr-1 text-rose-400" /></span> Plan de Contingencia
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">Ausencia prolongada del profesorado titular</label>
            <textarea
              value={config_contexto["contingencia_profesor"] || ""}
              onChange={e => handleChange("contingencia_profesor", e.target.value)}
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-sm text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">Ausencia prolongada del alumnado por causas justificadas</label>
            <textarea
              value={config_contexto["contingencia_alumnado"] || ""}
              onChange={e => handleChange("contingencia_alumnado", e.target.value)}
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-sm text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">Interrupción generalizada de las clases</label>
            <textarea
              value={config_contexto["contingencia_general"] || config_contexto["J3_contingencia"] || ""}
              onChange={e => handleChange("contingencia_general", e.target.value)}
              placeholder="Plataformas online, recursos a distancia..."
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-sm text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
