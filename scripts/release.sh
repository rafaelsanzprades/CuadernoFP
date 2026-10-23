#!/usr/bin/env bash
# Release de Cuaderno FP para Windows: regenera el servidor interno, compila el instalador, lo prueba por dentro
# y, solo con --publicar, lo sube a GitHub (latest.json firmado), borra las versiones anteriores y actualiza rafaelsanzprades.es.
#
# Uso (desde Git Bash, en la raíz del repositorio):
#   scripts/release.sh                      compila y prueba, no publica nada
#   scripts/release.sh --publicar --notas "Qué cambia, en una o dos frases"
#   scripts/release.sh --n 2 ...            tercera versión del mismo día (0 = primera, 1 = «b», 2 = «c»…)
#
# Versión: la fecha de hoy. `version` de tauri.conf.json es semver y el actualizador compara números, así que las
# letras no valen: parche = día*100 + n (26.10.2203 -> «2026.10.22d»). No subir el día para publicar otra vez.
# Requiere: clave de firma en C:\Users\<tú>\.tauri\cuadernofp.key (sin contraseña), gh con sesión, firebase-tools.
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
WEB="${RSP_ES:-/c/GD-rsp/APP-www_rsp_es}"
CLAVE="${TAURI_KEY_FILE:-/c/Users/$USERNAME/.tauri/cuadernofp.key}"
PUBLICAR=0; NOTAS=""; N=""
while [ $# -gt 0 ]; do
  case "$1" in
    --publicar) PUBLICAR=1 ;;
    --notas) NOTAS="$2"; shift ;;
    --n) N="$2"; shift ;;
    *) echo "Opción desconocida: $1"; exit 2 ;;
  esac; shift
done
[ "$PUBLICAR" = 1 ] && [ -z "$NOTAS" ] && { echo "Con --publicar hace falta --notas \"…\""; exit 2; }
[ -f "$CLAVE" ] || { echo "No encuentro la clave de firma: $CLAVE"; exit 2; }
cd "$RAIZ"
[ -z "$(git status --porcelain | grep -v '^??' || true)" ] || { echo "Hay cambios sin confirmar en el repositorio: confírmalos antes de compilar."; git status --short | head; exit 2; }

# ── versión ────────────────────────────────────────────────────────────────
AA=$(date +%y); MM=$(date +%-m); DD=$(date +%-d)
if [ -z "$N" ]; then
  # si ya hay una versión de hoy, la siguiente letra (la última publicada manda: las anteriores se borran)
  N=0
  ULTIMA=$(gh release list -L 1 --json tagName -q '.[0].tagName' 2>/dev/null || true)
  if [[ "$ULTIMA" =~ ^v20$AA\.$MM\.$DD([a-z]?)$ ]]; then
    L="${BASH_REMATCH[1]}"
    if [ -z "$L" ]; then N=1; else N=$(( $(printf '%d' "'$L") - 97 + 1 )); fi
  fi
fi
if [ "$N" -gt 0 ]; then PARCHE=$((DD*100+N)); LETRA=$(printf "\\x$(printf %x $((97+N)))"); else PARCHE=$DD; LETRA=""; fi
VERSION="$AA.$MM.$PARCHE"; ETIQUETA="2026.$MM.$DD$LETRA"
echo "== Versión del instalador: $VERSION  (se muestra como $ETIQUETA)"

# ── 1. procesos que bloquean la compilación (cdd_pro.db) ─────────────────────
powershell -NoProfile -Command "Get-Process app,cuadernofp-backend -EA SilentlyContinue | Stop-Process -Force; Get-CimInstance Win32_Process | ? { \$_.Name -match 'python|node|uvicorn' -and \$_.CommandLine -match 'multiprocessing|uvicorn|next' } | % { Stop-Process -Id \$_.ProcessId -Force -EA SilentlyContinue }" || true

# ── 2. versión en tauri.conf.json ────────────────────────────────────────────
sed -i -E "0,/\"version\": \"[^\"]+\"/s//\"version\": \"$VERSION\"/" src-tauri/tauri.conf.json

# ── 3. servidor interno: no lo regenera tauri build ──────────────────────────
echo "== Servidor interno (PyInstaller)"
( cd backend && .venv313/Scripts/pyinstaller.exe cuadernofp-backend.spec --noconfirm >/dev/null 2>&1 \
  && cp dist/cuadernofp-backend.exe ../src-tauri/binaries/cuadernofp-backend-x86_64-pc-windows-msvc.exe \
  && .venv313/Scripts/python.exe scripts/humo_sidecar.py | tail -1 | grep -q '^OK' ) || { echo "FALLÓ el servidor interno o su prueba de humo"; exit 1; }

# ── 4. instalador ───────────────────────────────────────────────────────────
echo "== Instalador (NSIS)"
export TAURI_SIGNING_PRIVATE_KEY="$(cat "$CLAVE")"
npx --prefix frontend @tauri-apps/cli build --bundles nsis >"${TEMP:-/tmp}/tauri-build.log" 2>&1 || { tail -20 "${TEMP:-/tmp}/tauri-build.log"; echo "FALLÓ la compilación"; exit 1; }
EXE="src-tauri/target/release/bundle/nsis/Cuaderno FP_${VERSION}_x64-setup.exe"
[ -f "$EXE" ] && [ -f "$EXE.sig" ] || { echo "No se generó el instalador $EXE"; exit 1; }
echo "   $(du -m "$EXE" | cut -f1) MB"

# ── 5. prueba de la app compilada, por dentro ───────────────────────────────
echo "== Prueba de escritorio"
powershell -NoProfile -Command "\$env:WEBVIEW2_USER_DATA_FOLDER=(Join-Path \$env:TEMP 'cfp-wv2-prueba'); Remove-Item -Recurse -Force \$env:WEBVIEW2_USER_DATA_FOLDER -EA SilentlyContinue; \$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS='--remote-debugging-port=9222'; Start-Process '$(cygpath -w "$RAIZ")\\src-tauri\\target\\release\\app.exe'"
sleep 15
RES=$(node frontend/scripts/prueba-escritorio.mjs 2>&1 | tee "${TEMP:-/tmp}/prueba-escritorio.log" | grep -E "FALLO|RESUMEN" || true)
powershell -NoProfile -Command "Get-Process app,cuadernofp-backend -EA SilentlyContinue | Stop-Process -Force; Remove-Item -Recurse -Force (Join-Path \$env:TEMP 'cfp-wv2-prueba') -EA SilentlyContinue" || true
echo "$RES"
echo "$RES" | grep -q "FALLO" && { echo "La prueba de escritorio falló: no se publica."; exit 1; }

if [ "$PUBLICAR" = 0 ]; then
  echo "== Listo, sin publicar. Instalador: $EXE"
  git checkout -- src-tauri/tauri.conf.json 2>/dev/null || true   # no dejar la versión cambiada si no se publica
  exit 0
fi

# ── 6. GitHub ───────────────────────────────────────────────────────────────
echo "== Publicando en GitHub"
SAL="${TEMP:-/tmp}/release-$ETIQUETA"; rm -rf "$SAL"; mkdir -p "$SAL"
ASSET="Cuaderno.FP_${VERSION}_x64-setup.exe"
cp "$EXE" "$SAL/$ASSET"
python - "$SAL" "$VERSION" "$ETIQUETA" "$NOTAS" "$EXE.sig" "$ASSET" <<'PY'
import json, sys, datetime
sal, version, etiqueta, notas, sigf, asset = sys.argv[1:7]
sig = open(sigf, encoding="utf-8").read().strip()
json.dump({"version": version, "notes": notas, "pub_date": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
           "platforms": {"windows-x86_64": {"signature": sig, "url": f"https://github.com/rafaelsanzprades/CuadernoFP/releases/download/v{etiqueta}/{asset}"}}},
          open(sal + "/latest.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
PY
anteriores=$(gh release list -L 50 --json tagName -q '.[].tagName')
gh release create "v$ETIQUETA" --title "Cuaderno FP $ETIQUETA" --latest --notes "$NOTAS" "$SAL/$ASSET" "$SAL/latest.json" >/dev/null
LOCAL=$(sha256sum < "$SAL/$ASSET" | cut -d" " -f1)
REMOTO=$(gh release view "v$ETIQUETA" --json assets -q '.assets[] | select(.name=="'"$ASSET"'") | .digest' | sed 's/sha256://')
[ "$LOCAL" = "$REMOTO" ] || { echo "El hash subido NO coincide ($LOCAL / $REMOTO)"; exit 1; }
curl -sL https://github.com/rafaelsanzprades/CuadernoFP/releases/latest/download/latest.json | grep -q "\"version\": \"$VERSION\"" || { echo "latest.json público no apunta a $VERSION"; exit 1; }
for t in $anteriores; do [ "$t" != "v$ETIQUETA" ] && gh release delete "$t" --yes --cleanup-tag >/dev/null; done
echo "   publicada v$ETIQUETA, hash verificado; versiones anteriores borradas"

# ── 7. código y web ─────────────────────────────────────────────────────────
git add src-tauri/tauri.conf.json
git commit -q -m "chore: version $VERSION ($ETIQUETA)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
git push -q
if [ -d "$WEB" ]; then
  echo "== Web (rafaelsanzprades.es)"
  ( cd "$WEB" && PYTHONIOENCODING=utf-8 python herramientas/generar-indice.py | tail -1 && node herramientas/compilar-pdf.mjs | tail -1 \
    && cp compilados/Manual-Cuaderno-FP.pdf www/doc/Manual-Cuaderno-FP.pdf \
    && git add www && { git commit -q -m "web: version $ETIQUETA de Cuaderno FP en las paginas

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>" || true; } \
    && npx firebase-tools deploy --only hosting 2>&1 | grep -i "deploy complete" )
  curl -s https://www.rafaelsanzprades.es/manual-cuaderno-fp/12-3-analisis-app-pdx.html | grep -q "versión $ETIQUETA" && echo "   la web muestra la versión $ETIQUETA" || echo "   AVISO: la web no muestra todavía la versión $ETIQUETA"
fi
echo "== Hecho: $ETIQUETA"
