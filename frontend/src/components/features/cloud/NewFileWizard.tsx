"use client";
import { useState } from "react";
import { X, BookOpen, GraduationCap, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fileManager } from "@/services/fileManager";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

interface ModuleOption {
  code: string;
  name: string;
  groupName: string;
}

// Flat list of all modules from initialGroups
const ALL_MODULES: ModuleOption[] = [
  // 1º Instalaciones de Telecomunicaciones
  { code: "0237", name: "Infraestructuras comunes de telecomunicación en viviendas y edificios", groupName: "1º Instalaciones de Telecomunicaciones" },
  { code: "0359", name: "Electrónica aplicada", groupName: "1º Instalaciones de Telecomunicaciones" },
  { code: "0360", name: "Equipos microinformáticos", groupName: "1º Instalaciones de Telecomunicaciones" },
  { code: "0361", name: "Infraestructuras de redes de datos y sistemas de telefonía", groupName: "1º Instalaciones de Telecomunicaciones" },
  { code: "0362", name: "Instalaciones eléctricas básicas", groupName: "1º Instalaciones de Telecomunicaciones" },
  { code: "1664", name: "Digitalización aplicada a los sectores productivos (GM)", groupName: "1º Instalaciones de Telecomunicaciones" },
  { code: "A997", name: "Tutoría I", groupName: "1º Instalaciones de Telecomunicaciones" },
  { code: "0156", name: "Inglés Profesional (GM)", groupName: "1º Instalaciones de Telecomunicaciones" },
  { code: "1709", name: "Itinerario personal para la empleabilidad I", groupName: "1º Instalaciones de Telecomunicaciones" },
  // 2º Instalaciones de Telecomunicaciones
  { code: "0238", name: "Instalaciones domóticas", groupName: "2º Instalaciones de Telecomunicaciones" },
  { code: "0363", name: "Instalaciones de megafonía y sonorización", groupName: "2º Instalaciones de Telecomunicaciones" },
  { code: "0364", name: "Circuito cerrado de televisión y seguridad electrónica", groupName: "2º Instalaciones de Telecomunicaciones" },
  { code: "0365", name: "Instalaciones de radiocomunicaciones", groupName: "2º Instalaciones de Telecomunicaciones" },
  { code: "1708", name: "Sostenibilidad aplicada al sistema productivo", groupName: "2º Instalaciones de Telecomunicaciones" },
  { code: "A172", name: "Ofimática avanzada", groupName: "2º Instalaciones de Telecomunicaciones" },
  { code: "1713", name: "Proyecto intermodular", groupName: "2º Instalaciones de Telecomunicaciones" },
  { code: "A996", name: "Tutoría II", groupName: "2º Instalaciones de Telecomunicaciones" },
  { code: "1710", name: "Itinerario personal para la empleabilidad II", groupName: "2º Instalaciones de Telecomunicaciones" },
  // 1º Sistemas de Telecomunicaciones e Informáticos
  { code: "0525", name: "Configuración de infraestructuras de sistemas de tele", groupName: "1º Sistemas de Telecomunicaciones e Informáticos" },
  { code: "0551", name: "Elementos de sistemas de telecomunicaciones", groupName: "1º Sistemas de Telecomunicaciones e Informáticos" },
  { code: "0552", name: "Sistemas informáticos y redes locales", groupName: "1º Sistemas de Telecomunicaciones e Informáticos" },
  { code: "0553", name: "Aplicaciones web", groupName: "1º Sistemas de Telecomunicaciones e Informáticos" },
  { code: "0554", name: "Programación", groupName: "1º Sistemas de Telecomunicaciones e Informáticos" },
  { code: "0555", name: "Bases de datos", groupName: "1º Sistemas de Telecomunicaciones e Informáticos" },
  { code: "1665", name: "Digitalización aplicada a los sectores productivos (GS)", groupName: "1º Sistemas de Telecomunicaciones e Informáticos" },
  { code: "A998", name: "Tutoría III", groupName: "1º Sistemas de Telecomunicaciones e Informáticos" },
  { code: "0157", name: "Inglés Profesional (GS)", groupName: "1º Sistemas de Telecomunicaciones e Informáticos" },
  { code: "1711", name: "Itinerario personal para la empleabilidad III", groupName: "1º Sistemas de Telecomunicaciones e Informáticos" },
  // 2º Sistemas de Telecomunicaciones e Informáticos
  { code: "0556", name: "Administración de sistemas operativos", groupName: "2º Sistemas de Telecomunicaciones e Informáticos" },
  { code: "0557", name: "Desarrollo web en Archivos cliente", groupName: "2º Sistemas de Telecomunicaciones e Informáticos" },
  { code: "0558", name: "Desarrollo web en Archivos servidor", groupName: "2º Sistemas de Telecomunicaciones e Informáticos" },
  { code: "0559", name: "Implantación de aplicaciones web", groupName: "2º Sistemas de Telecomunicaciones e Informáticos" },
  { code: "0560", name: "Empresa y emprendimiento", groupName: "2º Sistemas de Telecomunicaciones e Informáticos" },
  { code: "1714", name: "Proyecto intermodular de SMIX", groupName: "2º Sistemas de Telecomunicaciones e Informáticos" },
  { code: "A999", name: "Tutoría IV", groupName: "2º Sistemas de Telecomunicaciones e Informáticos" },
  { code: "1712", name: "Itinerario personal para la empleabilidad IV", groupName: "2º Sistemas de Telecomunicaciones e Informáticos" },
  // 1º Desarrollo de Aplicaciones Multiplataforma
  { code: "0561", name: "Sistemas informáticos", groupName: "1º Desarrollo de Aplicaciones Multiplataforma" },
  { code: "0562", name: "Bases de datos", groupName: "1º Desarrollo de Aplicaciones Multiplataforma" },
  { code: "0563", name: "Programación", groupName: "1º Desarrollo de Aplicaciones Multiplataforma" },
  { code: "0564", name: "Desarrollo de interfaces", groupName: "1º Desarrollo de Aplicaciones Multiplataforma" },
  { code: "0565", name: "Acceso a datos", groupName: "1º Desarrollo de Aplicaciones Multiplataforma" },
  { code: "1666", name: "Digitalización aplicada a los sectores productivos (DAM)", groupName: "1º Desarrollo de Aplicaciones Multiplataforma" },
  { code: "A1000", name: "Tutoría V", groupName: "1º Desarrollo de Aplicaciones Multiplataforma" },
  { code: "0158", name: "Inglés Profesional (DAM)", groupName: "1º Desarrollo de Aplicaciones Multiplataforma" },
  { code: "1715", name: "Itinerario personal para la empleabilidad V", groupName: "1º Desarrollo de Aplicaciones Multiplataforma" },
  // 2º Desarrollo de Aplicaciones Multiplataforma
  { code: "0566", name: "Desarrollo de aplicaciones con tecnología Java", groupName: "2º Desarrollo de Aplicaciones Multiplataforma" },
  { code: "0567", name: "Desarrollo de aplicaciones con Archivos web", groupName: "2º Desarrollo de Aplicaciones Multiplataforma" },
  { code: "0568", name: "Desarrollo de aplicaciones con Archivos móvil", groupName: "2º Desarrollo de Aplicaciones Multiplataforma" },
  { code: "0569", name: "Empresa y emprendimiento", groupName: "2º Desarrollo de Aplicaciones Multiplataforma" },
  { code: "1716", name: "Proyecto intermodular de DAM", groupName: "2º Desarrollo de Aplicaciones Multiplataforma" },
  { code: "A1001", name: "Tutoría VI", groupName: "2º Desarrollo de Aplicaciones Multiplataforma" },
  { code: "1716", name: "Itinerario personal para la empleabilidad VI", groupName: "2º Desarrollo de Aplicaciones Multiplataforma" },
  // 1º Desarrollo de Aplicaciones Web
  { code: "0570", name: "Sistemas informáticos", groupName: "1º Desarrollo de Aplicaciones Web" },
  { code: "0571", name: "Bases de datos", groupName: "1º Desarrollo de Aplicaciones Web" },
  { code: "0572", name: "Programación", groupName: "1º Desarrollo de Aplicaciones Web" },
  { code: "0573", name: "Desarrollo web en Archivos cliente", groupName: "1º Desarrollo de Aplicaciones Web" },
  { code: "0574", name: "Desarrollo web en Archivos servidor", groupName: "1º Desarrollo de Aplicaciones Web" },
  { code: "1667", name: "Digitalización aplicada a los sectores productivos (DAW)", groupName: "1º Desarrollo de Aplicaciones Web" },
  { code: "A1002", name: "Tutoría VII", groupName: "1º Desarrollo de Aplicaciones Web" },
  { code: "0159", name: "Inglés Profesional (DAW)", groupName: "1º Desarrollo de Aplicaciones Web" },
  { code: "1717", name: "Itinerario personal para la empleabilidad VII", groupName: "1º Desarrollo de Aplicaciones Web" },
  // 2º Desarrollo de Aplicaciones Web
  { code: "0575", name: "Desarrollo web en Archivos cliente", groupName: "2º Desarrollo de Aplicaciones Web" },
  { code: "0576", name: "Desarrollo web en Archivos servidor", groupName: "2º Desarrollo de Aplicaciones Web" },
  { code: "0577", name: "Implantación de aplicaciones web", groupName: "2º Desarrollo de Aplicaciones Web" },
  { code: "0578", name: "Empresa y emprendimiento", groupName: "2º Desarrollo de Aplicaciones Web" },
  { code: "1718", name: "Proyecto intermodular de DAW", groupName: "2º Desarrollo de Aplicaciones Web" },
  { code: "A1003", name: "Tutoría VIII", groupName: "2º Desarrollo de Aplicaciones Web" },
  { code: "1718", name: "Itinerario personal para la empleabilidad VIII", groupName: "2º Desarrollo de Aplicaciones Web" },
];

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
  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState<ModuleOption | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const filteredModules = ALL_MODULES.filter(m =>
    m.code.toLowerCase().includes(search.toLowerCase()) ||
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.groupName.toLowerCase().includes(search.toLowerCase())
  );

  // Group by groupName
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
          toast.success(`Programación de ${selectedModule.name} creada correctamente.`);
          onClose();
        } else {
          toast.error("Error al crear la programación.");
        }
      } else {
        const ok = await fileManager.createNewCurso(selectedModule.groupName, getCurrentAcademicYear());
        if (ok) {
          toast.success(`Curso ${selectedModule.groupName} creado correctamente.`);
          onClose();
        } else {
          toast.error("Error al crear el curso.");
        }
      }
    } finally {
      setIsCreating(false);
    }
  };

  const [cursoYear, setCursoYear] = useState(getCurrentAcademicYear());
  const [cursoName, setCursoName] = useState("1A-GM");

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
        toast.success(`Curso ${fullCursoName} y su Grupo creados correctamente.`);
        onClose();
      } else {
        toast.error("Error al crear el curso.");
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
        toast.success("Curso DEMO creado correctamente.");
        onClose();
      } else {
        toast.error("Error al crear el curso DEMO.");
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
            <h2 className="text-lg font-bold text-foreground">
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
              <p className="text-sm text-muted mb-4">
                Selecciona el módulo para generar una programación vacía con la estructura correcta (RA/CE desde catálogo oficial).
              </p>
              {/* Search */}
              <input
                type="text"
                placeholder="Buscar por código o nombre del módulo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-foreground/5 border border-[var(--glass-border)] text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-info/50 mb-4"
                autoFocus
              />
              {/* Module list */}
              <div className="space-y-4">
                {Object.entries(grouped).map(([groupName, modules]) => (
                  <div key={groupName}>
                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2 px-1">{groupName}</h4>
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
                            <span className="text-xs font-mono font-bold opacity-60 shrink-0">{m.code}</span>
                            <span className="text-sm truncate">{m.name}</span>
                          </div>
                          {selectedModule?.code === m.code && (
                            <ChevronRight className="w-4 h-4 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {Object.keys(grouped).length === 0 && (
                  <p className="text-center text-muted py-8">No se encontraron módulos con ese criterio.</p>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted mb-6">
                Elige cómo quieres inicializar tu nuevo archivo de curso.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-foreground/5 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col gap-4 text-center group">
                  <div className="flex flex-col items-center mb-2">
                    <GraduationCap className="w-12 h-12 text-success/40 mb-3 group-hover:text-success transition-colors" />
                    <p className="text-foreground font-medium group-hover:text-success transition-colors">Crear curso vacío</p>
                  </div>
                  
                  <div className="flex gap-2 text-left">
                    <div className="flex-1">
                      <label className="text-xs text-muted font-medium mb-1 block">Año Académico</label>
                      <input 
                        type="text" 
                        value={cursoYear} 
                        onChange={e => setCursoYear(e.target.value)} 
                        className="w-full bg-background border border-[var(--glass-border)] rounded-md px-3 py-1.5 text-sm" 
                        placeholder="ej: 2025-26" 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted font-medium mb-1 block">Letra / Grupo</label>
                      <input 
                        type="text" 
                        value={cursoName} 
                        onChange={e => setCursoName(e.target.value)} 
                        className="w-full bg-background border border-[var(--glass-border)] rounded-md px-3 py-1.5 text-sm" 
                        placeholder="ej: 1A-GM" 
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleCreateCurso}
                    disabled={isCreating || !cursoYear || !cursoName}
                    className="w-full bg-success/10 hover:bg-success/20 text-success border border-success/30 transition-all mt-2"
                  >
                    Crear ahora
                  </Button>
                </div>
                <button
                  onClick={handleCreateCursoDemo}
                  disabled={isCreating}
                  className="bg-warning/5 border border-warning/20 rounded-xl p-6 text-center hover:bg-warning/10 hover:border-warning/40 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-warning text-warning-foreground text-xs font-bold px-2 py-1 rounded-bl-lg">
                    RECOMENDADO
                  </div>
                  <BookOpen className="w-12 h-12 text-warning/60 mx-auto mb-3 group-hover:text-warning transition-colors" />
                  <p className="text-foreground font-medium group-hover:text-warning transition-colors">Cargar datos DEMO</p>
                  <p className="text-sm text-muted mt-2">Genera un curso pre-rellenado con datos de ejemplo para explorar todas las funciones.</p>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--glass-border)]">
          <Button onClick={onClose} className="bg-foreground/5 hover:bg-foreground/10 text-muted border border-[var(--glass-border)]">
            Cancelar
          </Button>
          {fileType === 'programacion' && (
            <Button
              onClick={handleCreate}
              disabled={!selectedModule || isCreating}
              className="bg-info/20 hover:bg-info/30 text-info border border-info/30 disabled:opacity-40"
            >
              {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BookOpen className="w-4 h-4 mr-2" />}
              Crear programación
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
