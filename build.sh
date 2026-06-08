#!/bin/bash
set -e

echo "🔧 Instalando dependencias…"
poetry install --no-interaction --no-ansi

echo "📦 Preparando archivos estáticos…"
python manage.py collectstatic --no-input

echo "🗄️  Verificando migraciones..."
# Fake migration defensiva para usuarios
python manage.py migrate --fake-initial usuarios || true

echo "🔄 Aplicando migraciones..."
python manage.py migrate --no-input

echo "✅ Build completado"
