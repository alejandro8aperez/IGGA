"""
Management command para importar datos desde archivos JSON.
Uso: python manage.py import_data --file data_export/inventarios_producto.json
   o python manage.py import_data --all (importa todos los archivos en data_export/)
"""

import os
import glob
import json
from django.core.management.base import BaseCommand
from django.core import serializers
from django.db import transaction


class Command(BaseCommand):
    help = 'Importa datos desde archivos JSON exportados'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            help='Archivo JSON específico a importar',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Importa todos los archivos JSON en data_export/',
        )
        parser.add_argument(
            '--dir',
            type=str,
            default='data_export',
            help='Directorio donde están los archivos JSON (default: data_export)',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Elimina datos existentes antes de importar (¡CUIDADO!)',
        )

    def handle(self, *args, **options):
        data_dir = options['dir']
        
        if not os.path.exists(data_dir):
            self.stdout.write(
                self.style.ERROR(f'❌ Directorio no encontrado: {data_dir}')
            )
            return
        
        if options['file']:
            # Importar archivo específico
            self.import_file(options['file'], options['clear'])
        elif options['all']:
            # Importar todos los archivos
            json_files = sorted(glob.glob(f'{data_dir}/*.json'))
            
            if not json_files:
                self.stdout.write(
                    self.style.WARNING(f'⚠️  No se encontraron archivos JSON en {data_dir}/')
                )
                return
            
            self.stdout.write(
                self.style.NOTICE(f'📁 Encontrados {len(json_files)} archivos para importar')
            )
            self.stdout.write()
            
            success_count = 0
            for file_path in json_files:
                if self.import_file(file_path, options['clear']):
                    success_count += 1
            
            self.stdout.write()
            self.stdout.write(
                self.style.SUCCESS(f'✅ Importación completada: {success_count}/{len(json_files)} archivos')
            )
        else:
            self.stdout.write(
                self.style.ERROR('❌ Especifica --file o --all')
            )

    def import_file(self, file_path, clear_existing=False):
        """Importa un archivo JSON individual"""
        try:
            filename = os.path.basename(file_path)
            self.stdout.write(f'📄 Importando {filename}...', ending=' ')
            
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if not data:
                self.stdout.write(self.style.WARNING('VACÍO'))
                return True
            
            # Obtener el modelo del primer objeto
            model_name = data[0].get('model', 'desconocido')
            
            with transaction.atomic():
                # Opcionalmente limpiar datos existentes
                if clear_existing:
                    from django.apps import apps
                    try:
                        app_label, model = model_name.split('.')
                        Model = apps.get_model(app_label, model)
                        deleted = Model.objects.all().delete()
                        self.stdout.write(f'(limpiados {deleted[0]}) ', ending='')
                    except Exception as e:
                        self.stdout.write(f'(error al limpiar: {e}) ', ending='')
                
                # Deserializar y guardar
                objects = serializers.deserialize('json', json.dumps(data))
                count = 0
                for obj in objects:
                    obj.save()
                    count += 1
            
            self.stdout.write(
                self.style.SUCCESS(f'✓ {count} registros ({model_name})')
            )
            return True
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ Error: {e}')
            )
            return False
