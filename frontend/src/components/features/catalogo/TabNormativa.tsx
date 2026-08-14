import React, { useState } from 'react';
import { Card } from "@/components/ui/Card";
import { Landmark, Map, FileText, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AccordionBlock } from "@/components/ui/AccordionBlock";

interface NormativaItem {
  id: string;
  texto: string;
  descripcion: string;
  link: string;
}

const NORMATIVA_ESTATAL: NormativaItem[] = [
  {
    id: "LO_2_2006",
    texto: "LEY ORGÁNICA 2/2006, de 3 de mayo, de Educación (BOE núm. 106, de 4 de mayo de 2006), modificada por la LEY ORGÁNICA 3/2020, de 29 de diciembre.",
    descripcion: "Ley fundamental que regula el sistema educativo español (LOE-LOMLOE).",
    link: "https://www.boe.es/buscar/act.php?id=BOE-A-2006-7899"
  },
  {
    id: "LO_3_2022",
    texto: "LEY ORGÁNICA 3/2022, de 31 de marzo, de ordenación e integración de la Formación Profesional (BOE núm. 78, de 01 de abril de 2022).",
    descripcion: "Nueva ley de FP que integra el sistema de Formación Profesional.",
    link: "https://www.boe.es/buscar/act.php?id=BOE-A-2022-5139"
  },
  {
    id: "RD_659_2023",
    texto: "REAL DECRETO 659/2023, de 18 de julio, por el que se desarrolla la ordenación del Sistema de Formación Profesional (BOE núm. 174, de 22 de julio de 2023).",
    descripcion: "Desarrollo reglamentario del nuevo sistema de Formación Profesional.",
    link: "https://www.boe.es/buscar/act.php?id=BOE-A-2023-16889"
  },
  {
    id: "RD_69_2025",
    texto: "REAL DECRETO 69/2025, de 4 de febrero, por el que se desarrollan los elementos integrantes y los instrumentos de gestión del Sistema Nacional de Formación Profesional.",
    descripcion: "Elementos e instrumentos de gestión del sistema de FP.",
    link: "https://www.boe.es/diario_boe/"
  },
  {
    id: "RD_TITULO",
    texto: "REAL DECRETO por el que se establece el título del grado D o E correspondiente.",
    descripcion: "Normativa específica que crea el título y fija sus enseñanzas mínimas.",
    link: "https://todofp.es/que-estudiar.html"
  }
];

const NORMATIVA_AUTONOMICA_ARAGON: NormativaItem[] = [
  {
    id: "D_91_2024",
    texto: "DECRETO 91/2024, de 5 de junio, del Gobierno de Aragón por el que se establece la Ordenación de la Formación Profesional del Grado D y del Grado E en la Comunidad Autónoma de Aragón (BOA núm. 109, de 06 de junio de 2024).",
    descripcion: "Ordenación autonómica de los grados D y E en Aragón.",
    link: "https://www.boa.aragon.es/"
  },
  {
    id: "O_841_2024",
    texto: "ORDEN ECD/841/2024, de 25 de julio, por la que se regulan aspectos organizativos del currículo y se establecen los currículos de determinados Ciclos Formativos de Formación Profesional de Grado Básico para la Comunidad Autónoma de Aragón (BOA núm. 148, de 31 de julio de 2024).",
    descripcion: "Organización y currículo de Ciclos Formativos de Grado Básico.",
    link: "https://www.boa.aragon.es/"
  },
  {
    id: "O_842_2024",
    texto: "ORDEN ECD/842/2024, de 25 de julio, por la que se regulan aspectos organizativos del currículo y se establecen los currículos de determinados Ciclos Formativos de Formación Profesional de Grado Medio para la Comunidad Autónoma de Aragón (BOA núm. 148, de 31 de julio de 2024).",
    descripcion: "Organización y currículo de Ciclos Formativos de Grado Medio.",
    link: "https://www.boa.aragon.es/"
  },
  {
    id: "O_843_2024",
    texto: "ORDEN ECD/843/2024, de 25 de julio, por la que se regulan aspectos organizativos del currículo y se establecen los currículos de determinados Ciclos Formativos de Formación Profesional de Grado Superior para la Comunidad Autónoma de Aragón (BOA núm. 148, de 31 de julio de 2024).",
    descripcion: "Organización y currículo de Ciclos Formativos de Grado Superior.",
    link: "https://www.boa.aragon.es/"
  },
  {
    id: "R_6_JUN_2025",
    texto: "RESOLUCIÓN de 6 de junio de 2025, del Director General de Planificación, Centros y Formación Profesional, por la que se autorizan los módulos optativos de los centros docentes.",
    descripcion: "Autorización de módulos optativos en centros.",
    link: "https://www.boa.aragon.es/"
  },
  {
    id: "R_10_JUL_2025",
    texto: "RESOLUCIÓN de 10 de julio de 2025, del Director General de Planificación, Centros y Formación Profesional, por la que se establece el currículo de los módulos optativos.",
    descripcion: "Currículo aplicable a los módulos optativos autonómicos.",
    link: "https://www.boa.aragon.es/"
  },
  {
    id: "R_11_JUN_2025",
    texto: "RESOLUCIÓN de 11 de junio de 2025, del Director General de Planificación, Centros y Formación Profesional, por la que se determinan los módulos profesionales en las modalidades virtual y semipresencial.",
    descripcion: "Regulación de modalidades virtual y semipresencial.",
    link: "https://www.boa.aragon.es/"
  },
  {
    id: "R_1_JUL_2025",
    texto: "RESOLUCIÓN de 1 de julio de 2025, del Director General de Planificación, Centros y Formación Profesional, por la que se regula la organización y la distribución horaria de varios Cursos de Especialización de Formación Profesional (Grado E).",
    descripcion: "Organización y horario de los Cursos de Especialización (Grado E).",
    link: "https://www.boa.aragon.es/"
  },
  {
    id: "O_1005_2018",
    texto: "ORDEN ECD/1005/2018, de 7 de junio, por la que se regulan las actuaciones de intervención educativa inclusiva (BOA núm. 106, de 18 de junio de 2018).",
    descripcion: "Normativa sobre inclusión y equidad educativa en Aragón.",
    link: "https://www.boa.aragon.es/"
  },
  {
    id: "O_INSTRUCCIONES",
    texto: "ORDEN por la que se aprueban las Instrucciones del tipo de centro en relación con el curso actual.",
    descripcion: "Instrucciones anuales de inicio de curso para centros de FP.",
    link: "https://www.boa.aragon.es/"
  }
];

const COMUNIDADES = [
  "Andalucía", "Aragón", "Asturias", "Baleares", "Canarias", "Cantabria", 
  "Castilla-La Mancha", "Castilla y León", "Cataluña", "Comunidad Valenciana", "Extremadura", 
  "Galicia", "Madrid", "Murcia", "Navarra", "País Vasco", "La Rioja", "Ceuta", "Melilla"
].sort();

interface Props {
  searchQuery?: string;
}

export function TabNormativa({ searchQuery = "" }: Props) {
  const filteredEstatal = NORMATIVA_ESTATAL.filter(item => 
    item.texto.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredAragon = NORMATIVA_AUTONOMICA_ARAGON.filter(item => 
    item.texto.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      <div className="px-2 mb-6">
        <h2 className="text-subheading font-bold flex items-center gap-3">
          <span className="p-2 bg-primary/10 rounded-lg text-primary shrink-0"><Landmark className="w-5 h-5" /></span>
          Referencias bibliográficas
        </h2>
      </div>

      {filteredEstatal.length > 0 && (
        <AccordionBlock
          title="Normativa Estatal"
          icon={<Landmark className="w-5 h-5" />}
          defaultOpen={true}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body">
              <tbody className="divide-y divide-border/50">
                {filteredEstatal.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 pr-4">
                      <p className="font-medium text-foreground mb-1 leading-relaxed">
                        {item.texto}
                      </p>
                      <p className="text-muted-foreground text-caption italic">
                        {item.descripcion}
                      </p>
                    </td>
                    <td className="py-4 text-right align-middle w-16">
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center">
                        <Button variant="ghost" size="sm" className="h-10 w-10 text-accent hover:text-accent/80 hover:bg-accent/10">
                          <FileText className="w-6 h-6" />
                        </Button>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AccordionBlock>
      )}

      {COMUNIDADES.map(comunidad => {
        const items = comunidad === 'Aragón' ? filteredAragon : [];
        const matchComunidad = comunidad.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Hide if we are searching and neither the community name nor its items match
        if (searchQuery !== "" && items.length === 0 && !matchComunidad) return null;

        return (
          <AccordionBlock
            key={comunidad}
            title={`Normativa Autonómica (${comunidad})`}
            icon={<Map className="w-5 h-5" />}
            defaultOpen={items.length > 0 && searchQuery !== ""}
          >
            {items.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                 <span className="text-caption tracking-widest bg-success/10 text-success/70 px-3 py-1 rounded border border-success/20">
                   En preparación
                 </span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-body">
                  <tbody className="divide-y divide-border/50">
                    {items.map(item => (
                      <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-4 pr-4">
                          <p className="font-medium text-foreground mb-1 leading-relaxed">
                            {item.texto}
                          </p>
                          <p className="text-muted-foreground text-caption italic">
                            {item.descripcion}
                          </p>
                        </td>
                        <td className="py-4 text-right align-middle w-16">
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center">
                            <Button variant="ghost" size="sm" className="h-10 w-10 text-accent hover:text-accent/80 hover:bg-accent/10">
                              <FileText className="w-6 h-6" />
                            </Button>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AccordionBlock>
        );
      })}

      {/* NO RESULTS */}
      {filteredEstatal.length === 0 && filteredAragon.length === 0 && !COMUNIDADES.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) && (
        <div className="py-12 text-center text-muted-foreground border border-border/50 rounded-xl bg-surface/50">
          No se encontraron resultados para "{searchQuery}".
        </div>
      )}
    </div>
  );
}
