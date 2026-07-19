import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Crosshair, ListChecks } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Indicador, CriterioEvaluacion } from '@/types';

export function IndicadoresTab() {
  const { moduleData, updateModuleData } = useAppStore();
  const indicadores: Indicador[] = moduleData?.df_indicadores || [];
  const ces: CriterioEvaluacion[] = moduleData?.df_ce || [];
  
  // Agrupar indicadores por CE
  const indicadoresPorCE = ces.map(ce => ({
    ce,
    inds: indicadores.filter(ind => ind.id_ce === ce.id_ce)
  }));

  const handleAdd = (id_ce: string) => {
    const newId = `IND_${id_ce}_${(indicadores.filter(i => i.id_ce === id_ce).length + 1).toString().padStart(2, '0')}`;
    const newInd: Indicador = {
      id_indicador: newId,
      id_ce: id_ce,
      descripcion: 'Nuevo indicador...',
      peso: 1,
      is_basico: false
    };
    updateModuleData('df_indicadores', [...indicadores, newInd]);
  };

  const handleUpdate = (id: string, field: keyof Indicador, value: any) => {
    const updated = indicadores.map(i => i.id_indicador === id ? { ...i, [field]: value } : i);
    updateModuleData('df_indicadores', updated);
  };

  const handleDelete = (id: string) => {
    const updated = indicadores.filter(i => i.id_indicador !== id);
    updateModuleData('df_indicadores', updated);
  };

  if (ces.length === 0) {
    return (
      <Card className="p-12 text-center border border-dashed border-[var(--glass-border)] bg-foreground/5">
        <ListChecks className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-foreground mb-2">Faltan Criterios de Evaluación</h3>
        <p className="text-muted mb-6">Añade Criterios de Evaluación (CE) en la pestaña Matrices antes de crear Indicadores.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <span className="inline-flex"><Crosshair className="w-[1.2em] h-[1.2em] mr-1" /></span> Indicadores de Evaluación
          </h2>
          <p className="text-muted mt-1">Desglosa los Criterios de Evaluación (CE) en indicadores medibles y observables.</p>
        </div>
      </div>

      <div className="space-y-6">
        {indicadoresPorCE.map(({ ce, inds }) => (
          <Card key={ce.id_ce} className="p-0 overflow-hidden bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <div className="bg-foreground/5 p-4 border-b border-[var(--glass-border)] flex justify-between items-center">
              <div>
                <h3 className="font-bold text-info font-mono text-lg">{ce.id_ce}</h3>
                <p className="text-sm text-foreground mt-1">{ce.desc_ce}</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => handleAdd(ce.id_ce)} className="gap-2 shrink-0">
                <Plus className="w-4 h-4" /> Añadir Indicador
              </Button>
            </div>
            
            <div className="p-4 bg-background">
              {inds.length === 0 ? (
                <p className="text-muted text-sm italic py-2 text-center">No hay indicadores definidos para este CE.</p>
              ) : (
                <div className="space-y-2">
                  {inds.map(ind => (
                    <div key={ind.id_indicador} className="flex gap-3 items-start group p-2 hover:bg-foreground/5 rounded transition-colors">
                      <div className="w-20 shrink-0">
                        <input
                          className="font-mono text-xs text-accent bg-transparent border-none p-1 focus:ring-1 focus:ring-accent w-full"
                          value={ind.id_indicador}
                          onChange={(e) => handleUpdate(ind.id_indicador, 'id_indicador', e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <textarea
                          className="w-full text-sm bg-foreground/10 border border-[var(--glass-border)] rounded p-2 text-foreground min-h-[60px]"
                          value={ind.descripcion}
                          onChange={(e) => handleUpdate(ind.id_indicador, 'descripcion', e.target.value)}
                          placeholder="Descripción medible del indicador..."
                        />
                      </div>
                      <div className="w-20 shrink-0 space-y-2">
                        <div>
                          <label className="text-[10px] text-muted block">Peso Rel.</label>
                          <input
                            type="number"
                            className="w-full bg-foreground/10 border border-[var(--glass-border)] rounded p-1 text-xs text-center"
                            value={ind.peso}
                            onChange={(e) => handleUpdate(ind.id_indicador, 'peso', Number(e.target.value))}
                          />
                        </div>
                        <label className="flex items-center gap-1 text-[10px] text-muted cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ind.is_basico}
                            onChange={(e) => handleUpdate(ind.id_indicador, 'is_basico', e.target.checked)}
                          />
                          Básico
                        </label>
                      </div>
                      <div className="shrink-0 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleDelete(ind.id_indicador)} className="text-error hover:bg-error/10 p-1.5 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
