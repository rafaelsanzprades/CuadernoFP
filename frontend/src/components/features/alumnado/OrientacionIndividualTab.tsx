"use client";
import { Brain, Briefcase, Rocket, Target } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/store/useAppStore";
import { PanelPorAlumno, SeccionAcordeon, useFichaProfesional } from "./PanelPorAlumno";

// Perfil de orientación profesional por alumno/a (preparación, se rellena
// al empezar el curso): motivación y experiencia, intereses y aspiraciones.
// Recuperado y adaptado (guardado vía updateCursoData, no PUT manual) de
// OrientacionTab.tsx en APP-EntidadIES, que a su vez venía de la página
// /profesional de este mismo proyecto (2026-06-01, retirada 2026-07-02 en una
// limpieza de alcance). Reorganizado el 2026-10-05: 6 secciones -> 2 (la
// inserción post-ciclo y el expediente pasaron a Cierre, el boletín a
// Calificaciones, y las notas del tutor se eliminaron).

function Ficha({ studentId }: { studentId: string }) {
  const { t } = useTranslation();
  const { renderInput, renderTextarea, renderSelect, renderCheckbox } = useFichaProfesional(studentId);
  return (
    <>
      <SeccionAcordeon title={t('campos.orientacion.seccion1Titulo', {defaultValue: 'Motivación y experiencia'})} icon={<><Target className="w-5 h-5 text-info" /><Briefcase className="w-5 h-5 text-warning -ml-1" /></>}>
        <div className="bg-background/20 border border-white/5 rounded-xl p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="border-t border-white/5 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </SeccionAcordeon>

      <SeccionAcordeon title={t('campos.orientacion.seccion2Titulo', {defaultValue: 'Intereses y aspiraciones'})} icon={<><Brain className="w-5 h-5 text-info" /><Rocket className="w-5 h-5 text-success -ml-1" /></>}>
        <div className="bg-background/20 border border-white/5 rounded-xl p-5 space-y-5">
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
          <div className="border-t border-white/5 pt-4 space-y-5">
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
        </div>
      </SeccionAcordeon>
    </>
  );
}

export const OrientacionIndividualTab = () => {
  const { cursoData } = useAppStore();
  const profesionalLedger = cursoData?.profesional_ledger || {};
  return (
    <PanelPorAlumno
      hasData={(id) => !!(profesionalLedger[id] && Object.keys(profesionalLedger[id]).length > 0)}
      badge={(al) => {
        const intencion = profesionalLedger[al.ID!]?.intencion_al_terminar;
        return intencion ? (
          <div className="text-caption font-semibold bg-accent/10 border border-accent/30 text-accent px-3 py-1.5 rounded-full">{intencion}</div>
        ) : null;
      }}
    >
      {(al) => <Ficha studentId={al.ID!} />}
    </PanelPorAlumno>
  );
};
