"use client";
import { TabSync } from "@/components/ui/TabSync";
import { BarChart, Save, Target, Users, LayoutGrid, AlertTriangle, Building2, Compass, ClipboardList, Map, MessageSquare, FileText, Route, FolderOpen } from "lucide-react";
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { fileManager } from "@/services/fileManager";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { PlanoClaseTab } from "@/components/features/alumnado/PlanoClaseTab";

import { ContextoGrupoTab } from "@/components/features/alumnado/ContextoGrupoTab";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { PageHeader } from "@/components/ui/PageHeader";
import { TabInfoBox } from "@/components/ui/TabInfoBox";

import Link from "next/link";


export default function AlumnadoPage() {
  const { activeCursoId, cursoData, setCursoData, updateCursoData, saveCursoData } = useAppStore();
  const [activeTab, setActiveTab] = useState("listado");
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const TABS = [
    { id: "listado", label: <><span className="inline-flex"><Users className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.listado')}</>, cleanLabel: t('tabs.listado') },
    { id: "plano", label: <><span className="inline-flex"><LayoutGrid className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.plano')}</>, cleanLabel: t('tabs.plano') },
    { id: "contexto", label: <><span className="inline-flex"><Users className="w-[1.2em] h-[1.2em] mr-1" /></span> Contexto</>, cleanLabel: 'Contexto del grupo' }
  ];

  const activeTabCleanLabel = TABS.find(t_tab => t_tab.id === activeTab)?.cleanLabel;

  const TAB_DESCRIPTIONS: Record<string, string> = {
    listado: 'Gestión del listado de alumnado y ficha individual.',
    plano: 'Distribución y plano visual del aula.',
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
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

    if (activeCursoId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [activeCursoId, cursoData]);

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

  if (!activeCursoId) {
    return (
      <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header breadcrumbSuffix={activeTabCleanLabel} />
          <main id="main-content" tabIndex={-1} className="flex-1 p-8 content-area">
            <MotionWrapper>
              <Card className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl">
                <Users className="w-16 h-16 text-muted-foreground opacity-50" />
                <h2 className="text-2xl font-bold">No hay curso cargado</h2>
                <p className="text-muted mb-4">Debes abrir o crear un archivo de curso en tu Archivos.</p>
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

  if (loading || !cursoData) {
    return <LoadingSpinner text="Cargando datos de alumnado..." />;
  }

  const df_al = cursoData?.df_al || [];

  const handleAddAlumnado = () => {
    const newAl = [...df_al];
    const newId = `AN${(newAl.length + 1).toString().padStart(2, '0')}`;
    (newAl as any[]).push({
      ID: newId,
      Estado: "Alta",
      Apellidos: "",
      Nombre: "",
      Edad: "",
      Nacimiento: "",
      Repite: "false",
      Matricula: "",
      Comentarios: "",
      Email: "",
      Movil: ""
    });
    updateCursoData("df_al", newAl);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        // Splitting by newline and handling both comma and semicolon separators
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        if (lines.length < 2) {
          toast.error("El archivo CSV no tiene datos válidos.");
          return;
        }

        // Detect separator by looking at the first line
        const headerLine = lines[0];
        const separator = headerLine.includes(';') ? ';' : ',';

        // Find relevant column indices (case insensitive, partial match)
        const headers = headerLine.split(separator).map(h => h.trim().toLowerCase().replace(/"/g, ''));
        const nameIdx = headers.findIndex(h => h.includes('nombre'));
        const surnameIdx = headers.findIndex(h => h.includes('apellido'));
        const emailIdx = headers.findIndex(h => h.includes('correo') || h.includes('email'));
        
        if (nameIdx === -1 && surnameIdx === -1) {
          toast.error("No se han detectado columnas de Nombre/Apellidos en el CSV.");
          return;
        }

        const newAl = [...df_al];
        let importedCount = 0;

        for (let i = 1; i < lines.length; i++) {
          // split row considering potential quoted values but simple implementation
          const cols = lines[i].split(separator).map(c => c.trim().replace(/"/g, ''));
          if (cols.length <= Math.max(nameIdx, surnameIdx)) continue; // skip invalid rows

          let name = nameIdx !== -1 ? cols[nameIdx] : "";
          let surname = surnameIdx !== -1 ? cols[surnameIdx] : "";
          let email = emailIdx !== -1 && emailIdx < cols.length ? cols[emailIdx] : "";

          // Simple heuristic: if there's only a 'nombre' column, maybe it contains "Surname, Name"
          if (surnameIdx === -1 && name.includes(',')) {
            const parts = name.split(',');
            surname = parts[0].trim();
            name = parts.slice(1).join(',').trim();
          }

          if (!name && !surname) continue;

          const newId = `AN${(newAl.length + 1).toString().padStart(2, '0')}`;
          newAl.push({
            ID: newId,
            Estado: "Alta",
            Apellidos: surname,
            Nombre: name,
            Edad: "",
            Nacimiento: "",
            Repite: "false",
            Matricula: "",
            Comentarios: "",
            Email: email,
            Movil: ""
          });
          importedCount++;
        }

        updateCursoData("df_al", newAl);
        if (importedCount > 0) {
          toast.success(`Se han importado ${importedCount} estudiantes.`);
        } else {
          toast.error("No se pudo importar ningún estudiante válido.");
        }
      } catch (err) {
        console.error("Error parsing CSV:", err);
        toast.error("Hubo un problema al leer el archivo CSV.");
      }
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file, "UTF-8"); // "UTF-8" default, can try ISO-8859-1 for spanish chars
  };

  const handleUpdateAlumnado = (idx: number, field: string, value: any) => {
    const newAl = [...df_al];
    (newAl[idx] as any)[field] = value;
    updateCursoData("df_al", newAl);
  };

  const handleRemoveAlumnado = (idx: number) => {
    const newAl = [...df_al];
    // updateCursoData("df_al", newAl);
    newAl.splice(idx, 1);
    updateCursoData("df_al", newAl);
  };

  const n_menores = df_al.filter((al: any) => Number(al.Edad) > 0 && Number(al.Edad) < 18).length;

  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />
        
        <main className="flex-1 p-8 content-area overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-4 pb-12">
            <PageHeader icon={Users} title={t('pages.alumnado_title')} description={t('pages.alumnado_desc')} />

          {/* Navigation Tabs */}
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

            {/* Save Button */}
            <div className="flex items-center gap-4 shrink-0">
              {saveMessage && (
                <span className={`text-sm font-semibold ${saveMessage.includes("Error") ? "text-danger" : "text-success"}`}>
                  {saveMessage}
                </span>
              )}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-accent text-background hover:bg-accent/80 font-bold px-6 py-2 rounded-xl flex items-center gap-2"
              >
                {saving ? "Guardando..." : <>Guardar cambios <span className="inline-flex"><Save className="w-[1.2em] h-[1.2em] mr-1" /></span></>}
              </Button>
            </div>
          </div>

          <TabInfoBox description={TAB_DESCRIPTIONS[activeTab] || 'Gestión de ' + activeTab} />

          {/* Tab 1: Alumnado */}
          {activeTab === "listado" && (
            <>
            <Card className="p-6 border-t-4 border-t-blue-500">
              <div className="flex justify-between items-end mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                    <span>Lista oficial</span>
                    <span className="text-sm font-normal text-muted bg-foreground/5 px-3 py-1 rounded-full">{df_al.length} alumnado</span>
                  </h2>
                  <Button 
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-accent hover:text-accent hover:bg-accent/10 font-semibold flex items-center gap-1 h-8 px-3 ml-2"
                    title="Importar CSV (Nombre, Apellidos...)"
                  >
                    <FolderOpen className="w-4 h-4" /> Importar CSV
                  </Button>
                  <input 
                    type="file" 
                    accept=".csv" 
                    ref={fileInputRef} 
                    onChange={handleImportCSV} 
                    className="hidden" 
                  />
                </div>
                {n_menores > 0 && (
                  <span className="text-danger text-sm font-semibold"> {n_menores} alumnado(s) menor(es) de 18 años</span>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--glass-border)] text-muted bg-background">
                      <th className="p-2 sticky left-0 z-10 border-r border-[var(--glass-border)] bg-background w-16">Nº</th>
                      <th className="p-2 sticky left-[60px] z-10 border-r border-[var(--glass-border)] bg-background w-12 text-center"></th>
                      <th className="p-2 w-32">Estado</th>
                      <th className="p-2 w-48">Apellidos</th>
                      <th className="p-2 w-48">Nombre</th>
                      <th className="p-2 w-20">Edad</th>
                      <th className="p-2 w-32">Nacimiento</th>
                      <th className="p-2 w-16 text-center">Repite</th>
                      <th className="p-2 w-64">Email</th>
                      <th className="p-2 w-32">Móvil</th>
                      <th className="p-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {df_al.length === 0 && (
                      <tr>
                        <td colSpan={10} className="p-0">
                          <div className="flex flex-col items-center justify-center py-12 text-muted">
                            <Users className="w-12 h-12 mb-3 opacity-20" />
                            <p>No hay alumnado registrado aún.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                    {df_al.map((al: any, idx: number) => {
                      const isMenor = Number(al.Edad) > 0 && Number(al.Edad) < 18;
                      const inputClass = "w-full bg-transparent border border-transparent hover:border-[var(--glass-border)] focus:bg-foreground/5 rounded px-2 py-1 text-foreground focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all placeholder:text-muted/40";
                      
                      return (
    <tr key={idx} className="border-b border-white/5 hover:bg-foreground/5 transition-colors group">
                          <td className="p-2 font-mono text-xs sticky left-0 z-10 border-r border-[var(--glass-border)] bg-background group-hover:bg-[#111827] transition-colors">
                            {al.ID}
                          </td>
                          <td className="p-2 text-center sticky left-[60px] z-10 border-r border-[var(--glass-border)] bg-background group-hover:bg-[#111827] transition-colors">
                            {isMenor ? <span className="text-danger font-bold text-lg" title="Menor de edad">!</span> : ""}
                          </td>
                          <td className="p-2 pr-2">
                            <select 
                              value={al.Estado || "Alta"}
                              onChange={(e) => handleUpdateAlumnado(idx, "Estado", e.target.value)}
                              className={`w-full bg-transparent border border-transparent hover:border-[var(--glass-border)] focus:bg-foreground/5 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-accent transition-all appearance-none font-semibold cursor-pointer ${al.Estado === 'Baja' ? 'text-danger' : 'text-success'}`}
                            >
                              <option value="Alta" className="text-success">Alta</option>
                              <option value="Baja" className="text-danger">Baja</option>
                            </select>
                          </td>
                          <td className="p-2 pr-2">
                            <input 
                              type="text"
                              value={al.Apellidos || ""}
                              onChange={(e) => handleUpdateAlumnado(idx, "Apellidos", e.target.value)}
                              className={inputClass}
                              placeholder="Apellidos..."
                            />
                          </td>
                          <td className="p-2 pr-2">
                            <input 
                              type="text"
                              value={al.Nombre || ""}
                              onChange={(e) => handleUpdateAlumnado(idx, "Nombre", e.target.value)}
                              className={inputClass}
                              placeholder="Nombre..."
                            />
                          </td>
                          <td className="p-2 pr-2">
                            <input 
                              type="number"
                              value={al.Edad || ""}
                              onChange={(e) => handleUpdateAlumnado(idx, "Edad", e.target.value)}
                              className={inputClass}
                              placeholder="Edad"
                            />
                          </td>
                          <td className="p-2 pr-2">
                            <input 
                              type="text"
                              value={al.Nacimiento || ""}
                              onChange={(e) => handleUpdateAlumnado(idx, "Nacimiento", e.target.value)}
                              placeholder="DD/MM/YYYY"
                              className={`${inputClass} text-sm`}
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input 
                              type="checkbox"
                              checked={al.Repite === true || al.Repite === "true"}
                              onChange={(e) => handleUpdateAlumnado(idx, "Repite", e.target.checked)}
                              className="w-4 h-4 accent-accent rounded cursor-pointer opacity-70 group-hover:opacity-100 transition-opacity"
                            />
                          </td>
                          <td className="p-2 pr-2">
                            <input 
                              type="email"
                              value={al.email || ""}
                              onChange={(e) => handleUpdateAlumnado(idx, "email", e.target.value)}
                              className={inputClass}
                              placeholder="correo@ejemplo.com"
                            />
                          </td>
                          <td className="p-2 pr-2">
                            <input 
                              type="text"
                              value={al.Movil || ""}
                              onChange={(e) => handleUpdateAlumnado(idx, "Movil", e.target.value)}
                              className={inputClass}
                              placeholder="Teléfono"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => handleRemoveAlumnado(idx)}
                              className="text-danger/50 hover:text-danger font-bold text-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                              title="Eliminar alumnado"
                            >
                              &times;
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="mt-4 flex items-center">
                  <Button 
                    variant="ghost"
                    onClick={handleAddAlumnado}
                    className="text-info hover:text-info font-semibold flex items-center gap-1"
                  >
                    <span>+</span> Añadir alumnado
                  </Button>
                </div>
              </div>
            </Card>
            </>
          )}

          {activeTab === "plano" && <PlanoClaseTab />}
          {activeTab === "contexto" && <ContextoGrupoTab />}
          
          </MotionWrapper>
        </main>
      </div>
    </div>
      );
}

