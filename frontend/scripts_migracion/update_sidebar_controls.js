const fs = require('fs');

const sidebarPath = 'c:/GD-rsp/APP-CuadernoFP/frontend/src/components/layout/Sidebar.tsx';
let sidebar = fs.readFileSync(sidebarPath, 'utf8');

// Imports
if (!sidebar.includes('import { fileManager }')) {
  sidebar = sidebar.replace(/import \{ usePathname \}.*?;/g, "$&\nimport { useRouter } from 'next/navigation';\nimport { fileManager } from '@/services/fileManager';\nimport toast from 'react-hot-toast';\nimport { showRichToast } from '@/utils/toast';");
}
if (!sidebar.includes('Hourglass')) {
  sidebar = sidebar.replace(/import \{ ChevronLeft, ChevronRight, CalendarDays, FolderOpen \} from "lucide-react";/, 'import { ChevronLeft, ChevronRight, CalendarDays, FolderOpen, Hourglass, Save, ChevronDown } from "lucide-react";');
}

// Helpers
const helperFunc = `
const getGroupDisplayName = (fileName: string) => {
  const cleanName = fileName.replace('.json', '');
  const parts = cleanName.split(' - ');
  if (parts.length >= 4) {
    const code = parts[2];
    let acronym = code;
    for (const g of initialGroups) {
      const m = g.modules.find(mod => mod.code === code);
      if (m && m.acronym) { acronym = m.acronym; break; }
    }
    if (acronym !== code) {
      return \`\${parts[0]} - \${parts[1]} - \${code} - \${acronym} - \${parts.slice(3).join(' - ')}\`;
    }
  }
  return cleanName;
};
`;
if (!sidebar.includes('getGroupDisplayName')) {
  sidebar = sidebar.replace(/export default function Sidebar\(\) \{/, helperFunc + "\nexport default function Sidebar() {");
}

// State and effect
const stateToAdd = `
  const router = useRouter();
  const [localGroups, setLocalGroups] = useState<string[]>([]);
  const [activeLocalGroup, setActiveLocalGroup] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const { moduleData, cursoData, saveModuleData, saveCursoData, workspaceHandle } = useAppStore();

  useEffect(() => {
    if (workspaceHandle && dataSource === 'local') {
      fileManager.scanGroupsInWorkspace(workspaceHandle).then(groups => setLocalGroups(groups));
    }
  }, [workspaceHandle, dataSource]);

  const handleSave = async () => {
    if (dataSource !== 'local') return;
    setIsSaving(true);
    let ok: boolean | "conflict" = false;
    let cursoOk: boolean | "conflict" = false;
    
    if (moduleData && activeModuleId) {
      ok = await saveModuleData();
    }
    if (cursoData && activeCursoId) {
      cursoOk = await saveCursoData();
      ok = (ok === true || cursoOk === true) ? true : (ok === "conflict" || cursoOk === "conflict" ? "conflict" : false);
    }
    
    if (ok === "conflict") {
      showRichToast.error("Conflicto de versiones", "Los datos están obsoletos. Por favor, recarga la página.");
    } else if (ok === true) {
      showRichToast.success(\`Guardado con éxito\`, \`Datos actualizados.\`);
    } else {
      showRichToast.error("Error al guardar", "Revisa la conexión o los datos.");
    }
    setIsSaving(false);
  };
`;
if (!sidebar.includes('const [localGroups')) {
  sidebar = sidebar.replace(/const pathname = usePathname\(\);/, "const pathname = usePathname();" + stateToAdd);
}

// JSX Block
const jsxBlock = `
            {/* DEMO/REAL Buttons and Group Selector */}
            {isSidebarOpen && (
              <div className="flex flex-col gap-2 mt-3 w-full px-1">
                <div className="flex bg-foreground/5 rounded-lg p-0.5 w-full">
                  <button 
                    onClick={() => {
                      if (dataSource === 'local') {
                        useAppStore.getState().setDataSource('demo');
                        toast.success("Cambiado a modo DEMO");
                      }
                    }}
                    className={\`flex-1 px-2 py-1.5 rounded-md transition-all duration-300 flex items-center justify-center \${
                      dataSource === 'demo' 
                        ? 'bg-warning/20 text-warning shadow-sm border border-warning/30 ring-1 ring-warning/50' 
                        : 'hover:bg-foreground/10 text-muted-foreground hover:text-foreground'
                    }\`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1"><Cloud className="w-3 h-3" /> DEMO</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (dataSource === 'demo') {
                        useAppStore.getState().setDataSource('local');
                        toast.success("Cambiado a modo REAL");
                      } else {
                        handleSave();
                      }
                    }}
                    className={\`flex-1 px-2 py-1.5 rounded-md transition-all duration-300 flex items-center justify-center \${
                      dataSource === 'local' 
                        ? 'bg-success/20 text-success shadow-sm border border-success/30 ring-1 ring-success/50' 
                        : 'hover:bg-foreground/10 text-muted-foreground hover:text-foreground'
                    }\`}
                    title={dataSource === 'demo' ? "Cambiar a tus datos reales" : "Guardar cambios local/nube"}
                  >
                    <span className="text-xs font-bold flex items-center gap-1">
                      {dataSource === 'local' && isSaving ? <Hourglass className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} 
                      Reales
                    </span>
                  </button>
                </div>
                
                {dataSource === 'local' && !workspaceHandle ? (
                  <button
                    onClick={() => router.push('/archivos')}
                    className="w-full bg-foreground/5 border border-success text-success rounded-lg px-2 py-1.5 text-[0.8rem] font-semibold text-left hover:bg-success/10 transition-colors"
                  >
                    Seleccionar Archivos
                  </button>
                ) : (
                  <div className="relative w-full">
                    <select 
                      className="w-full bg-foreground/5 border rounded-lg pl-2 pr-6 py-1.5 text-[0.7rem] font-semibold focus:outline-none cursor-pointer appearance-none text-left transition-colors truncate"
                      style={{ 
                        color: dataSource === 'demo' ? 'var(--warning)' : 'var(--success)',
                        borderColor: dataSource === 'demo' ? 'var(--warning)' : 'var(--success)'
                      }}
                      value={dataSource === 'demo' ? (activeCursoId?.endsWith('1A') ? '1a' : activeCursoId?.endsWith('1B') ? '1b' : activeCursoId?.endsWith('1C') ? '1c' : '1a') : activeLocalGroup}
                      onChange={async (e) => {
                        if (dataSource === 'demo') {
                          fileManager.loadDemoData(e.target.value);
                          toast.success(\`Cambiado a Grupo \${e.target.value.toUpperCase()}\`);
                        } else {
                          if (e.target.value === 'goto_archivos') {
                            router.push('/archivos');
                          } else if (workspaceHandle && e.target.value) {
                            setActiveLocalGroup(e.target.value);
                            const ok = await fileManager.loadGroupFromWorkspace(workspaceHandle, e.target.value);
                            if (ok) {
                              toast.success("Grupo cargado correctamente");
                            } else {
                              toast.error("Error al cargar el grupo");
                            }
                          }
                        }
                      }}
                    >
                      {dataSource === 'demo' ? (
                        <>
                          <option value="" disabled>Seleccionar...</option>
                          <option value="1a">{getGroupDisplayName("G - 1A-GM - 0237 - 2025-26")}</option>
                          <option value="1b">{getGroupDisplayName("G - 1B-GM - 0237 - 2025-26")}</option>
                          <option value="1c">{getGroupDisplayName("G - 1C-GM - 0237 - 2025-26")}</option>
                        </>
                      ) : (
                        <>
                          <option value="goto_archivos">📁 Archivos...</option>
                          {localGroups.length === 0 && <option value="" disabled>No hay grupos</option>}
                          {localGroups.length > 0 && <option value="" disabled>Seleccionar Local...</option>}
                          {localGroups.map(g => (
                            <option key={g} value={g}>{getGroupDisplayName(g)}</option>
                          ))}
                        </>
                      )}
                    </select>
                    <div 
                      className="absolute inset-y-0 right-0 flex items-center pr-1.5 pointer-events-none" 
                      style={{ color: dataSource === 'demo' ? 'var(--warning)' : 'var(--success)' }}
                    >
                      <ChevronDown className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </div>
            )}
`;

// Replace "EN OBRAS" with JSX block
sidebar = sidebar.replace(/<div className="mt-2 w-max bg-yellow-400.*?<\/div>/s, jsxBlock);

fs.writeFileSync(sidebarPath, sidebar, 'utf8');
console.log('Sidebar.tsx updated!');
