from django.db import models
from inventarios.models import Producto

class Receta(models.Model):
    producto_terminado = models.OneToOneField(Producto, on_delete=models.CASCADE, related_name='receta')
    tiempo_estimado_horas = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    costo_adicional_fijo = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    instrucciones = models.TextField(blank=True, null=True)
    instructivos_sgc = models.ManyToManyField('calidad.DocumentoISO', blank=True,
                                              limit_choices_to={'categoria': '3_instructivo'},
                                              verbose_name="Instructivos SGC (ISO 9001)")
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Receta de: {self.producto_terminado.nombre}"


class InsumoReceta(models.Model):
    receta = models.ForeignKey(Receta, on_delete=models.CASCADE, related_name='insumos')
    producto_materia_prima = models.ForeignKey(Producto, on_delete=models.RESTRICT)
    cantidad_requerida = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.cantidad_requerida} x {self.producto_materia_prima.nombre} para {self.receta.producto_terminado.nombre}"


class OrdenProduccion(models.Model):
    ESTADOS = [
        ('planeada', 'Planeada'),
        ('en_proceso', 'En Proceso'),
        ('terminada', 'Terminada'),
        ('cancelada', 'Cancelada'),
    ]

    receta = models.ForeignKey(Receta, on_delete=models.RESTRICT)
    cantidad_a_producir = models.IntegerField(default=1)
    fecha_inicio = models.DateField()
    fecha_fin_estimada = models.DateField(blank=True, null=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='planeada')
    observaciones = models.TextField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Orden #{self.id} - {self.cantidad_a_producir}x {self.receta.producto_terminado.nombre} ({self.get_estado_display()})"


class CostoProduccion(models.Model):
    orden = models.OneToOneField(OrdenProduccion, on_delete=models.CASCADE, related_name='costo')
    costo_materias_primas = models.DecimalField(max_digits=14, decimal_places=2)
    costo_mano_obra = models.DecimalField(max_digits=14, decimal_places=2)
    costo_indirecto = models.DecimalField(max_digits=14, decimal_places=2)
    costo_total = models.DecimalField(max_digits=14, decimal_places=2)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Costo Prod OC-{self.orden.id} | Total ${self.costo_total}"
