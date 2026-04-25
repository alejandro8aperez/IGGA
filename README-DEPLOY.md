# 🚀 Guía de Despliegue en Render - ERP-8AMPERIOS

Esta guía te llevará paso a paso para desplegar tu ERP en [Render](https://render.com), una plataforma de hosting en la nube con generoso plan gratuito.

---

## 📋 Requisitos Previos

1. **Cuenta en Render**: Regístrate gratis en [render.com](https://render.com)
2. **Cuenta en GitHub/GitLab**: Tu código debe estar en un repositorio Git
3. **PostgreSQL**: Render proporciona bases de datos PostgreSQL gratuitas

---

## 🧪 Configuración local igual a la nube

Para que tu entorno local sea equivalente al deploy en la nube, utiliza las mismas variables de entorno y el mismo esquema de configuración:

1. Copia `./.env.example` a `./.env` y completa tus valores locales.
2. Copia `frontend/.env.local.example` a `frontend/.env.local`.
3. En local, `VITE_API_URL` debe apuntar a `http://localhost:8000/api`.
4. En la nube, Render usará `VITE_API_URL=https://<tu-backend>.onrender.com/api`.
5. En ambos entornos puedes controlar CORS con las mismas variables:

```bash
CORS_ALLOW_ALL_ORIGINS=True
# o para más seguridad:
# CORS_ALLOW_ALL_ORIGINS=False
# CORS_ALLOWED_ORIGINS=https://tu-frontend.onrender.com,http://localhost:5173
```

Esto asegura que la aplicación local y la de Render compartan el mismo comportamiento de configuración.

---

## 🏗️ Arquitectura de Despliegue

```
┌─────────────────────────────────────────────────────────────┐
│                     RENDER CLOUD                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐    ┌─────────────────────────────┐  │
│  │   Static Site       │    │     Web Service             │  │
│  │   (Frontend)        │◄──►│     (Django Backend)        │  │
│  │   React + Vite      │    │     API REST                │  │
│  │                     │    │                             │  │
│  └─────────────────────┘    └──────────┬──────────────────┘  │
│                                          │                   │
│                               ┌──────────▼──────────────────┐  │
│                               │     PostgreSQL Database   │  │
│                               │     (Datos persistentes)    │  │
│                               └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Opción 1: Despliegue Automático (Blueprint)

La forma más fácil es usar el archivo `render.yaml` incluido en el proyecto.

### Paso 1: Subir código a GitHub

```bash
# Si aún no lo has hecho
git init
git add .
git commit -m "Initial commit for Render deployment"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/ERP-8AMPERIOS.git
git push -u origin main
```

### Paso 2: Crear Blueprint en Render

1. Ve al [Dashboard de Render](https://dashboard.render.com)
2. Haz clic en **"Blueprints"** en el menú lateral
3. Haz clic en **"New Blueprint Instance"**
4. Conecta tu repositorio de GitHub/GitLab
5. Render detectará automáticamente el archivo `render.yaml`
6. Revisa los servicios a crear:
   - ✅ PostgreSQL Database
   - ✅ Django Web Service (Backend)
   - ✅ Static Site (Frontend)
7. Haz clic en **"Apply"**

### Paso 3: Configurar Variables de Entorno

En el Dashboard de Render, selecciona el servicio Web (backend) y agrega estas variables en **Environment**:

```
SECRET_KEY=tu-clave-secreta-generada
DEBUG=False
CORS_ALLOW_ALL_ORIGINS=True
```

> **Generar SECRET_KEY**: Ejecuta en tu terminal local:
> ```bash
> python -c "import secrets; print(secrets.token_urlsafe(50))"
> ```

---

## 🔧 Opción 2: Despliegue Manual (Más Control)

Si prefieres configurar cada servicio manualmente:

### Paso 1: Crear Base de Datos PostgreSQL

1. En el Dashboard, haz clic en **"New"** → **"PostgreSQL"**
2. Configura:
   - **Name**: `erp-8amperios-db`
   - **Database**: `erp_8amperios`
   - **User**: (dejar por defecto)
3. Haz clic en **"Create Database"**
4. Copia la **Internal Database URL** (la necesitarás después)

### Paso 2: Crear Web Service (Backend)

1. Haz clic en **"New"** → **"Web Service"**
2. Conecta tu repositorio Git
3. Configura:
   - **Name**: `erp-8amperios-backend`
   - **Runtime**: Python 3
   - **Build Command**: `chmod +x build.sh && ./build.sh`
   - **Start Command**: `gunicorn erp_core.wsgi:application --bind 0.0.0.0:$PORT`
4. En **Environment Variables**, agrega:
   ```
   DATABASE_URL=<Internal Database URL del paso 1>
   SECRET_KEY=<tu-clave-secreta>
   DEBUG=False
   ALLOWED_HOSTS=.onrender.com,localhost
   CORS_ALLOW_ALL_ORIGINS=True
   ```
5. Haz clic en **"Create Web Service"**

### Paso 3: Crear Static Site (Frontend)

1. Haz clic en **"New"** → **"Static Site"**
2. Conecta el mismo repositorio Git
3. Configura:
   - **Name**: `erp-8amperios-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
4. En **Environment Variables**, agrega:
   ```
   VITE_API_URL=https://erp-8amperios-backend.onrender.com/api
   ```
   > Reemplaza con la URL real de tu backend
5. En **Redirects/Rewrites**, agrega:
   - Source: `/`
   - Destination: `/index.html`
   - Status: `200`
   
   (Para que React Router funcione correctamente)
6. Haz clic en **"Create Static Site"**

---

## 🔗 Conectar Frontend con Backend

### Opción A: Dominios Separados (CORS)

Si usas dominios separados (más común):

1. Backend: `https://erp-8amperios-backend.onrender.com`
2. Frontend: `https://erp-8amperios-frontend.onrender.com`

En el backend (Render Dashboard > Web Service > Environment):
```
CORS_ALLOW_ALL_ORIGINS=True
# O para más seguridad:
CORS_ALLOWED_ORIGINS=https://erp-8amperios-frontend.onrender.com
```

### Opción B: Mismo Dominio (Proxy)

Para evitar problemas de CORS, puedes configurar el frontend para hacer proxy al backend:

En `frontend/vite.config.js`, agrega:
```javascript
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://erp-8amperios-backend.onrender.com',
        changeOrigin: true,
      }
    }
  }
}
```

---

## ✅ Verificación Post-Despliegue

### Verificar Backend
```bash
curl https://tu-backend.onrender.com/api/
```
Debería responder con información de la API.

### Verificar Frontend
Abre `https://tu-frontend.onrender.com` en el navegador.

### Verificar Base de Datos
1. Ve a Render Dashboard > PostgreSQL
2. Haz clic en **"Connect"** para ver las conexiones activas

---

## 🔄 Despliegue Continuo (CI/CD)

Render automáticamente redeployea cuando haces push a tu repositorio:

```bash
# Hacer cambios locales
git add .
git commit -m "Nuevas funcionalidades"
git push origin main

# Render detecta el push y redeployea automáticamente
```

Para desactivar el auto-deploy en un servicio específico:
1. Dashboard > Servicio > Settings
2. Desmarca **"Auto-Deploy"**

---

## 🛠️ Solución de Problemas

### "Build Failed"

**Problema**: Error durante el build
```bash
# Ver logs en Render Dashboard > Service > Logs
```
**Soluciones comunes**:
- Verifica que `requirements.txt` está actualizado: `pip freeze > requirements.txt`
- Asegúrate de que `build.sh` tiene permisos de ejecución

### "Database Connection Failed"

**Problema**: No se conecta a PostgreSQL
**Solución**:
- Verifica que `DATABASE_URL` está correctamente configurada
- Asegúrate de que la base de datos está en la misma región que el web service

### "CORS Error" en el navegador

**Problema**: `Access-Control-Allow-Origin` error
**Solución**:
- Verifica `CORS_ALLOW_ALL_ORIGINS=True` en el backend
- O especifica el origen exacto del frontend en `CORS_ALLOWED_ORIGINS`

### "404 Not Found" en rutas de React

**Problema**: Refrescar página da 404
**Solución**:
- Agrega rewrite rule en Static Site:
  - Source: `/*`
  - Destination: `/index.html`

---

## 💰 Planes y Límites (Gratuitos)

| Recurso | Límite Gratuito |
|---------|-----------------|
| Web Service | 512 MB RAM, 0.1 CPU |
| Static Site | 100 GB/month bandwidth |
| PostgreSQL | 1 GB storage, 10 connections |
| Bandwidth | 100 GB/month |

**Nota**: Los servicios gratuitos "duermen" después de 15 minutos de inactividad. El primer request los despierta (toma ~30 segundos).

Para producción real, considera el plan **Starter** ($7/mes) que incluye:
- Web Service siempre activo
- 2 GB RAM
- 1 CPU

---

## 📞 Soporte

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Django on Render**: [render.com/docs/deploy-django](https://render.com/docs/deploy-django)
- **Static Sites**: [render.com/docs/static-sites](https://render.com/docs/static-sites)

---

## 🎉 ¡Listo!

Tu ERP-8AMPERIOS ahora está en la nube. Comparte las URLs con tu cliente:
- 🔗 **Frontend**: `https://erp-8amperios-frontend.onrender.com`
- 🔌 **API**: `https://erp-8amperios-backend.onrender.com/api/`

¡Felicitaciones por tu despliegue exitoso! 🚀
