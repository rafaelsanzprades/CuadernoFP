"use client";
import { AlertTriangle, BookOpen, CheckCircle, Cloud, Database, Download, FileJson, FolderOpen, Save, Shield, ShieldAlert, Sparkles, Upload, Users, Zap, Plus, Copy, HardDrive , Info } from "lucide-react";
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
import { OneDriveSyncPanel } from "@/components/features/cloud/OneDriveSyncPanel";

export default function ArchivosTrabajoPage() {
  const {
    activeModuleId, activeCursoId, moduleData, cursoData, dataSource, setDataSource,
    pdFileSource, cursoFileSource,
  } = useAppStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("datos");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardType, setWizardType] = useState<'programacion' | 'curso'>('programacion');

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
    toast.success("Cambiado a Datos Reales en local. Puedes crear o abrir archivos.");
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
          toast.error("El archivo no tiene un formato válido de Programación (.cddp).");
        }
      } else {
        const success = await fileManager.importCurso(content, file.name);
        if (success) {
          useAppStore.getState().setCursoFileSource({ type: 'local', fileName: file.name });
          toast.success(<>Curso cargado desde arrastrar <span className="inline-flex"><FolderOpen className="w-[1.2em] h-[1.2em] ml-1" /></span></>);
        } else {
          toast.error("El archivo no tiene un formato válido de Curso (.cddc).");
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
    if (pdKey === "imported-pd") return "Programación Importada";
    
    if (useAppStore.getState().activeModuleId === pdKey && moduleData?.info_modulo) {
      const { codigo, nombre, titulo_codigo, ciclo } = moduleData.info_modulo;
      const actualCode = codigo || pdKey.split('-')[0];
      
      let degreeCode = actualCode;
      if (titulo_codigo) {
        degreeCode = titulo_codigo;
      } else if (ciclo) {
        const lowerCiclo = ciclo.toLowerCase();
        const firstWord = ciclo.split(' ')[0];
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
    if (cursoKey === "imported-curso") return "Curso Importado";
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
    { id: "datos", label: <span className="flex items-center gap-2"><Database className="w-4 h-4 shrink-0" /> Gestor de archivos</span> },
    { id: "nube", label: <span className="flex items-center gap-2"><Cloud className="w-4 h-4 shrink-0" /> Sincronización en la Nube</span> }
  ];

  const breadcrumbSuffixMap: Record<string, string> = {
    "datos": "Gestor de archivos",
    "nube": "Sincronización en la Nube"
  };

  // ── Render ──────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen min-w-0">
        <Header breadcrumbSuffix={breadcrumbSuffixMap[activeTab] ?? "Gestor de archivos"} />

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="w-full space-y-8 pb-12">


            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                  <FolderOpen className="w-6 h-6 text-accent" /> Archivos
                </h1>
                <p className="text-muted mt-2 text-lg">Gestión de archivos de Programación y Curso.</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-2 max-w-full overflow-x-auto flex flex-nowrap scrollbar-hide border-b border-[var(--glass-border)] rounded-none bg-transparent">
                {TABS.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id} className="whitespace-nowrap shrink-0">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
      <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6 mt-6">
        <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Herramienta operativa y de gestión — Archivos</p>
          <p className="text-sm text-muted mt-1">Sincronización en la nube y configuración del espacio de trabajo.</p>
        </div>
      </div>

            <div className="space-y-8 animate-in fade-in duration-300 pt-4">
              {/* TAB: FILE MANAGER */}
              {activeTab === "datos" && (
                <div className="flex flex-col gap-6">

                  {/* ── Panel Programación ── */}
                  <Card
                    className={`p-8 border rounded-2xl shadow-lg space-y-8 flex flex-col relative overflow-hidden group ${isDemoLoaded ? 'bg-foreground/5 border-warning/20' : 'bg-foreground/5 border-info/20'}`}
                    onDrop={(e) => handleDrop(e, 'pd')}
                    onDragOver={handleDragOver}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <BookOpen className={`w-24 h-24 ${isDemoLoaded ? 'text-warning' : 'text-info'}`} />
                    </div>
                    <div>
                      {!isDemoLoaded && <h2 className="text-sm font-extrabold uppercase tracking-widest text-info/80 mb-2">Paso 1</h2>}
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-2 relative z-10">
                          <BookOpen className={`w-5 h-5 ${isDemoLoaded ? 'text-warning' : 'text-info'}`} /> Programación (.cddp)
                        </h3>
                        {hasPdFile && <Badge variant={isDemoLoaded ? 'warning' : 'info'}>Cargada</Badge>}
                      </div>
                      <p className="text-sm text-muted mt-2 relative z-10 leading-relaxed">
                        Contiene tu currículo, unidades didácticas, instrumentos de evaluación y criterios.
                      </p>
                    </div>

                    {/* Status */}
                    {hasPdFile ? (
                      <div className={`${isDemoLoaded ? 'bg-warning/10 border-warning/30' : 'bg-info/10 border-info/30'} border rounded-xl p-4 flex flex-col gap-2 relative z-10`}>
                        <span className={`text-xs font-bold ${isDemoLoaded ? 'text-warning' : 'text-info'} uppercase tracking-wider`}>Activa actualmente:</span>
                        <span className="text-lg font-medium text-foreground">{getFriendlyPdName(activeModuleId)}</span>
                        {getFileSourceLabel(pdFileSource) && (
                          <span className="text-xs text-muted flex items-center gap-1 mt-1">
                            <HardDrive className="w-3 h-3" /> {getFileSourceLabel(pdFileSource)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="bg-info/5 border border-dashed border-info/30 rounded-xl p-6 flex flex-col gap-2 items-center justify-center text-info/80 relative z-10 shadow-inner">
                        <FolderOpen className="w-8 h-8 mb-1 opacity-40" />
                        <span className="font-medium">Arrastra un archivo .cddp aquí</span>
                        <span className="text-xs text-muted">o usa los botones de abajo</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-2 mt-auto relative z-10">
                      {isDemoLoaded ? (
                        <Button onClick={handleLoadDemo} className="w-full bg-warning/20 hover:bg-warning/30 text-warning border border-warning/30">
                          <Zap className="w-4 h-4 mr-2" /> Recargar Datos DEMO
                        </Button>
                      ) : (
                        <>
                          {/* Primary actions */}
                          <div className="flex gap-2">
                            <Button onClick={handleNewPd} className="flex-1 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 transition-all">
                              <Plus className="w-4 h-4 mr-2" /> Nuevo
                            </Button>
                            <Button onClick={handleOpenPd} className="flex-1 bg-info/10 hover:bg-info/20 text-info border border-info/30 transition-all">
                              <FolderOpen className="w-4 h-4 mr-2" /> Abrir
                            </Button>
                          </div>
                          {/* Secondary actions */}
                          {hasPdFile && (
                            <div className="flex gap-2">
                              <Button onClick={handleSavePd} className="flex-1 bg-success/10 hover:bg-success/20 text-success border border-success/30 transition-all">
                                <Save className="w-4 h-4 mr-2" /> Guardar
                              </Button>
                              <Button onClick={handleSaveAsPd} className="flex-1 bg-foreground/5 hover:bg-foreground/10 text-muted border border-[var(--glass-border)] transition-all">
                                <Copy className="w-4 h-4 mr-2" /> Guardar como
                              </Button>
                              <Button onClick={handleDownloadPd} className="bg-foreground/5 hover:bg-foreground/10 text-muted border border-[var(--glass-border)] transition-all px-3">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          {/* Fallback input for browsers without File System Access API */}
                          <input type="file" ref={pdInputRef} onChange={handleImportPd} accept=".cddp,.json" className="hidden" />
                        </>
                      )}
                    </div>
                  </Card>

                  {/* ── Panel Curso ── */}
                  <Card
                    className={`p-8 border rounded-2xl shadow-lg space-y-8 flex flex-col relative overflow-hidden group ${isDemoLoaded ? 'bg-foreground/5 border-warning/20' : 'bg-foreground/5 border-success/20'}`}
                    onDrop={(e) => handleDrop(e, 'curso')}
                    onDragOver={handleDragOver}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Users className={`w-24 h-24 ${isDemoLoaded ? 'text-warning' : 'text-success'}`} />
                    </div>
                    <div>
                      {!isDemoLoaded && <h2 className={`text-sm font-extrabold uppercase tracking-widest mb-2 ${hasPdFile ? 'text-success/80' : 'text-muted'}`}>Paso 2</h2>}
                      <div className="flex justify-between items-center mb-2">
                        <h3 className={`text-xl font-bold flex items-center gap-2 relative z-10 ${(!isDemoLoaded && !hasPdFile) ? 'text-muted' : 'text-foreground'}`}>
                          <Users className={`w-5 h-5 ${isDemoLoaded ? 'text-warning' : (!isDemoLoaded && !hasPdFile) ? 'text-muted' : 'text-success'}`} /> Curso (.cddc)
                        </h3>
                        {hasCursoFile && <Badge variant={isDemoLoaded ? 'warning' : 'success'}>Cargado</Badge>}
                      </div>
                      <p className="text-sm text-muted mt-2 relative z-10 leading-relaxed">
                        Contiene tu lista de alumnado, calificaciones, anotaciones diarias, etc.
                      </p>
                    </div>

                    {/* Status */}
                    {hasCursoFile ? (
                      <div className={`${isDemoLoaded ? 'bg-warning/10 border-warning/30' : 'bg-success/10 border-success/30'} border rounded-xl p-4 flex flex-col gap-2 relative z-10`}>
                        <span className={`text-xs font-bold ${isDemoLoaded ? 'text-warning' : 'text-success'} uppercase tracking-wider`}>Activo actualmente:</span>
                        <span className="text-lg font-medium text-foreground">{getFriendlyCursoName(activeCursoId)}</span>
                        {getFileSourceLabel(cursoFileSource) && (
                          <span className="text-xs text-muted flex items-center gap-1 mt-1">
                            <HardDrive className="w-3 h-3" /> {getFileSourceLabel(cursoFileSource)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className={`border border-dashed rounded-xl p-6 flex flex-col gap-2 items-center justify-center relative z-10 shadow-inner ${(!isDemoLoaded && !hasPdFile) ? 'bg-foreground/5 border-[var(--glass-border)] text-muted' : 'bg-success/5 border-success/30 text-success/80'}`}>
                        <FolderOpen className={`w-8 h-8 mb-1 ${(!isDemoLoaded && !hasPdFile) ? 'opacity-20' : 'opacity-40'}`} />
                        {!isDemoLoaded && !hasPdFile ? (
                          <span className="font-medium text-center">Para crear o vincular un Curso,<br/>primero debes cargar una Programación (Paso 1).</span>
                        ) : (
                          <>
                            <span className="font-medium">Arrastra un archivo .cddc aquí</span>
                            <span className="text-xs text-muted">o usa los botones de abajo</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-2 mt-auto relative z-10">
                      {isDemoLoaded ? (
                        <Button onClick={handleLoadDemo} className="w-full bg-warning/20 hover:bg-warning/30 text-warning border border-warning/30">
                          <Zap className="w-4 h-4 mr-2" /> Recargar Datos DEMO
                        </Button>
                      ) : (
                        <>
                          {/* Primary actions */}
                          <div className="flex gap-2">
                            <Button disabled={!hasPdFile} onClick={handleNewCurso} className="flex-1 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 transition-all disabled:opacity-30">
                              <Plus className="w-4 h-4 mr-2" /> Nuevo
                            </Button>
                            <Button disabled={!hasPdFile} onClick={handleOpenCurso} className="flex-1 bg-success/10 hover:bg-success/20 text-success border border-success/30 transition-all disabled:opacity-30">
                              <FolderOpen className="w-4 h-4 mr-2" /> Abrir
                            </Button>
                          </div>
                          {/* Secondary actions */}
                          {hasCursoFile && (
                            <div className="flex gap-2">
                              <Button onClick={handleSaveCurso} className="flex-1 bg-success/10 hover:bg-success/20 text-success border border-success/30 transition-all">
                                <Save className="w-4 h-4 mr-2" /> Guardar
                              </Button>
                              <Button onClick={handleSaveAsCurso} className="flex-1 bg-foreground/5 hover:bg-foreground/10 text-muted border border-[var(--glass-border)] transition-all">
                                <Copy className="w-4 h-4 mr-2" /> Guardar como
                              </Button>
                              <Button onClick={handleDownloadCurso} className="bg-foreground/5 hover:bg-foreground/10 text-muted border border-[var(--glass-border)] transition-all px-3">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          {/* Fallback input */}
                          <input type="file" ref={cursoInputRef} onChange={handleImportCurso} accept=".cddc,.json" className="hidden" />
                        </>
                      )}
                    </div>
                  </Card>

                </div>
              )}

              {/* TAB: NUBE (GOOGLE DRIVE & ONEDRIVE) */}
              {activeTab === "nube" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Columna Google Drive */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
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

            {/* Security notice — always visible, full-width */}
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
    </div>
  );
}

function handleLoadDemo() {
  fileManager.loadDemoData();
  toast.success("Datos de demostración cargados correctamente.");
}
