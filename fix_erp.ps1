# ============================================================
# fix_erp.ps1 — ERP-8AMPERIOS Frontend Bug Fixes
# Ejecutar desde la raiz del repo: C:\Postgres\ERP-8AMPERIOS
# ============================================================

$srcPath = "frontend\src"
$fixed = 0

function Fix-File {
    param($relativePath)
    $fullPath = Join-Path (Get-Location) $relativePath
    if (-not (Test-Path $fullPath)) {
        Write-Host "  OMITIDO (no existe): $relativePath" -ForegroundColor Yellow
        return
    }
    $content = Get-Content $fullPath -Raw -Encoding UTF8
    $original = $content
    $content = $content -replace "\(import\.meta\.env\.VITE_API_URL \|\| 'http://localhost:8000/api'\)", "BASE_URL"
    $content = $content -replace '\$\{import\.meta\.env\.VITE_API_URL \|\| ' + "'http://localhost:8000/api'" + '\}', '${BASE_URL}'
    $content = $content -replace "const API_BASE = import\.meta\.env\.VITE_API_URL \|\| 'http://localhost:8000/api';", "const API_BASE = BASE_URL;"
    if ($content -match "BASE_URL" -and $content -match "axiosConfig" -and $content -notmatch "\{ BASE_URL \}") {
        $content = $content -replace "import axiosInstance from '(\.\.\/config/axiosConfig)';", "import axiosInstance, { BASE_URL } from '`$1';"
        $content = $content -replace "import axiosInstance from '(\.\./\.\.\/config/axiosConfig)';", "import axiosInstance, { BASE_URL } from '`$1';"
    }
    if ($content -ne $original) {
        Set-Content $fullPath $content -Encoding UTF8 -NoNewline
        Write-Host "  FIXED: $relativePath" -ForegroundColor Green
        $script:fixed++
    } else {
        Write-Host "  SIN CAMBIOS: $relativePath" -ForegroundColor Gray
    }
}

function Fix-Inventario {
    $fullPath = Join-Path (Get-Location) "$srcPath\pages\Inventario.jsx"
    if (-not (Test-Path $fullPath)) { return }
    $content = Get-Content $fullPath -Raw -Encoding UTF8
    $original = $content
    $content = $content -replace "await axios\(\{ method, url, data: catForm \}\);", "await axiosInstance({ method, url, data: catForm });"
    $content = $content -replace "await axios\(\{", "await axiosInstance({"
    if ($content -ne $original) {
        Set-Content $fullPath $content -Encoding UTF8 -NoNewline
        Write-Host "  FIXED: Inventario.jsx" -ForegroundColor Green
        $script:fixed++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ERP-8AMPERIOS - Aplicando Bug Fixes" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[ Bug #1 - CRASH: axios bare en Inventario.jsx ]" -ForegroundColor Red
Fix-Inventario
Write-Host ""
Write-Host "[ Bug #2 - localhost hardcodeado en 22 modulos ]" -ForegroundColor Yellow

$files = @(
    "$srcPath\pages\Logistica.jsx",
    "$srcPath\pages\FormatosISO9001.jsx",
    "$srcPath\pages\Marketing.jsx",
    "$srcPath\pages\Contabilidad.jsx",
    "$srcPath\pages\Reportes.jsx",
    "$srcPath\pages\ReportesAvanzados.jsx",
    "$srcPath\pages\Planeacion.jsx",
    "$srcPath\pages\Equipos.jsx",
    "$srcPath\pages\Facturacion.jsx",
    "$srcPath\pages\KAVE.jsx",
    "$srcPath\pages\MultiEmpresa.jsx",
    "$srcPath\pages\Proyectos.jsx",
    "$srcPath\pages\Compras.jsx",
    "$srcPath\pages\MRP.jsx",
    "$srcPath\pages\Activos.jsx",
    "$srcPath\pages\ProyectosPS.jsx",
    "$srcPath\pages\Calidad.jsx",
    "$srcPath\pages\Tesoreria.jsx",
    "$srcPath\pages\Finanzas.jsx",
    "$srcPath\pages\Contratos.jsx",
    "$srcPath\components\FormDesigner.jsx",
    "$srcPath\components\FormDesigner_Moderno.jsx"
)

foreach ($f in $files) { Fix-File $f }

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Resultado: $fixed archivos corregidos" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ahora ejecuta:" -ForegroundColor White
Write-Host "  git add -A" -ForegroundColor Yellow
Write-Host "  git commit -m 'fix(frontend): reemplazar axios bare y localhost hardcodeado'" -ForegroundColor Yellow
Write-Host "  git push origin main" -ForegroundColor Yellow
