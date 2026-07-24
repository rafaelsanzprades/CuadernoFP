"use client";
import { TabSync } from "@/components/ui/TabSync";
import { useTranslation } from "react-i18next";
import { Calendar, FileEdit, MapPin, ClipboardCheck, AlertTriangle , Info, FolderOpen } from "lucide-react";
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { useDynamicPlanning } from "@/hooks/useDynamicPlanning";
import { AsistenciaTab } from "@/components/features/diario/AsistenciaTab";
import { AlertaAbandonoTab } from "@/components/features/diario/AlertaAbandonoTab";
import { FeoeTab } from "@/components/features/alumnado/FeoeTab";
import { TutoriaTab } from "@/components/features/alumnado/TutoriaTab";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function SeguimientoPage() {
  const { activeModuleId, moduleData, setModuleData, activeCursoId, cursoData, setCursoData, updateCursoData, saveCursoData } = useAppStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [allDiarioOpen, setAllDiarioOpen] = useState(false);

  const TABS = [
    { id: "tutoria", label: <span className="flex items-center gap-2"><ClipboardCheck className="w-4 h-4 shrink-0" /> {t('tabs.tutoria')}</span>, cleanLabel: t('tabs.tutoria') },
    { id: "asistencia", label: <span className="flex items-center gap-2"><ClipboardCheck className="w-4 h-4 shrink-0" /> {t('tabs.asistencia')}</span>, cleanLabel: t('tabs.asistencia') },
    { id: "alerta_abandono", label: <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" /> {t('tabs.abandono')}</span>, cleanLabel: t('tabs.abandono') },
    { id: "feoe", label: <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" /> {t('tabs.feoe')}</span>, cleanLabel: t('tabs.feoe') }
  ];
  const [activeTab, setActiveTab] = useState("tutoria");
  const activeTabCleanLabel = TABS.find(t_tab => t_tab.id === activeTab)?.cleanLabel;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeModuleId && !moduleData) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/module/${activeModuleId}`);
          const data = await res.json();
          if (data.status === "success") setModuleData(data.data);
        }
        if (activeCursoId && !cursoData) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/module/${activeCursoId}`);
          const data = await res.json();
          if (data.status === "success") setCursoData(data.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
      setLoading(false);
    };

    if (activeModuleId || activeCursoId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [activeModuleId, moduleData, activeCursoId, cursoData]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage("");
    const ok = await saveCursoData();
    if (ok) {
      setSaveMessage("Guardado correctamente");
      setTimeout(() => setSaveMessage(""), 3000);
    } else {
      setSaveMessage("Error al guardar");
    }
    setSaving(false);
  };

  if (!activeModuleId || !activeCursoId) {
    return (
      <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header breadcrumbSuffix={activeTabCleanLabel} />
          <main id="main-content" tabIndex={-1} className="flex-1 p-8 content-area">
            <MotionWrapper>
              <div className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl">
                <ClipboardCheck className="w-16 h-16 text-muted-foreground opacity-50" />
                <h2 className="text-2xl font-bold">No hay curso ni programación cargada</h2>
                <p className="text-muted mb-4">Debes abrir o crear un archivo de programación y curso en tu Archivos.</p>
                <Link href="/archivos">
                  <Button variant="primary" className="gap-2">
                    <FolderOpen className="w-4 h-4" /> Ir a mis Archivos
                  </Button>
                </Link>
              </div>
            </MotionWrapper>
          </main>
        </div>
      </div>
    );
  }

  const { df_sgmt, planningLedger } = useDynamicPlanning();

  if (loading || !moduleData || !cursoData) {
    return <LoadingSpinner text="Cargando datos de seguimiento..." />;
  }
  const daily_ledger = cursoData?.daily_ledger || {};
  const planning_ledger = planningLedger;
  const info_fechas = cursoData?.info_fechas || {};
  const horario = cursoData?.horario || {};
  const calendar_notes = cursoData?.calendar_notes || {};

  // Calculo de horas sin docencia
  let h_real_total = 0;
  let h_sin_docencia = 0;
  const dias_semana_list = ["Lun", "Mar", "Mié", "Jue", "Vie"];

  const processTrimestre = (ini_str: string, fin_str: string) => {
    if (!ini_str || !fin_str) return;
    const ini = new Date(ini_str);
    const fin = new Date(fin_str);
    let curr = new Date(ini);

    while (curr <= fin) {
      if (curr.getDay() >= 1 && curr.getDay() <= 5) {
        const diaSemana = dias_semana_list[curr.getDay() - 1];
        const dateStr = curr.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

        if (!calendar_notes[`f_${dateStr}`]) {
          const h_dia = Number(horario[diaSemana]) || 0;
          h_real_total += h_dia;
          if (daily_ledger[dateStr]?.sin_docencia) {
            h_sin_docencia += h_dia;
          }
        }
      }
      curr.setDate(curr.getDate() + 1);
    }
  };

  processTrimestre(info_fechas.ini_1t, info_fechas.fin_1t);
  processTrimestre(info_fechas.ini_2t, info_fechas.fin_2t);
  processTrimestre(info_fechas.ini_3t, info_fechas.fin_3t);

  const meses_display = ["Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun"];
  const meses_nombres = { "Sep": "Septiembre", "Oct": "Octubre", "Nov": "Noviembre", "Dic": "Diciembre", "Ene": "Enero", "Feb": "Febrero", "Mar": "Marzo", "Abr": "Abril", "May": "Mayo", "Jun": "Junio" };
  const meses_num: any = { "Sep": 9, "Oct": 10, "Nov": 11, "Dic": 12, "Ene": 1, "Feb": 2, "Mar": 3, "Abr": 4, "May": 5, "Jun": 6 };

  const getLectivosMes = (mes_num: number) => {
    const lectivos: Date[] = [];
    const checkFechas = (ini_str: string, fin_str: string) => {
      if (!ini_str || !fin_str) return;
      const ini = new Date(ini_str);
      const fin = new Date(fin_str);
      let curr = new Date(ini);
      while (curr <= fin) {
        if (curr.getMonth() + 1 === mes_num && curr.getDay() >= 1 && curr.getDay() <= 5) {
          const diaSemana = dias_semana_list[curr.getDay() - 1];
          const dateStr = curr.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
          if (!calendar_notes[`f_${dateStr}`] && (Number(horario[diaSemana]) || 0) > 0) {
            lectivos.push(new Date(curr));
          }
        }
        curr.setDate(curr.getDate() + 1);
      }
    };
    checkFechas(info_fechas.ini_1t, info_fechas.fin_1t);
    checkFechas(info_fechas.ini_2t, info_fechas.fin_2t);
    checkFechas(info_fechas.ini_3t, info_fechas.fin_3t);
    return lectivos;
  };

  const handleLedgerChange = (dateStr: string, field: string, value: any) => {
    const newLedger = { ...daily_ledger };
    if (!newLedger[dateStr]) {
      newLedger[dateStr] = { sin_docencia: false, seguimiento: "", publico: false };
    }
    newLedger[dateStr][field] = value;
    updateCursoData("daily_ledger", newLedger);
  };

  const infoMap: Record<string, {title: string, desc: string}> = {
    'tutoria': { title: 'Tutoría', desc: 'Gestión de tutorías con el alumnado.' },
    'asistencia': { title: 'Asistencia', desc: 'Registro y control de faltas y retrasos del alumnado.' },
    'alerta_abandono': { title: 'Alerta de abandono', desc: 'Sistema de detección temprana y protocolo de abandono.' },
    'feoe': { title: 'FEOE', desc: 'Ficha de Evaluación Orientadora y Evolutiva.' }
  };
  const currentInfo = infoMap[activeTab] || { title: 'Herramienta operativa', desc: 'Gestión de ' + activeTab };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />

        <main className="flex-1 p-8 content-area overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-4">
            <div>
              <h1 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <span className="inline-flex"><MapPin className="w-[1.2em] h-[1.2em] mr-1" /></span> Seguimiento
              </h1>
              <p className="text-muted mt-2 text-sm">Tutoría, asistencia, abandonos y FEOE.</p>
            </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-2 max-w-full">
              {TABS.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>


                  <div className='flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6'>
                    <Info className='w-5 h-5 text-accent mt-0.5 shrink-0' />
                    <div>
                      <p className="text-sm text-muted">{currentInfo.desc}</p>
                    </div>
                  </div>
          {activeTab === "tutoria" && <TutoriaTab />}

          {activeTab === "asistencia" && (
            <AsistenciaTab />
          )}

          {activeTab === "alerta_abandono" && (
            <AlertaAbandonoTab />
          )}

          {activeTab === "feoe" && <FeoeTab />}

          </MotionWrapper>
        </main>
      </div>
    </div>
      );
}

