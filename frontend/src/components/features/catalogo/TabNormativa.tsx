import React, { useState } from 'react';
import { Card } from "@/components/ui/Card";
import { Landmark, Map, FileText, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
    <div className="space-y-8 animate-fade-in">
      <Card className="border-border/50 bg-[var(--glass-bg)] overflow-hidden transition-all shadow-md">
        <div className="px-6 py-5 flex items-center justify-between text-left border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Legislación y Normativa</h2>
              <p className="text-sm text-muted-foreground">Normativa estatal y despliegue autonómico aplicable a la Formación Profesional.</p>
            </div>
          </div>
        </div>
        <div className="p-0 bg-background/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-border/50">
                {/* ── ESTATAL ── */}
                {filteredEstatal.length > 0 && (
                  <tr className="bg-primary/5">
                    <td colSpan={2} className="px-4 py-3 font-bold text-primary flex items-center gap-2">
                      <Landmark className="w-4 h-4" /> Normativa Estatal
                    </td>
                  </tr>
                )}
                {filteredEstatal.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-4 pl-8">
                      <p className="font-medium text-foreground mb-1 leading-relaxed">
                        {item.texto}
                      </p>
                      <p className="text-muted-foreground text-xs italic">
                        {item.descripcion}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-center align-middle w-24">
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center">
                        <Button variant="ghost" size="sm" className="h-10 w-10 text-accent hover:text-accent/80 hover:bg-accent/10">
                          <FileText className="w-6 h-6" />
                        </Button>
                      </a>
                    </td>
                  </tr>
                ))}

                {/* ── AUTONÓMICAS ── */}
                {COMUNIDADES.map(comunidad => {
                  const items = comunidad === 'Aragón' ? filteredAragon : [];
                  const matchComunidad = comunidad.toLowerCase().includes(searchQuery.toLowerCase());
                  
                  // Hide if we are searching and neither the community name nor its items match
                  if (searchQuery !== "" && items.length === 0 && !matchComunidad) return null;

                  return (
                    <React.Fragment key={comunidad}>
                      <tr className="bg-success/5 border-t-2 border-border/50">
                        <td colSpan={2} className="px-4 py-2 font-bold text-success">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <Map className="w-4 h-4" /> Normativa Autonómica ({comunidad})
                            </div>
                            {items.length === 0 && (
                              <span className="text-[10px] uppercase tracking-widest bg-success/10 text-success/70 px-2 py-0.5 rounded border border-success/20">
                                En preparación
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/20 transition-colors border-t border-border/10">
                          <td className="px-4 py-4 pl-8">
                            <p className="font-medium text-foreground mb-1 leading-relaxed">
                              {item.texto}
                            </p>
                            <p className="text-muted-foreground text-xs italic">
                              {item.descripcion}
                            </p>
                          </td>
                          <td className="px-4 py-4 text-center align-middle w-24">
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center">
                              <Button variant="ghost" size="sm" className="h-10 w-10 text-accent hover:text-accent/80 hover:bg-accent/10">
                                <FileText className="w-6 h-6" />
                              </Button>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}

                {/* NO RESULTS */}
                {filteredEstatal.length === 0 && filteredAragon.length === 0 && !COMUNIDADES.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) && (
                  <tr>
                    <td colSpan={2} className="px-4 py-12 text-center text-muted-foreground">
                      No se encontraron resultados para "{searchQuery}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
