# Script para iniciar ERP localmente (Backend + Frontend)

Write-Host "🚀 Iniciando ERP 8AMPERIOS..." -ForegroundColor Cyan

# Verificar que la variable DATABASE_URL esté seteada
if (Test-Path ".env") {
    Write-Host "🔐 Cargando variables de entorno desde .env..." -ForegroundColor Magenta
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#\s][^=]*)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Content "env:$name" $value
        }
    }
}

if (-not $env:DATABASE_URL) {
    Write-Host "❌ Error: DATABASE_URL no encontrada." -ForegroundColor Red
    Write-Host "Asegúrate de tener un archivo .env configurado correctamente." -ForegroundColor Gray
    exit 1
}

# Iniciar Backend Django en background
Write-Host "📡 Iniciando Backend Django (puerto 8000)..." -ForegroundColor Yellow
$backend = Start-Process -FilePath "python" -ArgumentList "manage.py", "runserver", "8000" -PassThru -WindowStyle Normal

# Esperar que el backend inicie
Start-Sleep -Seconds 3

# Iniciar Frontend Vite
Write-Host "🎨 Iniciando Frontend Vite (puerto 5173)..." -ForegroundColor Yellow
cd frontend
try {
    npm run dev
}
finally {
    # Asegurar que el backend se detenga incluso si el frontend falla
    Write-Host "🛑 Deteniendo servicios..." -ForegroundColor Red
    Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
    Write-Host "👋 ERP detenido" -ForegroundColor Cyan
}
