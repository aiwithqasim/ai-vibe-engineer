@echo off
cd /d "%~dp0.."
docker compose up --build -d
if errorlevel 1 (
  echo.
  echo Docker Compose failed. Start Docker Desktop and wait until it shows "Engine running",
  echo then run this script again.
  exit /b 1
)
echo Kanban Studio is running at http://localhost:8000
