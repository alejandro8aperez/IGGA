#!/usr/bin/env bash
# exit on error
set -o errexit

echo "🔧 Instalando dependencias…"
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet

echo "📦 Preparando archivos estáticos…"
python manage.py collectstatic --no-input --clear

echo "🗄️  Corriendo migraciones…"
python manage.py migrate --no-input

# ─── Seed inicial del módulo Informe Diario (idempotente, no bloquea deploy) ─
# Usa get_or_create por lo que es seguro correrlo en cada deploy.
# Si falla por cualquier motivo (BD locked, timeout, etc.), el deploy continúa.
echo "🌱 Sembrando catálogos informe_diario…"
timeout 30 python manage.py seed_informe_diario || echo "⚠️ seed_informe_diario omitido (continuando deploy)"

echo "✅ Build completado"
