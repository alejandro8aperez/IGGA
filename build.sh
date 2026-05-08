#!/usr/bin/env bash
# exit on error
set -o errexit

# Instalar dependencias
pip install -r requirements.txt

# Preparar archivos estáticos y base de datos
python manage.py collectstatic --no-input
python manage.py migrate

# Opcional: Cargar datos iniciales si fuera necesario
# python manage.py loaddata initial_data.json