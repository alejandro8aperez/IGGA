from django.apps import AppConfig

class KaveConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'kave'
    verbose_name = 'KAVE - Gestión de Proyectos'
    
    def ready(self):
        try:
            import kave.signals
        except ImportError:
            pass
