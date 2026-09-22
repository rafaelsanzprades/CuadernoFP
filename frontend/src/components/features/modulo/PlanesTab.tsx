"use client";
import { Building2, Calculator } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { NarrativeField } from "@/components/ui/NarrativeField";
import { useTranslation } from "react-i18next";
import Link from "next/link";

const FEOE_CATALOGO = [
  {
    grupo: "Modalidad", items: [
      { id: "FEOE-GEN", label: "Dual general" },
      { id: "FEOE-INT", label: "Dual intensiva" },
      { id: "FEOE-SIM", label: "Sin FEOE / formación en centro educativo" },
    ]
  },
  {
    grupo: "Seguimiento", items: [
      { id: "FEOE-VISITA", label: "Visitas periódicas al centro de trabajo" },
      { id: "FEOE-INFORME", label: "Informe final del tutor de empresa" },
      { id: "FEOE-EVALCONJ", label: "Evaluación conjunta centro-empresa" },
      { id: "FEOE-CUADERNO", label: "Cuaderno de seguimiento del alumnado" },
    ]
  },
];

export function PlanesTab() {
  const { t } = useTranslation();
  const { moduleData, updateModuleData, updateInfoModulo } = useAppStore();
  const config_contexto = moduleData?.config_contexto || {};
  const info_modulo = moduleData?.info_modulo || {};

  const handleChange = (field: string, value: any) => {
    updateModuleData("config_contexto", { ...config_contexto, [field]: value });
  };

  // Peso de la FEOE en tu módulo (Ítem 2, 00 IDEAS.md, 2026-09-21): caja
  // informativa -- no fija el peso real de la nota FEOE (eso sigue siendo
  // un valor libre que se ajusta en Seguimiento->Empresa FEOE). h_feoe y
  // carga_lectiva_anual se editan en Identificación, no aquí.
  const hFeoeCurso = info_modulo.h_feoe != null ? Number(info_modulo.h_feoe) : (info_modulo.curso === '2º' ? 360 : 140);
  const cargaLectivaAnual = Number(info_modulo.carga_lectiva_anual) || 1000;
  const techoPct = cargaLectivaAnual > 0 ? (hFeoeCurso / cargaLectivaAnual) * 100 : 0;
  const horasImputadas = Number(info_modulo.horas_imputadas_feoe) || 0;
  const pctModulo = cargaLectivaAnual > 0 ? (horasImputadas / cargaLectivaAnual) * 100 : 0;

  const feoe_seleccion = config_contexto.feoe_seleccion || [];
  const df_ce = moduleData?.df_ce || [];
  const hayCeDual = df_ce.some((ce: any) => ce.is_dual);

  const toggleFeoe = (id: string) => {
    const updated = feoe_seleccion.includes(id)
      ? feoe_seleccion.filter((i: string) => i !== id)
      : [...feoe_seleccion, id];
    handleChange("feoe_seleccion", updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* FEOE */}
      <div className="glass-card p-6 border-t-4 border-t-blue-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><Building2 className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('campos.modulo.tituloFeoe', {defaultValue: 'FEOE. Formación en Empresa u Organismo Equiparado'})}
        </h2>
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-[var(--glass-border)] bg-foreground/5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-body font-bold text-foreground flex items-center gap-2">
                <Calculator className="w-[1.1em] h-[1.1em]" /> {t('campos.modulo.pesoFeoeTitulo', {defaultValue: 'Peso de la FEOE en tu módulo'})}
              </h3>
              <Link href="/contexto?tab=identificacion" className="text-caption text-info hover:underline">
                {t('botones.modulo.editarEnIdentificacion', {defaultValue: 'Editar Horas FEOE / Carga lectiva en Identificación'})}
              </Link>
            </div>
            <p className="text-caption text-muted">
              {t('campos.modulo.pesoFeoeDesc', {defaultValue: 'Solo contexto/apoyo -- no fija el peso real de la nota FEOE, que sigues ajustando tú en Seguimiento -> Empresa FEOE.'})}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-background/40 border border-white/5 text-center">
                <div className="text-caption text-muted">{t('campos.modulo.cargaLectivaAnualLabel', {defaultValue: 'Carga lectiva anual'})}</div>
                <div className="text-subheading font-bold text-foreground">{cargaLectivaAnual}h</div>
              </div>
              <div className="p-3 rounded-lg bg-background/40 border border-white/5 text-center">
                <div className="text-caption text-muted">{t('campos.modulo.horasFeoeCursoLabel', {defaultValue: 'Horas FEOE del curso'})}</div>
                <div className="text-subheading font-bold text-foreground">{hFeoeCurso}h</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
                <div className="text-caption text-muted">{t('campos.modulo.techoFeoeLabel', {defaultValue: 'Techo FEOE (máximo)'})}</div>
                <div className="text-subheading font-bold text-amber-500">{techoPct.toFixed(0)}%</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end pt-2 border-t border-[var(--glass-border)]">
              <div>
                <label className="text-caption font-semibold text-muted mb-1 block">{t('campos.modulo.horasImputadasModuloLabel', {defaultValue: 'Horas imputadas a este módulo'})}</label>
                <input
                  type="number"
                  value={info_modulo.horas_imputadas_feoe ?? 0}
                  onChange={e => updateInfoModulo('horas_imputadas_feoe', Number(e.target.value))}
                  className="w-full bg-background border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
                <div className="text-caption text-muted">{t('campos.modulo.pctModuloFeoeLabel', {defaultValue: '% resultante de tu módulo'})}</div>
                <div className="text-subheading font-bold text-amber-500">{pctModulo.toFixed(0)}%</div>
              </div>
            </div>
          </div>

          {!hayCeDual && (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-wrap items-center justify-between gap-3">
              <p className="text-body text-foreground/80">
                {t('campos.modulo.moduloNoDualizadoDesc', {defaultValue: 'Este módulo no está dualizado todavía: no hay ningún CE marcado como FEOE.'})}
              </p>
              <Link href="/curriculo?tab=ponderacion-ra-ce" className="text-caption text-info hover:underline shrink-0">
                {t('botones.modulo.marcarCeComoFeoe', {defaultValue: 'Marcar CE como FEOE en Currículo'})}
              </Link>
            </div>
          )}

          <div>
            <label className="text-body font-semibold text-foreground mb-2 block">{t('campos.modulo.modalidadSeguimientoLabel', {defaultValue: 'Modalidad y seguimiento'})}</label>
            <p className="text-caption text-muted mb-3">{t('campos.modulo.modalidadSeguimientoDesc', {defaultValue: 'Selección orientativa que apoya la redacción de los textos de abajo (primera versión, se irá ampliando).'})}</p>
            <div className="space-y-3">
              {FEOE_CATALOGO.map((grupo) => (
                <div key={grupo.grupo}>
                  <p className="text-caption font-semibold text-muted mb-1.5">{t(`checks.modulo.feoeGrupo_${grupo.grupo.toLowerCase()}`, {defaultValue: grupo.grupo})}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {grupo.items.map((item) => {
                      const isSelected = feoe_seleccion.includes(item.id);
                      return (
                        <label key={item.id} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${isSelected ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleFeoe(item.id)}
                            className="rounded border-white/20 bg-transparent text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-caption">{t(`checks.modulo.feoe_${item.id.toLowerCase().replace(/-/g, '_')}`, {defaultValue: item.label})}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <NarrativeField
            id="textos_pd_feoe_organizacion"
            title={t('campos.modulo.feoeOrganizacionTitulo', {defaultValue: 'Organización y modalidad de FEOE'})}
            description={t('campos.modulo.feoeOrganizacionDesc', {defaultValue: 'Detalla cómo se organiza el alumnado (FEOE general, intensivo) y qué alternativas hay para el alumnado sin FEOE.'})}
          />
          <NarrativeField
            id="textos_pd_feoe_seguimiento"
            title={t('campos.modulo.feoeSeguimientoTitulo', {defaultValue: 'Seguimiento de FEOE'})}
            description={t('campos.modulo.feoeSeguimientoDesc', {defaultValue: 'Procedimiento para el seguimiento en la empresa y comunicación con tutores duales.'})}
          />

          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">{t('campos.modulo.feoeTextoSimplificadoTitulo', {defaultValue: 'FEOE (texto específico modelo Simplificado, pd=)'})}</label>
            <p className="text-caption text-muted mb-2">{t('campos.modulo.feoeTextoSimplificadoAviso', {defaultValue: 'Si se deja vacío, se genera automáticamente a partir de los RA marcados como dualizables (is_dual).'})}</p>
            <textarea
              value={config_contexto.texto_feoe || ""}
              onChange={e => handleChange("texto_feoe", e.target.value)}
              placeholder={t('placeholders.modulo.textoFormacionEmpresa', {defaultValue: 'Texto sobre la formación en empresa...'})}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>

          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">{t('campos.modulo.trabajosAlternativosTitulo', {defaultValue: 'Trabajos alternativos para módulos no dualizados FEOE'})}</label>
            <p className="text-caption text-muted mb-2">{t('campos.modulo.trabajosAlternativosDesc', {defaultValue: 'Qué se le pide al alumnado en tu módulo durante el periodo FEOE cuando no tiene horas imputadas directamente (trabajos, cuaderno, entregas...).'})}</p>
            <textarea
              value={config_contexto.texto_feoe_trabajos_alternativos || ""}
              onChange={e => handleChange("texto_feoe_trabajos_alternativos", e.target.value)}
              placeholder={t('placeholders.modulo.textoTrabajosAlternativos', {defaultValue: 'Trabajos, tareas o entregas que sustituyen a la evaluación presencial durante la FEOE...'})}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
