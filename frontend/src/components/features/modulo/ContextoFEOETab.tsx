"use client";
import { Map , Info } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";

export function ContextoFEOETab() {
  const { t } = useTranslation();
  const { moduleData, updateModuleData } = useAppStore();
  const config_contexto = moduleData?.config_contexto || {};

  const handleChange = (field: string, value: string) => {
    updateModuleData("config_contexto", { ...config_contexto, [field]: value });
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-6 border-t-4 border-t-blue-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><Map className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('campos.modulo.tituloFeoeCorto', {defaultValue: 'FEOE'})}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">{t('campos.modulo.a1JustificacionLabel', {defaultValue: 'A1. Justificación de la programación'})}</label>
            <p className="text-caption text-muted mb-2">{t('campos.modulo.a1JustificacionDesc', {defaultValue: 'Base legislativa que fundamenta esta programación.'})}</p>
            <textarea
              value={config_contexto["A1_justificacion"] || ""}
              onChange={e => handleChange("A1_justificacion", e.target.value)}
              placeholder={t('placeholders.modulo.a1Justificacion', {defaultValue: 'Indicar base normativa, leyes de educación y reales decretos aplicables al título...'})}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">{t('campos.modulo.a2ContextualizacionLabel', {defaultValue: 'A2. Contextualización'})}</label>
            <p className="text-caption text-muted mb-2">{t('campos.modulo.a2ContextualizacionDesc', {defaultValue: 'Análisis del contexto donde se imparte la formación.'})}</p>
            <textarea
              value={config_contexto["A2_contextualizacion"] || ""}
              onChange={e => handleChange("A2_contextualizacion", e.target.value)}
              placeholder={t('placeholders.modulo.a2Contextualizacion', {defaultValue: 'Perfil profesional del título, archivos socioeconómico y características generales del centro...'})}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">{t('campos.modulo.b3VinculacionEmpresaLabel', {defaultValue: 'B3. Vinculación con la empresa colaboradora'})}</label>
            <p className="text-caption text-muted mb-2">{t('campos.modulo.b3VinculacionEmpresaDesc', {defaultValue: 'Relación entre el módulo y la formación en la empresa.'})}</p>
            <textarea
              value={config_contexto["B3_vinculacion_empresa"] || ""}
              onChange={e => handleChange("B3_vinculacion_empresa", e.target.value)}
              placeholder={t('placeholders.modulo.b3VinculacionEmpresa', {defaultValue: 'Orientaciones sobre las actividades a realizar en la empresa (FEOE)...'})}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

