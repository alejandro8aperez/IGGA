from django.db import models
from crm.models import Cliente

class Segmento(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    criterios = models.JSONField(default=dict)  # e.g., {'ubicacion': 'Bogota', 'sector': 'Tecnologia'}

    def __str__(self):
        return self.nombre

class Campana(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    segmento = models.ForeignKey(Segmento, on_delete=models.CASCADE)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    presupuesto = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    estado = models.CharField(max_length=20, choices=[
        ('planificada', 'Planificada'),
        ('activa', 'Activa'),
        ('pausada', 'Pausada'),
        ('finalizada', 'Finalizada')
    ], default='planificada')
    canales = models.JSONField(default=list)  # e.g., ['email', 'redes_sociales', 'publicidad']

    def __str__(self):
        return self.nombre

class Lead(models.Model):
    nombre = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20, blank=True)
    empresa = models.CharField(max_length=200, blank=True)
    fuente = models.CharField(max_length=50, choices=[
        ('campana', 'Campaña'),
        ('referido', 'Referido'),
        ('web', 'Sitio Web'),
        ('redes_sociales', 'Redes Sociales'),
        ('otro', 'Otro')
    ], default='otro')
    campana = models.ForeignKey(Campana, on_delete=models.SET_NULL, null=True, blank=True)
    estado = models.CharField(max_length=20, choices=[
        ('nuevo', 'Nuevo'),
        ('contactado', 'Contactado'),
        ('calificado', 'Calificado'),
        ('propuesta', 'Propuesta Enviada'),
        ('ganado', 'Ganado'),
        ('perdido', 'Perdido')
    ], default='nuevo')
    puntuacion = models.IntegerField(default=0)  # Lead scoring
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} - {self.estado}"
