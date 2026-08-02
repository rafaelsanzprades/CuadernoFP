"use client";
import { Rocket } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function InnovacionTab() {
  const { moduleData, updateModuleData } = useAppStore();
  const config_contexto = moduleData?.config_contexto || {};

  const handleChange = (field: string, value: any) => {
    updateModuleData("config_contexto", { ...config_contexto, [field]: value });
  };

  const EXTRAESCOLARES = [
    { id: "EXT-VISITA", label: "Visita técnica a empresa" },
    { id: "EXT-CHARLA", label: "Charla de expertos" },
    { id: "EXT-FERIA", label: "Asistencia a ferias/congresos" },
    { id: "EXT-TALLER", label: "Taller práctico externo" },
    { id: "EXT-CONC", label: "Concursos / Hackathons" }
  ];

  const actividades_complementarias = moduleData?.actividades_complementarias || [];

  const toggleExtraescolar = (id: string) => {
    const updated = actividades_complementarias.includes(id)
      ? actividades_complementarias.filter((i: string) => i !== id)
      : [...actividades_complementarias, id];
    updateModuleData("actividades_complementarias", updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Innovación y Proyectos */}
      <div className="glass-card p-6 border-t-4 border-t-amber-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><Rocket className="w-[1.2em] h-[1.2em] mr-1 text-amber-400" /></span> Innovación e Intermodularidad
        </h2>
        <div className="space-y-6">
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Registro de innovación</label>
            <p className="text-caption text-muted mb-2">Proyectos de emprendimiento, metodologías activas y proyectos de equidad/DUA.</p>
            <textarea
              value={config_contexto["registro_innovacion"] || ""}
              onChange={e => handleChange("registro_innovacion", e.target.value)}
              placeholder="Describe los proyectos de innovación del módulo..."
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>

          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">IPE y proyecto intermodular continuo</label>
            <p className="text-caption text-muted mb-2">Vinculación con el Itinerario Personal para la Empleabilidad o participación en el Proyecto Intermodular (D 91/2024).</p>
            <textarea
              value={config_contexto["ipe_intermodular"] || ""}
              onChange={e => handleChange("ipe_intermodular", e.target.value)}
              placeholder="Detalla la participación en proyectos intermodulares..."
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>

          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">H1. Propuestas del departamento / actividades extraescolares</label>
            <p className="text-caption text-muted mb-2">Selecciona actividades tipo y aporta más detalle abajo.</p>
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
                    <span className="text-caption"><strong>{ext.id}</strong> - {ext.label}</span>
                  </label>
                );
              })}
            </div>
            <textarea
              value={config_contexto["H1_complementarias"] || ""}
              onChange={e => handleChange("H1_complementarias", e.target.value)}
              placeholder="Anota lugares a visitar, nombres de empresas, fechas aproximadas o temáticas concretas..."
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
