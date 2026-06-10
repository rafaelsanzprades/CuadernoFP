@echo off
echo ====================================================
echo   Deteniendo Servicios de Cuaderno FP (PM2)
echo ====================================================
echo.

echo Deteniendo y eliminando todos los procesos...
call npx pm2 stop all
call npx pm2 delete all

echo.
echo ¡Todos los servicios han sido detenidos exitosamente!
echo.
pause
