from django.apps import AppConfig
import os

class ErpCoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'erp_core'

    def ready(self):
        # Importar modelos solo cuando la aplicación está lista para evitar problemas de importación circular
        from django.apps import apps
        
        # Crear cliente 'Consumidor Final' por defecto si no existe
        # Esto es crucial para el módulo POS y evita errores 500 si no hay un cliente por defecto.
        # Solo se ejecuta si la app 'crm' está instalada.
        if apps.is_installed('crm'):
            try:
                Cliente = apps.get_model('crm', 'Cliente')
                Cliente.objects.get_or_create(id=1, defaults={'nombre': 'Consumidor Final', 'nit': '222222222222'})
                print("✅ Cliente 'Consumidor Final' asegurado.")
            except Exception as e:
                print(f"⚠️ Error al asegurar cliente 'Consumidor Final': {e}")
