"use client";
import { TabSync } from "@/components/ui/TabSync";
import { AlertTriangle, BookOpen, CheckCircle, Cloud, Database, Download, FileJson, FolderOpen, Save, Shield, ShieldAlert, Sparkles, Upload, Users, Zap, Plus, Copy, HardDrive, Info } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fileManager } from "@/services/fileManager";
import toast from "react-hot-toast";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { GoogleDriveSyncPanel } from "@/components/features/cloud/GoogleDriveSyncPanel";
import { NewFileWizard } from "@/components/features/cloud/NewFileWizard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { initialGroups } from "@/store/initialData";
import { useTranslation } from "react-i18next";
import { OneDriveSyncPanel } from "@/components/features/cloud/OneDriveSyncPanel";

export default function ArchivosTrabajoPage() {
  const {
    activeModuleId, activeCursoId, moduleData, cursoData, dataSource, setDataSource,
    pdFileSource, cursoFileSource, workspaceHandle
  } = useAppStore();
  const router = useRouter();
  const { t } = useTranslation();

  const [workspaceFiles, setWorkspaceFiles] = useState<{ grupos: string[], programaciones: string[], cursos: string[] }>({ grupos: [], programaciones: [], cursos: [] });

  useEffect(() => {
    if (workspaceHandle) {
      fileManager.scanWorkspaceFiles(workspaceHandle).then(setWorkspaceFiles);
    } else {
      setWorkspaceFiles({ grupos: [], programaciones: [], cursos: [] });
    }
  }, [workspaceHandle]);const [activeTab, setActiveTab] = useState("datos");const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardType, setWizardType] = useState<'programacion' | 'curso'>('programacion');

  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [brokenLinks, setBrokenLinks] = useState<{ groupName: string; missingFile: string; type: 'programacion' | 'curso' }[]>([]);
  const [fixingLink, setFixingLink] = useState<{ groupName: string; missingFile: string; type: 'programacion' | 'curso' } | null>(null);

  const pdInputRef = useRef<HTMLInputElement>(null);
  const cursoInputRef = useRef<HTMLInputElement>(null);

  const isDemoLoaded = dataSource === 'demo';
  const hasPdFile = !!moduleData;
  const hasCursoFile = !!cursoData;

  // Auto-load demo data on first visit
  useEffect(() => {
    if (dataSource === 'demo' && (!moduleData || !cursoData)) {
      fileManager.loadDemoData();
    }
  }, [dataSource, moduleData, cursoData]);

  // ── Mode switching ──────────────────────────────────────

  const switchToDemo = () => {
    setDataSource("demo");
    fileManager.loadDemoData();
    toast.success("Cambiado a Datos DEMO.");
  };

  const switchToLocal = () => {
    if (dataSource === 'demo') {
      useAppStore.getState().setModuleData(null);
      useAppStore.getState().setCursoData(null);
      useAppStore.getState().setActiveModuleId("");
      useAppStore.getState().setActiveCursoId("");
      useAppStore.getState().setPdFileSource({ type: 'none' });
      useAppStore.getState().setCursoFileSource({ type: 'none' });
    }
    setDataSource("local");
    toast.success("Cambiado a Datos reales en local. Puedes crear o abrir archivos.");
  };

  // ── NEW ─────────────────────────────────────────────────

  const handleNewPd = () => {
    router.push("/catalogo?tab=cursos");
  };

  const handleNewCurso = () => {
    setWizardType('curso');
    setWizardOpen(true);
  };

  // ── OPEN (with File System Access API) ──────────────────

  const handleOpenPd = async () => {
    if (dataSource === 'demo') setDataSource('local');
    const ok = await fileManager.openProgramacionWithHandle();
    if (ok) {
      toast.success(<>Programación abierta correctamente <span className="inline-flex"><FolderOpen className="w-[1.2em] h-[1.2em] ml-1" /></span></>);
    }
  };

  const handleOpenCurso = async () => {
    if (dataSource === 'demo') setDataSource('local');
    const ok = await fileManager.openCursoWithHandle();
    if (ok) {
      toast.success(<>Curso abierto correctamente <span className="inline-flex"><FolderOpen className="w-[1.2em] h-[1.2em] ml-1" /></span></>);
    }
  };

  // ── OPEN (fallback input for browsers without File System Access API) ──

  const triggerImportPd = () => pdInputRef.current?.click();
  const triggerImportCurso = () => cursoInputRef.current?.click();

  const handleImportPd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await fileManager.importProgramacion(content, file.name);
      if (success) {
        if (dataSource === 'demo') setDataSource('local');
        useAppStore.getState().setPdFileSource({ type: 'local', fileName: file.name });
        toast.success(<>Programación importada correctamente <span className="inline-flex"><FolderOpen className="w-[1.2em] h-[1.2em] ml-1" /></span></>);
      } else {
        toast.error("Error al importar: el archivo no tiene un formato válido de Programación.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImportCurso = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await fileManager.importCurso(content, file.name);
      if (success) {
        if (dataSource === 'demo') setDataSource('local');
        useAppStore.getState().setCursoFileSource({ type: 'local', fileName: file.name });
        toast.success(<>Curso importado correctamente <span className="inline-flex"><FolderOpen className="w-[1.2em] h-[1.2em] ml-1" /></span></>);
      } else {
        toast.error("Error al importar: el archivo no tiene un formato válido de Curso.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ── SAVE ────────────────────────────────────────────────

  const handleSavePd = async () => {
    if (!moduleData) {
      toast.error("No hay ninguna Programación cargada para guardar.");
      return;
    }
    const ok = await fileManager.saveProgramacion();
    if (ok) toast.success("Programación guardada correctamente.");
    else toast.error("Error al guardar la programación.");
  };

  const handleSaveCurso = async () => {
    if (!cursoData) {
      toast.error("No hay ningún Curso cargado para guardar.");
      return;
    }
    const ok = await fileManager.saveCurso();
    if (ok) toast.success("Curso guardado correctamente.");
    else toast.error("Error al guardar el curso.");
  };

  // ── SAVE AS ─────────────────────────────────────────────

  const handleSaveAsPd = async () => {
    if (!moduleData) {
      toast.error("No hay ninguna Programación cargada.");
      return;
    }
    const ok = await fileManager.saveAsProgramacion();
    if (ok) toast.success("Programación guardada como nuevo archivo.");
  };

  const handleSaveAsCurso = async () => {
    if (!cursoData) {
      toast.error("No hay ningún Curso cargado.");
      return;
    }
    const ok = await fileManager.saveAsCurso();
    if (ok) toast.success("Curso guardado como nuevo archivo.");
  };

  // ── DOWNLOAD COPY ───────────────────────────────────────

  const handleDownloadPd = () => {
    if (!moduleData) {
      toast.error("No hay ninguna Programación cargada.");
      return;
    }
    fileManager.downloadProgramacion();
    toast.success("Copia de programación descargada.");
  };

  const handleDownloadCurso = () => {
    if (!cursoData) {
      toast.error("No hay ningún Curso cargado.");
      return;
    }
    fileManager.downloadCurso();
    toast.success("Copia de curso descargada.");
  };

  // ── Drag & Drop ─────────────────────────────────────────

  const handleDrop = useCallback(async (e: React.DragEvent, type: 'pd' | 'curso') => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (dataSource === 'demo') setDataSource('local');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (type === 'pd') {
        const success = await fileManager.importProgramacion(content, file.name);
        if (success) {
          useAppStore.getState().setPdFileSource({ type: 'local', fileName: file.name });
          toast.success(<>Programación cargada desde arrastrar <span className="inline-flex"><FolderOpen className="w-[1.2em] h-[1.2em] ml-1" /></span></>);
        } else {
          toast.error("El archivo no tiene un formato válido de Programación (.fpp).");
        }
      } else {
        const success = await fileManager.importCurso(content, file.name);
        if (success) {
          useAppStore.getState().setCursoFileSource({ type: 'local', fileName: file.name });
          toast.success(<>Curso cargado desde arrastrar <span className="inline-flex"><FolderOpen className="w-[1.2em] h-[1.2em] ml-1" /></span></>);
        } else {
          toast.error("El archivo no tiene un formato válido de Curso (.fpc).");
        }
      }
    };
    reader.readAsText(file);
  }, [dataSource, setDataSource]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // ── Helpers ─────────────────────────────────────────────

  const getFileSourceLabel = (source: typeof pdFileSource) => {
    if (source.type === 'none') return null;
    if (source.type === 'new') return "Nuevo (sin guardar)";
    if (source.type === 'local') return source.fileName || "Archivo local";
    if (source.type === 'drive') return source.fileName || "Google Drive";
    return null;
  };

  const getFriendlyPdName = (pdKey: string) => {
    if (pdKey === "imported-pd") return "Programación importada";

    if (useAppStore.getState().activeModuleId === pdKey && moduleData?.info_modulo) {
      const { codigo, nombre, titulo_codigo, titulo_fp } = moduleData.info_modulo;
      const actualCode = codigo || pdKey.split('-')[0];

      let degreeCode = actualCode;
      if (titulo_codigo) {
        degreeCode = titulo_codigo;
      } else if (titulo_fp) {
        const lowerCiclo = titulo_fp.toLowerCase();
        const firstWord = titulo_fp.split(' ')[0];
        if (/^[A-Z]{2,4}\d{2,3}$/i.test(firstWord) || /^[A-Z]+-\d+$/i.test(firstWord)) {
          degreeCode = firstWord;
        } else if (lowerCiclo.includes("superior")) {
          degreeCode = "GS";
        } else if (lowerCiclo.includes("básico") || lowerCiclo.includes("basico") || lowerCiclo.includes("profesional")) {
          degreeCode = "GB";
        } else if (lowerCiclo.includes("técnico") || lowerCiclo.includes("tecnico")) {
          degreeCode = "GM";
        } else {
          degreeCode = firstWord;
        }
      }

      return `P - ${degreeCode} - ${actualCode} - ${nombre || 'Programación'}`;
    }

    const code = pdKey.split('-')[0];
    let foundGroup: any = null;
    let foundModule: any = null;
    for (const group of initialGroups) {
      const m = group.modules.find(mod => mod.code === code);
      if (m) { foundGroup = group; foundModule = m; break; }
    }
    if (foundGroup && foundModule) {
      const degreeCode = foundGroup.degreeName.split(' ')[0];
      return `P - ${degreeCode} - ${code} - ${foundModule.name}`;
    }
    return `P - ${pdKey.replace('-pd', '').toUpperCase()}`;
  };

  const getFriendlyCursoName = (cursoKey: string) => {
    if (cursoKey === "imported-curso") return "Curso importado";
    const parts = cursoKey.split('-');
    const code = parts[0];
    const rawYear = parts[parts.length - 1];

    // Normalize year
    let year = rawYear;
    if (year === '26' || year === '202526') year = '2025-26';

    let foundGroup: any = null;
    for (const group of initialGroups) {
      if (group.modules.some(m => m.code === code)) { foundGroup = group; break; }
    }

    if (foundGroup) {
      const yearPrefix = foundGroup.name.charAt(0);
      const levelAbr = foundGroup.level === 'Grado Medio' ? 'GM' : foundGroup.level === 'Grado Superior' ? 'GS' : 'GB';
      const degreeCode = foundGroup.degreeName.split(' ')[0].replace(/([A-Z]+)(\d+)/, '$1-$2');
      return `C - ${year} - ${yearPrefix}-${levelAbr} - ${degreeCode}`;
    } else {
      let nameParts = parts.slice(0, -1);
      // If the second to last part is '2025' or '2026', remove it from name
      if (nameParts.length > 0 && (nameParts[nameParts.length - 1] === '2025' || nameParts[nameParts.length - 1] === '2026')) {
        nameParts = nameParts.slice(0, -1);
      }
      const namePart = nameParts.join(' ').toUpperCase();
      return `C - ${year} - ${namePart}`;
    }
  };

  // ── Tabs ────────────────────────────────────────────────

  const TABS = [
    { id: "datos", label: <span className="flex items-center gap-2"><Database className="w-4 h-4 shrink-0" /> Archivos locales</span>, cleanLabel: "Archivos locales" },
    { id: "nube", label: <span className="flex items-center gap-2"><Cloud className="w-4 h-4 shrink-0" /> Nube</span>, cleanLabel: "Nube" }
  ];

  const breadcrumbSuffixMap: Record<string, string> = {
    "datos": "Gestor de archivos",
    "nube": "Sincronización en la Nube"
  };

  // ── Render ──────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen min-w-0">
        <Header breadcrumbSuffix={breadcrumbSuffixMap[activeTab] ?? "Gestor de archivos"} />

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="w-full space-y-4 pb-12">


            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <FolderOpen className="w-8 h-8 text-accent" /> {t('pages.archivos_title')}
              </h1>
              <p className="text-muted mt-2 text-lg">{t('pages.archivos_desc')}</p>
            </div>
            </div>

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-2 border-b border-[var(--glass-border)]">
                <TabsList className="max-w-full overflow-x-auto flex flex-nowrap scrollbar-hide rounded-none bg-transparent h-auto p-0">
                  {TABS.map(tab => (
                    <TabsTrigger key={tab.id} value={tab.id} className="whitespace-nowrap shrink-0 py-2">
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {activeTab === "datos" && workspaceHandle && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="border border-warning/50 text-warning hover:bg-warning/10"
                    onClick={async () => {
                      const res = await fileManager.validateWorkspaceLinks(workspaceHandle);
                      setBrokenLinks(res.brokenGroups);
                      setValidationModalOpen(true);
                    }}
                  >
                    <ShieldAlert className="w-4 h-4 mr-2" /> Validar workspace
                  </Button>
                )}
              </div>
            </Tabs>
            <div className="space-y-4 animate-in fade-in duration-300 pt-4">
              {(() => {
                const infoMap: Record<string, {desc: string}> = {
                  'datos': { desc: 'Gestión de los archivos de estructura y programación didáctica del docente.' },
                  'nube': { desc: 'Sincronización bidireccional segura con Google Drive y Microsoft OneDrive.' }
                };
                const info = infoMap[activeTab] || { desc: 'Gestión de archivos.' };
                return (
                  <div className='flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6'>
                    <Info className='w-5 h-5 text-accent mt-0.5 shrink-0' />
                    <div>
                      <p className="text-sm text-muted">{info.desc}</p>
                    </div>
                  </div>
                );
              })()}
              {/* TAB: FILE MANAGER */}
              {activeTab === "datos" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* ── Columna GRUPO ── */}
                  <Card className={`p-6 border rounded-2xl shadow-lg flex flex-col relative overflow-hidden group ${isDemoLoaded ? 'bg-foreground/5 border-warning/20' : 'bg-foreground/5 border-[var(--glass-border)]'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                      <FolderOpen className={`w-24 h-24 ${isDemoLoaded ? 'text-warning' : 'text-accent'}`} />
                    </div>
                    <div className="relative z-10 flex flex-col h-full flex-1">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                          <FolderOpen className={`w-5 h-5 ${isDemoLoaded ? 'text-warning' : 'text-accent'}`} /> Grupos
                        </h3>
                        <p className="text-sm text-muted mt-2 leading-relaxed">
                          Abre un Grupo para cargar automáticamente su Programación y su Curso asociado.
                        </p>
                      </div>

                      <div className="flex-1 flex flex-col gap-2 min-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {!workspaceHandle ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-4">
                            <Database className="w-8 h-8 text-muted/50 mb-2" />
                            <p className="text-sm text-muted font-medium">Usa el botón inferior para enlazar tu carpeta de trabajo.</p>
                          </div>
                        ) : workspaceFiles.grupos.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-center p-4">
                            <p className="text-sm text-muted">No se han encontrado grupos.</p>
                          </div>
                        ) : (
                          workspaceFiles.grupos.map(g => (
                            <button
                              key={g}
                              onDoubleClick={async () => {
                                const ok = await fileManager.loadGroupFromWorkspace(workspaceHandle, g);
                                if (ok) toast.success(`Grupo ${g} abierto correctamente`);
                                else toast.error("Error al abrir el grupo");
                              }}
                              className="w-full text-left p-3 rounded-lg border border-[var(--glass-border)] bg-foreground/[0.02] hover:bg-foreground/5 transition-colors group/item"
                            >
                              <div className="flex items-center gap-2">
                                <FolderOpen className="w-4 h-4 text-accent/70 group-hover/item:text-accent transition-colors shrink-0" />
                                <span className="text-sm font-medium truncate" title={g}>{g.replace('.json', '')}</span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>

                      {/* Botonera Grupos */}
                      <div className="flex flex-col gap-2 pt-4 mt-auto border-t border-[var(--glass-border)]">
                        {isDemoLoaded ? (
                          <Button onClick={() => { setDataSource('local'); toast.success("Modo REALES activado."); }} className="w-full bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 text-xs h-9">
                            <HardDrive className="w-3 h-3 mr-1" /> Salir de DEMO
                          </Button>
                        ) : !workspaceHandle ? (
                          <Button onClick={async () => {
                            const handle = await fileManager.openWorkspaceDirectory();
                            if (handle) toast.success("Carpeta local conectada.");
                          }} className="w-full bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 transition-all text-xs h-9">
                            <FolderOpen className="w-3 h-3 mr-1" /> Conectar Carpeta Local
                          </Button>
                        ) : (
                          <Button onClick={async () => {
                            const handle = await fileManager.openWorkspaceDirectory();
                            if (handle) toast.success("Carpeta local cambiada.");
                          }} className="w-full bg-foreground/5 hover:bg-foreground/10 text-foreground border border-[var(--glass-border)] transition-all text-xs h-9">
                            <FolderOpen className="w-3 h-3 mr-1" /> Cambiar Carpeta Local
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* ── Columna PROGRAMACIÓN ── */}
                  <Card className={`p-6 border rounded-2xl shadow-lg flex flex-col relative overflow-hidden group ${isDemoLoaded ? 'bg-foreground/5 border-warning/20' : 'bg-foreground/5 border-info/20'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                      <BookOpen className={`w-24 h-24 ${isDemoLoaded ? 'text-warning' : 'text-info'}`} />
                    </div>
                    <div className="relative z-10 flex flex-col h-full flex-1">
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <BookOpen className={`w-5 h-5 ${isDemoLoaded ? 'text-warning' : 'text-info'}`} /> Programaciones
                          </h3>
                          {hasPdFile && <Badge variant={isDemoLoaded ? 'warning' : 'info'}>Activa</Badge>}
                        </div>
                        <p className="text-sm text-muted mt-2 leading-relaxed">
                          Plantillas curriculares. Doble clic para cargar una programación independiente.
                        </p>
                      </div>

                      <div className="flex-1 flex flex-col gap-2 min-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {workspaceHandle && workspaceFiles.programaciones.length > 0 ? (
                          workspaceFiles.programaciones.map(p => {
                            const isActive = pdFileSource.type === 'local' && pdFileSource.fileName === p;
                            return (
                              <button
                                key={p}
                                onDoubleClick={async () => {
                                  const ok = await fileManager.loadProgramacionFromWorkspace(workspaceHandle, p);
                                  if (ok) toast.success(`Programación abierta correctamente`);
                                  else toast.error("Error al abrir programación");
                                }}
                                className={`w-full text-left p-3 rounded-lg border transition-colors group/item ${isActive ? 'bg-info/10 border-info/40 shadow-sm' : 'border-[var(--glass-border)] bg-foreground/[0.02] hover:bg-foreground/5'}`}
                              >
                                <div className="flex items-center gap-2">
                                  <BookOpen className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-info' : 'text-info/70 group-hover/item:text-info'}`} />
                                  <span className={`text-sm font-medium truncate ${isActive ? 'text-info font-bold' : ''}`} title={p}>{p.replace('.json', '')}</span>
                                </div>
                              </button>
                            );
                          })
                        ) : workspaceHandle ? (
                          <div className="h-full flex items-center justify-center text-center p-4">
                            <p className="text-sm text-muted">No se han encontrado programaciones.</p>
                          </div>
                        ) : null}
                      </div>

                      {/* Botonera Programación */}
                      <div className="flex flex-col gap-2 pt-4 mt-auto border-t border-[var(--glass-border)]">
                        {isDemoLoaded ? (
                          <Button onClick={handleLoadDemo} className="w-full bg-warning/20 hover:bg-warning/30 text-warning border border-warning/30">
                            <Zap className="w-4 h-4 mr-2" /> Recargar DEMO
                          </Button>
                        ) : (
                          <>
                            <div className="flex gap-2">
                              <Button onClick={handleNewPd} className="flex-1 bg-info/10 hover:bg-info/20 text-info border border-info/30 transition-all text-xs h-9">
                                <Plus className="w-3 h-3 mr-1" /> Nueva (Catálogo)
                              </Button>
                              <Button onClick={handleOpenPd} className="flex-1 bg-foreground/5 hover:bg-foreground/10 text-foreground border border-[var(--glass-border)] transition-all text-xs h-9">
                                <FolderOpen className="w-3 h-3 mr-1" /> Importar
                              </Button>
                            </div>
                            {hasPdFile && (
                              <div className="flex gap-2">
                                <Button onClick={handleSavePd} className="flex-1 bg-info/10 hover:bg-info/20 text-info border border-info/30 transition-all text-xs h-9">
                                  <Save className="w-3 h-3 mr-1" /> Guardar
                                </Button>
                                <Button onClick={handleSaveAsPd} className="bg-foreground/5 hover:bg-foreground/10 text-muted border border-[var(--glass-border)] transition-all px-3 h-9" title="Guardar como...">
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* ── Columna CURSO ── */}
                  <Card className={`p-6 border rounded-2xl shadow-lg flex flex-col relative overflow-hidden group ${isDemoLoaded ? 'bg-foreground/5 border-warning/20' : 'bg-foreground/5 border-success/20'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                      <Users className={`w-24 h-24 ${isDemoLoaded ? 'text-warning' : 'text-success'}`} />
                    </div>
                    <div className="relative z-10 flex flex-col h-full flex-1">
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className={`text-lg font-bold flex items-center gap-2 ${(!isDemoLoaded && !hasPdFile) ? 'text-muted' : 'text-foreground'}`}>
                            <Users className={`w-5 h-5 ${isDemoLoaded ? 'text-warning' : (!isDemoLoaded && !hasPdFile) ? 'text-muted' : 'text-success'}`} /> Cursos
                          </h3>
                          {hasCursoFile && <Badge variant={isDemoLoaded ? 'warning' : 'success'}>Activo</Badge>}
                        </div>
                        <p className="text-sm text-muted mt-2 leading-relaxed">
                          Cuadernos de clase e instancias temporales de una programación.
                        </p>
                      </div>

                      <div className="flex-1 flex flex-col gap-2 min-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {workspaceHandle && workspaceFiles.cursos.length > 0 ? (
                          workspaceFiles.cursos.map(c => {
                            const isActive = cursoFileSource.type === 'local' && cursoFileSource.fileName === c;
                            return (
    <button
                                key={c}
                                onDoubleClick={() => {
                                  toast.error("Para abrir un curso de forma segura, haz doble clic en su Grupo asociado en la primera columna.");
                                }}
                                className={`w-full text-left p-3 rounded-lg border transition-colors group/item ${isActive ? 'bg-success/10 border-success/40 shadow-sm' : 'border-[var(--glass-border)] bg-foreground/[0.02] hover:bg-foreground/5 opacity-80 hover:opacity-100'}`}
                              >
                                <div className="flex items-center gap-2">
                                  <Users className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-success' : 'text-success/70 group-hover/item:text-success'}`} />
                                  <span className={`text-sm font-medium truncate ${isActive ? 'text-success font-bold' : ''}`} title={c}>{c.replace('.json', '')}</span>
                                </div>
                              </button>
                            );
                          })
                        ) : workspaceHandle ? (
                          <div className="h-full flex items-center justify-center text-center p-4">
                            <p className="text-sm text-muted">No se han encontrado cursos.</p>
                          </div>
                        ) : null}
                      </div>

                      {/* Botonera Curso */}
                      <div className="flex flex-col gap-2 pt-4 mt-auto border-t border-[var(--glass-border)]">
                        {isDemoLoaded ? (
                          <Button onClick={handleLoadDemo} className="w-full bg-warning/20 hover:bg-warning/30 text-warning border border-warning/30">
                            <Zap className="w-4 h-4 mr-2" /> Recargar DEMO
                          </Button>
                        ) : (
                          <>
                            <div className="flex gap-2">
                              <Button disabled={!hasPdFile} onClick={handleNewCurso} className="flex-1 bg-success/10 hover:bg-success/20 text-success border border-success/30 transition-all disabled:opacity-30 text-xs h-9" title="Crea un curso y su archivo grupo asociado">
                                <Plus className="w-3 h-3 mr-1" /> Iniciar Curso (+ Grupo)
                              </Button>
                              <Button disabled={!hasPdFile} onClick={handleOpenCurso} className="bg-foreground/5 hover:bg-foreground/10 text-foreground border border-[var(--glass-border)] transition-all px-3 h-9" title="Importar curso huérfano">
                                <FolderOpen className="w-3 h-3" />
                              </Button>
                            </div>
                            {hasCursoFile && (
                              <div className="flex gap-2">
                                <Button onClick={handleSaveCurso} className="flex-1 bg-success/10 hover:bg-success/20 text-success border border-success/30 transition-all text-xs h-9">
                                  <Save className="w-3 h-3 mr-1" /> Guardar
                                </Button>
                                <Button onClick={handleSaveAsCurso} className="bg-foreground/5 hover:bg-foreground/10 text-muted border border-[var(--glass-border)] transition-all px-3 h-9" title="Guardar como...">
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </Card>

                </div>
              )}

              {/* TAB: NUBE (GOOGLE DRIVE & ONEDRIVE) */}
              {activeTab === "nube" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Columna Google Drive */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-[#4285F4]" /> Google Drive
                    </h3>
                    <GoogleDriveSyncPanel />
                  </div>

                  {/* Columna OneDrive */}
                  <div className="space-y-4">
                    <OneDriveSyncPanel />
                  </div>
                </div>
              )}

            </div>

            {/* Security notice - always visible, full-width */}
            <div className="mt-8">
              <Card className="flex items-start gap-4 p-6 bg-info/5 border border-info/20 rounded-2xl shadow-lg">
                <span className="text-info mt-1 shrink-0"><ShieldAlert className="w-8 h-8" /></span>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Seguridad y RGPD garantizados</h3>
                  <div className="text-sm text-foreground/80 space-y-2 leading-relaxed">
                    <p>CuadernoFP procesa toda tu información confidencial exclusivamente en tu navegador. <strong>Tú eres el dueño de tus archivos</strong>.</p>
                    <p>Ningún dato de tu alumnado se envía a la nube, salvo que uses la Sincronización autorizada en tu cuenta.</p>
                    <p className="font-semibold text-info mt-2">Asegúrate de pulsar &quot;Guardar&quot; al finalizar tu sesión de trabajo para no perder los últimos cambios.</p>
                  </div>
                </div>
              </Card>
            </div>
          </MotionWrapper>
        </div>
      </div>

      {/* New File Wizard */}
      <NewFileWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        fileType={wizardType}
      />

      {/* VALIDATION MODAL */}
      {validationModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="validation-modal-title"
        >
          <Card className="w-full max-w-xl p-6 shadow-2xl border-[var(--glass-border)]">
            <h2 id="validation-modal-title" className="text-lg font-bold mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-warning" />
              Validación de Enlaces del Workspace
            </h2>

            {brokenLinks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                <p className="text-foreground font-medium">¡Todo correcto!</p>
                <p className="text-muted text-sm mt-2">No se han detectado enlaces rotos en los grupos de tu carpeta local.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted text-sm">Se han detectado los siguientes enlaces rotos en los archivos Grupo. Esto sucede cuando renombras o eliminas una Programación o un Curso en Windows directamente.</p>
                <ul className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {brokenLinks.map((link, idx) => (
                    <li key={idx} className="bg-foreground/5 p-3 rounded-lg border border-[var(--glass-border)] text-sm">
                      <p className="font-semibold">{link.groupName}</p>
                      <p className="text-danger flex items-center gap-2 mt-1">
                        <AlertTriangle className="w-4 h-4" /> {link.type === 'programacion' ? 'Programación' : 'Curso'} no encontrada: <span className="font-mono">{link.missingFile}</span>
                      </p>
                      {fixingLink === link ? (
                        <div className="mt-3 flex gap-2">
                          <select
                            className="flex-1 bg-background border border-[var(--glass-border)] rounded px-2 py-1"
                            onChange={async (e) => {
                              const newVal = e.target.value;
                              if (newVal && workspaceHandle) {
                                const ok = await fileManager.fixWorkspaceLink(workspaceHandle, link.groupName, link.type, newVal);
                                if (ok) {
                                  toast.success("Enlace reparado correctamente");
                                  setBrokenLinks(prev => prev.filter(l => l !== link));
                                  setFixingLink(null);
                                  fileManager.scanWorkspaceFiles(workspaceHandle).then(setWorkspaceFiles);
                                } else {
                                  toast.error("Error al reparar enlace");
                                }
                              }
                            }}
                          >
                            <option value="">Seleccionar archivo correcto...</option>
                            {(link.type === 'programacion' ? workspaceFiles.programaciones : workspaceFiles.cursos).map(f => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                          <Button size="sm" variant="ghost" onClick={() => setFixingLink(null)}>Cancelar</Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-2 border border-foreground/20"
                          onClick={() => setFixingLink(link)}
                        >
                          Reparar enlace
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setValidationModalOpen(false)}>Cerrar</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function handleLoadDemo() {
  fileManager.loadDemoData();
  toast.success("Datos de demostración cargados correctamente."    );
}


