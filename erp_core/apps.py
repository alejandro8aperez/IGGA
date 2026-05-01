from django.apps import AppConfig
import os

class ErpCoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'erp_core'

    def ready(self):
        # Eliminamos la importación automática desde aquí para evitar RuntimeWarnings
        # y errores de duplicidad en producción.
        pass
