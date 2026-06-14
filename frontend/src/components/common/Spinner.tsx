import React from 'react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

/**
 * Componente de Spinner reutilizable para estados de carga.
 * Utiliza lucide-react para el icono de carga animado.
 */
export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 24, 
  className = '', 
  label = 'Cargando...' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2 className="animate-spin text-blue-600" size={size} />
      {label && (
        <span className="text-sm text-gray-500 animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
};

/**
 * Variante de Spinner a pantalla completa para carga inicial de página.
 */
export const FullPageSpinner: React.FC<{ label?: string }> = ({ label = 'Cargando datos...' }) => {
  return (
    <div className="flex items-center justify-center w-full min-h-[400px]">
      <Spinner size={48} label={label} />
    </div>
  );
};

export default Spinner;
