# Script para iniciar ERP localmente (Backend + Frontend)

Write-Host "🚀 Iniciando ERP 8AMPERIOS..." -ForegroundColor Cyan

# Verificar que la variable DATABASE_URL esté seteada
if (-not $env:DATABASE_URL) {
    $env:DATABASE_URL = "postgresql://postgres:Rosacruz%233@localhost:5432/erp_manufactura"
    Write-Host "✅ DATABASE_URL configurada" -ForegroundColor Green
}

# Iniciar Backend Django en background
Write-Host "📡 Iniciando Backend Django (puerto 8000)..." -ForegroundColor Yellow
$backend = Start-Process -FilePath "python" -ArgumentList "manage.py", "runserver", "8000" -PassThru -WindowStyle Normal

# Esperar que el backend inicie
Start-Sleep -Seconds 3

# Iniciar Frontend Vite
Write-Host "🎨 Iniciando Frontend Vite (puerto 5173)..." -ForegroundColor Yellow
cd frontend
npm run dev

# Cuando se cierre el frontend, matar el backend también
Stop-Process -Id $backend.Id -Force 2>$null
Write-Host "👋 ERP detenido" -ForegroundColor Cyan
