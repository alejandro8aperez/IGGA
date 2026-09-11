#!/bin/bash
set -e

echo "🔧 Instalando dependencias…"
pip install -r requirements.txt

echo "📦 Preparando archivos estáticos…"
python manage.py collectstatic --no-input

echo "🗄️  Verificando migraciones..."
# Solo "fake" usuarios si la base ya tiene tablas (base existente).
# En una base nueva el migrate limpio crea todo en orden (incluye contenttypes).
HAS_DB=$(
  python - <<'PY'
from django.db import connection
try:
    with connection.cursor() as c:
        c.execute("SELECT to_regclass('public.django_migrations')")
        print('yes' if c.fetchone()[0] else 'no')
except Exception:
    print('no')
PY
)
if [ "$HAS_DB" = "yes" ]; then
    echo "Base existente detectada: aplicando fake a usuarios..."
    python manage.py migrate usuarios --fake || true
fi

echo "🔄 Aplicando migraciones..."
python manage.py migrate --no-input

echo "✅ Build completado"
