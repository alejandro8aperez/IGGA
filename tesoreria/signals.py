from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError
from .models import MovimientoTesoreria
from .services import GestionFlujoCaja


@receiver(post_save, sender=MovimientoTesoreria)
def crear_asiento_al_confirmar(sender, instance, created, update_fields, **kwargs):
    """
    Signal: Cuando se confirma un movimiento, crea automáticamente el asiento contable
    """
    if update_fields and 'estado' in update_fields:
        if instance.estado == 'confirmado' and not instance.asiento_contable:
            try:
                GestionFlujoCaja.generar_asiento_movimiento(instance)
            except ValidationError as e:
                # Log the error but don't fail the save
                print(f"Error al crear asiento contable: {str(e)}")
