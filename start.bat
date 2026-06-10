@echo off
echo ====================================================
echo   Iniciando Entorno de Desarrollo - Cuaderno FP (PM2)
echo ====================================================
echo.

echo Limpiando procesos anteriores si existen...
call npx pm2 stop all >nul 2>&1
call npx pm2 delete all >nul 2>&1

echo Levantando servicios con PM2...
call npx pm2 start ecosystem.config.js

echo.
echo ====================================================
echo ¡Servidores lanzados en segundo plano!
echo.
echo Comandos útiles:
echo - Ver logs en tiempo real: npx pm2 logs
echo - Detener servidores:      npx pm2 stop all
echo - Reiniciar servidores:    npx pm2 restart all
echo - Panel de control PM2:    npx pm2 monit
echo.
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8000/docs
echo ====================================================
echo.
pause
