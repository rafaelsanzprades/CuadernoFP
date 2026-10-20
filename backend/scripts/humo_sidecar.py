"""Prueba de humo del servidor interno empaquetado (backend/dist/cuadernofp-backend.exe): arranca, /health, catalogo y los tres PD mas varios PDF con los datos de demo.
Uso: cd backend && python scripts/humo_sidecar.py   (tras regenerar el exe con pyinstaller y antes de publicar un release)."""
import json, os, re, subprocess, sys, time, urllib.request, urllib.error, shutil

BACK = r"C:\GD-rsp\APP-CuadernoFP\backend"
EXE = os.path.join(BACK, "dist", "cuadernofp-backend.exe")
DEMO = r"C:\GD-rsp\APP-CuadernoFP\frontend\public\demo"
tmp = os.path.join(os.environ["TEMP"], "smoke_cfp")
os.makedirs(tmp, exist_ok=True)
db = os.path.join(tmp, "cdd_pro.db")
shutil.copy(os.path.join(BACK, "cdd_pro.db"), db)
env = dict(os.environ, DATABASE_URL="sqlite:///" + db.replace(os.sep, "/"))
t0 = time.time()
p = subprocess.Popen([EXE], cwd=tmp, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
port = None
buf = []
while time.time() - t0 < 120:
    line = p.stdout.readline()
    if not line:
        break
    buf.append(line)
    m = re.search(r"(?:PORT|port)[=: ]+(\d{4,5})", line)
    if m:
        port = int(m.group(1)); break
print("arranque s:", round(time.time() - t0, 1), "puerto:", port)
if not port:
    print("".join(buf[-20:])); p.kill(); sys.exit(1)
base = f"http://127.0.0.1:{port}"
time.sleep(4)


def get(path):
    try:
        with urllib.request.urlopen(base + path, timeout=30) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def cargar(n):
    d = json.load(open(os.path.join(DEMO, n), encoding="utf-8"))
    return d[0] if isinstance(d, list) else d


modulo, curso = cargar("202526 P 0237-ICTVE.fpp"), cargar("202526 C 1A-GM 0237-ICTVE.fpc")
ok = True
for ruta in ["/health", "/api/families", "/api/modules"]:
    s, b = get(ruta)
    print("GET", ruta, s, len(b))
for tipo in ["programacion_minima_tpl", "programacion_suficiente_tpl", "programacion_jeg", "calendario", "grupal_final", "matrices", "cobertura_ce", "planificacion", "seguimiento"]:
    body = json.dumps({"module_data": modulo, "curso_data": curso}).encode()
    req = urllib.request.Request(f"{base}/api/pdf?type={tipo}&file_format={"docx" if "programacion" in tipo else "pdf"}", data=body, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            data = r.read()
            print("PDF", tipo, r.status, len(data), "bytes", r.headers.get("content-type", "")[:40])
    except urllib.error.HTTPError as e:
        print("PDF", tipo, e.code, e.read()[:200]); ok = False
    except Exception as e:
        print("PDF", tipo, "ERR", e); ok = False
# el chatbot y el extractor importan google.generativeai / pypdf: se comprueba que el modulo carga dentro del exe
req = urllib.request.Request(base + "/api/ai/chat", data=json.dumps({"message": "hola", "api_key": "x"}).encode(), headers={"Content-Type": "application/json"})
try:
    urllib.request.urlopen(req, timeout=60)
except urllib.error.HTTPError as e:
    print("AI chat", e.code, e.read()[:150])
except Exception as e:
    print("AI chat ERR", e)
p.terminate()
print("OK" if ok else "FALLO")
