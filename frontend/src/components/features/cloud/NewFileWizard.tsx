"use client";
import { useState, useEffect } from "react";
import { X, BookOpen, GraduationCap, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fileManager } from "@/services/fileManager";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface ModuleOption {
  code: string;
  name: string;
  groupName: string;
}

interface CatalogFamily {
  id: number;
  name: string;
  degrees: { id: number; name: string; code: string }[];
}

const getCurrentAcademicYear = () => {
  const today = new Date();
  const currentY = today.getMonth() < 6 ? today.getFullYear() - 1 : today.getFullYear();
  const nextYStr = String(currentY + 1).slice(-2);
  return `${currentY}-${nextYStr}`;
};

interface NewFileWizardProps {
  isOpen: boolean;
  onClose: () => void;
  fileType: 'programacion' | 'curso';
}

export function NewFileWizard({ isOpen, onClose, fileType }: NewFileWizardProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState<ModuleOption | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [cursoYear, setCursoYear] = useState(getCurrentAcademicYear());
  const [cursoName, setCursoName] = useState("1A-GM");

  // Familia -> Título -> Módulos, desde el catálogo oficial (BBDD) en vez del
  // fixture hardcodeado que solo cubría ~78 módulos ficticios de Telecomunicaciones.
  const [families, setFamilies] = useState<CatalogFamily[]>([]);
  const [viewFamilyId, setViewFamilyId] = useState("");
  const [viewDegreeId, setViewDegreeId] = useState("");
  const [degreeModules, setDegreeModules] = useState<ModuleOption[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/families`)
      .then(r => r.json())
      .then(json => { if (json.status === "success") setFamilies(json.data); });
  }, [isOpen]);

  const viewFamily = families.find(f => f.id.toString() === viewFamilyId);
  const viewDegree = viewFamily?.degrees.find(d => d.id.toString() === viewDegreeId);

  useEffect(() => {
    if (!viewDegree?.code) {
      setDegreeModules([]);
      return;
    }
    setModulesLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/catalog/curriculum/${viewDegree.code}`)
      .then(r => r.json())
      .then(json => {
        const modulos = json.status === "success" ? json.data.modulos : [];
        setDegreeModules(modulos.map((m: any) => ({
          code: m.codigo,
          name: m.nombre,
          groupName: `${m.curso} ${viewDegree.name}`,
        })));
      })
      .catch(() => setDegreeModules([]))
      .finally(() => setModulesLoading(false));
  }, [viewDegree?.code, viewDegree?.name]);

  if (!isOpen) return null;

  const filteredModules = degreeModules.filter(m =>
    m.code.toLowerCase().includes(search.toLowerCase()) ||
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  // Group by groupName (curso 1º/2º dentro del título seleccionado)
  const grouped = filteredModules.reduce<Record<string, ModuleOption[]>>((acc, m) => {
    if (!acc[m.groupName]) acc[m.groupName] = [];
    acc[m.groupName].push(m);
    return acc;
  }, {});

  const handleCreate = async () => {
    if (!selectedModule) return;
    setIsCreating(true);
    try {
      if (fileType === 'programacion') {
        const ok = await fileManager.createNewProgramacion(selectedModule.code, selectedModule.name);
        if (ok) {
          toast.success(t('toasts.newFileWizard.programacionCreada', {name: selectedModule.name, defaultValue: 'Programación de {{name}} creada correctamente.'}));
          onClose();
        } else {
          toast.error(t('toasts.newFileWizard.errorCrearProgramacion', {defaultValue: "Error al crear la programación."}));
        }
      } else {
        const ok = await fileManager.createNewCurso(selectedModule.groupName, getCurrentAcademicYear());
        if (ok) {
          toast.success(t('toasts.newFileWizard.cursoCreado', {name: selectedModule.groupName, defaultValue: 'Curso {{name}} creado correctamente.'}));
          onClose();
        } else {
          toast.error(t('toasts.newFileWizard.errorCrearCurso', {defaultValue: "Error al crear el curso."}));
        }
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateCurso = async () => {
    setIsCreating(true);
    try {
      // The user wants "C - 2025-26 - 1A-GM - ELE-203.json" roughly, but our fileManager takes cursoName and year.
      // E.g. "1A-GM - ELE-203"
      const pdFile = useAppStore.getState().pdFileSource.fileName || "";
      const baseName = pdFile ? pdFile.replace('P - ', '').replace('.json', '') : "Módulo Desconocido";
      
      const fullCursoName = `${cursoName} - ${baseName}`;
      
      const ok = await fileManager.createNewCurso(fullCursoName, cursoYear);
      if (ok) {
        toast.success(t('toasts.newFileWizard.cursoYGrupoCreados', {name: fullCursoName, defaultValue: 'Curso {{name}} y su grupo creados correctamente.'}));
        onClose();
      } else {
        toast.error(t('toasts.newFileWizard.errorCrearCurso', {defaultValue: "Error al crear el curso."}));
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateCursoDemo = async () => {
    setIsCreating(true);
    try {
      const ok = await fileManager.createNewCursoFromDemo("Curso DEMO", getCurrentAcademicYear());
      if (ok) {
        toast.success(t('toasts.newFileWizard.cursoDemoCreado', {defaultValue: "Curso DEMO creado correctamente."}));
        onClose();
      } else {
        toast.error(t('toasts.newFileWizard.errorCrearCursoDemo', {defaultValue: "Error al crear el curso DEMO."}));
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-background border border-[var(--glass-border)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            {fileType === 'programacion' ? (
              <BookOpen className="w-5 h-5 text-info" />
            ) : (
              <GraduationCap className="w-5 h-5 text-success" />
            )}
            <h2 className="text-subheading font-bold text-foreground">
              Nuevo archivo de {fileType === 'programacion' ? 'Programación' : 'Curso'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-foreground/10 text-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {fileType === 'programacion' ? (
            <>
              <p className="text-body text-muted mb-4">
                Selecciona el módulo para generar una programación vacía con la estructura correcta (RA/CE desde catálogo oficial).
              </p>
              {/* Familia / Título */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <select
                  value={viewFamilyId}
                  onChange={e => { setViewFamilyId(e.target.value); setViewDegreeId(""); setSelectedModule(null); }}
                  className="w-full px-4 py-2.5 rounded-xl bg-foreground/5 border border-[var(--glass-border)] text-foreground focus:outline-none focus:ring-2 focus:ring-info/50"
                >
                  <option value="">-- Familia profesional --</option>
                  {families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <select
                  value={viewDegreeId}
                  onChange={e => { setViewDegreeId(e.target.value); setSelectedModule(null); }}
                  disabled={!viewFamilyId}
                  className="w-full px-4 py-2.5 rounded-xl bg-foreground/5 border border-[var(--glass-border)] text-foreground focus:outline-none focus:ring-2 focus:ring-info/50 disabled:opacity-40"
                >
                  <option value="">-- Título --</option>
                  {viewFamily?.degrees.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              {/* Search */}
              <input
                type="text"
                placeholder={t('placeholders.archivos.buscarModulo', {defaultValue: 'Buscar por código o nombre del módulo...'})}
                value={search}
                onChange={e => setSearch(e.target.value)}
                disabled={!viewDegreeId}
                className="w-full px-4 py-2.5 rounded-xl bg-foreground/5 border border-[var(--glass-border)] text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-info/50 mb-4 disabled:opacity-40"
              />
              {/* Module list */}
              <div className="space-y-4">
                {!viewDegreeId && (
                  <p className="text-center text-muted py-8">Selecciona una familia y un título para ver sus módulos.</p>
                )}
                {viewDegreeId && modulesLoading && (
                  <p className="text-center text-muted py-8 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Cargando módulos del catálogo...
                  </p>
                )}
                {Object.entries(grouped).map(([groupName, modules]) => (
                  <div key={groupName}>
                    <h4 className="text-caption font-bold text-muted tracking-wider mb-2 px-1">{groupName}</h4>
                    <div className="space-y-1">
                      {modules.map(m => (
                        <button
                          key={m.code}
                          onClick={() => setSelectedModule(m)}
                          className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all ${
                            selectedModule?.code === m.code
                              ? 'bg-info/20 border border-info/40 text-info'
                              : 'bg-foreground/5 border border-transparent hover:bg-foreground/10 text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-caption font-mono font-bold opacity-60 shrink-0">{m.code}</span>
                            <span className="text-body truncate">{m.name}</span>
                          </div>
                          {selectedModule?.code === m.code && (
                            <ChevronRight className="w-4 h-4 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {viewDegreeId && !modulesLoading && Object.keys(grouped).length === 0 && (
                  <p className="text-center text-muted py-8">No se encontraron módulos con ese criterio.</p>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-body text-muted mb-6">
                Elige cómo quieres inicializar tu nuevo archivo de curso.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-foreground/5 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col gap-4 text-center group">
                  <div className="flex flex-col items-center mb-2">
                    <GraduationCap className="w-12 h-12 text-success/40 mb-3 group-hover:text-success transition-colors" />
                    <p className="text-foreground font-medium group-hover:text-success transition-colors">{t('botones.archivos.crearCursoVacio', {defaultValue: 'Crear curso vacío'})}</p>
                  </div>
                  
                  <div className="flex gap-2 text-left">
                    <div className="flex-1">
                      <label className="text-caption text-muted font-medium mb-1 block">Año Académico</label>
                      <input 
                        type="text" 
                        value={cursoYear} 
                        onChange={e => setCursoYear(e.target.value)} 
                        className="w-full bg-background border border-[var(--glass-border)] rounded-md px-3 py-1.5 text-body" 
                        placeholder={t('placeholders.archivos.ejCursoAcademico', {defaultValue: 'ej: 2025-26'})}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-caption text-muted font-medium mb-1 block">Letra / Grupo</label>
                      <input 
                        type="text" 
                        value={cursoName} 
                        onChange={e => setCursoName(e.target.value)} 
                        className="w-full bg-background border border-[var(--glass-border)] rounded-md px-3 py-1.5 text-body" 
                        placeholder={t('placeholders.archivos.ejNombreGrupo', {defaultValue: 'ej: 1A-GM'})} 
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleCreateCurso}
                    disabled={isCreating || !cursoYear || !cursoName}
                    className="w-full bg-success/10 hover:bg-success/20 text-success border border-success/30 transition-all mt-2"
                  >
                    {t('botones.archivos.crearAhora', {defaultValue: 'Crear ahora'})}
                  </Button>
                </div>
                <button
                  onClick={handleCreateCursoDemo}
                  disabled={isCreating}
                  className="bg-warning/5 border border-warning/20 rounded-xl p-6 text-center hover:bg-warning/10 hover:border-warning/40 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-warning text-warning-foreground text-caption font-bold px-2 py-1 rounded-bl-lg">
                    RECOMENDADO
                  </div>
                  <BookOpen className="w-12 h-12 text-warning/60 mx-auto mb-3 group-hover:text-warning transition-colors" />
                  <p className="text-foreground font-medium group-hover:text-warning transition-colors">{t('botones.archivos.cargarDatosDemo', {defaultValue: 'Cargar datos DEMO'})}</p>
                  <p className="text-body text-muted mt-2">Genera un curso pre-rellenado con datos de ejemplo para explorar todas las funciones.</p>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--glass-border)]">
          <Button onClick={onClose} className="bg-foreground/5 hover:bg-foreground/10 text-muted border border-[var(--glass-border)]">
            {t('common.cancelar', {defaultValue: 'Cancelar'})}
          </Button>
          {fileType === 'programacion' && (
            <Button
              onClick={handleCreate}
              disabled={!selectedModule || isCreating}
              className="bg-info/20 hover:bg-info/30 text-info border border-info/30 disabled:opacity-40"
            >
              {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BookOpen className="w-4 h-4 mr-2" />}
              {t('botones.archivos.crearProgramacion', {defaultValue: 'Crear programación'})}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
