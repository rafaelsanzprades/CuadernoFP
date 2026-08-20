"use client";
import { TabSync } from "@/components/ui/TabSync";
import { BarChart, Check, FileEdit, FolderOpen, Wrench, CheckSquare, Square, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { PageHeader } from "@/components/ui/PageHeader";
import { TabInfoBox } from "@/components/ui/TabInfoBox";
import Link from "next/link";
import { Settings2 } from "lucide-react";
import { InstrumentoConfigModal } from "@/components/features/instrumentos/InstrumentoConfigModal";
import { JegModeloTab } from "@/components/features/instrumentos/JegModeloTab";
import { Layers } from "lucide-react";
import { DEFAULT_INSTRUMENTOS_PCT } from "@/data/defaultInstrumentosPct";

const normalizeTipo = (t: string) => {
  if (!t) return "Exámenes teóricos";
  if (t === "Teoria") return "Exámenes teóricos";
  if (t === "Practica") return "Exámenes prácticos";
  if (t === "Informes") return "Informes de ejercicios";
  if (t === "Tareas") return "Cuaderno de tareas";
  if (t === "Recuperacion") return "Recuperaciones";
  return t;
};

export default function InstrumentosPage() {
  const { activeModuleId, moduleData, setModuleData, updateDataFrame, saveModuleData } = useAppStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const TABS = [
    { id: "resumen", label:  <span className="flex items-center gap-2"><BarChart className="w-4 h-4 shrink-0" /> {t('tabs.resumen')}</span>, cleanLabel: t('tabs.resumen') },
    { id: "tri1", label:  <span className="flex items-center gap-2"><FileEdit className="w-4 h-4 shrink-0" /> {t('tabs.tri1')}</span>, cleanLabel: t('tabs.tri1') },
    { id: "tri2", label:  <span className="flex items-center gap-2"><FileEdit className="w-4 h-4 shrink-0" /> {t('tabs.tri2')}</span>, cleanLabel: t('tabs.tri2') },
    { id: "tri3", label:  <span className="flex items-center gap-2"><FileEdit className="w-4 h-4 shrink-0" /> {t('tabs.tri3')}</span>, cleanLabel: t('tabs.tri3') },
    { id: "modelo-jeg", label: <span className="flex items-center gap-2"><Layers className="w-4 h-4 shrink-0 text-purple-400" /> {t('tabs.instrumentos.modeloJeg.label', {defaultValue: 'Modelo JEG'})}</span>, cleanLabel: t('tabs.instrumentos.modeloJeg.label', {defaultValue: 'Modelo JEG'}) }
  ];const [activeTab, setActiveTab] = useState("resumen");const activeTabCleanLabel = TABS.find(tab => tab.id === activeTab)?.cleanLabel;

  const TAB_DESCRIPTIONS: Record<string, string> = {
    resumen: t('tabs.instrumentos.resumen.desc', {defaultValue: 'Visión global de los instrumentos de evaluación utilizados. RD 659/2023 (Art. 136)'}),
    tri1: t('tabs.instrumentos.tri1.desc', {defaultValue: 'Instrumentos de evaluación planificados para el 1er trimestre.'}),
    tri2: t('tabs.instrumentos.tri2.desc', {defaultValue: 'Instrumentos de evaluación planificados para el 2º trimestre.'}),
    tri3: t('tabs.instrumentos.tri3.desc', {defaultValue: 'Instrumentos de evaluación planificados para el 3er trimestre.'}),
    "modelo-jeg": t('tabs.instrumentos.modeloJeg.desc', {defaultValue: 'Modelo experimental de calificación por indicadores: indicadores por CE, instrumentos JEG y cálculo de nota ordinaria, de recuperación y extraordinaria por alumno.'}),
  };

  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [recoveryTri, setRecoveryTri] = useState<string>("");
  const [recoverySourceId, setRecoverySourceId] = useState<string>("");
  const [recoveryMethod, setRecoveryMethod] = useState<string>("Sobrescribir");

  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [activeConfigActIdx, setActiveConfigActIdx] = useState<number | null>(null);

  // Edición masiva de la matriz criterio<->instrumento (decisión F, Fase 2, ver
  // RF Ideas/propuesta-motor-calificacion-2026-08-16.md). Arrastrar sobre varias
  // celdas las selecciona (sin cambiar su valor todavía); un clic simple sin
  // arrastre sigue alternando esa única celda al vuelo, como siempre.
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const isDraggingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const dragStartCellRef = useRef<string | null>(null);

  useEffect(() => {
    const onMouseUp = () => {
      if (isDraggingRef.current && !dragMovedRef.current) {
        // Fue un clic simple, sin arrastre real: alterna esa única celda.
        // updateDataFrame se llama directamente aquí (no anidado dentro de un
        // updater de setState de otro componente) para evitar el aviso de
        // React "Cannot update a component while rendering a different component".
        const only = dragStartCellRef.current;
        if (only) {
          const currentAct = moduleData?.df_act || [];
          const [globalIdxStr, ce] = only.split("::");
          const globalIdx = Number(globalIdxStr);
          const current = currentAct[globalIdx]?.[ce] === true;
          const newAct = [...currentAct];
          newAct[globalIdx] = { ...newAct[globalIdx], [ce]: !current };
          updateDataFrame("df_act", newAct);
        }
        setSelectedCells(new Set());
      }
      isDraggingRef.current = false;
      dragMovedRef.current = false;
      dragStartCellRef.current = null;
    };
    window.addEventListener("mouseup", onMouseUp);
    return () => window.removeEventListener("mouseup", onMouseUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleData]);

  const cellKey = (globalIdx: number, ce: string) => `${globalIdx}::${ce}`;

  const handleCellMouseDown = (globalIdx: number, ce: string) => {
    isDraggingRef.current = true;
    dragMovedRef.current = false;
    dragStartCellRef.current = cellKey(globalIdx, ce);
    setSelectedCells(new Set([cellKey(globalIdx, ce)]));
  };

  const handleCellMouseEnter = (globalIdx: number, ce: string) => {
    if (!isDraggingRef.current) return;
    dragMovedRef.current = true;
    setSelectedCells((prev) => new Set(prev).add(cellKey(globalIdx, ce)));
  };

  const applyBulkSelection = (value: boolean) => {
    const currentAct = moduleData?.df_act || [];
    const newAct = [...currentAct];
    selectedCells.forEach((key) => {
      const [globalIdxStr, ce] = key.split("::");
      const globalIdx = Number(globalIdxStr);
      newAct[globalIdx] = { ...newAct[globalIdx], [ce]: value };
    });
    updateDataFrame("df_act", newAct);
    setSelectedCells(new Set());
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeModuleId && !moduleData) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/module/${activeModuleId}`);
          const data = await res.json();
          if (data.status === "success") setModuleData(data.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
      setLoading(false);
    };

    if (activeModuleId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [activeModuleId, moduleData, setModuleData]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage("");
    const ok = await saveModuleData();
    if (ok) {
      setSaveMessage("Guardado correctamente");
      setTimeout(() => setSaveMessage(""), 3000);
    } else {
      setSaveMessage("Error al guardar");
    }
    setSaving(false);
  };

  if (!activeModuleId) {
    return (
      <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header breadcrumbSuffix={activeTabCleanLabel} />
          <main id="main-content" tabIndex={-1} className="flex-1 p-8 content-area">
            <MotionWrapper>
              <Card className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl">
                <FileEdit className="w-16 h-16 text-muted-foreground opacity-50" />
                <h2 className="text-heading font-bold">No hay programación cargada</h2>
                <p className="text-muted mb-4">Debes abrir o crear un archivo de programación en tu Archivos.</p>
                <Link href="/archivos">
                  <Button variant="primary" className="gap-2">
                    <FolderOpen className="w-4 h-4" /> {t('common.ir_a_mis_archivos', {defaultValue: 'Ir a mis archivos'})}
                  </Button>
                </Link>
              </Card>
            </MotionWrapper>
          </main>
        </div>
      </div>
    );
  }

  if (loading || !moduleData) {
    return <LoadingSpinner text="Cargando..." />;
  }

  const df_ce = moduleData?.df_ce || [];
  const df_act = moduleData?.df_act || [];
  
  const instrumentosPct = (moduleData?.instrumentos_pct_trimestre && moduleData.instrumentos_pct_trimestre.length > 0)
    ? moduleData.instrumentos_pct_trimestre
    : DEFAULT_INSTRUMENTOS_PCT;

  const ce_clean = df_ce.filter((ce: any) => ce.id_ce && ce.id_ce.trim() !== "");
  const lista_ce_ids = ce_clean.map((ce: any) => ce.id_ce);

  const trimestres = [
    { key: "1T", nombre: "1er trimestre", pctField: "pct_1t" },
    { key: "2T", nombre: "2º trimestre", pctField: "pct_2t" },
    { key: "3T", nombre: "3er trimestre", pctField: "pct_3t" }
  ];

  const handleUpdateAct = (globalIdx: number, field: string, value: any) => {
    const newAct = [...df_act];
    newAct[globalIdx][field] = value;
    updateDataFrame("df_act", newAct);
  };

  const handleAddAct = (tri: string) => {
    const newAct = [...df_act];
    const newId = `ACT${(newAct.length + 1).toString().padStart(2, '0')}`;
    const newEntry: any = {
      id_act: newId,
      tri_act: tri,
      Tipo: "Teoria",
      desc_act: "",
      ce_vinc: "",
      peso_act: 0,
      crit_calif: "",
      is_active: true
    };
    lista_ce_ids.forEach((ce: string) => newEntry[ce] = false);
    newAct.push(newEntry);
    updateDataFrame("df_act", newAct);
  };

  const renderTrimestreTab = (triKey: string, triNombre: string) => {
    if (lista_ce_ids.length === 0) {
      return (
        <Card className="p-6 border-l-4 border-l-yellow-500">
          <h3 className="text-subheading font-bold text-warning mb-2">Faltan criterios de evaluación</h3>
          <p className="text-foreground/80">Primero añade Criterios de evaluación en la pestaña 'Matrices'.</p>
        </Card>
      );
    }

    const actTri = df_act.filter((act: any) => String(act.tri_act).toUpperCase() === triKey);
    const sumaPeso = actTri.reduce((sum: number, act: any) => sum + (Number(act.peso_act) || 0), 0);

    return (
      <div className="space-y-3 animate-in fade-in duration-500">
                              
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-heading font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <span className="inline-flex"><FileEdit className="w-[1.2em] h-[1.2em] mr-1" /></span> Instrumentos de Evaluación - {triNombre}
            </h2>
            <p className="text-muted mt-1">Detalle de los instrumentos de evaluación organizados para este trimestre.</p>
          </div>
          <div className="flex items-center gap-6 text-body">
            <span className="text-muted">{actTri.length} actividades</span>
            <span className="text-info font-mono bg-info/10 px-4 py-2 rounded-lg text-subheading">Σ {sumaPeso.toFixed(0)}%</span>
          </div>
        </div>

        <div className="bg-foreground/5 rounded-lg border border-[var(--glass-border)] overflow-hidden">
          <div className="p-4 bg-foreground/10 overflow-x-auto">
            <table className="w-full text-left text-body border-collapse whitespace-nowrap">
              <thead>
                <tr className="text-muted border-b border-[var(--glass-border)] bg-background">
                  <th className="p-2 sticky left-0 z-10 border-r border-[var(--glass-border)] bg-background">Cód.</th>
                  <th className="p-2 sticky left-[60px] z-10 border-r border-[var(--glass-border)] bg-background">Tipo</th>
                  <th className="p-2 sticky left-[160px] z-10 border-r border-[var(--glass-border)] bg-background w-64">Instrumento / Actividad</th>
                  <th className="p-2 sticky left-[416px] z-10 border-r border-[var(--glass-border)] bg-background w-24">% Pond.</th>
                  <th className="p-2 sticky left-[486px] z-10 border-r border-[var(--glass-border)] bg-background"><span className="inline-flex"><Check className="w-[1.2em] h-[1.2em] mr-1" /></span></th>
                  {lista_ce_ids.map((ce: string) => (
                    <th key={ce} className="p-2 text-center text-caption font-mono border-r border-[var(--glass-border)] text-info">
                      {ce}
                    </th>
                  ))}
                  <th className="p-2 text-center border-r border-[var(--glass-border)]">Config</th>
                  <th className="p-2 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {actTri.map((act: any) => {
                  const globalIdx = df_act.findIndex((gAct: any) => gAct === act);
                  return (
                    <tr key={globalIdx} className="border-b border-white/5 hover:bg-foreground/5">
                      <td className="p-2 font-mono sticky left-0 z-10 border-r border-[var(--glass-border)] bg-background group-hover:bg-[#111827]">{act.id_act}</td>
                      <td className="p-2 sticky left-[60px] z-10 border-r border-[var(--glass-border)] bg-background group-hover:bg-[#111827]">
                        <select 
                          value={normalizeTipo(act.Tipo)}
                          onChange={(e) => handleUpdateAct(globalIdx, "Tipo", e.target.value)}
                          className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-info focus:outline-none appearance-none"
                        >
                          {instrumentosPct.map((instr: any) => (
                            <option key={instr.id} value={instr.nombre}>{instr.nombre}</option>
                          ))}
                          <option value="Recuperaciones">Recuperaciones</option>
                        </select>
                      </td>
                      <td className="p-2 sticky left-[160px] z-10 border-r border-[var(--glass-border)] bg-background group-hover:bg-[#111827]">
                        <input 
                          type="text"
                          value={act.desc_act || ""}
                          onChange={(e) => handleUpdateAct(globalIdx, "desc_act", e.target.value)}
                          className="w-full min-w-[200px] bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-info focus:outline-none"
                        />
                      </td>
                      <td className="p-2 sticky left-[416px] z-10 border-r border-[var(--glass-border)] bg-background group-hover:bg-[#111827]">
                        <div className="relative">
                          <input
                            type="number"
                            value={act.peso_act || 0}
                            onChange={(e) => handleUpdateAct(globalIdx, "peso_act", Number(e.target.value) || 0)}
                            className="w-16 bg-foreground/15 border border-[var(--glass-border)] rounded pl-2 pr-4 py-1 text-foreground focus:border-info focus:outline-none"
                          />
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted text-caption pointer-events-none">%</span>
                        </div>
                      </td>
                      <td className="p-2 text-center sticky left-[486px] z-10 border-r border-[var(--glass-border)] bg-background group-hover:bg-[#111827]">
                        <input 
                          type="checkbox"
                          checked={act.is_active !== false}
                          onChange={(e) => handleUpdateAct(globalIdx, "is_active", e.target.checked)}
                          className="accent-indigo-500"
                        />
                      </td>
                      {lista_ce_ids.map((ce: string) => {
                        const isSelected = selectedCells.has(cellKey(globalIdx, ce));
                        return (
                          <td
                            key={ce}
                            onMouseDown={(e) => { e.preventDefault(); handleCellMouseDown(globalIdx, ce); }}
                            onMouseEnter={() => handleCellMouseEnter(globalIdx, ce)}
                            className={`p-2 text-center border-r border-[var(--glass-border)] select-none cursor-pointer transition-colors ${isSelected ? 'bg-purple-500/30 ring-1 ring-inset ring-purple-400' : 'bg-foreground/5 hover:bg-purple-500/10'}`}
                          >
                            <input
                              type="checkbox"
                              checked={act[ce] === true}
                              readOnly
                              className="accent-indigo-500 pointer-events-none"
                            />
                          </td>
                        );
                      })}
                      <td className="p-2 text-center border-r border-[var(--glass-border)] bg-foreground/5">
                        <button
                          onClick={() => {
                            setActiveConfigActIdx(globalIdx);
                            setConfigModalOpen(true);
                          }}
                          className="p-1.5 rounded text-muted hover:text-indigo-400 hover:bg-white/10 transition-colors"
                          title={t('tooltips.instrumentos.configuracionAvanzada', {defaultValue: 'Configuración avanzada'})}
                        >
                          <Settings2 className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => {
                            const newAct = [...df_act];
                            newAct.splice(globalIdx, 1);
                            updateDataFrame("df_act", newAct);
                          }}
                          className="text-danger hover:text-danger font-bold px-2"
                          title={t('tooltips.instrumentos.eliminarActividad', {defaultValue: 'Eliminar actividad'})}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-4 flex flex-wrap gap-4">
              <Button 
                variant="ghost"
                onClick={() => handleAddAct(triKey)}
                className="text-info hover:text-info font-semibold flex items-center gap-1"
              >
                <span>+</span> {t('botones.instrumentos.anadirInstrumentoEn', {tri: triNombre, defaultValue: `Añadir instrumento/actividad en ${triNombre}`})}
              </Button>
              <Button 
                variant="ghost"
                onClick={() => {
                  setRecoveryTri(triKey);
                  setIsRecoveryModalOpen(true);
                  setRecoverySourceId("");
                }}
                className="text-danger hover:text-danger border border-danger/30 font-semibold flex items-center gap-1"
              >
                ⛑️ {t('botones.instrumentos.crearInstrumentoRecuperacion', {defaultValue: 'Crear instrumento de recuperación'})}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />

        <main className="flex-1 p-8 content-area overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-4 pb-12">
            <PageHeader
              icon={Wrench}
              title={t('nav.instrumentos', {defaultValue: 'Instrumento'})}
              description={t('pages.instrumentos_desc')}
            />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="max-w-full">
                {TABS.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <TabInfoBox description={TAB_DESCRIPTIONS[activeTab] || 'Gestión de ' + activeTab} />

          {activeTab === "resumen" && (
            <>
                
            <Card className="p-6 animate-in fade-in duration-500">
              <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-5">
                <span><span className="inline-flex"><BarChart className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Resumen de instrumentos de evaluación por trimestres
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-body border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--glass-border)]">
                      <th className="p-3 text-left text-muted font-semibold w-[14%]">Tipo</th>
                      <th className="p-3 text-left text-muted font-semibold w-[30%]">Descripción del Instrumento de Evaluación (IE)</th>
                      {trimestres.map(tri => (
                        <th key={tri.key} className="p-3 text-center text-muted font-semibold border-l border-[var(--glass-border)] w-[14%]">{tri.nombre}</th>
                      ))}
                      <th className="p-3 text-center text-muted font-semibold border-l border-[var(--glass-border)] w-[14%]">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ...instrumentosPct.filter((instr: any) => instr.categoria !== "Recuperaciones").map((instr: any, i: number) => ({
                        id: instr.nombre,
                        categoria: instr.categoria || "Teoría",
                        label: instr.nombre,
                        pct_1t: instr.pct_1t,
                        pct_2t: instr.pct_2t,
                        pct_3t: instr.pct_3t,
                        bgClass: [
                          "bg-info/10 text-info",
                          "bg-success/10 text-success",
                          "bg-warning/10 text-warning",
                          "bg-purple-500/10 text-purple-500",
                          "bg-pink-500/10 text-pink-500",
                          "bg-indigo-500/10 text-indigo-500"
                        ][i % 6]
                      })),
                      (() => {
                        const recup = instrumentosPct.find((instr: any) => instr.categoria === "Recuperaciones");
                        return {
                          id: "Recuperaciones",
                          categoria: "Recuperaciones",
                          label: "Recuperaciones",
                          pct_1t: recup?.pct_1t ?? 0,
                          pct_2t: recup?.pct_2t ?? 0,
                          pct_3t: recup?.pct_3t ?? 0,
                          bgClass: "bg-danger/10 text-danger"
                        };
                      })()
                    ].map(tipo => {
                      const totalTipo = df_act.filter((a: any) => normalizeTipo(a.Tipo) === tipo.id).length;
                      return (
                        <tr key={tipo.id} className="border-b border-white/5 hover:bg-foreground/5 transition-colors">
                          <td className="p-3 font-semibold text-foreground">{tipo.categoria}</td>
                          <td className="p-3 font-semibold text-foreground">{tipo.label}</td>
                          {trimestres.map(tri => {
                            const count = df_act.filter((a: any) => String(a.tri_act).toUpperCase() === tri.key && normalizeTipo(a.Tipo) === tipo.id).length;
                            const pct = Number((tipo as any)[tri.pctField]) || 0;
                            return (
                              <td key={tri.key} className="p-3 text-center border-l border-[var(--glass-border)]">
                                <span className={`${tipo.bgClass} font-bold text-subheading px-3 py-1 rounded-lg inline-flex items-center justify-center gap-2 min-w-[40px]`}>
                                  <span>{count}</span>
                                  <span>-</span>
                                  <span>{pct}%</span>
                                </span>
                              </td>
                            );
                          })}
                          <td className="p-3 text-center border-l border-[var(--glass-border)]">
                            <span className={`${tipo.bgClass} font-extrabold text-heading px-4 py-1.5 rounded-lg inline-block min-w-[50px]`}>{totalTipo}</span>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="border-t-2 border-[var(--glass-border)] bg-foreground/5">
                      <td colSpan={2} className="p-4 font-extrabold text-foreground text-subheading">Total</td>
                      {trimestres.map(tri => {
                        const countTri = df_act.filter((a: any) => String(a.tri_act).toUpperCase() === tri.key).length;
                        return (
                          <td key={tri.key} className="p-4 text-center border-l border-[var(--glass-border)]">
                            <span className="bg-foreground/10 text-foreground font-extrabold text-heading px-4 py-1.5 rounded-lg inline-block min-w-[50px]">{countTri}</span>
                          </td>
                        );
                      })}
                      <td className="p-4 text-center border-l border-[var(--glass-border)]">
                        <span className="bg-foreground/20 text-foreground font-extrabold text-heading px-4 py-1.5 rounded-lg inline-block min-w-[50px]">{df_act.length}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
            </>
          )}

          {activeTab === "tri1" && renderTrimestreTab("1T", "1er trimestre")}
          {activeTab === "tri2" && renderTrimestreTab("2T", "2º trimestre")}
          {activeTab === "tri3" && renderTrimestreTab("3T", "3er trimestre")}
          {activeTab === "modelo-jeg" && <JegModeloTab />}
        
        {activeConfigActIdx !== null && df_act[activeConfigActIdx] && (
          <InstrumentoConfigModal 
            isOpen={configModalOpen}
            onClose={() => { setConfigModalOpen(false); setActiveConfigActIdx(null); }}
            instrumentoId={df_act[activeConfigActIdx].id_act}
            instrumentoDesc={df_act[activeConfigActIdx].desc_act}
            config={{
              escala: df_act[activeConfigActIdx].escala,
              agente: df_act[activeConfigActIdx].agente,
              recuperacion: df_act[activeConfigActIdx].recuperacion
            }}
            onChange={(field, value) => handleUpdateAct(activeConfigActIdx, field, value)}
          />
        )}
          </MotionWrapper>
        </main>
      </div>

      {isRecoveryModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="recovery-modal-title"
        >
          <Card className="max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 id="recovery-modal-title" className="text-subheading font-bold mb-4 flex items-center gap-2">
              ⛑️ {t('botones.instrumentos.crearRecuperacionTri', {tri: recoveryTri, defaultValue: `Crear recuperación (${recoveryTri})`})}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-body font-semibold mb-1">Actividad original a recuperar</label>
                <select 
                  className="w-full bg-foreground/10 border border-[var(--glass-border)] rounded-lg p-2"
                  value={recoverySourceId}
                  onChange={e => setRecoverySourceId(e.target.value)}
                >
                  <option value="">-- Selecciona actividad --</option>
                  {df_act.filter((a: any) => String(a.tri_act).toUpperCase() === recoveryTri && a.Tipo !== "Recuperacion").map((a: any) => (
                    <option key={a.id_act} value={a.id_act}>{a.id_act} - {a.desc_act || "Sin nombre"}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-body font-semibold mb-1">Método de cálculo</label>
                <select 
                  className="w-full bg-foreground/10 border border-[var(--glass-border)] rounded-lg p-2"
                  value={recoveryMethod}
                  onChange={e => setRecoveryMethod(e.target.value)}
                >
                  <option value="Sobrescribir">Sobrescribir nota si es mayor</option>
                  <option value="Media">Hacer media con la nota anterior</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="ghost" onClick={() => setIsRecoveryModalOpen(false)}>{t('common.cancelar', {defaultValue: 'Cancelar'})}</Button>
                <Button 
                  disabled={!recoverySourceId}
                  onClick={() => {
                    const sourceAct = df_act.find((a: any) => a.id_act === recoverySourceId);
                    if (!sourceAct) return;
                    const newAct = [...df_act];
                    const newId = `ACT${(newAct.length + 1).toString().padStart(2, '0')}`;
                    const newEntry = {
                      ...sourceAct,
                      id_act: newId,
                      desc_act: `Recup. ${sourceAct.desc_act || sourceAct.id_act} (${recoveryMethod})`,
                      Tipo: "Recuperacion",
                      peso_act: sourceAct.peso_act || 0
                    };
                    newAct.push(newEntry);
                    updateDataFrame("df_act", newAct);
                    setIsRecoveryModalOpen(false);
                  }}
                  className="bg-danger hover:bg-danger/80 text-white border-none"
                >
                  {t('botones.instrumentos.crearRecuperacion', {defaultValue: 'Crear recuperación'})}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {selectedCells.size > 1 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#1e293b] border border-purple-400/40 shadow-2xl rounded-xl px-5 py-3">
          <span className="text-body font-semibold text-foreground">{selectedCells.size} celdas seleccionadas</span>
          <Button variant="secondary" className="gap-1.5" onClick={() => applyBulkSelection(true)}>
            <CheckSquare className="w-4 h-4" /> {t('botones.instrumentos.marcarTodas', {defaultValue: 'Marcar todas'})}
          </Button>
          <Button variant="secondary" className="gap-1.5" onClick={() => applyBulkSelection(false)}>
            <Square className="w-4 h-4" /> {t('botones.instrumentos.desmarcarTodas', {defaultValue: 'Desmarcar todas'})}
          </Button>
          <button
            onClick={() => setSelectedCells(new Set())}
            className="p-1.5 rounded text-muted hover:text-foreground hover:bg-white/10 transition-colors"
            title={t('tooltips.instrumentos.cancelarSeleccion', {defaultValue: 'Cancelar selección'})}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
      );
}

