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

const NORMATIVA_AUTONOMICA_ANDALUCIA: NormativaItem[] = [
  {
    id: "D_147_2025",
    texto: "DECRETO 147/2025, de 17 de septiembre, por el que se regula la ordenación general de las enseñanzas de los Grados D y E del Sistema de Formación Profesional en Andalucía.",
    descripcion: "Ordenación general de la FP de Grados D y E en Andalucía.",
    link: "https://www.juntadeandalucia.es/boja/2025/179/c01"
  },
  {
    id: "R_20_FEB_2025",
    texto: "RESOLUCIÓN de 20 de febrero de 2025, de la Dirección General de Formación Profesional, Emprendimiento y Proyectos Europeos, por la que se regula el procedimiento de diseño y autorización de módulos profesionales optativos de Grado Medio y Grado Superior.",
    descripcion: "Diseño y autorización de módulos profesionales optativos en Andalucía.",
    link: "https://www.juntadeandalucia.es/educacion"
  },
  {
    id: "R_10_SEP_2025",
    texto: "RESOLUCIÓN de 10 de septiembre de 2025, de la Dirección General de Formación Profesional, Emprendimiento y Proyectos Europeos, por la que se establece la concreción curricular de los módulos profesionales optativos autorizados de Grado Medio y Grado Superior para el curso 2025/2026.",
    descripcion: "Currículo de los módulos optativos autorizados en Andalucía, curso 2025/2026.",
    link: "https://www.adideandalucia.es"
  },
  {
    id: "O_11_FEB_2026",
    texto: "ORDEN de 11 de febrero de 2026, por la que se regula la oferta modular diferenciada y las modalidades presencial, semipresencial y virtual de los Grados D y E de Formación Profesional en Andalucía.",
    descripcion: "Oferta modular diferenciada y modalidades de impartición en Andalucía.",
    link: "https://www.juntadeandalucia.es/boja/2026/30/c01"
  },
  {
    id: "I_30_SEP_2025",
    texto: "INSTRUCCIONES de 30 de septiembre de 2025, de la Dirección General de Formación Profesional, Emprendimiento y Proyectos Europeos, sobre los Cursos de Especialización autorizados para el curso 2025/2026.",
    descripcion: "Organización de los Cursos de Especialización (Grado E) en Andalucía.",
    link: "https://www.adideandalucia.es"
  },
  {
    id: "R_24_JUL_2026",
    texto: "RESOLUCIÓN de 24 de julio de 2026, de la Dirección General de Formación Profesional, Emprendimiento y Proyectos Europeos, sobre la distribución horaria y concreción curricular de los Grados D y E para el curso 2026/2027.",
    descripcion: "Distribución horaria y organización del curso 2026/2027 en Andalucía.",
    link: "https://www.adideandalucia.es"
  }
];

const NORMATIVA_AUTONOMICA_ASTURIAS: NormativaItem[] = [
  {
    id: "D_103_2025",
    texto: "DECRETO 103/2025, de 25 de agosto, de diseño, organización y currículo de la Formación Profesional en el Principado de Asturias (BOPA de 27 de agosto de 2025).",
    descripcion: "Ordenación general, estructura y currículo autonómico de la FP en Asturias.",
    link: "https://miprincipado.asturias.es/bopa/2025/08/27/2025-07197.pdf"
  },
  {
    id: "R_1_JUN_2021_AST",
    texto: "RESOLUCIÓN de 1 de junio de 2021, de la Consejería de Educación, por la que se adapta la ordenación de la Formación Profesional del sistema educativo al régimen a distancia/semipresencial en Asturias.",
    descripcion: "Formación Profesional a distancia y semipresencial en Asturias.",
    link: "https://miprincipado.asturias.es/bopa/2021/06/18/2021-05897.pdf"
  },
  {
    id: "CIRC_2026_27_AST",
    texto: "CIRCULAR de inicio de curso 2026-2027, Anexo II — Formación Profesional, de la Consejería de Educación del Principado de Asturias.",
    descripcion: "Instrucciones anuales de inicio de curso para centros de FP en Asturias.",
    link: "https://www.educastur.es/documents/34868/38433/Anexo_II_FP.pdf"
  }
];

const NORMATIVA_AUTONOMICA_BALEARES: NormativaItem[] = [
  {
    id: "D_39_2025",
    texto: "DECRET 39/2025, d'1 d'agost, pel qual s'estableix l'ordenació general de la Formació Professional a les Illes Balears (BOIB núm. 104, de 5 d'agost de 2025).",
    descripcion: "Ordenación general de la FP en las Illes Balears.",
    link: "https://www.caib.es/eboibfront/pdf/es/2025/104/1197492"
  },
  {
    id: "R_INSTR_2025_26_BAL",
    texto: "RESOLUCIÓN de la Directora General de Formació Professional i Ordenació Educativa por la que se dictan instrucciones de organización y funcionamiento de los Grados D y E de Formación Profesional para el curso 2025-2026.",
    descripcion: "Instrucciones anuales de organización de los centros de FP en Baleares.",
    link: "https://www.caib.es/sites/comunitatdocent/f/526743"
  },
  {
    id: "R_VIRTUAL_2025_26_BAL",
    texto: "RESOLUCIÓN de la Directora General de Formació Professional i Ordenació Educativa por la que se dictan instrucciones de organización de determinados ciclos formativos impartidos en modalidad virtual, curso 2025-2026.",
    descripcion: "Modalidad virtual de Formación Profesional en Baleares.",
    link: "https://www.caib.es/sites/comunitatdocent/f/519355"
  }
];

const NORMATIVA_AUTONOMICA_CANARIAS: NormativaItem[] = [
  {
    id: "R_30_OCT_2024_CAN",
    texto: "RESOLUCIÓN de 30 de octubre de 2024, por la que se dictan instrucciones de ordenación e implantación de los Grados D y E de Formación Profesional en Canarias (BOC núm. 226, de 13 de noviembre de 2024).",
    descripcion: "Ordenación e implantación de los Grados D y E de FP en Canarias.",
    link: "https://sede.gobiernodecanarias.org/boc/boc-a-2024-226-3747.pdf"
  },
  {
    id: "D_9_2023_CAN",
    texto: "DECRETO 9/2023, de 26 de enero, por el que se establece el currículo de veintitrés Ciclos Formativos de Grado Básico en Canarias (BOC núm. 25, de 6 de febrero de 2023).",
    descripcion: "Currículo de los ciclos de Grado Básico en Canarias.",
    link: "https://sede.gobiernodecanarias.org/boc/boc-a-2023-025-402.pdf"
  },
  {
    id: "R_25_FEB_2026_CAN",
    texto: "RESOLUCIÓN de 25 de febrero de 2026, por la que se dictan instrucciones para la implantación del módulo profesional optativo en Ciclos Formativos de Grado Medio y Superior, curso 2026-2027 (BOC núm. 43, de 4 de marzo de 2026).",
    descripcion: "Módulo profesional optativo en Canarias, curso 2026/2027.",
    link: "https://sede.gobiernodecanarias.org/boc/boc-a-2026-043-703.pdf"
  },
  {
    id: "R_10_DIC_2024_CAN",
    texto: "RESOLUCIÓN de 10 de diciembre de 2024, por la que se dictan instrucciones para la oferta en modalidades semipresencial y virtual de Ciclos de Grado D y Cursos de Especialización de Grado E (BOC núm. 251, de 18 de diciembre de 2024).",
    descripcion: "Modalidades semipresencial y virtual de FP en Canarias.",
    link: "https://sede.gobiernodecanarias.org/boc/boc-a-2024-251-4224.pdf"
  },
  {
    id: "R_9_JUN_2025_CAN",
    texto: "RESOLUCIÓN 305/2025, de 9 de junio, de la Dirección General de Formación Profesional y Enseñanzas de Régimen Especial, sobre admisión y desarrollo de los Cursos de Especialización, curso 2025-2026.",
    descripcion: "Cursos de Especialización (Grado E) en Canarias.",
    link: "https://www.gobiernodecanarias.org/cmsgob1/export/sites/educacion/web/servicios/inspeccion_educativa/normativa_clasificada/descargas/Resolucion-305_2025_admision_cursos_especializacion_25-26.pdf"
  },
  {
    id: "R_21_FEB_2025_CAN",
    texto: "RESOLUCIÓN de 21 de febrero de 2025, por la que se dictan instrucciones de implantación de los itinerarios formativos de Formación Profesional Adaptada en Canarias (BOC núm. 46, de 6 de marzo de 2025).",
    descripcion: "Formación Profesional Adaptada (atención a la diversidad) en Canarias.",
    link: "https://sede.gobiernodecanarias.org/boc/boc-a-2025-046-918.pdf"
  }
];

const NORMATIVA_AUTONOMICA_CANTABRIA: NormativaItem[] = [
  {
    id: "O_EDU_47_2024_CANT",
    texto: "ORDEN EDU/47/2024, de 30 de septiembre, por la que se regula la implantación de la Formación Profesional de Grado Básico y se establece el currículo de veinte ciclos formativos en Cantabria (BOC núm. 195, de 8 de octubre de 2024).",
    descripcion: "Implantación y currículo de la FP de Grado Básico en Cantabria.",
    link: "https://boc.cantabria.es/boces/verAnuncioAction.do?idAnuBlob=410297"
  },
  {
    id: "O_EDU_48_2024_CANT",
    texto: "ORDEN EDU/48/2024, de 8 de octubre, por la que se regulan los Cursos de Especialización de Grado E y se establece el currículo de catorce cursos en Cantabria (BOC núm. 201, de 16 de octubre de 2024).",
    descripcion: "Cursos de Especialización (Grado E) en Cantabria.",
    link: "https://boc.cantabria.es/boces/verAnuncioAction.do?idAnuBlob=410716"
  },
  {
    id: "R_4_AGO_2026_CANT",
    texto: "RESOLUCIÓN de 4 de agosto de 2026, por la que se publica el catálogo y la concreción curricular de los módulos profesionales optativos autorizados de Grado Medio y Grado Superior en Cantabria (BOC núm. 153, de 11 de agosto de 2026).",
    descripcion: "Catálogo de módulos optativos en Cantabria.",
    link: "https://boc.cantabria.es/boces/verAnuncioAction.do?idAnuBlob=439170"
  },
  {
    id: "R_13_JUN_2025_CANT",
    texto: "RESOLUCIÓN de 13 de junio de 2025, por la que se dictan instrucciones sobre el procedimiento de acceso, admisión y matrícula en modalidad virtual para ciclos de Grado Medio y Superior en Cantabria (BOC núm. 118, de 20 de junio de 2025).",
    descripcion: "Modalidad virtual de FP en Cantabria.",
    link: "https://boc.cantabria.es/boces/verAnuncioAction.do?idAnuBlob=421572"
  },
  {
    id: "D_78_2019_CANT",
    texto: "DECRETO 78/2019, de 24 de mayo, de ordenación de la atención a la diversidad en los centros públicos y concertados de Cantabria (BOC núm. 105, de 3 de junio de 2019).",
    descripcion: "Atención a la diversidad en los centros educativos de Cantabria (norma general, aplicable también a FP).",
    link: "https://boc.cantabria.es/boces/verAnuncioAction.do?idAnuBlob=339416"
  },
  {
    id: "INSTR_FP_2025_26_CANT",
    texto: "Instrucciones de Inicio de Curso, de la Dirección General de Formación Profesional de Cantabria, para los centros que imparten FP durante el curso 2025-2026.",
    descripcion: "Instrucciones anuales de inicio de curso para centros de FP en Cantabria.",
    link: "https://www.educantabria.es/documents/d/educantabria/instrucciones-inicio-fp-25_26_signed-pdf"
  }
];

const NORMATIVA_AUTONOMICA_CASTILLALAMANCHA: NormativaItem[] = [
  {
    id: "D_78_2024_CLM",
    texto: "DECRETO 78/2024, de 5 de noviembre, por el que se modifican los decretos que establecen los currículos de los ciclos formativos de Grado Básico en Castilla-La Mancha (DOCM núm. 218, de 11 de noviembre de 2024).",
    descripcion: "Currículo de la FP de Grado Básico en Castilla-La Mancha.",
    link: "https://docm.jccm.es/docm/descargarArchivo.do?ruta=2024/11/11/pdf/2024_8889.pdf"
  },
  {
    id: "D_79_2024_CLM",
    texto: "DECRETO 79/2024, de 5 de noviembre, por el que se modifican los decretos que establecen los currículos de los ciclos formativos de Grado Medio en Castilla-La Mancha (DOCM núm. 218, de 11 de noviembre de 2024).",
    descripcion: "Currículo de la FP de Grado Medio en Castilla-La Mancha.",
    link: "https://docm.jccm.es/docm/descargarArchivo.do?ruta=2024/11/11/pdf/2024_8895.pdf"
  },
  {
    id: "D_80_2024_CLM",
    texto: "DECRETO 80/2024, de 5 de noviembre, por el que se modifican los decretos que establecen los currículos de los ciclos formativos de Grado Superior en Castilla-La Mancha (DOCM núm. 218, de 11 de noviembre de 2024).",
    descripcion: "Currículo de la FP de Grado Superior en Castilla-La Mancha.",
    link: "https://docm.jccm.es/docm/descargarArchivo.do?ruta=2024/11/11/pdf/2024_8907.pdf"
  },
  {
    id: "D_81_2024_CLM",
    texto: "DECRETO 81/2024, de 5 de noviembre, por el que se modifican los decretos que establecen los currículos de los Cursos de Especialización de Grado Medio y Superior en Castilla-La Mancha (DOCM núm. 218, de 11 de noviembre de 2024).",
    descripcion: "Currículo de los Cursos de Especialización (Grado E) en Castilla-La Mancha.",
    link: "https://docm.jccm.es/docm/descargarArchivo.do?ruta=2024/11/11/pdf/2024_8898.pdf"
  },
  {
    id: "R_18_JUN_2025_CLM",
    texto: "RESOLUCIÓN de 18 de junio de 2025, de la Dirección General de Formación Profesional, por la que se autoriza y cataloga nuevos módulos optativos para ciclos de Grado Medio y Superior en Castilla-La Mancha (DOCM de 27 de junio de 2025).",
    descripcion: "Autorización de módulos optativos en Castilla-La Mancha.",
    link: "https://docm.jccm.es/docm/descargarArchivo.do?ruta=2025/06/27/pdf/2025_5166.pdf"
  },
  {
    id: "O_191_2020_CLM",
    texto: "ORDEN 191/2020, de 14 de diciembre, por la que se regula el régimen de enseñanza a distancia de la Formación Profesional en Castilla-La Mancha.",
    descripcion: "Enseñanza a distancia de la FP en Castilla-La Mancha.",
    link: "https://educacion.castillalamancha.es"
  },
  {
    id: "O_139_2017_CLM",
    texto: "ORDEN 139/2017, de 17 de julio, por la que se regulan y establecen los Programas Específicos de Formación Profesional en Castilla-La Mancha.",
    descripcion: "Programas específicos de FP (atención a la diversidad) en Castilla-La Mancha.",
    link: "https://educacion.castillalamancha.es"
  },
  {
    id: "O_104_2026_CLM",
    texto: "ORDEN 104/2026, de 3 de julio, sobre medidas educativas, organizativas y de gestión para el curso 2026/2027 en Castilla-La Mancha (incluye Formación Profesional) (DOCM de 10 de julio de 2026).",
    descripcion: "Instrucciones anuales de inicio de curso para centros de FP en Castilla-La Mancha.",
    link: "https://docm.jccm.es/docm/descargarArchivo.do?ruta=2026/07/10/pdf/2026_5253.pdf"
  }
];

const NORMATIVA_AUTONOMICA_CASTILLAYLEON: NormativaItem[] = [
  {
    id: "ORDEN_EDU_1285_2024_CYL",
    texto: "ORDEN EDU/1285/2024, de 26 de noviembre, por la que se establece el currículo de los ciclos formativos de Grado Básico en Castilla y León (BOCyL de 2 de diciembre de 2024).",
    descripcion: "Currículo de la FP de Grado Básico en Castilla y León.",
    link: "https://bocyl.jcyl.es"
  },
  {
    id: "D_25_2024_CYL",
    texto: "DECRETO 25/2024, de 21 de noviembre, por el que se establece el currículo de los ciclos formativos de Grado Medio en Castilla y León (BOCyL de 25 de noviembre de 2024).",
    descripcion: "Currículo de la FP de Grado Medio en Castilla y León.",
    link: "https://bocyl.jcyl.es"
  },
  {
    id: "D_24_2024_CYL",
    texto: "DECRETO 24/2024, de 21 de noviembre, por el que se establece el currículo de los ciclos formativos de Grado Superior en Castilla y León (BOCyL de 25 de noviembre de 2024).",
    descripcion: "Currículo de la FP de Grado Superior en Castilla y León.",
    link: "https://bocyl.jcyl.es"
  },
  {
    id: "ORDEN_EDU_588_2024_CYL",
    texto: "ORDEN EDU/588/2024, de 11 de junio, por la que se regulan las modalidades semipresencial y virtual de las ofertas de Grado D y E de Formación Profesional en Castilla y León.",
    descripcion: "Modalidades semipresencial y virtual de FP en Castilla y León.",
    link: "https://bocyl.jcyl.es/eli/es-cl/o/2024/06/11/edu588/"
  },
  {
    id: "D_7_2025_CYL",
    texto: "DECRETO 7/2025, de 27 de marzo, por el que se establece el currículo de los Cursos de Especialización (Grado E) de Formación Profesional en Castilla y León.",
    descripcion: "Currículo de los Cursos de Especialización en Castilla y León.",
    link: "https://bocyl.jcyl.es/eli/es-cl/d/2025/03/27/7/"
  },
  {
    id: "ORDEN_EDU_411_2025_CYL",
    texto: "ORDEN EDU/411/2025, de 15 de abril, por la que se concreta la optatividad en Grado D y el procedimiento de oferta y autorización de complementos de formación en Castilla y León.",
    descripcion: "Módulos optativos y complementos de formación en Castilla y León.",
    link: "https://bocyl.jcyl.es/eli/es-cl/o/2025/04/15/edu411/"
  }
];

const NORMATIVA_AUTONOMICA_CATALUNYA: NormativaItem[] = [
  {
    id: "D_284_2011_CAT",
    texto: "DECRET 284/2011, d'1 de març, d'ordenació general de la Formació Professional inicial de grau mitjà i superior a Catalunya (DOGC núm. 5830).",
    descripcion: "Ordenación general de la FP inicial en Cataluña.",
    link: "https://portaldogc.gencat.cat"
  },
  {
    id: "D_175_2022_CAT",
    texto: "DECRET 175/2022, de 27 de setembre, d'ordenació dels ensenyaments de l'educació bàsica; inclou el currículo dels àmbits dels ciclos de Grau Bàsic de FP (DOGC núm. 8762).",
    descripcion: "Currículo de la FP de Grado Básico en Cataluña (integrado en el decreto de educación básica).",
    link: "https://portaldogc.gencat.cat"
  },
  {
    id: "R_ENS_1891_2012_CAT",
    texto: "RESOLUCIÓ ENS/1891/2012, de 23 d'agost, d'organització de les mesures flexibilitzadores de l'oferta de Formació Professional inicial a Catalunya (DOGC núm. 6220).",
    descripcion: "Medidas flexibilizadoras (modalidades de impartición) de la FP en Cataluña.",
    link: "https://portaldogc.gencat.cat"
  },
  {
    id: "CURSOS_ESP_CAT",
    texto: "Cursos d'especialització de Formació Professional — organització i currículum (DOIGC, Departament d'Educació i Formació Professional, actualitzat el 10 de juny de 2026).",
    descripcion: "Organización y currículo de los Cursos de Especialización (Grado E) en Cataluña.",
    link: "https://documents.espai.educacio.gencat.cat"
  },
  {
    id: "D_150_2017_CAT",
    texto: "DECRET 150/2017, de 17 d'octubre, de l'atenció educativa a l'alumnat en el marc d'un sistema educatiu inclusiu a Catalunya (DOGC núm. 7477).",
    descripcion: "Atención educativa inclusiva en Cataluña (norma general, aplicable también a FP).",
    link: "https://portaldogc.gencat.cat"
  },
  {
    id: "R_10_JUN_2026_CAT",
    texto: "RESOLUCIÓ de 10 de juny de 2026 per la qual s'aproven els documents per a l'organització i la gestió dels centres per al curs 2026-2027 a Catalunya.",
    descripcion: "Instrucciones anuales de organización de los centros de FP en Cataluña.",
    link: "https://documents.espai.educacio.gencat.cat"
  }
];

const NORMATIVA_AUTONOMICA_CEUTA: NormativaItem[] = [
  {
    id: "O_EFD_658_2024_CEU",
    texto: "ORDEN EFD/658/2024, de 25 de junio, por la que se establece el currículo de determinados ciclos formativos de Grado Básico para el ámbito de gestión del Ministerio de Educación, Formación Profesional y Deportes (aplicable en Ceuta) (BOE-A-2024-13180).",
    descripcion: "Currículo de Grado Básico en el ámbito de gestión del MEFPD (Ceuta).",
    link: "https://www.boe.es/buscar/doc.php?id=BOE-A-2024-13180"
  },
  {
    id: "O_EFD_657_2024_CEU",
    texto: "ORDEN EFD/657/2024, de 25 de junio, por la que se establece el currículo de determinados ciclos formativos de Grado Medio para el ámbito de gestión del Ministerio de Educación, Formación Profesional y Deportes (aplicable en Ceuta) (BOE-A-2024-13179).",
    descripcion: "Currículo de Grado Medio en el ámbito de gestión del MEFPD (Ceuta).",
    link: "https://www.boe.es/buscar/doc.php?id=BOE-A-2024-13179"
  },
  {
    id: "O_EFD_659_2024_CEU",
    texto: "ORDEN EFD/659/2024, de 25 de junio, por la que se establece el currículo de determinados ciclos formativos de Grado Superior para el ámbito de gestión del Ministerio de Educación, Formación Profesional y Deportes (aplicable en Ceuta) (BOE-A-2024-13181).",
    descripcion: "Currículo de Grado Superior en el ámbito de gestión del MEFPD (Ceuta).",
    link: "https://www.boe.es/buscar/doc.php?id=BOE-A-2024-13181"
  },
  {
    id: "O_EFP_279_2022_CEU",
    texto: "ORDEN EFP/279/2022, de 4 de abril, sobre evaluación, promoción y titulación en la Formación Profesional para el ámbito de gestión del Ministerio de Educación y Formación Profesional (BOE-A-2022-5687).",
    descripcion: "Evaluación, promoción y titulación de FP en el ámbito del MEFP.",
    link: "https://www.boe.es/buscar/doc.php?id=BOE-A-2022-5687"
  },
  {
    id: "R_27_JUN_2025_CEU",
    texto: "RESOLUCIÓN de 27 de junio de 2025, de la Subdirección General de Formación Profesional, por la que se publica el repertorio de módulos profesionales optativos para el ámbito de gestión del Ministerio de Educación, Formación Profesional y Deportes (BOE-A-2025-14430).",
    descripcion: "Repertorio de módulos optativos en el ámbito del MEFPD (Ceuta).",
    link: "https://www.boe.es/buscar/doc.php?id=BOE-A-2025-14430"
  }
];

const NORMATIVA_AUTONOMICA_EXTREMADURA: NormativaItem[] = [
  {
    id: "I_11_2024_EXT",
    texto: "INSTRUCCIÓN 11/2024, de 20 de junio, de la Dirección General de Formación Profesional, Innovación e Inclusión Educativa, sobre aspectos organizativos del currículo de los ciclos formativos de Grado Básico en Extremadura.",
    descripcion: "Aspectos organizativos del currículo de Grado Básico en Extremadura.",
    link: "https://www.educarex.es/pub/cont/com/0019/documentos/normativa/formacion-profesional/Instruccion_11_2024_adaptacion_GB(F).pdf"
  },
  {
    id: "I_12_2024_EXT",
    texto: "INSTRUCCIÓN 12/2024, de 20 de junio, de la Dirección General de Formación Profesional, Innovación e Inclusión Educativa, sobre aspectos organizativos del currículo de los ciclos formativos de Grado Medio en Extremadura.",
    descripcion: "Aspectos organizativos del currículo de Grado Medio en Extremadura.",
    link: "https://www.educarex.es/pub/cont/com/0019/documentos/normativa/formacion-profesional/Instrucción_12_2024_adaptacion_GM(F).pdf"
  },
  {
    id: "I_13_2024_EXT",
    texto: "INSTRUCCIÓN 13/2024, de 20 de junio, de la Dirección General de Formación Profesional, Innovación e Inclusión Educativa, sobre aspectos organizativos del currículo de los ciclos formativos de Grado Superior en Extremadura.",
    descripcion: "Aspectos organizativos del currículo de Grado Superior en Extremadura.",
    link: "https://www.educarex.es/pub/cont/com/0019/documentos/normativa/formacion-profesional/Instruccion_13_2024_adaptacion_GS(F).pdf"
  },
  {
    id: "O_9_MAY_2024_EXT",
    texto: "ORDEN de 9 de mayo de 2024, de la Consejería de Educación, Ciencia y Formación Profesional, por la que se regula la admisión y matriculación de los Grados D y E en las modalidades presencial, semipresencial y virtual en Extremadura (DOE núm. 93, de 15 de mayo de 2024).",
    descripcion: "Modalidades de impartición de la FP en Extremadura.",
    link: "https://doe.juntaex.es/pdfs/doe/2024/930o/24050087.pdf"
  },
  {
    id: "D_228_2014_EXT",
    texto: "DECRETO 228/2014, de 14 de octubre, por el que se regula la respuesta educativa a la diversidad del alumnado en la Comunidad Autónoma de Extremadura (DOE núm. 202, de 21 de octubre de 2014).",
    descripcion: "Atención a la diversidad en los centros educativos de Extremadura (norma general, aplicable también a FP).",
    link: "https://www.educarex.es/pub/cont/com/0004/documentos/D228,2014.pdf"
  },
  {
    id: "I_3_2026_EXT",
    texto: "INSTRUCCIÓN 3/2026, de 23 de julio, de la Dirección General de Formación Profesional, sobre normas de aplicación en los centros que imparten FP en régimen presencial en Extremadura durante el curso 2026-2027.",
    descripcion: "Instrucciones anuales de inicio de curso para centros de FP en Extremadura.",
    link: "https://www.educarex.es/pub/cont/com/0019/documentos/Instruccion_FP_curso_26_27(F).pdf"
  }
];

const NORMATIVA_AUTONOMICA_GALICIA: NormativaItem[] = [
  {
    id: "D_20_2026_GAL",
    texto: "DECRETO 20/2026, de 9 de marzo, de ordenación xeral da Formación Profesional do sistema educativo de Galicia (DOG núm. 56, de 25 de marzo de 2026).",
    descripcion: "Ordenación general de la FP (Grados D y E) en Galicia.",
    link: "https://www.xunta.gal/dog/Publicados/2026/20260325/AnuncioG0761-110326-0004_es.pdf"
  },
  {
    id: "D_126_2023_GAL",
    texto: "DECRETO 126/2023, de 20 de julio, por el que se establece el currículo de los ámbitos comunes (Comunicación y Ciencias Sociales; Ciencias Aplicadas) de los ciclos de Grado Básico en Galicia (DOG núm. 157, de 21 de agosto de 2023).",
    descripcion: "Currículo de los ámbitos comunes de Grado Básico en Galicia.",
    link: "https://www.xunta.gal/dog/Publicados/2023/20230821/AnuncioG0655-260723-0004_es.pdf"
  },
  {
    id: "R_1_JUL_2025_GAL",
    texto: "RESOLUCIÓN de 1 de julio de 2025 por la que se dictan instrucciones de ordenación y organización de los Grados D y E de Formación Profesional en Galicia para el curso 2025/2026 (DOG núm. 131, de 10 de julio de 2025).",
    descripcion: "Ordenación y organización de los Grados D y E en Galicia, curso 2025/2026.",
    link: "https://www.xunta.gal/dog/Publicados/2025/20250710/AnuncioG0761-010725-0002_es.pdf"
  },
  {
    id: "O_8_SEP_2021_GAL",
    texto: "ORDEN de 8 de septiembre de 2021 por la que se desarrolla el Decreto 229/2011 regulando la atención a la diversidad del alumnado en los centros docentes de Galicia (DOG núm. 206, de 26 de octubre de 2021).",
    descripcion: "Atención a la diversidad en los centros educativos de Galicia (norma general, aplicable también a FP).",
    link: "https://www.xunta.gal/dog/Publicados/2021/20211026/AnuncioG0598-211021-0005_es.pdf"
  },
  {
    id: "R_3_JUL_2026_GAL",
    texto: "RESOLUCIÓN de 3 de julio de 2026 por la que se dictan instrucciones para el desarrollo de las enseñanzas de Formación Profesional del sistema educativo en Galicia durante el curso 2026/2027 (DOG núm. 129, de 13 de julio de 2026).",
    descripcion: "Instrucciones anuales de inicio de curso para centros de FP en Galicia.",
    link: "https://www.xunta.gal/dog/Publicados/2026/20260713/AnuncioG0761-030726-0001_es.pdf"
  }
];

const NORMATIVA_AUTONOMICA_LARIOJA: NormativaItem[] = [
  {
    id: "D_44_2010_LR",
    texto: "DECRETO 44/2010, de 6 de agosto, por el que se establece la ordenación y las enseñanzas de los ciclos formativos de Formación Profesional del sistema educativo en La Rioja (texto consolidado vigente).",
    descripcion: "Ordenación general de la FP en La Rioja.",
    link: "https://www.larioja.org/normativa-autonomica/es?modelo=NA&norma=1347"
  },
  {
    id: "D_57_2022_LR",
    texto: "DECRETO 57/2022, de 9 de noviembre, por el que se regulan las enseñanzas de Formación Profesional de Grado Básico y se establece el currículo de dieciocho títulos profesionales básicos en La Rioja (BOR de 11 de noviembre de 2022).",
    descripcion: "Currículo de la FP de Grado Básico en La Rioja.",
    link: "https://ias1.larioja.org/boletin/Bor_Boletin_visor_Servlet?referencia=22680098-1-PDF-549547"
  },
  {
    id: "CAT_OPTATIVAS_LR",
    texto: "Catálogo y desarrollo curricular de los módulos profesionales optativos, curso 2026/2027, de la Dirección General de Formación Profesional de La Rioja (deriva de la Resolución 14/2025, de 20 de junio).",
    descripcion: "Catálogo de módulos optativos en La Rioja.",
    link: "https://www.larioja.org/educarioja-fp/es/programacion-didactica/catalogo-optativas"
  },
  {
    id: "R_18_2026_LR",
    texto: "RESOLUCIÓN 18/2026, de 18 de junio, de la Dirección General de Formación Profesional, sobre admisión y matrícula en Grados B, D y E en modalidad virtual en el Centro Integrado Público de FP a Distancia de La Rioja (BOR núm. 118, de 24 de junio de 2026).",
    descripcion: "Modalidad virtual de FP en La Rioja.",
    link: "https://www.larioja.org"
  },
  {
    id: "R_15_2026_LR",
    texto: "RESOLUCIÓN 15/2026, de 5 de junio, de la Dirección General de Formación Profesional, sobre condiciones de admisión, acceso y organización de los Cursos de Especialización en modalidad presencial en La Rioja (BOR núm. 110, de 12 de junio de 2026).",
    descripcion: "Cursos de Especialización (Grado E) en La Rioja.",
    link: "https://www.larioja.org"
  },
  {
    id: "R_13_2026_LR",
    texto: "RESOLUCIÓN 13/2026, de 8 de abril, de la Dirección General de Innovación y Ordenación Educativa, por la que se regulan los Programas de Atención Educativa a las diferencias individuales (PADI) en La Rioja (BOR núm. 68, de 13 de abril de 2026).",
    descripcion: "Atención a la diversidad (PADI) en La Rioja.",
    link: "https://www.larioja.org"
  },
  {
    id: "R_21_2026_LR",
    texto: "RESOLUCIÓN 21/2026, de 1 de julio, de la Dirección General de Formación Profesional, por la que se regula la organización y estructura curricular de los ciclos de Grado Básico, Medio y Superior para el curso 2026/2027 en La Rioja (BOR núm. 127, de 7 de julio de 2026).",
    descripcion: "Instrucciones anuales de inicio de curso para centros de FP en La Rioja.",
    link: "https://www.larioja.org"
  }
];

const NORMATIVA_AUTONOMICA_MADRID: NormativaItem[] = [
  {
    id: "D_27_2025_MAD",
    texto: "DECRETO 27/2025, de 21 de mayo, del Consejo de Gobierno, por el que se regula la ordenación y organización del Sistema de Formación Profesional en la Comunidad de Madrid (BOCM de 22 de mayo de 2025).",
    descripcion: "Ordenación general de la FP en la Comunidad de Madrid.",
    link: "https://www.bocm.es/boletin/CM_Orden_BOCM/2025/05/22/BOCM-20250522-1.PDF"
  },
  {
    id: "D_9_2025_MAD",
    texto: "DECRETO 9/2025, de 26 de marzo, del Consejo de Gobierno, por el que se establecen los planes de estudio de veinticinco títulos de Formación Profesional de Grado Básico en Madrid (BOCM de 31 de marzo de 2025).",
    descripcion: "Currículo de la FP de Grado Básico en Madrid.",
    link: "https://www.bocm.es/boletin/CM_Orden_BOCM/2025/03/31/BOCM-20250331-1.PDF"
  },
  {
    id: "O_3536_2025_MAD",
    texto: "ORDEN 3536/2025, de 12 de agosto, de la Consejería de Educación, Ciencia y Universidades, por la que se aprueba el catálogo de módulos profesionales de la parte de optatividad en CFGM y CFGS en Madrid (BOCM de 27 de agosto de 2025).",
    descripcion: "Catálogo de módulos optativos en Madrid.",
    link: "https://www.bocm.es/boletin/CM_Orden_BOCM/2025/08/27/BOCM-20250827-5.PDF"
  },
  {
    id: "R_24_MAY_2022_MAD",
    texto: "RESOLUCIÓN de 24 de mayo de 2022, de la Dirección General de Educación Secundaria, Formación Profesional y Régimen Especial, sobre las enseñanzas de FP susceptibles de ofertarse en modalidad semipresencial en Madrid (BOCM de 3 de junio de 2022).",
    descripcion: "Modalidad semipresencial de FP en Madrid.",
    link: "https://www.bocm.es/boletin/CM_Orden_BOCM/2022/06/03/BOCM-20220603-36.PDF"
  },
  {
    id: "D_8_2025_MAD",
    texto: "DECRETO 8/2025, de 26 de marzo, del Consejo de Gobierno, por el que se modifican los decretos que establecen los planes de estudio de los Cursos de Especialización de FP (Grado E) en Madrid (BOCM de 28 de marzo de 2025).",
    descripcion: "Cursos de Especialización (Grado E) en Madrid.",
    link: "https://www.bocm.es/boletin/CM_Orden_BOCM/2025/03/28/BOCM-20250328-1.PDF"
  },
  {
    id: "R_PROG_PROF_2026_27_MAD",
    texto: "RESOLUCIÓN de la Dirección General de Educación Secundaria, FP y Régimen Especial, sobre la organización de los Programas Profesionales para alumnado con necesidades educativas especiales o dificultades de inserción laboral, curso 2026-2027, en Madrid.",
    descripcion: "Atención a la diversidad (Programas Profesionales) en Madrid.",
    link: "https://www.comunidad.madrid/docs/2026-07/resolucion_intrucciones-programas_dgesfpre_2026-2027_.pdf"
  },
  {
    id: "INSTR_2026_27_MAD",
    texto: "Instrucciones de la Viceconsejería de Política y Organización Educativa sobre el comienzo del curso escolar 2026-2027 en centros públicos no universitarios de Madrid (incluye sección específica de Formación Profesional).",
    descripcion: "Instrucciones anuales de inicio de curso para centros de FP en Madrid.",
    link: "https://www.comunidad.madrid/docs/2026-07/instrucciones-inicio-de-curso-2026-2027.pdf"
  }
];

const NORMATIVA_AUTONOMICA_MELILLA: NormativaItem[] = [
  {
    id: "O_EFD_658_2024_MEL",
    texto: "ORDEN EFD/658/2024, de 25 de junio, por la que se establece el currículo de determinados ciclos formativos de Grado Básico para el ámbito de gestión del Ministerio de Educación, Formación Profesional y Deportes (aplicable en Melilla) (BOE-A-2024-13180).",
    descripcion: "Currículo de Grado Básico en el ámbito de gestión del MEFPD (Melilla).",
    link: "https://www.boe.es/buscar/doc.php?id=BOE-A-2024-13180"
  },
  {
    id: "O_EFD_657_2024_MEL",
    texto: "ORDEN EFD/657/2024, de 25 de junio, por la que se establece el currículo de determinados ciclos formativos de Grado Medio para el ámbito de gestión del Ministerio de Educación, Formación Profesional y Deportes (aplicable en Melilla) (BOE-A-2024-13179).",
    descripcion: "Currículo de Grado Medio en el ámbito de gestión del MEFPD (Melilla).",
    link: "https://www.boe.es/buscar/doc.php?id=BOE-A-2024-13179"
  },
  {
    id: "O_EFD_659_2024_MEL",
    texto: "ORDEN EFD/659/2024, de 25 de junio, por la que se establece el currículo de determinados ciclos formativos de Grado Superior para el ámbito de gestión del Ministerio de Educación, Formación Profesional y Deportes (aplicable en Melilla) (BOE-A-2024-13181).",
    descripcion: "Currículo de Grado Superior en el ámbito de gestión del MEFPD (Melilla).",
    link: "https://www.boe.es/buscar/doc.php?id=BOE-A-2024-13181"
  }
];

const NORMATIVA_AUTONOMICA_MURCIA: NormativaItem[] = [
  {
    id: "D_13_2026_MUR",
    texto: "DECRETO n.º 13/2026, de 5 de marzo, de ordenación general de la Formación Profesional de Grado D y Grado E en la Región de Murcia (BORM núm. 59, de 12 de marzo de 2026).",
    descripcion: "Ordenación general de los Grados D y E de FP en Murcia.",
    link: "https://www.borm.es/services/anuncio/ano/2026/numero/1101/pdf?id=841783"
  },
  {
    id: "O_24_01_2019_MUR",
    texto: "ORDEN de 24 de enero de 2019, por la que se establece el currículo de trece ciclos de Formación Profesional Básica en la Región de Murcia (BORM núm. 21, de 26 de enero de 2019).",
    descripcion: "Currículo de la FP Básica en Murcia.",
    link: "https://www.borm.es/services/anuncio/ano/2019/numero/404/pdf?id=774221"
  },
  {
    id: "R_30_07_2025_GB_MUR",
    texto: "RESOLUCIÓN de 30 de julio de 2025, de la Dirección General de Formación Profesional, con instrucciones de organización de Grado Básico para el curso 2025-2026 en Murcia (BORM núm. 185, de 12 de agosto de 2025).",
    descripcion: "Instrucciones de inicio de curso, Grado Básico, en Murcia.",
    link: "https://www.borm.es/services/anuncio/ano/2025/numero/3976/pdf?id=838048"
  },
  {
    id: "R_30_07_2025_GMGS_MUR",
    texto: "RESOLUCIÓN de 30 de julio de 2025, de la Dirección General de Formación Profesional, con instrucciones de organización de Grado Medio y Grado Superior para el curso 2025-2026 en Murcia (BORM núm. 185, de 12 de agosto de 2025).",
    descripcion: "Instrucciones anuales de inicio de curso, Grado Medio y Superior, en Murcia.",
    link: "https://www.borm.es/services/anuncio/ano/2025/numero/3977/pdf?id=838049"
  },
  {
    id: "R_18_12_2025_MUR",
    texto: "RESOLUCIÓN de 18 de diciembre de 2025, de la Dirección General de Formación Profesional, sobre ciclos impartibles en modalidad virtual y presencialidad obligatoria en modalidad semipresencial en Murcia (BORM núm. 2, de 3 de enero de 2026).",
    descripcion: "Modalidades virtual y semipresencial de FP en Murcia.",
    link: "https://www.borm.es"
  },
  {
    id: "O_28_09_2023_MUR",
    texto: "ORDEN de 28 de septiembre de 2023, por la que se regulan los Programas Formativos Profesionales (modalidades Adaptada y Especial) en la Región de Murcia (BORM núm. 229, de 3 de octubre de 2023).",
    descripcion: "Atención a la diversidad (Programas Formativos Profesionales) en Murcia.",
    link: "https://www.borm.es/services/anuncio/ano/2023/numero/5656/pdf?id=822034"
  }
];

const NORMATIVA_AUTONOMICA_PAISVASCO: NormativaItem[] = [
  {
    id: "D_32_2008_PV",
    texto: "DECRETO 32/2008, de 26 de febrero, de ordenación general de la Formación Profesional del sistema educativo en la Comunidad Autónoma del País Vasco.",
    descripcion: "Ordenación general de la FP en el País Vasco.",
    link: "https://www.euskadi.eus/bopv2/datos/2008/03/0801360a.pdf"
  },
  {
    id: "D_77_2023_PV",
    texto: "DECRETO 77/2023, de 30 de mayo, por el que se establece el currículo de la Educación Básica (incluye los Ciclos Formativos de Grado Básico) en el País Vasco.",
    descripcion: "Currículo de la FP de Grado Básico en el País Vasco.",
    link: "https://www.euskadi.eus/bopv2/datos/2023/06/2302729a.pdf"
  },
  {
    id: "O_11_OCT_2010_PV",
    texto: "ORDEN de 11 de octubre de 2010, por la que se implantan y regulan las enseñanzas de Formación Profesional en modalidad a distancia telemática en el País Vasco.",
    descripcion: "Formación Profesional a distancia en el País Vasco.",
    link: "https://www.euskadi.eus/bopv2/datos/2010/11/1005248a.pdf"
  },
  {
    id: "D_83_2015_PV",
    texto: "DECRETO 83/2015, de 2 de junio, por el que se establece la Formación Profesional Dual en Régimen de Alternancia en la Comunidad Autónoma del País Vasco.",
    descripcion: "FP Dual en régimen de alternancia en el País Vasco.",
    link: "https://www.euskadi.eus/y22-bopv/es/bopv2/datos/2015/06/1502515a.pdf"
  },
  {
    id: "O_2_FEB_2026_PV",
    texto: "ORDEN de 2 de febrero de 2026, por la que se establecen cinco nuevos programas de especialización profesional y se modifican las condiciones generales para su impartición en el País Vasco.",
    descripcion: "Programas de especialización profesional (Grado E) en el País Vasco.",
    link: "https://www.euskadi.eus/web01-bopv/es/bopv2/datos/2026/03/2601052a.pdf"
  },
  {
    id: "D_78_2024_PV",
    texto: "DECRETO 78/2024, de 18 de junio, sobre la respuesta a la diversidad en el marco de un sistema educativo inclusivo en el País Vasco.",
    descripcion: "Atención a la diversidad en el sistema educativo del País Vasco (norma general, aplicable también a FP).",
    link: "https://www.euskadi.eus/bopv2/datos/2024/06/2403108a.pdf"
  },
  {
    id: "R_5_JUN_2026_PV",
    texto: "RESOLUCIÓN del Viceconsejero de Formación Profesional, de 5 de junio de 2026, sobre organización y funcionamiento de los Centros Integrados de FP Públicos del País Vasco durante el curso 2026-2027.",
    descripcion: "Instrucciones anuales de inicio de curso para los CIFP públicos del País Vasco.",
    link: "https://www.euskadi.eus/contenidos/informacion/legelabur/es_def/adjuntos/CIFP-RESOLUCION-VCFP-2026-2027-CAS-05-06-2026.pdf"
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
  
  const RAW_POR_COMUNIDAD: Record<string, NormativaItem[]> = {
    "Andalucía": NORMATIVA_AUTONOMICA_ANDALUCIA,
    "Aragón": NORMATIVA_AUTONOMICA_ARAGON,
    "Asturias": NORMATIVA_AUTONOMICA_ASTURIAS,
    "Baleares": NORMATIVA_AUTONOMICA_BALEARES,
    "Canarias": NORMATIVA_AUTONOMICA_CANARIAS,
    "Cantabria": NORMATIVA_AUTONOMICA_CANTABRIA,
    "Castilla-La Mancha": NORMATIVA_AUTONOMICA_CASTILLALAMANCHA,
    "Castilla y León": NORMATIVA_AUTONOMICA_CASTILLAYLEON,
    "Cataluña": NORMATIVA_AUTONOMICA_CATALUNYA,
    "Ceuta": NORMATIVA_AUTONOMICA_CEUTA,
    "Comunidad Valenciana": NORMATIVA_AUTONOMICA_VALENCIA,
    "Extremadura": NORMATIVA_AUTONOMICA_EXTREMADURA,
    "Galicia": NORMATIVA_AUTONOMICA_GALICIA,
    "Madrid": NORMATIVA_AUTONOMICA_MADRID,
    "Melilla": NORMATIVA_AUTONOMICA_MELILLA,
    "Murcia": NORMATIVA_AUTONOMICA_MURCIA,
    "Navarra": NORMATIVA_AUTONOMICA_NAVARRA,
    "País Vasco": NORMATIVA_AUTONOMICA_PAISVASCO,
    "La Rioja": NORMATIVA_AUTONOMICA_LARIOJA,
  };

  const ITEMS_POR_COMUNIDAD: Record<string, NormativaItem[]> = Object.fromEntries(
    Object.entries(RAW_POR_COMUNIDAD).map(([comunidad, items]) => [
      comunidad,
      items.filter(item =>
        item.texto.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ])
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
      {filteredEstatal.length === 0 && Object.values(ITEMS_POR_COMUNIDAD).every(items => items.length === 0) && !COMUNIDADES.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) && (
        <div className="py-12 text-center text-muted-foreground border border-border/50 rounded-xl bg-surface/50">
          No se encontraron resultados para "{searchQuery}".
        </div>
      )}
    </div>
  );
}
