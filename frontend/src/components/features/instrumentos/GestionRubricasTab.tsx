"use client";
import React, { useState, useRef } from "react";
import { BookMarked, Plus, Trash2, Pencil, X, Download, Upload, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";
import type { Rubrica, CriterioRubrica, NivelRubrica } from "@/types";

const nuevoNivel = (n: number): NivelRubrica => ({ id_nivel: `NIV${n}`, descripcion: "", puntos: 0 });
const nuevoCriterio = (n: number): CriterioRubrica => ({ id_criterio: `CRIT${n}`, descripcion: "", puntuacion_maxima: 0, niveles: [] });

// Exportacion/importacion de rubricas en el formato que usa Google Classroom para
// sus guias de evaluacion (.xlsx: 2 filas de cabecera fijas + un bloque de 5 filas
// por criterio -- descripcion / fila en blanco / puntos / "Nivel N" / descripciones
// de nivel, niveles ordenados de mayor a menor puntuacion). Adaptado de una app de
// referencia de un companero (David) que ya lo usa en produccion -- Rafael, 2026-09-17.
function exportRubricasAClassroom(rubricas: Rubrica[]) {
  const workbook = XLSX.utils.book_new();
  rubricas.forEach((rubrica) => {
    const filas: (string | number)[][] = [];
    filas.push(["Se recomienda no editar las guías de evaluación en formato de hoja de cálculo"]);
    filas.push(["v1.0-s"]);

    (rubrica.criterios || []).forEach((criterio) => {
      const nivelesOrdenados = [...(criterio.niveles || [])].sort((a, b) => (b.puntos || 0) - (a.puntos || 0));
      filas.push([criterio.descripcion]);
      filas.push([""]);
      filas.push(["", ...nivelesOrdenados.map(n => n.puntos)]);
      filas.push(["", ...nivelesOrdenados.map(n => `Nivel ${n.puntos}`)]);
      filas.push(["", ...nivelesOrdenados.map(n => n.descripcion)]);
    });

    const hoja = XLSX.utils.aoa_to_sheet(filas);
    XLSX.utils.book_append_sheet(workbook, hoja, (rubrica.nombre || "Rúbrica").slice(0, 30));
  });
  XLSX.writeFile(workbook, "rubricas_classroom.xlsx");
}

function importarRubricaDeClassroom(file: File): Promise<Rubrica> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const workbook = XLSX.read(evt.target?.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const criterios: CriterioRubrica[] = [];
        let rowIndex = 2; // Tras las 2 filas de cabecera fijas
        let n = 1;
        while (rowIndex + 4 < data.length) {
          const criterionNameRow = data[rowIndex] || [];
          const pointsRow = data[rowIndex + 2] || [];
          const descriptionsRow = data[rowIndex + 4] || [];

          const criterionDescription = String(criterionNameRow[0] || "").trim();
          if (!criterionDescription) break;

          const niveles: NivelRubrica[] = [];
          for (let col = 1; col < pointsRow.length; col++) {
            const rawScore = pointsRow[col];
            const score = Number(typeof rawScore === "string" ? rawScore.replace(",", ".") : rawScore);
            if (!isNaN(score)) {
              niveles.push({ id_nivel: `NIV${niveles.length + 1}`, descripcion: String(descriptionsRow[col] || ""), puntos: score });
            }
          }
          const maxScore = niveles.length > 0 ? Math.max(...niveles.map(nv => nv.puntos)) : 0;
          criterios.push({ id_criterio: `CRIT${n}`, descripcion: criterionDescription, puntuacion_maxima: maxScore, niveles });
          n++;
          rowIndex += 5;
        }

        resolve({ id_rubrica: `RUB${Date.now()}`, nombre: sheetName, descripcion: "", criterios });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}

export function GestionRubricasTab() {
  const { t } = useTranslation();
  const { moduleData, updateDataFrame } = useAppStore();
  const df_rubricas: Rubrica[] = moduleData?.df_rubricas || [];

  const [draft, setDraft] = useState<Rubrica | null>(null);
  const isNew = draft ? !df_rubricas.some(r => r.id_rubrica === draft.id_rubrica) : false;
  const importInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleExportClassroom = () => {
    if (df_rubricas.length === 0) return;
    exportRubricasAClassroom(df_rubricas);
  };

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    try {
      const rubricaImportada = await importarRubricaDeClassroom(file);
      if ((rubricaImportada.criterios || []).length === 0) {
        setImportError(t('campos.instrumentos.importClassroomSinCriterios', { defaultValue: 'No se reconoció ningún criterio en el fichero. Comprueba que es un export de rúbrica de Google Classroom.' }));
      } else {
        setDraft(rubricaImportada);
      }
    } catch (err) {
      setImportError(t('campos.instrumentos.importClassroomError', { defaultValue: 'Hubo un error al leer el fichero. Comprueba que es un .xlsx exportado desde Google Classroom.' }));
    } finally {
      if (importInputRef.current) importInputRef.current.value = "";
    }
  };

  const startNew = () => {
    setDraft({ id_rubrica: `RUB${Date.now()}`, nombre: "", descripcion: "", criterios: [] });
  };
  const startEdit = (r: Rubrica) => setDraft(JSON.parse(JSON.stringify(r)));
  const cancelEdit = () => setDraft(null);

  const sumaMax = (draft?.criterios || []).reduce((s, c) => s + (Number(c.puntuacion_maxima) || 0), 0);
  const sumaOk = Math.abs(sumaMax - 10) < 0.001;

  const saveDraft = () => {
    if (!draft || !draft.nombre.trim()) return;
    const exists = df_rubricas.some(r => r.id_rubrica === draft.id_rubrica);
    const next = exists
      ? df_rubricas.map(r => (r.id_rubrica === draft.id_rubrica ? draft : r))
      : [...df_rubricas, draft];
    updateDataFrame("df_rubricas", next);
    cancelEdit();
  };

  const removeRubrica = (id: string) => {
    updateDataFrame("df_rubricas", df_rubricas.filter(r => r.id_rubrica !== id));
  };

  const updateDraftField = (field: keyof Rubrica, value: any) =>
    setDraft(d => (d ? { ...d, [field]: value } : d));

  const addCriterio = () => {
    if (!draft) return;
    setDraft({ ...draft, criterios: [...(draft.criterios || []), nuevoCriterio((draft.criterios?.length || 0) + 1)] });
  };
  const updateCriterio = (idx: number, field: keyof CriterioRubrica, value: any) => {
    if (!draft) return;
    const criterios = [...(draft.criterios || [])];
    criterios[idx] = { ...criterios[idx], [field]: value };
    setDraft({ ...draft, criterios });
  };
  const removeCriterio = (idx: number) => {
    if (!draft) return;
    setDraft({ ...draft, criterios: (draft.criterios || []).filter((_, i) => i !== idx) });
  };
  const addNivel = (critIdx: number) => {
    if (!draft) return;
    const criterios = [...(draft.criterios || [])];
    const niveles = [...(criterios[critIdx].niveles || []), nuevoNivel((criterios[critIdx].niveles?.length || 0) + 1)];
    criterios[critIdx] = { ...criterios[critIdx], niveles };
    setDraft({ ...draft, criterios });
  };
  const updateNivel = (critIdx: number, nivIdx: number, field: keyof NivelRubrica, value: any) => {
    if (!draft) return;
    const criterios = [...(draft.criterios || [])];
    const niveles = [...(criterios[critIdx].niveles || [])];
    niveles[nivIdx] = { ...niveles[nivIdx], [field]: value };
    criterios[critIdx] = { ...criterios[critIdx], niveles };
    setDraft({ ...draft, criterios });
  };
  const removeNivel = (critIdx: number, nivIdx: number) => {
    if (!draft) return;
    const criterios = [...(draft.criterios || [])];
    criterios[critIdx] = { ...criterios[critIdx], niveles: (criterios[critIdx].niveles || []).filter((_, i) => i !== nivIdx) };
    setDraft({ ...draft, criterios });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-foreground/5 rounded-lg border border-[var(--glass-border)] p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground">
            <BookMarked className="w-5 h-5 text-indigo-400" /> {t('tabs.instrumentos.rubricas.titulo', { defaultValue: 'Rúbricas de evaluación' })}
          </h2>
          {!draft && (
            <div className="flex items-center gap-3">
              <input
                ref={importInputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={handleImportFileChange}
              />
              <button
                onClick={() => importInputRef.current?.click()}
                className="text-caption text-muted hover:text-foreground flex items-center gap-1 font-semibold"
                title={t('campos.instrumentos.importarClassroomAyuda', { defaultValue: 'Importar una rúbrica desde un .xlsx exportado de Google Classroom' })}
              >
                <Upload className="w-3.5 h-3.5" /> {t('botones.instrumentos.importarClassroom', { defaultValue: 'Importar de Classroom' })}
              </button>
              <button
                onClick={handleExportClassroom}
                disabled={df_rubricas.length === 0}
                className="text-caption text-muted hover:text-foreground flex items-center gap-1 font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                title={t('campos.instrumentos.exportarClassroomAyuda', { defaultValue: 'Exportar todas las rúbricas a un .xlsx compatible con Google Classroom' })}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> {t('botones.instrumentos.exportarClassroom', { defaultValue: 'Exportar a Classroom' })}
              </button>
              <button onClick={startNew} className="text-caption text-accent hover:text-accent/80 flex items-center gap-1 font-semibold">
                <Plus className="w-3.5 h-3.5" /> {t('botones.instrumentos.nuevaRubrica', { defaultValue: 'Nueva rúbrica' })}
              </button>
            </div>
          )}
        </div>

        {importError && (
          <p className="text-caption text-danger mb-3">{importError}</p>
        )}

        {df_rubricas.length === 0 && !draft && (
          <p className="text-body text-muted">{t('campos.instrumentos.sinRubricas', { defaultValue: 'Sin rúbricas todavía. Una rúbrica se puede asignar a cualquier instrumento desde su "Configuración avanzada" y calificarse por niveles en vez de con una nota directa.' })}</p>
        )}

        {!draft && df_rubricas.length > 0 && (
          <div className="space-y-2">
            {df_rubricas.map(r => (
              <div key={r.id_rubrica} className="flex items-center justify-between border border-white/10 rounded-lg p-3">
                <div className="min-w-0">
                  <div className="font-semibold text-foreground truncate">{r.nombre || t('campos.instrumentos.sinNombre', { defaultValue: '(sin nombre)' })}</div>
                  {r.descripcion && <div className="text-caption text-muted truncate">{r.descripcion}</div>}
                  <div className="text-caption text-muted">{(r.criterios || []).length} {t('campos.instrumentos.criterios', { defaultValue: 'criterios' })}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => startEdit(r)} className="p-1.5 rounded text-amber-400 hover:bg-white/10" title={t('common.editar', { defaultValue: 'Editar' })}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeRubrica(r.id_rubrica)} className="p-1.5 rounded text-danger hover:bg-white/10" title={t('common.eliminar', { defaultValue: 'Eliminar' })}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {draft && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-body font-bold text-foreground">
                {isNew ? t('campos.instrumentos.nuevaRubricaTitulo', { defaultValue: 'Nueva rúbrica' }) : t('campos.instrumentos.editarRubricaTitulo', { defaultValue: 'Editar rúbrica' })}
              </h3>
              <button onClick={cancelEdit} className="p-1 rounded text-muted hover:text-foreground hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              value={draft.nombre}
              onChange={(e) => updateDraftField("nombre", e.target.value)}
              placeholder={t('placeholders.instrumentos.nombreRubrica', { defaultValue: 'Nombre de la rúbrica' })}
              className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-3 py-2 text-foreground text-body focus:border-accent focus:outline-none"
            />
            <textarea
              value={draft.descripcion || ""}
              onChange={(e) => updateDraftField("descripcion", e.target.value)}
              placeholder={t('placeholders.instrumentos.descripcionRubrica', { defaultValue: 'Descripción (opcional)' })}
              rows={2}
              className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-3 py-2 text-foreground text-body focus:border-accent focus:outline-none"
            />

            <div className={`rounded-lg border p-3 text-center font-semibold ${sumaOk ? 'bg-success/10 border-success/30 text-success' : 'bg-danger/10 border-danger/30 text-danger'}`}>
              {t('campos.instrumentos.sumaPuntuacionMaxima', { defaultValue: 'Suma de puntuación máxima' })}: {sumaMax.toFixed(2)} / 10
              {!sumaOk && <span className="block text-caption font-normal mt-1">{t('campos.instrumentos.sumaDebeSerDiez', { defaultValue: 'La suma de las puntuaciones máximas de todos los criterios debe ser exactamente 10.' })}</span>}
            </div>

            <div className="space-y-3">
              {(draft.criterios || []).map((crit, cIdx) => (
                <div key={crit.id_criterio} className="border border-white/10 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={crit.descripcion}
                      onChange={(e) => updateCriterio(cIdx, "descripcion", e.target.value)}
                      placeholder={t('placeholders.instrumentos.descripcionCriterio', { defaultValue: 'Descripción del criterio' })}
                      className="flex-1 bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-body focus:border-accent focus:outline-none"
                    />
                    <span className="text-caption text-muted shrink-0">{t('campos.instrumentos.puntuacionMaxima', { defaultValue: 'Puntuación máxima' })}</span>
                    <input
                      type="number" step="0.5" min="0"
                      value={crit.puntuacion_maxima}
                      onChange={(e) => updateCriterio(cIdx, "puntuacion_maxima", Number(e.target.value) || 0)}
                      className="w-20 bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-body text-center focus:border-accent focus:outline-none"
                    />
                    <button onClick={() => removeCriterio(cIdx)} className="text-danger hover:text-danger p-1 shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="pl-3 space-y-1.5">
                    {(crit.niveles || []).map((niv, nIdx) => (
                      <div key={niv.id_nivel} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={niv.descripcion}
                          onChange={(e) => updateNivel(cIdx, nIdx, "descripcion", e.target.value)}
                          placeholder={t('placeholders.instrumentos.descripcionNivel', { defaultValue: 'Descripción del nivel' })}
                          className="flex-1 bg-foreground/10 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-caption focus:border-accent focus:outline-none"
                        />
                        <input
                          type="number" step="0.5"
                          value={niv.puntos}
                          onChange={(e) => updateNivel(cIdx, nIdx, "puntos", Number(e.target.value) || 0)}
                          placeholder={t('campos.instrumentos.puntos', { defaultValue: 'Puntos' })}
                          className="w-20 bg-foreground/10 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-caption text-center focus:border-accent focus:outline-none"
                        />
                        <button onClick={() => removeNivel(cIdx, nIdx)} className="text-danger hover:text-danger p-1 shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addNivel(cIdx)} className="text-caption text-accent hover:text-accent/80 flex items-center gap-1 font-semibold mt-1">
                      <Plus className="w-3 h-3" /> {t('botones.instrumentos.anadirNivel', { defaultValue: 'Añadir nivel' })}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button onClick={addCriterio} className="text-caption text-accent hover:text-accent/80 flex items-center gap-1 font-semibold">
                <Plus className="w-3.5 h-3.5" /> {t('botones.instrumentos.anadirCriterio', { defaultValue: 'Añadir criterio' })}
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-white/10">
              <button
                onClick={saveDraft}
                disabled={!draft.nombre.trim()}
                className="px-4 py-2 rounded-lg bg-accent text-white font-semibold text-body disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90"
              >
                {t('common.guardar', { defaultValue: 'Guardar' })}
              </button>
              <button onClick={cancelEdit} className="px-4 py-2 rounded-lg bg-foreground/10 text-foreground font-semibold text-body hover:bg-foreground/20">
                {t('common.cancelar', { defaultValue: 'Cancelar' })}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
