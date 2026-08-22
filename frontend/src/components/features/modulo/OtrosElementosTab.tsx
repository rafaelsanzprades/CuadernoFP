"use client";
import { Layers, Leaf, Cpu, Smartphone } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";

export function OtrosElementosTab() {
  const { t } = useTranslation();
  const { moduleData, updateModuleData } = useAppStore();
  const config_contexto = moduleData?.config_contexto || {};

  const handleChange = (field: string, value: any) => {
    updateModuleData("config_contexto", { ...config_contexto, [field]: value });
  };

  const TRANSVERSALES = [
    { id: "TRANS-DIG", label: t('checks.modulo.transDigital', {defaultValue: 'Competencia Digital / Tecnologías'}) },
    { id: "TRANS-SOST", label: t('checks.modulo.transSostenibilidad', {defaultValue: 'Sostenibilidad y Transición Ecológica'}) },
    { id: "TRANS-IGUAL", label: t('checks.modulo.transIgualdad', {defaultValue: 'Igualdad de Género'}) },
    { id: "TRANS-PRL", label: t('checks.modulo.transPrl', {defaultValue: 'Prevención de Riesgos Laborales'}) },
    { id: "TRANS-EMPRE", label: t('checks.modulo.transEmprendedora', {defaultValue: 'Cultura Emprendedora'}) }
  ];

  const elementos_transversales = moduleData?.elementos_transversales || [];

  const toggleTransversal = (id: string) => {
    const updated = elementos_transversales.includes(id) ? elementos_transversales.filter((i: string) => i !== id) : [...elementos_transversales, id];
    updateModuleData("elementos_transversales", updated);
  };

  const toggleCompetencia = (comp: string) => {
    const current = config_contexto.competencias_clave || [];
    const updated = current.includes(comp) 
      ? current.filter((c: string) => c !== comp)
      : [...current, comp];
    handleChange("competencias_clave", updated);
  };

  const COMPETENCIAS_CLAVE = [
    { id: "CL", label: t('checks.modulo.compClaveCL', {defaultValue: 'Comunicación Lingüística'}) },
    { id: "CSTEM", label: t('checks.modulo.compClaveCSTEM', {defaultValue: 'Competencia Matemática y en Ciencia, Tecnología e Ingeniería'}) },
    { id: "CD", label: t('checks.modulo.compClaveCD', {defaultValue: 'Competencia Digital'}) },
    { id: "CPSAA", label: t('checks.modulo.compClaveCPSAA', {defaultValue: 'Competencia Personal, Social y de Aprender a Aprender'}) },
    { id: "CCEC", label: t('checks.modulo.compClaveCCEC', {defaultValue: 'Competencia en Conciencia y Expresión Culturales'}) },
    { id: "CE", label: t('checks.modulo.compClaveCE', {defaultValue: 'Competencia Emprendedora'}) },
    { id: "CIEC", label: t('checks.modulo.compClaveCIEC', {defaultValue: 'Competencia Ciudadana'}) }
  ];

  const digcompKey = (id: string) => `digcomp_${id.replace('.', '_')}`;

  const DIGCOMP_AREAS = [
    {
      area: "1", label: t('checks.modulo.digcompArea1', {defaultValue: 'Información y alfabetización de datos'}), items: [
        { id: "1.1", label: t(`checks.modulo.${digcompKey("1.1")}`, {defaultValue: 'Navegación, búsqueda y filtrado de datos, información y contenidos digitales'}) },
        { id: "1.2", label: t(`checks.modulo.${digcompKey("1.2")}`, {defaultValue: 'Evaluación de datos, información y contenidos digitales'}) },
        { id: "1.3", label: t(`checks.modulo.${digcompKey("1.3")}`, {defaultValue: 'Gestión de datos, información y contenidos digitales'}) },
      ]
    },
    {
      area: "2", label: t('checks.modulo.digcompArea2', {defaultValue: 'Comunicación y colaboración'}), items: [
        { id: "2.1", label: t(`checks.modulo.${digcompKey("2.1")}`, {defaultValue: 'Interacción mediante tecnologías digitales'}) },
        { id: "2.2", label: t(`checks.modulo.${digcompKey("2.2")}`, {defaultValue: 'Compartir información y contenidos digitales'}) },
        { id: "2.3", label: t(`checks.modulo.${digcompKey("2.3")}`, {defaultValue: 'Participación ciudadana en línea'}) },
        { id: "2.4", label: t(`checks.modulo.${digcompKey("2.4")}`, {defaultValue: 'Colaboración mediante tecnologías digitales'}) },
        { id: "2.5", label: t(`checks.modulo.${digcompKey("2.5")}`, {defaultValue: 'Netiqueta'}) },
        { id: "2.6", label: t(`checks.modulo.${digcompKey("2.6")}`, {defaultValue: 'Gestión de la identidad digital'}) },
      ]
    },
    {
      area: "3", label: t('checks.modulo.digcompArea3', {defaultValue: 'Creación de contenidos digitales'}), items: [
        { id: "3.1", label: t(`checks.modulo.${digcompKey("3.1")}`, {defaultValue: 'Desarrollo de contenidos digitales'}) },
        { id: "3.2", label: t(`checks.modulo.${digcompKey("3.2")}`, {defaultValue: 'Integración y reelaboración de contenidos digitales'}) },
        { id: "3.3", label: t(`checks.modulo.${digcompKey("3.3")}`, {defaultValue: 'Derechos de autor y licencias'}) },
        { id: "3.4", label: t(`checks.modulo.${digcompKey("3.4")}`, {defaultValue: 'Programación'}) },
      ]
    },
    {
      area: "4", label: t('checks.modulo.digcompArea4', {defaultValue: 'Seguridad'}), items: [
        { id: "4.1", label: t(`checks.modulo.${digcompKey("4.1")}`, {defaultValue: 'Protección de dispositivos'}) },
        { id: "4.2", label: t(`checks.modulo.${digcompKey("4.2")}`, {defaultValue: 'Protección de datos personales y privacidad'}) },
        { id: "4.3", label: t(`checks.modulo.${digcompKey("4.3")}`, {defaultValue: 'Protección de la salud y el bienestar'}) },
        { id: "4.4", label: t(`checks.modulo.${digcompKey("4.4")}`, {defaultValue: 'Protección del medioambiente'}) },
      ]
    },
    {
      area: "5", label: t('checks.modulo.digcompArea5', {defaultValue: 'Resolución de problemas'}), items: [
        { id: "5.1", label: t(`checks.modulo.${digcompKey("5.1")}`, {defaultValue: 'Resolución de problemas técnicos'}) },
        { id: "5.2", label: t(`checks.modulo.${digcompKey("5.2")}`, {defaultValue: 'Identificación de necesidades y respuestas tecnológicas'}) },
        { id: "5.3", label: t(`checks.modulo.${digcompKey("5.3")}`, {defaultValue: 'Uso creativo de la tecnología digital'}) },
        { id: "5.4", label: t(`checks.modulo.${digcompKey("5.4")}`, {defaultValue: 'Identificación de lagunas en la competencia digital'}) },
      ]
    },
  ];

  const DIGCOMPEDU_AREAS = [
    { id: "DCE-1", label: t('checks.modulo.digcompeduDCE1', {defaultValue: 'Compromiso profesional'}) },
    { id: "DCE-2", label: t('checks.modulo.digcompeduDCE2', {defaultValue: 'Contenidos digitales'}) },
    { id: "DCE-3", label: t('checks.modulo.digcompeduDCE3', {defaultValue: 'Enseñanza y aprendizaje'}) },
    { id: "DCE-4", label: t('checks.modulo.digcompeduDCE4', {defaultValue: 'Evaluación y retroalimentación'}) },
    { id: "DCE-5", label: t('checks.modulo.digcompeduDCE5', {defaultValue: 'Empoderamiento del alumnado'}) },
    { id: "DCE-6", label: t('checks.modulo.digcompeduDCE6', {defaultValue: 'Desarrollo de la competencia digital del alumnado'}) },
  ];

  const digcomp_competencias = config_contexto.digcomp_competencias || [];
  const digcompedu_areas = config_contexto.digcompedu_areas || [];

  const toggleDigcomp = (id: string) => {
    const updated = digcomp_competencias.includes(id)
      ? digcomp_competencias.filter((c: string) => c !== id)
      : [...digcomp_competencias, id];
    handleChange("digcomp_competencias", updated);
  };

  const toggleDigcompedu = (id: string) => {
    const updated = digcompedu_areas.includes(id)
      ? digcompedu_areas.filter((c: string) => c !== id)
      : [...digcompedu_areas, id];
    handleChange("digcompedu_areas", updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Competencias y Transversales */}
      <div className="glass-card p-6 border-t-4 border-t-cyan-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><Layers className="w-[1.2em] h-[1.2em] mr-1 text-cyan-400" /></span> {t('campos.modulo.transversalesCompetenciasTitulo', {defaultValue: 'Transversales y Competencias'})}
        </h2>
        <div className="space-y-6">

          <div>
            <label className="text-body font-semibold text-foreground mb-2 block flex items-center gap-2">
              <Cpu className="w-4 h-4 text-muted" /> {t('campos.modulo.competenciasClaveTitulo', {defaultValue: 'Competencias Clave'})}
            </label>
            <p className="text-caption text-muted mb-3">{t('campos.modulo.competenciasClaveDesc', {defaultValue: 'Selecciona las competencias clave (LOMLOE/LO 3/2022) que se desarrollarán en este módulo.'})}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {COMPETENCIAS_CLAVE.map((comp) => {
                const isSelected = (config_contexto.competencias_clave || []).includes(comp.id);
                return (
                  <label key={comp.id} className={`flex items-center gap-3 p-2 rounded border cursor-pointer transition-colors ${isSelected ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleCompetencia(comp.id)}
                      className="rounded border-white/20 bg-transparent text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-body"><strong>{comp.id}</strong> - {comp.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-body font-semibold text-foreground mb-1 block flex items-center gap-2">
              <Leaf className="w-4 h-4 text-muted" /> {t('campos.modulo.elementosTransversalesTitulo', {defaultValue: 'Elementos transversales'})}
            </label>
            <p className="text-caption text-muted mb-2">{t('campos.modulo.elementosTransversalesDesc', {defaultValue: 'Selecciona los elementos que integrarás en el módulo.'})}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              {TRANSVERSALES.map((trans) => {
                const isSelected = elementos_transversales.includes(trans.id);
                return (
                  <label key={trans.id} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${isSelected ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleTransversal(trans.id)}
                      className="rounded border-white/20 bg-transparent text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-caption"><strong>{trans.id}</strong> - {trans.label}</span>
                  </label>
                );
              })}
            </div>
            <textarea
              value={config_contexto["I1_transversales"] || ""}
              onChange={e => handleChange("I1_transversales", e.target.value)}
              placeholder={t('placeholders.modulo.elementosTransversales', {defaultValue: 'Detalla cómo se integrarán los elementos transversales obligatorios...'})}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Competencias digitales: DigComp / DigCompEdu */}
      <div className="glass-card p-6 border-t-4 border-t-sky-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><Smartphone className="w-[1.2em] h-[1.2em] mr-1 text-sky-400" /></span> {t('campos.modulo.competenciasDigitalesTitulo', {defaultValue: 'Competencias digitales (DigComp / DigCompEdu)'})}
        </h2>
        <div className="space-y-6">

          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">{t('campos.modulo.digcompAlumnadoTitulo', {defaultValue: 'DigComp — competencias digitales del alumnado'})}</label>
            <p className="text-caption text-muted mb-3">{t('campos.modulo.digcompAlumnadoDesc', {defaultValue: 'Marco Europeo de Competencias Digitales para la Ciudadanía. Selecciona las competencias (de las 21, en 5 áreas) que se trabajan en este módulo.'})}</p>
            <div className="space-y-4">
              {DIGCOMP_AREAS.map((area) => (
                <div key={area.area}>
                  <p className="text-caption font-semibold text-muted mb-2">{t('campos.modulo.digcompAreaPrefijo', {defaultValue: 'Área'})} {area.area} · {area.label}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {area.items.map((comp) => {
                      const isSelected = digcomp_competencias.includes(comp.id);
                      return (
                        <label key={comp.id} className={`flex items-center gap-3 p-2 rounded border cursor-pointer transition-colors ${isSelected ? 'bg-sky-500/10 border-sky-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleDigcomp(comp.id)}
                            className="rounded border-white/20 bg-transparent text-sky-500 focus:ring-sky-500"
                          />
                          <span className="text-body"><strong>{comp.id}</strong> - {comp.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">{t('campos.modulo.digcompeduDocenteTitulo', {defaultValue: 'DigCompEdu — competencia digital docente'})}</label>
            <p className="text-caption text-muted mb-3">{t('campos.modulo.digcompeduDocenteDesc', {defaultValue: 'Marco Europeo de Competencia Digital para Educadores. Selecciona las áreas que aplicarás al impartir este módulo.'})}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              {DIGCOMPEDU_AREAS.map((area) => {
                const isSelected = digcompedu_areas.includes(area.id);
                return (
                  <label key={area.id} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${isSelected ? 'bg-sky-500/10 border-sky-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleDigcompedu(area.id)}
                      className="rounded border-white/20 bg-transparent text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-caption">{area.label}</span>
                  </label>
                );
              })}
            </div>
            <textarea
              value={config_contexto["digcomp_texto"] || ""}
              onChange={e => handleChange("digcomp_texto", e.target.value)}
              placeholder={t('placeholders.modulo.competenciasDigitales', {defaultValue: 'Detalla cómo se desarrollarán las competencias digitales seleccionadas en este módulo...'})}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Desarrollo Curricular: ECP, CPE, OG */}
      <div className="glass-card p-6 border-t-4 border-t-indigo-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><Layers className="w-[1.2em] h-[1.2em] mr-1 text-indigo-400" /></span> {t('campos.modulo.estandaresObjetivosTitulo', {defaultValue: 'Estándares y Objetivos (Currículo)'})}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">{t('campos.modulo.ecpTitulo', {defaultValue: 'Estándares de competencia profesional (ECP)'})}</label>
            <p className="text-caption text-muted mb-2">{t('campos.modulo.ecpDesc', {defaultValue: 'Asociados al módulo profesional según el Real Decreto del título.'})}</p>
            <textarea
              value={config_contexto["ecp"] || ""}
              onChange={e => handleChange("ecp", e.target.value)}
              placeholder={t('placeholders.modulo.ecpEjemplo', {defaultValue: 'Ej: UC0001_3: Gestionar...'})}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">{t('campos.modulo.cpeTitulo', {defaultValue: 'Competencias profesionales y para la empleabilidad (CPE)'})}</label>
            <textarea
              value={config_contexto["cpe"] || ""}
              onChange={e => handleChange("cpe", e.target.value)}
              placeholder={t('placeholders.modulo.competenciasEspecificas', {defaultValue: 'Competencias específicas y transversales...'})}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">{t('campos.modulo.ogTitulo', {defaultValue: 'Objetivos generales (OG)'})}</label>
            <textarea
              value={config_contexto["og"] || ""}
              onChange={e => handleChange("og", e.target.value)}
              placeholder={t('placeholders.modulo.objetivosGenerales', {defaultValue: 'Objetivos generales del título aplicables al módulo...'})}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-body text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
