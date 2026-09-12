"use client";
import { Brain, Briefcase, ChevronDown, ChevronUp, HelpCircle, NotebookPen, Rocket, Target, TrendingUp, Users } from "lucide-react";
import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Alumnado } from "@/types";
import { useTranslation } from "react-i18next";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const renderSectionHeader = (
  id: string,
  title: string,
  icon: React.ReactNode,
  isOpen: boolean,
  onToggle: (id: string) => void
) => (
  <button
    onClick={() => onToggle(id)}
    className="w-full flex items-center justify-between p-4 bg-foreground/5 hover:bg-foreground/10 rounded-xl border border-white/5 transition-all text-left font-bold text-base"
  >
    <div className="flex items-center gap-3 text-foreground">
      {icon}
      <span>{title}</span>
    </div>
    {isOpen ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
  </button>
);

// ─── Main OrientacionIndividualTab ─────────────────────────────────────────────
// Perfil de orientación profesional por alumno/a: motivación, experiencia
// laboral, aptitudes, aspiraciones e inserción post-ciclo. Recuperado y
// adaptado (guardado vía updateCursoData, no PUT manual) de OrientacionTab.tsx
// en APP-EntidadIES, que a su vez venía de la página /profesional de este
// mismo proyecto (2026-06-01, retirada 2026-07-02 en una limpieza de alcance).

export const OrientacionIndividualTab = () => {
  const { t } = useTranslation();
  const { cursoData, updateCursoData } = useAppStore();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    motivacion: true,
    experiencia: false,
    aptitudes: false,
    aspiraciones: false,
    insercion: false,
    notas: false,
  });

  const df_al = cursoData?.df_al || [];
  const activeStudents = [...df_al.filter((al: Alumnado) => al.Estado !== "Baja")].sort(
    (a, b) => (a.Apellidos || "").localeCompare(b.Apellidos || "")
  );

  const profesionalLedger = cursoData?.profesional_ledger || {};
  const currentStudent = activeStudents.find((s) => s.ID === selectedStudentId);
  const studentData = selectedStudentId ? (profesionalLedger[selectedStudentId] || {}) : {};

  React.useEffect(() => {
    if (activeStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(activeStudents[0].ID || "");
    }
  }, [activeStudents.length]);

  const toggleSection = (section: string) =>
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const updateField = (field: string, value: any) => {
    if (!selectedStudentId) return;
    const newLedger = { ...profesionalLedger };
    if (!newLedger[selectedStudentId]) newLedger[selectedStudentId] = {};
    newLedger[selectedStudentId] = { ...newLedger[selectedStudentId], [field]: value };
    updateCursoData("profesional_ledger", newLedger);
  };

  // Field renderers
  const renderInput = (field: string, label: string, type = "text", placeholder = "") => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted tracking-wider">{label}</label>
      <input
        type={type}
        value={studentData[field] || ""}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground text-sm focus:border-accent focus:outline-none focus:bg-background/40 transition-all"
      />
    </div>
  );

  const renderTextarea = (field: string, label: string, placeholder = "") => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted tracking-wider">{label}</label>
      <textarea
        value={studentData[field] || ""}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground text-sm focus:border-accent focus:outline-none focus:bg-background/40 transition-all resize-none"
      />
    </div>
  );

  const renderSelect = (field: string, label: string, options: { value: string; label: string }[]) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted tracking-wider">{label}</label>
      <select
        value={studentData[field] || ""}
        onChange={(e) => updateField(field, e.target.value)}
        className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground text-sm focus:border-accent focus:outline-none focus:bg-background/40 transition-all cursor-pointer"
      >
        <option value="" className="bg-[#0f172a] text-muted">{t('checks.orientacion.seleccionar', {defaultValue: '-- Seleccionar --'})}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#0f172a] text-foreground">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderCheckbox = (field: string, label: string) => {
    const isChecked = studentData[field] === true || studentData[field] === "X";
    return (
      <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer hover:text-foreground transition-colors py-1.5 select-none">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => updateField(field, e.target.checked ? "X" : "")}
          className="w-4 h-4 rounded bg-foreground/15 border-[var(--glass-border)] accent-accent focus:ring-0 focus:outline-none cursor-pointer"
        />
        <span>{label}</span>
      </label>
    );
  };

  if (activeStudents.length === 0) {
    return (
      <Card className="p-8 text-center border-l-4 border-l-yellow-500 mt-6">
        <h2 className="text-xl font-bold text-warning mb-2">{t('campos.orientacion.sinAlumnadoTitulo', {defaultValue: 'Sin alumnado'})}</h2>
        <p className="text-foreground/80">
          {t('campos.orientacion.primeroRegistraAlumnadoPre', {defaultValue: 'Primero registra alumnado en la pestaña'})} <span className="inline-flex"><Users className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('campos.orientacion.primeroRegistraAlumnadoPost', {defaultValue: 'Matrícula.'})}
        </p>
      </Card>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-280px)] min-h-[500px]">
      {/* Student list sidebar */}
      <div className="w-80 bg-foreground/5 border border-white/5 rounded-2xl flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-white/5 bg-foreground/10">
          <div className="text-xs font-medium text-muted tracking-wider">
            {t('campos.orientacion.alumnadoActivoCount', {count: activeStudents.length, defaultValue: 'Alumnado activo ({{count}})'})}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
          {activeStudents.map((al) => {
            const isSelected = al.ID === selectedStudentId;
            const hasData = !!(profesionalLedger[al.ID!] && Object.keys(profesionalLedger[al.ID!]).length > 0);
            return (
              <button
                key={al.ID}
                onClick={() => setSelectedStudentId(al.ID || "")}
                className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between ${
                  isSelected
                    ? "bg-accent text-background font-bold shadow-md shadow-accent/15"
                    : "text-foreground/80 hover:bg-foreground/5"
                }`}
              >
                <div className="truncate pr-2">
                  <div className="text-sm truncate">
                    {al.Apellidos}, {al.Nombre}
                  </div>
                  <div className={`text-[10px] font-mono ${isSelected ? "text-background/70" : "text-muted"}`}>
                    {al.ID}
                  </div>
                </div>
                {hasData && (
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? "bg-background/60" : "bg-accent/70"}`}
                    title={t('campos.orientacion.tieneDatosOrientacion', {defaultValue: 'Tiene datos de orientación'})}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion panel */}
      <div className="flex-1 bg-foreground/5 border border-white/5 rounded-2xl flex flex-col overflow-hidden">
        {currentStudent ? (
          <>
            <div className="p-6 border-b border-white/5 bg-foreground/10 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-2xl font-black text-foreground">
                  {currentStudent.Nombre} {currentStudent.Apellidos}
                </h3>
                <div className="text-xs text-muted font-mono mt-1">
                  ID: {currentStudent.ID} · {currentStudent.Edad ? t('campos.orientacion.nAnos', {n: currentStudent.Edad, defaultValue: '{{n}} años'}) : t('campos.orientacion.edadNoRegistrada', {defaultValue: 'Edad no registrada'})}
                </div>
              </div>
              {studentData["intencion_al_terminar"] && (
                <div className="text-xs font-semibold bg-accent/10 border border-accent/30 text-accent px-3 py-1.5 rounded-full">
                  {studentData["intencion_al_terminar"]}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">

              {/* Sección 1: Motivación y elección */}
              <div className="space-y-3">
                {renderSectionHeader("motivacion", t('campos.orientacion.seccion1Titulo', {defaultValue: 'Sección 1: Motivación y elección del ciclo'}), <Target className="w-5 h-5 text-info" />, openSections.motivacion, toggleSection)}
                {openSections.motivacion && (
                  <div className="bg-background/20 border border-white/5 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                    {renderSelect("motivo_eleccion", t('campos.orientacion.motivoEleccionLabel', {defaultValue: 'Motivo de elección del ciclo'}), [
                      { value: "Vocación", label: t('checks.orientacion.motivoEleccion.vocacion', {defaultValue: 'Vocación / pasión por el sector'}) },
                      { value: "Salida laboral", label: t('checks.orientacion.motivoEleccion.salidaLaboral', {defaultValue: 'Salida laboral clara'}) },
                      { value: "Reorientación", label: t('checks.orientacion.motivoEleccion.reorientacion', {defaultValue: 'Reorientación profesional'}) },
                      { value: "Por descarte", label: t('checks.orientacion.motivoEleccion.porDescarte', {defaultValue: 'Por descarte (no otra opción)'}) },
                      { value: "Familia", label: t('checks.orientacion.motivoEleccion.familia', {defaultValue: 'Influencia familiar'}) },
                      { value: "Coste económico", label: t('checks.orientacion.motivoEleccion.costeEconomico', {defaultValue: 'Coste económico vs universidad'}) },
                    ])}
                    {renderSelect("via_acceso", t('campos.orientacion.viaAccesoLabel', {defaultValue: 'Vía de acceso al ciclo'}), [
                      { value: "ESO", label: t('checks.orientacion.viaAcceso.eso', {defaultValue: 'ESO (título graduado)'}) },
                      { value: "FPGB", label: t('checks.orientacion.viaAcceso.fpgb', {defaultValue: 'FP Grado Básico'}) },
                      { value: "FPGM", label: t('checks.orientacion.viaAcceso.fpgm', {defaultValue: 'FP Grado Medio (a GS)'}) },
                      { value: "Bachillerato", label: t('checks.orientacion.viaAcceso.bachillerato', {defaultValue: 'Bachillerato'}) },
                      { value: "Prueba acceso", label: t('checks.orientacion.viaAcceso.pruebaAcceso', {defaultValue: 'Prueba de acceso'}) },
                      { value: "Convalidación parcial", label: t('checks.orientacion.viaAcceso.convalidacionParcial', {defaultValue: 'Convalidación parcial'}) },
                      { value: "Otra", label: t('checks.orientacion.viaAcceso.otra', {defaultValue: 'Otra vía'}) },
                    ])}
                    {renderInput("ciclo_previo", t('campos.orientacion.cicloPrevioLabel', {defaultValue: 'Ciclo o estudios previos cursados'}), "text", t('campos.orientacion.cicloPrevioPlaceholder', {defaultValue: 'Ej. ASIR, DAW, SMR, Bachillerato Científico...'}))}
                    <div className="flex flex-col gap-3 pt-1">
                      {renderCheckbox("primera_opcion", t('checks.orientacion.primeraOpcion', {defaultValue: 'Este ciclo era su primera opción'}))}
                      {renderCheckbox("estudia_y_trabaja", t('checks.orientacion.estudiaYTrabaja', {defaultValue: 'Estudia a la vez que trabaja'}))}
                      {renderCheckbox("cambio_de_ciclo", t('checks.orientacion.cambioDeCiclo', {defaultValue: 'Cambio de ciclo / segunda matrícula'}))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sección 2: Experiencia laboral previa */}
              <div className="space-y-3">
                {renderSectionHeader("experiencia", t('campos.orientacion.seccion2Titulo', {defaultValue: 'Sección 2: Experiencia y situación laboral'}), <Briefcase className="w-5 h-5 text-warning" />, openSections.experiencia, toggleSection)}
                {openSections.experiencia && (
                  <div className="bg-background/20 border border-white/5 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                    {renderSelect("experiencia_previa", t('campos.orientacion.experienciaPreviaLabel', {defaultValue: 'Experiencia laboral previa'}), [
                      { value: "Sin experiencia", label: t('checks.orientacion.experienciaPrevia.sinExperiencia', {defaultValue: 'Sin experiencia laboral'}) },
                      { value: "Esporádica", label: t('checks.orientacion.experienciaPrevia.esporadica', {defaultValue: 'Trabajos esporádicos / eventuales'}) },
                      { value: "Relacionada", label: t('checks.orientacion.experienciaPrevia.relacionada', {defaultValue: 'Relacionada con el ciclo'}) },
                      { value: "No relacionada", label: t('checks.orientacion.experienciaPrevia.noRelacionada', {defaultValue: 'No relacionada con el ciclo'}) },
                      { value: "Autónomo", label: t('checks.orientacion.experienciaPrevia.autonomo', {defaultValue: 'Actividad por cuenta propia'}) },
                    ])}
                    {renderInput("sector_experiencia", t('campos.orientacion.sectorExperienciaLabel', {defaultValue: 'Sector de experiencia previa'}), "text", t('campos.orientacion.sectorExperienciaPlaceholder', {defaultValue: 'Ej. Hostelería, Comercio, Tecnología, Sanidad...'}))}
                    {renderInput("meses_experiencia", t('campos.orientacion.mesesExperienciaLabel', {defaultValue: 'Meses de experiencia estimados'}), "number", "0")}
                    {renderSelect("jornada_actual", t('campos.orientacion.jornadaActualLabel', {defaultValue: 'Situación laboral actual'}), [
                      { value: "No trabaja", label: t('checks.orientacion.jornadaActual.noTrabaja', {defaultValue: 'No trabaja actualmente'}) },
                      { value: "Parcial", label: t('checks.orientacion.jornadaActual.parcial', {defaultValue: 'Trabaja a tiempo parcial'}) },
                      { value: "Completa", label: t('checks.orientacion.jornadaActual.completa', {defaultValue: 'Trabaja a jornada completa'}) },
                      { value: "Autónomo", label: t('checks.orientacion.jornadaActual.autonomo', {defaultValue: 'Autónomo / por cuenta propia'}) },
                    ])}
                    {renderInput("empresa_actual", t('campos.orientacion.empresaActualLabel', {defaultValue: 'Empresa actual (si aplica)'}), "text", t('campos.orientacion.empresaActualPlaceholder', {defaultValue: 'Nombre de la empresa...'}))}
                    {renderCheckbox("cotiza_seguridad_social", t('checks.orientacion.cotizaSeguridadSocial', {defaultValue: 'Cotiza en Seguridad Social actualmente'}))}
                  </div>
                )}
              </div>

              {/* Sección 3: Intereses y aptitudes */}
              <div className="space-y-3">
                {renderSectionHeader("aptitudes", t('campos.orientacion.seccion3Titulo', {defaultValue: 'Sección 3: Intereses y aptitudes detectadas'}), <Brain className="w-5 h-5 text-info" />, openSections.aptitudes, toggleSection)}
                {openSections.aptitudes && (
                  <div className="bg-background/20 border border-white/5 rounded-xl p-5 space-y-5 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderSelect("aptitud_principal", t('campos.orientacion.aptitudPrincipalLabel', {defaultValue: 'Aptitud principal detectada'}), [
                        { value: "Técnica", label: t('checks.orientacion.aptitudPrincipal.tecnica', {defaultValue: 'Técnica / práctica'}) },
                        { value: "Analítica", label: t('checks.orientacion.aptitudPrincipal.analitica', {defaultValue: 'Analítica / investigadora'}) },
                        { value: "Creativa", label: t('checks.orientacion.aptitudPrincipal.creativa', {defaultValue: 'Creativa / innovadora'}) },
                        { value: "Comercial", label: t('checks.orientacion.aptitudPrincipal.comercial', {defaultValue: 'Comercial / negociadora'}) },
                        { value: "Comunicativa", label: t('checks.orientacion.aptitudPrincipal.comunicativa', {defaultValue: 'Comunicativa / docente'}) },
                        { value: "Relacional", label: t('checks.orientacion.aptitudPrincipal.relacional', {defaultValue: 'Relacional / social'}) },
                        { value: "Emprendedora", label: t('checks.orientacion.aptitudPrincipal.emprendedora', {defaultValue: 'Emprendedora / autónoma'}) },
                        { value: "Organizativa", label: t('checks.orientacion.aptitudPrincipal.organizativa', {defaultValue: 'Organizativa / gestora'}) },
                      ])}
                      {renderSelect("area_interes", t('campos.orientacion.areaInteresLabel', {defaultValue: 'Área de interés dominante'}), [
                        { value: "Desarrollo software", label: t('checks.orientacion.areaInteres.desarrolloSoftware', {defaultValue: 'Desarrollo software / programación'}) },
                        { value: "Sistemas / infraestructura", label: t('checks.orientacion.areaInteres.sistemasInfraestructura', {defaultValue: 'Sistemas / infraestructura'}) },
                        { value: "Ciberseguridad", label: t('checks.orientacion.areaInteres.ciberseguridad', {defaultValue: 'Ciberseguridad'}) },
                        { value: "Datos / IA", label: t('checks.orientacion.areaInteres.datosIA', {defaultValue: 'Datos / IA / Machine Learning'}) },
                        { value: "Diseño / UX", label: t('checks.orientacion.areaInteres.disenoUX', {defaultValue: 'Diseño / UX / multimedia'}) },
                        { value: "Electrónica / hardware", label: t('checks.orientacion.areaInteres.electronicaHardware', {defaultValue: 'Electrónica / hardware'}) },
                        { value: "Atención al cliente", label: t('checks.orientacion.areaInteres.atencionCliente', {defaultValue: 'Atención al cliente / soporte'}) },
                        { value: "Gestión / administración", label: t('checks.orientacion.areaInteres.gestionAdministracion', {defaultValue: 'Gestión / administración'}) },
                        { value: "Sanidad / cuidados", label: t('checks.orientacion.areaInteres.sanidadCuidados', {defaultValue: 'Sanidad / cuidados'}) },
                        { value: "Industria / producción", label: t('checks.orientacion.areaInteres.industriaProduccion', {defaultValue: 'Industria / producción'}) },
                        { value: "Otro", label: t('checks.orientacion.areaInteres.otro', {defaultValue: 'Otro / no definido aún'}) },
                      ])}
                      {renderSelect("ambito_laboral_preferido", t('campos.orientacion.ambitoLaboralPreferidoLabel', {defaultValue: 'Ámbito laboral preferido'}), [
                        { value: "Empresa grande", label: t('checks.orientacion.ambitoLaboral.empresaGrande', {defaultValue: 'Empresa grande / corporación'}) },
                        { value: "PYME", label: t('checks.orientacion.ambitoLaboral.pyme', {defaultValue: 'PYME / empresa mediana'}) },
                        { value: "Startup", label: t('checks.orientacion.ambitoLaboral.startup', {defaultValue: 'Startup / empresa emergente'}) },
                        { value: "Administración pública", label: t('checks.orientacion.ambitoLaboral.administracionPublica', {defaultValue: 'Administración pública'}) },
                        { value: "ONG / sector social", label: t('checks.orientacion.ambitoLaboral.ongSectorSocial', {defaultValue: 'ONG / sector social'}) },
                        { value: "Autónomo / freelance", label: t('checks.orientacion.ambitoLaboral.autonomoFreelance', {defaultValue: 'Autónomo / freelance'}) },
                        { value: "Indiferente", label: t('checks.orientacion.ambitoLaboral.indiferente', {defaultValue: 'Indiferente'}) },
                      ])}
                      {renderSelect("preferencia_geografica", t('campos.orientacion.preferenciaGeograficaLabel', {defaultValue: 'Preferencia geográfica de trabajo'}), [
                        { value: "Local / ciudad actual", label: t('checks.orientacion.preferenciaGeografica.local', {defaultValue: 'Local / ciudad actual'}) },
                        { value: "Nacional", label: t('checks.orientacion.preferenciaGeografica.nacional', {defaultValue: 'Nacional (movilidad España)'}) },
                        { value: "Internacional", label: t('checks.orientacion.preferenciaGeografica.internacional', {defaultValue: 'Internacional'}) },
                        { value: "Indiferente", label: t('checks.orientacion.preferenciaGeografica.indiferente', {defaultValue: 'Indiferente'}) },
                      ])}
                    </div>

                    <div className="border-t border-white/5 pt-4">
                      <div className="text-xs font-medium text-muted tracking-wider mb-3">{t('campos.orientacion.idiomasTrabajoTitulo', {defaultValue: 'Idiomas de trabajo'})}</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {renderCheckbox("idioma_espanol", t('checks.orientacion.idiomaEspanol', {defaultValue: 'Español (nativo / fluido)'}))}
                        {renderCheckbox("idioma_ingles", t('checks.orientacion.idiomaIngles', {defaultValue: 'Inglés'}))}
                        {renderCheckbox("idioma_frances", t('checks.orientacion.idiomaFrances', {defaultValue: 'Francés'}))}
                        {renderCheckbox("idioma_aleman", t('checks.orientacion.idiomaAleman', {defaultValue: 'Alemán'}))}
                        {renderCheckbox("idioma_portugues", t('checks.orientacion.idiomaPortugues', {defaultValue: 'Portugués'}))}
                        {renderCheckbox("idioma_otro", t('checks.orientacion.idiomaOtro', {defaultValue: 'Otro idioma'}))}
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4">
                      {renderTextarea("obs_aptitudes", t('campos.orientacion.obsAptitudesLabel', {defaultValue: 'Observaciones del tutor sobre aptitudes e intereses'}), t('campos.orientacion.obsAptitudesPlaceholder', {defaultValue: 'Describe las fortalezas observadas, áreas de mejora, actitud ante el trabajo en equipo, iniciativa, etc.'}))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sección 4: Aspiraciones al terminar */}
              <div className="space-y-3">
                {renderSectionHeader("aspiraciones", t('campos.orientacion.seccion4Titulo', {defaultValue: 'Sección 4: Aspiraciones al finalizar el ciclo'}), <Rocket className="w-5 h-5 text-success" />, openSections.aspiraciones, toggleSection)}
                {openSections.aspiraciones && (
                  <div className="bg-background/20 border border-white/5 rounded-xl p-5 space-y-5 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderSelect("intencion_al_terminar", t('campos.orientacion.intencionAlTerminarLabel', {defaultValue: 'Intención principal al terminar'}), [
                        { value: "Empleo inmediato", label: t('checks.orientacion.intencionAlTerminar.empleoInmediato', {defaultValue: 'Buscar empleo inmediatamente'}) },
                        { value: "FEOE / prácticas empresa", label: t('checks.orientacion.intencionAlTerminar.feoePracticasEmpresa', {defaultValue: 'FEOE / prácticas en empresa colaboradora'}) },
                        { value: "Ciclo superior", label: t('checks.orientacion.intencionAlTerminar.cicloSuperior', {defaultValue: 'Continuar con otro ciclo (GM→GS)'}) },
                        { value: "Universidad", label: t('checks.orientacion.intencionAlTerminar.universidad', {defaultValue: 'Continuar en universidad'}) },
                        { value: "Emprender", label: t('checks.orientacion.intencionAlTerminar.emprender', {defaultValue: 'Emprender / autoempleo'}) },
                        { value: "Sin decidir", label: t('checks.orientacion.intencionAlTerminar.sinDecidir', {defaultValue: 'Aún sin decidir'}) },
                      ])}
                      {renderInput("empresa_objetivo", t('campos.orientacion.empresaObjetivoLabel', {defaultValue: 'Empresa o sector objetivo (si lo tiene)'}), "text", t('campos.orientacion.empresaObjetivoPlaceholder', {defaultValue: 'Ej. empresa local TIC, clínica propia...'}))}
                      {renderInput("ciclo_superior_interes", t('campos.orientacion.cicloSuperiorInteresLabel', {defaultValue: 'Ciclo superior / grado de interés'}), "text", t('campos.orientacion.cicloSuperiorInteresPlaceholder', {defaultValue: 'Ej. DAM, ASIR, Ingeniería Informática, ADE...'}))}
                    </div>

                    <div className="border-t border-white/5 pt-4">
                      <div className="text-xs font-medium text-muted tracking-wider mb-3">{t('campos.orientacion.interesesEspecificosTitulo', {defaultValue: 'Intereses específicos'})}</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {renderCheckbox("interes_erasmus", t('checks.orientacion.interesErasmus', {defaultValue: 'Interesado en FEOE internacional (Erasmus+)'}))}
                        {renderCheckbox("interes_bolsa_empleo", t('checks.orientacion.interesBolsaEmpleo', {defaultValue: 'Interesado en bolsa de empleo del centro'}))}
                        {renderCheckbox("interes_mentoria", t('checks.orientacion.interesMentoria', {defaultValue: 'Quiere mentoría con exalumnado/profesional'}))}
                        {renderCheckbox("interes_emprender", t('checks.orientacion.interesEmprender', {defaultValue: 'Tiene idea de negocio / proyecto propio'}))}
                        {renderCheckbox("interes_universidad", t('checks.orientacion.interesUniversidad', {defaultValue: 'Valora acceder a universidad tras FP'}))}
                        {renderCheckbox("empresa_identificada", t('checks.orientacion.empresaIdentificada', {defaultValue: 'Ya tiene empresa de interés identificada'}))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sección 5: Seguimiento de inserción */}
              <div className="space-y-3">
                {renderSectionHeader("insercion", t('campos.orientacion.seccion5Titulo', {defaultValue: 'Sección 5: Inserción laboral (post-ciclo)'}), <TrendingUp className="w-5 h-5 text-info" />, openSections.insercion, toggleSection)}
                {openSections.insercion && (
                  <div className="bg-background/20 border border-white/5 rounded-xl p-5 space-y-5 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-xs text-info border border-info/30 bg-info/10 rounded-lg px-3 py-2">
                      {t('campos.orientacion.seccion5InfoDesc', {defaultValue: 'Esta sección se rellena al finalizar el ciclo o como seguimiento de egresados.'})}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderSelect("estado_insercion", t('campos.orientacion.estadoInsercionLabel', {defaultValue: 'Estado de inserción laboral'}), [
                        { value: "En formación", label: t('checks.orientacion.estadoInsercion.enFormacion', {defaultValue: 'Todavía en formación / ciclo en curso'}) },
                        { value: "En búsqueda", label: t('checks.orientacion.estadoInsercion.enBusqueda', {defaultValue: 'Egresado - en búsqueda activa'}) },
                        { value: "Empleado empresa", label: t('checks.orientacion.estadoInsercion.empleadoEmpresa', {defaultValue: 'Empleado en empresa'}) },
                        { value: "FEOE", label: t('checks.orientacion.estadoInsercion.feoe', {defaultValue: 'Realizando FEOE / prácticas'}) },
                        { value: "Autoempleo", label: t('checks.orientacion.estadoInsercion.autoempleo', {defaultValue: 'Autoempleo / autónomo'}) },
                        { value: "Sigue estudiando", label: t('checks.orientacion.estadoInsercion.sigueEstudiando', {defaultValue: 'Sigue estudiando (ciclo / universidad)'}) },
                        { value: "Sin datos", label: t('checks.orientacion.estadoInsercion.sinDatos', {defaultValue: 'Sin datos de seguimiento'}) },
                      ])}
                      {renderSelect("relacion_ciclo", t('campos.orientacion.relacionCicloLabel', {defaultValue: 'Relación del empleo con el ciclo'}), [
                        { value: "Sí, directamente", label: t('checks.orientacion.relacionCiclo.siDirectamente', {defaultValue: 'Sí, directamente relacionado'}) },
                        { value: "Parcialmente", label: t('checks.orientacion.relacionCiclo.parcialmente', {defaultValue: 'Parcialmente relacionado'}) },
                        { value: "No relacionado", label: t('checks.orientacion.relacionCiclo.noRelacionado', {defaultValue: 'No relacionado con el ciclo'}) },
                        { value: "N/A", label: t('checks.orientacion.relacionCiclo.noAplica', {defaultValue: 'No aplica (sigue estudiando)'}) },
                      ])}
                      {renderInput("empresa_insercion", t('campos.orientacion.empresaInsercionLabel', {defaultValue: 'Empresa de inserción'}), "text", t('campos.orientacion.empresaInsercionPlaceholder', {defaultValue: 'Nombre de la empresa...'}))}
                      {renderInput("puesto_obtenido", t('campos.orientacion.puestoObtenidoLabel', {defaultValue: 'Puesto o rol obtenido'}), "text", t('campos.orientacion.puestoObtenidoPlaceholder', {defaultValue: 'Ej. Técnico de redes, Desarrollador Jr, Soporte TI...'}))}
                      {renderInput("fecha_insercion", t('campos.orientacion.fechaInsercionLabel', {defaultValue: 'Fecha de incorporación'}), "date")}
                      {renderSelect("modalidad_contrato", t('campos.orientacion.modalidadContratoLabel', {defaultValue: 'Modalidad de contrato'}), [
                        { value: "Indefinido", label: t('checks.orientacion.modalidadContrato.indefinido', {defaultValue: 'Indefinido'}) },
                        { value: "Temporal", label: t('checks.orientacion.modalidadContrato.temporal', {defaultValue: 'Temporal / obra y servicio'}) },
                        { value: "Autónomo", label: t('checks.orientacion.modalidadContrato.autonomo', {defaultValue: 'Autónomo'}) },
                        { value: "Prácticas", label: t('checks.orientacion.modalidadContrato.practicas', {defaultValue: 'Prácticas / becario'}) },
                        { value: "Beca", label: t('checks.orientacion.modalidadContrato.beca', {defaultValue: 'Beca'}) },
                        { value: "FEOE", label: t('checks.orientacion.modalidadContrato.feoe', {defaultValue: 'Contrato FEOE'}) },
                      ])}
                      {renderSelect("valoracion_egresado", t('campos.orientacion.valoracionEgresadoLabel', {defaultValue: 'Valoración global del egresado (1-5)'}), [
                        { value: "1", label: t('checks.orientacion.valoracionEgresado.v1', {defaultValue: '1 - Muy baja'}) },
                        { value: "2", label: t('checks.orientacion.valoracionEgresado.v2', {defaultValue: '2 - Baja'}) },
                        { value: "3", label: t('checks.orientacion.valoracionEgresado.v3', {defaultValue: '3 - Media'}) },
                        { value: "4", label: t('checks.orientacion.valoracionEgresado.v4', {defaultValue: '4 - Alta'}) },
                        { value: "5", label: t('checks.orientacion.valoracionEgresado.v5', {defaultValue: '5 - Excelente'}) },
                      ])}
                    </div>
                    <div className="border-t border-white/5 pt-4">
                      {renderTextarea("obs_insercion", t('campos.orientacion.obsInsercionLabel', {defaultValue: 'Observaciones de seguimiento de inserción'}), t('campos.orientacion.obsInsercionPlaceholder', {defaultValue: 'Notas sobre el proceso de inserción, dificultades, contacto post-ciclo...'}))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sección 6: Notas del tutor */}
              <div className="space-y-3">
                {renderSectionHeader("notas", t('campos.orientacion.seccion6Titulo', {defaultValue: 'Sección 6: Notas y seguimiento del tutor'}), <NotebookPen className="w-5 h-5 text-danger" />, openSections.notas, toggleSection)}
                {openSections.notas && (
                  <div className="bg-background/20 border border-white/5 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                    {renderInput("reuniones_celebradas", t('campos.orientacion.reunionesCelebradasLabel', {defaultValue: 'Nº de reuniones de orientación celebradas'}), "number", "0")}
                    {renderInput("fecha_ultima_reunion", t('campos.orientacion.fechaUltimaReunionLabel', {defaultValue: 'Fecha de última reunión / entrevista'}), "date")}
                    <div className="flex flex-col gap-2 pt-1">
                      {renderCheckbox("familia_informada", t('checks.orientacion.familiaInformada', {defaultValue: 'Familia / tutores legales informados'}))}
                      {renderCheckbox("derivado_orientador", t('checks.orientacion.derivadoOrientador', {defaultValue: 'Derivado al orientador/a del centro'}))}
                      {renderCheckbox("informe_emitido", t('checks.orientacion.informeEmitido', {defaultValue: 'Informe de orientación emitido'}))}
                    </div>
                    {renderInput("fecha_derivacion", t('campos.orientacion.fechaDerivacionLabel', {defaultValue: 'Fecha de derivación al orientador/a'}), "date")}
                    <div className="md:col-span-2">
                      {renderTextarea("resumen_orientacion", t('campos.orientacion.resumenOrientacionLabel', {defaultValue: 'Resumen de orientación (campo libre)'}), t('campos.orientacion.resumenOrientacionPlaceholder', {defaultValue: 'Escribe aquí el resumen de la orientación: decisiones tomadas, acuerdos con el alumnado/a y la familia, próximos pasos...'}))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-8 text-muted">
            <HelpCircle className="w-12 h-12 text-muted/50 mb-3" />
            <p className="font-semibold text-lg">{t('campos.comun.ningunAlumnadoSeleccionado', {defaultValue: 'Ningún alumnado seleccionado'})}</p>
            <p className="text-sm opacity-80">{t('campos.orientacion.selectaAlumnadoDesc', {defaultValue: 'Selecciona un alumnado de la lista de la izquierda.'})}</p>
          </div>
        )}
      </div>
    </div>
  );
};
