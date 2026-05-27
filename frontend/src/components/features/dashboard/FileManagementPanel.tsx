import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";

interface FileManagementPanelProps {
  modules: { centro_modules: string[], pd_modules: string[], curso_modules: string[] };
  selectedCentro: string;
  setSelectedCentro: (v: string) => void;
  selectedPd: string;
  setSelectedPd: (v: string) => void;
  selectedCurso: string;
  setSelectedCurso: (v: string) => void;
  newCentroName: string;
  setNewCentroName: (v: string) => void;
  newPdName: string;
  setNewPdName: (v: string) => void;
  newCursoName: string;
  setNewCursoName: (v: string) => void;
  handleLoadCentro: () => void;
  handleLoadPd: () => void;
  handleLoadCurso: () => void;
  handleSaveCentro: () => void;
  handleSavePd: () => void;
  handleSaveCurso: () => void;
  moduleData: any;
}

export function FileManagementPanel({
  modules,
  selectedCentro, setSelectedCentro,
  selectedPd, setSelectedPd,
  selectedCurso, setSelectedCurso,
  newCentroName, setNewCentroName,
  newPdName, setNewPdName,
  newCursoName, setNewCursoName,
  handleLoadCentro, handleLoadPd, handleLoadCurso,
  handleSaveCentro, handleSavePd, handleSaveCurso,
  moduleData
}: FileManagementPanelProps) {

  // Filtramos los cursos para que solo se muestren los hijos de la PD seleccionada
  const pdPrefix = selectedPd ? selectedPd.replace("-pd", "") : "";
  const filteredCursos = modules.curso_modules.filter(c => pdPrefix && c.startsWith(`${pdPrefix}-curso-`));

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Tarjeta de Centro */}
        <Card className="h-full p-6 border-t-4 border-t-purple-500 flex flex-col gap-6 transform transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
          <div>
            <h4 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
              <span>🏢</span> Centro
            </h4>
            <p className="text-sm text-muted">
              Contexto global del Centro (planes, calendario, familias profesionales).
            </p>
          </div>

          <div className="space-y-4">
            <Select
              label="Seleccionar Centro"
              value={selectedCentro}
              onChange={(e) => setSelectedCentro(e.target.value)}
            >
              {modules.centro_modules.length === 0 && <option value="">No hay contextos de Centro</option>}
              {modules.centro_modules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </Select>
            <Button
              onClick={handleLoadCentro}
              disabled={!selectedCentro}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-500 hover:to-purple-300"
            >
              <span>✅</span> Activar Centro
            </Button>
          </div>
        </Card>

        {/* Tarjeta de Módulo */}
        <Card className="h-full p-6 border-t-4 border-t-accent flex flex-col gap-6 transform transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10">
          <div>
            <h4 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
              <span>⚙️</span> Módulo
            </h4>
            <p className="text-sm text-muted">
              Activa la Programación Didáctica maestra (RAs, UDs, Tareas, etc.) que servirá de plantilla.
            </p>
          </div>

          <div className="space-y-4">
            <Select
              label="Seleccionar Módulo"
              value={selectedPd}
              onChange={(e) => {
                setSelectedPd(e.target.value);
                // Reseteamos el curso seleccionado al cambiar de PD
                setSelectedCurso("");
              }}
            >
              {modules.pd_modules.length === 0 && <option value="">No hay Módulos disponibles</option>}
              {modules.pd_modules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </Select>
            <Button
              onClick={handleLoadPd}
              disabled={!selectedPd}
              className="w-full bg-gradient-to-r from-accent to-[#1abc9c] hover:from-[#1abc9c] hover:to-accent"
            >
              <span>✅</span> Activar Módulo
            </Button>
          </div>

          <div className="h-px bg-foreground/10 w-full my-2"></div>

          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Clonar/Crear nuevo Módulo"
                value={newPdName}
                onChange={(e) => setNewPdName(e.target.value)}
                placeholder="Ej: nuevo-modulo"
              />
              <span className="absolute right-4 top-10 text-muted font-mono text-sm">-pd</span>
            </div>
            <Button
              onClick={handleSavePd}
              disabled={!newPdName || !moduleData}
              variant="secondary"
              className="w-full"
            >
              <span>✨</span> Crear nueva Programación
            </Button>
          </div>
        </Card>

        {/* Tarjeta de Curso */}
        <Card className="h-full p-6 border-t-4 border-t-blue-500 flex flex-col gap-6 transform transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
          <div>
            <h4 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
              <span>📅</span> Curso
            </h4>
            <p className="text-sm text-muted">
              Activa el Curso escolar real (Alumnado, Notas, Seguimiento diario) del Módulo seleccionado.
            </p>
          </div>

          <div className="space-y-4">
            <Select
              label="Seleccionar Curso"
              value={selectedCurso}
              onChange={(e) => setSelectedCurso(e.target.value)}
            >
              {filteredCursos.length === 0 && <option value="">No hay Cursos para este Módulo</option>}
              {filteredCursos.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </Select>
            <Button
              onClick={handleLoadCurso}
              disabled={!selectedCurso}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300"
            >
              <span>✅</span> Activar Curso
            </Button>
          </div>

          <div className="h-px bg-foreground/10 w-full my-2"></div>

          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Crear nuevo Curso para el Módulo"
                value={newCursoName}
                onChange={(e) => setNewCursoName(e.target.value)}
                placeholder="Ej: 2026-27"
              />
              <span className="absolute left-4 top-10 text-muted font-mono text-sm pr-2 border-r border-[var(--glass-border)] opacity-50 overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
                {pdPrefix}-curso-
              </span>
            </div>
            <Button
              onClick={handleSaveCurso}
              disabled={!newCursoName || !selectedPd}
              variant="secondary"
              className="w-full"
            >
              <span>📅</span> Crear nuevo Curso
            </Button>
          </div>
        </Card>

      </div>
    </div>
  );
}
