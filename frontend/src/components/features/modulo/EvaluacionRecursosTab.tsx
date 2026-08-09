"use client";
import { useState } from "react";
import { CheckCircle2, Plus, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { INSTRUMENTOS_EVALUACION, INSTRUMENTOS_CALIFICACION } from "@/data/instrumentosEvaluacion";
import { RECURSOS_DIDACTICOS } from "@/data/herramientasRecursos";

export function EvaluacionRecursosTab() {
  const { moduleData, updateModuleData } = useAppStore();
  const [nuevoRecurso, setNuevoRecurso] = useState("");


  const recursosCatalogoIds = new Set(RECURSOS_DIDACTICOS.map((r) => r.id));
  const categorias = Array.from(new Set(RECURSOS_DIDACTICOS.map((r) => r.categoria)));

  const inst_seleccionados = moduleData?.instrumentos_seleccionados || [];
  const rec_seleccionados: string[] = moduleData?.recursos_espacios || [];
  // Recursos añadidos a mano por el profesorado: cualquier entrada de
  // recursos_espacios que no sea un id del catálogo se trata como texto
  // libre (sin tocar el esquema, recursos_espacios ya es string[]).
  const rec_personalizados = rec_seleccionados.filter((r) => !recursosCatalogoIds.has(r));

  const toggleInst = (id: string) => {
    const updated = inst_seleccionados.includes(id) ? inst_seleccionados.filter((i: string) => i !== id) : [...inst_seleccionados, id];
    updateModuleData("instrumentos_seleccionados", updated);
  };

  const toggleRec = (id: string) => {
    const updated = rec_seleccionados.includes(id) ? rec_seleccionados.filter((i: string) => i !== id) : [...rec_seleccionados, id];
    updateModuleData("recursos_espacios", updated);
  };

  const addRecursoPersonalizado = () => {
    const texto = nuevoRecurso.trim();
    if (!texto || rec_seleccionados.includes(texto)) return;
    updateModuleData("recursos_espacios", [...rec_seleccionados, texto]);
    setNuevoRecurso("");
  };

  const removeRecursoPersonalizado = (texto: string) => {
    updateModuleData("recursos_espacios", rec_seleccionados.filter((r) => r !== texto));
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
            <p className="text-caption text-muted mb-3">La actividad que genera la evidencia: qué hace el alumnado.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {INSTRUMENTOS_EVALUACION.map((inst) => {
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
            <label className="text-body font-semibold text-foreground mb-2 block">Instrumentos de calificación</label>
            <p className="text-caption text-muted mb-3">Lo que puntúa esa evidencia: la rúbrica o escala aplicada.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {INSTRUMENTOS_CALIFICACION.map((inst) => {
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
            <label className="text-body font-semibold text-foreground mb-2 block">Herramientas, recursos y espacios</label>
            <p className="text-caption text-muted mb-3">Infraestructuras, herramientas y materiales técnicos necesarios para el desarrollo curricular. Si no encuentras algo, añádelo abajo como texto libre.</p>
            <div className="space-y-4">
              {categorias.map((cat) => (
                <div key={cat}>
                  <p className="text-caption font-semibold text-muted mb-1.5">{cat}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {RECURSOS_DIDACTICOS.filter((r) => r.categoria === cat).map((rec) => {
                      const isSelected = rec_seleccionados.includes(rec.id);
                      return (
                        <label key={rec.id} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${isSelected ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRec(rec.id)}
                            className="rounded border-white/20 bg-transparent text-amber-500 focus:ring-amber-500"
                          />
                          <span className="text-caption">{rec.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div>
                <p className="text-caption font-semibold text-muted mb-1.5">Añadidos por el profesorado</p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={nuevoRecurso}
                    onChange={(e) => setNuevoRecurso(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRecursoPersonalizado(); } }}
                    placeholder="Añadir un recurso que no esté en la lista..."
                    className="flex-1 px-3 py-2 rounded border border-white/10 bg-white/5 text-caption text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={addRecursoPersonalizado}
                    className="px-3 py-2 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {rec_personalizados.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {rec_personalizados.map((texto) => (
                      <span key={texto} className="flex items-center gap-1.5 px-2 py-1 rounded border border-amber-500/30 bg-amber-500/10 text-caption text-foreground">
                        {texto}
                        <button type="button" onClick={() => removeRecursoPersonalizado(texto)} className="text-muted hover:text-foreground">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

