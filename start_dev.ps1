# Script para iniciar ERP localmente (Backend + Frontend)
# Guardar como UTF-8 sin BOM

Write-Host "Iniciando ERP 8AMPERIOS..." -ForegroundColor Cyan

# Definir rutas absolutas del disco D para el cliente
$ERP_PATH = "D:\postgres\erp-8amperios\ERP-8AMPERIOS-1"
$VENV_PATH = "D:\postgres\erp-8amperios\venv"

Set-Location $ERP_PATH

# Cargar variables de entorno desde .env
if (Test-Path ".env") {
    Write-Host "Cargando variables de entorno desde .env..." -ForegroundColor Magenta
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#\s][^=]*)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

Write-Host "DATABASE_URL encontrada. OK" -ForegroundColor Green

# Activar virtualenv si existe
if (Test-Path "$VENV_PATH\Scripts\Activate.ps1") {
    Write-Host "Activando virtualenv..." -ForegroundColor Yellow
    & "$VENV_PATH\Scripts\Activate.ps1"
}

# Iniciar Backend Django en una ventana nueva
Write-Host "Iniciando Backend Django (puerto 8000)..." -ForegroundColor Yellow
$backend = Start-Process -FilePath "python" `
    -ArgumentList "manage.py", "runserver", "8000" `
    -PassThru -WindowStyle Normal

Write-Host "Backend PID: $($backend.Id)" -ForegroundColor Green

# Esperar que el backend inicie
Start-Sleep -Seconds 3

# Iniciar Frontend Vite en la carpeta frontend
Write-Host "Iniciando Frontend Vite (puerto 5173)..." -ForegroundColor Yellow
Set-Location frontend
if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules no encontrado. Ejecutando npm install..." -ForegroundColor Cyan
    npm install
}

try {
    npm run dev
}
finally {
    Write-Host "Deteniendo servicios..." -ForegroundColor Red
    Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
    Set-Location ..
    Write-Host "ERP detenido" -ForegroundColor Cyan
}
