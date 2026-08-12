"use client";
import { Building2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { NarrativeField } from "@/components/ui/NarrativeField";

const FEOE_CATALOGO = [
  {
    grupo: "Modalidad", items: [
      { id: "FEOE-GEN", label: "Dual general" },
      { id: "FEOE-INT", label: "Dual intensiva" },
      { id: "FEOE-SIM", label: "Sin FEOE / formación en centro educativo" },
    ]
  },
  {
    grupo: "Seguimiento", items: [
      { id: "FEOE-VISITA", label: "Visitas periódicas al centro de trabajo" },
      { id: "FEOE-INFORME", label: "Informe final del tutor de empresa" },
      { id: "FEOE-EVALCONJ", label: "Evaluación conjunta centro-empresa" },
      { id: "FEOE-CUADERNO", label: "Cuaderno de seguimiento del alumnado" },
    ]
  },
];

export function PlanesTab() {
  const { moduleData, updateModuleData } = useAppStore();
  const config_contexto = moduleData?.config_contexto || {};

  const handleChange = (field: string, value: any) => {
    updateModuleData("config_contexto", { ...config_contexto, [field]: value });
  };

  const feoe_seleccion = config_contexto.feoe_seleccion || [];

  const toggleFeoe = (id: string) => {
    const updated = feoe_seleccion.includes(id)
      ? feoe_seleccion.filter((i: string) => i !== id)
      : [...feoe_seleccion, id];
    handleChange("feoe_seleccion", updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* FEOE */}
      <div className="glass-card p-6 border-t-4 border-t-blue-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><Building2 className="w-[1.2em] h-[1.2em] mr-1" /></span> FEOE. Formación en Empresa u Organismo Equiparado
        </h2>
        <div className="space-y-6">
          <div>
            <label className="text-body font-semibold text-foreground mb-2 block">Modalidad y seguimiento</label>
            <p className="text-caption text-muted mb-3">Selección orientativa que apoya la redacción de los textos de abajo (primera versión, se irá ampliando).</p>
            <div className="space-y-3">
              {FEOE_CATALOGO.map((grupo) => (
                <div key={grupo.grupo}>
                  <p className="text-caption font-semibold text-muted mb-1.5">{grupo.grupo}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {grupo.items.map((item) => {
                      const isSelected = feoe_seleccion.includes(item.id);
                      return (
                        <label key={item.id} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${isSelected ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleFeoe(item.id)}
                            className="rounded border-white/20 bg-transparent text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-caption">{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <NarrativeField
            id="textos_pd_feoe_organizacion"
            title="Organización y modalidad de FEOE"
            description="Detalla cómo se organiza el alumnado (FEOE general, intensivo) y qué alternativas hay para el alumnado sin FEOE."
          />
          <NarrativeField
            id="textos_pd_feoe_seguimiento"
            title="Seguimiento de FEOE"
            description="Procedimiento para el seguimiento en la empresa y comunicación con tutores duales."
          />

          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">FEOE (texto específico modelo Simplificado, pd=)</label>
            <p className="text-caption text-muted mb-2">Si se deja vacío, se genera automáticamente a partir de los RA marcados como dualizables (is_dual).</p>
            <textarea
              value={config_contexto.texto_feoe || ""}
              onChange={e => handleChange("texto_feoe", e.target.value)}
              placeholder="Texto sobre la formación en empresa..."
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
