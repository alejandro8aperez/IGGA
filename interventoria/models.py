from django.db import models
from django.contrib.auth.models import User

class ContratoInterventoria(models.Model):
    codigo = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    presupuesto = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    interventor_encargado = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='contratos_interventoria')
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

class VisitaInterventoria(models.Model):
    contrato = models.ForeignKey(ContratoInterventoria, on_delete=models.CASCADE, related_name='visitas')
    fecha = models.DateTimeField()
    ubicacion = models.CharField(max_length=255)
    observaciones = models.TextField()
    registrado_por = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"Visita {self.fecha.date()} - {self.contrato.codigo}"

class Hallazgo(models.Model):
    NIVEL_CHOICES = (
        ('bajo', 'Bajo'),
        ('medio', 'Medio'),
        ('alto', 'Alto'),
        ('critico', 'Crítico'),
    )
    visita = models.ForeignKey(VisitaInterventoria, on_delete=models.CASCADE, related_name='hallazgos')
    descripcion = models.TextField()
    nivel_riesgo = models.CharField(max_length=10, choices=NIVEL_CHOICES, default='bajo')
    plan_accion = models.TextField(blank=True)
    cerrado = models.BooleanField(default=False)
    fecha_cierre = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Hallazgo {self.id} ({self.nivel_riesgo})"