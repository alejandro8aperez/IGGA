from django.db import models

class KPI(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    valor = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    fecha_calculo = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nombre}: {self.valor}"


class Forecast(models.Model):
    tipo = models.CharField(max_length=50, choices=[('ventas', 'Ventas')], default='ventas')
    periodo = models.DateField()
    valor = models.DecimalField(max_digits=14, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('tipo', 'periodo')

    def __str__(self):
        return f"Pronóstico {self.tipo} {self.periodo}: {self.valor}"
