from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from crm.models import Cliente
from inventarios.models import Producto
from contabilidad.models import Cuenta, AsientoContable, MovimientoContable

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
        # Asegurar cuentas base disponibles en el plan de cuentas
        cuenta_cxc, _ = Cuenta.objects.get_or_create(
            codigo='110101',
            defaults={'nombre': 'Cuentas por cobrar clientes', 'tipo': 'activo', 'nivel': 2}
        )
        cuenta_ingresos, _ = Cuenta.objects.get_or_create(
            codigo='410101',
            defaults={'nombre': 'Ingresos por ventas', 'tipo': 'ingreso', 'nivel': 2}
        )

        asiento = AsientoContable.objects.create(
            fecha=self.fecha_emision,
            descripcion=f"Venta factura {self.numero_factura} - {self.orden_venta.cliente.nombre}",
            referencia=f"FacturaVenta:{self.id}",
            total_debe=self.total,
            total_haber=self.total
        )

        MovimientoContable.objects.create(
            asiento=asiento,
            cuenta=cuenta_cxc,
            debe=self.total,
            haber=0,
            descripcion=f"Venta a cliente {self.orden_venta.cliente.nombre}"
        )

        MovimientoContable.objects.create(
            asiento=asiento,
            cuenta=cuenta_ingresos,
            debe=0,
            haber=self.total,
            descripcion="Ingreso por ventas"
        )

    def crear_asiento_cobro(self):
        cuenta_caja, _ = Cuenta.objects.get_or_create(
            codigo='100101',
            defaults={'nombre': 'Caja y bancos', 'tipo': 'activo', 'nivel': 2}
        )
        cuenta_cxc, _ = Cuenta.objects.get_or_create(
            codigo='110101',
            defaults={'nombre': 'Cuentas por cobrar clientes', 'tipo': 'activo', 'nivel': 2}
        )

        asiento = AsientoContable.objects.create(
            fecha=self.fecha_emision,
            descripcion=f"Cobro factura {self.numero_factura} - {self.orden_venta.cliente.nombre}",
            referencia=f"FacturaVentaCobro:{self.id}",
            total_debe=self.total,
            total_haber=self.total
        )

        MovimientoContable.objects.create(
            asiento=asiento,
            cuenta=cuenta_caja,
            debe=self.total,
            haber=0,
            descripcion=f"Cobro de factura {self.numero_factura}"
        )

        MovimientoContable.objects.create(
            asiento=asiento,
            cuenta=cuenta_cxc,
            debe=0,
            haber=self.total,
            descripcion=f"Baja cuenta por cobrar cliente {self.orden_venta.cliente.nombre}"
        )


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

