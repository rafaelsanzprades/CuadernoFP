"use client";
import React, { useState, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { AlertTriangle, Table, Calculator, Save } from "lucide-react";
import { Calificacion, Indicador, Instrumento } from "@/types";
import { Button } from "@/components/ui/Button";

export function MatrizCalificacionesTab() {
  const { moduleData, cursoData, updateCursoData } = useAppStore();
  const [corte, setCorte] = useState("Ev1");

  const df_al = cursoData?.df_al || [];
  const df_calificaciones = cursoData?.df_calificaciones || [];
  const df_instr = moduleData?.df_instr || [];
  const df_indicadores = moduleData?.df_indicadores || [];

  const df_evaluable = df_al.filter((al: any) => al.Estado !== "Baja");

  // Filtramos instrumentos según el corte
  const instrumentos_corte = useMemo(() => {
    return df_instr.filter(inst => {
      if (corte === "EvFO") return inst.evaluacion === "EvFO" || inst.evaluacion.startsWith("Ev");
      if (corte === "EvFE") return inst.evaluacion === "EvFE";
      return inst.evaluacion === corte;
    });
  }, [df_instr, corte]);

  // Expandimos instrumentos en columnas por cada indicador vinculado
  const columnas = useMemo(() => {
    const cols: { inst: Instrumento; ind: Indicador }[] = [];
    instrumentos_corte.forEach(inst => {
      if (inst.indicadores_vinculados && inst.indicadores_vinculados.length > 0) {
        inst.indicadores_vinculados.forEach(indId => {
          const indObj = df_indicadores.find(i => i.id_indicador === indId);
          if (indObj) {
            cols.push({ inst, ind: indObj });
          }
        });
      } else {
        // Instrumento sin indicadores desglosados, evaluado globalmente
        cols.push({ inst, ind: { id_indicador: 'GLOBAL', id_ce: '', descripcion: 'Nota Global del Instrumento', peso: 1, is_basico: false } });
      }
    });
    return cols;
  }, [instrumentos_corte, df_indicadores]);

  // Mapa rápido de calificaciones
  const getNota = (id_alumno: string, id_instrumento: string, id_indicador: string) => {
    return df_calificaciones.find(
      (c: Calificacion) => c.id_alumno === id_alumno && c.id_instrumento === id_instrumento && c.id_indicador === id_indicador
    )?.valor ?? "";
  };

  const handleUpdateNota = (id_alumno: string, id_instrumento: string, id_indicador: string, val: string) => {
    const numVal = val === "" ? null : parseFloat(val);
    const updated = [...df_calificaciones];
    const idx = updated.findIndex(c => c.id_alumno === id_alumno && c.id_instrumento === id_instrumento && c.id_indicador === id_indicador);
    
    if (idx >= 0) {
      if (numVal === null) {
        updated.splice(idx, 1);
      } else {
        updated[idx].valor = numVal;
        updated[idx].timestamp = Date.now();
      }
    } else if (numVal !== null) {
      updated.push({
        id_calificacion: `${id_alumno}_${id_instrumento}_${id_indicador}`,
        id_alumno,
        id_instrumento,
        id_indicador,
        valor: numVal,
        timestamp: Date.now()
      });
    }

    updateCursoData("df_calificaciones", updated);
  };

  const calcularMediaAlumno = (id_alumno: string) => {
    let sum = 0;
    let count = 0;
    columnas.forEach(col => {
      const val = getNota(id_alumno, col.inst.id_instrumento, col.ind.id_indicador);
      if (val !== "") {
        sum += Number(val);
        count++;
      }
    });
    return count > 0 ? Math.round(sum / count).toString() : "0";
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      
      {/* Controles superiores */}
      <div className="flex justify-between items-center bg-[var(--glass-bg)] p-4 border-t-4 border-t-accent border-x border-b border-[var(--glass-border)] rounded-b-lg">
        <div className="flex items-center gap-4">
          <label className="font-semibold text-sm text-foreground">Corte de Evaluación:</label>
          <select 
            value={corte} 
            onChange={(e) => setCorte(e.target.value)}
            className="bg-foreground/10 border border-[var(--glass-border)] rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-accent"
          >
            <option value="Ev1">1ª Evaluación (Ev1)</option>
            <option value="Ev2">2ª Evaluación (Ev2)</option>
            <option value="Ev3">3ª Evaluación (Ev3)</option>
            <option value="EvFO">Final Ordinaria (FO)</option>
            <option value="EvFE">Final Extraordinaria (FE)</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="secondary" size="sm" className="gap-2">
             <Calculator className="w-4 h-4" /> Recalcular Todo
           </Button>
        </div>
      </div>

      {/* Matriz Excel-like */}
      <div className="bg-[var(--glass-bg)] rounded-lg border border-[var(--glass-border)] overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-foreground/5 text-muted border-b border-[var(--glass-border)]">
              <th className="p-3 sticky left-0 z-20 bg-[var(--glass-bg)] border-r border-[var(--glass-border)] min-w-[250px] shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4" /> Alumnado
                </div>
              </th>
              {columnas.map((col, idx) => (
                <th key={`${col.inst.id_instrumento}_${col.ind.id_indicador}_${idx}`} className="p-2 text-center border-r border-[var(--glass-border)] min-w-[120px]" title={col.ind.descripcion}>
                  <div className="text-xs font-bold text-accent truncate max-w-[120px] mx-auto">{col.inst.titulo}</div>
                  <div className="font-mono text-xs text-info mt-1">{col.ind.id_indicador !== 'GLOBAL' ? col.ind.id_indicador : 'Nota Global'}</div>
                  <div className="text-xs bg-foreground/10 inline-block px-1.5 rounded mt-1">{col.inst.escala}</div>
                </th>
              ))}
              {columnas.length === 0 && (
                <th className="p-4 text-center italic text-muted">No hay instrumentos para este corte</th>
              )}
              <th className="p-3 text-center border-l-2 border-[var(--glass-border)] min-w-[120px] bg-accent/5">
                Media Ponderada
              </th>
            </tr>
          </thead>
          <tbody>
            {df_evaluable.map((al: any) => {
              const faltas = Number(al.Faltas || 0);
              const pdevc = faltas > 15; // Placeholder
              
              return (
                <tr key={al.ID} className="border-b border-[var(--glass-border)] hover:bg-foreground/5 transition-colors">
                  <td className="p-3 sticky left-0 z-10 bg-[var(--glass-bg)] group-hover:bg-[#1e293b] border-r border-[var(--glass-border)] flex items-center justify-between shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                    <span className="font-semibold text-foreground">{al.Apellidos}, {al.Nombre}</span>
                    {pdevc && (
                      <span title="Alerta abandono (PDEvC): >15% faltas">
                        <AlertTriangle className="w-4 h-4 text-error" />
                      </span>
                    )}
                  </td>
                  
                  {columnas.map((col, idx) => (
                    <td key={`${col.inst.id_instrumento}_${col.ind.id_indicador}_${idx}`} className="p-1 border-r border-[var(--glass-border)] text-center bg-background focus-within:bg-accent/5">
                      <input 
                        type={col.inst.escala.includes('letras') ? "text" : "number"}
                        step="1"
                        min="1"
                        max="10"
                        value={getNota(al.ID, col.inst.id_instrumento, col.ind.id_indicador)}
                        onChange={(e) => handleUpdateNota(al.ID, col.inst.id_instrumento, col.ind.id_indicador, e.target.value)}
                        className="w-full text-center bg-transparent border border-transparent focus:border-accent focus:ring-1 focus:ring-accent rounded p-1.5 outline-none font-mono text-foreground"
                      />
                    </td>
                  ))}

                  {columnas.length === 0 && <td className="bg-background"></td>}
                  
                  <td className="p-3 text-center font-bold font-mono text-lg border-l-2 border-[var(--glass-border)] bg-accent/5 text-foreground">
                    {calcularMediaAlumno(al.ID)}
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
