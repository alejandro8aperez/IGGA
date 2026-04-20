from django.db import models
from django.contrib.auth.models import User

class Equipo(models.Model):
    codigo = models.CharField(max_length=80, unique=True)
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    ubicacion = models.CharField(max_length=200, blank=True)
    tipo = models.CharField(max_length=100, blank=True)
    fecha_instalacion = models.DateField(null=True, blank=True)
    proveedor = models.CharField(max_length=200, blank=True)
    estado = models.CharField(max_length=20, choices=[
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
        ('mantenimiento', 'En Mantenimiento'),
    ], default='activo')

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

class OrdenMantenimiento(models.Model):
    numero = models.CharField(max_length=50, unique=True)
    equipo = models.ForeignKey(Equipo, on_delete=models.CASCADE, related_name='ordenes_mantenimiento')
    tipo = models.CharField(max_length=20, choices=[
        ('preventivo', 'Preventivo'),
        ('correctivo', 'Correctivo'),
        ('inspección', 'Inspección'),
    ], default='preventivo')
    descripcion = models.TextField(blank=True)
    técnico_asignado = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='ordenes_mantenimiento')
    fecha_creación = models.DateField(auto_now_add=True)
    fecha_programada = models.DateField()
    fecha_ejecución = models.DateField(null=True, blank=True)
    horas_estimadas = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    horas_reales = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    costo_estimado = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    costo_real = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    estado = models.CharField(max_length=20, choices=[
        ('planificada', 'Planificada'),
        ('en_ejecución', 'En ejecución'),
        ('completada', 'Completada'),
        ('cancelada', 'Cancelada'),
    ], default='planificada')
    prioridad = models.CharField(max_length=20, choices=[
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
        ('crítica', 'Crítica'),
    ], default='media')

    def __str__(self):
        return f"{self.numero} - {self.equipo.nombre}"

class Repuesto(models.Model):
    codigo = models.CharField(max_length=80, unique=True)
    descripcion = models.CharField(max_length=200)
    equipo = models.ForeignKey(Equipo, on_delete=models.CASCADE, related_name='repuestos')
    cantidad_disponible = models.IntegerField(default=0)
    cantidad_mínima = models.IntegerField(default=1)
    costo_unitario = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    def __str__(self):
        return f"{self.codigo} - {self.descripcion}"

class DetalleMantenimiento(models.Model):
    orden = models.ForeignKey(OrdenMantenimiento, on_delete=models.CASCADE, related_name='detalles')
    descripción_trabajo = models.CharField(max_length=255)
    repuesto = models.ForeignKey(Repuesto, on_delete=models.SET_NULL, null=True, blank=True)
    cantidad_usada = models.IntegerField(default=1)
    
    def __str__(self):
        return f"Detalle {self.id} - Orden {self.orden.numero}"


class CostoMantenimiento(models.Model):
    orden = models.OneToOneField(OrdenMantenimiento, on_delete=models.CASCADE, related_name='costo')
    equipo = models.ForeignKey(Equipo, on_delete=models.CASCADE)
    costo_mano_obra = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    costo_repuestos = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    costo_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    observaciones = models.TextField(blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Costo Mantenimiento OC-{self.orden.numero} - {self.costo_total}"
