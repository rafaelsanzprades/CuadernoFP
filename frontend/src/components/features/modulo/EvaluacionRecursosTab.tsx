"use client";
import { CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { INSTRUMENTOS_EVALUACION } from "@/data/instrumentosEvaluacion";

export function EvaluacionRecursosTab() {
  const { moduleData, updateModuleData } = useAppStore();

  const INSTRUMENTOS = INSTRUMENTOS_EVALUACION;

  const RECURSOS = [
    { id: "REC-AULA", label: "Aula técnica / polivalente" },
    { id: "REC-TALLER", label: "Taller específico" },
    { id: "REC-INFO", label: "Aula de informática" },
    { id: "REC-SOFT", label: "Software específico" },
    { id: "REC-EVA", label: "Entorno Virtual (Aules/Moodle)" },
    { id: "REC-BIBLIO", label: "Manuales técnicos" },
    { id: "REC-EPI", label: "EPIs" }
  ];

  const inst_seleccionados = moduleData?.instrumentos_seleccionados || [];
  const rec_seleccionados = moduleData?.recursos_espacios || [];

  const toggleInst = (id: string) => {
    const updated = inst_seleccionados.includes(id) ? inst_seleccionados.filter((i: string) => i !== id) : [...inst_seleccionados, id];
    updateModuleData("instrumentos_seleccionados", updated);
  };

  const toggleRec = (id: string) => {
    const updated = rec_seleccionados.includes(id) ? rec_seleccionados.filter((i: string) => i !== id) : [...rec_seleccionados, id];
    updateModuleData("recursos_espacios", updated);
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-6 border-t-4 border-t-amber-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><CheckCircle2 className="w-[1.2em] h-[1.2em] mr-1 text-amber-400" /></span> Instrumentos y recursos
        </h2>
        <div className="space-y-6">

          <div>
            <label className="text-body font-semibold text-foreground mb-2 block">Instrumentos de evaluación</label>
            <p className="text-caption text-muted mb-3">Procedimientos e instrumentos normativos que se emplearán en el módulo.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {INSTRUMENTOS.map((inst) => {
                const isSelected = inst_seleccionados.includes(inst.id);
                return (
                  <label key={inst.id} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${isSelected ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleInst(inst.id)}
                      className="rounded border-white/20 bg-transparent text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-caption"><strong>{inst.id}</strong> - {inst.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-body font-semibold text-foreground mb-2 block">Recursos y espacios</label>
            <p className="text-caption text-muted mb-3">Infraestructuras y materiales técnicos necesarios para el desarrollo curricular.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {RECURSOS.map((rec) => {
                const isSelected = rec_seleccionados.includes(rec.id);
                return (
                  <label key={rec.id} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${isSelected ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleRec(rec.id)}
                      className="rounded border-white/20 bg-transparent text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-caption"><strong>{rec.id}</strong> - {rec.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

