"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";
import { BarChart3 } from "lucide-react";
import { DashboardKPIs } from "@/components/features/dashboard/DashboardKPIs";
import { DashboardCharts } from "@/components/features/dashboard/DashboardCharts";
import { FileManagementPanel } from "@/components/features/dashboard/FileManagementPanel";
import { useModulesList } from "@/hooks/useApi";

export default function Dashboard() {
  const { activeModuleId, setActiveModuleId, activeCursoId, setActiveCursoId, moduleData, setModuleData, cursoData, setCursoData } = useAppStore();

  const { data: modulesList, isLoading: loadingModules, mutate: fetchModules } = useModulesList();
  
  const modules = {
    centro_modules: modulesList?.centro_modules || ["ciclos-fp"],
    pd_modules: modulesList?.pd_modules || [],
    curso_modules: modulesList?.curso_modules || []
  };

  const [selectedCentro, setSelectedCentro] = useState("ciclos-fp");
  const [selectedPd, setSelectedPd] = useState("");
  const [selectedCurso, setSelectedCurso] = useState("");

  const [newCentroName, setNewCentroName] = useState("ciclos-fp");
  const [newPdName, setNewPdName] = useState(activeModuleId ? activeModuleId.replace("-pd", "") : "nuevo-modulo");
  const [newCursoName, setNewCursoName] = useState(activeCursoId || "nuevo-modulo-curso");

  useEffect(() => {
    if (modulesList) {
      if (!selectedCentro && modules.centro_modules.length > 0) setSelectedCentro(modules.centro_modules[0]);

      if (!selectedPd && modules.pd_modules.length > 0) {
        setSelectedPd(activeModuleId || modules.pd_modules[0]);
      } else if (selectedPd && !modules.pd_modules.includes(selectedPd)) {
        setSelectedPd(modules.pd_modules[0] || "");
      }

      if (!selectedCurso && modules.curso_modules.length > 0) {
        setSelectedCurso(activeCursoId || modules.curso_modules[0]);
      } else if (selectedCurso && !modules.curso_modules.includes(selectedCurso)) {
        setSelectedCurso(modules.curso_modules[0] || "");
      }
    }
  }, [modulesList, activeModuleId, activeCursoId]);

  useEffect(() => {
    if (activeModuleId) {
      fetch(`/api/module/${activeModuleId}`).then(res => res.json()).then(data => {
        if (data.status === "success") setModuleData(data.data);
      });
    }
  }, [activeModuleId, setModuleData]);

  useEffect(() => {
    if (activeCursoId) {
      fetch(`/api/module/${activeCursoId}`).then(res => res.json()).then(data => {
        if (data.status === "success") setCursoData(data.data);
      });
    }
  }, [activeCursoId, setCursoData]);

  const showNotification = (type: 'success' | 'warning' | 'error', message: string) => {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else toast(message, { icon: '⚠️' });
  };

  const handleLoadCentro = () => {
    if (selectedCentro) {
      setNewCentroName(selectedCentro);
      showNotification('success', `Centro ${selectedCentro} cargado correctamente`);
    }
  };

  const handleLoadPd = () => {
    if (selectedPd) {
      setActiveModuleId(selectedPd);
      setNewPdName(selectedPd.replace("-pd", ""));
      showNotification('success', `Módulo ${selectedPd} cargado correctamente`);
    }
  };

  const handleLoadCurso = () => {
    if (selectedCurso) {
      setActiveCursoId(selectedCurso);
      setNewCursoName(selectedCurso);
      showNotification('success', `Curso ${selectedCurso} cargado correctamente`);
    }
  };

  const handleSaveCentro = () => {
    showNotification('warning', 'Guardar Centro educativo no implementado todavía en esta vista.');
  };

  const handleSavePd = () => {
    if (!newPdName) return;
    const saveName = newPdName.endsWith("-pd") ? newPdName : `${newPdName}-pd`;

    if (!moduleData) {
      showNotification('error', 'No hay datos de Módulo en memoria para guardar.');
      return;
    }

    fetch(`/api/module/${saveName}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(moduleData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          setActiveModuleId(saveName);
          showNotification('success', `✅ Módulo guardado como: ${saveName}`);
          fetchModules();
        } else {
          showNotification('error', `Error al guardar: ${data.detail || 'Desconocido'}`);
        }
      })
      .catch(err => {
        showNotification('error', 'Fallo al conectar con el servidor.');
      });
  };

  const handleSaveCurso = () => {
    showNotification('warning', 'Guardar Curso y alumnado no implementado todavía en esta vista.');
  };

  if (loadingModules && modules.pd_modules.length === 0) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex flex-col h-screen items-center justify-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
          <p>Conectando con el servidor local...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />

        <div className="flex-1 p-8 pt-4 overflow-y-auto">
          <div className="space-y-8 pb-12">

            {/* --- DASHBOARD INICIAL --- */}
            {moduleData || cursoData ? (
              <section className="space-y-6">
                <div>
                  <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 mb-2">
                    <BarChart3 className="w-10 h-10 text-accent" /> Resumen general
                  </h1>
                  <p className="text-gray-400">Panel de control con las métricas clave de tu módulo y curso activos.</p>
                </div>

                <DashboardKPIs cursoData={cursoData} moduleData={moduleData} />
                <DashboardCharts cursoData={cursoData} />

                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-400/20 to-transparent my-10"></div>
              </section>
            ) : (
              <section className="glass-card p-8 border-l-4 border-l-purple-500 flex flex-col items-center justify-center text-center space-y-4 mb-12">
                <div className="p-4 bg-purple-500/20 rounded-full">
                  <BarChart3 className="w-12 h-12 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">¡Bienvenido a tu Cuaderno Digital!</h2>
                <p className="text-gray-400 max-w-2xl">
                  Para visualizar tu panel de control con métricas y gráficos interactivos, por favor, <strong className="text-white">carga un Módulo didáctico o un archivo de Curso</strong> desde la sección de Gestión de archivos que encontrarás justo aquí abajo.
                </p>
              </section>
            )}

            <FileManagementPanel 
              modules={modules}
              selectedCentro={selectedCentro}
              setSelectedCentro={setSelectedCentro}
              selectedPd={selectedPd}
              setSelectedPd={setSelectedPd}
              selectedCurso={selectedCurso}
              setSelectedCurso={setSelectedCurso}
              newCentroName={newCentroName}
              setNewCentroName={setNewCentroName}
              newPdName={newPdName}
              setNewPdName={setNewPdName}
              newCursoName={newCursoName}
              setNewCursoName={setNewCursoName}
              handleLoadCentro={handleLoadCentro}
              handleLoadPd={handleLoadPd}
              handleLoadCurso={handleLoadCurso}
              handleSaveCentro={handleSaveCentro}
              handleSavePd={handleSavePd}
              handleSaveCurso={handleSaveCurso}
              moduleData={moduleData}
            />

          </div>
        </div>
      </main>
    </div>
  );
}
