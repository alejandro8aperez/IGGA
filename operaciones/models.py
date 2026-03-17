from django.db import models
from crm.models import Cliente

class Proyecto(models.Model):
    nombre = models.CharField(max_length=200)
    cliente = models.ForeignKey(Cliente, on_delete=models.SET_NULL, null=True, blank=True)
    descripcion = models.TextField(blank=True)
    fecha_inicio = models.DateField()
    fecha_fin_estimada = models.DateField()
    estado = models.CharField(max_length=20, choices=[
        ('planificacion', 'En Planificación'),
        ('ejecucion', 'En Ejecución'),
        ('pausado', 'Pausado'),
        ('completado', 'Completado'),
    ], default='planificacion')
    presupuesto = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return self.nombre

class Tarea(models.Model):
    proyecto = models.ForeignKey(Proyecto, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    estado = models.CharField(max_length=20, choices=[
        ('pendiente', 'Pendiente'),
        ('en_progreso', 'En Progreso'),
        ('completada', 'Completada'),
    ], default='pendiente')
    # Asignado_a (ForeignKey a User se añadirá en el futuro)
    
    def __str__(self):
        return f"{self.titulo} - {self.proyecto.nombre}"
