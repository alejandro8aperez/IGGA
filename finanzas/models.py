from django.db import models

class Cuenta(models.Model):
    nombre = models.CharField(max_length=100)
    codigo = models.CharField(max_length=50, unique=True)
    tipo = models.CharField(max_length=20, choices=[
        ('activo', 'Activo'),
        ('pasivo', 'Pasivo'),
        ('patrimonio', 'Patrimonio'),
        ('ingreso', 'Ingreso'),
        ('gasto', 'Gasto'),
    ])
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

class Transaccion(models.Model):
    cuenta = models.ForeignKey(Cuenta, on_delete=models.CASCADE)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    tipo = models.CharField(max_length=10, choices=[('debito', 'Débito'), ('credito', 'Crédito')])
    fecha = models.DateField(auto_now_add=True)
    descripcion = models.TextField(blank=True)

    def __str__(self):
        return f"{self.tipo} de {self.monto} en {self.cuenta.nombre}"

class ActivoFijo(models.Model):
    codigo = models.CharField(max_length=50, unique=True)
    descripcion = models.CharField(max_length=200)
    valor_adquisicion = models.DecimalField(max_digits=14, decimal_places=2)
    vida_util_meses = models.PositiveIntegerField(default=60)
    fecha_adquisicion = models.DateField()
    depreciacion_acumulada = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    estado = models.CharField(max_length=20, choices=[
        ('activo', 'Activo'),
        ('en_mantenimiento', 'En mantenimiento'),
        ('baja', 'Baja'),
    ], default='activo')

    def valor_neto(self):
        return max(self.valor_adquisicion - self.depreciacion_acumulada, 0)

    def __str__(self):
        return f"{self.codigo} - {self.descripcion}"
