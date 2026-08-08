@echo off
echo Desplegando el backend de CuadernoFP a Google Cloud Run...

REM Configura la ruta absoluta de gcloud para evitar problemas con el PATH en Windows
set GCLOUD_CMD="C:\Users\rafae\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"

if not exist %GCLOUD_CMD% (
    echo [ERROR] No se encuentra la herramienta 'gcloud' en la ruta esperada. 
    echo Asegurate de tener Google Cloud SDK instalado.
    pause
    exit /b 1
)

echo.
echo Paso 1: Construyendo imagen en Artifact Registry...
%GCLOUD_CMD% builds submit --tag europe-west1-docker.pkg.dev/cuadernofp/cloud-run-source-deploy/cdd-backend:latest .

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] La compilacion ha fallado. Comprueba los mensajes de error.
    pause
    exit /b %errorlevel%
)

echo.
echo Paso 2: Desplegando la imagen construida en Cloud Run...
%GCLOUD_CMD% run deploy cdd-backend ^
  --image europe-west1-docker.pkg.dev/cuadernofp/cloud-run-source-deploy/cdd-backend:latest ^
  --project cuadernofp ^
  --region europe-west1 ^
  --allow-unauthenticated

echo.
echo [EXITO] El backend se ha desplegado correctamente.
pause
