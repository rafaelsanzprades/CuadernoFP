import React from 'react';
import { Settings2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';

export interface InstrumentoConfigData {
  escala?: string;
  agente?: string;
  recuperacion?: string;
}

interface InstrumentoConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  instrumentoId: string;
  instrumentoDesc: string;
  config: InstrumentoConfigData;
  onChange: (field: keyof InstrumentoConfigData, value: string) => void;
}

export function InstrumentoConfigModal({ isOpen, onClose, instrumentoId, instrumentoDesc, config, onChange }: InstrumentoConfigModalProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1e293b] border border-white/10 p-6 rounded-xl w-[500px] shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h3 className="text-subheading font-bold mb-1 flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-indigo-400" /> Configuración Avanzada
        </h3>
        <p className="text-body text-muted mb-6">Instrumento: {instrumentoId} - {instrumentoDesc}</p>

        <div className="space-y-4">
          <div>
            <label className="text-body font-semibold mb-1 block">Tipo de dato y Escala</label>
            <p className="text-caption text-muted mb-2">Selecciona la escala de calificación para este instrumento.</p>
            <select 
              value={config.escala || '0-10'} 
              onChange={(e) => onChange('escala', e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-body text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="0-10">Continua (0-10)</option>
              <option value="1-4">Discreta (1-4)</option>
              <option value="A-D">Letras (A-D)</option>
              <option value="Bien-Mal">Bien / Mal</option>
            </select>
          </div>

          <div>
            <label className="text-body font-semibold mb-1 block">Agente de Evaluación</label>
            <select 
              value={config.agente || 'Heteroevaluacion'} 
              onChange={(e) => onChange('agente', e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-body text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Heteroevaluacion">Heteroevaluación (Profesor)</option>
              <option value="Coevaluacion">Coevaluación (Entre alumnos)</option>
              <option value="Autoevaluacion">Autoevaluación (Propio alumno)</option>
            </select>
          </div>

          <div>
            <label className="text-body font-semibold mb-1 block">¿Sirve para recuperación?</label>
            <p className="text-caption text-muted mb-2">Indica si este instrumento califica en un periodo de recuperación (R1, R2, Final).</p>
            <select 
              value={config.recuperacion || 'No'} 
              onChange={(e) => onChange('recuperacion', e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-body text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="No">No (Ordinaria)</option>
              <option value="R1">Recuperación 1 (R1)</option>
              <option value="R2">Recuperación 2 (R2)</option>
              <option value="R3">Recuperación 3 (R3)</option>
              <option value="RF">Recuperación Final (RF)</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button variant="primary" onClick={onClose}>
            {t('common.aceptar', {defaultValue: 'Aceptar'})}
          </Button>
        </div>
      </div>
    </div>
  );
}
