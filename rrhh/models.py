from django.db import models

class Empleado(models.Model):
    nombre = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    documento_identidad = models.CharField(max_length=50, unique=True)
    email = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20, blank=True)
    fecha_contratacion = models.DateField()
    cargo = models.CharField(max_length=100)
    salario_base = models.DecimalField(max_digits=10, decimal_places=2)
    departamento = models.CharField(max_length=100)
    estado = models.CharField(max_length=20, choices=[
        ('activo', 'Activo'),
        ('vacaciones', 'En Vacaciones'),
        ('incapacidad', 'Incapacidad'),
        ('inactivo', 'Inactivo')
    ], default='activo')

    def __str__(self):
        return f"{self.nombre} {self.apellidos} - {self.cargo}"

class Asistencia(models.Model):
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE)
    fecha = models.DateField()
    hora_entrada = models.TimeField()
    hora_salida = models.TimeField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=[
        ('presente', 'Presente'),
        ('ausente', 'Ausente'),
        ('retraso', 'Retraso'),
    ], default='presente')

    def __str__(self):
        return f"{self.empleado.nombre} - {self.fecha}"
