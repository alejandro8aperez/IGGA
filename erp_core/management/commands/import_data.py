import os
import json
from django.core.management.base import BaseCommand
from django.apps import apps
from django.core import serializers
from django.db import transaction

class Command(BaseCommand):
    help = 'Importa datos desde archivos JSON en un directorio'

    def add_arguments(self, parser):
        parser.add_argument('--dir', type=str, help='Directorio con archivos JSON')
        parser.add_argument('--file', type=str, help='Archivo JSON específico')
        parser.add_argument('--all', action='store_true', help='Importar todos los archivos en el directorio')
        parser.add_argument('--clear', action='store_true', help='Borrar datos existentes antes de importar')

    def handle(self, *args, **options):
        if options['file']:
            self.import_file(options['file'], options['clear'])
        elif options['all'] and options['dir']:
            # Orden de importación para evitar errores de Foreign Key
            import_order = [
                'configuracion_empresa.json',
                'configuracion_departamento.json',
                'inventarios_categoria.json',
                'inventarios_producto.json',
                'crm_cliente.json',
                'crm_oportunidad.json',
                'crm_cotizacion.json',
                'crm_cotizaciondetalle.json',
                'pos_sesion.json',
                'facturacion_factura.json'
            ]
            
            for file_name in import_order:
                file_path = os.path.join(options['dir'], file_name)
                if os.path.exists(file_path):
                    self.import_file(file_path, options['clear'])
        else:
            self.stdout.write(self.style.ERROR('Debe especificar --file o --all --dir'))

    def import_file(self, file_path, clear):
        self.stdout.write(f"⏳ Procesando {file_path}...")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            if not data:
                self.stdout.write(self.style.WARNING(f"⚠️ Archivo vacío: {file_path}"))
                return

            model_label = data[0]['model']
            model = apps.get_model(model_label)

            with transaction.atomic():
                if clear:
                    self.stdout.write(self.style.WARNING(f"🗑️ Limpiando tabla {model_label}..."))
                    model.objects.all().delete()

                for obj in serializers.deserialize('json', json.dumps(data)):
                    obj.save()
                
            self.stdout.write(self.style.SUCCESS(f"✅ Importado: {os.path.basename(file_path)} ({len(data)} registros)"))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error en {file_path}: {e}"))