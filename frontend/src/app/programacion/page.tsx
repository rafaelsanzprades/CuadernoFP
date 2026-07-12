"use client";
import { TabSync } from "@/components/ui/TabSync";
import { BookOpen, ClipboardList, Target , Info, FolderOpen } from "lucide-react";
import React, { useState , useEffect} from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { useModule } from "@/hooks/useApi";
import { SessionTable } from "@/components/features/programacion/SessionTable";
import { TaskTable } from "@/components/features/programacion/TaskTable";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { useTranslation } from "react-i18next";


export default function ProgramacionPage() {
  const { activeModuleId, moduleData, updateDataFrame } = useAppStore();
  const { isLoading } = useModule(activeModuleId);
  const { t } = useTranslation();
  const [allUdsOpen, setAllUdsOpen] = useState(false);

  const TABS = [
    { id: "secuenciacion", label:  <span className="flex items-center gap-2"><ClipboardList className="w-4 h-4 shrink-0" /> {t('tabs.secuenciacion')}</span>, cleanLabel: t('tabs.secuenciacion') },
    { id: "tareas", label:  <span className="flex items-center gap-2"><Target className="w-4 h-4 shrink-0" /> {t('tabs.tareas')}</span>, cleanLabel: t('tabs.tareas') }
  ];const [activeTab, setActiveTab] = useState("secuenciacion");const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;



  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    if (source.droppableId !== destination.droppableId) return;

    const udId = source.droppableId;
    const newSesiones = [...(moduleData?.df_sesiones || [])];
    
    const udSesiones = newSesiones.filter(s => s.id_ud === udId).sort((a, b) => (Number(a.Num_Orden) || 0) - (Number(b.Num_Orden) || 0));
    
    const [moved] = udSesiones.splice(source.index, 1);
    udSesiones.splice(destination.index, 0, moved);
    
    udSesiones.forEach((ses, idx) => {
      ses.Num_Orden = idx + 1;
    });
    
    updateDataFrame("df_sesiones", newSesiones);
  };

  if (!activeModuleId) {
    return (
      <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header breadcrumbSuffix={activeTabCleanLabel} />
          <main className="flex-1 p-8 content-area">
            <MotionWrapper>
              <Card className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl">
                <BookOpen className="w-16 h-16 text-muted-foreground opacity-50" />
                <h2 className="text-2xl font-bold">No hay programación cargada</h2>
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

  if (isLoading || !moduleData) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 p-8 content-area">
            <MotionWrapper>
              <Card className="p-12">
                <div className="space-y-3">
                  <Skeleton className="h-10 w-1/3 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                  <Skeleton className="h-64 w-full mt-4" />
                </div>
              </Card>
            </MotionWrapper>
          </main>
        </div>
      </div>
    );
  }

  const df_ud = moduleData?.df_ud || [];
  const df_sesiones = moduleData?.df_sesiones || [];
  const df_tareas = moduleData?.df_tareas || [];

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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        
        <main className="flex-1 p-8 content-area overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-4 pb-12">
            <div>
            <h1 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('pages.programacion_title')}
            </h1>
            <p className="text-muted mt-2 text-lg">{t('pages.programacion_desc')}</p>
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

          {activeTab === "secuenciacion" && (
            <>
                              {(() => {
                const infoMap: Record<string, {title: string, desc: string}> = {
          'secuenciacion': {
                    'title': 'Secuenciación',
                    'desc': 'Secuenciación temporal de las unidades y bloques de contenido.'
          },
          'tareas': {
                    'title': 'Tareas competenciales',
                    'desc': 'Diseño y planificación de tareas y actividades competenciales.'
          }
};
                const info = infoMap[activeTab] || { title: 'Herramienta operativa', desc: 'Gestión de ' + activeTab };
                return (
    <div className='flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6'>
                    <Info className='w-5 h-5 text-accent mt-0.5 shrink-0' />
                    <div>
                      <p className="text-sm text-muted">{info.desc}</p>
                    </div>
                  </div>
                );
              })()}
            <Card className="p-6 border-t-4 border-t-accent">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
<span><span className="inline-flex"><ClipboardList className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Secuenciación de UD
</h2>
                <Button
                  variant="ghost"
                  onClick={() => setAllUdsOpen(prev => !prev)}
                  className="text-sm border border-[var(--glass-border)]"
                >
                  <span>{allUdsOpen ? '▲' : '▼'}</span>
                  {allUdsOpen ? 'Colapsar todas' : 'Expandir todas'}
                </Button>
              </div>

              {df_ud.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="w-16 h-16 text-muted-foreground opacity-50 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No hay Unidades didácticas</h3>
                  <p className="text-muted">Aún no has creado ninguna Unidad Didáctica (UD).</p>
                  <p className="text-muted mt-1">Para secuenciar sesiones, primero debes crear las UDs en la sección <strong>Matrices</strong>.</p>
                </div>
              ) : (
                <SessionTable 
                  df_ud={df_ud}
                  df_sesiones={df_sesiones}
                  onDragEnd={onDragEnd}
                  handleUpdateSesion={handleUpdateSesion}
                  handleAddSesion={handleAddSesion}
                  handleDeleteSesion={handleDeleteSesion}
                  allUdsOpen={allUdsOpen}
                />
              )}
            </Card>
            </>
          )}

          {activeTab === "tareas" && (
            <>
                <Card className="p-6 border-t-4 border-t-blue-500">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground mb-6">
<span><span className="inline-flex"><Target className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Tareas competenciales (TC)
</h2>
              <TaskTable 
                df_tareas={df_tareas}
                handleUpdateTarea={handleUpdateTarea}
                handleAddTarea={handleAddTarea}
                handleDeleteTarea={handleDeleteTarea}
              />
            </Card>
            </>
          )}

          </MotionWrapper>
        </main>
      </div>
    </div>
      );
}

