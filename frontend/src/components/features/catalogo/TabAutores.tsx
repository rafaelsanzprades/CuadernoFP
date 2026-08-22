"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, DownloadCloud, FileText, CheckCircle2, AlertTriangle, Layers, Target, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface DocumentItem {
  name: string;
  is_dir: boolean;
  size: number | null;
  path: string;
}

export function TabAutores({ globalSelection }: { globalSelection: any }) {
  const { moduleData, updateDataFrame, updateInfoModulo, updateModuleData, saveModuleData } = useAppStore();
  const { t } = useTranslation();
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
          // Filtrar por extensión .fpp y que contenga el código del módulo
          const fppFiles = json.data.filter((f: DocumentItem) => 
            !f.is_dir && 
            f.name.toLowerCase().endsWith(".fpp") &&
            (!moduloCodigo || f.name.includes(moduloCodigo))
          );
          setProposals(fppFiles);
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
          toast.error(t('toasts.autores.jsonInvalido', {defaultValue: "El archivo seleccionado no es un JSON válido o está corrupto."}));
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
      toast.error(t('toasts.autores.sinProgramacionActiva', {defaultValue: "No tienes ninguna programación activa. Abre tu programación desde la pestaña Archivos antes de incorporar una propuesta."}));
      return;
    }

    const confirm = window.confirm(
      t('campos.catalogo.confirmacionSobrescribirPropuesta', {defaultValue: "⚠️ ATENCIÓN: Esta acción sobreescribirá tus Unidades didácticas, Instrumentos, Sesiones, Tareas y configuración del contexto para el módulo actual.\n\n¿Estás completamente seguro de continuar?"})
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
        toast.success(t('toasts.autores.propuestaIncorporada', {defaultValue: "Propuesta incorporada correctamente."}));
        setSelectedFile(null);
      } else {
        toast.error(t('toasts.autores.errorGuardar', {defaultValue: "Hubo un problema al guardar la programación."}));
      }
    } catch (e) {
      console.error(e);
      toast.error(t('toasts.autores.errorInyectar', {defaultValue: "Error al incorporar los datos de la propuesta."}));
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="p-6 border-info/20 bg-foreground/5">
        <h2 className="text-subheading font-bold flex items-center gap-2 mb-2">
          <DownloadCloud className="w-5 h-5 text-info" /> {t('campos.catalogo.tituloCatalogoAutores', {defaultValue: 'Catálogo de Autores y Editoriales'})}
        </h2>
        <p className="text-muted text-body">
          {t('campos.catalogo.descripcionCatalogoAutoresTexto1', {defaultValue: 'Explora plantillas completas ('})}<code>.fpp</code>{t('campos.catalogo.descripcionCatalogoAutoresTexto2', {defaultValue: ') propuestas por editoriales o autores para el módulo '})}<strong>{moduloCodigo}</strong>{t('campos.catalogo.descripcionCatalogoAutoresTexto3', {defaultValue: '. Estas propuestas pueden incluir unidades didácticas, instrumentos de evaluación y secuencias de aula.'})}
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Selector de Ficheros */}
        <div className="col-span-1 space-y-4">
          <h3 className="font-bold text-foreground">{t('campos.catalogo.tituloArchivosDisponibles', {defaultValue: 'Archivos disponibles'})}</h3>
          {loading && !selectedFile ? (
            <p className="text-body text-muted">{t('campos.catalogo.buscandoPropuestas', {defaultValue: 'Buscando propuestas...'})}</p>
          ) : proposals.length === 0 ? (
            <div className="p-4 border border-dashed border-[var(--glass-border)] rounded-xl text-center">
              <p className="text-body text-muted">{t('campos.catalogo.sinArchivosFppTexto1', {defaultValue: 'No se encontraron archivos '})}<code>.fpp</code>{t('campos.catalogo.sinArchivosFppTexto2', {defaultValue: ' para este módulo en tu carpeta Documentos/Autores.'})}</p>
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
                    <span className="text-body font-medium break-all">{file.name.replace('.fpp', '')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen Global */}
        <div className="col-span-1 md:col-span-2">
          {loading && selectedFile ? (
            <div className="p-12 text-center text-muted">{t('campos.catalogo.cargandoContenidoPropuesta', {defaultValue: 'Cargando contenido de la propuesta...'})}</div>
          ) : selectedFile && previewData ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between bg-info/10 border border-info/30 p-4 rounded-2xl">
                <div>
                  <h3 className="text-subheading font-bold text-info">{t('campos.catalogo.tituloPrevisualizacionPropuesta', {defaultValue: 'Previsualización de la propuesta'})}</h3>
                  <p className="text-body text-muted mt-1">{t('campos.catalogo.descripcionPrevisualizacionPropuesta', {defaultValue: 'Revisa el contenido antes de incorporarlo. Podrás editarlo a tu gusto una vez importado en tu programación.'})}</p>
                </div>
                <Button 
                  onClick={handleApply} 
                  disabled={isApplying}
                  className="bg-info hover:bg-info/90 text-white whitespace-nowrap shadow-lg shadow-info/20"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> 
                  {isApplying ? t('botones.catalogo.incorporando', {defaultValue: 'Incorporando...'}) : t('botones.catalogo.incorporarAProgramacion', {defaultValue: '🚀 Incorporar a la programación'})}
                </Button>
              </div>

              {/* Módulo Didáctico */}
              <Card className="p-5 border-l-4 border-l-blue-500">
                <h4 className="font-bold flex items-center gap-2 mb-3"><BookOpen className="w-4 h-4 text-blue-500"/> {t('campos.catalogo.tituloModuloDidactico', {defaultValue: 'Módulo didáctico'})}</h4>
                <div className="text-body text-muted space-y-1">
                  <p><strong>{t('campos.catalogo.labelContexto', {defaultValue: 'Contexto:'})}</strong> {previewData.config_contexto ? t('campos.catalogo.definido', {defaultValue: 'Definido'}) : t('campos.catalogo.noDefinido', {defaultValue: 'No definido'})}</p>
                </div>
              </Card>

              {/* Matrices */}
              <Card className="p-5 border-l-4 border-l-purple-500">
                <h4 className="font-bold flex items-center gap-2 mb-3"><Target className="w-4 h-4 text-purple-500"/> {t('campos.catalogo.tituloMatricesOgRaCeUd', {defaultValue: 'Matrices OG → RA → CE → UD/T'})}</h4>
                <div className="text-body text-muted">
                  <p className="mb-2"><strong>{previewData.df_ud?.length || 0}</strong> {t('campos.catalogo.unidadesDidacticasPropuestas', {defaultValue: 'Unidades didácticas propuestas:'})}</p>
                  <ul className="list-disc list-inside space-y-1 pl-2 max-h-60 overflow-y-auto">
                    {previewData.df_ud?.map((ud: any) => (
                      <li key={ud.id_ud}>
                        <strong>{ud.id_ud}</strong> ({ud.horas_ud}h): {ud.desc_ud || t('campos.catalogo.sinDescripcion', {defaultValue: '(Sin descripción)'})}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-caption">{t('campos.catalogo.labelMapeoRaOg', {defaultValue: 'Mapeo RA-OG:'})} {previewData.ra_og_mapping ? t('campos.catalogo.incluido', {defaultValue: 'Incluido'}) : t('campos.catalogo.noIncluido', {defaultValue: 'No incluido'})}</p>
                </div>
              </Card>

              {/* Instrumentos */}
              <Card className="p-5 border-l-4 border-l-green-500">
                <h4 className="font-bold flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-green-500"/> {t('campos.catalogo.tituloInstrumentosEvaluacion', {defaultValue: 'Instrumentos de evaluación'})}</h4>
                <div className="text-body text-muted">
                  <p><strong>{previewData.df_instr?.length || 0}</strong> {t('campos.catalogo.instrumentosPredefinidos', {defaultValue: 'Instrumentos predefinidos.'})}</p>
                  {previewData.df_instr?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {previewData.df_instr.map((ins: any, i: number) => (
                        <span key={i} className="px-2 py-1 bg-green-500/10 text-green-600 rounded text-caption">{ins.siglas || ins.nombre || `Instr ${i+1}`}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Programación de aula */}
              <Card className="p-5 border-l-4 border-l-orange-500">
                <h4 className="font-bold flex items-center gap-2 mb-3"><Layers className="w-4 h-4 text-orange-500"/> {t('campos.catalogo.tituloProgramacionAula', {defaultValue: 'Programación de aula'})}</h4>
                <div className="text-body text-muted">
                  <p><strong>{previewData.df_sesiones?.length || 0}</strong> {t('campos.catalogo.sesionesPlanificadas', {defaultValue: 'Sesiones planificadas.'})}</p>
                  <p><strong>{previewData.df_tareas?.length || 0}</strong> {t('campos.catalogo.tareasCompetencialesDisenadas', {defaultValue: 'Tareas competenciales diseñadas.'})}</p>
                </div>
              </Card>

            </div>
          ) : (
            <div className="h-full min-h-[300px] border border-dashed border-[var(--glass-border)] rounded-2xl flex flex-col items-center justify-center text-center p-6">
              <BookOpen className="w-12 h-12 text-muted mb-4 opacity-20" />
              <h3 className="font-medium text-foreground">{t('campos.catalogo.tituloNingunFicheroSeleccionado', {defaultValue: 'Ningún fichero seleccionado'})}</h3>
              <p className="text-body text-muted max-w-sm mt-2">{t('campos.catalogo.descripcionSeleccionaArchivoFpp', {defaultValue: 'Selecciona un archivo `.fpp` de la lista de la izquierda para previsualizar todo su contenido antes de incorporarlo a tu programación.'})}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
