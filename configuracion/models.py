from django.db import models

class Empresa(models.Model):
    nombre = models.CharField(max_length=200)
    ruc = models.CharField(max_length=50, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    telefono = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    moneda_base = models.CharField(max_length=10, default='USD')
    sitio_web = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.nombre

class Departamento(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre
