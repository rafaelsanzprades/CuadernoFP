"use client";
import { ListChecks } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { INSTRUMENTOS_EVALUACION, INSTRUMENTOS_CALIFICACION } from "@/data/instrumentosEvaluacion";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "@/components/ui/SectionHeading";

// Catálogo de instrumentos de evaluación y de calificación (PRU-OBJ, RUBR…) que usa la programación. Vivía en
// Metodologías › Recursos y espacios; aquí es donde se decide cómo se evalúa. Guarda en moduleData.instrumentos_seleccionados.
export function CatalogoInstrumentos() {
  const { t } = useTranslation();
  const { moduleData, updateModuleData } = useAppStore();
  const seleccionados: string[] = moduleData?.instrumentos_seleccionados || [];

  const toggle = (id: string) => {
    const updated = seleccionados.includes(id) ? seleccionados.filter((i) => i !== id) : [...seleccionados, id];
    updateModuleData("instrumentos_seleccionados", updated);
  };

  const rejilla = (lista: { id: string; label: string }[], prefijo: string) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {lista.map((inst) => {
        const isSelected = seleccionados.includes(inst.id);
        return (
          <label key={inst.id} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${isSelected ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggle(inst.id)}
              className="rounded border-white/20 bg-transparent text-amber-500 focus:ring-amber-500"
            />
            <span className="text-caption"><strong>{inst.id}</strong> - {t(`checks.modulo.${prefijo}_${inst.id.toLowerCase().replace(/-/g, '_')}`, {defaultValue: inst.label})}</span>
          </label>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      <SectionHeading id="instrumentos-catalogo" icon={ListChecks} scrollMt="260px">
        {t('campos.instrumentos.catalogoTitulo', {defaultValue: 'Catálogo de instrumentos de evaluación y de calificación'})}
      </SectionHeading>
      <div className="glass-card p-6 border-t-4 border-t-amber-500">
        <div className="space-y-6">
          <div>
            <label className="text-body font-semibold text-foreground mb-2 block">{t('campos.modulo.instrumentosEvaluacionLabel', {defaultValue: 'Instrumentos de evaluación'})}</label>
            <p className="text-caption text-muted mb-3">{t('campos.modulo.instrumentosEvaluacionDesc', {defaultValue: 'La actividad que genera la evidencia: qué hace el alumnado.'})}</p>
            {rejilla(INSTRUMENTOS_EVALUACION, 'instEval')}
          </div>
          <div>
            <label className="text-body font-semibold text-foreground mb-2 block">{t('campos.modulo.instrumentosCalificacionLabel', {defaultValue: 'Instrumentos de calificación'})}</label>
            <p className="text-caption text-muted mb-3">{t('campos.modulo.instrumentosCalificacionDesc', {defaultValue: 'Lo que puntúa esa evidencia: la rúbrica o escala aplicada.'})}</p>
            {rejilla(INSTRUMENTOS_CALIFICACION, 'instCalif')}
          </div>
        </div>
      </div>
    </div>
  );
}
