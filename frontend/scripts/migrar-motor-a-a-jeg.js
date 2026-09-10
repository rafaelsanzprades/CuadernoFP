#!/usr/bin/env node
/**
 * Migra un curso de Motor A a Motor JEG (modo automático, Ítem 42 punto 6).
 *
 * Recorre df_act de una Programación (.fpp) y, por cada vínculo Actividad-CE
 * ya existente (act[ce_id] === true), aplica la misma lógica que
 * sincronizarIndicadorAuto()/setCalificacionAuto() de
 * frontend/src/utils/calificaciones.ts -- crea/gestiona el Instrumento e
 * Indicador correspondientes en la Programación, y replica cada nota ya
 * puesta en df_eval como una fila de df_calificaciones en el Curso (.fpc).
 *
 * Sin esto, un curso con historial de Motor A muestra "Sin evaluar" en el
 * panel de RA/CE calculado con Motor JEG hasta que se re-toque cada nota a
 * mano -- ver Fase 4 del plan en RF Ideas/01 Histórico.md, entrada
 * "2026-09-10". Idempotente: se puede ejecutar varias veces sin duplicar
 * datos (mismo IDs deterministas que el modo automático en vivo).
 *
 * Uso:
 *   node scripts/migrar-motor-a-a-jeg.js <fichero.fpp> <fichero.fpc> [<fichero.fpc> ...]
 *
 * Varios .fpc pueden compartir la misma Programación (varias clases del
 * mismo módulo) -- el .fpp se lee y se sobrescribe una sola vez al final,
 * acumulando los Instrumentos/Indicadores de todos los .fpc pasados.
 *
 * Sobrescribe los ficheros in-place. Se recomienda copia de seguridad antes
 * (no la hace este script).
 */
const fs = require('fs');
const path = require('path');

function repartoIgualitario(count, total = 100) {
  if (count <= 0) return [];
  const baseShare = Math.floor(total / count);
  let rem = total - baseShare * count;
  return Array.from({ length: count }, () => {
    const share = baseShare + (rem > 0 ? 1 : 0);
    if (rem > 0) rem--;
    return share;
  });
}

const TRI_A_EVALUACION = { "1T": "Ev1", "2T": "Ev2", "3T": "Ev3" };

// Copia literal de sincronizarIndicadorAuto()/setCalificacionAuto()
// (utils/calificaciones.ts) -- ver el original para la explicación completa.
function sincronizarIndicadorAuto(act, ce_id, df_instr, df_indicadores) {
  const id_instrumento = act.id_act;
  let nextInstr = [...df_instr];
  let nextInd = [...df_indicadores];

  let instrIdx = nextInstr.findIndex((i) => i.id_instrumento === id_instrumento);
  if (instrIdx === -1) {
    nextInstr.push({
      id_instrumento,
      titulo: act.desc_act || id_instrumento,
      tipo: "rubrica",
      escala: "continua_10",
      evaluacion: TRI_A_EVALUACION[act.tri_act] || "Ev1",
      agente: "heteroevaluacion",
      peso_global: 1,
      indicadores_vinculados: [],
      origen: "centro",
      procedimiento: "ordinario",
    });
    instrIdx = nextInstr.length - 1;
  }

  const id_indicador = `${id_instrumento}-${ce_id}`;
  if (!nextInd.some((i) => i.id_indicador === id_indicador)) {
    nextInd.push({ id_indicador, id_ce: ce_id, descripcion: act.desc_act || "", peso: 0, is_basico: false });
  }
  const vinculados = new Set(nextInstr[instrIdx].indicadores_vinculados || []);
  vinculados.add(id_indicador);
  nextInstr[instrIdx] = { ...nextInstr[instrIdx], indicadores_vinculados: Array.from(vinculados) };

  const indsDelCe = nextInd.filter((i) => i.id_ce === ce_id);
  const shares = repartoIgualitario(indsDelCe.length);
  const pesoPorId = {};
  indsDelCe.forEach((ind, idx) => { pesoPorId[ind.id_indicador] = shares[idx]; });
  nextInd = nextInd.map((i) => (i.id_ce === ce_id ? { ...i, peso: pesoPorId[i.id_indicador] } : i));

  return { df_instr: nextInstr, df_indicadores: nextInd, id_indicador };
}

function setCalificacionAuto(df_calificaciones, id_alumno, id_instrumento, id_indicador, valor) {
  const idx = df_calificaciones.findIndex(
    (c) => c.id_alumno === id_alumno && c.id_instrumento === id_instrumento && c.id_indicador === id_indicador
  );
  const next = [...df_calificaciones];
  if (valor === null || Number.isNaN(valor)) {
    if (idx >= 0) next.splice(idx, 1);
    return next;
  }
  const row = {
    id_calificacion: idx >= 0 ? next[idx].id_calificacion : `${id_alumno}-${id_instrumento}-${id_indicador}`,
    id_alumno, id_instrumento, id_indicador, valor,
  };
  if (idx >= 0) next[idx] = row; else next.push(row);
  return next;
}

function migrarCurso(fpcPath, df_act, df_ce, df_instr, df_indicadores) {
  const fpcRaw = JSON.parse(fs.readFileSync(fpcPath, 'utf8'));
  const curso = Array.isArray(fpcRaw) ? fpcRaw[0] : fpcRaw; // mismo guard que fileManager.ts
  const df_eval = curso.df_eval || [];
  let df_calificaciones = curso.df_calificaciones || [];

  let nGrades = 0;
  df_act.forEach((act) => {
    if (!act.id_act) return;
    df_ce.forEach((ce) => {
      if (act[ce.id_ce] !== true) return;
      const sync = sincronizarIndicadorAuto(act, ce.id_ce, df_instr, df_indicadores);
      df_instr = sync.df_instr;
      df_indicadores = sync.df_indicadores;
      df_eval.forEach((evRow) => {
        const raw = evRow[act.id_act];
        const val = Number(raw);
        if (raw === undefined || raw === null || raw === "" || Number.isNaN(val)) return;
        df_calificaciones = setCalificacionAuto(df_calificaciones, evRow.ID, act.id_act, sync.id_indicador, val);
        nGrades++;
      });
    });
  });

  curso.df_calificaciones = df_calificaciones;
  fs.writeFileSync(fpcPath, JSON.stringify(Array.isArray(fpcRaw) ? [curso] : curso, null, 2));
  console.log(`  ${path.basename(fpcPath)}: ${nGrades} calificaciones migradas (${df_calificaciones.length} en total).`);

  return { df_instr, df_indicadores };
}

function main() {
  const [, , fppArg, ...fpcArgs] = process.argv;
  if (!fppArg || fpcArgs.length === 0) {
    console.error("Uso: node migrar-motor-a-a-jeg.js <fichero.fpp> <fichero.fpc> [<fichero.fpc> ...]");
    process.exit(1);
  }

  const pd = JSON.parse(fs.readFileSync(fppArg, 'utf8'));
  const df_act = pd.df_act || [];
  const df_ce = pd.df_ce || [];
  let df_instr = pd.df_instr || [];
  let df_indicadores = pd.df_indicadores || [];

  console.log(`Programación: ${path.basename(fppArg)} (${df_act.length} actividades, ${df_ce.length} CE)`);

  fpcArgs.forEach((fpcArg) => {
    const result = migrarCurso(fpcArg, df_act, df_ce, df_instr, df_indicadores);
    df_instr = result.df_instr;
    df_indicadores = result.df_indicadores;
  });

  pd.df_instr = df_instr;
  pd.df_indicadores = df_indicadores;
  fs.writeFileSync(fppArg, JSON.stringify(pd, null, 2));
  console.log(`  ${path.basename(fppArg)}: ${df_instr.length} instrumentos, ${df_indicadores.length} indicadores.`);
}

main();
