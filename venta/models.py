from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from crm.models import Cliente
from inventarios.models import Producto, MovimientoInventario
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
    orden_venta = models.ForeignKey(OrdenVenta, on_delete=models.CASCADE, related_name='facturas')
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
    inventario_descontado = models.BooleanField(default=False, verbose_name="¿Stock descontado?")

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

    # NUEVO: Descuento automático de inventario al facturar
    if not instance.inventario_descontado:
        detalles = instance.orden_venta.detalles.all()
        for detalle in detalles:
            # Solo descontar si es un producto físico (no servicio)
            if detalle.producto.tipo_producto != 'servicio':
                MovimientoInventario.objects.create(
                    producto=detalle.producto,
                    cantidad=detalle.cantidad,
                    tipo='salida',
                    motivo=f"Venta: {instance.numero_factura}",
                    origen='venta',
                    documento_referencia=instance.numero_factura
                )
        instance.inventario_descontado = True
        instance.save(update_fields=['inventario_descontado'])


class NotaCredito(models.Model):
    TIPO_CHOICES = [
        ('devolucion', 'Devolución de Mercancía'),
        ('descuento', 'Descuento/Anulación'),
        ('correccion', 'Corrección de Factura'),
    ]
    
    factura = models.ForeignKey(FacturaVenta, on_delete=models.CASCADE, related_name='notas_credito')
    numero_nota = models.CharField(max_length=50, unique=True)
    fecha_emision = models.DateField(auto_now_add=True)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='devolucion')
    motivo = models.TextField(verbose_name="Motivo de la nota de crédito")
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    porcentaje_iva = models.DecimalField(max_digits=5, decimal_places=2, default=19.00, verbose_name="% IVA")
    valor_iva = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    estado = models.CharField(max_length=20, choices=[
        ('borrador', 'Borrador'),
        ('enviada', 'Enviada a DIAN'),
        ('aprobada', 'Aprobada'),
        ('rechazada', 'Rechazada'),
    ], default='borrador')
    cufe = models.CharField(max_length=100, blank=True, verbose_name="CUFE DIAN")
    contabilidad_generado = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Nota de Crédito"
        verbose_name_plural = "Notas de Crédito"
        ordering = ['-fecha_emision']
    
    def __str__(self):
        return f"NC-{self.numero_nota} / Factura {self.factura.numero_factura}"
    
    def calcular_totales(self):
        self.subtotal = sum(d.valor_total for d in self.detalles.all())
        self.valor_iva = self.subtotal * (self.porcentaje_iva / 100)
        self.total = self.subtotal + self.valor_iva
        self.save()


class DetalleNotaCredito(models.Model):
    nota_credito = models.ForeignKey(NotaCredito, related_name='detalles', on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    valor_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    class Meta:
        verbose_name = "Detalle Nota de Crédito"
        verbose_name_plural = "Detalles Notas de Crédito"
    
    def __str__(self):
        return f"{self.cantidad}x {self.producto.nombre} (NC-{self.nota_credito.numero_nota})"
    
    def save(self, *args, **kwargs):
        self.valor_total = self.cantidad * self.precio_unitario
        super().save(*args, **kwargs)
        # Recalcular totales de la nota
        self.nota_credito.calcular_totales()

