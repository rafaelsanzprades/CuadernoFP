"use client";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTranslation } from "react-i18next";

export function useOnboardingTour() {
  const { t } = useTranslation();

  const startTour = () => {
    const tourDriver = driver({
      showProgress: true,
      allowClose: true,
      doneBtnText: t('campos.onboarding.entendido', {defaultValue: '¡Entendido!'}),
      nextBtnText: t('campos.onboarding.siguiente', {defaultValue: 'Siguiente'}),
      prevBtnText: t('campos.onboarding.anterior', {defaultValue: '⬅ Anterior'}),
      popoverClass: "driverjs-theme",
      steps: [
        {
          element: "body",
          popover: {
            title: t('campos.onboarding.bienvenidaTitulo', {defaultValue: '¡Bienvenido a Cuaderno FP!'}),
            description: t('campos.onboarding.bienvenidaDesc', {defaultValue: 'Te haremos un breve recorrido de 4 pasos para que le saques el máximo provecho. Puedes saltarlo o cerrarlo en cualquier momento.'}),
            align: "center"
          }
        },
        {
          element: "aside",
          popover: {
            title: t('campos.onboarding.navegacionTitulo', {defaultValue: 'Navegación principal'}),
            description: t('campos.onboarding.navegacionDesc', {defaultValue: 'Aquí tienes todas las herramientas: Configuración, Módulo, Alumnado y Evaluación.'}),
            side: "right",
            align: "start"
          }
        },
        {
          element: "header button:has(svg:first-of-type)", // The save button
          popover: {
            title: t('campos.onboarding.guardarDeshacerTitulo', {defaultValue: 'Guardar y Deshacer'}),
            description: t('campos.onboarding.guardarDeshacerDesc', {defaultValue: 'Puedes guardar manualmente aquí, aunque hay autoguardado. También tienes flechas para Deshacer/Rehacer o puedes usar Ctrl+S y Ctrl+Z.'}),
            side: "bottom",
            align: "end"
          }
        },
        {
          element: "[href='/inicio?tab=bienvenida']", // Inicio -- pestaña Datos, dentro
          popover: {
            title: t('campos.onboarding.pestanaArchivosTitulo', {defaultValue: 'Pestaña de Datos'}),
            description: t('campos.onboarding.pestanaArchivosDesc', {defaultValue: "Para empezar, ve a Inicio, abre la pestaña Datos y selecciona 'Datos DEMO' para explorar sin miedo."}),
            side: "right",
            align: "center"
          }
        }
      ]
    });

    tourDriver.drive();
  };

  return { startTour };
}
