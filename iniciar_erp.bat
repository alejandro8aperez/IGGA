@echo off
chcp 65001 >nul
title ERP 8AMPERIOS

echo.
echo  ==========================================
echo    ERP 8AMPERIOS - Inicio Local
echo  ==========================================
echo.

REM ── Buscar proyecto ───────────────────────────────────────
set "ERP="
for %%D in (
    "C:\Postgres\ERP-8AMPERIOS"
    "%USERPROFILE%\ERP-8AMPERIOS"
    "%USERPROFILE%\Documents\ERP-8AMPERIOS"
    "%USERPROFILE%\Desktop\ERP-8AMPERIOS"
    "C:\ERP-8AMPERIOS"
) do (
    if exist "%%~D\manage.py" (
        set "ERP=%%~D"
        goto :erp_encontrado
    )
)
echo [ERROR] No se encontro el proyecto. Introduce la ruta manualmente:
set /p ERP="Ruta: "
if not exist "%ERP%\manage.py" (
    echo [ERROR] No existe manage.py en esa ruta.
    pause & exit /b 1
)

:erp_encontrado
echo [OK] Proyecto : %ERP%

REM ── Buscar venv ───────────────────────────────────────────
set "VENV="
for %%V in (
    "%ERP%\venv"
    "C:\Postgres\venv"
    "%ERP%\.venv"
    "%USERPROFILE%\venv"
) do (
    if exist "%%~V\Scripts\activate.bat" (
        set "VENV=%%~V"
        goto :venv_encontrado
    )
)
echo [ERROR] No se encontro el venv.
echo         Crealo con:  python -m venv venv
pause & exit /b 1

:venv_encontrado
echo [OK] Venv     : %VENV%

REM ── Crear .env si no existe ───────────────────────────────
if not exist "%ERP%\.env" (
    echo DEBUG=True> "%ERP%\.env"
    echo USE_S3=False>> "%ERP%\.env"
    echo SECRET_KEY=django-insecure-8amp-local-dev-key>> "%ERP%\.env"
    echo [OK] .env creado
) else (
    echo [OK] .env ya existe
)

REM ── Crear frontend/.env.local si no existe ────────────────
if not exist "%ERP%\frontend\.env.local" (
    echo VITE_API_URL=http://localhost:8000/api> "%ERP%\frontend\.env.local"
    echo [OK] frontend\.env.local creado
) else (
    echo [OK] frontend\.env.local ya existe
)

echo.

REM ── Script temporal Backend ───────────────────────────────
set "BAT_BACK=%TEMP%\erp_backend.bat"
echo @echo off                                              > "%BAT_BACK%"
echo title ERP BACKEND - Django                           >> "%BAT_BACK%"
echo cd /d "%ERP%"                                        >> "%BAT_BACK%"
echo call "%VENV%\Scripts\activate.bat"                   >> "%BAT_BACK%"
echo echo.                                                >> "%BAT_BACK%"
echo echo  Backend Django corriendo en http://localhost:8000 >> "%BAT_BACK%"
echo echo  Ctrl+C para detener                            >> "%BAT_BACK%"
echo echo.                                                >> "%BAT_BACK%"
echo python manage.py runserver 0.0.0.0:8000              >> "%BAT_BACK%"
echo pause                                                >> "%BAT_BACK%"

REM ── Script temporal Frontend ──────────────────────────────
set "BAT_FRONT=%TEMP%\erp_frontend.bat"
echo @echo off                                            > "%BAT_FRONT%"
echo title ERP FRONTEND - Vite                           >> "%BAT_FRONT%"
echo cd /d "%ERP%\frontend"                              >> "%BAT_FRONT%"
echo if not exist node_modules (                         >> "%BAT_FRONT%"
echo     echo Instalando dependencias npm...             >> "%BAT_FRONT%"
echo     npm install                                     >> "%BAT_FRONT%"
echo )                                                   >> "%BAT_FRONT%"
echo echo.                                               >> "%BAT_FRONT%"
echo echo  Frontend Vite corriendo en http://localhost:5173 >> "%BAT_FRONT%"
echo echo  Ctrl+C para detener                           >> "%BAT_FRONT%"
echo echo.                                               >> "%BAT_FRONT%"
echo npm run dev                                         >> "%BAT_FRONT%"
echo pause                                               >> "%BAT_FRONT%"

REM ── Lanzar servidores ─────────────────────────────────────
echo [1/2] Iniciando Backend Django...
start "ERP BACKEND" "%BAT_BACK%"
timeout /t 6 /nobreak >nul

echo [2/2] Iniciando Frontend Vite...
start "ERP FRONTEND" "%BAT_FRONT%"
timeout /t 7 /nobreak >nul

REM ── Abrir navegador ───────────────────────────────────────
echo Abriendo navegador...
start http://localhost:5173

echo.
echo  ==========================================
echo    ERP corriendo:
echo    Frontend  →  http://localhost:5173
echo    Backend   →  http://localhost:8000
echo    Admin     →  http://localhost:8000/admin
echo  ==========================================
echo.
echo  Cierra las ventanas CMD para detener el ERP.
echo.
pause
