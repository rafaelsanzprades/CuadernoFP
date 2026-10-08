"use client";
import { FileClock, FileText, TrendingUp } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { PanelPorAlumno, SeccionAcordeon } from "./PanelPorAlumno";
import { BoletinesTab } from "./BoletinesTab";
import { ExpedienteTab } from "./ExpedienteTab";
import { InsercionLaboral } from "./InsercionLaboral";

// Cierre -> Expediente: la ficha de cierre de cada alumno/a -- boletín
// individual, informe de evidencias e inserción laboral (2026-10-07; antes
// acordeones de Calificaciones -> Académicas).
export const ExpedienteAlumnoTab = () => {
  const { t } = useTranslation();
  return (
    <PanelPorAlumno>
      {(al) => (
        <>
          <SeccionAcordeon title={t('campos.orientacion.seccion7Titulo', {defaultValue: 'Boletín individual de calificaciones'})} icon={<FileText className="w-5 h-5 text-accent" />}>
            <BoletinesTab studentId={al.ID!} />
          </SeccionAcordeon>
          <SeccionAcordeon title={t('campos.orientacion.seccion8Titulo', {defaultValue: 'Informe de evidencias'})} icon={<FileClock className="w-5 h-5 text-muted" />}>
            <ExpedienteTab studentId={al.ID!} />
          </SeccionAcordeon>
          <SeccionAcordeon title={t('campos.orientacion.seccion5Titulo', {defaultValue: 'Inserción laboral'})} icon={<TrendingUp className="w-5 h-5 text-info" />}>
            <InsercionLaboral studentId={al.ID!} />
          </SeccionAcordeon>
        </>
      )}
    </PanelPorAlumno>
  );
};
