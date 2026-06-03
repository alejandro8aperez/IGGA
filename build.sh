#!/usr/bin/env bash
# exit on error
set -o errexit

echo "🔧 Instalando dependencias…"
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet

echo "📦 Preparando archivos estáticos…"
python manage.py collectstatic --no-input --clear

echo "✅ Build completado"
