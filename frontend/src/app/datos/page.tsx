"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";
import { Database } from "lucide-react";
import { FileManagementPanel } from "@/components/features/dashboard/FileManagementPanel";
import { useModulesList } from "@/hooks/useApi";

export default function DatosPage() {
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
        <main className="flex-1 flex flex-col h-screen items-center justify-center text-foreground">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
          <p>Conectando con el servidor local...</p>
        </main>
      </div>
    );
  }

  const TABS = [
    { id: "ficheros", label: "📂 Gestión de ficheros", cleanLabel: "Gestión de Ficheros" },
    { id: "configuracion", label: "⚙️ Configuración básica", cleanLabel: "Configuración Básica" }
  ];

  const [activeTab, setActiveTab] = useState("ficheros");
  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />

        <div className="flex-1 p-8 pt-4 overflow-y-auto">
          <div className="space-y-8 pb-12">
            <div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3 mb-2">
                <Database className="w-10 h-10 text-accent" /> Datos
              </h1>
              <p className="text-muted">Datos y carga de datos del centro, módulos y cursos.</p>
            </div>

            <div className="flex border-b border-[var(--glass-border)] mb-8 overflow-x-auto scrollbar-hide">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-foreground'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "ficheros" && (
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
            )}

            {activeTab === "configuracion" && (
              <div className="p-12 text-center text-muted border border-[var(--glass-border)] rounded-xl bg-foreground/5">
                <h2 className="text-2xl font-bold mb-4">Configuración Básica</h2>
                <p>Esta sección estará disponible próximamente para editar los detalles del centro activo.</p>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
