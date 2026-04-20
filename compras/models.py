from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from inventarios.models import Producto
from contabilidad.models import Cuenta, AsientoContable, MovimientoContable

class Proveedor(models.Model):
    razon_social = models.CharField(max_length=200)
    nit = models.CharField(max_length=50, unique=True)
    contacto_nombre = models.CharField(max_length=100)
    contacto_email = models.EmailField()
    contacto_telefono = models.CharField(max_length=20, blank=True)
    direccion = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.razon_social} ({self.nit})"

class OrdenCompra(models.Model):
    proveedor = models.ForeignKey(Proveedor, on_delete=models.CASCADE)
    fecha_emision = models.DateField(auto_now_add=True)
    fecha_entrega_esperada = models.DateField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=[
        ('borrador', 'Borrador'),
        ('enviada', 'Enviada al Proveedor'),
        ('recibida_parcial', 'Recibida Parcialmente'),
        ('completada', 'Completada'),
        ('cancelada', 'Cancelada')
    ], default='borrador')
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"OC-{self.id} / {self.proveedor.razon_social}"

    @property
    def recibido_total(self):
        return self.recepciones.aggregate(total=models.Sum('cantidad_recibida'))['total'] or 0

    @property
    def saldo_por_pagar(self):
        pagado = self.pagos.aggregate(total=models.Sum('monto'))['total'] or 0
        return max(self.total - pagado, 0)

class DetalleOrdenCompra(models.Model):
    orden = models.ForeignKey(OrdenCompra, related_name='detalles', on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.cantidad}x {self.producto.nombre} (OC-{self.orden.id})"

class RecepcionCompra(models.Model):
    orden = models.ForeignKey(OrdenCompra, related_name='recepciones', on_delete=models.CASCADE)
    fecha = models.DateField(auto_now_add=True)
    cantidad_recibida = models.IntegerField()
    comentario = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"Recepción OC-{self.orden.id} ({self.cantidad_recibida})"

class PagoCompra(models.Model):
    orden = models.ForeignKey(OrdenCompra, related_name='pagos', on_delete=models.CASCADE)
    fecha = models.DateField(auto_now_add=True)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    metodo = models.CharField(max_length=50, choices=[
        ('transferencia', 'Transferencia'),
        ('efectivo', 'Efectivo'),
        ('cheque', 'Cheque'),
    ], default='transferencia')
    referencia = models.CharField(max_length=100, blank=True)

    def clean(self):
        if self.orden.estado == 'cancelada':
            raise ValidationError('No se puede registrar pago para orden cancelada.')
        if self.monto <= 0:
            raise ValidationError('El monto debe ser mayor a cero.')

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Pago OC-{self.orden.id} ${self.monto}"


@receiver(post_save, sender=RecepcionCompra)
def post_save_recepcion(sender, instance, created, **kwargs):
    if not created:
        return
    orden = instance.orden
    if orden.recibido_total >= orden.total and orden.estado not in ['cancelada', 'completada']:
        orden.estado = 'completada'
        orden.save(update_fields=['estado'])


@receiver(post_save, sender=PagoCompra)
def post_save_pago(sender, instance, created, **kwargs):
    if not created:
        return

    orden = instance.orden
    cuenta_pagar, _ = Cuenta.objects.get_or_create(
        codigo='210101',
        defaults={'nombre': 'Cuentas por pagar proveedores', 'tipo': 'pasivo', 'nivel': 2}
    )
    cuenta_caja, _ = Cuenta.objects.get_or_create(
        codigo='100101',
        defaults={'nombre': 'Caja y bancos', 'tipo': 'activo', 'nivel': 2}
    )

    asiento = AsientoContable.objects.create(
        fecha=instance.fecha,
        descripcion=f"Pago OC-{orden.id} / {orden.proveedor.razon_social}",
        referencia=f"PagoCompra:{instance.id}",
        total_debe=instance.monto,
        total_haber=instance.monto
    )

    MovimientoContable.objects.create(
        asiento=asiento,
        cuenta=cuenta_pagar,
        debe=0,
        haber=instance.monto,
        descripcion=f"Pago proveedor {orden.proveedor.razon_social}"
    )
    MovimientoContable.objects.create(
        asiento=asiento,
        cuenta=cuenta_caja,
        debe=instance.monto,
        haber=0,
        descripcion='Salida de caja por pago de compra'
    )

    if orden.saldo_por_pagar <= 0 and orden.estado != 'cancelada':
        orden.estado = 'completada'
        orden.save(update_fields=['estado'])


class Contrato(models.Model):
    codigo = models.CharField(max_length=80, unique=True)
    proveedor = models.ForeignKey(Proveedor, on_delete=models.CASCADE, related_name='contratos')
    tipo = models.CharField(max_length=20, choices=[('compra', 'Compra'), ('venta', 'Venta')], default='compra')
    descripcion = models.TextField(blank=True)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    valor_contrato = models.DecimalField(max_digits=14, decimal_places=2)
    estado = models.CharField(max_length=25, choices=[
        ('negociacion', 'Negociación'),
        ('activo', 'Activo'),
        ('vencido', 'Vencido'),
        ('cancelado', 'Cancelado'),
    ], default='negociacion')

    def duracion_dias(self):
        if self.fecha_fin and self.fecha_inicio:
            return (self.fecha_fin - self.fecha_inicio).days
        return None

    def __str__(self):
        return f"CON-{self.codigo} ({self.proveedor.razon_social})"
