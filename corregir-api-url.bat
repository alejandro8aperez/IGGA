@echo off
echo ==========================================
echo  CORREGIR VITE_API_URL - ERP 8AMPERIOS
echo ==========================================
echo.

set "ENV_FILE=C:\Postgres\ERP-8AMPERIOS\frontend\.env.local"

REM Verificar que el archivo existe
if not exist "%ENV_FILE%" (
    echo ERROR: No se encontro %ENV_FILE%
    echo.
    echo Creando archivo nuevo...
    (
        echo VITE_API_URL=http://localhost:8000/api
    ) > "%ENV_FILE%"
    echo [OK] Archivo creado con VITE_API_URL=http://localhost:8000/api
    goto :fin
)

echo Archivo encontrado: %ENV_FILE%
echo.

REM Crear backup
copy "%ENV_FILE%" "%ENV_FILE%.backup" >nul
echo [OK] Backup creado: %ENV_FILE%.backup

REM Leer contenido actual
type "%ENV_FILE%"
echo.

REM Reemplazar la linea con barra final por la version sin barra final
powershell -Command "(Get-Content '%ENV_FILE%') -replace 'VITE_API_URL=http://localhost:8000/api/', 'VITE_API_URL=http://localhost:8000/api' | Set-Content '%ENV_FILE%'"

echo.
echo [OK] VITE_API_URL corregido
echo.
echo Contenido actual:
type "%ENV_FILE%"
echo.

:fin
echo ==========================================
echo  AHORA REINICIA EL FRONTEND:
echo    cd frontend ^&^& npm run dev
echo ==========================================
echo.
