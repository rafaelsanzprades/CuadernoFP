# -*- mode: python ; coding: utf-8 -*-
# Empaqueta el backend como sidecar para la app de escritorio (Tauri, Fase 2
# del plan). Build: .venv313\Scripts\pyinstaller cuadernofp-backend.spec
#
# NO incluye cdd_pro.db a propósito -- la BBDD de catálogo se empaqueta
# aparte como recurso de solo lectura de Tauri (Fase 3 del plan) y se le
# pasa al proceso vía DATABASE_URL, no viaja dentro del .exe.

import os

a = Analysis(
    ['run_sidecar.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('templates', 'templates'),
        ('documentos', 'documentos'),
    ],
    hiddenimports=[
        # uvicorn resuelve estos en tiempo de ejecución vía su propio
        # mecanismo de "auto" (loop/protocolo), PyInstaller no los ve solo
        # con el análisis estático de imports.
        'uvicorn.logging',
        'uvicorn.loops.auto',
        'uvicorn.loops.asyncio',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.http.h11_impl',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.protocols.websockets.wsproto_impl',
        'uvicorn.lifespan.on',
        'uvicorn.lifespan.off',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    # Recortes de peso (2026-10-20): ninguno de estos módulos se importa desde el código del backend.
    # pymupdf (el extractor usa pypdf), pywin32 (lo arrastra un hook de PyInstaller) y el códec AVIF de Pillow.
    excludes=['pytest', 'pytest_asyncio', 'pymupdf', 'fitz', 'pythonwin', 'win32ui', 'win32com', 'PIL._avif'],
    noarchive=False,
    optimize=0,
)
# googleapiclient trae 95 MB de documentos de descubrimiento (discovery_cache/documents) que solo usaría un cliente
# de las APIs de Google; el backend no lo usa (google-generativeai solo necesita el paquete, no esos JSON).
a.datas = [d for d in a.datas if 'discovery_cache' + os.sep + 'documents' not in d[0] and 'discovery_cache/documents' not in d[0]]

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='cuadernofp-backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
