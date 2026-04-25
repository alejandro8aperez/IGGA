from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from inventarios.models import Producto
from contabilidad.services import crear_asiento_pago_proveedor

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
    crear_asiento_pago_proveedor(instance.fecha, orden, instance.monto)

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


class ProductoProveedor(models.Model):
    """Relación entre Producto y Proveedor - qué productos vende cada proveedor"""
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='proveedores')
    proveedor = models.ForeignKey(Proveedor, on_delete=models.CASCADE, related_name='productos')
    codigo_proveedor = models.CharField(max_length=50, blank=True, help_text="Código del producto según el proveedor")
    precio_proveedor = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tiempo_entrega_dias = models.IntegerField(default=7, help_text="Días de entrega promedio")
    es_proveedor_principal = models.BooleanField(default=False, help_text="Proveedor principal para este producto")
    notas = models.TextField(blank=True)

    class Meta:
        db_table = 'compras_productoproveedor'
        unique_together = ['producto', 'proveedor']
        verbose_name = "Producto por Proveedor"
        verbose_name_plural = "Productos por Proveedor"

    def __str__(self):
        return f"{self.producto.nombre} - {self.proveedor.razon_social}"
