from django.apps import AppConfig


def _seed_consumidor_final(sender, **kwargs):
    """
    Crea el cliente 'Consumidor Final' (id=1) si no existe.
    Se ejecuta en post_migrate donde el acceso a BD es seguro y esperado.
    Crucial para el módulo POS.
    """
    from django.apps import apps
    if not apps.is_installed('crm'):
        return
    try:
        Cliente = apps.get_model('crm', 'Cliente')
        _, created = Cliente.objects.get_or_create(
            id=1,
            defaults={'nombre': 'Consumidor Final', 'nit': '222222222222'}
        )
        if created:
            print("[OK] Cliente 'Consumidor Final' creado.")
    except Exception as e:
        print(f"[WARN] No se pudo asegurar 'Consumidor Final': {e}")


class ErpCoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'erp_core'

    def ready(self):
        # Conectar el seed al signal post_migrate (acceso a BD correcto aquí)
        from django.db.models.signals import post_migrate
        post_migrate.connect(_seed_consumidor_final, sender=self)
