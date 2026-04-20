from django.db import models
from django.contrib.auth.models import User

class SolicitudAprobacion(models.Model):
    TIPOS_CHOICES = [
        ('orden_compra', 'Orden de Compra'),
        ('orden_venta', 'Orden de Venta'),
        ('gasto', 'Gasto'),
        ('presupuesto', 'Presupuesto'),
    ]
    
    tipo = models.CharField(max_length=20, choices=TIPOS_CHOICES)
    objeto_id = models.PositiveIntegerField()  # ID del objeto a aprobar
    solicitante = models.ForeignKey(User, on_delete=models.CASCADE, related_name='solicitudes')
    aprobador = models.ForeignKey(User, on_delete=models.CASCADE, related_name='aprobaciones_pendientes')
    estado = models.CharField(max_length=20, choices=[
        ('pendiente', 'Pendiente'),
        ('aprobada', 'Aprobada'),
        ('rechazada', 'Rechazada'),
        ('cancelada', 'Cancelada')
    ], default='pendiente')
    comentario_solicitante = models.TextField(blank=True)
    comentario_aprobador = models.TextField(blank=True)
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    fecha_respuesta = models.DateTimeField(null=True, blank=True)
    monto = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.tipo} - {self.solicitante.username} -> {self.aprobador.username}"
