import { CourseGroup } from '@/types';

export const initialGroups: CourseGroup[] = [
  {
    id: 1,
    name: "1º Instalaciones de Telecomunicaciones",
    degreeName: "ELE203 - Instalaciones de Telecomunicaciones",
    level: "Grado Medio",
    modules: [
      { id: 101, code: "0237", name: "Infraestructuras comunes de telecomunicación en viviendas y edificios", acronym: "ICTVE", hours: 167, isDual: false, assignedTeacherId: 2, ras: [
        { raNumber: 1, description: "Identifica los elementos de las infraestructuras..." },
        { raNumber: 2, description: "Configura pequeñas instalaciones de infraestructuras..." },
        { raNumber: 3, description: "Monta instalaciones de infraestructuras comunes..." }
      ]},
      { id: 102, code: "0359", name: "Electrónica aplicada", acronym: "EA", hours: 167, isDual: false, assignedTeacherId: 3, ras: [
        { raNumber: 1, description: "Reconoce los principios básicos de la electrónica..." },
        { raNumber: 2, description: "Monta circuitos electrónicos básicos..." }
      ]},
      { id: 103, code: "0360", name: "Equipos microinformáticos", acronym: "EM", hours: 100, isDual: false, assignedTeacherId: 4 },
      { id: 104, code: "0361", name: "Infraestructuras de redes de datos y sistemas de telefonía", acronym: "IRDST", hours: 133, isDual: true, assignedTeacherId: 5 },
      { id: 105, code: "0362", name: "Instalaciones eléctricas básicas", acronym: "IEB", hours: 200, isDual: true, assignedTeacherId: 6 },
      { id: 106, code: "1664", name: "Digitalización aplicada a los sectores productivos (GM)", acronym: "DASP", hours: 33, isDual: false, assignedTeacherId: 4 },
      { id: 107, code: "A997", name: "Tutoría I", acronym: "TI", hours: 33, isDual: false, assignedTeacherId: 2 },
      { id: 108, code: "0156", name: "Inglés Profesional (GM)", acronym: "IP", hours: 67, isDual: false, assignedTeacherId: 7 },
      { id: 109, code: "1709", name: "Itinerario personal para la empleabilidad I", acronym: "IPEI", hours: 100, isDual: false, assignedTeacherId: 8 }
    ]
  },
  {
    id: 2,
    name: "2º Instalaciones de Telecomunicaciones",
    degreeName: "ELE203 - Instalaciones de Telecomunicaciones",
    level: "Grado Medio",
    modules: [
      { id: 201, code: "0238", name: "Instalaciones domóticas", acronym: "ID", hours: 133, isDual: true, assignedTeacherId: 2 },
      { id: 202, code: "0363", name: "Instalaciones de megafonía y sonorización", acronym: "IMS", hours: 200, isDual: true, assignedTeacherId: 6 },
      { id: 203, code: "0364", name: "Circuito cerrado de televisión y seguridad electrónica", acronym: "CCTSE", hours: 200, isDual: true, assignedTeacherId: 9 },
      { id: 204, code: "0365", name: "Instalaciones de radiocomunicaciones", acronym: "IR", hours: 167, isDual: true, assignedTeacherId: 3 },
      { id: 205, code: "1708", name: "Sostenibilidad aplicada al sistema productivo", acronym: "SASP", hours: 33, isDual: false, assignedTeacherId: 5 },
      { id: 206, code: "A172", name: "Ofimática avanzada", acronym: "OA", hours: 100, isDual: true, assignedTeacherId: 4 },
      { id: 207, code: "1713", name: "Proyecto intermodular", acronym: "PI", hours: 67, isDual: false, assignedTeacherId: 7 },
      { id: 208, code: "A996", name: "Tutoría II", acronym: "TI", hours: 33, isDual: false, assignedTeacherId: 3 },
      { id: 209, code: "1710", name: "Itinerario personal para la empleabilidad II", acronym: "IPEI", hours: 67, isDual: false, assignedTeacherId: 8 }
    ]
  },
  {
    id: 3,
    name: "1º Sistemas de Telecomunicaciones e Informáticos",
    degreeName: "ELE304 - Sistemas de Telecomunicaciones e Informáticos",
    level: "Grado Superior",
    modules: [
      { id: 301, code: "0525", name: "Configuración de infraestructuras de sistemas de tele", acronym: "CIST", hours: 133, isDual: false, assignedTeacherId: 9 },
      { id: 302, code: "0551", name: "Elementos de sistemas de telecomunicaciones", acronym: "EST", hours: 133, isDual: false, assignedTeacherId: 3 },
      { id: 303, code: "0552", name: "Sistemas informáticos y redes locales", acronym: "SIRL", hours: 133, isDual: true, assignedTeacherId: 2 },
      { id: 304, code: "0554", name: "Sistemas de producción audiovisual", acronym: "SPA", hours: 200, isDual: true, assignedTeacherId: 4 },
      { id: 305, code: "0601", name: "Gestión de proyectos de instalaciones de teleco", acronym: "GPIT", hours: 67, isDual: false, assignedTeacherId: 9 },
      { id: 306, code: "0713", name: "Sistemas de telefonía fija y móvil", acronym: "STFM", hours: 133, isDual: false, assignedTeacherId: 6 },
      { id: 307, code: "1665", name: "Digitalización aplicada a los sectores productivos (GS)", acronym: "DASP", hours: 33, isDual: false, assignedTeacherId: 6 },
      { id: 308, code: "0179", name: "Inglés Profesional", acronym: "IP", hours: 67, isDual: false, assignedTeacherId: 7 },
      { id: 309, code: "1709", name: "Itinerario personal para la empleabilidad I", acronym: "IPEI", hours: 100, isDual: false, assignedTeacherId: 8 }
    ]
  },
  {
    id: 4,
    name: "2º Sistemas de Telecomunicaciones e Informáticos",
    degreeName: "ELE304 - Sistemas de Telecomunicaciones e Informáticos",
    level: "Grado Superior",
    modules: [
      { id: 401, code: "0553", name: "Técnicas y procesos en infraestructuras de teleco", acronym: "TPIT", hours: 133, isDual: true, assignedTeacherId: 4 },
      { id: 402, code: "0555", name: "Redes telemáticas", acronym: "RT", hours: 233, isDual: true, assignedTeacherId: 5 },
      { id: 403, code: "0556", name: "Sistemas de radiocomunicaciones", acronym: "SR", hours: 200, isDual: true, assignedTeacherId: 5 },
      { id: 404, code: "0557", name: "Sistemas integrados y hogar digital", acronym: "SIHD", hours: 167, isDual: true, assignedTeacherId: 9 },
      { id: 405, code: "1708", name: "Sostenibilidad aplicada al sistema productivo", acronym: "SASP", hours: 33, isDual: false, assignedTeacherId: 3 },
      { id: 406, code: "1713", name: "Proyecto intermodular", acronym: "PI", hours: 67, isDual: false, assignedTeacherId: 2 }
    ]
  },
  {
    id: 5,
    name: "1º Gestión Administrativa",
    degreeName: "ADG201 - Gestión Administrativa",
    level: "Grado Medio",
    modules: [
      { id: 501, code: "0437", name: "Comunicación empresarial y atención al cliente", acronym: "CEAC", hours: 160, isDual: false, assignedTeacherId: null },
      { id: 502, code: "0438", name: "Operaciones administrativas de compra-venta", acronym: "OAC", hours: 160, isDual: false, assignedTeacherId: null },
      { id: 503, code: "0439", name: "Empresa y administración", acronym: "EA", hours: 96, isDual: false, assignedTeacherId: null },
      { id: 504, code: "0440", name: "Tratamiento informático de la información", acronym: "TII", hours: 224, isDual: false, assignedTeacherId: null },
      { id: 505, code: "0441", name: "Técnica contable", acronym: "TC", hours: 96, isDual: false, assignedTeacherId: null },
      { id: 506, code: "0156", name: "Inglés Profesional (GM)", acronym: "IP", hours: 64, isDual: false, assignedTeacherId: null },
      { id: 507, code: "1664", name: "Digitalización aplicada a los sectores productivos (GM)", acronym: "DASP", hours: 32, isDual: false, assignedTeacherId: null },
      { id: 508, code: "1709", name: "Itinerario personal para la empleabilidad I", acronym: "IPEI", hours: 96, isDual: false, assignedTeacherId: null }
    ]
  },
  {
    id: 6,
    name: "2º Gestión Administrativa",
    degreeName: "ADG201 - Gestión Administrativa",
    level: "Grado Medio",
    modules: [
      { id: 601, code: "0446", name: "Empresa en el aula", acronym: "EA", hours: 147, isDual: true, assignedTeacherId: null },
      { id: 602, code: "0448", name: "Operaciones auxiliares de gestión de tesorería", acronym: "OAGT", hours: 147, isDual: true, assignedTeacherId: null },
      { id: 603, code: "0442", name: "Operaciones administrativas de recursos humanos", acronym: "OARH", hours: 105, isDual: true, assignedTeacherId: null },
      { id: 604, code: "0443", name: "Tratamiento de la documentación contable", acronym: "TDC", hours: 105, isDual: true, assignedTeacherId: null },
      { id: 605, code: "1710", name: "Itinerario personal para la empleabilidad II", acronym: "IPEI", hours: 96, isDual: false, assignedTeacherId: null },
      { id: 606, code: "1708", name: "Sostenibilidad aplicada al sistema productivo", acronym: "SASP", hours: 32, isDual: false, assignedTeacherId: null }
    ]
  },
  {
    id: 7,
    name: "1º Administración y Finanzas",
    degreeName: "ADG301 - Administración y Finanzas",
    level: "Grado Superior",
    modules: [
      { id: 701, code: "0647", name: "Gestión de la documentación jurídica y empresarial", acronym: "GDJE", hours: 96, isDual: false, assignedTeacherId: null },
      { id: 702, code: "0648", name: "Recursos humanos y responsabilidad social corporativa", acronym: "RHRSC", hours: 64, isDual: false, assignedTeacherId: null },
      { id: 703, code: "0649", name: "Ofimática y proceso de la información", acronym: "OPI", hours: 192, isDual: false, assignedTeacherId: null },
      { id: 704, code: "0650", name: "Proceso integral de la actividad comercial", acronym: "PIAC", hours: 192, isDual: false, assignedTeacherId: null },
      { id: 705, code: "0651", name: "Comunicación y atención al cliente", acronym: "CAC", hours: 160, isDual: false, assignedTeacherId: null },
      { id: 706, code: "0179", name: "Inglés Profesional (GS)", acronym: "IP", hours: 64, isDual: false, assignedTeacherId: null },
      { id: 707, code: "1665", name: "Digitalización aplicada a los sectores productivos (GS)", acronym: "DASP", hours: 32, isDual: false, assignedTeacherId: null },
      { id: 708, code: "1709", name: "Itinerario personal para la empleabilidad I", acronym: "IPEI", hours: 96, isDual: false, assignedTeacherId: null }
    ]
  },
  {
    id: 8,
    name: "2º Administración y Finanzas",
    degreeName: "ADG301 - Administración y Finanzas",
    level: "Grado Superior",
    modules: [
      { id: 801, code: "0652", name: "Gestión de recursos humanos", acronym: "GRH", hours: 84, isDual: true, assignedTeacherId: null },
      { id: 802, code: "0653", name: "Gestión financiera", acronym: "GF", hours: 126, isDual: true, assignedTeacherId: null },
      { id: 803, code: "0654", name: "Contabilidad y fiscalidad", acronym: "CF", hours: 126, isDual: true, assignedTeacherId: null },
      { id: 804, code: "0655", name: "Gestión logística y comercial", acronym: "GLC", hours: 105, isDual: true, assignedTeacherId: null },
      { id: 805, code: "0656", name: "Simulación empresarial", acronym: "SE", hours: 126, isDual: true, assignedTeacherId: null },
      { id: 806, code: "0657", name: "Proyecto de administración y finanzas", acronym: "PAF", hours: 30, isDual: false, assignedTeacherId: null },
      { id: 807, code: "1710", name: "Itinerario personal para la empleabilidad II", acronym: "IPEI", hours: 96, isDual: false, assignedTeacherId: null },
      { id: 808, code: "1708", name: "Sostenibilidad aplicada al sistema productivo", acronym: "SASP", hours: 32, isDual: false, assignedTeacherId: null }
    ]
  }
];
