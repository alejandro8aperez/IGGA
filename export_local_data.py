import os
import json
import django
from django.core import serializers

# Configurar el entorno de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

# Lista de modelos a exportar en orden de dependencia
models_to_export = [
    ('configuracion', 'Empresa'),
    ('configuracion', 'Departamento'),
    ('inventarios', 'Categoria'),
    ('inventarios', 'Producto'),
    ('crm', 'Cliente'),
    ('crm', 'Oportunidad'),
    ('crm', 'Cotizacion'),
    ('crm', 'CotizacionDetalle'),
    ('pos', 'Sesion'),
    ('facturacion', 'Factura'),
]

export_dir = 'data_export'
if not os.path.exists(export_dir):
    os.makedirs(export_dir)

print(f"🚀 Iniciando exportación de datos en {export_dir}/...")

for app_label, model_name in models_to_export:
    try:
        from django.apps import apps
        model = apps.get_model(app_label, model_name)
        data = serializers.serialize('json', model.objects.all(), indent=4)
        
        file_name = f"{app_label}_{model_name.lower()}.json"
        with open(os.path.join(export_dir, file_name), 'w', encoding='utf-8') as f:
            f.write(data)
        
        print(f"✅ Exportado: {file_name} ({model.objects.count()} registros)")
    except Exception as e:
        print(f"❌ Error al exportar {app_label}.{model_name}: {e}")

print("\n🎉 Exportación finalizada. Ahora sube la carpeta 'data_export' a GitHub.")