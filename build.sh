#!/usr/bin/env bash
# exit on error
set -o errexit

# Instalar dependencias de Python
pip install -r requirements.txt

# Recolectar archivos estáticos para WhiteNoise
python manage.py collectstatic --no-input
# Aplicar migraciones a la base de datos en la nube
python manage.py migrate