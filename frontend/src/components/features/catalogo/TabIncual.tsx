import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/Card";
import { Award, BookOpen, ChevronDown, ChevronUp, ExternalLink, MapPin, Loader2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";

interface TabIncualProps {
  globalSelection: any;
  updateGlobalSelection: (updates: any) => void;
}

export function TabIncual({ globalSelection, updateGlobalSelection }: TabIncualProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [incualData, setIncualData] = useState<any>(null);
  const [families, setFamilies] = useState<any[]>([]);
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/families')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setFamilies(data.data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (families.length === 0) return;
    if (globalSelection.familia) {
      const fam = families.find((f: any) => f.name === globalSelection.familia);
      if (fam) {
        fetchIncualData(fam.id);
      } else {
        setIncualData(null);
        setLoading(false);
      }
    } else {
      setIncualData(null);
      setLoading(false);
    }
  }, [globalSelection.familia, families]);

  const fetchIncualData = (id: number) => {
    setLoading(true);
    fetch(`/api/families/${id}/incual`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setIncualData(data.data);
        } else {
          setIncualData(null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIncualData(null);
        setLoading(false);
      });
  };

  const toggleLevel = (level: string) => {
    setExpandedLevel(expandedLevel === level ? null : level);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <span className="ml-3 text-muted">{t('campos.catalogo.cargandoIncual', {defaultValue: 'Cargando datos del Catálogo Nacional (INCUAL)...'})}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Selector Familia */}
        <Card className="p-6 bg-gradient-to-br from-card to-accent/5 lg:col-span-2 flex flex-col justify-center gap-2">
          <label htmlFor="select-familia-incual" className="text-caption font-semibold text-muted tracking-wider">
            {t('campos.catalogo.labelFamiliaProfesional', {defaultValue: 'Familia Profesional'})}
          </label>
          <div className="relative">
            <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500 pointer-events-none" />
            <select
              id="select-familia-incual"
              value={globalSelection.familia}
              onChange={(e) => {
                updateGlobalSelection({ familia: e.target.value, tituloCodigo: "", moduloCodigo: "" });
              }}
              className="w-full bg-background/50 border border-[var(--glass-border)] rounded-xl pl-10 pr-4 py-3 text-body text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer appearance-none"
            >
              <option value="">{t('checks.catalogo.seleccionaFamilia', {defaultValue: '-- Selecciona Familia --'})}</option>
              {families.map((f) => (
                <option key={f.id} value={f.name}>{f.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          </div>
          {incualData?.description && (
            <p className="mt-2 text-body text-muted line-clamp-2">
              {incualData.description}
            </p>
          )}
        </Card>

        {/* Oferta Formativa */}
        <Card className="p-4 border-l-4 border-l-blue-500 lg:col-span-1 flex flex-col justify-center">
          <h3 className="font-semibold flex items-start gap-2 text-body leading-snug">
            <BookOpen className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span>{t('campos.catalogo.gradoCTitulo', {defaultValue: 'Grado C'})}<br/><span className="font-normal text-muted-foreground">{t('campos.catalogo.gradoCDesc', {defaultValue: '(Certificados)'})}</span></span>
          </h3>
          <p className="text-heading font-bold mt-2 text-right">{incualData?.oferta_grado_c?.length || 0}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500 lg:col-span-1 flex flex-col justify-center">
          <h3 className="font-semibold flex items-start gap-2 text-body leading-snug">
            <BookOpen className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            <span>{t('campos.catalogo.gradoDTitulo', {defaultValue: 'Grado D'})}<br/><span className="font-normal text-muted-foreground">{t('campos.catalogo.gradoDDesc', {defaultValue: '(Ciclos)'})}</span></span>
          </h3>
          <p className="text-heading font-bold mt-2 text-right">{incualData?.oferta_grado_d?.length || 0}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-purple-500 lg:col-span-1 flex flex-col justify-center">
          <h3 className="font-semibold flex items-start gap-2 text-body leading-snug">
            <BookOpen className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
            <span>{t('campos.catalogo.gradoETitulo', {defaultValue: 'Grado E'})}<br/><span className="font-normal text-muted-foreground">{t('campos.catalogo.gradoEDesc', {defaultValue: '(Especialización)'})}</span></span>
          </h3>
          <p className="text-heading font-bold mt-2 text-right">{incualData?.oferta_grado_e?.length || 0}</p>
        </Card>
      </div>

      {!incualData && globalSelection.familia && (
        <div className="text-center py-20 border border-dashed rounded-xl border-accent/20">
          <h3 className="text-subheading font-medium text-muted">{t('campos.catalogo.sinDatosIncualFamilia', {familia: globalSelection.familia, defaultValue: 'No se encontraron datos INCUAL para la familia {{familia}}'})}</h3>
        </div>
      )}

      {!globalSelection.familia && (
        <div className="text-center py-20 border border-dashed rounded-xl border-accent/20">
          <h3 className="text-subheading font-medium text-muted">{t('campos.catalogo.seleccionaFamiliaEstandares', {defaultValue: 'Selecciona una familia profesional para ver sus estándares de competencia'})}</h3>
        </div>
      )}

      {incualData && (
        <>

      {/* Centros de Referencia Nacional (CRN) */}
      {incualData.crn_centers && incualData.crn_centers.length > 0 && (
        <Card className="p-6">
          <h3 className="text-subheading font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" />
            {t('campos.catalogo.tituloCrn', {defaultValue: 'Centros de Referencia Nacional (CRN)'})}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incualData.crn_centers.map((crn: any, idx: number) => (
              <div key={idx} className="p-4 rounded-lg bg-muted/30 border">
                <a href={crn.url} target="_blank" rel="noreferrer" className="font-medium text-accent hover:underline flex items-center gap-1">
                  {crn.name} <ExternalLink className="w-3 h-3" />
                </a>
                <p className="text-body mt-2"><span className="text-muted">{t('campos.catalogo.labelAreasCrn', {defaultValue: 'Áreas:'})}</span> {crn.areas}</p>
                <p className="text-body"><span className="text-muted">{t('campos.catalogo.labelTitularCrn', {defaultValue: 'Titular:'})}</span> {crn.titular}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Listado de ECPs */}
      <h3 className="text-subheading font-bold mt-8 mb-4">{t('campos.catalogo.tituloEcp', {defaultValue: 'Estándares de competencia profesional (ECP)'})}</h3>
      
      <div className="space-y-4">
        {/* Nivel 1 */}
        <Card className="overflow-hidden">
          <button 
            className="w-full flex items-center justify-between p-4 bg-background hover:bg-muted/10 transition-colors focus:outline-none" 
            onClick={() => toggleLevel('1')}
          >
            <span className="font-semibold text-subheading text-foreground">{t('campos.catalogo.nivelEcpTitulo', {nivel: 1, count: incualData.ecp_nivel_1?.length || 0, defaultValue: 'Nivel {{nivel}} ({{count}})'})}</span>
            {expandedLevel === '1' ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
          </button>
          {expandedLevel === '1' && (
            <div className="p-4 pt-0 border-t bg-muted/10 space-y-3">
              {incualData.ecp_nivel_1?.map((ecp: any, idx: number) => (
                <div key={idx} className="p-3 bg-card border rounded-md shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start gap-4">
                    <div className="text-body leading-relaxed">
                      <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-caption font-mono rounded mr-3 align-middle">{ecp.code}</span>
                      <span className="font-medium text-foreground align-middle">{ecp.title}</span>
                      {ecp.description && <span className="text-muted ml-2 align-middle">- {ecp.description}</span>}
                    </div>
                    {ecp.pdf_url && (
                      <a href={ecp.pdf_url} target="_blank" rel="noreferrer" className="flex items-center text-caption font-semibold px-3 py-1.5 rounded-xl border border-info/30 bg-info/10 text-info hover:bg-info/20 transition-all shrink-0">
                        <ExternalLink className="w-4 h-4 mr-2" /> {t('campos.catalogo.enlacePdf', {defaultValue: 'PDF'})}
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {(!incualData.ecp_nivel_1 || incualData.ecp_nivel_1.length === 0) && (
                <p className="text-body text-muted">{t('campos.catalogo.sinEstandaresNivel', {nivel: 1, defaultValue: 'No hay estándares de Nivel {{nivel}} para esta familia.'})}</p>
              )}
            </div>
          )}
        </Card>

        {/* Nivel 2 */}
        <Card className="overflow-hidden">
          <button 
            className="w-full flex items-center justify-between p-4 bg-background hover:bg-muted/10 transition-colors focus:outline-none" 
            onClick={() => toggleLevel('2')}
          >
            <span className="font-semibold text-subheading text-foreground">{t('campos.catalogo.nivelEcpTitulo', {nivel: 2, count: incualData.ecp_nivel_2?.length || 0, defaultValue: 'Nivel {{nivel}} ({{count}})'})}</span>
            {expandedLevel === '2' ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
          </button>
          {expandedLevel === '2' && (
            <div className="p-4 pt-0 border-t bg-muted/10 space-y-3">
              {incualData.ecp_nivel_2?.map((ecp: any, idx: number) => (
                <div key={idx} className="p-3 bg-card border rounded-md shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start gap-4">
                    <div className="text-body leading-relaxed">
                      <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-caption font-mono rounded mr-3 align-middle">{ecp.code}</span>
                      <span className="font-medium text-foreground align-middle">{ecp.title}</span>
                      {ecp.description && <span className="text-muted ml-2 align-middle">- {ecp.description}</span>}
                    </div>
                    {ecp.pdf_url && (
                      <a href={ecp.pdf_url} target="_blank" rel="noreferrer" className="flex items-center text-caption font-semibold px-3 py-1.5 rounded-xl border border-info/30 bg-info/10 text-info hover:bg-info/20 transition-all shrink-0">
                        <ExternalLink className="w-4 h-4 mr-2" /> {t('campos.catalogo.enlacePdf', {defaultValue: 'PDF'})}
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {(!incualData.ecp_nivel_2 || incualData.ecp_nivel_2.length === 0) && (
                <p className="text-body text-muted">{t('campos.catalogo.sinEstandaresNivel', {nivel: 2, defaultValue: 'No hay estándares de Nivel {{nivel}} para esta familia.'})}</p>
              )}
            </div>
          )}
        </Card>

        {/* Nivel 3 */}
        <Card className="overflow-hidden">
          <button 
            className="w-full flex items-center justify-between p-4 bg-background hover:bg-muted/10 transition-colors focus:outline-none" 
            onClick={() => toggleLevel('3')}
          >
            <span className="font-semibold text-subheading text-foreground">{t('campos.catalogo.nivelEcpTitulo', {nivel: 3, count: incualData.ecp_nivel_3?.length || 0, defaultValue: 'Nivel {{nivel}} ({{count}})'})}</span>
            {expandedLevel === '3' ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
          </button>
          {expandedLevel === '3' && (
            <div className="p-4 pt-0 border-t bg-muted/10 space-y-3">
              {incualData.ecp_nivel_3?.map((ecp: any, idx: number) => (
                <div key={idx} className="p-3 bg-card border rounded-md shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start gap-4">
                    <div className="text-body leading-relaxed">
                      <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 text-caption font-mono rounded mr-3 align-middle">{ecp.code}</span>
                      <span className="font-medium text-foreground align-middle">{ecp.title}</span>
                      {ecp.description && <span className="text-muted ml-2 align-middle">- {ecp.description}</span>}
                    </div>
                    {ecp.pdf_url && (
                      <a href={ecp.pdf_url} target="_blank" rel="noreferrer" className="flex items-center text-caption font-semibold px-3 py-1.5 rounded-xl border border-info/30 bg-info/10 text-info hover:bg-info/20 transition-all shrink-0">
                        <ExternalLink className="w-4 h-4 mr-2" /> {t('campos.catalogo.enlacePdf', {defaultValue: 'PDF'})}
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {(!incualData.ecp_nivel_3 || incualData.ecp_nivel_3.length === 0) && (
                <p className="text-body text-muted">{t('campos.catalogo.sinEstandaresNivel', {nivel: 3, defaultValue: 'No hay estándares de Nivel {{nivel}} para esta familia.'})}</p>
              )}
            </div>
          )}
        </Card>
      </div>
        </>
      )}
    </div>
  );
}
