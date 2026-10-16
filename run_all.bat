@echo off
echo ========================================================
echo  Launching Northgate AI Stock Predictor (Full Platform)
echo ========================================================
echo Starting Backend (FastAPI on http://127.0.0.1:8000)...
start "Northgate AI - Backend Server" cmd /k "%~dp0start_backend.bat"

timeout /t 3 /nobreak >nul

echo Starting Frontend (Vite React on http://localhost:5173)...
start "Northgate AI - Web Dashboard" cmd /k "%~dp0start_frontend.bat"

echo.
echo Both services launched! 
echo Frontend: http://localhost:5173
echo API Docs: http://127.0.0.1:8000/docs
echo ========================================================
