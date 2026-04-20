from django.db import models
from crm.models import Cliente
from inventarios.models import Producto

class Vehiculo(models.Model):
    placa = models.CharField(max_length=20, unique=True)
    modelo = models.CharField(max_length=100)
    capacidad = models.DecimalField(max_digits=8, decimal_places=2)  # en kg o m3
    estado = models.CharField(max_length=20, choices=[
        ('disponible', 'Disponible'),
        ('en_ruta', 'En Ruta'),
        ('mantenimiento', 'En Mantenimiento'),
        ('fuera_servicio', 'Fuera de Servicio')
    ], default='disponible')

    def __str__(self):
        return f"{self.placa} - {self.modelo}"

class Ruta(models.Model):
    nombre = models.CharField(max_length=200)
    origen = models.CharField(max_length=200)
    destino = models.CharField(max_length=200)
    distancia_km = models.DecimalField(max_digits=8, decimal_places=2)
    tiempo_estimado_horas = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"{self.nombre}: {self.origen} -> {self.destino}"

class Envio(models.Model):
    numero_envio = models.CharField(max_length=50, unique=True)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    vehiculo = models.ForeignKey(Vehiculo, on_delete=models.SET_NULL, null=True, blank=True)
    ruta = models.ForeignKey(Ruta, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_envio = models.DateTimeField(auto_now_add=True)
    fecha_entrega_estimada = models.DateTimeField(null=True, blank=True)
    fecha_entrega_real = models.DateTimeField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=[
        ('preparando', 'Preparando'),
        ('en_transito', 'En Tránsito'),
        ('entregado', 'Entregado'),
        ('retrasado', 'Retrasado'),
        ('cancelado', 'Cancelado')
    ], default='preparando')
    peso_total = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    costo_envio = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"Envío {self.numero_envio} - {self.cliente.nombre}"

class DetalleEnvio(models.Model):
    envio = models.ForeignKey(Envio, related_name='detalles', on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.IntegerField()
    peso_unitario = models.DecimalField(max_digits=6, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.cantidad}x {self.producto.nombre} (Envío {self.envio.numero_envio})"
