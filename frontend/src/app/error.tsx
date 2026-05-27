"use client";

import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-red-500/20 rounded-full">
            <ShieldAlert className="w-12 h-12 text-red-400" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">¡Ups! Algo ha fallado</h2>
          <p className="text-muted text-sm">
            Se ha producido un error inesperado al cargar esta página.
          </p>
        </div>
        <div className="bg-foreground/15 p-3 rounded text-left overflow-x-auto text-xs text-red-300 font-mono">
          {error.message || "Error desconocido"}
        </div>
        <button
          onClick={() => reset()}
          className="w-full bg-accent hover:bg-accent/80 text-foreground font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
