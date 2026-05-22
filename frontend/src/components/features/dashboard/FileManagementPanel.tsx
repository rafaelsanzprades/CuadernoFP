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
  return (
    <div>
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3 mb-2">
          📁 Gestión de archivos
        </h2>
        <p className="text-gray-400 mb-6">Carga y guarda los datos de Centro educativo; módulo didáctico; y curso y alumnado.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Tarjeta de Centro educativo*/}
        <Card className="p-6 border-t-4 border-t-purple-500 flex flex-col gap-6 transform transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
          <div>
            <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span>🏢</span> Centro educativo
            </h4>
            <p className="text-sm text-gray-400">
              Información del Centro educativo, presentación, planes, calendario académico y descargar PDF.
            </p>
          </div>

          <div className="space-y-4">
            <Select
              label="Seleccionar Centro educativo"
              value={selectedCentro}
              onChange={(e) => setSelectedCentro(e.target.value)}
            >
              {modules.centro_modules.length === 0 && <option value="">No hay archivos de Centro</option>}
              {modules.centro_modules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </Select>
            <Button
              onClick={handleLoadCentro}
              disabled={!selectedCentro}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-500 hover:to-purple-300"
            >
              <span>📂</span> Cargar Centro educativo
            </Button>
          </div>

          <div className="h-px bg-white/10 w-full my-2"></div>

          <div className="space-y-4">
            <Input
              label="Guardar Centro educativo"
              value={newCentroName}
              onChange={(e) => setNewCentroName(e.target.value)}
              placeholder="Nombre del archivo de Centro"
            />
            <Button
              onClick={handleSaveCentro}
              disabled={!newCentroName}
              variant="secondary"
              className="w-full"
            >
              <span>💾</span> Guardar Centro educativo
            </Button>
          </div>
        </Card>

        {/* Tarjeta de Módulo (PD) */}
        <Card className="p-6 border-t-4 border-t-accent flex flex-col gap-6 transform transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10">
          <div>
            <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span>⚙️</span> Módulo didáctico
            </h4>
            <p className="text-sm text-gray-400">
              Programación del módulo didáctico, matrices RA→CE→UD, instrumentos de evaluación, programación de aula y seguimiento diario.
            </p>
          </div>

          <div className="space-y-4">
            <Select
              label="Seleccionar Módulo didáctico"
              value={selectedPd}
              onChange={(e) => setSelectedPd(e.target.value)}
            >
              {modules.pd_modules.length === 0 && <option value="">No hay archivos de Módulo disponibles</option>}
              {modules.pd_modules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </Select>
            <Button
              onClick={handleLoadPd}
              disabled={!selectedPd}
              className="w-full bg-gradient-to-r from-accent to-[#1abc9c] hover:from-[#1abc9c] hover:to-accent"
            >
              <span>📂</span> Cargar Módulo didáctico
            </Button>
          </div>

          <div className="h-px bg-white/10 w-full my-2"></div>

          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Guardar Módulo didáctico"
                value={newPdName}
                onChange={(e) => setNewPdName(e.target.value)}
                placeholder="Nombre del archivo de Módulo"
              />
              <span className="absolute right-4 top-10 text-gray-500 font-mono text-sm">-pd</span>
            </div>
            <Button
              onClick={handleSavePd}
              disabled={!newPdName || !moduleData}
              variant="secondary"
              className="w-full"
            >
              <span>💾</span> Guardar Módulo didáctico
            </Button>
          </div>
        </Card>

        {/* Tarjeta de Curso */}
        <Card className="p-6 border-t-4 border-t-blue-500 flex flex-col gap-6 transform transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
          <div>
            <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span>📅</span> Curso y alumnado
            </h4>
            <p className="text-sm text-gray-400">
              Curso actual: Matrícula alumnado, calificación académica, calificación FEOE, evaluación continua, análisis grupal y portal alumnado.
            </p>
          </div>

          <div className="space-y-4">
            <Select
              label="Seleccionar Curso y alumnado"
              value={selectedCurso}
              onChange={(e) => setSelectedCurso(e.target.value)}
            >
              {modules.curso_modules.length === 0 && <option value="">No hay archivos de Curso disponibles</option>}
              {modules.curso_modules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </Select>
            <Button
              onClick={handleLoadCurso}
              disabled={!selectedCurso}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300"
            >
              <span>📂</span> Cargar Curso y alumnado
            </Button>
          </div>

          <div className="h-px bg-white/10 w-full my-2"></div>

          <div className="space-y-4">
            <Input
              label="Guardar Curso y alumnado"
              value={newCursoName}
              onChange={(e) => setNewCursoName(e.target.value)}
              placeholder="Nombre del archivo de Curso"
            />
            <Button
              onClick={handleSaveCurso}
              disabled={!newCursoName}
              variant="secondary"
              className="w-full"
            >
              <span>💾</span> Guardar Curso y alumnado
            </Button>
          </div>
        </Card>

      </div>
    </div>
  );
}
