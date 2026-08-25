import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Alumnado, ResultadoAprendizaje } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Printer, FileText, Users, Award, Briefcase, GraduationCap, Target } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { resolveDescRa, loadCatalogForModule } from '@/services/catalogCache';
import { isAlumnoActivo } from '@/utils/alumnado';
import { calcularNotas, DEFAULT_CONFIG_REDONDEO } from '@/utils/calificaciones';
import { useTranslation } from 'react-i18next';

export const BoletinesTab = () => {
  const { t } = useTranslation();
  const { cursoData, moduleData, activeCursoId, activeModuleId } = useAppStore();

  useEffect(() => { if (activeModuleId) loadCatalogForModule(activeModuleId); }, [activeModuleId]);

  const df_al = cursoData?.df_al || [];
  const activeStudents = df_al.filter(isAlumnoActivo).sort((a, b) => (a.Apellidos || '').localeCompare(b.Apellidos || ''));

  const [selectedStudentId, setSelectedStudentId] = useState<string>(activeStudents.length > 0 ? activeStudents[0].ID || '' : '');

  const currentStudent = activeStudents.find(s => s.ID === selectedStudentId);
  const df_ra = moduleData?.df_ra || [];
  const df_ce = moduleData?.df_ce || [];
  const df_act = moduleData?.df_act || [];
  const df_eval = cursoData?.df_eval || [];
  const info_modulo = moduleData?.info_modulo || {};
  const config_redondeo = { ...DEFAULT_CONFIG_REDONDEO, ...(moduleData?.config_redondeo || {}) };

  const evRow = df_eval.find((e: any) => e.ID === currentStudent?.ID) || {};
  const notasCalc = calcularNotas(evRow, df_ra, df_ce, df_act, config_redondeo);

  const radarData = df_ra.map((ra: ResultadoAprendizaje, idx: number) => ({
    subject: `RA ${idx + 1}`,
    nota: currentStudent ? (notasCalc.notas_ra[ra.id_ra] ?? 0) : 0,
    fullMark: 10,
    desc: resolveDescRa(activeModuleId, ra)
  }));

  const notaMedia = radarData.length > 0 
    ? (radarData.reduce((acc, curr) => acc + curr.nota, 0) / radarData.length).toFixed(2)
    : "0.00";

  const handlePrint = () => {
    window.print();
  };

  if (activeStudents.length === 0) {
    return (
      <Card className="p-8 text-center border-l-4 border-l-yellow-500 mt-6">
        <h2 className="text-subheading font-bold text-warning mb-2">{t('campos.alumnado.faltaAlumnadoTitulo', {defaultValue: 'Falta alumnado'})}</h2>
        <p className="text-foreground/80">
          {t('campos.alumnado.faltaAlumnadoDesc', {defaultValue: 'Primero debes registrar alumnado en la pestaña principal.'})}
        </p>
      </Card>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-280px)] min-h-[500px]">
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .printable-boletin, .printable-boletin * { visibility: visible; }
          .printable-boletin { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            margin: 0; 
            padding: 2cm; 
            background: white !important;
            color: black !important;
          }
          .no-print { display: none !important; }
          /* Ensure charts print properly */
          .recharts-wrapper { opacity: 1 !important; }
          /* Force background colors */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}} />

      {/* Sidebar List (Hidden on Print) */}
      <div className="w-80 bg-foreground/5 border border-white/5 rounded-2xl flex flex-col overflow-hidden shrink-0 no-print">
        <div className="p-4 border-b border-white/5 bg-foreground/10">
          <div className="text-caption font-medium text-muted tracking-wider">
            {t('campos.alumnado.alumnadoActivoTitulo', {count: activeStudents.length, defaultValue: 'Alumnado Activo ({{count}})'})}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
          {activeStudents.map((al) => {
            const isSelected = al.ID === selectedStudentId;
            return (
              <button
                key={al.ID}
                onClick={() => setSelectedStudentId(al.ID || '')}
                className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between ${
                  isSelected 
                    ? 'bg-accent text-background font-bold shadow-md shadow-accent/15'
                    : 'text-foreground/80 hover:bg-foreground/5'
                }`}
              >
                <div className="truncate pr-2">
                  <div className="text-body truncate">
                    {al.Apellidos}, {al.Nombre}
                  </div>
                  <div className={`text-caption font-mono ${isSelected ? 'text-background/80' : 'text-muted'}`}>
                    {al.ID}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Report Area */}
      <div className="flex-1 bg-background/5 border border-white/5 rounded-2xl flex flex-col overflow-hidden relative">
        {currentStudent ? (
          <>
            <div className="p-6 border-b border-white/5 bg-foreground/10 flex justify-between items-center shrink-0 no-print">
              <div>
                <h3 className="text-subheading font-black text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" /> {t('campos.alumnado.boletinIndividualTitulo', {defaultValue: 'Boletín individual de calificaciones'})}
                </h3>
              </div>
              <Button onClick={handlePrint} className="bg-accent text-background hover:bg-accent/80 font-bold px-4 py-2 rounded-xl flex items-center gap-2">
                <Printer className="w-4 h-4" /> {t('botones.alumnado.imprimirBoletin', {defaultValue: 'Imprimir boletín'})}
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {/* PRINTABLE AREA */}
              <div className="printable-boletin bg-background p-8 rounded-xl border border-white/5 shadow-sm max-w-4xl mx-auto text-foreground">
                
                {/* Cabecera Oficial */}
                <div className="border-b-2 border-accent pb-6 mb-8 flex justify-between items-start">
                  <div>
                    <h1 className="text-heading font-black mb-2 tracking-tight">{t('campos.alumnado.informeEvaluacionTitulo', {defaultValue: 'INFORME DE EVALUACIÓN'})}</h1>
                    <p className="text-subheading text-muted-foreground font-semibold flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" /> {t('campos.alumnado.moduloLabel', {defaultValue: 'Módulo:'})} {info_modulo.codigo && info_modulo.nombre ? `${info_modulo.codigo} - ${info_modulo.nombre}` : info_modulo.modulo || t('campos.alumnado.moduloProfesionalFallback', {defaultValue: 'Módulo profesional'})}
                    </p>
                    <p className="text-body text-muted flex items-center gap-2 mt-1">
                      <Briefcase className="w-4 h-4" /> {t('campos.alumnado.tituloLabel', {defaultValue: 'Título:'})} {info_modulo.titulo_fp || t('campos.alumnado.tituloFpFallback', {defaultValue: 'Título de FP'})}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-body font-semibold text-muted-foreground">{t('campos.alumnado.cursoAcademicoLabel', {defaultValue: 'Curso académico'})}</p>
                    <p className="text-subheading font-bold">{info_modulo.curso_academico || "2025/2026"}</p>
                    <p className="text-caption text-muted mt-2">{t('campos.alumnado.fechaLabel', {defaultValue: 'Fecha:'})} {new Date().toLocaleDateString('es-ES')}</p>
                  </div>
                </div>

                {/* Datos del alumnado */}
                <div className="bg-foreground/5 p-6 rounded-xl mb-8 flex items-center justify-between border border-white/5">
                  <div>
                    <p className="text-body text-muted tracking-wider font-semibold mb-1">{t('campos.alumnado.alumnoLabel', {defaultValue: 'Alumno/a'})}</p>
                    <h2 className="text-heading font-bold">{currentStudent.Apellidos}, {currentStudent.Nombre}</h2>
                    <div className="flex gap-4 mt-2 text-body text-muted">
                      <span>{t('campos.alumnado.idLabel', {defaultValue: 'ID:'})} <span className="font-mono text-foreground">{currentStudent.ID}</span></span>
                      {currentStudent.Matricula && <span>{t('campos.alumnado.matriculaLabel', {defaultValue: 'Matrícula:'})} <span className="font-mono text-foreground">{currentStudent.Matricula}</span></span>}
                    </div>
                  </div>
                  <div className="text-right bg-background p-4 rounded-xl shadow-sm border border-white/5">
                    <p className="text-caption text-muted tracking-wider font-semibold mb-1">{t('campos.alumnado.notaMediaLabel', {defaultValue: 'Nota media estimada'})}</p>
                    <div className="text-heading font-black text-accent">{notaMedia}</div>
                  </div>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-foreground/5 p-6 rounded-xl border border-white/5 flex flex-col items-center">
                    <h3 className="text-subheading font-bold mb-4 flex items-center gap-2 w-full">
                      <Target className="w-5 h-5 text-info" /> {t('campos.alumnado.perfilCompetencialTitulo', {defaultValue: 'Perfil competencial (Radar)'})}
                    </h3>
                    <div className="w-full h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 'bold' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: 'currentColor', fontSize: 10 }} />
                          <Radar name={t('campos.alumnado.notaSerieLabel', {defaultValue: 'Nota'})} dataKey="nota" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-foreground/5 p-6 rounded-xl border border-white/5 flex flex-col items-center">
                    <h3 className="text-subheading font-bold mb-4 flex items-center gap-2 w-full">
                      <BarChart className="w-5 h-5 text-success" /> {t('campos.alumnado.nivelLogroRaTitulo', {defaultValue: 'Nivel de Logro por RA'})}
                    </h3>
                    <div className="w-full h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={radarData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                          <XAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 12 }} />
                          <YAxis domain={[0, 10]} tick={{ fill: 'currentColor', fontSize: 12 }} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                          <Bar dataKey="nota" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Desglose de Resultados */}
                <h3 className="text-subheading font-bold mb-4 mt-8 flex items-center gap-2 border-b border-white/10 pb-2">
                  <Award className="w-5 h-5 text-warning" /> {t('campos.alumnado.desgloseRaTitulo', {defaultValue: 'Desglose por Resultados de aprendizaje'})}
                </h3>
                <div className="space-y-4">
                  {radarData.map((ra: any, i: number) => {
                    const isAprobado = ra.nota >= 5;
                    return (
                      <div key={i} className="flex items-center gap-4 bg-foreground/5 p-4 rounded-lg border border-white/5">
                        <div className={`text-heading font-black w-16 text-center ${isAprobado ? 'text-success' : 'text-danger'}`}>
                          {ra.nota.toFixed(1)}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-body mb-1">{ra.subject}</div>
                          <div className="text-caption text-muted leading-tight">{ra.desc || t('campos.alumnado.descripcionNoDisponible', {defaultValue: 'Descripción no disponible en este momento.'})}</div>
                        </div>
                        <div className="w-24 text-right">
                          <span className={`text-caption font-bold px-2 py-1 rounded-full border ${isAprobado ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                            {isAprobado ? t('campos.alumnado.raSuperado', {defaultValue: 'SUPERADO'}) : t('campos.alumnado.raNoSuperado', {defaultValue: 'NO SUPER.'})}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 text-center text-caption text-muted">
                  <p>{t('campos.alumnado.pieInformeAuto', {defaultValue: 'Este informe ha sido generado automáticamente por el sistema de evaluación por competencias.'})}</p>
                  <p className="mt-1">{t('campos.alumnado.pieInformeFecha', {defaultValue: 'Las calificaciones mostradas corresponden a las evaluaciones registradas hasta la fecha de emisión.'})}</p>
                </div>

              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-8 text-muted">
            <Users className="w-12 h-12 text-muted/50 mb-3" />
            <p className="font-semibold text-subheading">{t('campos.alumnado.seleccionaAlumnadoTitulo', {defaultValue: 'Selecciona alumnado'})}</p>
            <p className="text-body opacity-80">{t('campos.alumnado.seleccionaAlumnadoDesc', {defaultValue: 'Elige alumnado del panel izquierdo para visualizar su boletín.'})}</p>
          </div>
        )}
      </div>
    </div>
  );
};
