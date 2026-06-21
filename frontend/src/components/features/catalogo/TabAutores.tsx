"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, DownloadCloud, FileText, CheckCircle2, AlertTriangle, Layers, Target, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

interface DocumentItem {
  name: string;
  is_dir: boolean;
  size: number | null;
  path: string;
}

export function TabAutores({ globalSelection }: { globalSelection: any }) {
  const { moduleData, updateDataFrame, updateInfoModulo, updateModuleData, saveModuleData } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [proposals, setProposals] = useState<DocumentItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<DocumentItem | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const moduloCodigo = globalSelection?.moduloCodigo;

  // 1. Cargar la lista de ficheros
  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/list?path=${encodeURIComponent("Autores/Editoriales")}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success" && json.data) {
          // Filtrar por extensión .cdda y que contenga el código del módulo
          const cddaFiles = json.data.filter((f: DocumentItem) => 
            !f.is_dir && 
            f.name.toLowerCase().endsWith(".cdda") &&
            (!moduloCodigo || f.name.includes(moduloCodigo))
          );
          setProposals(cddaFiles);
        }
      })
      .catch((err) => console.error("Error fetching proposals:", err))
      .finally(() => setLoading(false));
  }, [moduloCodigo]);

  // 2. Leer el contenido del archivo seleccionado
  useEffect(() => {
    if (selectedFile) {
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/download?file_path=${encodeURIComponent(selectedFile.path)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Error al descargar el archivo");
          return res.json();
        })
        .then((data) => {
          setPreviewData(data);
        })
        .catch((err) => {
          console.error("Error parsing cdda:", err);
          toast.error("El archivo seleccionado no es un JSON válido o está corrupto.");
          setPreviewData(null);
        })
        .finally(() => setLoading(false));
    } else {
      setPreviewData(null);
    }
  }, [selectedFile]);

  const handleApply = async () => {
    if (!previewData) return;
    
    if (!moduleData) {
      toast.error("⚠️ No tienes ninguna programación activa. Por favor, abre tu programación desde la pestaña 'Archivos' antes de incorporar una propuesta.");
      return;
    }

    const confirm = window.confirm(
      "⚠️ ATENCIÓN: Esta acción sobreescribirá tus Unidades Didácticas, Instrumentos, Sesiones, Tareas y configuración del contexto para el módulo actual.\n\n¿Estás completamente seguro de continuar?"
    );
    if (!confirm) return;

    setIsApplying(true);
    try {
      if (previewData.df_ud) updateDataFrame("df_ud", previewData.df_ud);
      if (previewData.df_instr) updateDataFrame("df_instr", previewData.df_instr);
      if (previewData.df_sesiones) updateDataFrame("df_sesiones", previewData.df_sesiones);
      if (previewData.df_tareas) updateDataFrame("df_tareas", previewData.df_tareas);
      
      if (previewData.config_contexto) {
        updateModuleData("config_contexto", previewData.config_contexto);
      }
      if (previewData.ra_og_mapping) {
        updateInfoModulo("ra_og_mapping", previewData.ra_og_mapping);
      }
      
      const ok = await saveModuleData();
      if (ok) {
        toast.success("¡Propuesta incorporada con éxito!");
        setSelectedFile(null);
      } else {
        toast.error("Hubo un problema al guardar la programación.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error al inyectar los datos de la propuesta.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="p-6 border-info/20 bg-foreground/5">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
          <DownloadCloud className="w-5 h-5 text-info" /> Catálogo de Autores y Editoriales
        </h2>
        <p className="text-muted text-sm">
          Explora plantillas completas (<code>.cdda</code>) propuestas por editoriales o autores para el módulo <strong>{moduloCodigo}</strong>. Estas propuestas pueden incluir unidades didácticas, instrumentos de evaluación y secuencias de aula.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Selector de Ficheros */}
        <div className="col-span-1 space-y-4">
          <h3 className="font-bold text-foreground">Archivos Disponibles</h3>
          {loading && !selectedFile ? (
            <p className="text-sm text-muted">Buscando propuestas...</p>
          ) : proposals.length === 0 ? (
            <div className="p-4 border border-dashed border-[var(--glass-border)] rounded-xl text-center">
              <p className="text-sm text-muted">No se encontraron archivos <code>.cdda</code> para este módulo en tu carpeta Documentos/Autores.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {proposals.map(file => (
                <div 
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`p-3 border rounded-xl cursor-pointer transition-all ${selectedFile?.path === file.path ? 'border-info bg-info/10' : 'border-[var(--glass-border)] hover:border-info/50 bg-background'}`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className={`w-4 h-4 ${selectedFile?.path === file.path ? 'text-info' : 'text-muted'}`} />
                    <span className="text-sm font-medium break-all">{file.name.replace('.cdda', '')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen Global */}
        <div className="col-span-1 md:col-span-2">
          {loading && selectedFile ? (
            <div className="p-12 text-center text-muted">Cargando contenido de la propuesta...</div>
          ) : selectedFile && previewData ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between bg-info/10 border border-info/30 p-4 rounded-2xl">
                <div>
                  <h3 className="text-lg font-bold text-info">Previsualización de la Propuesta</h3>
                  <p className="text-sm text-muted mt-1">Revisa el contenido antes de incorporarlo. Podrás editarlo a tu gusto una vez importado en tu programación.</p>
                </div>
                <Button 
                  onClick={handleApply} 
                  disabled={isApplying}
                  className="bg-info hover:bg-info/90 text-white whitespace-nowrap shadow-lg shadow-info/20"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> 
                  {isApplying ? "Incorporando..." : "🚀 Incorporar a la Programación"}
                </Button>
              </div>

              {/* Módulo Didáctico */}
              <Card className="p-5 border-l-4 border-l-blue-500">
                <h4 className="font-bold flex items-center gap-2 mb-3"><BookOpen className="w-4 h-4 text-blue-500"/> Módulo didáctico</h4>
                <div className="text-sm text-muted space-y-1">
                  <p><strong>Contexto:</strong> {previewData.config_contexto ? 'Definido' : 'No definido'}</p>
                </div>
              </Card>

              {/* Matrices */}
              <Card className="p-5 border-l-4 border-l-purple-500">
                <h4 className="font-bold flex items-center gap-2 mb-3"><Target className="w-4 h-4 text-purple-500"/> Matrices OG → RA → CE → UD/T</h4>
                <div className="text-sm text-muted">
                  <p className="mb-2"><strong>{previewData.df_ud?.length || 0}</strong> Unidades Didácticas propuestas:</p>
                  <ul className="list-disc list-inside space-y-1 pl-2 max-h-60 overflow-y-auto">
                    {previewData.df_ud?.map((ud: any) => (
                      <li key={ud.id_ud}>{ud.id_ud}: {ud.desc_ud} ({ud.horas_ud}h)</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs">Mapeo RA-OG: {previewData.ra_og_mapping ? 'Incluido' : 'No incluido'}</p>
                </div>
              </Card>

              {/* Instrumentos */}
              <Card className="p-5 border-l-4 border-l-green-500">
                <h4 className="font-bold flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-green-500"/> Instrumentos de evaluación</h4>
                <div className="text-sm text-muted">
                  <p><strong>{previewData.df_instr?.length || 0}</strong> Instrumentos predefinidos.</p>
                  {previewData.df_instr?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {previewData.df_instr.map((ins: any, i: number) => (
                        <span key={i} className="px-2 py-1 bg-green-500/10 text-green-600 rounded text-xs">{ins.siglas || ins.nombre || `Instr ${i+1}`}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Programación de aula */}
              <Card className="p-5 border-l-4 border-l-orange-500">
                <h4 className="font-bold flex items-center gap-2 mb-3"><Layers className="w-4 h-4 text-orange-500"/> Programación de aula</h4>
                <div className="text-sm text-muted">
                  <p><strong>{previewData.df_sesiones?.length || 0}</strong> Sesiones planificadas.</p>
                  <p><strong>{previewData.df_tareas?.length || 0}</strong> Tareas competenciales diseñadas.</p>
                </div>
              </Card>

            </div>
          ) : (
            <div className="h-full min-h-[300px] border border-dashed border-[var(--glass-border)] rounded-2xl flex flex-col items-center justify-center text-center p-6">
              <BookOpen className="w-12 h-12 text-muted mb-4 opacity-20" />
              <h3 className="font-medium text-foreground">Ningún fichero seleccionado</h3>
              <p className="text-sm text-muted max-w-sm mt-2">Selecciona un archivo `.cdda` de la lista de la izquierda para previsualizar todo su contenido antes de incorporarlo a tu programación.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
