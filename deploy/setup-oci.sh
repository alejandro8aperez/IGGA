#!/bin/bash
set -euo pipefail

# =============================================================================
# ERP-8AMPERIOS - Oracle Cloud Infrastructure Setup Script
# =============================================================================
# Ejecutar en una VM de Oracle Cloud (Ubuntu 24.04 ARM o AMD)
# Uso: sudo bash setup-oci.sh
# =============================================================================

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# --- Detectar arquitectura ---
ARCH=$(uname -m)
log "Arquitectura detectada: $ARCH"
if [ "$ARCH" = "aarch64" ]; then
    log "Modo ARM detectado — instalando Node.js para ARM64"
else
    log "Modo AMD/x86_64 detectado"
fi

# --- 1. Variables del usuario ---
echo ""
echo "============================================="
echo " CONFIGURACIÓN DEL ERP-8AMPERIOS EN OCI"
echo "============================================="
echo ""

read -rp "GitHub repo URL [https://github.com/alejandro8ap/ERP-8AMPERIOS.git]: " REPO_URL
REPO_URL=${REPO_URL:-https://github.com/alejandro8ap/ERP-8AMPERIOS.git}

read -rp "GitHub branch [main]: " GIT_BRANCH
GIT_BRANCH=${GIT_BRANCH:-main}

read -rp "Dominio del sitio (ej: erp.midominio.com) o IP pública: " DOMAIN
[ -z "$DOMAIN" ] && err "Dominio/IP requerido"

read -rp "Contraseña para PostgreSQL (se generará automáticamente si se deja vacío): " DB_PASSWORD
if [ -z "$DB_PASSWORD" ]; then
    DB_PASSWORD=$(openssl rand -base64 24)
    log "Contraseña generada: $DB_PASSWORD"
fi

read -rp "SECRET_KEY de Django (se generará si se deja vacío): " DJANGO_SECRET_KEY
if [ -z "$DJANGO_SECRET_KEY" ]; then
    DJANGO_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))" 2>/dev/null || openssl rand -base64 50)
    log "SECRET_KEY generada"
fi

CLOUDINARY_CLOUD_NAME="${CLOUDINARY_CLOUD_NAME:-}"
CLOUDINARY_API_KEY="${CLOUDINARY_API_KEY:-}"
CLOUDINARY_API_SECRET="${CLOUDINARY_API_SECRET:-}"

if [ -z "$CLOUDINARY_CLOUD_NAME" ]; then
    read -rp "CLOUDINARY_CLOUD_NAME (dejar vacío si no aplica): " CLOUDINARY_CLOUD_NAME
fi
if [ -z "$CLOUDINARY_API_KEY" ]; then
    read -rp "CLOUDINARY_API_KEY: " CLOUDINARY_API_KEY
fi
if [ -z "$CLOUDINARY_API_SECRET" ]; then
    read -rp "CLOUDINARY_API_SECRET: " CLOUDINARY_API_SECRET
fi

# --- 2. Actualizar sistema e instalar dependencias ---
echo ""
log "Actualizando paquetes del sistema..."
apt-get update -qq && apt-get upgrade -y -qq
log "Instalando dependencias del sistema..."
apt-get install -y -qq \
    python3 python3-pip python3-venv python3-dev \
    postgresql postgresql-contrib libpq-dev \
    nginx certbot python3-certbot-nginx \
    git curl wget openssl

# Node.js (para build del frontend)
if ! command -v node &>/dev/null; then
    log "Instalando Node.js 20..."
    if [ "$ARCH" = "aarch64" ]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    else
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    fi
    apt-get install -y -qq nodejs
fi
log "Node.js $(node -v) instalado"
log "npm $(npm -v) instalado"

# --- 3. Configurar PostgreSQL ---
log "Configurando PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Crear usuario y base de datos
su - postgres -c "psql -tc \"SELECT 1 FROM pg_roles WHERE rolname='erp_user'\" | grep -q 1 || psql -c \"CREATE USER erp_user WITH PASSWORD '${DB_PASSWORD}';\""
su - postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname='erp_db'\" | grep -q 1 || psql -c \"CREATE DATABASE erp_db OWNER erp_user;\""
su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE erp_db TO erp_user;\""

# Permitir conexiones locales con password
PG_HBA=$(su - postgres -c "psql -t -c 'SHOW hba_file;'" 2>/dev/null | tr -d ' ')
if [ -f "$PG_HBA" ]; then
    if grep -q "^local.*all.*all.*peer" "$PG_HBA"; then
        sed -i 's/^local.*all.*all.*peer/local   all             all                                     md5/' "$PG_HBA"
    fi
    systemctl restart postgresql
fi

log "PostgreSQL configurado — DB: erp_db, User: erp_user"

# --- 4. Crear directorios y clonar repositorio ---
log "Clonando repositorio..."
mkdir -p /opt/erp /var/log/erp
git clone --branch "$GIT_BRANCH" "$REPO_URL" /opt/erp/backend-temp

# Crear usuario erp si no existe
id -u erp &>/dev/null || useradd -r -s /bin/false -d /opt/erp erp

# Mover backend al directorio final
mkdir -p /opt/erp/backend /opt/erp/frontend
rsync -a /opt/erp/backend-temp/ /opt/erp/backend/
rm -rf /opt/erp/backend-temp

# --- 5. Configurar entorno virtual Python ---
log "Configurando entorno virtual Python..."
python3 -m venv /opt/erp/backend/venv
source /opt/erp/backend/venv/bin/activate
pip install --upgrade pip -q
pip install -r /opt/erp/backend/requirements.txt -q
pip install gunicorn psycopg2-binary -q
deactivate

# --- 6. Crear archivo .env ---
log "Creando archivo de entorno..."
cat > /opt/erp/.env << EOF
SECRET_KEY=${DJANGO_SECRET_KEY}
DEBUG=False
ALLOWED_HOSTS=${DOMAIN},localhost,127.0.0.1
DATABASE_URL=postgresql://erp_user:${DB_PASSWORD}@localhost:5432/erp_db
USE_CLOUDINARY=True
CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
EOF
chmod 600 /opt/erp/.env

# --- 7. Configurar la aplicación Django ---
log "Configurando Django..."
source /opt/erp/backend/venv/bin/activate
export $(grep -v '^#' /opt/erp/.env | xargs)

cd /opt/erp/backend
log "  Corriendo collectstatic..."
python manage.py collectstatic --no-input --clear 2>&1 | tail -1
log "  Aplicando migraciones..."
python manage.py migrate --no-input 2>&1 | tail -1
deactivate

# --- 8. Construir frontend ---
log "Construyendo frontend React..."
cd /opt/erp/backend/frontend
npm install --silent 2>&1 | tail -1
VITE_API_URL="https://${DOMAIN}/api" npm run build 2>&1 | tail -5

mkdir -p /opt/erp/frontend
mv dist /opt/erp/frontend/
log "Frontend construido en /opt/erp/frontend/dist"

# --- 9. Configurar systemd para Gunicorn ---
log "Configurando servicio Gunicorn..."
cp /opt/erp/backend/deploy/gunicorn.service /etc/systemd/system/erp-gunicorn.service
sed -i "s|EnvironmentFile=/opt/erp/.env|EnvironmentFile=/opt/erp/.env|" /etc/systemd/system/erp-gunicorn.service
systemctl daemon-reload
systemctl enable erp-gunicorn
systemctl start erp-gunicorn
sleep 2
systemctl status erp-gunicorn --no-pager | head -5
log "Gunicorn iniciado"

# --- 10. Configurar Nginx ---
log "Configurando Nginx..."
mkdir -p /var/www/erp
cp /opt/erp/backend/deploy/nginx.conf /etc/nginx/sites-available/erp
sed -i "s/<TU_DOMINIO_O_IP>/${DOMAIN}/g" /etc/nginx/sites-available/erp
sed -i "s/<TU_DOMINIO>/${DOMAIN}/g" /etc/nginx/sites-available/erp
ln -sf /etc/nginx/sites-available/erp /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t || err "Error en configuración de Nginx"
systemctl enable nginx
systemctl restart nginx
log "Nginx configurado"

# --- 11. SSL con Let's Encrypt ---
if [[ "$DOMAIN" != *"."* ]]; then
    warn "No parece un dominio válido (es una IP). SSL no se configurará automáticamente."
    warn "Usa: https://${DOMAIN} — acepta riesgo de seguridad en el navegador"
else
    log "Obteniendo certificado SSL para ${DOMAIN}..."
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect || \
    warn "certbot falló. Configura SSL manualmente después."
fi

# --- 12. Permisos ---
chown -R erp:erp /opt/erp /var/log/erp
chmod 755 /opt/erp

# --- 13. Firewall OCI (seguridad list) ---
# NOTA: En OCI, el firewall se configura en las Security Lists del VCN.
# Asegúrate de tener reglas para: puerto 22 (SSH), 80 (HTTP), 443 (HTTPS)
log ""
log "=============================================="
log "  IMPORTANTE — Configura Security Lists en OCI"
log "=============================================="
log "En tu VCN, agrega Ingress Rules para:"
log "  - SSH:   Port 22  (Source: 0.0.0.0/0)"
log "  - HTTP:  Port 80  (Source: 0.0.0.0/0)"
log "  - HTTPS: Port 443 (Source: 0.0.0.0/0)"
echo ""

# --- 14. Resumen ---
echo ""
echo "=============================================="
echo "  🎉  DEPLOY COMPLETADO"
echo "=============================================="
echo ""
echo "  Frontend/Backend: https://${DOMAIN}"
echo "  Admin:            https://${DOMAIN}/admin/"
echo "  API:              https://${DOMAIN}/api/"
echo "  DB User:          erp_user"
echo "  DB Password:      ${DB_PASSWORD}"
echo ""
echo "  PostgreSQL:"
echo "    DATABASE_URL=postgresql://erp_user:${DB_PASSWORD}@localhost:5432/erp_db"
echo ""
echo "  Comandos útiles:"
echo "    sudo systemctl status erp-gunicorn"
echo "    sudo journalctl -u erp-gunicorn -f"
echo "    sudo systemctl restart erp-gunicorn"
echo "    sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "  Actualización: cd /opt/erp/backend && sudo -u erp bash deploy/update.sh"
echo "=============================================="
