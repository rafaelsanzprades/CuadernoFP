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

export function TabNormativa() {
  const [expandedCommunity, setExpandedCommunity] = useState<string | null>("Aragón");

  const toggleCommunity = (comunidad: string) => {
    setExpandedCommunity(prev => prev === comunidad ? null : comunidad);
  };

  const renderTable = (items: NormativaItem[]) => (
    <div className="overflow-x-auto border border-border/50 rounded-lg">
      <table className="w-full text-left text-sm">
        <tbody className="divide-y divide-border/50">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-muted/20 transition-colors">
              <td className="px-4 py-4">
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
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="p-6 border-border/50 bg-[var(--glass-bg)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Normativa Estatal</h2>
            <p className="text-sm text-muted-foreground">Legislación de ámbito nacional aplicable a la Formación Profesional.</p>
          </div>
        </div>
        {renderTable(NORMATIVA_ESTATAL)}
      </Card>

      <Card className="p-6 border-border/50 bg-[var(--glass-bg)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-success/10 rounded-lg text-success">
            <Map className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Normativa Autonómica</h2>
            <p className="text-sm text-muted-foreground">Despliegue del currículo base en cada Comunidad Autónoma.</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {COMUNIDADES.map((comunidad) => {
            const isExpanded = expandedCommunity === comunidad;
            const hasData = comunidad === "Aragón";

            return (
              <div 
                key={comunidad} 
                className={`border rounded-lg overflow-hidden transition-all duration-300 ${isExpanded ? 'border-success/50 shadow-md bg-foreground/5' : 'border-border/50 bg-background/30 hover:bg-foreground/5'}`}
              >
                <button
                  onClick={() => toggleCommunity(comunidad)}
                  aria-expanded={isExpanded}
                  aria-controls={`panel-${comunidad.replace(/\s+/g, '-')}`}
                  className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold text-base transition-colors ${isExpanded ? 'text-success' : 'text-foreground'}`}>
                      {comunidad}
                    </span>
                    {hasData && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/20 text-success border border-success/30 uppercase tracking-widest">
                        Disponible
                      </span>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-success" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted" />
                  )}
                </button>
                
                {isExpanded && (
                  <div id={`panel-${comunidad.replace(/\s+/g, '-')}`} className="border-t border-border/50 p-5 bg-background">
                    {hasData ? (
                      renderTable(NORMATIVA_AUTONOMICA_ARAGON)
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-foreground/5 rounded-lg border border-dashed border-border/50">
                        <Info className="w-10 h-10 text-muted mb-4 opacity-50" />
                        <p className="text-foreground font-medium text-lg">Normativa en preparación</p>
                        <p className="text-sm text-muted-foreground mt-2 max-w-md">Próximamente se añadirá el despliegue curricular y normativo específico para esta comunidad.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
