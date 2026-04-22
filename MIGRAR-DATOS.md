# 📦 Guía de Migración de Datos Local → Render (Nube)

Esta guía te llevará paso a paso para migrar tus datos de la base PostgreSQL local a la base de datos en Render.

---

## 🎯 Resumen del Proceso

```
Base Local (PostgreSQL) → Archivos JSON → Git → Render → Base en la Nube
```

---

## 🚀 Paso 1: Exportar Datos desde tu PC Local

### 1.1 Asegúrate de tener la base local funcionando
```bash
# Verifica que PostgreSQL está corriendo localmente
# y que tienes datos en tu ERP local
```

### 1.2 Ejecuta el script de exportación
```bash
# En la terminal, en la carpeta del proyecto:
cd c:\Postgres\ERP-8AMPERIOS

# Activar entorno virtual (si tienes)
venv\Scripts\activate

# Ejecutar script de exportación
python export_local_data.py
```

### 1.3 Verifica los archivos exportados
```bash
# Deberías ver una carpeta 'data_export/' con archivos JSON:
dir data_export\
```

Esperas ver algo como:
```
data_export/
  ├── configuracion_empresa.json
  ├── configuracion_departamento.json
  ├── inventarios_categoria.json
  ├── inventarios_producto.json
  ├── crm_cliente.json
  └── ... (tus otros datos)
```

---

## 📤 Paso 2: Subir Datos a GitHub

### 2.1 Agregar archivos al repositorio
```bash
# Agregar la carpeta de datos exportados
git add data_export/
git add export_local_data.py
git add erp_core/management/commands/import_data.py
git add MIGRAR-DATOS.md

# Commit
git commit -m "Add: Datos exportados para migración a Render"

# Push
git push origin main
```

---

## ☁️ Paso 3: Importar Datos en Render

### 3.1 Abrir Shell de Render

1. Ve a tu [Render Dashboard](https://dashboard.render.com)
2. Selecciona tu **Web Service** (backend Django)
3. Haz clic en **"Shell"** en el menú superior

### 3.2 En el Shell de Render, ejecuta:

```bash
# 1. Verificar que los archivos JSON están presentes
ls data_export/

# 2. Importar TODOS los datos
python manage.py import_data --all --dir data_export

# O si quieres importar solo un archivo específico:
# python manage.py import_data --file data_export/inventarios_producto.json
```

### 3.3 Verificar la importación

```bash
# Abrir Django shell
python manage.py shell

# Dentro del shell, verificar productos:
from inventarios.models import Producto
Producto.objects.count()  # Debería mostrar el número de productos

# Salir del shell
exit()
```

---

## ✅ Paso 4: Verificar en el Frontend

1. Abre tu frontend en la nube:
   ```
   https://erp-frontend-7798.onrender.com/
   ```

2. Ve al módulo **POS** (Panadería) o **Inventario**

3. ¡Deberías ver tus productos con precios!

---

## 🛠️ Solución de Problemas

### "No se encontraron archivos JSON"
```bash
# Asegúrate de que el directorio existe
mkdir -p data_export

# Re-ejecutar exportación
python export_local_data.py
```

### "Error al importar: tabla no existe"
- Asegúrate de haber corrido migraciones primero:
```bash
# En el shell de Render:
python manage.py migrate
```

### "Datos duplicados"
- Usa la opción `--clear` para limpiar antes de importar:
```bash
python manage.py import_data --all --clear
```
**⚠️ CUIDADO:** Esto borra TODOS los datos existentes en esa tabla.

### "Error de Foreign Key"
- Los datos deben importarse en orden correcto (empresa → departamentos → productos)
- El script `export_local_data.py` ya exporta en el orden correcto
- Si hay errores, importa manualmente en orden:
```bash
python manage.py import_data --file data_export/configuracion_empresa.json
python manage.py import_data --file data_export/configuracion_departamento.json
python manage.py import_data --file data_export/inventarios_categoria.json
python manage.py import_data --file data_export/inventarios_producto.json
# etc.
```

---

## 📋 Checklist de Migración

- [ ] Script de exportación ejecutado localmente
- [ ] Archivos JSON creados en `data_export/`
- [ ] Archivos subidos a GitHub
- [ ] Deploy en Render actualizado
- [ ] Shell de Render abierto
- [ ] Comando de importación ejecutado
- [ ] Datos verificados en el frontend

---

## 🔄 Actualizar Datos en el Futuro

Si necesitas migrar más datos después:

1. **Exportar solo lo nuevo** (modifica el script para exportar modelos específicos)
2. **Subir a Git**
3. **Importar en Render**

---

## 💾 Backup de Seguridad

Antes de cualquier migración, haz backup de tu base local:

```bash
# Windows (PowerShell)
cd c:\Postgres\ERP-8AMPERIOS
pg_dump -h localhost -U postgres -d erp_manufactura > backup_pre_migracion.sql

# Ingresar password cuando lo pida
```

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Render Dashboard → Web Service → Logs
2. Verifica que los archivos JSON tengan datos (no estén vacíos)
3. Asegúrate de que las migraciones de Django estén aplicadas (`python manage.py migrate`)

¡Buena suerte con la migración! 🚀
