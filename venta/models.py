from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from crm.models import Cliente
from inventarios.models import Producto
from contabilidad.services import crear_asiento_cobro, crear_asiento_venta

class OrdenVenta(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    fecha_emision = models.DateField(auto_now_add=True)
    fecha_entrega_esperada = models.DateField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=[
        ('borrador', 'Borrador'),
        ('confirmada', 'Confirmada'),
        ('enviada', 'Enviada'),
        ('entregada', 'Entregada'),
        ('cancelada', 'Cancelada')
    ], default='borrador')
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"OV-{self.id} / {self.cliente.nombre}"

class DetalleOrdenVenta(models.Model):
    orden = models.ForeignKey(OrdenVenta, related_name='detalles', on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.cantidad}x {self.producto.nombre} (OV-{self.orden.id})"

class FacturaVenta(models.Model):
    orden_venta = models.OneToOneField(OrdenVenta, on_delete=models.CASCADE)
    numero_factura = models.CharField(max_length=50, unique=True)
    fecha_emision = models.DateField(auto_now_add=True)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    estado = models.CharField(max_length=20, choices=[
        ('pendiente', 'Pendiente'),
        ('pagada', 'Pagada'),
        ('vencida', 'Vencida')
    ], default='pendiente')
    contabilidad_generado = models.BooleanField(default=False)
    cobro_contabilizado = models.BooleanField(default=False)

    def __str__(self):
        return f"Factura {self.numero_factura} - {self.orden_venta.cliente.nombre}"

    def clean(self):
        if self.orden_venta.estado == 'cancelada':
            raise ValidationError('No se puede generar factura para una orden de venta cancelada.')

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def crear_asiento_ventas(self):
        return crear_asiento_venta(self)

    def crear_asiento_cobro(self):
        return crear_asiento_cobro(self)


@receiver(post_save, sender=FacturaVenta)
def post_save_factura_venta(sender, instance, created, **kwargs):
    if not instance.contabilidad_generado:
        instance.crear_asiento_ventas()
        instance.contabilidad_generado = True
        instance.save(update_fields=['contabilidad_generado'])

    if instance.estado == 'pagada' and not instance.cobro_contabilizado:
        instance.crear_asiento_cobro()
        instance.cobro_contabilizado = True
        instance.save(update_fields=['cobro_contabilizado'])

