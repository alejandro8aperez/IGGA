#!/bin/bash
set -euo pipefail

# =============================================================================
# ERP-8AMPERIOS - Update script (pull, build, restart)
# =============================================================================
# Ejecutar como root o con sudo en la VM de Oracle Cloud
# Uso: sudo bash deploy/update.sh
# =============================================================================

log() { echo -e "\033[0;32m[✓]\033[0m $1"; }
warn() { echo -e "\033[1;33m[!]\033[0m $1"; }

cd /opt/erp/backend

log "1. Pull de cambios desde GitHub..."
git pull origin main

log "2. Instalando dependencias Python..."
source venv/bin/activate
pip install -r requirements.txt -q
deactivate

log "3. Ejecutando migraciones..."
source venv/bin/activate
export $(grep -v '^#' /opt/erp/.env | xargs)
python manage.py migrate --no-input
deactivate

log "4. Recolectando archivos estáticos..."
source venv/bin/activate
python manage.py collectstatic --no-input --clear 2>&1 | tail -1
deactivate

log "5. Construyendo frontend..."
cd frontend
npm install --silent
source /opt/erp/.env
VITE_API_URL="https://${ALLOWED_HOSTS%%,*}/api" npm run build 2>&1 | tail -3
cd /opt/erp/backend

log "6. Limpiando build anterior y copiando nuevo..."
rm -rf /opt/erp/frontend/dist
cp -r frontend/dist /opt/erp/frontend/
chown -R erp:erp /opt/erp/frontend

log "7. Reiniciando servicios..."
systemctl restart erp-gunicorn
systemctl reload nginx || systemctl restart nginx

log "8. Verificando Gunicorn..."
sleep 2
systemctl status erp-gunicorn --no-pager | head -5

log ""
log "=============================================="
log "  ✅  UPDATE COMPLETADO"
log "=============================================="
