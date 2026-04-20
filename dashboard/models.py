from django.db import models

class Metrica(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    tipo = models.CharField(max_length=50, choices=[
        ('ventas', 'Ventas'),
        ('compras', 'Compras'),
        ('inventario', 'Inventario'),
        ('finanzas', 'Finanzas'),
        ('proyectos', 'Proyectos'),
        ('rrhh', 'RRHH')
    ])
    valor = models.DecimalField(max_digits=15, decimal_places=2)
    fecha = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre}: {self.valor}"
