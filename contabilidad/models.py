from django.db import models

class Cuenta(models.Model):
    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=200)
    tipo = models.CharField(max_length=50, choices=[
        ('activo', 'Activo'),
        ('pasivo', 'Pasivo'),
        ('patrimonio', 'Patrimonio'),
        ('ingreso', 'Ingreso'),
        ('gasto', 'Gasto'),
    ])
    nivel = models.IntegerField(default=1)
    padre = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

class AsientoContable(models.Model):
    fecha = models.DateField()
    descripcion = models.CharField(max_length=500)
    referencia = models.CharField(max_length=100, blank=True)
    total_debe = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_haber = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"Asiento {self.id} - {self.fecha}"

class MovimientoContable(models.Model):
    asiento = models.ForeignKey(AsientoContable, related_name='movimientos', on_delete=models.CASCADE)
    cuenta = models.ForeignKey(Cuenta, on_delete=models.CASCADE)
    debe = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    haber = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    descripcion = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.cuenta.nombre} - Debe: {self.debe}, Haber: {self.haber}"
