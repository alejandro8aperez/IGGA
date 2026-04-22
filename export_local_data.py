#!/usr/bin/env python
"""
Script para exportar datos de la base de datos local PostgreSQL
a archivos JSON que pueden importarse en Render.
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

import json
from django.core.serializers import serialize, deserialize
from django.apps import apps

# Lista de modelos a exportar (en orden de dependencias)
# Ajusta esta lista según los datos que tengas en tu ERP
MODELS_TO_EXPORT = [
    # Configuración
    'configuracion.Empresa',
    'configuracion.Departamento',
    
    # Inventarios
    'inventarios.Categoria',
    'inventarios.Producto',
    'inventarios.Almacen',
    'inventarios.Ubicacion',
    
    # CRM
    'crm.Cliente',
    'crm.Contacto',
    
    # Ventas
    'venta.ClienteVenta',
    
    # Compras
    'compras.Proveedor',
    
    # RRHH
    'rrhh.Empleado',
    'rrhh.Cargo',
    
    # Producción
    'produccion.Receta',
    'produccion.InsumoReceta',
    
    # Calidad
    'calidad.DocumentoISO',
    
    # KAVE
    'kave.Transformer',
    'kave.CotizacionKAVE',
]

def export_model(model_name, output_dir='data_export'):
    """Exporta un modelo a JSON"""
    try:
        app_label, model_name_only = model_name.split('.')
        model = apps.get_model(app_label, model_name_only)
        
        objects = model.objects.all()
        count = objects.count()
        
        if count == 0:
            print(f"  ⚠️  {model_name}: Sin datos")
            return None
        
        # Crear directorio si no existe
        os.makedirs(output_dir, exist_ok=True)
        
        # Serializar datos
        data = serialize('json', objects, indent=2)
        
        # Guardar archivo
        filename = f"{output_dir}/{app_label}_{model_name_only.lower()}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(data)
        
        print(f"  ✅ {model_name}: {count} registros exportados → {filename}")
        return filename
        
    except Exception as e:
        print(f"  ❌ {model_name}: Error - {e}")
        return None

def export_all():
    """Exporta todos los modelos configurados"""
    print("=" * 60)
    print("EXPORTANDO DATOS DE BASE LOCAL")
    print("=" * 60)
    print()
    
    output_dir = 'data_export'
    os.makedirs(output_dir, exist_ok=True)
    
    exported_files = []
    
    for model_name in MODELS_TO_EXPORT:
        file = export_model(model_name, output_dir)
        if file:
            exported_files.append(file)
    
    print()
    print("=" * 60)
    print(f"EXPORTACIÓN COMPLETADA")
    print(f"Total archivos: {len(exported_files)}")
    print(f"Ubicación: ./{output_dir}/")
    print("=" * 60)
    print()
    print("Próximos pasos:")
    print("1. Verifica los archivos en la carpeta data_export/")
    print("2. Sube estos archivos a tu repositorio Git")
    print("3. Ejecuta el script de importación en Render")
    
    return exported_files

if __name__ == '__main__':
    export_all()
