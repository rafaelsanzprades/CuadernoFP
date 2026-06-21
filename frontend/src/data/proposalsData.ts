export interface ProposalUD {
  id_ud: string;
  desc_ud: string;
  horas_ud: number;
  ra_mappings: Record<string, number>;
}

export interface PublisherProposal {
  id: string;
  author: string;
  moduleCode: string;
  title: string;
  description: string;
  totalHours: number;
  df_ud: ProposalUD[];
  ra_og_mapping: Record<string, Record<string, 'alta' | 'media' | 'baja'>>;
}

export const publisherProposals: PublisherProposal[] = [
  {
    id: "editex-0237-v1",
    author: "Editex",
    moduleCode: "0237",
    title: "Secuenciación Trimestral Práctica",
    description: "Propuesta de 167 horas dividida en 9 unidades de trabajo con un enfoque eminentemente práctico, adaptada para 0237.",
    totalHours: 167,
    df_ud: [
      { id_ud: "UD01", desc_ud: "Conceptos básicos de telecomunicación", horas_ud: 15, ra_mappings: { "RA1": 100 } },
      { id_ud: "UD02", desc_ud: "Sistemas de captación de señales", horas_ud: 20, ra_mappings: { "RA2": 50 } },
      { id_ud: "UD03", desc_ud: "Equipos de cabecera", horas_ud: 25, ra_mappings: { "RA2": 50, "RA3": 30 } },
      { id_ud: "UD04", desc_ud: "Red de distribución", horas_ud: 25, ra_mappings: { "RA3": 70, "RA4": 20 } },
      { id_ud: "UD05", desc_ud: "Infraestructuras de radiodifusión", horas_ud: 20, ra_mappings: { "RA4": 80 } },
      { id_ud: "UD06", desc_ud: "Telefonía básica", horas_ud: 15, ra_mappings: { "RA5": 50 } },
      { id_ud: "UD07", desc_ud: "Telefonía IP", horas_ud: 15, ra_mappings: { "RA5": 50, "RA6": 20 } },
      { id_ud: "UD08", desc_ud: "Control de accesos", horas_ud: 15, ra_mappings: { "RA6": 80 } },
      { id_ud: "UD09", desc_ud: "Mantenimiento y averías", horas_ud: 17, ra_mappings: { "RA7": 100 } }
    ],
    ra_og_mapping: {
      "RA1": { "a": "alta", "b": "media" },
      "RA2": { "c": "alta", "d": "media" },
      "RA3": { "e": "alta", "f": "media" },
      "RA4": { "g": "alta", "h": "media" },
      "RA5": { "i": "alta" },
      "RA6": { "j": "alta" },
      "RA7": { "k": "alta" }
    }
  },
  {
    id: "macmillan-0237-v1",
    author: "Macmillan Education",
    moduleCode: "0237",
    title: "Enfoque por Proyectos (ABP)",
    description: "Secuenciación basada en el Aprendizaje Basado en Proyectos, agrupando conocimientos en 5 grandes bloques (167 horas).",
    totalHours: 167,
    df_ud: [
      { id_ud: "UD01", desc_ud: "Proyecto 1: Diseño de ICT básica", horas_ud: 30, ra_mappings: { "RA1": 50, "RA2": 50 } },
      { id_ud: "UD02", desc_ud: "Proyecto 2: Cabecera y distribución", horas_ud: 35, ra_mappings: { "RA1": 50, "RA2": 50, "RA3": 50, "RA4": 50 } },
      { id_ud: "UD03", desc_ud: "Proyecto 3: Integración de telefonía", horas_ud: 35, ra_mappings: { "RA3": 50, "RA4": 50, "RA5": 100 } },
      { id_ud: "UD04", desc_ud: "Proyecto 4: Videoporteros y CCTV", horas_ud: 35, ra_mappings: { "RA6": 100 } },
      { id_ud: "UD05", desc_ud: "Proyecto 5: Auditoría y mantenimiento ICT", horas_ud: 32, ra_mappings: { "RA7": 100 } }
    ],
    ra_og_mapping: {
      "RA1": { "a": "alta" },
      "RA2": { "b": "alta" },
      "RA3": { "c": "alta" },
      "RA4": { "d": "alta" },
      "RA5": { "e": "alta" },
      "RA6": { "f": "alta" },
      "RA7": { "g": "alta" }
    }
  }
];
