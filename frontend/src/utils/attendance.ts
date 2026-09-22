// Asistencia (presente/falta/retraso) por fecha y alumno/a. Vivía en el
// servidor (tabla attendance_records) hasta el 2026-09-22, cuando se migró a
// local (Ítem 45, 00 IDEAS.md) por contradecir "el servidor es ciego" -- ver
// también 01 Histórico.md de esa fecha. Se guarda en cursoData.attendance_ledger,
// con la forma { [fecha_ISO]: { [alumno_ID]: AttendanceStatus } }.

export type AttendanceStatus = "presente" | "falta" | "retraso" | "";

export interface AttendanceLedger {
  [dateStr: string]: { [studentId: string]: AttendanceStatus };
}

export interface AttendanceRecordFlat {
  student_id: string;
  date_str: string;
  status: AttendanceStatus;
}

/** Estado de un alumno en una fecha concreta, o "" si no hay registro. */
export function getAttendanceStatus(
  ledger: AttendanceLedger | undefined,
  dateStr: string,
  studentId: string
): AttendanceStatus {
  return ledger?.[dateStr]?.[studentId] || "";
}

/** Todos los estados registrados en una fecha, como { alumno_ID: estado }. */
export function getAttendanceForDate(
  ledger: AttendanceLedger | undefined,
  dateStr: string
): Record<string, AttendanceStatus> {
  return ledger?.[dateStr] || {};
}

/**
 * Aplana el ledger (anidado por fecha) a una lista plana de registros, la
 * misma forma que devolvía antes `GET /api/attendance/{id}` -- para no tener
 * que reescribir toda la lógica de los consumidores (AttendanceAccumulated,
 * AlertaAbandonoTab, ExpedienteTab), que ya trabajaban sobre un array plano.
 */
export function flattenAttendanceLedger(ledger: AttendanceLedger | undefined): AttendanceRecordFlat[] {
  if (!ledger) return [];
  const out: AttendanceRecordFlat[] = [];
  for (const dateStr of Object.keys(ledger)) {
    const dia = ledger[dateStr] || {};
    for (const studentId of Object.keys(dia)) {
      const status = dia[studentId];
      if (status) out.push({ student_id: studentId, date_str: dateStr, status });
    }
  }
  return out;
}

/**
 * Devuelve un nuevo ledger con el estado de un alumno en una fecha
 * actualizado (o borrado, si status es "" o null) -- para pasar directo a
 * updateCursoData("attendance_ledger", ...).
 */
export function withAttendanceStatus(
  ledger: AttendanceLedger | undefined,
  dateStr: string,
  studentId: string,
  status: AttendanceStatus | null
): AttendanceLedger {
  const next: AttendanceLedger = { ...(ledger || {}) };
  const dia = { ...(next[dateStr] || {}) };
  if (!status) {
    delete dia[studentId];
  } else {
    dia[studentId] = status;
  }
  next[dateStr] = dia;
  return next;
}
