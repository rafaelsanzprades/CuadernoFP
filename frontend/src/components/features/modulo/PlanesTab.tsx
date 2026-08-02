"use client";
import { Bus, Puzzle, Shield, Info, Building2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { NarrativeField } from "@/components/ui/NarrativeField";

export function PlanesTab() {
  const { moduleData, updateDataFrame, updateModuleData } = useAppStore();

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

  const df_dua = moduleData?.df_dua || [];
  const df_contingencia = moduleData?.df_contingencia || [];
  const df_ace = moduleData?.df_ace || [];
  const df_ra = moduleData?.df_ra || [];

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
    <>
      <div className="space-y-8 animate-in fade-in duration-500">
      {/* DUA */}
      <section className="glass-card p-6 border-t-4 border-t-emerald-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><Puzzle className="w-[1.2em] h-[1.2em] mr-1" /></span> Plan de Atención a la diversidad
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
                    <input type="text" value={row.Alumnado_Aula || ""} onChange={e => updateRow(df_dua, "df_dua", idx, "Alumnado_Aula", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-success focus:outline-none" />
                  </td>
                  <td className="p-2 pr-2">
                    <input type="text" value={row.Barrera || ""} onChange={e => updateRow(df_dua, "df_dua", idx, "Barrera", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-success focus:outline-none" />
                  </td>
                  <td className="p-2 pr-2">
                    <input type="text" value={row.Medida_Metodologica || ""} onChange={e => updateRow(df_dua, "df_dua", idx, "Medida_Metodologica", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-success focus:outline-none" />
                  </td>
                  <td className="p-2 pr-2">
                    <input type="text" value={row.Medida_Acceso || ""} onChange={e => updateRow(df_dua, "df_dua", idx, "Medida_Acceso", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-success focus:outline-none" />
                  </td>
                  <td className="p-2 pr-2">
                    <input type="text" value={row.Medida_Evaluacion || ""} onChange={e => updateRow(df_dua, "df_dua", idx, "Medida_Evaluacion", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-success focus:outline-none" />
                  </td>
                  <td className="p-2 text-center">
                    <button onClick={() => removeRow(df_dua, "df_dua", idx)} className="text-danger hover:text-danger font-bold">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={() => addRow(df_dua, "df_dua", "DUA", { Alumnado_Aula: "", Barrera: "", Medida_Metodologica: "", Medida_Acceso: "", Medida_Evaluacion: "" })} className="text-body text-success hover:text-success font-semibold flex items-center gap-1">
          <span>+</span> Añadir medida de Diversidad
        </button>
      </section>

      {/* FEOE */}
      <section className="glass-card p-6 border-t-4 border-t-blue-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><Building2 className="w-[1.2em] h-[1.2em] mr-1" /></span> FEOE. Formación en Empresa u Organismo Equiparado
        </h2>
        <div className="space-y-6">
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
        </div>
      </section>

    </div>
    </>
  );
}

