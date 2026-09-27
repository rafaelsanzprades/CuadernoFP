import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { BookOpen, GraduationCap, HeartHandshake, Layers, Scale, Newspaper, Code2, School, Search, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { acronymsData, CATEGORY_LABELS, CATEGORY_ORDER, AcronymCategory } from "@/data/acronymsData";
import { GUIA_CATALOGO } from "@/data/guiaData";
import { useTranslation } from "react-i18next";

const CATEGORY_ICONS: Record<AcronymCategory, LucideIcon> = {
  metodologia: GraduationCap,
  inclusion: HeartHandshake,
  estructura_fp: Layers,
  normativa: Scale,
  boletines: Newspaper,
  codificacion: Code2,
  otros: School,
};

// El campo `name` de acronymsData sigue la convención "SIGLA. Término
// completo" cuando existe una sigla real (p.ej. "ABP. Aprendizaje Basado en
// Proyectos"). Cuando no hay sigla (p.ej. "Bullying"), `name` es solo el
// término y no se inventa ninguna sigla.
function parseAcronym(name: string): { acronym: string; term: string } {
  const match = name.match(/^([^\s.][^.]{0,19}?)\.\s+(.+)$/);
  if (match) {
    return { acronym: match[1], term: match[2] };
  }
  return { acronym: "", term: name };
}

const CATEGORY_LABEL_KEYS: Record<AcronymCategory, string> = {
  metodologia: 'campos.catalogo.categoriaMetodologia',
  inclusion: 'campos.catalogo.categoriaInclusion',
  estructura_fp: 'campos.catalogo.categoriaEstructuraFp',
  normativa: 'campos.catalogo.categoriaNormativa',
  boletines: 'campos.catalogo.categoriaBoletines',
  codificacion: 'campos.catalogo.categoriaCodificacion',
  otros: 'campos.catalogo.categoriaOtros',
};

export function TabAcronimos() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  const orderedCategories = CATEGORY_ORDER;

  const filteredData = acronymsData.filter(item => {
    const q = searchTerm.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-accent" />
            <h2 className="text-subheading font-bold text-foreground">{t('campos.catalogo.tituloAcronimosGlosario', {defaultValue: 'Acrónimos y glosario'})}</h2>
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
      </Card>

      {orderedCategories.map(category => {
        const items = filteredData.filter(item => item.category === category);
        if (items.length === 0) return null;

        return (
          <div key={category} className="animate-in fade-in duration-300 space-y-3">
            <SectionHeading id={`acronimos-${category}`} icon={CATEGORY_ICONS[category]} scrollMt="260px">
              {t(CATEGORY_LABEL_KEYS[category], {defaultValue: CATEGORY_LABELS[category]})}
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
                  {items.map(item => {
                    const { acronym, term } = parseAcronym(item.name);
                    return (
                      <tr key={item.id} className="hover:bg-foreground/[0.02] transition-colors">
                        <td className="font-bold text-accent whitespace-nowrap">{acronym}</td>
                        <td className="font-medium text-foreground">{term}</td>
                        <td>{item.description}</td>
                      </tr>
                    );
                  })}
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
        <SectionHeading id="acronimos-anexo-catalogo" icon={Code2} scrollMt="260px">
          Anexo: Catálogo de Elementos a Codificar
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
