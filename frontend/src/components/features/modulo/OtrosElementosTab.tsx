"use client";
import { Layers, Leaf, Cpu } from "lucide-react";
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

  const elementos_transversales = moduleData?.elementos_transversales || [];

  const toggleTransversal = (id: string) => {
    const updated = elementos_transversales.includes(id) ? elementos_transversales.filter((i: string) => i !== id) : [...elementos_transversales, id];
    updateModuleData("elementos_transversales", updated);
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
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><Layers className="w-[1.2em] h-[1.2em] mr-1 text-cyan-400" /></span> Transversales y Competencias
        </h2>
        <div className="space-y-6">
          
          <div>
            <label className="text-body font-semibold text-foreground mb-2 block flex items-center gap-2">
              <Cpu className="w-4 h-4 text-muted" /> Competencias Clave
            </label>
            <p className="text-caption text-muted mb-3">Selecciona las competencias clave (LOMLOE/LO 3/2022) que se desarrollarán en este módulo.</p>
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
                    <span className="text-body"><strong>{comp.id}</strong> - {comp.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-body font-semibold text-foreground mb-1 block flex items-center gap-2">
              <Leaf className="w-4 h-4 text-muted" /> Elementos transversales
            </label>
            <p className="text-caption text-muted mb-2">Selecciona los elementos que integrarás en el módulo.</p>
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
                    <span className="text-caption"><strong>{trans.id}</strong> - {trans.label}</span>
                  </label>
                );
              })}
            </div>
            <textarea
              value={config_contexto["I1_transversales"] || ""}
              onChange={e => handleChange("I1_transversales", e.target.value)}
              placeholder="Detalla cómo se integrarán los elementos transversales obligatorios..."
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Desarrollo Curricular: ECP, CPE, OG */}
      <div className="glass-card p-6 border-t-4 border-t-indigo-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><Layers className="w-[1.2em] h-[1.2em] mr-1 text-indigo-400" /></span> Estándares y Objetivos (Currículo)
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Estándares de competencia profesional (ECP)</label>
            <p className="text-caption text-muted mb-2">Asociados al módulo profesional según el Real Decreto del título.</p>
            <textarea
              value={config_contexto["ecp"] || ""}
              onChange={e => handleChange("ecp", e.target.value)}
              placeholder="Ej: UC0001_3: Gestionar..."
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Competencias profesionales y para la empleabilidad (CPE)</label>
            <textarea
              value={config_contexto["cpe"] || ""}
              onChange={e => handleChange("cpe", e.target.value)}
              placeholder="Competencias específicas y transversales..."
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Objetivos generales (OG)</label>
            <textarea
              value={config_contexto["og"] || ""}
              onChange={e => handleChange("og", e.target.value)}
              placeholder="Objetivos generales del título aplicables al módulo..."
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
