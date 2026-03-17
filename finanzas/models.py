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
