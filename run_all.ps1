# Northgate AI Stock Predictor - PowerShell Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Launching Northgate AI Stock Predictor (Full Platform)" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start Backend
Write-Host "Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '$scriptDir\venv\Scripts\python.exe' -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload" -WorkingDirectory "$scriptDir\backend"

Start-Sleep -Seconds 3

# 2. Start Frontend
Write-Host "Starting Vite React Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WorkingDirectory "$scriptDir\frontend"

Write-Host "`nAll services active!" -ForegroundColor Cyan
Write-Host "Frontend Dashboard: http://localhost:5173" -ForegroundColor White
Write-Host "Swagger OpenAPI Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
