from django.db import models

class Cliente(models.Model):
    nombre = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    cedula = models.CharField(max_length=20, unique=True, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True)
    direccion = models.TextField(blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre

class Oportunidad(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=200)
    valor_estimado = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=20, choices=[
        ('nueva', 'Nueva'),
        ('negociacion', 'En Negociación'),
        ('ganada', 'Ganada'),
        ('perdida', 'Perdida')
    ], default='nueva')
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.titulo} - {self.cliente.nombre}"
