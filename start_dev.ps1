# Script para iniciar ERP localmente (Backend + Frontend)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   INICIANDO ERP 8AMPERIOS (PS)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# ==========================================
# RUTAS
# ==========================================
$BASE = "D:\postgres\erp-8amperios"
$ERP = "$BASE\erp-8amperios-1"
$VENV = "$BASE\venv"

# ==========================================
# VALIDAR
# ==========================================
if (-not (Test-Path "$ERP\manage.py")) {
    Write-Host "ERROR: No existe manage.py en $ERP" -ForegroundColor Red
    Pause
    exit
}

if (-not (Test-Path "$VENV\Scripts\activate.bat")) {
    Write-Host "ERROR: No existe el VENV en $VENV" -ForegroundColor Red
    Pause
    exit
}

# ==========================================
# BACKEND
# ==========================================
Write-Host "[1/2] Iniciando Backend..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k", "title ERP BACKEND && cd /d `"$ERP`" && `"$VENV\Scripts\activate.bat`" && python manage.py runserver 8000"

Start-Sleep -Seconds 6

# ==========================================
# FRONTEND
# ==========================================
Write-Host "[2/2] Iniciando Frontend..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k", "title ERP FRONTEND && cd /d `"$ERP\frontend`" && npm run dev"

Start-Sleep -Seconds 6

# Abrir el navegador
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "ERP iniciado correctamente." -ForegroundColor Green
Write-Host ""
Pause
