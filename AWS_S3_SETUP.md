# Configuración de AWS S3 para Almacenamiento de Imágenes

## Paso 1: Crear Bucket en AWS S3

1. Ve a la consola de AWS: https://console.aws.amazon.com/s3/
2. Clic en "Create bucket"
3. Configura:
   - **Bucket name**: `erp-8amperios-media` (debe ser único globalmente)
   - **Region**: Selecciona la más cercana (ej: us-east-1)
   - **Block Public Access**: DESMARCA "Block all public access" (necesitamos acceso público para las imágenes)
   - Marca "I acknowledge that..."
4. Clic en "Create bucket"

## Paso 2: Configurar Permisos del Bucket

1. Ve a tu bucket
2. Ve a la pestaña "Permissions"
3. En "Bucket Policy", agrega:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::erp-8amperios-media/media/*"
        }
    ]
}
```

4. Clic en "Save changes"

## Paso 3: Crear Usuario IAM

1. Ve a IAM: https://console.aws.amazon.com/iam/
2. Ve a "Users" → "Add user"
3. **User name**: `erp-s3-uploader`
4. Selecciona "Programmatic access"
5. En permissions, selecciona "Attach existing policies directly"
6. Busca y selecciona "AmazonS3FullAccess" (o crea una política personalizada más restrictiva)
7. Clic en "Next" → "Create user"
8. **IMPORTANTE**: Guarda el **Access Key ID** y **Secret Access Key** (solo se muestran una vez)

## Paso 4: Configurar Variables de Entorno en Render

Ve al dashboard de Render (https://dashboard.render.com/) y agrega estas variables de entorno:

```
USE_S3=True
AWS_ACCESS_KEY_ID=tu-access-key-id
AWS_SECRET_ACCESS_KEY=tu-secret-access-key
AWS_STORAGE_BUCKET_NAME=erp-8amperios-media
AWS_S3_REGION_NAME=us-east-1  (o tu región)
```

## Paso 5: Deploy y Verificar

1. Haz push de los cambios a GitHub
2. Render hará el deploy automáticamente
3. Ve al módulo POS y sube una imagen de producto
4. Verifica que la imagen se vea correctamente

## Migrar Imágenes Existentes (Opcional)

Para migrar imágenes del almacenamiento local a S3:

```bash
# En tu PC local, ejecuta:
python manage.py shell

# Dentro del shell:
from inventarios.models import Producto
import os

for producto in Producto.objects.exclude(imagen=''):
    if os.path.exists(producto.imagen.path):
        # La imagen se re-subirá automáticamente a S3 al guardar
        producto.save()
        print(f"Migrado: {producto.nombre}")
```

## Solución de Problemas

### Las imágenes no se cargan
1. Verifica las credenciales de AWS
2. Revisa que el bucket tenga permisos públicos
3. Verifica la política del bucket

### Error 403 Forbidden
- El bucket no tiene permisos públicos
- La política del bucket no está configurada correctamente

### Error 404 Not Found
- La imagen no existe en S3
- Verifica la ruta en el bucket

## Costos de AWS S3

- **Storage**: ~$0.023 por GB/mes
- **Requests**: Muy bajo costo para GET/PUT
- Para un ERP pequeño: ~$1-5 USD/mes

## Alternativa: CloudFront (Opcional)

Para mejor rendimiento global, configura CloudFront como CDN:
1. Ve a CloudFront en AWS
2. Crea una distribución
3. Origen: tu bucket S3
4. Usa la URL de CloudFront en lugar de S3 directo
