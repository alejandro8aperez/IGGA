from django.db import models
from inventarios.models import Producto

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

class DetalleOrdenCompra(models.Model):
    orden = models.ForeignKey(OrdenCompra, related_name='detalles', on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.cantidad}x {self.producto.nombre} (OC-{self.orden.id})"
