"use client";
import { CheckCircle2 , Info } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function EvaluacionRecursosTab() {
  const { moduleData, updateModuleData } = useAppStore();
  const config_contexto = moduleData?.config_contexto || {};

  const handleChange = (field: string, value: string) => {
    updateModuleData("config_contexto", { ...config_contexto, [field]: value });
  };

  const INSTRUMENTOS = [
    { id: "PRU-OBJ", label: "Prueba objetiva escrita" },
    { id: "PRU-EJEC", label: "Prueba de ejecución práctica" },
    { id: "RUBR", label: "Rúbrica de evaluación" },
    { id: "COTEJO", label: "Lista de control / Cotejo" },
    { id: "ESCALA", label: "Escala de valoración" },
    { id: "PORTF", label: "Portfolio / Cuaderno" },
    { id: "DIARIO", label: "Diario de aprendizaje" },
    { id: "DEF-ORAL", label: "Exposición oral" },
    { id: "AUTOEVAL", label: "Autoevaluación" },
    { id: "COEVAL", label: "Coevaluación" }
  ];

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
        <h2 className="text-lg font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><CheckCircle2 className="w-[1.2em] h-[1.2em] mr-1 text-amber-400" /></span> Evaluación y Recursos
        </h2>
        <div className="space-y-6">

          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Instrumentos de Evaluación</label>
            <p className="text-xs text-muted mb-3">Procedimientos e instrumentos normativos que se emplearán en el módulo.</p>
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
                    <span className="text-xs"><strong>{inst.id}</strong> - {inst.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Recursos y Espacios</label>
            <p className="text-xs text-muted mb-3">Infraestructuras y materiales técnicos necesarios para el desarrollo curricular.</p>
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
                    <span className="text-xs"><strong>{rec.id}</strong> - {rec.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">E5. Actividades de Recuperación y Refuerzo</label>
            <p className="text-xs text-muted mb-2">Criterios y procedimientos para el alumnado que no supera la evaluación.</p>
            <textarea
              value={config_contexto["E5_recuperacion"] || ""}
              onChange={e => handleChange("E5_recuperacion", e.target.value)}
              placeholder="Sistema de recuperación para evaluaciones y convocatorias extraordinarias..."
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">G1. Infraestructuras y Equipamientos</label>
            <textarea
              value={config_contexto["G1_infraestructuras"] || ""}
              onChange={e => handleChange("G1_infraestructuras", e.target.value)}
              placeholder="Taller, aula, laboratorio, equipamiento específico del ciclo..."
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">G2. Herramientas TIC y plataformas</label>
            <textarea
              value={config_contexto["G2_herramientas_tic"] || ""}
              onChange={e => handleChange("G2_herramientas_tic", e.target.value)}
              placeholder="Moodle, Classroom, software simulador, aplicaciones específicas..."
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">G3. Bibliografía y recursos para el alumnado</label>
            <textarea
              value={config_contexto["G3_bibliografia"] || ""}
              onChange={e => handleChange("G3_bibliografia", e.target.value)}
              placeholder="Libros de texto, manuales de fabricantes, recursos online..."
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

