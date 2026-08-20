"use client";
import { School, User, FileText, BookOpen } from "lucide-react";
import { NarrativeField } from "@/components/ui/NarrativeField";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";

const RASGOS_ENTORNO = [
  {
    grupo: "Tipo de entorno", items: [
      { id: "ENT-URBANO", label: "Urbano" },
      { id: "ENT-RURAL", label: "Rural" },
      { id: "ENT-PERIFERIA", label: "Periferia / barrio periférico" },
      { id: "ENT-INDUSTRIAL", label: "Polígono industrial cercano" },
    ]
  },
  {
    grupo: "Turno", items: [
      { id: "TURNO-DIURNO", label: "Diurno" },
      { id: "TURNO-VESPERTINO", label: "Vespertino" },
      { id: "TURNO-MIXTO", label: "Mixto" },
    ]
  },
  {
    grupo: "Modalidad", items: [
      { id: "MOD-PRESENCIAL", label: "Presencial" },
      { id: "MOD-SEMIPRESENCIAL", label: "Semipresencial" },
      { id: "MOD-DISTANCIA", label: "Distancia" },
    ]
  },
];

// Ítems codificados que anteceden a cada campo de texto libre de esta página
// (mismo patrón que RASGOS_ENTORNO, ya existente para "Entorno geográfico y
// sociocultural") — preparación para un futuro botón "generar con IA interna"
// que redacte el texto a partir de estos checks + datos numéricos, en vez de
// que el profesor parta de una hoja en blanco (pedido por Rafael, 2026-08-17;
// ítem nuevo anotado en RF Ideas/00 IDEAS.md, el botón de IA en sí no se
// implementa todavía).
const RASGOS_SOCIOECONOMICO = [
  {
    grupo: "Sector predominante", items: [
      { id: "SOCIO-INDUSTRIAL", label: "Industrial" },
      { id: "SOCIO-SERVICIOS", label: "Servicios" },
      { id: "SOCIO-AGRICOLA", label: "Agrícola/ganadero" },
      { id: "SOCIO-TURISTICO", label: "Turístico" },
    ]
  },
  {
    grupo: "Nivel socioeconómico de las familias", items: [
      { id: "SOCIO-NIVEL-ALTO", label: "Alto" },
      { id: "SOCIO-NIVEL-MEDIO", label: "Medio" },
      { id: "SOCIO-NIVEL-BAJO", label: "Bajo" },
      { id: "SOCIO-NIVEL-MIXTO", label: "Mixto" },
    ]
  },
  {
    grupo: "Empleo en la zona", items: [
      { id: "SOCIO-PARO-BAJO", label: "Tasa de paro baja" },
      { id: "SOCIO-PARO-MEDIO", label: "Tasa de paro media" },
      { id: "SOCIO-PARO-ALTO", label: "Tasa de paro alta" },
      { id: "SOCIO-EMPRESAS-SECTOR", label: "Empresas del sector cercanas" },
    ]
  },
];

const RASGOS_CONTEXTO_ESCOLAR = [
  {
    grupo: "Titularidad", items: [
      { id: "ESC-PUBLICO", label: "Público" },
      { id: "ESC-CONCERTADO", label: "Concertado" },
      { id: "ESC-PRIVADO", label: "Privado" },
    ]
  },
  {
    grupo: "Tamaño del centro", items: [
      { id: "ESC-PEQUENO", label: "Pequeño" },
      { id: "ESC-MEDIANO", label: "Mediano" },
      { id: "ESC-GRANDE", label: "Grande" },
    ]
  },
  {
    grupo: "Oferta educativa", items: [
      { id: "ESC-ESO", label: "ESO" },
      { id: "ESC-BACHILLERATO", label: "Bachillerato" },
      { id: "ESC-FPB", label: "FP Grado Básico" },
      { id: "ESC-FPGM", label: "FP Grado Medio" },
      { id: "ESC-FPGS", label: "FP Grado Superior" },
    ]
  },
];

const RASGOS_ALUMNADO = [
  {
    grupo: "Procedencia mayoritaria", items: [
      { id: "AL-PROC-LOCAL", label: "Local" },
      { id: "AL-PROC-COMARCAL", label: "Comarcal" },
      { id: "AL-PROC-OTRAS-PROV", label: "Otras provincias" },
      { id: "AL-PROC-INTERNACIONAL", label: "Internacional" },
    ]
  },
  {
    grupo: "Vía de acceso predominante", items: [
      { id: "AL-VIA-ESO", label: "ESO" },
      { id: "AL-VIA-PRUEBA", label: "Prueba de acceso" },
      { id: "AL-VIA-OTRO-CICLO", label: "Otro ciclo" },
      { id: "AL-VIA-BACHILLERATO", label: "Bachillerato" },
    ]
  },
  {
    grupo: "Perfil del grupo", items: [
      { id: "AL-MOTIVACION-ALTA", label: "Motivación alta" },
      { id: "AL-MOTIVACION-BAJA", label: "Motivación baja/irregular" },
      { id: "AL-DIVERSIDAD-ALTA", label: "Alta diversidad de perfiles" },
      { id: "AL-REPETIDORES", label: "Presencia significativa de repetidores" },
    ]
  },
];

const RASGOS_INFRAESTRUCTURA = [
  {
    grupo: "Tipo de aula", items: [
      { id: "INFRA-AULA-TALLER", label: "Aula-taller" },
      { id: "INFRA-AULA-CONVENCIONAL", label: "Aula convencional" },
      { id: "INFRA-AULA-INFORMATICA", label: "Aula de informática" },
    ]
  },
  {
    grupo: "Equipamiento", items: [
      { id: "INFRA-EQUIPO-ACTUALIZADO", label: "Actualizado" },
      { id: "INFRA-EQUIPO-SUFICIENTE", label: "Suficiente" },
      { id: "INFRA-EQUIPO-LIMITADO", label: "Limitado" },
    ]
  },
  {
    grupo: "Conectividad", items: [
      { id: "INFRA-CONECTIVIDAD-BUENA", label: "Buena" },
      { id: "INFRA-CONECTIVIDAD-LIMITADA", label: "Limitada" },
    ]
  },
];

interface RasgosRapidosProps {
  titulo: string;
  grupos: { grupo: string; items: { id: string; label: string }[] }[];
  seleccionados: string[];
  onToggle: (id: string) => void;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

function RasgosRapidos({ titulo, grupos, seleccionados, onToggle }: RasgosRapidosProps) {
  const { t } = useTranslation();
  return (
    <div>
      <label className="text-body font-semibold text-foreground mb-2 block">{titulo}</label>
      <p className="text-caption text-muted mb-3">
        {t('checks.contexto.seleccionOrientativa', {defaultValue: 'Selección orientativa para apoyar la redacción del texto de abajo (primera versión, se irá ampliando).'})}
      </p>
      <div className="space-y-3">
        {grupos.map((grupo) => (
          <div key={grupo.grupo}>
            <p className="text-caption font-semibold text-muted mb-1.5">{t(`checks.contexto.grupo_${slug(grupo.grupo)}`, {defaultValue: grupo.grupo})}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {grupo.items.map((item) => {
                const isSelected = seleccionados.includes(item.id);
                return (
                  <label key={item.id} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${isSelected ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggle(item.id)}
                      className="rounded border-white/20 bg-transparent text-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="text-caption">{t(`checks.contexto.item_${item.id.toLowerCase().replace(/-/g, '_')}`, {defaultValue: item.label})}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContextoTab() {
  const { t } = useTranslation();
  const { moduleData, updateModuleData } = useAppStore();

  const config_contexto = moduleData?.config_contexto || {};

  const handleContextoChange = (field: string, value: any) => {
    updateModuleData("config_contexto", { ...config_contexto, [field]: value });
  };

  const rasgos_entorno = config_contexto.rasgos_entorno || [];
  const rasgos_socioeconomico = config_contexto.rasgos_socioeconomico || [];
  const rasgos_escolar = config_contexto.rasgos_escolar || [];
  const rasgos_alumnado = config_contexto.rasgos_alumnado || [];
  const rasgos_infraestructura = config_contexto.rasgos_infraestructura || [];

  const toggleRasgo = (campo: string, actuales: string[], id: string) => {
    const updated = actuales.includes(id)
      ? actuales.filter((r: string) => r !== id)
      : [...actuales, id];
    handleContextoChange(campo, updated);
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-6 border-t-4 border-t-indigo-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><School className="w-[1.2em] h-[1.2em] mr-1" /></span> Contexto escolar
        </h2>
        <div className="space-y-4">
          <RasgosRapidos
            titulo={t('checks.contexto.tituloEntorno', {defaultValue: 'Rasgos rápidos del entorno'})}
            grupos={RASGOS_ENTORNO}
            seleccionados={rasgos_entorno}
            onToggle={(id) => toggleRasgo("rasgos_entorno", rasgos_entorno, id)}
          />
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Entorno geográfico y sociocultural</label>
            <textarea
              value={config_contexto.entorno_geografico || ""}
              onChange={e => handleContextoChange("entorno_geografico", e.target.value)}
              placeholder={t('placeholders.contexto.entornoGeografico', {defaultValue: 'Ej: El IES Andalán se sitúa en el barrio X de Zaragoza...'})}
              className="w-full h-64 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <RasgosRapidos
            titulo={t('checks.contexto.tituloSocioeconomico', {defaultValue: 'Rasgos rápidos del entorno socioeconómico'})}
            grupos={RASGOS_SOCIOECONOMICO}
            seleccionados={rasgos_socioeconomico}
            onToggle={(id) => toggleRasgo("rasgos_socioeconomico", rasgos_socioeconomico, id)}
          />
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Entorno socioeconómico y productivo</label>
            <textarea
              value={config_contexto.entorno_socioeconomico || ""}
              onChange={e => handleContextoChange("entorno_socioeconomico", e.target.value)}
              placeholder={t('placeholders.contexto.entornoSocioeconomico', {defaultValue: 'Ej: El tejido empresarial de la zona destaca por...'})}
              className="w-full h-64 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <RasgosRapidos
            titulo={t('checks.contexto.tituloEscolar', {defaultValue: 'Rasgos rápidos del contexto escolar'})}
            grupos={RASGOS_CONTEXTO_ESCOLAR}
            seleccionados={rasgos_escolar}
            onToggle={(id) => toggleRasgo("rasgos_escolar", rasgos_escolar, id)}
          />
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Contexto escolar</label>
            <textarea
              value={config_contexto.contexto_escolar || ""}
              onChange={e => handleContextoChange("contexto_escolar", e.target.value)}
              placeholder={t('placeholders.contexto.contextoEscolar', {defaultValue: 'Ej: Centro de referencia en Formación Profesional...'})}
              className="w-full h-64 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <RasgosRapidos
            titulo={t('checks.contexto.tituloAlumnado', {defaultValue: 'Rasgos rápidos del alumnado'})}
            grupos={RASGOS_ALUMNADO}
            seleccionados={rasgos_alumnado}
            onToggle={(id) => toggleRasgo("rasgos_alumnado", rasgos_alumnado, id)}
          />
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Características del alumnado</label>
            <textarea
              value={config_contexto.caracteristicas_alumnado || ""}
              onChange={e => handleContextoChange("caracteristicas_alumnado", e.target.value)}
              placeholder={t('placeholders.contexto.caracteristicasAlumnado', {defaultValue: 'Ej: Grupo diverso en edades y perfiles de ingreso...'})}
              className="w-full h-96 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <RasgosRapidos
            titulo={t('checks.contexto.tituloInfraestructura', {defaultValue: 'Rasgos rápidos de infraestructura'})}
            grupos={RASGOS_INFRAESTRUCTURA}
            seleccionados={rasgos_infraestructura}
            onToggle={(id) => toggleRasgo("rasgos_infraestructura", rasgos_infraestructura, id)}
          />
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Infraestructura y recursos educativos</label>
            <textarea
              value={config_contexto.infraestructura || ""}
              onChange={e => handleContextoChange("infraestructura", e.target.value)}
              placeholder={t('placeholders.contexto.infraestructura', {defaultValue: 'Ej: Aula-taller informatizada con 30 puestos...'})}
              className="w-full h-64 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 border-t-4 border-t-purple-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><User className="w-[1.2em] h-[1.2em] mr-1" /></span> Alumnado (ACNEAE)
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Datos de contextualización del grupo</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="text-caption text-muted mb-1 block">Ratio — Hombres</label>
                <input
                  type="number" min="0"
                  value={config_contexto.ratio_hombres ?? ""}
                  onChange={e => handleContextoChange("ratio_hombres", e.target.value)}
                  className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-2 text-foreground focus:border-info focus:outline-none"
                />
              </div>
              <div>
                <label className="text-caption text-muted mb-1 block">Ratio — Mujeres</label>
                <input
                  type="number" min="0"
                  value={config_contexto.ratio_mujeres ?? ""}
                  onChange={e => handleContextoChange("ratio_mujeres", e.target.value)}
                  className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-2 text-foreground focus:border-info focus:outline-none"
                />
              </div>
              <div>
                <label className="text-caption text-muted mb-1 block">Repetidores</label>
                <input
                  type="number" min="0"
                  value={config_contexto.num_repetidores ?? ""}
                  onChange={e => handleContextoChange("num_repetidores", e.target.value)}
                  className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-2 text-foreground focus:border-info focus:outline-none"
                />
              </div>
              <div>
                <label className="text-caption text-muted mb-1 block">Pendientes del módulo</label>
                <input
                  type="number" min="0"
                  value={config_contexto.num_pendientes ?? ""}
                  onChange={e => handleContextoChange("num_pendientes", e.target.value)}
                  className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-2 text-foreground focus:border-info focus:outline-none"
                />
              </div>
              <div>
                <label className="text-caption text-muted mb-1 block">ACNEAE</label>
                <input
                  type="number" min="0"
                  value={config_contexto.num_acneae ?? ""}
                  onChange={e => handleContextoChange("num_acneae", e.target.value)}
                  className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-2 text-foreground focus:border-info focus:outline-none"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Elenco de situaciones</label>
            <textarea
              value={config_contexto.elenco_situaciones || ""}
              onChange={e => handleContextoChange("elenco_situaciones", e.target.value)}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Circunstancias ocultas</label>
            <textarea
              value={config_contexto.circunstancias_ocultas || ""}
              onChange={e => handleContextoChange("circunstancias_ocultas", e.target.value)}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 border-t-4 border-t-teal-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span> Textos del modelo Simplificado (pd=)
        </h2>
        <p className="text-caption text-muted mb-4">
          Estos 2 campos son específicos del documento &quot;Programación suficiente&quot; (modelo oficial Simplificado).
          Si se dejan vacíos, se autogenera un texto por defecto razonable a partir del resto de datos del módulo.
        </p>
        <div className="space-y-4">
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Introducción</label>
            <textarea
              value={config_contexto.texto_introduccion || ""}
              onChange={e => handleContextoChange("texto_introduccion", e.target.value)}
              placeholder={t('placeholders.contexto.textoIntroduccion', {defaultValue: 'Párrafo introductorio del documento. Si se deja vacío, se genera uno automáticamente con el nombre del módulo, ciclo, régimen y duración.'})}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-body font-semibold text-foreground mb-1 block">Unidades didácticas del módulo</label>
            <textarea
              value={config_contexto.texto_uds_modulo || ""}
              onChange={e => handleContextoChange("texto_uds_modulo", e.target.value)}
              placeholder={t('placeholders.contexto.textoUdsModulo', {defaultValue: 'Descripción de cómo se organizan las unidades didácticas. Si se deja vacío, se genera automáticamente a partir de df_ud.'})}
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 border-t-4 border-t-amber-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><FileText className="w-[1.2em] h-[1.2em] mr-1" /></span> Datos de autoría y publicidad
        </h2>
        <div className="space-y-6">
          <NarrativeField
            id="textos_pd_bibliografia"
            title={t('campos.modulo.bibliografiaTitulo', {defaultValue: 'Bibliografía y recursos'})}
            description={t('campos.modulo.bibliografiaDesc', {defaultValue: 'Bibliografía principal para el profesorado y alumnado.'})}
          />
          <NarrativeField
            id="textos_pd_publicidad"
            title={t('campos.modulo.publicidadTitulo', {defaultValue: 'Publicidad de la programación'})}
            description={t('campos.modulo.publicidadDesc', {defaultValue: 'Cómo y dónde se publicará o podrá consultar la programación.'})}
          />
        </div>
      </div>
    </div>
    </>
  );
}

