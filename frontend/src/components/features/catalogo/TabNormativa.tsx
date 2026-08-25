import React, { useState } from 'react';
import { Card } from "@/components/ui/Card";
import { Landmark, Map, FileText, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AccordionBlock } from "@/components/ui/AccordionBlock";
import { useTranslation } from "react-i18next";

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
    id: "RD_498_2024",
    texto: "REAL DECRETO 498/2024, de 21 de mayo, por el que se modifican determinados reales decretos por los que se establecen títulos de Formación Profesional de grado básico y se fijan sus enseñanzas mínimas (BOE núm. 129, de 28 de mayo de 2024).",
    descripcion: "Adaptación de los títulos de Grado Básico al Real Decreto 659/2023.",
    link: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2024-10683"
  },
  {
    id: "RD_499_2024",
    texto: "REAL DECRETO 499/2024, de 21 de mayo, por el que se modifican determinados reales decretos por los que se establecen títulos de Formación Profesional de grado medio y se fijan sus enseñanzas mínimas (BOE núm. 129, de 28 de mayo de 2024).",
    descripcion: "Adaptación de los títulos de Grado Medio al Real Decreto 659/2023.",
    link: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2024-10684"
  },
  {
    id: "RD_500_2024",
    texto: "REAL DECRETO 500/2024, de 21 de mayo, por el que se modifican determinados reales decretos por los que se establecen títulos de Formación Profesional de grado superior y se fijan sus enseñanzas mínimas (BOE núm. 129, de 28 de mayo de 2024).",
    descripcion: "Adaptación de los títulos de Grado Superior al Real Decreto 659/2023.",
    link: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2024-10685"
  },
  {
    id: "RD_497_2024",
    texto: "REAL DECRETO 497/2024, de 21 de mayo, por el que se modifican determinados reales decretos por los que se establecen, en el ámbito de la Formación Profesional, cursos de especialización de grado medio y superior y se fijan sus enseñanzas mínimas (BOE núm. 129, de 28 de mayo de 2024).",
    descripcion: "Adaptación de los Cursos de Especialización (Grado E) al Real Decreto 659/2023.",
    link: "https://www.boe.es/buscar/doc.php?id=BOE-A-2024-10682"
  },
  {
    id: "RD_69_2025",
    texto: "REAL DECRETO 69/2025, de 4 de febrero, por el que se desarrollan los elementos integrantes y los instrumentos de gestión del Sistema Nacional de Formación Profesional, y se modifica el Real Decreto 375/1999, de 5 de marzo, por el que se crea el Instituto Nacional de las Cualificaciones (BOE núm. 31, de 5 de febrero de 2025).",
    descripcion: "Elementos e instrumentos de gestión del sistema de FP.",
    link: "https://www.boe.es/buscar/doc.php?id=BOE-A-2025-2039"
  },
  {
    id: "RD_532_2025",
    texto: "REAL DECRETO 532/2025, de 24 de junio, por el que se incluyen determinados estándares de competencias profesionales y se integran los estándares derivados de las antiguas unidades de competencia del Real Decreto 1128/2003, en el Catálogo Nacional de Estándares de Competencias Profesionales (BOE núm. 151, de 25 de junio de 2025).",
    descripcion: "Integración de estándares de competencias profesionales en el Catálogo Nacional (ECP).",
    link: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-13147"
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

const NORMATIVA_AUTONOMICA_VALENCIA: NormativaItem[] = [
  {
    id: "D_117_2025",
    texto: "DECRETO 117/2025, de 5 de agosto, del Consell, por el que se establecen los currículos de los ciclos formativos de Grado Básico de Formación Profesional en la Comunitat Valenciana (DOGV núm. 10182, de 13 de agosto de 2025).",
    descripcion: "Currículos de los ciclos de Grado Básico en la Comunitat Valenciana.",
    link: "https://dogv.gva.es/datos/2025/08/13/pdf/2025_32763_es.pdf"
  },
  {
    id: "D_114_2025",
    texto: "DECRETO 114/2025, de 29 de julio, del Consell, por el que se establecen los currículos de los ciclos formativos de Grado Medio y Grado Superior de Formación Profesional en la Comunitat Valenciana (DOGV núm. 10175, de 4 de agosto de 2025).",
    descripcion: "Currículos de los ciclos de Grado Medio y Grado Superior en la Comunitat Valenciana.",
    link: "https://dogv.gva.es/datos/2025/08/04/pdf/2025_29742_es.pdf"
  },
  {
    id: "D_95_2026",
    texto: "DECRETO 95/2026, de 19 de junio, del Consell, por el que se establecen los currículos de los Cursos de Especialización de Formación Profesional en la Comunitat Valenciana (DOGV núm. 10346, de 25 de junio de 2026).",
    descripcion: "Currículos de los Cursos de Especialización (Grado E) en la Comunitat Valenciana.",
    link: "https://dogv.gva.es/datos/2026/06/25/pdf/2026_21170_es.pdf"
  },
  {
    id: "O_30_2022",
    texto: "ORDEN 30/2022, de 12 de mayo, de la Conselleria de Educación, Cultura y Deporte, por la que se regula la organización de la enseñanza de los ciclos formativos de Formación Profesional en régimen semipresencial (DOGV núm. 9331, de 18 de mayo de 2022).",
    descripcion: "Modalidad semipresencial de los ciclos formativos.",
    link: "https://dogv.gva.es/datos/2022/05/18/pdf/2022_4219.pdf"
  },
  {
    id: "O_20_2019",
    texto: "ORDEN 20/2019, de 30 de abril, de la Conselleria de Educación, Investigación, Cultura y Deporte, por la que se regula la organización de la respuesta educativa para la inclusión del alumnado en centros docentes sostenidos con fondos públicos (DOGV núm. 8543, de 3 de mayo de 2019).",
    descripcion: "Intervención educativa inclusiva en la Comunitat Valenciana (norma general del sistema educativo, aplicable también a FP).",
    link: "https://dogv.gva.es/datos/2019/05/03/pdf/2019_4442.pdf"
  },
  {
    id: "R_16_JUL_2026",
    texto: "RESOLUCIÓN de 16 de julio de 2026, de la Secretaría Autonómica de Educación, por la que se dictan instrucciones para la organización de los centros que impartan Formación Profesional de Grado Básico, Grado Medio, Grado Superior y Cursos de Especialización durante el curso 2026-2027.",
    descripcion: "Instrucciones anuales de inicio de curso para centros de FP.",
    link: "https://dogv.gva.es/datos/2026/07/20/pdf/2026_24495_es.pdf"
  }
];

const NORMATIVA_AUTONOMICA_NAVARRA: NormativaItem[] = [
  {
    id: "DF_108_2024",
    texto: "DECRETO FORAL 108/2024, de 11 de diciembre, por el que se modifican los currículos y se establecen aspectos básicos de ordenación de los títulos de Formación Profesional Básica en la Comunidad Foral de Navarra (BON núm. 41, de 28 de febrero de 2025).",
    descripcion: "Currículos y ordenación de la FP Básica en Navarra.",
    link: "https://bon.navarra.es/es/anuncio/-/texto/2025/41/2"
  },
  {
    id: "DF_109_2024",
    texto: "DECRETO FORAL 109/2024, de 11 de diciembre, por el que se modifican los currículos y se establecen aspectos básicos de ordenación de los títulos de Formación Profesional de Grado Medio en la Comunidad Foral de Navarra (BON núm. 52, de 14 de marzo de 2025).",
    descripcion: "Currículos y ordenación de la FP de Grado Medio en Navarra.",
    link: "https://bon.navarra.es/es/anuncio/-/texto/2025/52/1"
  },
  {
    id: "DF_110_2024",
    texto: "DECRETO FORAL 110/2024, de 11 de diciembre, por el que se modifican los currículos y se establecen aspectos básicos de ordenación de los títulos de Formación Profesional de Grado Superior en la Comunidad Foral de Navarra (BON núm. 63, de 28 de marzo de 2025).",
    descripcion: "Currículos y ordenación de la FP de Grado Superior en Navarra.",
    link: "https://bon.navarra.es/es/anuncio/-/texto/2025/63/0"
  },
  {
    id: "R_474_2026",
    texto: "RESOLUCIÓN 474/2026, de 9 de julio, del Director General de Educación y Formación Profesional, por la que se dictan instrucciones para la organización y funcionamiento de los centros que imparten Formación Profesional durante el curso 2026-2027.",
    descripcion: "Instrucciones anuales de inicio de curso para centros de FP en Navarra.",
    link: "https://www.educacion.navarra.es/documents/27590/27732/Res_474"
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
  const { t } = useTranslation();
  const filteredEstatal = NORMATIVA_ESTATAL.filter(item =>
    item.texto.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredAragon = NORMATIVA_AUTONOMICA_ARAGON.filter(item =>
    item.texto.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredValencia = NORMATIVA_AUTONOMICA_VALENCIA.filter(item =>
    item.texto.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNavarra = NORMATIVA_AUTONOMICA_NAVARRA.filter(item =>
    item.texto.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ITEMS_POR_COMUNIDAD: Record<string, NormativaItem[]> = {
    "Aragón": filteredAragon,
    "Comunidad Valenciana": filteredValencia,
    "Navarra": filteredNavarra,
  };

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
          title={t('campos.normativa.normativaEstatal', {defaultValue: 'Normativa estatal'})}
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
        const items = ITEMS_POR_COMUNIDAD[comunidad] || [];
        const matchComunidad = comunidad.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Hide if we are searching and neither the community name nor its items match
        if (searchQuery !== "" && items.length === 0 && !matchComunidad) return null;

        return (
          <AccordionBlock
            key={comunidad}
            title={t('campos.normativa.normativaAutonomica', {comunidad, defaultValue: `Normativa autonómica (${comunidad})`})}
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
