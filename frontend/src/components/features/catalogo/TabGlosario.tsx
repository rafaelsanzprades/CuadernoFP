import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { BookOpen, Code2, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { glosarioData, GLOSARIO_CATEGORIAS } from "@/data/glosarioData";
import { GUIA_CATALOGO } from "@/data/guiaData";
import { useTranslation } from "react-i18next";

// Mismo glosario que rafaelsanzprades.es/glosario-fp/ (ver src/data/glosarioData.ts). Las siglas y los términos sin sigla
// van juntos y por orden alfabético dentro de cada categoría; si el término no tiene sigla, esa celda queda vacía.
export function TabGlosario() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  const q = searchTerm.toLowerCase();
  const filteredData = glosarioData.filter(item =>
    item.sigla.toLowerCase().includes(q) || item.termino.toLowerCase().includes(q) || item.descripcion.toLowerCase().includes(q)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-accent" />
            <h2 className="text-subheading font-bold text-foreground">{t('campos.catalogo.tituloAcronimosGlosario', {defaultValue: 'Glosario'})}</h2>
          </div>
          <div className="w-full md:w-72 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted z-10 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <Input
              placeholder={t('placeholders.catalogo.buscarTerminoDescripcion', {defaultValue: 'Buscar término o descripción...'})}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <p className="text-caption text-muted mt-3">
          {t('campos.catalogo.glosarioMismoQueWeb', {defaultValue: 'Es el mismo glosario que el de rafaelsanzprades.es: siglas y términos, por categorías y en orden alfabético.'})}
        </p>
      </Card>

      {GLOSARIO_CATEGORIAS.map(categoria => {
        const items = filteredData.filter(item => item.categoria === categoria.id);
        if (items.length === 0) return null;

        return (
          <div key={categoria.id} className="animate-in fade-in duration-300 space-y-3">
            <SectionHeading id={`glosario-${categoria.id}`} icon={BookOpen} scrollMt="260px">
              {t(`campos.catalogo.glosarioCategoria.${categoria.id}`, {defaultValue: categoria.nombre})}
            </SectionHeading>

            <div className="prose prose-sm dark:prose-invert max-w-none
              prose-table:w-full prose-table:border-collapse prose-table:border-[var(--glass-border)]
              prose-th:border-[var(--glass-border)] prose-th:bg-foreground/5 prose-th:p-2 prose-th:text-left
              prose-td:border-[var(--glass-border)] prose-td:p-2 prose-td:text-muted prose-td:break-words
            ">
              <table>
                <thead>
                  <tr>
                    <th className="w-24">{t('tablas.catalogo.acronimo', {defaultValue: 'Acrónimo'})}</th>
                    <th className="w-1/3">{t('common.nombre', {defaultValue: 'Nombre'})}</th>
                    <th>{t('tablas.catalogo.descripcionCorta', {defaultValue: 'Descripción corta'})}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={`${item.categoria}-${item.sigla}-${item.termino}`} className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="font-bold text-accent whitespace-nowrap">{item.sigla}</td>
                      <td className="font-medium text-foreground">{item.termino}</td>
                      <td>
                        {item.descripcion}
                        {item.enlaces && item.enlaces.length > 0 && (
                          <span className="block mt-1">
                            {item.enlaces.map((e, i) => (
                              <a key={e.url} href={e.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                                {i > 0 ? " · " : ""}{e.texto}
                              </a>
                            ))}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {filteredData.length === 0 && (
        <div className="text-center py-12 text-muted border border-dashed border-[var(--glass-border)] rounded-lg">
          <p>{t('campos.catalogo.sinResultadosParaBusqueda', {termino: searchTerm, defaultValue: 'No se han encontrado resultados para "{{termino}}"'})}</p>
        </div>
      )}

      {/* Anexo: Catálogo de Elementos a Codificar -- traído aquí desde
          Ayuda > Guía (petición de Rafael, 2026-09-27): tiene más sentido
          junto al resto de glosarios/catálogos que dentro de la guía de
          pasos. */}
      <div className="space-y-3">
        <SectionHeading id="glosario-anexo-catalogo" icon={Code2} scrollMt="260px">
          Acrónimos codificados
        </SectionHeading>
        <Card className="p-6 space-y-6">
          {GUIA_CATALOGO.map(grupo => (
            <div key={grupo.numero} className="space-y-3">
              <h4 className="text-body font-bold text-foreground">{grupo.numero}. {grupo.titulo}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {grupo.items.map(item => (
                  <div key={item.code} className="flex items-start gap-2 p-2.5 rounded-lg bg-foreground/5 border border-[var(--glass-border)]">
                    <span className="shrink-0 font-mono text-caption font-bold text-accent bg-accent/10 border border-accent/20 rounded px-1.5 py-0.5">{item.code}</span>
                    <span className="text-body text-muted">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
