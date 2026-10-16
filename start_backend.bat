@echo off
echo ========================================================
echo  Starting Northgate AI Stock Predictor - Backend Service
echo ========================================================
cd /d "%~dp0backend"
..\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
