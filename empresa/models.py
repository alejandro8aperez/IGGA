from django.db import models

class Empresa(models.Model):
    nombre = models.CharField(max_length=200)
    nit = models.CharField(max_length=20, unique=True)
    direccion = models.TextField()
    telefono = models.CharField(max_length=20)
    email = models.EmailField()
    logo = models.ImageField(upload_to='logos/', null=True, blank=True)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre
