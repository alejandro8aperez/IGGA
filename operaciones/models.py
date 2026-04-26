from django.db import models
from crm.models import Cliente
from django.contrib.auth.models import User

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


class InformeDiarioProy(models.Model):
    """Informe Diario de Obra - Interventoría (Formato F-141-IN)"""
    
    # Metadatos
    obra = models.CharField(max_length=200, default='Ampliación SE LA LOMA 500 kV')
    fecha = models.DateField(auto_now_add=True)
    codigo_formato = models.CharField(max_length=20, default='F-141-IN')
    version = models.CharField(max_length=10, default='1')
    mod = models.CharField(max_length=10, default='00')
    
    # Reporte de Clima
    lluvia = models.CharField(max_length=5, choices=[('SI', 'SI'), ('NO', 'NO')], default='NO')
    he_lluvia = models.IntegerField(default=0, help_text='Horas de lluvia')
    
    # Maquinaria y Equipos (JSON field para cantidades)
    maquinaria = models.JSONField(default=dict, blank=True)
    
    # Personal de Obra (JSON field para cantidades)
    personal = models.JSONField(default=dict, blank=True)
    
    # Actividades (Texto libre)
    act_administrativas = models.TextField(blank=True)
    act_tecnicas_cableado = models.TextField(blank=True)
    act_montaje_pruebas = models.TextField(blank=True)
    act_obra_civil = models.TextField(blank=True)
    act_sst = models.TextField(blank=True)
    act_ambiental = models.TextField(blank=True)
    
    # Firmas
    elaborado_por = models.CharField(max_length=200, blank=True)
    revisado_por = models.CharField(max_length=200, blank=True)
    aprobado_por = models.CharField(max_length=200, blank=True)
    
    # Timestamps
    creado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='informes_creados')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Informe {self.fecha} - {self.obra}"
    
    class Meta:
        verbose_name = 'Informe Diario de Proyecto'
        verbose_name_plural = 'Informes Diarios de Proyecto'
        ordering = ['-fecha', '-fecha_creacion']
