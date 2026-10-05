"use client";
import { FileClock, TrendingUp } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { PanelPorAlumno, SeccionAcordeon, useFichaProfesional } from "./PanelPorAlumno";
import { ExpedienteTab } from "./ExpedienteTab";

// Cierre -> Alumnado: lo que se rellena o consulta al terminar el curso, por
// alumno/a -- inserción laboral post-ciclo y expediente (línea temporal de
// evidencias). Traídas de Alumnado -> Orientación profesional (antiguas
// secciones 5 y 8), 2026-10-05.

function Insercion({ studentId }: { studentId: string }) {
  const { t } = useTranslation();
  const { renderInput, renderTextarea, renderSelect } = useFichaProfesional(studentId);
  return (
    <div className="bg-background/20 border border-white/5 rounded-xl p-5 space-y-5">
      <p className="text-caption text-info border border-info/30 bg-info/10 rounded-lg px-3 py-2">
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
  );
}

export const InsercionExpedienteTab = () => {
  const { t } = useTranslation();
  return (
    <PanelPorAlumno>
      {(al) => (
        <>
          <SeccionAcordeon defaultOpen title={t('campos.orientacion.seccion8Titulo', {defaultValue: 'Informe de evidencias'})} icon={<FileClock className="w-5 h-5 text-muted" />}>
            <ExpedienteTab studentId={al.ID!} />
          </SeccionAcordeon>
          <SeccionAcordeon title={t('campos.orientacion.seccion5Titulo', {defaultValue: 'Inserción laboral'})} icon={<TrendingUp className="w-5 h-5 text-info" />}>
            <Insercion studentId={al.ID!} />
          </SeccionAcordeon>
        </>
      )}
    </PanelPorAlumno>
  );
};
