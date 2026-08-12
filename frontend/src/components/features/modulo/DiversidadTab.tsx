"use client";
import { Users, Plus, Trash2, ShieldAlert, Puzzle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";

export function DiversidadTab() {
  const { moduleData, updateModuleData, updateDataFrame } = useAppStore();
  const config_contexto = moduleData?.config_contexto || {};
  const config_aula = moduleData?.config_aula || {};

  // Default structure if not exists
  const acneae = config_contexto.acneae || [];

  const handleChange = (field: string, value: any) => {
    updateModuleData("config_contexto", { ...config_contexto, [field]: value });
  };

  const handleAulaChange = (field: string, value: any) => {
    updateModuleData("config_aula", { ...config_aula, [field]: value });
  };

  const df_dua = moduleData?.df_dua || [];

  const addDuaRow = () => {
    const newDf = [...df_dua];
    const newId = `DUA${(newDf.length + 1).toString().padStart(2, '0')}`;
    newDf.push({ ID: newId, Alumnado_Aula: "", Barrera: "", Medida_Metodologica: "", Medida_Acceso: "", Medida_Evaluacion: "" });
    updateDataFrame("df_dua", newDf);
  };

  const updateDuaRow = (idx: number, field: string, value: any) => {
    const newDf = [...df_dua];
    newDf[idx][field] = value;
    updateDataFrame("df_dua", newDf);
  };

  const removeDuaRow = (idx: number) => {
    const newDf = [...df_dua];
    newDf.splice(idx, 1);
    updateDataFrame("df_dua", newDf);
  };

  const INCLUSION = [
    { id: "NIVEL", label: "Actividades multinivel" },
    { id: "AGRUP", label: "Agrupamientos flexibles / tutoría" },
    { id: "TIEMPO", label: "Flexibilización en tiempos" },
    { id: "MATERIAL", label: "Adaptación de materiales" },
    { id: "ACNS", label: "ACNS (No Significativas)" },
    { id: "AMPLIA", label: "Ampliación (Altas Capacidades)" }
  ];

  const medidas_inclusion = moduleData?.medidas_inclusion || [];

  const toggleInclusion = (id: string) => {
    const updated = medidas_inclusion.includes(id) ? medidas_inclusion.filter((i: string) => i !== id) : [...medidas_inclusion, id];
    updateModuleData("medidas_inclusion", updated);
  };

  const addAcneae = () => {
    const newStudent = { id: Date.now().toString(), nombre: "", tipoNecesidad: "", adaptaciones: [] };
    handleChange("acneae", [...acneae, newStudent]);
  };

  const updateAcneae = (id: string, field: string, value: any) => {
    const updated = acneae.map((s: any) => s.id === id ? { ...s, [field]: value } : s);
    handleChange("acneae", updated);
  };

  const removeAcneae = (id: string) => {
    handleChange("acneae", acneae.filter((s: any) => s.id !== id));
  };

  const toggleAdaptacion = (studentId: string, adaptacion: string) => {
    const student = acneae.find((s: any) => s.id === studentId);
    if (!student) return;
    const current = student.adaptaciones || [];
    const updated = current.includes(adaptacion) 
      ? current.filter((a: string) => a !== adaptacion)
      : [...current, adaptacion];
    updateAcneae(studentId, "adaptaciones", updated);
  };

  const adaptacionesList = [
    "Tiempo extra en pruebas",
    "Sistemas de comunicación alternativos",
    "Medios apropiados/apoyos técnicos",
    "Adaptación de formato de examen",
    "Ubicación preferente en el aula"
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Marco de Inclusión */}
      <div className="glass-card p-6 border-t-4 border-t-purple-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><ShieldAlert className="w-[1.2em] h-[1.2em] mr-1 text-purple-400" /></span> Marco de Inclusión (D 91/2024 Art. 29)
        </h2>
        <div className="space-y-6">

          <div>
            <label className="text-body font-semibold text-foreground mb-2 block">Medidas de inclusión (selección múltiple)</label>
            <p className="text-caption text-muted mb-3">Selecciona las medidas de respuesta educativa que aplicarás de forma general en este módulo.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {INCLUSION.map((inc) => {
                const isSelected = medidas_inclusion.includes(inc.id);
                return (
                  <label key={inc.id} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${isSelected ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleInclusion(inc.id)}
                      className="rounded border-white/20 bg-transparent text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-caption"><strong>{inc.id}</strong> - {inc.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-body font-semibold text-foreground mb-2 block">Anotaciones libres sobre inclusión</label>
            <textarea
              value={moduleData?.texto_inclusion_libre || ""}
              onChange={e => updateModuleData("texto_inclusion_libre", e.target.value)}
              placeholder="Añade aquí medidas específicas, adaptaciones de acceso al aula o justificaciones normativas extra..."
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
              <input 
              type="checkbox" 
              className="mt-1"
              checked={config_contexto.adaptaciones_no_significativas || false}
              onChange={(e) => handleChange("adaptaciones_no_significativas", e.target.checked)}
            />
            <div>
              <p className="font-semibold text-body">Adaptaciones curriculares no significativas</p>
              <p className="text-caption text-muted">Ajustes metodológicos, organizativos o de acceso que no alteran los RA ni CE esenciales.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <input
              type="checkbox"
              className="mt-1"
              checked={config_contexto.medidas_flexibilizacion || false}
              onChange={(e) => handleChange("medidas_flexibilizacion", e.target.checked)}
            />
            <div>
              <p className="font-semibold text-body">Medidas de flexibilización</p>
              <p className="text-caption text-muted">Alternativas metodológicas en enseñanza y evaluación que no minorarán las calificaciones.</p>
            </div>
          </label>
          </div>
        </div>
      </div>

      {/* F1. Atención a la diversidad */}
      <div className="glass-card p-6 border-t-4 border-t-violet-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><ShieldAlert className="w-[1.2em] h-[1.2em] mr-1 text-violet-400" /></span> F1. Atención a la diversidad
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-caption text-muted mb-2">Estrategias para adaptar la enseñanza a las características del alumnado.</p>
            <textarea
              value={config_contexto["F1_diversidad"] || ""}
              onChange={e => handleChange("F1_diversidad", e.target.value)}
              placeholder="Medidas de inclusión y atención a las diferencias individuales..."
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Inclusión — resumen general</label>
            <textarea
              value={config_contexto.inclusion || ""}
              onChange={e => handleChange("inclusion", e.target.value)}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Atención a la diversidad (Adaptaciones no significativas)</label>
            <textarea
              value={config_aula["Atención a la diversidad"] || ""}
              onChange={e => handleAulaChange("Atención a la diversidad", e.target.value)}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Plan de Atención a la Diversidad (DUA) */}
      <div className="glass-card p-6 border-t-4 border-t-emerald-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><Puzzle className="w-[1.2em] h-[1.2em] mr-1 text-emerald-400" /></span> Plan de Atención a la Diversidad (DUA)
        </h2>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-left text-body border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--glass-border)] text-muted">
                <th className="p-2 w-16">Id</th>
                <th className="p-2 w-48">Alumnado / Aula</th>
                <th className="p-2 w-48">Barrera detectada</th>
                <th className="p-2 min-w-[200px]">Medida metodológica</th>
                <th className="p-2 w-48">Medida de acceso</th>
                <th className="p-2 w-48">Medida de evaluación</th>
                <th className="p-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {df_dua.map((row: any, idx: number) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-foreground/5">
                  <td className="p-2 font-mono text-caption">{row.ID}</td>
                  <td className="p-2 pr-2">
                    <input type="text" value={row.Alumnado_Aula || ""} onChange={e => updateDuaRow(idx, "Alumnado_Aula", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-success focus:outline-none" />
                  </td>
                  <td className="p-2 pr-2">
                    <input type="text" value={row.Barrera || ""} onChange={e => updateDuaRow(idx, "Barrera", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-success focus:outline-none" />
                  </td>
                  <td className="p-2 pr-2">
                    <input type="text" value={row.Medida_Metodologica || ""} onChange={e => updateDuaRow(idx, "Medida_Metodologica", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-success focus:outline-none" />
                  </td>
                  <td className="p-2 pr-2">
                    <input type="text" value={row.Medida_Acceso || ""} onChange={e => updateDuaRow(idx, "Medida_Acceso", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-success focus:outline-none" />
                  </td>
                  <td className="p-2 pr-2">
                    <input type="text" value={row.Medida_Evaluacion || ""} onChange={e => updateDuaRow(idx, "Medida_Evaluacion", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-success focus:outline-none" />
                  </td>
                  <td className="p-2 text-center">
                    <button onClick={() => removeDuaRow(idx)} className="text-danger hover:text-danger font-bold">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addDuaRow} className="text-body text-success hover:text-success font-semibold flex items-center gap-1">
          <span>+</span> Añadir medida de Diversidad
        </button>
      </div>

      {/* Panel ACNEAE */}
      <div className="glass-card p-6 border-t-4 border-t-pink-500">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground">
            <span className="inline-flex"><Users className="w-[1.2em] h-[1.2em] mr-1 text-pink-400" /></span> Panel de ACNEAE
          </h2>
          <Button size="sm" variant="secondary" onClick={addAcneae} className="gap-2">
            <Plus className="w-4 h-4" /> Añadir Alumno
          </Button>
        </div>
        <p className="text-caption text-muted mb-4">
          Registro de Alumnado con Necesidad Específica de Apoyo Educativo y sus adaptaciones asociadas.
        </p>

        {acneae.length === 0 ? (
          <div className="text-center py-8 bg-white/5 rounded-lg border border-white/10">
            <p className="text-muted text-body">No hay alumnos ACNEAE registrados en este módulo.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {acneae.map((student: any, index: number) => (
              <div key={student.id} className="p-4 bg-white/5 border border-white/10 rounded-lg relative group">
                <button 
                  onClick={() => removeAcneae(student.id)}
                  className="absolute top-4 right-4 text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar registro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                  <div>
                    <label className="text-caption font-semibold text-muted block mb-1">Nombre / Identificador</label>
                    <input 
                      type="text" 
                      value={student.nombre}
                      onChange={(e) => updateAcneae(student.id, "nombre", e.target.value)}
                      placeholder="Ej. Alumno A"
                      className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-2 text-body text-foreground focus:border-info focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-caption font-semibold text-muted block mb-1">Tipo de Necesidad</label>
                    <input 
                      type="text" 
                      value={student.tipoNecesidad}
                      onChange={(e) => updateAcneae(student.id, "tipoNecesidad", e.target.value)}
                      placeholder="Ej. Dislexia, TEA, Altas capacidades..."
                      className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-2 text-body text-foreground focus:border-info focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-caption font-semibold text-muted block mb-2">Adaptaciones de evaluación y acceso</label>
                  <div className="flex flex-wrap gap-2">
                    {adaptacionesList.map(adapt => {
                      const isSelected = (student.adaptaciones || []).includes(adapt);
                      return (
                        <button
                          key={adapt}
                          onClick={() => toggleAdaptacion(student.id, adapt)}
                          className={`text-caption px-3 py-1.5 rounded-full border transition-colors ${
                            isSelected 
                              ? 'bg-pink-500/20 border-pink-500/50 text-pink-200' 
                              : 'bg-white/5 border-white/10 text-muted hover:bg-white/10'
                          }`}
                        >
                          {adapt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
