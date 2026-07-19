import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash2, Check, FileEdit, Users, Settings2, BarChart2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Instrumento } from '@/types';

export function InstrumentosListTab() {
  const { moduleData, updateModuleData } = useAppStore();
  const instrumentos: Instrumento[] = moduleData?.df_instr || [];
  const indicadores = moduleData?.df_indicadores || [];
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    const newId = `INST${(instrumentos.length + 1).toString().padStart(3, '0')}`;
    const newInstr: Instrumento = {
      id_instrumento: newId,
      titulo: 'Nuevo Instrumento',
      tipo: 'rubrica',
      escala: 'continua_10',
      evaluacion: 'Ev1',
      agente: 'heteroevaluacion',
      peso_global: 1,
      indicadores_vinculados: []
    };
    updateModuleData('df_instr', [...instrumentos, newInstr]);
    setEditingId(newId);
  };

  const handleUpdate = (id: string, field: keyof Instrumento, value: any) => {
    const updated = instrumentos.map(i => i.id_instrumento === id ? { ...i, [field]: value } : i);
    updateModuleData('df_instr', updated);
  };

  const handleDelete = (id: string) => {
    const updated = instrumentos.filter(i => i.id_instrumento !== id);
    updateModuleData('df_instr', updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <span className="inline-flex"><FileEdit className="w-[1.2em] h-[1.2em] mr-1" /></span> Catálogo de Instrumentos
          </h2>
          <p className="text-muted mt-1">Define los instrumentos de evaluación (rúbricas, exámenes) y sus escalas de calificación.</p>
        </div>
        <Button variant="primary" onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Añadir Instrumento
        </Button>
      </div>

      {instrumentos.length === 0 ? (
        <Card className="p-12 text-center border border-dashed border-[var(--glass-border)] bg-foreground/5">
          <Settings2 className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-foreground mb-2">No hay instrumentos definidos</h3>
          <p className="text-muted mb-6">Añade tu primer instrumento de evaluación para comenzar a calificar.</p>
          <Button variant="secondary" onClick={handleAdd}>
            Añadir Instrumento
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instrumentos.map(instr => (
            <Card key={instr.id_instrumento} className="p-5 bg-[var(--glass-bg)] border border-[var(--glass-border)] relative group">
              <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                <button onClick={() => handleDelete(instr.id_instrumento)} className="text-error hover:bg-error/10 p-1.5 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-3 items-center mb-4 pr-12">
                <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-sm shrink-0">
                  {instr.evaluacion}
                </div>
                <div>
                  <input
                    className="font-bold text-lg bg-transparent border-none p-0 focus:ring-0 text-foreground w-full placeholder-muted"
                    value={instr.titulo}
                    onChange={(e) => handleUpdate(instr.id_instrumento, 'titulo', e.target.value)}
                    placeholder="Título del instrumento"
                  />
                  <div className="text-xs text-muted font-mono">{instr.id_instrumento}</div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted uppercase font-bold mb-1 block">Tipo</label>
                    <select
                      className="w-full bg-foreground/10 border border-[var(--glass-border)] rounded p-1.5 text-foreground text-xs"
                      value={instr.tipo}
                      onChange={(e) => handleUpdate(instr.id_instrumento, 'tipo', e.target.value)}
                    >
                      <option value="rubrica">Rúbrica</option>
                      <option value="lista_control">Lista de control</option>
                      <option value="escala_valoracion">Escala de valoración</option>
                      <option value="prueba_objetiva">Prueba objetiva (Test)</option>
                      <option value="registro_observacion">Observación</option>
                      <option value="diario">Diario de clase</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted uppercase font-bold mb-1 block">Escala</label>
                    <select
                      className="w-full bg-foreground/10 border border-[var(--glass-border)] rounded p-1.5 text-foreground text-xs"
                      value={instr.escala}
                      onChange={(e) => handleUpdate(instr.id_instrumento, 'escala', e.target.value)}
                    >
                      <option value="continua_10">Continua (1-10)</option>
                      <option value="discreta_4">Discreta (1-4)</option>
                      <option value="discreta_letras">Letras (A-D)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted uppercase font-bold mb-1 block flex items-center gap-1"><Users className="w-3 h-3" /> Agente</label>
                    <select
                      className="w-full bg-foreground/10 border border-[var(--glass-border)] rounded p-1.5 text-foreground text-xs"
                      value={instr.agente}
                      onChange={(e) => handleUpdate(instr.id_instrumento, 'agente', e.target.value)}
                    >
                      <option value="heteroevaluacion">Profesor (Hetero)</option>
                      <option value="coevaluacion">Alumnos (Co-eval)</option>
                      <option value="autoevaluacion">Alumno (Auto-eval)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted uppercase font-bold mb-1 block flex items-center gap-1"><BarChart2 className="w-3 h-3" /> Evaluación</label>
                    <select
                      className="w-full bg-foreground/10 border border-[var(--glass-border)] rounded p-1.5 text-foreground text-xs"
                      value={instr.evaluacion}
                      onChange={(e) => handleUpdate(instr.id_instrumento, 'evaluacion', e.target.value)}
                    >
                      <option value="Ev1">1ª Evaluación</option>
                      <option value="Ev2">2ª Evaluación</option>
                      <option value="Ev3">3ª Evaluación</option>
                      <option value="EvFO">Final Ordinaria</option>
                      <option value="EvFE">Final Extraordinaria</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--glass-border)] mt-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted">Indicadores vinculados:</span>
                    <span className="font-bold text-accent px-2 py-0.5 bg-accent/10 rounded-full">
                      {instr.indicadores_vinculados?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
