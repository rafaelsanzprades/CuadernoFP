/**
 * generateDemoJsons.ts
 * 
 * Script para generar los archivos JSON estáticos en public/demo/
 * a partir de los seeds TS embebidos.
 * 
 * Ejecutar: npx tsx frontend/scripts/generateDemoJsons.ts
 */

import { demoSeed, CRM_SEED_VERSION } from '../src/services/demo-ele203-0237ictve-curso202526';
import { demoSeed0223 } from '../src/services/demo-smr201-0223ao-curso202526';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'demo');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Merge seeds
const fullSeed: Record<string, any> = { ...demoSeed, ...demoSeed0223 };

console.log('Available keys in merged seed:');
Object.keys(fullSeed).forEach(k => console.log(`  ${k}: tipo=${fullSeed[k]?.tipo}`));

// ─── 0223: SMR201 - Aplicaciones Ofimáticas ─────────────────

// .fpp: Programación data (keys from ALLOWED_PROGRAMACION_KEYS)
const pd0223Keys = [
  'df_ud', 'df_sesiones', 'df_ra', 'df_ce', 'df_tareas', 'df_act', 'df_instr',
  'df_pr', 'df_dua', 'df_contingencia', 'df_ace', 'info_modulo',
  'config_contexto', 'config_aula', 'config_redondeo', 'ra_og_mapping',
  'info_fechas', 'horario', 'calendar_notes', 'config_pesos_trim',
  'planning_ledger', 'df_empresas',
  'medidas_inclusion', 'texto_inclusion_libre',
  'instrumentos_seleccionados', 'recursos_espacios', 'metodologias_seleccionadas',
  'texto_metodologia_libre', 'elementos_transversales', 'actividades_complementarias',
  'medidas_contingencia', 'texto_contingencia_libre',
  'texto_contextualizacion_libre',
  'textos_pd_contexto_geografico', 'textos_pd_contexto_socioeconomico',
  'textos_pd_contexto_escolar', 'textos_pd_caracteristicas_alumnado',
  'textos_pd_feoe_organizacion', 'textos_pd_feoe_seguimiento',
  'textos_pd_eval_informacion', 'textos_pd_eval_perdida_continua',
  'textos_pd_eval_recuperacion', 'textos_pd_eval_pendientes',
  'textos_pd_metodologia_labor_coordinada', 'textos_pd_inclusion',
  'textos_pd_contingencia_profesor', 'textos_pd_contingencia_alumnado',
  'textos_pd_bibliografia', 'textos_pd_publicidad',
  'df_contexto',
];

// The 0223 seed has TWO docs: one "curso" and one "programacion"
const pd0223Doc = fullSeed['0223-ao-pd'];
const curso0223Doc = fullSeed['0223-ao-curso-202526-1a-gm'];

if (pd0223Doc) {
  // Normalize
  const fpp0223: any = { tipo: 'pd', __version__: CRM_SEED_VERSION };
  for (const key of pd0223Keys) {
    if (pd0223Doc[key] !== undefined) {
      fpp0223[key] = pd0223Doc[key];
    }
  }
  // Extract textos_pd_* from the CURSO doc (0223 seed has them there)
  if (curso0223Doc) {
    Object.keys(curso0223Doc).forEach(key => {
      if (key.startsWith('textos_pd_') && !fpp0223[key]) {
        fpp0223[key] = curso0223Doc[key];
      }
    });
  }
  // Normalize is_dual in df_ra
  if (fpp0223.df_ra) {
    fpp0223.df_ra = fpp0223.df_ra.map((ra: any) => ({
      ...ra,
      is_dual: ra.is_dual === 'true' || ra.is_dual === true,
    }));
  }
  // Normalize peso_ce in df_ce and UD → id_ud
  if (fpp0223.df_ce) {
    fpp0223.df_ce = fpp0223.df_ce.map((ce: any) => ({
      ...ce,
      peso_ce: typeof ce.peso_ce === 'string' ? parseInt(ce.peso_ce, 10) : ce.peso_ce,
      id_ud: ce.id_ud || ce.UD || '',
    }));
  }

  const fppPath = path.join(OUTPUT_DIR, '0223.fpp.json');
  fs.writeFileSync(fppPath, JSON.stringify(fpp0223, null, 2));
  console.log(`✅ Generated ${fppPath} (${Object.keys(fpp0223).length} keys)`);
} else {
  console.error('❌ Could not find 0223-ao-pd in seed');
}

if (curso0223Doc) {
  // Normalize: remove textos_pd_* from curso (they belong in .fpp)
  const fpc0223: any = { ...curso0223Doc };
  // Remove textos_pd_* (they were incorrectly placed in the curso doc in the seed)
  Object.keys(fpc0223).forEach(key => {
    if (key.startsWith('textos_pd_')) {
      delete fpc0223[key];
    }
  });
  // Ensure tipo and inject id/grupo
  fpc0223.tipo = 'curso';
  fpc0223.id = '0223-ao-curso-202526-1a-gm';
  fpc0223.grupo = '1A';
  // Wrap in array for consistency
  const fpcPath = path.join(OUTPUT_DIR, '0223.fpc.json');
  fs.writeFileSync(fpcPath, JSON.stringify([fpc0223], null, 2));
  console.log(`✅ Generated ${fpcPath} (1 grupo)`);
} else {
  console.error('❌ Could not find 0223-ao-curso-202526-1a-gm in seed');
}

// ─── 0237: ELE203 - ICTVE ──────────────────────────────────

// The 0237 seed has multiple docs: general PD, general curso, and per-group cursos
const pd0237Keys = [
  'df_ud', 'df_sesiones', 'df_ra', 'df_ce', 'df_tareas', 'df_act', 'df_instr',
  'df_pr', 'df_dua', 'df_contingencia', 'df_ace', 'info_modulo',
  'config_contexto', 'config_aula', 'config_redondeo', 'ra_og_mapping',
  'info_fechas', 'horario', 'calendar_notes', 'config_pesos_trim',
  'planning_ledger', 'df_empresas',
  'medidas_inclusion', 'texto_inclusion_libre',
  'instrumentos_seleccionados', 'recursos_espacios', 'metodologias_seleccionadas',
  'texto_metodologia_libre', 'elementos_transversales', 'actividades_complementarias',
  'medidas_contingencia', 'texto_contingencia_libre',
  'texto_contextualizacion_libre',
  'textos_pd_contexto_geografico', 'textos_pd_contexto_socioeconomico',
  'textos_pd_contexto_escolar', 'textos_pd_caracteristicas_alumnado',
  'textos_pd_feoe_organizacion', 'textos_pd_feoe_seguimiento',
  'textos_pd_eval_informacion', 'textos_pd_eval_perdida_continua',
  'textos_pd_eval_recuperacion', 'textos_pd_eval_pendientes',
  'textos_pd_metodologia_labor_coordinada', 'textos_pd_inclusion',
  'textos_pd_contingencia_profesor', 'textos_pd_contingencia_alumnado',
  'textos_pd_bibliografia', 'textos_pd_publicidad',
];

// Find the PD document (tipo: "pd" or "programacion")
const pd0237Key = Object.keys(fullSeed).find(k => {
  const doc = fullSeed[k];
  return doc?.tipo === 'pd' && !k.includes('curso');
});

const pd0237Doc = pd0237Key ? fullSeed[pd0237Key] : null;

if (pd0237Doc) {
  const fpp0237: any = { tipo: 'pd', __version__: CRM_SEED_VERSION };
  for (const key of pd0237Keys) {
    if (pd0237Doc[key] !== undefined) {
      fpp0237[key] = pd0237Doc[key];
    }
  }
  // Normalize is_dual in df_ra
  if (fpp0237.df_ra) {
    fpp0237.df_ra = fpp0237.df_ra.map((ra: any) => ({
      ...ra,
      is_dual: ra.is_dual === 'Sí' || ra.is_dual === 'si' || ra.is_dual === true,
    }));
  }
  // Normalize peso_ce in df_ce
  if (fpp0237.df_ce) {
    fpp0237.df_ce = fpp0237.df_ce.map((ce: any) => ({
      ...ce,
      peso_ce: typeof ce.peso_ce === 'string' ? parseInt(ce.peso_ce, 10) : ce.peso_ce,
    }));
  }

  const fppPath = path.join(OUTPUT_DIR, '0237.fpp.json');
  fs.writeFileSync(fppPath, JSON.stringify(fpp0237, null, 2));
  console.log(`✅ Generated ${fppPath} (${Object.keys(fpp0237).length} keys)`);
} else {
  console.error('❌ Could not find 0237 PD document in seed');
  console.log('Available keys:', Object.keys(fullSeed).filter(k => fullSeed[k]?.tipo === 'pd'));
}

// Find all curso documents for 0237
const curso0237Keys = Object.keys(fullSeed).filter(k => {
  const doc = fullSeed[k];
  return doc?.tipo === 'curso' && k.startsWith('0237');
});

if (curso0237Keys.length > 0) {
  const fpc0237 = curso0237Keys.map(k => {
    const doc = { ...fullSeed[k] };
    // Remove textos_pd_* from curso docs (they belong in .fpp)
    Object.keys(doc).forEach(key => {
      if (key.startsWith('textos_pd_')) {
        delete doc[key];
      }
    });
    // Inject id and grupo from the seed key
    doc.id = k;
    // Extract group from key: "0237-ictve-curso-2025-26-1A" → "1A"
    const groupMatch = k.match(/-([12][A-Z])$/);
    doc.grupo = groupMatch ? groupMatch[1] : 'general';
    return doc;
  });

  const fpcPath = path.join(OUTPUT_DIR, '0237.fpc.json');
  fs.writeFileSync(fpcPath, JSON.stringify(fpc0237, null, 2));
  console.log(`✅ Generated ${fpcPath} (${fpc0237.length} grupos)`);
} else {
  console.error('❌ Could not find 0237 curso documents in seed');
  console.log('Available curso keys:', Object.keys(fullSeed).filter(k => fullSeed[k]?.tipo === 'curso'));
}

console.log('\nDone! Files generated in:', OUTPUT_DIR);
