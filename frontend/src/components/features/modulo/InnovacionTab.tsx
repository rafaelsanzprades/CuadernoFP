"use client";
import { Rocket } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function InnovacionTab() {
  const { t } = useTranslation();
  const { moduleData, updateModuleData } = useAppStore();
  const config_contexto = moduleData?.config_contexto || {};

  const handleChange = (field: string, value: any) => {
    updateModuleData("config_contexto", { ...config_contexto, [field]: value });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Innovación y Proyectos */}
      <div className="space-y-3">
      <SectionHeading id="metodologia-innovacion" icon={Rocket} scrollMt="260px">
        {t('campos.modulo.tituloInnovacionIntermodularidad', {defaultValue: 'Innovación e intermodularidad'})}
      </SectionHeading>
      <div className="glass-card p-6 border-t-4 border-t-amber-500">
        <div className="space-y-6">
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">{t('campos.modulo.registroInnovacionLabel', {defaultValue: 'Registro de innovación'})}</label>
            <p className="text-caption text-muted mb-2">{t('campos.modulo.registroInnovacionDesc', {defaultValue: 'Proyectos de emprendimiento, metodologías activas y proyectos de equidad/DUA.'})}</p>
            <textarea
              value={config_contexto["registro_innovacion"] || ""}
              onChange={e => handleChange("registro_innovacion", e.target.value)}
              placeholder={t('placeholders.modulo.proyectosInnovacion', {defaultValue: 'Describe los proyectos de innovación del módulo...'})}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>

          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">{t('campos.modulo.ipeIntermodularLabel', {defaultValue: 'IPE y proyecto intermodular continuo'})}</label>
            <p className="text-caption text-muted mb-2">{t('campos.modulo.ipeIntermodularDesc', {defaultValue: 'Vinculación con el Itinerario Personal para la Empleabilidad o participación en el Proyecto Intermodular (D 91/2024).'})}</p>
            <textarea
              value={config_contexto["ipe_intermodular"] || ""}
              onChange={e => handleChange("ipe_intermodular", e.target.value)}
              placeholder={t('placeholders.modulo.proyectosIntermodulares', {defaultValue: 'Detalla la participación en proyectos intermodulares...'})}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>

          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">{t('campos.modulo.medidasBilingueLabel', {defaultValue: 'Medidas complementarias en proyectos o bilingües (apartado L, modelo simplificado, pd=)'})}</label>
            <p className="text-caption text-muted mb-2">{t('campos.modulo.medidasBilingueDesc', {defaultValue: 'En su caso, medidas para el tratamiento del módulo dentro de proyectos o itinerarios bilingües. Si se deja vacío, se indica que no aplica.'})}</p>
            <textarea
              value={config_contexto["texto_medidas_bilingue"] || ""}
              onChange={e => handleChange("texto_medidas_bilingue", e.target.value)}
              placeholder={t('placeholders.modulo.medidasBilingue', {defaultValue: 'Ej: Glosario técnico bilingüe, materiales adaptados, evaluación bilingüe...'})}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>

        </div>
      </div>
      </div>

    </div>
  );
}
