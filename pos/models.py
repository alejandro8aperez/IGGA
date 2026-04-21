from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from facturacion.models import Factura

class SesionCaja(models.Model):
    ESTADOS = (
        ('abierta', 'Abierta'),
        ('cerrada', 'Cerrada'),
    )
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    fecha_apertura = models.DateTimeField(default=timezone.now)
    fecha_cierre = models.DateTimeField(null=True, blank=True)
    monto_inicial = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    monto_final_contado = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    monto_final_sistema = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    estado = models.CharField(max_length=10, choices=ESTADOS, default='abierta')
    notas = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Caja {self.id} - {self.fecha_apertura.date()}"

class VentaPOS(models.Model):
    # Relacionamos cada venta del POS con una Factura electrónica
    factura = models.OneToOneField(Factura, on_delete=models.CASCADE, related_name='venta_pos')
    sesion_caja = models.ForeignKey(SesionCaja, on_delete=models.CASCADE, related_name='ventas')
    metodo_pago = models.CharField(max_length=20, choices=[
        ('efectivo', 'Efectivo'),
        ('tarjeta', 'Tarjeta'),
        ('transferencia', 'Transferencia/Billetera Digital'),
    ], default='efectivo')
    monto_recibido = models.DecimalField(max_digits=15, decimal_places=2)
    cambio = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    def __str__(self):
        return f"Venta POS {self.factura.numero_factura}"
