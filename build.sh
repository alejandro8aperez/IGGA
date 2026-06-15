#!/bin/bash
set -e

echo "🔧 Instalando dependencias…"
pip install -r requirements.txt

echo "📦 Preparando archivos estáticos…"
python manage.py collectstatic --no-input

echo "🗄️  Verificando migraciones..."
# Fake usuarios explícitamente (las tablas ya existen en Render)
python manage.py migrate usuarios --fake || true

echo "🔄 Aplicando migraciones..."
python manage.py migrate --no-input

echo "✅ Build completado"
