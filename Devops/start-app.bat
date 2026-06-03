@echo off
echo Starting BlueLearnerHub Infrastructure...
cd /d "%~dp0"
docker compose up -d
echo.
echo services started in detached mode.
echo Checking status...
docker ps
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5000
echo.
pause
