@echo off
echo ==========================================
echo  REPARAR MIGRACION CONTABILIDAD 0005
echo ==========================================
echo.

set "MIGRATION_FILE=C:\Postgres\ERP-8AMPERIOS\contabilidad\migrations\0005_centrocosto_controlauditoria_retencion_and_more.py"

REM Verificar que el archivo existe
if not exist "%MIGRATION_FILE%" (
    echo ERROR: No se encontro el archivo de migracion.
    echo %MIGRATION_FILE%
    echo.
    echo Buscando archivo alternativo...
    for %%f in ("C:\Postgres\ERP-8AMPERIOS\contabilidad\migrations\0005_*.py") do (
        echo Encontrado: %%f
        set "MIGRATION_FILE=%%f"
    )
    if not exist "%MIGRATION_FILE%" (
        echo ERROR: No se encontro ninguna migracion 0005.
        pause
        exit /b 1
    )
)

echo Archivo: %MIGRATION_FILE%
echo.

REM Crear backup
copy "%MIGRATION_FILE%" "%MIGRATION_FILE%.backup" >nul
echo [OK] Backup creado: %MIGRATION_FILE%.backup

REM Reemplazar el default incorrecto usando PowerShell
powershell -Command "(Get-Content '%MIGRATION_FILE%') -replace \"default='ASIENTO-00001'\", \"null=True, blank=True\" | Set-Content '%MIGRATION_FILE%'"

echo.
echo [OK] Migracion reparada.
echo.
echo ==========================================
echo  EJECUTAR MIGRACION
echo ==========================================
echo.

cd /d "C:\Postgres\ERP-8AMPERIOS"
python manage.py migrate

echo.
echo ==========================================
echo  PROCESO COMPLETADO
echo ==========================================
echo.
echo Si la migracion fue exitosa, ahora puedes iniciar el servidor:
echo   python manage.py runserver
echo.
