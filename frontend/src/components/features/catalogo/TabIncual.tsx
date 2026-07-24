import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/Card";
import { Award, BookOpen, ChevronDown, ChevronUp, ExternalLink, MapPin, Loader2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TabIncualProps {
  globalSelection: any;
  updateGlobalSelection: (updates: any) => void;
}

export function TabIncual({ globalSelection, updateGlobalSelection }: TabIncualProps) {
  const [loading, setLoading] = useState(true);
  const [incualData, setIncualData] = useState<any>(null);
  const [families, setFamilies] = useState<any[]>([]);
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fetch families to map globalSelection.familia to ID
    fetch('/api/families')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setFamilies(data.data);
          const fam = data.data.find((f: any) => f.name === globalSelection.familia);
          if (fam) {
            fetchIncualData(fam.id);
          } else {
            setLoading(false);
          }
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [globalSelection.familia]);

  const fetchIncualData = (id: number) => {
    setLoading(true);
    fetch(`/api/families/${id}/incual`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setIncualData(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
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
        <span className="ml-3 text-muted">Cargando datos del Catálogo Nacional (INCUAL)...</span>
      </div>
    );
  }

  if (!incualData) {
    return (
      <div className="text-center py-20 border border-dashed rounded-xl border-accent/20">
        <h3 className="text-lg font-medium text-muted">No se encontraron datos INCUAL para la familia {globalSelection.familia}</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera Familia */}
      <Card className="p-6 bg-gradient-to-br from-card to-accent/5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-500" />
              {globalSelection.familia}
            </h2>
            <p className="mt-2 text-sm text-muted line-clamp-3">
              {incualData.description || 'Sin descripción disponible.'}
            </p>
          </div>
        </div>
      </Card>

      {/* Oferta Formativa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <h3 className="font-semibold flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-500" /> Grado C (Certificados)</h3>
          <p className="text-2xl font-bold mt-2">{incualData.oferta_grado_c?.length || 0}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <h3 className="font-semibold flex items-center gap-2"><BookOpen className="w-4 h-4 text-green-500" /> Grado D (Ciclos)</h3>
          <p className="text-2xl font-bold mt-2">{incualData.oferta_grado_d?.length || 0}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-purple-500">
          <h3 className="font-semibold flex items-center gap-2"><BookOpen className="w-4 h-4 text-purple-500" /> Grado E (Especialización)</h3>
          <p className="text-2xl font-bold mt-2">{incualData.oferta_grado_e?.length || 0}</p>
        </Card>
      </div>

      {/* Centros de Referencia Nacional (CRN) */}
      {incualData.crn_centers && incualData.crn_centers.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" />
            Centros de Referencia Nacional (CRN)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incualData.crn_centers.map((crn: any, idx: number) => (
              <div key={idx} className="p-4 rounded-lg bg-muted/30 border">
                <a href={crn.url} target="_blank" rel="noreferrer" className="font-medium text-accent hover:underline flex items-center gap-1">
                  {crn.name} <ExternalLink className="w-3 h-3" />
                </a>
                <p className="text-sm mt-2"><span className="text-muted">Áreas:</span> {crn.areas}</p>
                <p className="text-sm"><span className="text-muted">Titular:</span> {crn.titular}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Listado de ECPs */}
      <h3 className="text-lg font-bold mt-8 mb-4">Estándares de competencia profesional (ECP)</h3>
      
      <div className="space-y-4">
        {/* Nivel 1 */}
        <Card className="overflow-hidden">
          <Button variant="ghost" className="w-full flex items-center justify-between p-4 h-auto rounded-none" onClick={() => toggleLevel('1')}>
            <span className="font-semibold text-lg">Nivel 1 ({incualData.ecp_nivel_1?.length || 0})</span>
            {expandedLevel === '1' ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
          </Button>
          {expandedLevel === '1' && (
            <div className="p-4 pt-0 border-t bg-muted/10 space-y-3">
              {incualData.ecp_nivel_1?.map((ecp: any, idx: number) => (
                <div key={idx} className="p-3 bg-card border rounded-md shadow-sm">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-mono rounded mb-2">{ecp.code}</span>
                      <h4 className="font-medium">{ecp.title}</h4>
                      <p className="text-sm text-muted mt-1">{ecp.description}</p>
                    </div>
                    {ecp.pdf_url && (
                      <a href={ecp.pdf_url} target="_blank" rel="noreferrer" className="flex items-center text-xs font-semibold px-3 py-1.5 rounded-xl border border-info/30 bg-info/10 text-info hover:bg-info/20 transition-all shrink-0">
                        <ExternalLink className="w-4 h-4 mr-2" /> PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {(!incualData.ecp_nivel_1 || incualData.ecp_nivel_1.length === 0) && (
                <p className="text-sm text-muted">No hay estándares de Nivel 1 para esta familia.</p>
              )}
            </div>
          )}
        </Card>

        {/* Nivel 2 */}
        <Card className="overflow-hidden">
          <Button variant="ghost" className="w-full flex items-center justify-between p-4 h-auto rounded-none" onClick={() => toggleLevel('2')}>
            <span className="font-semibold text-lg">Nivel 2 ({incualData.ecp_nivel_2?.length || 0})</span>
            {expandedLevel === '2' ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
          </Button>
          {expandedLevel === '2' && (
            <div className="p-4 pt-0 border-t bg-muted/10 space-y-3">
              {incualData.ecp_nivel_2?.map((ecp: any, idx: number) => (
                <div key={idx} className="p-3 bg-card border rounded-md shadow-sm">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-mono rounded mb-2">{ecp.code}</span>
                      <h4 className="font-medium">{ecp.title}</h4>
                      <p className="text-sm text-muted mt-1">{ecp.description}</p>
                    </div>
                    {ecp.pdf_url && (
                      <a href={ecp.pdf_url} target="_blank" rel="noreferrer" className="flex items-center text-xs font-semibold px-3 py-1.5 rounded-xl border border-info/30 bg-info/10 text-info hover:bg-info/20 transition-all shrink-0">
                        <ExternalLink className="w-4 h-4 mr-2" /> PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {(!incualData.ecp_nivel_2 || incualData.ecp_nivel_2.length === 0) && (
                <p className="text-sm text-muted">No hay estándares de Nivel 2 para esta familia.</p>
              )}
            </div>
          )}
        </Card>

        {/* Nivel 3 */}
        <Card className="overflow-hidden">
          <Button variant="ghost" className="w-full flex items-center justify-between p-4 h-auto rounded-none" onClick={() => toggleLevel('3')}>
            <span className="font-semibold text-lg">Nivel 3 ({incualData.ecp_nivel_3?.length || 0})</span>
            {expandedLevel === '3' ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
          </Button>
          {expandedLevel === '3' && (
            <div className="p-4 pt-0 border-t bg-muted/10 space-y-3">
              {incualData.ecp_nivel_3?.map((ecp: any, idx: number) => (
                <div key={idx} className="p-3 bg-card border rounded-md shadow-sm">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs font-mono rounded mb-2">{ecp.code}</span>
                      <h4 className="font-medium">{ecp.title}</h4>
                      <p className="text-sm text-muted mt-1">{ecp.description}</p>
                    </div>
                    {ecp.pdf_url && (
                      <a href={ecp.pdf_url} target="_blank" rel="noreferrer" className="flex items-center text-xs font-semibold px-3 py-1.5 rounded-xl border border-info/30 bg-info/10 text-info hover:bg-info/20 transition-all shrink-0">
                        <ExternalLink className="w-4 h-4 mr-2" /> PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {(!incualData.ecp_nivel_3 || incualData.ecp_nivel_3.length === 0) && (
                <p className="text-sm text-muted">No hay estándares de Nivel 3 para esta familia.</p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
