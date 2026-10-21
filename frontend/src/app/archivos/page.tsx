"use client";
import { AlertTriangle, BookOpen, CheckCircle, Cloud, Copy, Database, FolderOpen, HardDrive, ListChecks, Plus, Save, ShieldAlert, Users, Zap, Share2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TabSync } from "@/components/ui/TabSync";
import { useCallback, useEffect, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { StickyPageHeader } from "@/components/ui/StickyPageHeader";
import { SectionIndex } from "@/components/ui/SectionIndex";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ImportarDeBiblioteca } from "@/components/features/inicio/ImportarDeBiblioteca";
import { AISettingsPanel } from "@/components/features/ai/AISettingsPanel";
import { WelcomeWizard } from "@/components/features/dashboard/WelcomeWizard";
import { GoogleDriveSyncPanel } from "@/components/features/cloud/GoogleDriveSyncPanel";
import { OneDriveSyncPanel } from "@/components/features/cloud/OneDriveSyncPanel";
import { NewFileWizard } from "@/components/features/cloud/NewFileWizard";
import { VerificacionTab } from "@/components/features/archivos/VerificacionTab";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { fileManager } from "@/services/fileManager";

// ── Página Principal ──────────────────────────────────────────────────────
export default function ArchivosPage() {
  const {
    moduleData, cursoData, globalData, activeModuleId, activeCursoId, dataSource, setDataSource,
    isWizardOpen, setWizardOpen,
    pdFileSource, cursoFileSource, groupFileSource, workspaceHandle,
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<string>("datos");
  const { t } = useTranslation();
  const router = useRouter();

  const [workspaceFiles, setWorkspaceFiles] = useState<{ grupos: string[], programaciones: string[], cursos: string[] }>({ grupos: [], programaciones: [], cursos: [] });
  const [demoFiles, setDemoFiles] = useState<{ name: string, ext: string, size: number }[]>([]);

  useEffect(() => {
    if (workspaceHandle) {
      fileManager.scanWorkspaceFiles(workspaceHandle).then(setWorkspaceFiles);
    } else {
      setWorkspaceFiles({ grupos: [], programaciones: [], cursos: [] });
    }
  }, [workspaceHandle]);

  useEffect(() => {
    fetch('/api/demo')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setDemoFiles(data.files || []);
        }
      })
      .catch(err => console.error("Error fetching demo files:", err));
  }, []);

  const [newFileWizardOpen, setNewFileWizardOpen] = useState(false);
  const [wizardType, setWizardType] = useState<'programacion' | 'curso'>('programacion');

  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [brokenLinks, setBrokenLinks] = useState<{ groupName: string; missingFile: string; type: 'programacion' | 'curso' }[]>([]);
  const [fixingLink, setFixingLink] = useState<{ groupName: string; missingFile: string; type: 'programacion' | 'curso' } | null>(null);

  const pdInputRef = useRef<HTMLInputElement>(null);
  const cursoInputRef = useRef<HTMLInputElement>(null);

  const isDemoLoaded = dataSource === 'demo';
  const hasPdFile = !!moduleData;
  const hasCursoFile = !!cursoData;

  const demoGroupFiles = demoFiles.filter(f => f.ext === 'fpg');
  const demoProgFiles = demoFiles.filter(f => f.ext === 'fpp');
  const demoCursoFiles = demoFiles.filter(f => f.ext === 'fpc');

  const loadDemoProgramacion = async (name: string) => {
    try {
      const text = await fetch(`/demo/${encodeURIComponent(name)}`).then(r => r.text());
      const ok = await fileManager.importProgramacion(text, name);
      if (ok) {
        useAppStore.getState().setPdFileSource({ type: 'none', fileName: name });
        toast.success(t('toasts.archivos.programacionCargada', {name, defaultValue: 'Programación {{name}} cargada.'}));
      } else {
        toast.error(t('toasts.archivos.errorCargarProgramacionDemo', {defaultValue: "Error al cargar la programación demo."}));
      }
    } catch {
      toast.error(t('toasts.archivos.errorCargarProgramacionDemo', {defaultValue: "Error al cargar la programación demo."}));
    }
  };

  const loadDemoCurso = async (name: string) => {
    try {
      const text = await fetch(`/demo/${encodeURIComponent(name)}`).then(r => r.text());
      const ok = await fileManager.importCurso(text, name);
      if (ok) {
        useAppStore.getState().setCursoFileSource({ type: 'none', fileName: name });
        toast.success(t('toasts.archivos.cursoCargado', {name, defaultValue: 'Curso {{name}} cargado.'}));
      } else {
        toast.error(t('toasts.archivos.errorCargarCursoDemo', {defaultValue: "Error al cargar el curso demo."}));
      }
    } catch {
      toast.error(t('toasts.archivos.errorCargarCursoDemo', {defaultValue: "Error al cargar el curso demo."}));
    }
  };

  // Auto-load demo data on first visit
  useEffect(() => {
    if (dataSource === 'demo' && (!moduleData || !cursoData)) {
      fileManager.loadDemoData(undefined, true);
    }
  }, [dataSource, moduleData, cursoData]);

  // ── Mode switching ──────────────────────────────────────

  const switchToDemo = () => {
    setDataSource("demo");
    fileManager.loadDemoData();
    toast.success(t('toasts.archivos.cambiadoDemo', {defaultValue: "Cambiado a datos demo."}));
  };

  const switchToLocal = () => {
    if (dataSource === 'demo') {
      useAppStore.getState().setModuleData(null);
      useAppStore.getState().setCursoData(null);
      useAppStore.getState().setActiveModuleId("");
      useAppStore.getState().setActiveCursoId("");
      useAppStore.getState().setPdFileSource({ type: 'none' });
      useAppStore.getState().setCursoFileSource({ type: 'none' });
      useAppStore.getState().setGroupFileSource({ type: 'none' });
    }
    setDataSource("local");
    toast.success(t('toasts.archivos.cambiadoReal', {defaultValue: "Cambiado a datos reales en local. Puedes crear o abrir archivos."}));
  };

  // ── NEW ─────────────────────────────────────────────────

  const handleNewPd = () => {
    router.push("/catalogo?tab=familias");
  };

  const handleNewCurso = () => {
    setWizardType('curso');
    setNewFileWizardOpen(true);
  };

  // ── OPEN (with File System Access API) ──────────────────

  const handleOpenPd = async () => {
    if (dataSource === 'demo') setDataSource('local');
    const ok = await fileManager.openProgramacionWithHandle();
    if (ok) {
      toast.success(<>{t('toasts.archivos.programacionAbiertaIcono', {defaultValue: "Programación abierta correctamente"})} <span className="inline-flex"><FolderOpen className="w-[1.2em] h-[1.2em] ml-1" /></span></>);
    }
  };

  const handleOpenCurso = async () => {
    if (dataSource === 'demo') setDataSource('local');
    const ok = await fileManager.openCursoWithHandle();
    if (ok) {
      toast.success(<>{t('toasts.archivos.cursoAbiertoIcono', {defaultValue: "Curso abierto correctamente"})} <span className="inline-flex"><FolderOpen className="w-[1.2em] h-[1.2em] ml-1" /></span></>);
    }
  };

  // ── SAVE ────────────────────────────────────────────────

  const handleSavePd = async () => {
    if (!moduleData) {
      toast.error(t('toasts.archivos.sinProgramacionGuardar', {defaultValue: "No hay ninguna programación cargada para guardar."}));
      return;
    }
    if (dataSource === 'demo') {
      toast(t('toasts.archivos.modoDemoGuardarComoNuevo', {defaultValue: "Estás en modo demo. Guardando como nuevo archivo..."}), { icon: 'ℹ️' });
      return handleSaveAsPd();
    }
    const ok = await fileManager.saveProgramacion();
    if (ok) toast.success(t('toasts.archivos.programacionGuardada', {defaultValue: "Programación guardada correctamente."}));
    else toast.error(t('toasts.archivos.errorGuardarProgramacion', {defaultValue: "Error al guardar la programación."}));
  };

  const handleSaveCurso = async () => {
    if (!cursoData) {
      toast.error(t('toasts.archivos.sinCursoGuardar', {defaultValue: "No hay ningún curso cargado para guardar."}));
      return;
    }
    if (dataSource === 'demo') {
      toast(t('toasts.archivos.modoDemoGuardarComoNuevo', {defaultValue: "Estás en modo demo. Guardando como nuevo archivo..."}), { icon: 'ℹ️' });
      return handleSaveAsCurso();
    }
    const ok = await fileManager.saveCurso();
    if (ok) toast.success(t('toasts.archivos.cursoGuardado', {defaultValue: "Curso guardado correctamente."}));
    else toast.error(t('toasts.archivos.errorGuardarCurso', {defaultValue: "Error al guardar el curso."}));
  };

  // ── SAVE AS ─────────────────────────────────────────────

  const handleSaveAsPd = async () => {
    if (!moduleData) {
      toast.error(t('toasts.archivos.sinProgramacion', {defaultValue: "No hay ninguna programación cargada."}));
      return;
    }
    const ok = await fileManager.saveAsProgramacion();
    if (ok) toast.success(t('toasts.archivos.programacionGuardadaComo', {defaultValue: "Programación guardada como nuevo archivo."}));
  };

  const handleSaveAsCurso = async () => {
    if (!cursoData) {
      toast.error(t('toasts.archivos.sinCurso', {defaultValue: "No hay ningún curso cargado."}));
      return;
    }
    const ok = await fileManager.saveAsCurso();
    if (ok) toast.success(t('toasts.archivos.cursoGuardadoComo', {defaultValue: "Curso guardado como nuevo archivo."}));
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
          toast.success(<>{t('toasts.archivos.programacionCargadaArrastre', {defaultValue: "Programación cargada por arrastre"})} <span className="inline-flex"><FolderOpen className="w-[1.2em] h-[1.2em] ml-1" /></span></>);
        } else {
          toast.error(t('toasts.archivos.errorFormatoProgramacionArrastrar', {defaultValue: "El archivo no tiene un formato válido de programación (.fpp)."}));
        }
      } else {
        const success = await fileManager.importCurso(content, file.name);
        if (success) {
          useAppStore.getState().setCursoFileSource({ type: 'local', fileName: file.name });
          toast.success(<>{t('toasts.archivos.cursoCargadoArrastre', {defaultValue: "Curso cargado por arrastre"})} <span className="inline-flex"><FolderOpen className="w-[1.2em] h-[1.2em] ml-1" /></span></>);
        } else {
          toast.error(t('toasts.archivos.errorFormatoCursoArrastrar', {defaultValue: "El archivo no tiene un formato válido de curso (.fpc)."}));
        }
      }
    };
    reader.readAsText(file);
  }, [dataSource, setDataSource]);

  // ── Helpers ─────────────────────────────────────────────

  const getFriendlyPdName = (pdKey: string) => {
    if (pdKey === "imported-pd") return t('campos.archivos.programacionImportada', {defaultValue: 'Programación importada'});

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

      return `P - ${degreeCode} - ${actualCode} - ${nombre || t('campos.archivos.programacionFallback', {defaultValue: 'Programación'})}`;
    }

    return `P - ${pdKey.replace('-pd', '').toUpperCase()}`;
  };

  // Navegador nuevo / sin datos locales (ningún archivo abierto todavía, ni
  // Programación ni Curso): ofrecer DEMO o crear archivos propios en vez de
  // dejar el panel en blanco. A diferencia del mismo aviso en /calificaciones, este
  // se basa en el estado local (activeModuleId/activeCursoId), no en la lista
  // de módulos del backend — es local-first, el backend no es la fuente de
  // verdad de si hay o no datos de trabajo en este navegador. Sincroniza en
  // ambas direcciones (no solo abre, también cierra) porque la rehidratación
  // de zustand-persist desde IndexedDB es asíncrona: en el primer render
  // activeModuleId todavía es null aunque haya datos guardados, así que si
  // solo abriéramos el wizard se quedaría abierto para siempre una vez que
  // la rehidratación completase y activeModuleId pasara a tener valor.
  // En modo «Reales» el docente ya ha elegido trabajar con sus ficheros (conectar carpeta, abrir, importar):
  // el asistente no debe taparle la pantalla de Datos, que además no tiene botón de cierre.
  useEffect(() => {
    setWizardOpen(!activeModuleId && !activeCursoId && dataSource !== 'local');
  }, [activeModuleId, activeCursoId, dataSource, setWizardOpen]);

  const TABS = [
    { id: "datos", label: <span className="flex items-center gap-2"><Database className="w-4 h-4 shrink-0" /> {t('tabs.archivos.datos.label', {defaultValue: 'Datos'})}</span>, cleanLabel: t('tabs.archivos.datos.label', {defaultValue: 'Datos'}) },
    { id: "nube", label: <span className="flex items-center gap-2"><Cloud className="w-4 h-4 shrink-0" /> {t('tabs.archivos.nube.label', {defaultValue: 'Nube'})}</span>, cleanLabel: t('tabs.archivos.nube.label', {defaultValue: 'Nube'}) },
    { id: "verificacion", label: <span className="flex items-center gap-2"><ListChecks className="w-4 h-4 shrink-0" /> {t('tabs.inicio.verificacion.label', {defaultValue: 'Verificación'})}</span>, cleanLabel: t('tabs.inicio.verificacion.label', {defaultValue: 'Verificación'}) },
  ];

  const activeTabCleanLabel = TABS.find(tab => tab.id === activeTab)?.cleanLabel;

  const TAB_DESCRIPTIONS: Record<string, string> = {
    datos: t('tabs.archivos.datos.desc', {defaultValue: 'Gestión de tus archivos de Grupos, Programaciones y Cursos guardados en local o en la nube.'}),
    nube: t('tabs.archivos.nube.desc', {defaultValue: 'Conecta Google Drive u OneDrive y, si quieres importar un currículo en PDF, tu propia clave de IA.'}),
    verificacion: t('tabs.inicio.verificacion.desc', {defaultValue: 'Panel de salud y coherencia de los datos de tu cuaderno.'}),
  };

  // Índice de bloques por pestaña -- solo en las pestañas con 2+ bloques reales que merezca la pena enlazar.
  const SECTION_INDEX_ITEMS: Record<string, { id: string; label: string }[]> = {
    verificacion: [
      { id: "verificacion-grupo", label: t('campos.verificacion.grupoTitulo', {defaultValue: 'General'}) },
      { id: "verificacion-programacion", label: t('campos.verificacion.programacionTitulo', {defaultValue: 'Programación'}) },
      { id: "verificacion-curso", label: t('campos.verificacion.cursoTitulo', {defaultValue: 'Curso'}) },
    ],
    datos: [
      { id: "datos-modo-datos", label: t('campos.archivos.modoDatosTitulo', {defaultValue: 'Modo de datos'}) },
      { id: "datos-archivos", label: t('campos.archivos.archivosTitulo', {defaultValue: 'Archivos'}) },
    ],
  };

  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      {isWizardOpen && (
        <WelcomeWizard
          onComplete={() => setWizardOpen(false)}
          fetchModules={() => {}}
        />
      )}
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto scrollbar-hide">
          <StickyPageHeader icon={FolderOpen} title={t('archivos.title', {defaultValue: 'Archivos'})} description={t('archivos.subtitle', {defaultValue: 'Tus grupos, programaciones y cursos: dónde están, cuáles tienes abiertos y si están completos.'})}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsList className="max-w-full" bare>
                  {TABS.map(tab => (
                    <TabsTrigger key={tab.id} value={tab.id}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
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
                  <ShieldAlert className="w-4 h-4 mr-2" /> {t('botones.archivos.validarWorkspace', {defaultValue: 'Validar workspace'})}
                </Button>
              )}
            </div>

            {/* Descripción de la pestaña activa -- texto plano, sin cajón,
                mismo patrón que /legal */}
            <p className="text-body text-muted mt-3">
              {TAB_DESCRIPTIONS[activeTab] || 'Gestión de ' + activeTab}
            </p>

            {/* Índice de bloques de la pestaña activa -- dentro del header
                fijo (sticky top-0), así que no se pierde al hacer scroll. */}
            <SectionIndex items={SECTION_INDEX_ITEMS[activeTab] || []} bare />
          </StickyPageHeader>

          <MotionWrapper className="space-y-4 px-8 pt-4 pb-[280px]">
            {/* ── CONTENIDO: DATOS ────────────────────────────────────── */}
            {activeTab === "datos" && (
              <div className="space-y-4 animate-in fade-in duration-300">

                <SectionHeading id="datos-modo-datos" icon={Database} scrollMt="260px">
                  {t('campos.archivos.modoDatosTitulo', {defaultValue: 'Modo de datos'})}
                </SectionHeading>
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-body font-bold text-foreground/80">{t('campos.archivos.modoDatosLabel', {defaultValue: 'Modo de datos:'})}</span>
                    <div className="flex bg-foreground/5 rounded-lg p-0.5 gap-0.5">
                      <button
                        onClick={switchToDemo}
                        className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-md text-body font-bold transition-all ${dataSource === 'demo'
                          ? 'bg-warning/20 text-warning shadow-sm ring-1 ring-warning/30'
                          : 'text-muted hover:bg-foreground/10 hover:text-foreground'}`}
                      >
                        <Cloud className="w-3.5 h-3.5" /> {t('sidebar.demo')}
                      </button>
                      <button
                        onClick={switchToLocal}
                        className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-md text-body font-bold transition-all ${dataSource === 'local'
                          ? 'bg-success/20 text-success shadow-sm ring-1 ring-success/30'
                          : 'text-muted hover:bg-foreground/10 hover:text-foreground'}`}
                      >
                        <HardDrive className="w-3.5 h-3.5" /> {t('sidebar.reales')}
                      </button>
                    </div>
                  </div>

                  <div className={`flex-1 flex items-center gap-2 px-4 py-2 rounded-lg border text-body ${dataSource === 'demo' ? 'bg-warning/10 border-warning/30 text-warning' : 'bg-success/10 border-success/30 text-success'}`}>
                    {dataSource === 'demo' ? (
                      <>
                        <Cloud className="w-4 h-4 shrink-0" />
                        <span><strong className="font-bold">Demo:</strong> {t('campos.archivos.avisoDemoDesc', {defaultValue: 'datos de ejemplo, nada se guarda. Cambia a reales para tus propios archivos.'})}</span>
                      </>
                    ) : (
                      <>
                        <HardDrive className="w-4 h-4 shrink-0" />
                        <span><strong className="font-bold">Real:</strong> {t('campos.archivos.avisoRealDesc', {defaultValue: 'estás trabajando con tus propios archivos .fpg/.fpp/.fpc, guardados en tu equipo. Los cambios se guardan de verdad.'})}</span>
                      </>
                    )}
                  </div>
                </div>

                <SectionHeading id="datos-archivos" icon={FolderOpen} scrollMt="260px">
                  {t('campos.archivos.archivosTitulo', {defaultValue: 'Archivos'})}
                </SectionHeading>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* ── Columna GRUPO ── */}
                  <Card className={`p-6 border rounded-2xl shadow-lg flex flex-col h-[452px] relative overflow-hidden group ${isDemoLoaded ? 'bg-foreground/5 border-warning/20' : 'bg-foreground/5 border-[var(--glass-border)]'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                      <FolderOpen className={`w-24 h-24 ${isDemoLoaded ? 'text-warning' : 'text-accent'}`} />
                    </div>
                    <div className="relative z-10 flex flex-col h-full flex-1">
                      <div className="mb-4">
                        <h3 className="text-subheading font-bold text-foreground flex items-center gap-2">
                          <FolderOpen className={`w-5 h-5 ${isDemoLoaded ? 'text-warning' : 'text-accent'}`} /> {t('nav.grupos', {defaultValue: 'Grupos'})}
                        </h3>
                        <p className="text-body text-muted mt-2 leading-relaxed">
                          {isDemoLoaded
                            ? t('campos.archivos.gruposEjemploDobleClic', {defaultValue: 'Grupos de ejemplo. Doble clic para cargar.'})
                            : t('campos.archivos.tusGruposDobleClic', {defaultValue: 'Tus grupos guardados. Doble clic para cargar.'})}
                        </p>
                      </div>

                      <div className="flex-1 flex flex-col gap-2 min-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                        {isDemoLoaded ? (
                          demoGroupFiles.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-center p-4">
                              <p className="text-body text-muted">{t('campos.archivos.sinGruposDemo', {defaultValue: 'No se han encontrado grupos demo.'})}</p>
                            </div>
                          ) : (
                            demoGroupFiles.map(f => {
                              const isActive = groupFileSource.fileName === f.name;
                              return (
                                <button
                                  key={f.name}
                                  onDoubleClick={async () => {
                                    await fileManager.loadDemoData(f.name);
                                    toast.success(t('toasts.archivos.grupoCargado', {name: f.name, defaultValue: 'Grupo {{name}} cargado.'}));
                                  }}
                                  className={`w-full text-left p-3 rounded-lg border transition-colors group/item ${isActive ? 'bg-warning/10 border-warning/40 shadow-sm' : 'border-[var(--glass-border)] bg-foreground/[0.02] hover:bg-foreground/5'}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <FolderOpen className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-warning' : 'text-warning/70 group-hover/item:text-warning'}`} />
                                    <span className={`text-body font-medium truncate ${isActive ? 'text-warning font-bold' : ''}`} title={f.name}>{f.name.replace('.fpg', '')}</span>
                                  </div>
                                </button>
                              );
                            })
                          )
                        ) : !workspaceHandle ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-4">
                            <Database className="w-8 h-8 text-muted/50 mb-2" />
                            <p className="text-body text-muted font-medium">{t('campos.archivos.usaBotonEnlazarCarpeta', {defaultValue: 'Usa el botón inferior para enlazar tu carpeta de trabajo.'})}</p>
                          </div>
                        ) : workspaceFiles.grupos.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-center p-4">
                            <p className="text-body text-muted">{t('campos.archivos.sinGrupos', {defaultValue: 'No se han encontrado grupos.'})}</p>
                          </div>
                        ) : (
                          workspaceFiles.grupos.map(g => (
                            <button
                              key={g}
                              onDoubleClick={async () => {
                                const ok = await fileManager.loadGroupFromWorkspace(workspaceHandle, g);
                                if (ok) toast.success(t('toasts.archivos.grupoAbierto', {name: g, defaultValue: 'Grupo {{name}} abierto correctamente.'}));
                                else toast.error(t('toasts.archivos.errorAbrirGrupo', {defaultValue: "Error al abrir el grupo."}));
                              }}
                              className="w-full text-left p-3 rounded-lg border border-[var(--glass-border)] bg-foreground/[0.02] hover:bg-foreground/5 transition-colors group/item"
                            >
                              <div className="flex items-center gap-2">
                                <FolderOpen className="w-4 h-4 text-accent/70 group-hover/item:text-accent transition-colors shrink-0" />
                                <span className="text-body font-medium truncate" title={g}>{g.replace('.json', '')}</span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>

                      {/* Botonera Grupos */}
                      {!isDemoLoaded && (
                        <div className="flex flex-col gap-2 pt-4 mt-auto border-t border-[var(--glass-border)]">
                          {!workspaceHandle ? (
                            <Button onClick={async () => {
                              const handle = await fileManager.openWorkspaceDirectory();
                              if (handle) toast.success(t('toasts.archivos.carpetaConectada', {defaultValue: "Carpeta local conectada."}));
                            }} className="w-full bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 transition-all text-caption h-9">
                              <FolderOpen className="w-3 h-3 mr-1" /> {t('botones.archivos.conectarCarpetaLocal', {defaultValue: 'Conectar carpeta local'})}
                            </Button>
                          ) : (
                            <Button onClick={async () => {
                              const handle = await fileManager.openWorkspaceDirectory();
                              if (handle) toast.success(t('toasts.archivos.carpetaCambiada', {defaultValue: "Carpeta local cambiada."}));
                            }} className="w-full bg-foreground/5 hover:bg-foreground/10 text-foreground border border-[var(--glass-border)] transition-all text-caption h-9">
                              <FolderOpen className="w-3 h-3 mr-1" /> {t('botones.archivos.cambiarCarpetaLocal', {defaultValue: 'Cambiar carpeta local'})}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* ── Columna PROGRAMACIÓN ── */}
                  <Card className={`p-6 border rounded-2xl shadow-lg flex flex-col h-[452px] relative overflow-hidden group ${isDemoLoaded ? 'bg-foreground/5 border-warning/20' : 'bg-foreground/5 border-info/20'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                      <BookOpen className={`w-24 h-24 ${isDemoLoaded ? 'text-warning' : 'text-info'}`} />
                    </div>
                    <div className="relative z-10 flex flex-col h-full flex-1">
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="text-subheading font-bold text-foreground flex items-center gap-2">
                            <BookOpen className={`w-5 h-5 ${isDemoLoaded ? 'text-warning' : 'text-info'}`} /> {t('campos.archivos.programacionesTitulo', {defaultValue: 'Programaciones'})}
                          </h3>
                          {hasPdFile && <Badge variant={isDemoLoaded ? 'warning' : 'info'}>{t('checks.archivos.activaFem', {defaultValue: 'Activa'})}</Badge>}
                        </div>
                        <p className="text-body text-muted mt-2 leading-relaxed">
                          {t('campos.archivos.dobleClicCargarProgramacion', {defaultValue: 'Doble clic para cargar una programación.'})}
                        </p>
                      </div>

                      <div className="flex-1 flex flex-col gap-2 min-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                        {isDemoLoaded ? (
                          demoProgFiles.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-center p-4">
                              <p className="text-body text-muted">{t('campos.archivos.sinProgramacionesDemo', {defaultValue: 'No se han encontrado programaciones demo.'})}</p>
                            </div>
                          ) : (
                            demoProgFiles.map(f => {
                              const isActive = pdFileSource.fileName === f.name;
                              return (
                                <button
                                  key={f.name}
                                  onDoubleClick={() => loadDemoProgramacion(f.name)}
                                  className={`w-full text-left p-3 rounded-lg border transition-colors group/item ${isActive ? 'bg-info/10 border-info/40 shadow-sm' : 'border-[var(--glass-border)] bg-foreground/[0.02] hover:bg-foreground/5'}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <BookOpen className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-info' : 'text-info/70 group-hover/item:text-info'}`} />
                                    <span className={`text-body font-medium truncate ${isActive ? 'text-info font-bold' : ''}`} title={f.name}>{f.name.replace('.fpp', '')}</span>
                                  </div>
                                </button>
                              );
                            })
                          )
                        ) : workspaceHandle && workspaceFiles.programaciones.length > 0 ? (
                          workspaceFiles.programaciones.map(p => {
                            const isActive = pdFileSource.type === 'local' && pdFileSource.fileName === p;
                            return (
                              <button
                                key={p}
                                onDoubleClick={async () => {
                                  const ok = await fileManager.loadProgramacionFromWorkspace(workspaceHandle, p);
                                  if (ok) toast.success(t('toasts.archivos.programacionAbierta', {defaultValue: "Programación abierta correctamente."}));
                                  else toast.error(t('toasts.archivos.errorAbrirProgramacion', {defaultValue: "Error al abrir la programación."}));
                                }}
                                className={`w-full text-left p-3 rounded-lg border transition-colors group/item ${isActive ? 'bg-info/10 border-info/40 shadow-sm' : 'border-[var(--glass-border)] bg-foreground/[0.02] hover:bg-foreground/5'}`}
                              >
                                <div className="flex items-center gap-2">
                                  <BookOpen className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-info' : 'text-info/70 group-hover/item:text-info'}`} />
                                  <span className={`text-body font-medium truncate ${isActive ? 'text-info font-bold' : ''}`} title={p}>{p.replace('.json', '')}</span>
                                </div>
                              </button>
                            );
                          })
                        ) : workspaceHandle ? (
                          <div className="h-full flex items-center justify-center text-center p-4">
                            <p className="text-body text-muted">{t('campos.archivos.sinProgramaciones', {defaultValue: 'No se han encontrado programaciones.'})}</p>
                          </div>
                        ) : null}
                      </div>

                      {/* Botonera Programación */}
                      <div className="flex flex-col gap-2 pt-4 mt-auto border-t border-[var(--glass-border)]">
                        {isDemoLoaded ? (
                          <Button onClick={handleLoadDemo} className="w-full bg-warning/20 hover:bg-warning/30 text-warning border border-warning/30">
                            <Zap className="w-4 h-4 mr-2" /> {t('botones.archivos.recargarDemo', {defaultValue: 'Recargar demo'})}
                          </Button>
                        ) : (
                          <>
                            <div className="flex gap-2">
                              <Button onClick={handleNewPd} className="flex-1 bg-info/10 hover:bg-info/20 text-info border border-info/30 transition-all text-caption h-9">
                                <Plus className="w-3 h-3 mr-1" /> {t('botones.archivos.nuevaCatalogo', {defaultValue: 'Nueva (catálogo)'})}
                              </Button>
                              <Button onClick={handleOpenPd} className="flex-1 bg-foreground/5 hover:bg-foreground/10 text-foreground border border-[var(--glass-border)] transition-all text-caption h-9">
                                <FolderOpen className="w-3 h-3 mr-1" /> {t('common.importar', {defaultValue: 'Importar'})}
                              </Button>
                            </div>
                            <ImportarDeBiblioteca
                              hayProgramacion={hasPdFile}
                              onImported={() => setDataSource('local')}
                            />
                            {hasPdFile && (
                              <div className="flex gap-2">
                                <Button onClick={handleSavePd} className="flex-1 bg-info/10 hover:bg-info/20 text-info border border-info/30 transition-all text-caption h-9">
                                  <Save className="w-3 h-3 mr-1" /> {t('common.guardar', {defaultValue: 'Guardar'})}
                                </Button>
                                <Button onClick={handleSaveAsPd} className="bg-foreground/5 hover:bg-foreground/10 text-muted border border-[var(--glass-border)] transition-all px-3 h-9" title={t('tooltips.archivos.guardarComo', {defaultValue: 'Guardar como...'})}>
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                            {hasPdFile && moduleData && (
                              <Button
                                onClick={() => { fileManager.downloadPlantilla(); toast.success(t('toasts.archivos.plantillaExportada', {defaultValue: "Plantilla descargada, sin centro, profesorado ni datos del grupo."})); }}
                                title={t('tooltips.archivos.exportarPlantilla', {defaultValue: "Descarga una copia para compartir: sin tu nombre, el centro, la localidad ni el contexto del grupo. El alumnado y las notas nunca van en la programación."})}
                                className="w-full bg-foreground/5 hover:bg-foreground/10 text-muted border border-[var(--glass-border)] transition-all text-caption h-9"
                              >
                                <Share2 className="w-3 h-3 mr-1" /> {t('botones.archivos.exportarPlantilla', {defaultValue: 'Exportar como plantilla'})}
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* ── Columna CURSO ── */}
                  <Card className={`p-6 border rounded-2xl shadow-lg flex flex-col h-[452px] relative overflow-hidden group ${isDemoLoaded ? 'bg-foreground/5 border-warning/20' : 'bg-foreground/5 border-success/20'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                      <Users className={`w-24 h-24 ${isDemoLoaded ? 'text-warning' : 'text-success'}`} />
                    </div>
                    <div className="relative z-10 flex flex-col h-full flex-1">
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className={`text-subheading font-bold flex items-center gap-2 ${(!isDemoLoaded && !hasPdFile) ? 'text-muted' : 'text-foreground'}`}>
                            <Users className={`w-5 h-5 ${isDemoLoaded ? 'text-warning' : (!isDemoLoaded && !hasPdFile) ? 'text-muted' : 'text-success'}`} /> {t('campos.archivos.cursosTitulo', {defaultValue: 'Cursos'})}
                          </h3>
                          {hasCursoFile && <Badge variant={isDemoLoaded ? 'warning' : 'success'}>{t('checks.archivos.activoMasc', {defaultValue: 'Activo'})}</Badge>}
                        </div>
                        <p className="text-body text-muted mt-2 leading-relaxed">
                          {t('campos.archivos.dobleClicCargarCurso', {defaultValue: 'Doble clic para cargar un curso.'})}
                        </p>
                      </div>

                      <div className="flex-1 flex flex-col gap-2 min-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                        {isDemoLoaded ? (
                          demoCursoFiles.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-center p-4">
                              <p className="text-body text-muted">{t('campos.archivos.sinCursosDemo', {defaultValue: 'No se han encontrado cursos demo.'})}</p>
                            </div>
                          ) : (
                            demoCursoFiles.map(f => {
                              const isActive = cursoFileSource.fileName === f.name;
                              return (
                                <button
                                  key={f.name}
                                  onDoubleClick={() => loadDemoCurso(f.name)}
                                  className={`w-full text-left p-3 rounded-lg border transition-colors group/item ${isActive ? 'bg-success/10 border-success/40 shadow-sm' : 'border-[var(--glass-border)] bg-foreground/[0.02] hover:bg-foreground/5'}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Users className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-success' : 'text-success/70 group-hover/item:text-success'}`} />
                                    <span className={`text-body font-medium truncate ${isActive ? 'text-success font-bold' : ''}`} title={f.name}>{f.name.replace('.fpc', '')}</span>
                                  </div>
                                </button>
                              );
                            })
                          )
                        ) : workspaceHandle && workspaceFiles.cursos.length > 0 ? (
                          workspaceFiles.cursos.map(c => {
                            const isActive = cursoFileSource.type === 'local' && cursoFileSource.fileName === c;
                            return (
                              <button
                                key={c}
                                onDoubleClick={() => {
                                  toast.error(t('toasts.archivos.abrirCursoViaGrupo', {defaultValue: "Para abrir un curso de forma segura, haz doble clic en su grupo asociado en la primera columna."}));
                                }}
                                className={`w-full text-left p-3 rounded-lg border transition-colors group/item ${isActive ? 'bg-success/10 border-success/40 shadow-sm' : 'border-[var(--glass-border)] bg-foreground/[0.02] hover:bg-foreground/5 opacity-80 hover:opacity-100'}`}
                              >
                                <div className="flex items-center gap-2">
                                  <Users className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-success' : 'text-success/70 group-hover/item:text-success'}`} />
                                  <span className={`text-body font-medium truncate ${isActive ? 'text-success font-bold' : ''}`} title={c}>{c.replace('.json', '')}</span>
                                </div>
                              </button>
                            );
                          })
                        ) : workspaceHandle ? (
                          <div className="h-full flex items-center justify-center text-center p-4">
                            <p className="text-body text-muted">{t('campos.archivos.sinCursos', {defaultValue: 'No se han encontrado cursos.'})}</p>
                          </div>
                        ) : null}
                      </div>

                      {/* Botonera Curso */}
                      <div className="flex flex-col gap-2 pt-4 mt-auto border-t border-[var(--glass-border)]">
                        {isDemoLoaded ? (
                          <Button onClick={handleLoadDemo} className="w-full bg-warning/20 hover:bg-warning/30 text-warning border border-warning/30">
                            <Zap className="w-4 h-4 mr-2" /> {t('botones.archivos.recargarDemo', {defaultValue: 'Recargar demo'})}
                          </Button>
                        ) : (
                          <>
                            <div className="flex gap-2">
                              <Button disabled={!hasPdFile} onClick={handleNewCurso} className="flex-1 bg-success/10 hover:bg-success/20 text-success border border-success/30 transition-all disabled:opacity-30 text-caption h-9" title={t('tooltips.archivos.creaCursoGrupo', {defaultValue: 'Crea un curso y su archivo grupo asociado'})}>
                                <Plus className="w-3 h-3 mr-1" /> {t('botones.archivos.iniciarCursoGrupo', {defaultValue: 'Iniciar curso (+ grupo)'})}
                              </Button>
                              <Button disabled={!hasPdFile} onClick={handleOpenCurso} className="bg-foreground/5 hover:bg-foreground/10 text-foreground border border-[var(--glass-border)] transition-all px-3 h-9" title={t('tooltips.archivos.importarCursoHuerfano', {defaultValue: 'Importar curso huérfano'})}>
                                <FolderOpen className="w-3 h-3" />
                              </Button>
                            </div>
                            {hasCursoFile && (
                              <div className="flex gap-2">
                                <Button onClick={handleSaveCurso} className="flex-1 bg-success/10 hover:bg-success/20 text-success border border-success/30 transition-all text-caption h-9">
                                  <Save className="w-3 h-3 mr-1" /> {t('common.guardar', {defaultValue: 'Guardar'})}
                                </Button>
                                <Button onClick={handleSaveAsCurso} className="bg-foreground/5 hover:bg-foreground/10 text-muted border border-[var(--glass-border)] transition-all px-3 h-9" title={t('tooltips.archivos.guardarComo', {defaultValue: 'Guardar como...'})}>
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

              </div>
            )}


            {/* ── CONTENIDO: NUBE ───────────────────────────────────── */}
            {activeTab === "nube" && (
              <div className="space-y-4 animate-in fade-in duration-300">

                {/* Bloque interno: Nube (Google Drive & OneDrive) + Asistente
                    IA, como tercera columna (antes pestaña propia
                    "Asistente", eliminada -- petición de Rafael,
                    2026-09-30). */}
                <SectionHeading id="datos-nube" icon={Cloud} scrollMt="260px" className="pt-2">
                  {t('campos.archivos.nubeTitulo', {defaultValue: 'Nube y clave de IA'})}
                </SectionHeading>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                  <GoogleDriveSyncPanel />
                  <OneDriveSyncPanel />
                  <AISettingsPanel />
                </div>

              </div>
            )}

            {/* ── CONTENIDO: VERIFICACIÓN ────────────────────────────── */}
            {activeTab === "verificacion" && <VerificacionTab />}

            </MotionWrapper>
        </main>
      </div>

      {/* New File Wizard */}
      <NewFileWizard
        isOpen={newFileWizardOpen}
        onClose={() => setNewFileWizardOpen(false)}
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
            <h2 id="validation-modal-title" className="text-subheading font-bold mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-warning" />
              {t('campos.archivos.validacionEnlacesTitulo', {defaultValue: 'Validación de enlaces del workspace'})}
            </h2>

            {brokenLinks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                <p className="text-foreground font-medium">{t('campos.archivos.todoCorrecto', {defaultValue: '¡Todo correcto!'})}</p>
                <p className="text-muted text-body mt-2">{t('campos.archivos.sinEnlacesRotos', {defaultValue: 'No se han detectado enlaces rotos en los grupos de tu carpeta local.'})}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted text-body">{t('campos.archivos.enlacesRotosDetectados', {defaultValue: 'Se han detectado los siguientes enlaces rotos en los archivos Grupo. Esto sucede cuando renombras o eliminas una Programación o un Curso en Windows directamente.'})}</p>
                <ul className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {brokenLinks.map((link, idx) => (
                    <li key={link.groupName || idx} className="bg-foreground/5 p-3 rounded-lg border border-[var(--glass-border)] text-body">
                      <p className="font-semibold">{link.groupName}</p>
                      <p className="text-danger flex items-center gap-2 mt-1">
                        <AlertTriangle className="w-4 h-4" /> {link.type === 'programacion' ? t('campos.archivos.programacionNoEncontrada', {defaultValue: 'Programación no encontrada:'}) : t('campos.archivos.cursoNoEncontrado', {defaultValue: 'Curso no encontrado:'})} <span className="font-mono">{link.missingFile}</span>
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
                                  toast.success(t('toasts.archivos.enlaceReparado', {defaultValue: "Enlace reparado correctamente."}));
                                  setBrokenLinks(prev => prev.filter(l => l !== link));
                                  setFixingLink(null);
                                  fileManager.scanWorkspaceFiles(workspaceHandle).then(setWorkspaceFiles);
                                } else {
                                  toast.error(t('toasts.archivos.errorReparEnlace', {defaultValue: "Error al reparar el enlace."}));
                                }
                              }
                            }}
                          >
                            <option value="">{t('checks.archivos.seleccionarArchivoCorrecto', {defaultValue: 'Seleccionar archivo correcto...'})}</option>
                            {(link.type === 'programacion' ? workspaceFiles.programaciones : workspaceFiles.cursos).map(f => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                          <Button size="sm" variant="ghost" onClick={() => setFixingLink(null)}>{t('common.cancelar', {defaultValue: 'Cancelar'})}</Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-2 border border-foreground/20"
                          onClick={() => setFixingLink(link)}
                        >
                          {t('botones.archivos.repararEnlace', {defaultValue: 'Reparar enlace'})}
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setValidationModalOpen(false)}>{t('common.cerrar', {defaultValue: 'Cerrar'})}</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function handleLoadDemo() {
  fileManager.loadDemoData();
  toast.success(i18next.t('toasts.archivos.demoCargada', {defaultValue: "Datos de demostración cargados correctamente."}));
}
