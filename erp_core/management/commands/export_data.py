"""
Management command para exportar datos desde la base de datos a archivos JSON.
Uso: python manage.py export_data --dir data_export
"""

import os
import json
from django.core.management.base import BaseCommand
from django.core import serializers
from django.apps import apps


# Lista de modelos a exportar (en orden de dependencias)
MODELS_TO_EXPORT = [
    # Configuración
    'configuracion.Empresa',
    'configuracion.Departamento',
    
    # Inventarios
    'inventarios.Categoria',
    'inventarios.Producto',
    'inventarios.Almacen',
    'inventarios.Ubicacion',
    'inventarios.MovimientoInventario',
    
    # CRM
    'crm.Cliente',
    'crm.Contacto',
    
    # Ventas
    'venta.ClienteVenta',
    'venta.Pedido',
    'venta.DetallePedido',
    
    # Compras
    'compras.Proveedor',
    'compras.OrdenCompra',
    
    # Facturación
    'facturacion.ResolucionFacturacion',
    'facturacion.Factura',
    'facturacion.DetalleFactura',
    
    # RRHH
    'rrhh.Cargo',
    'rrhh.Empleado',
    
    # Producción
    'produccion.Receta',
    'produccion.InsumoReceta',
    'produccion.OrdenProduccion',
    
    # POS (Panadería)
    'pos.SesionCaja',
    'pos.VentaPOS',
    
    # Calidad
    'calidad.DocumentoISO',
    
    # KAVE
    'kave.Transformer',
    'kave.CotizacionKAVE',
]


class Command(BaseCommand):
    help = 'Exporta datos de la base de datos a archivos JSON'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dir',
            type=str,
            default='data_export',
            help='Directorio donde guardar los archivos JSON (default: data_export)',
        )
        parser.add_argument(
            '--model',
            type=str,
            help='Exportar solo un modelo específico (ej: inventarios.Producto)',
        )

    def handle(self, *args, **options):
        output_dir = options['dir']
        specific_model = options['model']
        
        # Crear directorio si no existe
        os.makedirs(output_dir, exist_ok=True)
        
        self.stdout.write("=" * 60)
        self.stdout.write("EXPORTANDO DATOS DE BASE DE DATOS")
        self.stdout.write("=" * 60)
        self.stdout.write()
        
        exported_files = []
        
        if specific_model:
            # Exportar solo un modelo
            file = self.export_model(specific_model, output_dir)
            if file:
                exported_files.append(file)
        else:
            # Exportar todos los modelos
            for model_name in MODELS_TO_EXPORT:
                file = self.export_model(model_name, output_dir)
                if file:
                    exported_files.append(file)
        
        self.stdout.write()
        self.stdout.write("=" * 60)
        self.stdout.write(
            self.style.SUCCESS(f'EXPORTACIÓN COMPLETADA')
        )
        self.stdout.write(f'Total archivos: {len(exported_files)}')
        self.stdout.write(f'Ubicación: ./{output_dir}/')
        self.stdout.write("=" * 60)
        self.stdout.write()
        self.stdout.write("Para descargar estos archivos:")
        self.stdout.write("1. En Render Shell: ls -la data_export/")
        self.stdout.write("2. Descarga cada archivo .json desde el dashboard")
        self.stdout.write("3. Copia a tu PC local")
        self.stdout.write("4. Ejecuta: python manage.py import_data --all --dir data_export")

    def export_model(self, model_name, output_dir):
        """Exporta un modelo a JSON"""
        try:
            app_label, model_name_only = model_name.split('.')
            model = apps.get_model(app_label, model_name_only)
            
            objects = model.objects.all()
            count = objects.count()
            
            if count == 0:
                self.stdout.write(
                    self.style.WARNING(f'  ⚠️  {model_name}: Sin datos')
                )
                return None
            
            # Serializar datos
            data = serializers.serialize('json', objects, indent=2)
            
            # Guardar archivo
            filename = f"{output_dir}/{app_label}_{model_name_only.lower()}.json"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(data)
            
            self.stdout.write(
                self.style.SUCCESS(f'  ✅ {model_name}: {count} registros → {filename}')
            )
            return filename
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'  ❌ {model_name}: Error - {e}')
            )
            return None
