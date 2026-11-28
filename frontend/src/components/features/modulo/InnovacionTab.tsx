"use client";
import { Rocket } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PROYECTO_POR_PERFIL, PERFILES_COMUNIDAD } from "@/utils/calificaciones";

export function InnovacionTab() {
  const { t } = useTranslation();
  const { moduleData, updateModuleData } = useAppStore();
  const config_contexto = moduleData?.config_contexto || {};
  const perfilId = moduleData?.config_redondeo?.perfil_comunidad as string | undefined;
  const proyectoNorma = perfilId ? PROYECTO_POR_PERFIL[perfilId] : undefined;
  const nombrePerfil = PERFILES_COMUNIDAD.find((p) => p.id === perfilId)?.nombre;

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
            <label className="text-body font-semibold text-foreground mb-1 block" htmlFor="proyecto-defensa">{t('campos.modulo.proyectoDefensaLabel', {defaultValue: 'Evaluación y defensa del proyecto intermodular'})}</label>
            {proyectoNorma && (
              <p className="text-caption text-muted mb-2">
                <strong>{t('campos.modulo.proyectoComunidadTitulo', {defaultValue: 'Qué fija la norma de {{comunidad}}:', comunidad: nombrePerfil})}</strong>{" "}
                {t('campos.modulo.proyectoComunidadFuente', {defaultValue: '{{texto}} Fuente: {{fuente}}.', texto: proyectoNorma.texto, fuente: proyectoNorma.fuente})}
              </p>
            )}
            <p className="text-caption text-muted mb-2">{t('campos.modulo.proyectoDefensaDesc', {defaultValue: 'Cómo se evalúa y se defiende el proyecto en tu centro: quién forma el tribunal o el equipo docente, la rúbrica y el calendario de entregas. Es un apunte para tu programación; para ver lo que fija tu norma, elige un perfil de comunidad en Módulo › Datos.'})}</p>
            <textarea
              id="proyecto-defensa"
              value={config_contexto["proyecto_defensa"] || ""}
              onChange={e => handleChange("proyecto_defensa", e.target.value)}
              placeholder={t('placeholders.modulo.proyectoDefensa', {defaultValue: 'Ej.: defensa oral individual ante tres docentes del equipo, con rúbrica y entregas parciales cada mes...'})}
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
