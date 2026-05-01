---
description: Desplegar ERP-8AMPERIOS a Render
---

# Despliegue de ERP-8AMPERIOS a Render

## Opción 1: Despliegue Automático via Render Dashboard (Recomendado)

1. **Subir código a GitHub:**
   ```bash
   git push origin main
   ```

2. **Crear cuenta en Render:** https://dashboard.render.com

3. **Conectar repositorio:**
   - Click "New +" → "Blueprint"
   - Conectar tu repo de GitHub
   - Render detectará automáticamente `render.yaml`

4. **Desplegar:**
   - Render creará automáticamente:
     - Base de datos PostgreSQL
     - Backend Django (Web Service)
     - Frontend React (Static Site)

## Opción 2: Despliegue Manual por Servicios

### Paso 1: Base de Datos
1. En Render Dashboard → "New +" → "PostgreSQL"
2. Nombre: `erp-8amperios-db`
3. Plan: Starter (o Free si disponible)
4. Copiar la "Internal Database URL"

### Paso 2: Backend Django
1. "New +" → "Web Service"
2. Conectar repositorio
3. Configurar:
   - **Name:** `erp-8amperios-backend`
   - **Runtime:** Python 3
   - **Build Command:** `chmod +x build.sh && ./build.sh`
   - **Start Command:** `gunicorn erp_core.wsgi:application --bind 0.0.0.0:$PORT`
4. Variables de entorno:
   - `DATABASE_URL`: (Internal URL de la base de datos)
   - `SECRET_KEY`: (Generar nuevo)
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `.onrender.com`
   - `CORS_ALLOW_ALL_ORIGINS`: `True`

### Paso 3: Frontend React
1. "New +" → "Static Site"
2. Configurar:
   - **Name:** `erp-8amperios-frontend`
   - **Runtime:** Node
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/dist`
3. Variables de entorno:
   - `VITE_API_URL`: `https://erp-8amperios-backend.onrender.com/api`
4. **Redirects:**
   - Source: `/*`
   - Destination: `/index.html`

## URLs Esperadas

- **Backend:** `https://erp-8amperios-backend.onrender.com`
- **Frontend:** `https://erp-8amperios-frontend.onrender.com`
- **API:** `https://erp-8amperios-backend.onrender.com/api`

## Troubleshooting

### Error 404 en rutas del frontend
Verificar que el `static.json` o configuración de redirects esté correcto.

### Error CORS
Verificar que `CORS_ALLOW_ALL_ORIGINS=True` o configurar `CORS_ALLOWED_ORIGINS` con el dominio del frontend.

### Base de datos no conecta
Verificar que `DATABASE_URL` esté correctamente configurada.

## Comandos Útiles

```bash
# Ver logs del backend
render logs --service erp-8amperios-backend

# Ver logs del frontend
render logs --service erp-8amperios-frontend

# SSH al servicio
render ssh --service erp-8amperios-backend
```
