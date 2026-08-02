"use client";
import { Shield, ShieldAlert } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";

export function ContingenciaTab() {
  const { moduleData, updateDataFrame, updateModuleData } = useAppStore();
  const { t } = useTranslation();
  const config_contexto = moduleData?.config_contexto || {};

  const handleChange = (field: string, value: any) => {
    updateModuleData("config_contexto", { ...config_contexto, [field]: value });
  };

  const CONTINGENCIA = [
    { id: "CONT-ASINC", label: "Docencia telemática asíncrona" },
    { id: "CONT-SINC", label: "Docencia telemática síncrona" },
    { id: "CONT-AUT", label: "Dosier de tareas autoguiadas" }
  ];

  const medidas_contingencia = moduleData?.medidas_contingencia || [];

  const toggleContingencia = (id: string) => {
    const updated = medidas_contingencia.includes(id) ? medidas_contingencia.filter((i: string) => i !== id) : [...medidas_contingencia, id];
    updateModuleData("medidas_contingencia", updated);
  };

  const df_contingencia = moduleData?.df_contingencia || [];

  const addRow = (dataFrame: any[], dfName: string, prefix: string, template: any) => {
    const newDf = [...dataFrame];
    const newId = `${prefix}${(newDf.length + 1).toString().padStart(2, '0')}`;
    newDf.push({ ID: newId, ...template });
    updateDataFrame(dfName as any, newDf);
  };

  const updateRow = (dataFrame: any[], dfName: string, idx: number, field: string, value: any) => {
    const newDf = [...dataFrame];
    newDf[idx][field] = value;
    updateDataFrame(dfName as any, newDf);
  };

  const removeRow = (dataFrame: any[], dfName: string, idx: number) => {
    const newDf = [...dataFrame];
    newDf.splice(idx, 1);
    updateDataFrame(dfName as any, newDf);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Medidas de contingencia (checkboxes) */}
      <div>
        <label className="text-body font-semibold text-foreground mb-2 block">Medidas de contingencia (selección múltiple)</label>
        <p className="text-caption text-muted mb-3">Estrategias generales de actuación ante la imposibilidad de impartir docencia presencial normal.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {CONTINGENCIA.map((cont) => {
            const isSelected = medidas_contingencia.includes(cont.id);
            return (
              <label key={cont.id} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${isSelected ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                <input 
                  type="checkbox" 
                  checked={isSelected}
                  onChange={() => toggleContingencia(cont.id)}
                  className="rounded border-white/20 bg-transparent text-orange-500 focus:ring-orange-500"
                />
                <span className="text-caption"><strong>{cont.id}</strong> - {cont.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-body font-semibold text-foreground mb-2 block">Anotaciones libres de contingencia</label>
        <textarea
          value={moduleData?.texto_contingencia_libre || ""}
          onChange={e => updateModuleData("texto_contingencia_libre", e.target.value)}
          placeholder="Añade aquí protocolos específicos o aclaraciones sobre el uso de recursos para docencia a distancia..."
          className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto mb-4">
        <table className="w-full text-left text-body border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-[var(--glass-border)] text-muted">
              <th className="p-2 w-16">Id</th>
              <th className="p-2 w-48">Escenario</th>
              <th className="p-2 min-w-[200px]">Organización y acceso</th>
              <th className="p-2 min-w-[200px]">Actividades alternativas</th>
              <th className="p-2 w-48">Seguimiento y corrección</th>
              <th className="p-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {df_contingencia.map((row: any, idx: number) => (
              <tr key={idx} className="border-b border-white/5 hover:bg-foreground/5">
                <td className="p-2 font-mono text-caption">{row.ID}</td>
                <td className="p-2 pr-2">
                  <select value={row.Escenario || "Otros"} onChange={e => updateRow(df_contingencia, "df_contingencia", idx, "Escenario", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-warning focus:outline-none">
                    <option value="Ausencia de Profesorado">Ausencia de profesorado</option>
                    <option value="Ausencia de Alumnado">Ausencia de alumnado</option>
                    <option value="Interrupción Generalizada">Interrupción generalizada</option>
                    <option value="Otros">Otros</option>
                  </select>
                </td>
                <td className="p-2 pr-2">
                  <input type="text" value={row.Organizacion || ""} onChange={e => updateRow(df_contingencia, "df_contingencia", idx, "Organizacion", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-warning focus:outline-none" />
                </td>
                <td className="p-2 pr-2">
                  <input type="text" value={row.Actividades || ""} onChange={e => updateRow(df_contingencia, "df_contingencia", idx, "Actividades", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-warning focus:outline-none" />
                </td>
                <td className="p-2 pr-2">
                  <input type="text" value={row.Seguimiento || ""} onChange={e => updateRow(df_contingencia, "df_contingencia", idx, "Seguimiento", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-warning focus:outline-none" />
                </td>
                <td className="p-2 text-center">
                  <button onClick={() => removeRow(df_contingencia, "df_contingencia", idx)} className="text-danger hover:text-danger font-bold">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={() => addRow(df_contingencia, "df_contingencia", "PC", { Escenario: "Otros", Organizacion: "", Actividades: "", Seguimiento: "" })} className="text-body text-warning hover:text-warning font-semibold flex items-center gap-1">
        <span>+</span> Añadir medida de Contingencia
      </button>

      {/* Plan de Contingencia (textos) */}
      <div className="glass-card p-6 border-t-4 border-t-rose-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><ShieldAlert className="w-[1.2em] h-[1.2em] mr-1 text-rose-400" /></span> Plan de Contingencia
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Ausencia prolongada del profesorado titular</label>
            <textarea
              value={config_contexto["contingencia_profesor"] || ""}
              onChange={e => handleChange("contingencia_profesor", e.target.value)}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Ausencia prolongada del alumnado por causas justificadas</label>
            <textarea
              value={config_contexto["contingencia_alumnado"] || ""}
              onChange={e => handleChange("contingencia_alumnado", e.target.value)}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Interrupción generalizada de las clases</label>
            <textarea
              value={config_contexto["contingencia_general"] || config_contexto["J3_contingencia"] || ""}
              onChange={e => handleChange("contingencia_general", e.target.value)}
              placeholder="Plataformas online, recursos a distancia..."
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
