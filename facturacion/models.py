from django.db import models
from django.utils import timezone
from crm.models import Cliente
from inventarios.models import Producto

class ResolucionFacturacion(models.Model):
    prefijo = models.CharField(max_length=5, default="FE")
    numero_inicial = models.IntegerField(default=1)
    numero_final = models.IntegerField(default=10000)
    numero_actual = models.IntegerField(default=1)
    fecha_inicio = models.DateField(default=timezone.now)
    fecha_fin = models.DateField()
    activa = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.prefijo} ({self.numero_inicial} - {self.numero_final})"

class Factura(models.Model):
    ESTADOS = (
        ('borrador', 'Borrador'),
        ('enviada', 'Enviada DIAN'),
        ('validada', 'Validada DIAN'),
        ('rechazada', 'Rechazada DIAN')
    )
    
    numero_factura = models.CharField(max_length=20, unique=True, blank=True, null=True)
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, related_name='facturas')
    fecha_emision = models.DateTimeField(auto_now_add=True)
    fecha_vencimiento = models.DateField()
    estado_dian = models.CharField(max_length=20, choices=ESTADOS, default='borrador')
    
    # DIAN 
    cufe = models.CharField(max_length=100, blank=True, null=True)
    qr_code = models.TextField(blank=True, null=True)

    # Totales
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    iva_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    retefuente_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    reteica_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    observaciones = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.numero_factura or f"Borrador {self.id}"

class DetalleFactura(models.Model):
    factura = models.ForeignKey(Factura, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.IntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=15, decimal_places=2)
    subtotal = models.DecimalField(max_digits=15, decimal_places=2)
    porcentaje_iva = models.DecimalField(max_digits=5, decimal_places=2, default=19.00)

    def save(self, *args, **kwargs):
        self.subtotal = self.cantidad * self.precio_unitario
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.factura} - {self.producto.nombre}"
