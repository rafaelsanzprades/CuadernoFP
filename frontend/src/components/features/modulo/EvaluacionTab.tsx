"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export function EvaluacionTab() {
  const { moduleData, updateInfoModulo } = useAppStore();

  const data = moduleData?.info_modulo || {};

  const sumaTrimestres = (data.pond_1t || 0) + (data.pond_2t || 0) + (data.pond_3t || 0);
  const sumaCriterios =
    (data.criterio_conocimiento || 0) +
    (data.criterio_procedimiento_practicas || 0) +
    (data.criterio_procedimiento_ejercicios || 0) +
    (data.criterio_tareas || 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <Card className="p-6 border-l-4 border-l-accent">
        <h4 className="text-lg font-bold text-foreground mb-6 flex items-center justify-between">
          <span className="flex items-center gap-2"><span>⚖️</span> % Ponderación por trimestres</span>
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${sumaTrimestres === 100 ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
            {sumaTrimestres}% {sumaTrimestres !== 100 && "(Debe sumar 100%)"}
          </span>
        </h4>
        <div className="grid grid-cols-3 gap-6">
          {[['pond_1t', '1er trimestre (%)'], ['pond_2t', '2º trimestre (%)'], ['pond_3t', '3er trimestre (%)']].map(([k, label]) => (
            <Input 
              key={k}
              label={label}
              type="number" value={data[k] || 0} onChange={e => updateInfoModulo(k, Number(e.target.value))}
              className="text-center" 
            />
          ))}
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-purple-500">
        <h4 className="text-lg font-bold text-foreground mb-6 flex items-center justify-between">
          <span className="flex items-center gap-2"><span>🧾</span> % Instrumentos de evaluación</span>
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${sumaCriterios === 100 ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
            {sumaCriterios}% {sumaCriterios !== 100 && "(Debe sumar 100%)"}
          </span>
        </h4>
        <div className="grid grid-cols-4 gap-6">
          {[
            ['criterio_conocimiento', 'Exámenes teóricos'],
            ['criterio_procedimiento_practicas', 'Exámenes prácticos'],
            ['criterio_procedimiento_ejercicios', 'Informes de ejercicios'],
            ['criterio_tareas', 'Cuaderno de tareas'],
          ].map(([k, label]) => (
            <Input 
              key={k}
              label={label}
              type="number" value={data[k] || 0} onChange={e => updateInfoModulo(k, Number(e.target.value))}
              className="text-center" 
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
