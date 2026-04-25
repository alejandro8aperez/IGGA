from django.apps import AppConfig
import os


class ErpCoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'erp_core'

    def ready(self):
        # Importar datos automáticamente en producción si la BD está vacía
        from django.conf import settings
        if not settings.DEBUG:
            try:
                from django.core.management import call_command
                # Solo importar si existe el directorio data_export
                if os.path.exists('data_export'):
                    call_command('auto_import_data', verbosity=0)
            except Exception as e:
                # Silenciar errores para no romper el inicio
                pass
