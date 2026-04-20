from django.db import models

class PlanEstratégico(models.Model):
    codigo = models.CharField(max_length=80, unique=True)
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=[
        ('borrador', 'Borrador'),
        ('activo', 'Activo'),
        ('completado', 'Completado'),
        ('cancelado', 'Cancelado'),
    ], default='borrador')

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

    def duracion_dias(self):
        if self.fecha_fin and self.fecha_inicio:
            return (self.fecha_fin - self.fecha_inicio).days
        return None

class Objetivo(models.Model):
    plan = models.ForeignKey(PlanEstratégico, on_delete=models.CASCADE, related_name='objetivos')
    descripcion = models.CharField(max_length=250)
    indicador = models.CharField(max_length=120, blank=True)
    meta = models.CharField(max_length=120, blank=True)
    peso = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    estado = models.CharField(max_length=20, choices=[
        ('pendiente', 'Pendiente'),
        ('en_progreso', 'En progreso'),
        ('alcanzado', 'Alcanzado'),
    ], default='pendiente')

    def __str__(self):
        return f"{self.plan.codigo} - {self.descripcion[:40]}"

