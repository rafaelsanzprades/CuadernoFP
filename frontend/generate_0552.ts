const fs = require('fs');
const path = require('path');
import { SIRL } from './src/data/curriculos/sirl';
import { demoSeed } from './src/services/demo-ele203-0237ictve-curso202526';

const mod = SIRL.modulos.find(m => m.codigo === '0552');

const pdId = "0552-sirl-pd";
const cursoId = "0552-sirl-curso-2025-26";

// Generate Programacion
const demoPd = demoSeed["0237-ictve-pd"] as any;

const df_ra = [];
const df_ce = [];

for (const ra of mod!.resultados_aprendizaje) {
  df_ra.push({
    id_ra: ra.id,
    desc_ra: ra.descripcion,
    peso_ra: Math.floor(100 / mod!.resultados_aprendizaje.length)
  });
  
  for (const ce of ra.criterios_evaluacion) {
    df_ce.push({
      id_ce: ce.id,
      id_ra: ra.id,
      desc_ce: ce.descripcion,
      peso_ce: Math.floor(100 / ra.criterios_evaluacion.length)
    });
  }
}

const cddp = {
  ...demoPd,
  id: pdId,
  doc_type: "pd",
  config_pd: {
    ...demoPd.config_pd,
    module_code: "0552",
    module_name: "Sistemas informáticos y redes locales",
    horas: mod!.horas,
    familia: SIRL.familia,
    ciclo: SIRL.denominacion,
    ley_nacional: SIRL.identificacion.norma,
    ley_autonomica: SIRL.identificacion.currículo_autonómico,
  },
  df_ra: df_ra,
  df_ce: df_ce,
  df_ud: [],
  df_ra_ce_ud: [],
  df_inst_eval: demoPd.df_inst_eval,
  df_saber_ce_inst_peso: [],
  df_act: [],
  df_crit_calif: demoPd.df_crit_calif || [],
};

// Generate Curso
const demoCurso = demoSeed["0237-ictve-curso-2025-26"] as any;

const cddc = {
  ...demoCurso,
  id: cursoId,
  parent_id: pdId,
  doc_type: "curso",
  config_curso: {
    ...demoCurso.config_curso,
    nombre_grupo: "1º STI SIRL",
  },
  df_al: demoCurso.df_al, 
  df_al_diario: demoCurso.df_al_diario || [],
  df_eval_ce: [], 
};

const outputDir = path.join("c:\\GD-rsp\\APP\\00 RF local", "0552 SIRL");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, "0552_SIRL_Programacion.cddp"), JSON.stringify(cddp, null, 2), "utf8");
fs.writeFileSync(path.join(outputDir, "0552_SIRL_Curso.cddc"), JSON.stringify(cddc, null, 2), "utf8");

console.log("Files generated successfully in", outputDir);
