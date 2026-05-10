#!/usr/bin/env bash
# exit on error
set -o errexit

# Instalar dependencias
pip install -r requirements.txt

# Preparar archivos estáticos y base de datos
python manage.py collectstatic --no-input
python manage.py migrate

# ─── Seed inicial del módulo Informe Diario (idempotente) ────────────────
# Crea/actualiza los catálogos (Obras, Recursos, Cat. Actividades) si no existen.
# Es seguro correrlo en cada deploy porque usa get_or_create.
python manage.py seed_informe_diario || echo "⚠️ seed_informe_diario omitido"

# Opcional: Cargar datos iniciales si fuera necesario
# python manage.py loaddata initial_data.json
