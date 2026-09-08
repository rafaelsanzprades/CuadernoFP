"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Rubrica } from "@/types";

interface CalificarConRubricaModalProps {
  isOpen: boolean;
  onClose: () => void;
  rubrica: Rubrica;
  alumnoNombre: string;
  actividadDesc: string;
  valorInicial?: number | null;
  onGuardar: (nota: number) => void;
}

export function CalificarConRubricaModal({ isOpen, onClose, rubrica, alumnoNombre, actividadDesc, onGuardar }: CalificarConRubricaModalProps) {
  const { t } = useTranslation();
  const [seleccion, setSeleccion] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const criterios = rubrica.criterios || [];
  const notaCalculada = criterios.reduce((suma, crit) => {
    const nivelId = seleccion[crit.id_criterio];
    const nivel = (crit.niveles || []).find(n => n.id_nivel === nivelId);
    return suma + (nivel ? Number(nivel.puntos) || 0 : 0);
  }, 0);

  const handleGuardar = () => {
    onGuardar(Math.max(0, Math.min(10, notaCalculada)));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e293b] border border-white/10 rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl relative">
        <div className="sticky top-0 bg-[#1e293b] border-b border-white/10 p-5 flex items-start justify-between">
          <div>
            <h3 className="text-subheading font-bold text-foreground">
              {t('campos.evaluacion.calificarConRubricaTitulo', { defaultValue: 'Calificar con rúbrica' })}
            </h3>
            <p className="text-body text-muted mt-1">{actividadDesc} — {alumnoNombre} · <span className="text-accent">{rubrica.nombre}</span></p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 text-center">
            <span className="text-caption text-muted">{t('campos.evaluacion.notaCalculada', { defaultValue: 'Nota calculada' })}: </span>
            <span className="text-heading font-black text-accent">{notaCalculada.toFixed(2)}</span>
          </div>

          {criterios.map(crit => (
            <div key={crit.id_criterio} className="border border-white/10 rounded-lg p-3">
              <p className="font-semibold text-foreground mb-2">
                {crit.descripcion} <span className="text-caption text-muted">({t('campos.instrumentos.puntuacionMaxima', { defaultValue: 'Puntuación máxima' })}: {crit.puntuacion_maxima})</span>
              </p>
              <div className="space-y-1.5">
                {(crit.niveles || []).map(nivel => (
                  <label key={nivel.id_nivel} className="flex items-center gap-2 cursor-pointer text-body text-foreground/90">
                    <input
                      type="radio"
                      name={`crit-${crit.id_criterio}`}
                      checked={seleccion[crit.id_criterio] === nivel.id_nivel}
                      onChange={() => setSeleccion(s => ({ ...s, [crit.id_criterio]: nivel.id_nivel }))}
                    />
                    {nivel.descripcion} <span className="text-muted">({nivel.puntos} {t('campos.instrumentos.puntos', { defaultValue: 'Puntos' })})</span>
                  </label>
                ))}
                {(crit.niveles || []).length === 0 && (
                  <p className="text-caption text-muted italic">{t('campos.instrumentos.criterioSinNiveles', { defaultValue: 'Este criterio no tiene niveles definidos todavía.' })}</p>
                )}
              </div>
            </div>
          ))}

          {criterios.length === 0 && (
            <p className="text-body text-muted">{t('campos.instrumentos.rubricaSinCriterios', { defaultValue: 'Esta rúbrica no tiene criterios definidos todavía.' })}</p>
          )}
        </div>

        <div className="sticky bottom-0 bg-[#1e293b] border-t border-white/10 p-5 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-foreground/10 text-foreground font-semibold text-body hover:bg-foreground/20">
            {t('common.cancelar', { defaultValue: 'Cancelar' })}
          </button>
          <button onClick={handleGuardar} className="px-4 py-2 rounded-lg bg-accent text-white font-semibold text-body hover:bg-accent/90">
            {t('common.guardar', { defaultValue: 'Guardar' })}
          </button>
        </div>
      </div>
    </div>
  );
}
