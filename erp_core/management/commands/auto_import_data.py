"""
Management command para importar automáticamente datos desde data_export/
Solo importa si la base de datos está vacía.
"""
import os
import json
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.core import serializers
from django.db import transaction
from django.apps import apps


class Command(BaseCommand):
    help = 'Importa automáticamente datos desde data_export/ si la BD está vacía'

    def handle(self, *args, **options):
        data_dir = 'data_export'
        
        if not os.path.exists(data_dir):
            self.stdout.write('No existe directorio data_export/')
            return
        
        # Verificar si hay datos en la BD
        from django.contrib.auth.models import User
        if User.objects.count() > 1:  # Solo admin existe
            self.stdout.write('La base de datos ya tiene datos. No se importará.')
            return
        
        self.stdout.write('Importando datos iniciales...')
        
        # Importar archivos JSON
        for filename in os.listdir(data_dir):
            if filename.endswith('.json'):
                filepath = os.path.join(data_dir, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    # Importar usando loaddata
                    call_command('loaddata', filepath)
                    self.stdout.write(f'✅ Importado: {filename}')
                    
                except Exception as e:
                    self.stdout.write(f'❌ Error importando {filename}: {e}')
        
        self.stdout.write('✅ Importación automática completada')
