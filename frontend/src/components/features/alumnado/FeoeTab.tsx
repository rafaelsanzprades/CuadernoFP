import React from "react";
import { useAppStore } from "@/store/useAppStore";
import { Building2, Save } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function FeoeTab() {
  const { cursoData, updateCursoData } = useAppStore();

  const df_al = cursoData?.df_al || [];
  const df_feoe = cursoData?.df_feoe || [];
  const df_evaluable = df_al.filter((al: any) => al.Estado !== "Baja");

  const handleUpdateFeoe = (al_id: string, field: string, value: any) => {
    const newFeoe = [...df_feoe];
    let rowIdx = newFeoe.findIndex((r: any) => r.ID === al_id);
    if (rowIdx === -1) {
      newFeoe.push({ ID: al_id });
      rowIdx = newFeoe.length - 1;
    }
    newFeoe[rowIdx][field] = value;
    updateCursoData("df_feoe", newFeoe);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <Card className="p-6 border-t-4 border-t-indigo-500">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <span className="inline-flex"><Building2 className="w-[1.2em] h-[1.2em] mr-1 text-indigo-400" /></span> 
            Formación en Empresa (FEOE) / FP Dual
          </h2>
          <span className="text-sm text-muted bg-foreground/10 px-3 py-1 rounded-full">
            Alumnos activos: {df_evaluable.length}
          </span>
        </div>

        <div className="overflow-x-auto bg-foreground/5 rounded-lg border border-[var(--glass-border)]">
          <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-background text-muted border-b border-[var(--glass-border)]">
                <th className="p-3 font-semibold border-r border-[var(--glass-border)]">Alumnado</th>
                <th className="p-3 font-semibold border-r border-[var(--glass-border)] text-center">Régimen</th>
                <th className="p-3 font-semibold border-r border-[var(--glass-border)]">Empresa y NIF</th>
                <th className="p-3 font-semibold border-r border-[var(--glass-border)]">Tutor de Empresa</th>
                <th className="p-3 font-semibold border-r border-[var(--glass-border)] text-center">Horas</th>
                <th className="p-3 font-semibold text-center">Evaluación Empresa (1-4)</th>
              </tr>
            </thead>
            <tbody>
              {df_evaluable.map((al: any) => {
                const row = df_feoe.find((r: any) => r.ID === al.ID) || { ID: al.ID };
                return (
                  <tr key={al.ID} className="border-b border-white/5 hover:bg-foreground/5 transition-colors">
                    <td className="p-3 font-medium sticky left-0 z-10 bg-background border-r border-[var(--glass-border)]">
                      {al.Apellidos}, {al.Nombre}
                    </td>
                    <td className="p-2 border-r border-[var(--glass-border)]">
                      <select 
                        value={row.Regimen || "General"}
                        onChange={(e) => handleUpdateFeoe(al.ID, "Regimen", e.target.value)}
                        className="w-full bg-transparent border border-transparent hover:border-[var(--glass-border)] focus:bg-foreground/5 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-center"
                      >
                        <option value="General">General</option>
                        <option value="Intensivo">Intensivo</option>
                        <option value="Exento">Exento (Art. 49)</option>
                      </select>
                    </td>
                    <td className="p-2 border-r border-[var(--glass-border)]">
                      <input 
                        type="text"
                        placeholder="Nombre de la empresa..."
                        value={row.Empresa || ""}
                        onChange={(e) => handleUpdateFeoe(al.ID, "Empresa", e.target.value)}
                        className="w-full min-w-[200px] bg-transparent border border-transparent hover:border-[var(--glass-border)] focus:bg-foreground/5 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-muted/40"
                      />
                    </td>
                    <td className="p-2 border-r border-[var(--glass-border)]">
                      <input 
                        type="text"
                        placeholder="Nombre y correo del tutor..."
                        value={row.TutorEmpresa || ""}
                        onChange={(e) => handleUpdateFeoe(al.ID, "TutorEmpresa", e.target.value)}
                        className="w-full min-w-[200px] bg-transparent border border-transparent hover:border-[var(--glass-border)] focus:bg-foreground/5 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-muted/40"
                      />
                    </td>
                    <td className="p-2 border-r border-[var(--glass-border)]">
                      <input 
                        type="number"
                        placeholder="H"
                        value={row.Horas || ""}
                        onChange={(e) => handleUpdateFeoe(al.ID, "Horas", e.target.value)}
                        className="w-20 text-center mx-auto block bg-transparent border border-transparent hover:border-[var(--glass-border)] focus:bg-foreground/5 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={row.Evaluacion || ""}
                        onChange={(e) => handleUpdateFeoe(al.ID, "Evaluacion", e.target.value)}
                        className={`w-24 text-center mx-auto block font-bold bg-transparent border border-transparent hover:border-[var(--glass-border)] focus:bg-foreground/5 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${
                          !row.Evaluacion ? 'text-muted/50' : 
                          Number(row.Evaluacion) < 2 ? 'text-danger' : 'text-success'
                        }`}
                      >
                        <option value="">-</option>
                        <option value="1" className="text-danger">1 - Insuf.</option>
                        <option value="2" className="text-success">2 - Suficiente</option>
                        <option value="3" className="text-success">3 - Notable</option>
                        <option value="4" className="text-success">4 - Excelente</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
