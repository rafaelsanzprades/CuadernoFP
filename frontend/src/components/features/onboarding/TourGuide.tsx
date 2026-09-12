"use client";
import { useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

export function TourGuide() {
  const pathname = usePathname();
  const hasRunRef = useRef(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Only run on client and once
    if (typeof window === "undefined" || hasRunRef.current) return;

    const tourCompleted = localStorage.getItem("cdd_tour_completed");
    if (tourCompleted === "true") return;

    // Only start the tour on the main dashboard or Archivos page
    if (pathname === "/" || pathname === "/archivos") {
      hasRunRef.current = true;
      
      const tourDriver = driver({
        showProgress: true,
        allowClose: true,
        doneBtnText: t('campos.onboarding.entendido', {defaultValue: '¡Entendido!'}),
        nextBtnText: t('campos.onboarding.siguiente', {defaultValue: 'Siguiente'}),
        prevBtnText: t('campos.onboarding.anterior', {defaultValue: '⬅ Anterior'}),
        popoverClass: "driverjs-theme",
        onDestroyed: () => {
          localStorage.setItem("cdd_tour_completed", "true");
        },
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
            element: "[href='/archivos']", // Archivos tab
            popover: {
              title: t('campos.onboarding.pestanaArchivosTitulo', {defaultValue: 'Pestaña de Archivos'}),
              description: t('campos.onboarding.pestanaArchivosDesc', {defaultValue: "Para empezar, ve a Archivos y selecciona 'Datos DEMO' para explorar sin miedo."}),
              side: "right",
              align: "center"
            }
          }
        ]
      });

      // Give it a tiny delay to allow the layout to render
      setTimeout(() => {
        tourDriver.drive();
      }, 500);
    }
  }, [pathname, t]);

  return null;
}
