"use client";
import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { AlertTriangle, Table } from "lucide-react";

export function MatrizCalificacionesTab() {
  const { moduleData, cursoData, updateCursoData } = useAppStore();
  const [corte, setCorte] = useState("Ev1");

  const df_al = cursoData?.df_al || [];
  const df_eval = cursoData?.df_eval || [];
  const df_act = moduleData?.df_act || [];

  const df_evaluable = df_al.filter((al: any) => al.Estado !== "Baja");

  // Filter activities based on the selected cut
  // We assume: Ev1 -> 1T, Ev2 -> 2T, Ev3 -> 3T, Ordinaria -> all, Extraordinaria -> only 'Rec'
  const acts_to_show = df_act.filter((act: any) => {
    if (corte === "Ev1") return act.tri_act === "1T" || act.tri_act === "Ev1";
    if (corte === "Ev2") return act.tri_act === "2T" || act.tri_act === "Ev2";
    if (corte === "Ev3") return act.tri_act === "3T" || act.tri_act === "Ev3";
    if (corte === "Ordinaria") return act.recuperacion === "No" || !act.recuperacion;
    if (corte === "Extraordinaria") return act.recuperacion && act.recuperacion !== "No";
    return true;
  });

  const handleUpdateNota = (al_id: string, act_id: string, val: string) => {
    const numVal = parseFloat(val);
    const newEval = [...df_eval];
    let evRowIdx = newEval.findIndex((e: any) => e.ID === al_id);
    
    if (evRowIdx === -1) {
      newEval.push({ ID: al_id, Nota_Final: 0 });
      evRowIdx = newEval.length - 1;
    }
    
    newEval[evRowIdx][act_id] = isNaN(numVal) ? "" : numVal;
    updateCursoData("df_eval", newEval);
  };

  const handleModificacionManual = (al_id: string, val: string, justificacion: string) => {
    const numVal = parseFloat(val);
    const newEval = [...df_eval];
    let evRowIdx = newEval.findIndex((e: any) => e.ID === al_id);
    if (evRowIdx === -1) {
      newEval.push({ ID: al_id, Nota_Final: 0 });
      evRowIdx = newEval.length - 1;
    }
    newEval[evRowIdx]["Nota_Final_Manual"] = isNaN(numVal) ? "" : numVal;
    newEval[evRowIdx]["Justificacion_Manual"] = justificacion;
    updateCursoData("df_eval", newEval);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      
      {/* Controles superiores */}
      <div className="flex justify-between items-center glass-card p-4 border-t-4 border-t-emerald-500">
        <div className="flex items-center gap-4">
          <label className="font-semibold text-sm text-foreground">Corte de Evaluación:</label>
          <select 
            value={corte} 
            onChange={(e) => setCorte(e.target.value)}
            className="bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="Ev1">1ª Evaluación (Ev1)</option>
            <option value="Ev2">2ª Evaluación (Ev2)</option>
            <option value="Ev3">3ª Evaluación (Ev3)</option>
            <option value="Ordinaria">Evaluación Final Ordinaria</option>
            <option value="Extraordinaria">Evaluación Final Extraordinaria</option>
          </select>
        </div>
      </div>

      {/* Matriz Excel-like */}
      <div className="bg-foreground/5 rounded-lg border border-[var(--glass-border)] overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-background text-muted border-b border-[var(--glass-border)]">
              <th className="p-3 sticky left-0 z-20 bg-background border-r border-[var(--glass-border)] min-w-[250px]">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4" /> Alumnado
                </div>
              </th>
              {acts_to_show.map((act: any) => (
                <th key={act.id_act} className="p-3 text-center border-r border-[var(--glass-border)] min-w-[100px]" title={act.desc_act}>
                  <div className="font-mono text-emerald-400 mb-1">{act.id_act}</div>
                  <div className="text-xs font-normal truncate max-w-[120px]">{act.desc_act}</div>
                  {act.recuperacion && act.recuperacion !== "No" && (
                    <span className="bg-rose-500/20 text-rose-300 text-[10px] px-1.5 rounded">{act.recuperacion}</span>
                  )}
                </th>
              ))}
              <th className="p-3 text-center border-r border-[var(--glass-border)] min-w-[120px] bg-emerald-500/10">
                Nota Calculada
              </th>
              <th className="p-3 text-center min-w-[200px] bg-amber-500/10">
                Mod. Manual / Justificación
              </th>
            </tr>
          </thead>
          <tbody>
            {df_evaluable.map((al: any) => {
              const evRow = df_eval.find((e: any) => e.ID === al.ID) || {};
              const faltas = Number(al.Faltas || 0);
              const pdevc = faltas > 15; // Placeholder threshold
              
              return (
                <tr key={al.ID} className="border-b border-white/5 hover:bg-foreground/10 transition-colors">
                  <td className="p-3 sticky left-0 z-10 bg-background group-hover:bg-[#1e293b] border-r border-[var(--glass-border)] flex items-center justify-between">
                    <span className="font-semibold">{al.Apellidos}, {al.Nombre}</span>
                    {pdevc && (
                      <span title="Alerta Abandono (PDEvC): >15% faltas">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                      </span>
                    )}
                  </td>
                  
                  {acts_to_show.map((act: any) => (
                    <td key={act.id_act} className="p-1 border-r border-[var(--glass-border)] text-center">
                      <input 
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={evRow[act.id_act] !== undefined ? evRow[act.id_act] : ""}
                        onChange={(e) => handleUpdateNota(al.ID, act.id_act, e.target.value)}
                        className="w-full text-center bg-transparent border-none focus:ring-1 focus:ring-emerald-500 rounded p-2 outline-none font-mono"
                      />
                    </td>
                  ))}
                  
                  <td className="p-3 text-center font-bold font-mono text-lg border-r border-[var(--glass-border)] bg-emerald-500/5">
                    {Number(evRow.Nota_Final || 0).toFixed(2)}
                  </td>
                  
                  <td className="p-1 bg-amber-500/5 flex items-center gap-1">
                    <input 
                      type="number"
                      step="0.1"
                      placeholder="Nota"
                      value={evRow.Nota_Final_Manual !== undefined ? evRow.Nota_Final_Manual : ""}
                      onChange={(e) => handleModificacionManual(al.ID, e.target.value, evRow.Justificacion_Manual || "")}
                      className="w-20 text-center bg-black/20 border border-white/10 focus:border-amber-500 rounded p-1.5 outline-none font-mono text-sm"
                    />
                    <input 
                      type="text"
                      placeholder="Justificación..."
                      value={evRow.Justificacion_Manual || ""}
                      onChange={(e) => handleModificacionManual(al.ID, evRow.Nota_Final_Manual || "", e.target.value)}
                      className="flex-1 min-w-[100px] bg-black/20 border border-white/10 focus:border-amber-500 rounded p-1.5 outline-none text-xs"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
