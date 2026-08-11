"use client";
import { TabSync } from "@/components/ui/TabSync";
import { Award, BookOpen, Calculator, Check, ClipboardList, GraduationCap, Puzzle, Target, Settings , Info, FolderOpen, Grid, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { RaOgMatrix } from "@/components/features/resultados/RaOgMatrix";
import { SessionTable } from "@/components/features/secuenciacion/SessionTable";
import { TaskTable } from "@/components/features/secuenciacion/TaskTable";
import { CompetenciaCPP } from "@/types/curriculum";
import toast from "react-hot-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/ui/PageHeader";
import { TabInfoBox } from "@/components/ui/TabInfoBox";
import Link from "next/link";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { loadCatalogForModule, resolveDescRa, resolveDescCe } from "@/services/catalogCache";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useTranslation } from "react-i18next";
import { ProposalLoaderModal } from "@/components/features/matrices/ProposalLoaderModal";
import { PublisherProposal } from "@/data/proposalsData";

export default function MatricesPage() {
  const { activeModuleId, moduleData, setModuleData, updateDataFrame, updateModuleData, saveModuleData, cursoData, updateCursoData, updateInfoModulo } = useAppStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [allCeOpen, setAllCeOpen] = useState(false);
  const [allUdsOpen, setAllUdsOpen] = useState(false);
  const [openCEs, setOpenCEs] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("ponderacion-ra-ce");
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [catalogLoaded, setCatalogLoaded] = useState(0);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [selectionValue, setSelectionValue] = useState<string>("");

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const TABS = [
    { id: "ponderacion-ra-ce", label: "Ponderación RA y CE", cleanLabel: "Ponderación RA y CE", icon: <><span className="inline-flex"><GraduationCap className="w-[1.2em] h-[1.2em] mr-1" /></span></> },
    { id: "unidades", label: "Unidades didácticas", cleanLabel: "Unidades didácticas", icon: <><span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span></> },
    { id: "contribucion-ra-og", label: "Contribución RA en OG", cleanLabel: "Contribución RA en OG", icon: <><span className="inline-flex"><Target className="w-[1.2em] h-[1.2em] mr-1" /></span></> },
    { id: "competenciales", label: "Tareas competenciales", cleanLabel: "Tareas competenciales", icon: <><span className="inline-flex"><Target className="w-[1.2em] h-[1.2em] mr-1" /></span></> },
  ];

  const TAB_DESCRIPTIONS: Record<string, string> = {
    'ponderacion-ra-ce': 'Matriz de resultados de aprendizaje y criterios de evaluación, y su ponderación.',
    'unidades': 'Definición de unidades didácticas o unidades de trabajo.',
    'contribucion-ra-og': 'Contribución de los RA a los objetivos generales del título.',
    'competenciales': 'Diseño y planificación de tareas y actividades competenciales.',
  };

  // Load catalog descriptions when module changes (for fallback resolution)
  useEffect(() => {
    if (activeModuleId) {
      loadCatalogForModule(activeModuleId).then(() => setCatalogLoaded(Date.now()));
    }
  }, [activeModuleId]);

  useEffect(() => {
    setLoading(false);
  }, [activeModuleId, moduleData]);

  const handleSave = async () => {
    setSaving(true);
    const ok = await saveModuleData();
    if (ok) {
      toast.success("Progrmación guardada correctamente");
    } else {
      toast.error("Error al guardar los datos");
    }
    setSaving(false);
  };

  const handleApplyProposal = async (proposal: PublisherProposal) => {
    // 1. Update UDs
    const newUdList = proposal.df_ud.map((ud, index) => ({
      id_ud: ud.id_ud,
      desc_ud: ud.desc_ud,
      horas_ud: ud.horas_ud,
      ra_mappings: ud.ra_mappings
    }));
    
    // 2. Update RA->OG mappings
    const infoModulo = { ...(moduleData?.info_modulo || {}) };
    infoModulo.ra_og_mapping = proposal.ra_og_mapping;

    // Apply to store
    updateDataFrame("df_ud", newUdList);
    updateInfoModulo("ra_og_mapping", proposal.ra_og_mapping);

    // Save
    const ok = await saveModuleData();
    if (ok) {
      toast.success(`Propuesta de ${proposal.author} aplicada y guardada.`);
    } else {
      toast.error("Error al guardar tras aplicar la propuesta.");
    }
  };

  if (!activeModuleId) {
    return (
      <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1 p-8 content-area">
            <MotionWrapper>
              <Card className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl">
                <Calculator className="w-16 h-16 text-muted-foreground opacity-50" />
                <h2 className="text-heading font-bold">No hay programación cargada</h2>
                <p className="text-muted mb-4">Debes abrir o crear un archivo de programación en tu Archivos.</p>
                <Link href="/archivos">
                  <Button variant="primary" className="gap-2">
                    <FolderOpen className="w-4 h-4" /> Ir a mis Archivos
                  </Button>
                </Link>
              </Card>
            </MotionWrapper>
          </main>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner text="Cargando matrices..." />;
  }

  const df_ra = moduleData?.df_ra || [];
  const df_ud = moduleData?.df_ud || [];
  const df_ce = moduleData?.df_ce || [];
  const df_sesiones = moduleData?.df_sesiones || [];
  const df_tareas = moduleData?.df_tareas || [];

  const generateAutoSessions = () => {
    if (!window.confirm("¿Seguro que quieres autocompletar el plan de sesiones? Esto reemplazará las sesiones actuales de todas las UDs.")) return;

    const newSessions: any[] = [];

    df_ud.forEach((ud: any) => {
      const horas = Number(ud.horas_ud) || 0;
      if (horas <= 0) return;

      const raStr = ud.ra_mappings ? Object.keys(ud.ra_mappings).join(" / ") : "";
      let sessionId = 1;

      const addSession = (h: number, tipo: string, contenido: string, clave: string, recursos: string) => {
        if (h <= 0) return;
        newSessions.push({
          id_sesion: `${ud.id_ud}-S${sessionId.toString().padStart(2, '0')}`,
          id_ud: ud.id_ud,
          Num_Orden: sessionId,
          Horas: h,
          Tipo_Actividad: tipo,
          RA_CE: raStr,
          Contenidos: contenido,
          Aspectos_Clave: clave,
          Recursos: recursos
        });
        sessionId++;
      };

      if (horas >= 9) {
        const remaining = horas - 9;
        const hTeoria = Math.round(remaining * 0.4);
        const hPractica = remaining - hTeoria;

        addSession(1, "Teoría", "Presentación de la Unidad", "AC-PRO-01", "REC-DID-01");
        if (hTeoria > 0) addSession(hTeoria, "Teoría", "Exposición teórica", "AC-PRO-01, AC-PRO-03", "REC-DID-01, REC-DID-02");
        if (hPractica > 0) addSession(hPractica, "Práctica", "Trabajos prácticos", "AC-TEC-01, AC-TEC-02", "REC-TAL-01, REC-TAL-02, REC-TAL-05");
        addSession(2, "Teoría", "Examen escrito", "AC-ACT-02", "REC-DOC-04");
        addSession(2, "Práctica", "Examen práctico", "AC-TEC-04, AC-NOR-01", "REC-TAL-03, REC-TAL-04");
        addSession(4, "Proyecto", "Presentaciones", "AC-ACT-01", "REC-DID-04, REC-DOC-04");
      } else {
        // UDs con < 9 horas (Reparto mínimo/escalado)
        let hLeft = horas;
        
        const p1 = Math.min(1, hLeft); hLeft -= p1;
        addSession(p1, "Teoría", "Presentación de la Unidad", "AC-PRO-01", "REC-DID-01");
        
        const p2 = Math.min(Math.floor(hLeft * 0.4), hLeft); hLeft -= p2;
        if (p2 > 0) addSession(p2, "Teoría", "Exposición teórica", "AC-PRO-01", "REC-DID-01");

        const p3 = Math.min(Math.floor(hLeft * 0.6), hLeft); hLeft -= p3;
        if (p3 > 0) addSession(p3, "Práctica", "Trabajos prácticos", "AC-TEC-01", "REC-TAL-01");
        
        const p4 = Math.min(1, hLeft); hLeft -= p4;
        if (p4 > 0) addSession(p4, "Teoría", "Examen escrito", "AC-ACT-02", "REC-DOC-04");
        
        const p5 = Math.min(1, hLeft); hLeft -= p5;
        if (p5 > 0) addSession(p5, "Práctica", "Examen práctico", "AC-TEC-04", "REC-TAL-03");

        const p6 = hLeft; hLeft -= p6;
        if (p6 > 0) addSession(p6, "Proyecto", "Presentaciones", "AC-ACT-01", "REC-DID-04");
      }
    });

    updateDataFrame("df_sesiones", newSessions);
    toast.success("¡Plan de sesiones autocompletado!");
  };

  const handleAddTarea = () => {
    const newTareas = [...df_tareas];
    const newId = `TC${(newTareas.length + 1).toString().padStart(2, '0')}`;
    newTareas.push({
      ID: newId,
      Nombre_Tarea: "",
      Reto: "",
      RA_Asociados: "",
      Instrumento: ""
    });
    updateDataFrame("df_tareas", newTareas);
  };

  const handleUpdateTarea = (globalIdx: number, field: string, value: any) => {
    const newTareas = [...df_tareas];
    (newTareas[globalIdx] as any)[field] = value;
    updateDataFrame("df_tareas", newTareas);
  };

  const handleDeleteTarea = (globalIdx: number) => {
    const newTareas = [...df_tareas];
    newTareas.splice(globalIdx, 1);
    updateDataFrame("df_tareas", newTareas);
  };

  const onDragEndSesion = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.droppableId !== destination.droppableId) return;

    const udId = source.droppableId;
    const newSesiones = [...df_sesiones];

    const udSesiones = newSesiones.filter(s => s.id_ud === udId).sort((a, b) => (Number(a.Num_Orden) || 0) - (Number(b.Num_Orden) || 0));

    const [moved] = udSesiones.splice(source.index, 1);
    udSesiones.splice(destination.index, 0, moved);

    udSesiones.forEach((ses, idx) => {
      ses.Num_Orden = idx + 1;
    });

    updateDataFrame("df_sesiones", newSesiones);
  };

  const handleAddSesion = (ud_id: string) => {
    const newSesiones = [...df_sesiones];
    const newId = `SES${(newSesiones.length + 1).toString().padStart(3, '0')}`;
    const udSesiones = newSesiones.filter(s => s.id_ud === ud_id);
    const numOrden = udSesiones.length > 0 ? Math.max(...udSesiones.map(s => Number(s.Num_Orden) || 0)) + 1 : 1;

    newSesiones.push({
      ID: newId,
      id_ud: ud_id,
      Num_Orden: numOrden,
      Horas: 1,
      Tipo_Actividad: "Tª (Teoria)",
      RA_CE: "",
      Contenidos: "",
      Aspectos_Clave: "",
      Recursos: ""
    });
    updateDataFrame("df_sesiones", newSesiones);
  };

  const handleUpdateSesion = (globalIdx: number, field: string, value: any) => {
    const newSesiones = [...df_sesiones];
    (newSesiones[globalIdx] as any)[field] = value;
    updateDataFrame("df_sesiones", newSesiones);
  };

  const handleDeleteSesion = (globalIdx: number) => {
    const newSesiones = [...df_sesiones];
    newSesiones.splice(globalIdx, 1);
    updateDataFrame("df_sesiones", newSesiones);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />

        <main className="flex-1 p-8 content-area overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-4 pb-12">
            <PageHeader icon={Grid} title="Currículo" description={t('pages.matrices_desc')} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsList className="max-w-full">
                  {TABS.map(tab => (
                    <TabsTrigger key={tab.id} value={tab.id}>
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <Button
                onClick={() => setIsProposalModalOpen(true)}
                variant="secondary"
                className="border-info/50 text-info hover:bg-info/10 whitespace-nowrap shadow-sm"
              >
                💡 Cargar Propuesta Editorial
              </Button>
            </div>

            <TabInfoBox description={TAB_DESCRIPTIONS[activeTab] || 'Gestión de ' + activeTab} />

            {/* Resultados de aprendizaje y CE */}
            {activeTab === "ponderacion-ra-ce" && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <Card className="p-6 border-t-4 border-t-accent">
                  <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
                    <span><span className="inline-flex"><GraduationCap className="w-[1.2em] h-[1.2em] mr-1" /></span></span> RA. Resultados de aprendizaje
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-body">
                      <thead>
                        <tr className="text-muted border-b border-[var(--glass-border)]">
                          <th className="pb-2 w-24">RA</th>
                          <th className="pb-2 w-24">% RA</th>
                          <th className="pb-2 w-16 text-center">Feoe</th>
                          <th className="pb-2">Resultados de aprendizaje</th>
                          <th className="pb-2 w-32">Comp. Clave</th>
                          <th className="pb-2 w-32">CPE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {df_ra.map((ra: any, idx: number) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-foreground/5 transition-colors">
                            <td className="py-2 pr-2">
                              <input
                                type="text"
                                value={ra.id_ra || ""}
                                onChange={(e) => {
                                  const newRa = [...df_ra];
                                  newRa[idx].id_ra = e.target.value;
                                  updateDataFrame("df_ra", newRa);
                                }}
                                className="w-16 bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-[#14a085] focus:outline-none font-mono text-body"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="number"
                                value={ra.peso_ra || 0}
                                onChange={(e) => {
                                  const newRa = [...df_ra];
                                  newRa[idx].peso_ra = parseFloat(e.target.value) || 0;
                                  updateDataFrame("df_ra", newRa);
                                }}
                                className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-body focus:border-[#14a085] focus:outline-none"
                              />
                            </td>
                            <td className="py-2 text-center">
                              <button
                                onClick={() => {
                                  const newRa = [...df_ra];
                                  newRa[idx].is_dual = !newRa[idx].is_dual;
                                  updateDataFrame("df_ra", newRa);
                                }}
                                className={`w-6 h-6 rounded flex items-center justify-center transition-all mx-auto ${ra.is_dual
                                  ? 'bg-[#14a085]/20 text-[#14a085] border border-[#14a085]/50 shadow-[0_0_10px_rgba(20,160,133,0.2)]'
                                  : 'bg-background border border-[var(--glass-border)] text-transparent hover:border-[#14a085]/30 hover:bg-[#14a085]/10'
                                  }`}
                              >
                                {ra.is_dual && <span className="text-caption font-medium"><span className="inline-flex"><Check className="w-[1.2em] h-[1.2em] mr-1" /></span></span>}
                              </button>
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="text"
                                value={ra.desc_ra || ""}
                                placeholder={resolveDescRa(activeModuleId, ra)}
                                onChange={(e) => {
                                  const newRa = [...df_ra];
                                  newRa[idx].desc_ra = e.target.value;
                                  updateDataFrame("df_ra", newRa);
                                }}
                                className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-3 py-1 text-foreground text-body focus:border-[#14a085] focus:outline-none"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="text"
                                value={ra.comp_clave || ""}
                                placeholder="CL, CD..."
                                onChange={(e) => {
                                  const newRa = [...df_ra];
                                  newRa[idx].comp_clave = e.target.value;
                                  updateDataFrame("df_ra", newRa);
                                }}
                                className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-body focus:border-[#14a085] focus:outline-none"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="text"
                                value={ra.cpe || ""}
                                placeholder="CPE1..."
                                onChange={(e) => {
                                  const newRa = [...df_ra];
                                  newRa[idx].cpe = e.target.value;
                                  updateDataFrame("df_ra", newRa);
                                }}
                                className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-body focus:border-[#14a085] focus:outline-none"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex justify-between items-center text-body">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        const newRa = [...df_ra];
                        const newId = `RA${(newRa.length + 1).toString().padStart(2, '0')}`;
                        newRa.push({ id_ra: newId, peso_ra: 0, is_dual: false, desc_ra: "", comp_clave: "", cpe: "" });
                        updateDataFrame("df_ra", newRa);
                      }}
                      className="text-accent hover:text-[#1abc9c]"
                    >
                      <span>+</span> Añadir nuevo RA
                    </Button>

                    <Card className="px-4 py-2 inline-flex items-center gap-2 border-l-4 border-l-blue-500">
                      <span className="text-muted">Total suma % RA:</span>
                      <span className={`font-bold ${df_ra.reduce((sum: number, ra: any) => sum + (Number(ra.peso_ra) || 0), 0) === 100 ? 'text-success' : 'text-danger'}`}>
                        {df_ra.reduce((sum: number, ra: any) => sum + (Number(ra.peso_ra) || 0), 0).toFixed(0)}%
                      </span>
                    </Card>
                  </div>
                </Card>

                {/* Criterios de evaluación */}
                <Card className="p-6 border-t-4 border-t-yellow-500">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground">
                      <span><span className="inline-flex"><Puzzle className="w-[1.2em] h-[1.2em] mr-1" /></span></span> CE. Criterios de evaluación
                    </h2>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (allCeOpen) {
                          setOpenCEs(new Set());
                        } else {
                          setOpenCEs(new Set(df_ra.map((ra: any) => ra.id_ra)));
                        }
                        setAllCeOpen(!allCeOpen);
                      }}
                    >
                      <span>{allCeOpen ? '▲' : '▼'}</span>
                      {allCeOpen ? 'Colapsar todas' : 'Expandir todas'}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {df_ra.map((ra: any) => {
                      const ceForRa = df_ce.filter((ce: any) => ce.id_ra === ra.id_ra);
                      const totalPeso = ceForRa.reduce((sum: number, ce: any) => sum + (Number(ce.peso_ce) || 0), 0);

                      return (
                        <div key={ra.id_ra} className="group bg-foreground/5 rounded-lg border border-[var(--glass-border)] overflow-hidden transition-colors">
                          <div
                            onClick={() => {
                              const newSet = new Set(openCEs);
                              if (newSet.has(ra.id_ra)) newSet.delete(ra.id_ra);
                              else newSet.add(ra.id_ra);
                              setOpenCEs(newSet);
                            }}
                            className="p-4 cursor-pointer flex items-center justify-between font-semibold text-subheading select-none hover:bg-foreground/10 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-warning">{ra.id_ra}</span>
                              <span className="text-body text-muted font-normal truncate max-w-xl">{resolveDescRa(activeModuleId, ra)}</span>
                            </div>
                            <div className="flex items-center gap-6 text-body">
                              <span className="text-muted">{ceForRa.length} CE</span>
                              <span className={`px-2 py-1 rounded ${totalPeso === 100 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                Σ {totalPeso.toFixed(0)}%
                              </span>
                              <span className={`transition-transform duration-300 text-muted ${openCEs.has(ra.id_ra) ? 'rotate-180' : ''}`}>▼</span>
                            </div>
                          </div>

                          <AnimatePresence initial={false}>
                            {openCEs.has(ra.id_ra) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 border-t border-[var(--glass-border)] bg-foreground/10">
                                  <table className="w-full text-left text-body">
                                    <thead>
                                      <tr className="text-muted border-b border-[var(--glass-border)]">
                                        <th className="pb-2 w-24">CE</th>
                                        <th className="pb-2 w-24">% CE</th>
                                        <th className="pb-2">Criterio de Evaluación</th>
                                        <th className="pb-2 w-10"></th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {ceForRa.map((ce: any, ceIdx: number) => {
                                        const globalIdx = df_ce.findIndex((gCe: any) => gCe === ce);
                                        return (
                                          <tr key={ceIdx} className="border-b border-white/5 hover:bg-foreground/5">
                                            <td className="py-2 pr-2">
                                              <input
                                                type="text"
                                                value={ce.id_ce || ""}
                                                onChange={(e) => {
                                                  const newCe = [...df_ce];
                                                  newCe[globalIdx].id_ce = e.target.value;
                                                  updateDataFrame("df_ce", newCe);
                                                }}
                                                className="w-16 bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-warning focus:outline-none"
                                              />
                                            </td>
                                            <td className="py-2 pr-2">
                                              <input
                                                type="number"
                                                value={ce.peso_ce || 0}
                                                onChange={(e) => {
                                                  const newCe = [...df_ce];
                                                  const newVal = e.target.value === "" ? 0 : Math.round(parseFloat(e.target.value)) || 0;
                                                  newCe[globalIdx].peso_ce = newVal;

                                                  const raCeIndexes = df_ce.map((c: any, i: number) => c.id_ra === ra.id_ra ? i : -1).filter((i: number) => i !== -1);
                                                  const currentLocalIdx = raCeIndexes.indexOf(globalIdx);

                                                  if (currentLocalIdx < raCeIndexes.length - 1) {
                                                    let sumSoFar = 0;
                                                    for (let i = 0; i <= currentLocalIdx; i++) {
                                                      sumSoFar += Number(newCe[raCeIndexes[i]].peso_ce) || 0;
                                                    }

                                                    const targetTotal = 100;
                                                    let remaining = Math.max(0, targetTotal - sumSoFar);
                                                    const remainingCount = raCeIndexes.length - 1 - currentLocalIdx;

                                                    const baseShare = Math.floor(remaining / remainingCount);
                                                    let rem = Math.round(remaining - (baseShare * remainingCount));

                                                    for (let i = currentLocalIdx + 1; i < raCeIndexes.length; i++) {
                                                      newCe[raCeIndexes[i]].peso_ce = baseShare + (rem > 0 ? 1 : 0);
                                                      if (rem > 0) rem--;
                                                    }
                                                  }
                                                  updateDataFrame("df_ce", newCe);
                                                }}
                                                className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-warning focus:outline-none"
                                              />
                                            </td>
                                            <td className="py-2 pr-2">
                                              <input
                                                type="text"
                                                value={ce.desc_ce || ""}
                                                placeholder={resolveDescCe(activeModuleId, ce)}
                                                onChange={(e) => {
                                                  const newCe = [...df_ce];
                                                  newCe[globalIdx].desc_ce = e.target.value;
                                                  updateDataFrame("df_ce", newCe);
                                                }}
                                                className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-3 py-1 text-foreground focus:border-warning focus:outline-none"
                                              />
                                            </td>
                                            <td className="py-2 text-center">
                                              <button
                                                onClick={() => {
                                                  const newCe = [...df_ce];
                                                  newCe.splice(globalIdx, 1);
                                                  const raCeIndexes = newCe.map((c: any, i: number) => c.id_ra === ra.id_ra ? i : -1).filter((i: number) => i !== -1);
                                                  const count = raCeIndexes.length;
                                                  if (count > 0) {
                                                    const baseShare = Math.floor(100 / count);
                                                    let rem = 100 % count;
                                                    raCeIndexes.forEach(idx => {
                                                      newCe[idx].peso_ce = baseShare + (rem > 0 ? 1 : 0);
                                                      if (rem > 0) rem--;
                                                    });
                                                  }
                                                  updateDataFrame("df_ce", newCe);
                                                }}
                                                className="text-danger hover:text-danger font-bold"
                                                title="Eliminar CE"
                                              >
                                                ×
                                              </button>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                  <div className="mt-3">
                                    <button
                                      onClick={() => {
                                        const newCe = [...df_ce];
                                        newCe.push({
                                          id_ra: ra.id_ra,
                                          id_ce: `${ra.id_ra.replace('RA', 'CE')}.`,
                                          peso_ce: 0,
                                          desc_ce: ""
                                        });
                                        const raCeIndexes = newCe.map((c: any, i: number) => c.id_ra === ra.id_ra ? i : -1).filter((i: number) => i !== -1);
                                        const count = raCeIndexes.length;
                                        if (count > 0) {
                                          const baseShare = Math.floor(100 / count);
                                          let rem = 100 % count;
                                          raCeIndexes.forEach(idx => {
                                            newCe[idx].peso_ce = baseShare + (rem > 0 ? 1 : 0);
                                            if (rem > 0) rem--;
                                          });
                                        }
                                        updateDataFrame("df_ce", newCe);
                                      }}
                                      className="text-caption text-warning hover:text-warning font-semibold flex items-center gap-1"
                                    >
                                      <span>+</span> Añadir CE a {ra.id_ra}
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}

            {/* Tareas competenciales */}
            {activeTab === "competenciales" && (
              <div className="animate-in fade-in duration-500">
                <Card className="p-6 border-t-4 border-t-blue-500">
                  <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-6">
                    <span><span className="inline-flex"><Target className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Tareas competenciales
                  </h2>
                  <TaskTable
                    df_ud={df_ud}
                    df_tareas={df_tareas}
                    handleUpdateTarea={handleUpdateTarea}
                    handleAddTarea={handleAddTarea}
                    handleDeleteTarea={handleDeleteTarea}
                  />
                </Card>
              </div>
            )}

            {/* Unidades didácticas */}
            {activeTab === "unidades" && (
              <div className="animate-in fade-in duration-500 flex flex-col gap-8">
                <Card className="p-6 border-t-4 border-t-purple-500">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground">
                      <span><span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span></span> UD/T. Unidades didácticas o de trabajo
                    </h2>
                    <div className="flex items-center gap-3 text-[11px] font-semibold">
                      <div className="bg-info/10 text-info px-3 py-1.5 rounded-full border border-info/20 shadow-sm" title="Suma de las horas asignadas a cada UD">
                        Horas UDs: {df_ud.reduce((sum: number, ud: any) => sum + (Number(ud.horas_ud) || 0), 0)} h
                      </div>
                      <div className="bg-accent/10 text-accent px-3 py-1.5 rounded-full border border-accent/20 shadow-sm" title="Suma de las horas de todas las sesiones">
                        Horas Secuenciadas: {df_sesiones?.reduce((sum: number, s: any) => sum + (Number(s.Horas) || 0), 0) || 0} h
                      </div>
                      <div className="bg-foreground/10 text-foreground px-3 py-1.5 rounded-full border border-foreground/20 shadow-sm" title="Horas totales del módulo según currículo (BOA)">
                        Total BOA: {moduleData?.info_modulo?.h_boa || 0} h
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--glass-border)] text-body text-muted">
                          <th className="py-2 pr-0 sticky left-0 bg-background z-10 min-w-[44px] max-w-[44px]">UD/T</th>
                          <th className="py-2 px-0 sticky left-[44px] bg-background z-10 min-w-[80px] max-w-[80px] text-center">Horas</th>
                          <th className="py-2 pl-1 sticky left-[124px] bg-background z-10 min-w-[800px] w-[800px]">Unidad didáctica o de trabajo</th>
                          {df_ra.map((ra: any, i: number) => (
                            <th key={i} className="p-3 text-center min-w-[80px]">
                              <div className="text-caption">{ra.id_ra}</div>
                              <div className="text-caption text-info">({ra.peso_ra || 0}%)</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {df_ud.map((ud: any, idx: number) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-foreground/5 transition-colors">
                            <td className="py-2 pr-0 font-mono text-body sticky left-0 bg-background group-hover:bg-[#111827] min-w-[44px] max-w-[44px]">{ud.id_ud}</td>
                            <td className="py-2 px-0 sticky left-[44px] bg-background group-hover:bg-[#111827] min-w-[80px] max-w-[80px] text-center">
                              <input
                                type="number"
                                value={ud.horas_ud || 0}
                                onChange={(e) => {
                                  const newUd = [...df_ud];
                                  newUd[idx].horas_ud = parseFloat(e.target.value) || 0;
                                  updateDataFrame("df_ud", newUd);
                                }}
                                className="w-16 text-center bg-foreground/15 border border-[var(--glass-border)] rounded px-0 py-1 text-foreground text-body focus:border-info focus:outline-none"
                              />
                            </td>
                            <td className="py-2 pl-1 sticky left-[124px] bg-background group-hover:bg-[#111827] min-w-[800px] w-[800px]">
                              <input
                                type="text"
                                value={ud.desc_ud || ""}
                                onChange={(e) => {
                                  const newUd = [...df_ud];
                                  newUd[idx].desc_ud = e.target.value;
                                  updateDataFrame("df_ud", newUd);
                                }}
                                className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-3 py-1 text-foreground text-body focus:border-info focus:outline-none"
                              />
                            </td>
                            {df_ra.map((ra: any, raIdx: number) => {
                              const cellId = `${ud.id_ud}-${ra.id_ra}`;
                              const isSelected = selectedCells.has(cellId);
                              return (
                                <td
                                  key={raIdx}
                                  className={`p-3 text-center border transition-colors select-none ${isSelected ? 'bg-info/20 border-info' : 'border-transparent'}`}
                                  onMouseDown={() => {
                                    setIsDragging(true);
                                    setSelectedCells(new Set([cellId]));
                                  }}
                                  onMouseEnter={() => {
                                    if (isDragging) {
                                      const newSet = new Set(selectedCells);
                                      newSet.add(cellId);
                                      setSelectedCells(newSet);
                                    }
                                  }}
                                >
                                  <input
                                    type="number"
                                    value={ud[ra.id_ra] || ""}
                                    onChange={(e) => {
                                      const newUd = [...df_ud];
                                      (newUd[idx] as any)[ra.id_ra] = parseFloat(e.target.value) || 0;
                                      updateDataFrame("df_ud", newUd);
                                    }}
                                    onFocus={() => {
                                      if (!isDragging) setSelectedCells(new Set());
                                    }}
                                    className={`w-14 text-center border rounded px-1 py-1 text-body focus:outline-none ${isSelected ? 'bg-info/10 border-info text-info font-bold' : 'bg-foreground/15 border-[var(--glass-border)] text-foreground focus:border-info'}`}
                                    readOnly={selectedCells.size > 1 && isSelected}
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex justify-between items-center text-body">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          const newUd = [...df_ud];
                          const newId = `UD${(newUd.length + 1).toString().padStart(2, '0')}`;
                          newUd.push({ id_ud: newId, horas_ud: 0, desc_ud: "" });
                          updateDataFrame("df_ud", newUd);
                        }}
                        className="text-info hover:text-info"
                      >
                        <span>+</span> Añadir nueva UD
                      </Button>
                    </div>
                  </div>

                  {selectedCells.size > 1 && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-background border border-info shadow-2xl shadow-info/20 p-4 rounded-xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-4">
                      <span className="font-bold text-info">{selectedCells.size} celdas seleccionadas</span>
                      <input
                        type="number"
                        placeholder="Peso..."
                        value={selectionValue}
                        onChange={e => setSelectionValue(e.target.value)}
                        className="w-24 bg-foreground/10 border border-[var(--glass-border)] rounded px-3 py-2 focus:border-info focus:outline-none font-bold"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            const val = parseFloat(selectionValue) || 0;
                            const newUd = [...df_ud];
                            selectedCells.forEach(cellId => {
                              const [udId, raId] = cellId.split('-');
                              const udToUpdate = newUd.find(u => u.id_ud === udId);
                              if (udToUpdate) {
                                if (!udToUpdate.ra_mappings) udToUpdate.ra_mappings = {};
                                udToUpdate.ra_mappings[raId] = val;
                              }
                            });
                            updateDataFrame("df_ud", newUd);
                            setSelectedCells(new Set());
                            setSelectionValue("");
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          const val = parseFloat(selectionValue) || 0;
                          const newUd = [...df_ud];
                          selectedCells.forEach(cellId => {
                            const [udId, raId] = cellId.split('-');
                            const udToUpdate = newUd.find(u => u.id_ud === udId);
                            if (udToUpdate) {
                              if (!udToUpdate.ra_mappings) udToUpdate.ra_mappings = {};
                              udToUpdate.ra_mappings[raId] = val;
                            }
                          });
                          updateDataFrame("df_ud", newUd);
                          setSelectedCells(new Set());
                          setSelectionValue("");
                        }}
                        className="px-6"
                      >
                        Aplicar a {selectedCells.size} celdas
                      </Button>
                      <Button variant="ghost" onClick={() => setSelectedCells(new Set())} className="text-muted hover:text-foreground">
                        Cancelar
                      </Button>
                    </div>
                  )}
                </Card>

                <Card className="p-6 border-t-4 border-t-accent">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground">
                      <span><span className="inline-flex"><ClipboardList className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Secuenciación de UD
                    </h2>
                    <div className="flex gap-4">
                      <Button
                        variant="ghost"
                        onClick={generateAutoSessions}
                        className="text-purple-400 hover:text-purple-300 border border-purple-500/30 hover:border-purple-400/50 bg-purple-500/10"
                      >
                        <Wand2 className="w-4 h-4 mr-2" /> Autocompletar plan
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setAllUdsOpen(prev => !prev)}
                        className="text-body border border-[var(--glass-border)]"
                      >
                        <span>{allUdsOpen ? '▲' : '▼'}</span>
                        {allUdsOpen ? 'Colapsar todas' : 'Expandir todas'}
                      </Button>
                    </div>
                  </div>

                  {df_ud.length === 0 ? (
                    <div className="text-center py-12">
                      <ClipboardList className="w-16 h-16 text-muted-foreground opacity-50 mx-auto mb-4" />
                      <h3 className="text-subheading font-bold mb-2">No hay unidades didácticas</h3>
                      <p className="text-muted">Aún no has creado ninguna Unidad didáctica (UD).</p>
                      <p className="text-muted mt-1">Para secuenciar sesiones, primero debes crear las UDs más arriba.</p>
                    </div>
                  ) : (
                    <SessionTable
                      df_ud={df_ud}
                      df_sesiones={df_sesiones}
                      onDragEnd={onDragEndSesion}
                      handleUpdateSesion={handleUpdateSesion}
                      handleAddSesion={handleAddSesion}
                      handleDeleteSesion={handleDeleteSesion}
                      allUdsOpen={allUdsOpen}
                    />
                  )}
                </Card>
              </div>
            )}

            {/* ── Contribución de RA en OG ────────────────────────────────────── */}
            {activeTab === "contribucion-ra-og" && (
              <div className="animate-in fade-in duration-500">
                <RaOgMatrix />
              </div>
            )}




          </MotionWrapper>
        </main>
      </div>
      
      <ProposalLoaderModal 
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        activeModuleId={activeModuleId}
        onApplyProposal={handleApplyProposal}
      />
    </div>
      );
}

