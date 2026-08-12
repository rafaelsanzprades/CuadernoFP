"""
Port de frontend/src/utils/planningGenerator.ts (función generatePlanning) a Python.

La página /agenda?tab=planificacion NO lee el df_sgmt guardado en el .fpc: lo
recalcula en cada render a partir de df_ud + info_fechas + horario +
calendar_notes (reparto proporcional de horas por semana, saltando festivos,
con la FEOE ocupando su propio rango de fechas). El df_sgmt guardado puede
quedar desactualizado en cuanto cambian esos datos de origen — por eso los
generadores de PD también deben recalcularlo aquí en vez de leer el snapshot,
para que la página de previsión del PD coincida con lo que ve el profesorado
en /agenda?tab=planificacion.

Debe mantenerse en sincronía a mano con planningGenerator.ts si ese algoritmo
cambia — no hay compartición de código entre frontend (TS) y backend (Python).
"""

import datetime

MONTH_KEYS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
MESES_DISPLAY = ["Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun"]
DAY_KEY_MAP = ["lunes", "martes", "miercoles", "jueves", "viernes", "Lun", "Mar", "Mié", "Jue", "Vie"]


def _parse_date(s):
    if not s:
        return None
    s = str(s)
    try:
        if "-" in s:
            y, m, d = (int(p) for p in s.split("-"))
        else:
            d, m, y = (int(p) for p in s.split("/"))
        return datetime.date(y, m, d)
    except (ValueError, TypeError):
        return None


def _in_range(d, start, end):
    if not start or not end:
        return False
    return start <= d <= end


def _parse_horario_hours(horario_val):
    if horario_val is None or horario_val == "":
        return 0
    try:
        return float(horario_val)
    except (ValueError, TypeError):
        pass
    s = str(horario_val)
    if "-" not in s:
        return 0
    start, _, end = s.partition("-")
    start_parts = start.split(":")
    end_parts = end.split(":")
    if len(start_parts) != 2 or len(end_parts) != 2:
        return 0
    try:
        start_h = float(start_parts[0]) + float(start_parts[1]) / 60
        end_h = float(end_parts[0]) + float(end_parts[1]) / 60
    except (ValueError, TypeError):
        return 0
    return max(0, round(end_h - start_h))


def generate_planning(df_ud, info_fechas, horario, calendar_notes):
    """Recalcula df_sgmt (UD x mes, Prv/Imp) + fila FEOE, igual que
    generatePlanning() en planningGenerator.ts. Devuelve una lista de dicts
    (misma forma que el df_sgmt guardado, más la fila FEOE si aplica)."""
    info_fechas = info_fechas or {}
    horario = horario or {}
    calendar_notes = calendar_notes or {}
    df_ud = df_ud or []
    docencia_dual = info_fechas.get("docencia_dual") or "sin_docencia"

    term_ranges = [
        (
            _parse_date(info_fechas.get("inicio") or info_fechas.get("ini_1t")),
            _parse_date(info_fechas.get("evaluacion_1") or info_fechas.get("fin_1t")),
        ),
        (
            _parse_date(info_fechas.get("evaluacion_1") or info_fechas.get("ini_2t")),
            _parse_date(info_fechas.get("evaluacion_2") or info_fechas.get("fin_2t")),
        ),
        (
            _parse_date(info_fechas.get("evaluacion_2") or info_fechas.get("ini_3t")),
            _parse_date(info_fechas.get("fin") or info_fechas.get("evaluacion_final") or info_fechas.get("fin_3t")),
        ),
    ]

    feo_s = _parse_date(info_fechas.get("ini_feoe"))
    feo_e = _parse_date(info_fechas.get("fin_feoe"))

    dates_list = []
    seen = set()
    for ini, fin in term_ranges:
        if not ini or not fin:
            continue
        curr = ini
        while curr <= fin:
            if curr.weekday() <= 4 and curr not in seen:
                dates_list.append(curr)
                seen.add(curr)
            curr += datetime.timedelta(days=1)
    dates_list.sort()

    simulated_today = datetime.date.today()
    fin_curso = _parse_date(info_fechas.get("fin_curso"))
    if fin_curso:
        simulated_today = datetime.date(fin_curso.year, 5, 2)

    ud_queue = []
    for ud in df_ud:
        h = float(ud.get("duracion") or ud.get("horas_ud") or 0)
        ud_queue.append({"id_ud": ud.get("id_ud"), "h_rem": h})

    prv_tracker = {ud["id_ud"]: {} for ud in ud_queue}
    prv_tracker["FEOE"] = {}

    current_ud_index = 0
    # Primera fecha con horas asignadas por UD — se asigna al trimestre en
    # el que EMPIEZA, no en el que termina (igual que planningGenerator.ts).
    ud_first_date = {}
    # Última fecha con horas asignadas — solo para decidir dónde insertar la
    # fila FEOE entre las de UD, por orden cronológico real.
    ud_last_date = {}

    for d in dates_list:
        day_index = d.weekday()  # 0=Lun ... 4=Vie
        lookup = f"{d.year}-{d.month:02d}-{d.day:02d}"
        is_festivo = bool(calendar_notes.get(f"f_{lookup}"))

        horario_val = horario.get(DAY_KEY_MAP[day_index]) or horario.get(DAY_KEY_MAP[day_index + 5])
        hours = _parse_horario_hours(horario_val)

        if is_festivo:
            continue

        is_past_or_today = d <= simulated_today
        is_feoe = _in_range(d, feo_s, feo_e)

        if is_feoe and docencia_dual == "sin_docencia":
            if hours > 0:
                mes = MONTH_KEYS[d.month - 1]
                prv_key, imp_key = f"{mes}_Prv", f"{mes}_Imp"
                prv_tracker["FEOE"][prv_key] = prv_tracker["FEOE"].get(prv_key, 0) + hours
                if is_past_or_today:
                    prv_tracker["FEOE"][imp_key] = prv_tracker["FEOE"].get(imp_key, 0) + hours
            continue

        if hours <= 0:
            continue

        hours_left = hours
        while hours_left > 0 and current_ud_index < len(ud_queue):
            current_ud = ud_queue[current_ud_index]
            mes = MONTH_KEYS[d.month - 1]
            prv_key, imp_key = f"{mes}_Prv", f"{mes}_Imp"

            assigned_now = min(hours_left, current_ud["h_rem"])
            current_ud["h_rem"] -= assigned_now
            if assigned_now > 0:
                if current_ud["id_ud"] not in ud_first_date:
                    ud_first_date[current_ud["id_ud"]] = d
                ud_last_date[current_ud["id_ud"]] = d

            tracker = prv_tracker[current_ud["id_ud"]]
            tracker[prv_key] = tracker.get(prv_key, 0) + assigned_now
            if is_past_or_today:
                tracker[imp_key] = tracker.get(imp_key, 0) + assigned_now

            hours_left -= assigned_now
            if current_ud["h_rem"] <= 0:
                current_ud_index += 1

    def get_evaluacion(d):
        if not d:
            return None
        closest_term = 1
        min_diff = None
        for i, (ini, fin) in enumerate(term_ranges):
            if _in_range(d, ini, fin):
                return i + 1
            if ini:
                diff = abs((d - ini).days)
                if min_diff is None or diff < min_diff:
                    min_diff, closest_term = diff, i + 1
            if fin:
                diff = abs((d - fin).days)
                if min_diff is None or diff < min_diff:
                    min_diff, closest_term = diff, i + 1
        return closest_term

    new_df_sgmt = []
    for ud in df_ud:
        uid = ud.get("id_ud")
        row = {
            "id_ud": uid,
            "horas_ud": ud.get("duracion") or ud.get("horas_ud") or 0,
            "desc_ud": ud.get("desc_ud", ""),
            "ev": get_evaluacion(ud_first_date.get(uid)),
        }
        for m in MESES_DISPLAY:
            row[f"{m}_Prv"] = prv_tracker.get(uid, {}).get(f"{m}_Prv", 0)
            row[f"{m}_Imp"] = prv_tracker.get(uid, {}).get(f"{m}_Imp", 0)
        new_df_sgmt.append(row)

    # Una UD sin ninguna fecha asignada (el calendario se acaba antes de que
    # le toque turno en la cola) hereda el ev de la UD anterior, así que la
    # última UD del módulo cae en el mismo trimestre que la última que sí
    # llegó a impartirse, en vez de quedar sin trimestre.
    last_known_ev = 1
    for row in new_df_sgmt:
        if row["ev"] is None:
            row["ev"] = last_known_ev
        else:
            last_known_ev = row["ev"]

    if prv_tracker["FEOE"]:
        feoe_row = {"id_ud": "FEOE", "desc_ud": "Formación en Empresa u Organismo Equiparado", "ev": get_evaluacion(feo_s)}
        sum_prv = 0
        for m in MESES_DISPLAY:
            prv = prv_tracker["FEOE"].get(f"{m}_Prv", 0)
            imp = prv_tracker["FEOE"].get(f"{m}_Imp", 0)
            feoe_row[f"{m}_Prv"] = prv
            feoe_row[f"{m}_Imp"] = imp
            sum_prv += prv
        feoe_row["horas_ud"] = sum_prv or "-"

        # Insertada por orden cronológico real (no siempre al final): va
        # justo antes de la primera UD cuya última fecha impartida cae
        # después del inicio de la FEOE, que es la UD que la FEOE
        # interrumpe (se compara con la ÚLTIMA fecha, no la primera, porque
        # una UD puede empezar antes de la FEOE y terminar después).
        insert_at = len(new_df_sgmt)
        if feo_s:
            for i, row in enumerate(new_df_sgmt):
                last = ud_last_date.get(row["id_ud"])
                if not last or last > feo_s:
                    insert_at = i
                    break
        new_df_sgmt.insert(insert_at, feoe_row)

    return new_df_sgmt
