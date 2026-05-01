from django.db import models
from django.utils import timezone
from inventarios.models import Producto, MovimientoInventario

# ═══════════════════════════════════════════════════════
# RECETA (Lista de materiales simple y Costos fijos)
# ═══════════════════════════════════════════════════════

class Receta(models.Model):
    """Fórmula de manufactura y configuración de costos de un producto"""
    producto_terminado = models.OneToOneField(
        Producto, on_delete=models.CASCADE,
        related_name='receta', verbose_name="Producto Terminado"
    )
    tiempo_estimado_horas = models.DecimalField(
        max_digits=8, decimal_places=2, default=0,
        verbose_name="Tiempo estimado (horas)"
    )
    costo_adicional_fijo = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name="Costo fijo adicional",
        help_text="Costos indirectos de fabricación fijos por unidad"
    )
    instrucciones = models.TextField(blank=True, verbose_name="Instrucciones de producción")
    instructivos_sgc = models.ManyToManyField(
        'calidad.DocumentoISO', blank=True,
        limit_choices_to={'categoria': '3_instructivo'},
        verbose_name="Instructivos SGC (ISO 9001)"
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Receta de Producción"
        verbose_name_plural = "Recetas de Producción"

    def __str__(self):
        return f"Receta de {self.producto_terminado.nombre}"


class InsumoReceta(models.Model):
    """Ingredientes o componentes de la receta"""
    receta = models.ForeignKey(
        Receta, on_delete=models.CASCADE, related_name='insumos'
    )
    producto_materia_prima = models.ForeignKey(
        Producto, on_delete=models.RESTRICT,
        limit_choices_to={'tipo_producto__in': ['materia_prima', 'insumo', 'empaque']},
        verbose_name="Materia Prima / Insumo"
    )
    cantidad_requerida = models.DecimalField(
        max_digits=12, decimal_places=4, verbose_name="Cantidad requerida base"
    )
    merma_esperada_pct = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Merma esperada (%)",
        help_text="Porcentaje adicional que normalmente se pierde"
    )

    class Meta:
        verbose_name = "Insumo de Receta"
        verbose_name_plural = "Insumos de Receta"
        unique_together = ['receta', 'producto_materia_prima']

    def __str__(self):
        return f"{self.cantidad_requerida} x {self.producto_materia_prima.nombre}"


# ═══════════════════════════════════════════════════════
# ORDEN DE PRODUCCIÓN
# ═══════════════════════════════════════════════════════

class OrdenProduccion(models.Model):
    ESTADOS = [
        ('borrador', 'Borrador'),
        ('planeada', 'Planeada (Lista para iniciar)'),
        ('en_proceso', 'En Proceso'),
        ('pausada', 'Pausada'),
        ('terminada', 'Terminada'),
        ('cancelada', 'Cancelada'),
    ]

    PRIORIDAD_CHOICES = [
        ('baja', 'Baja'),
        ('normal', 'Normal'),
        ('alta', 'Alta'),
        ('urgente', 'Urgente'),
    ]

    numero = models.CharField(max_length=30, unique=True, blank=True, verbose_name="Número de OP")
    receta = models.ForeignKey(Receta, on_delete=models.RESTRICT, verbose_name="Receta a producir")
    cantidad_a_producir = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Cantidad a producir")
    cantidad_producida = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Cantidad real producida")
    
    prioridad = models.CharField(max_length=10, choices=PRIORIDAD_CHOICES, default='normal')
    estado = models.CharField(max_length=20, choices=ESTADOS, default='borrador')
    
    fecha_planeada_inicio = models.DateField(verbose_name="Fecha planeada de inicio")
    fecha_planeada_fin = models.DateField(blank=True, null=True, verbose_name="Fecha planeada de fin")
    fecha_inicio_real = models.DateTimeField(blank=True, null=True, verbose_name="Inicio real")
    fecha_fin_real = models.DateTimeField(blank=True, null=True, verbose_name="Fin real")
    
    responsable = models.CharField(max_length=100, blank=True, verbose_name="Responsable de la OP")
    observaciones = models.TextField(blank=True, null=True)
    notas_calidad = models.TextField(blank=True, help_text="Anotaciones de inspección final")
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Orden de Producción"
        verbose_name_plural = "Órdenes de Producción"
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f"OP-{self.numero or self.id} ({self.get_estado_display()})"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new and not self.numero:
            self.numero = f"{self.id:06d}"
            type(self).objects.filter(pk=self.pk).update(numero=self.numero)


# ═══════════════════════════════════════════════════════
# CONTROL DE FASES Y TIEMPOS
# ═══════════════════════════════════════════════════════

class FaseOrdenProduccion(models.Model):
    ESTADOS_FASE = [
        ('pendiente', 'Pendiente'),
        ('en_proceso', 'En Proceso'),
        ('terminada', 'Terminada'),
    ]

    orden = models.ForeignKey(OrdenProduccion, on_delete=models.CASCADE, related_name='fases')
    nombre_fase = models.CharField(max_length=100, verbose_name="Nombre de la fase (ej: Bobinado)")
    secuencia = models.PositiveIntegerField(default=1)
    estado = models.CharField(max_length=20, choices=ESTADOS_FASE, default='pendiente')
    
    operario = models.CharField(max_length=100, blank=True, verbose_name="Operario asignado")
    horas_estimadas = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    horas_reales = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    
    inicio_fase = models.DateTimeField(blank=True, null=True)
    fin_fase = models.DateTimeField(blank=True, null=True)
    notas = models.TextField(blank=True)

    class Meta:
        verbose_name = "Fase de Orden"
        verbose_name_plural = "Fases de Orden"
        ordering = ['orden', 'secuencia']

    def __str__(self):
        return f"OP-{self.orden.numero} | Fase {self.secuencia}: {self.nombre_fase}"


# ═══════════════════════════════════════════════════════
# CONSUMOS Y MERMAS REALES
# ═══════════════════════════════════════════════════════

class ConsumoProduccion(models.Model):
    """Registro de materiales realmente consumidos en la orden"""
    orden = models.ForeignKey(OrdenProduccion, on_delete=models.CASCADE, related_name='consumos')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad_consumida = models.DecimalField(max_digits=12, decimal_places=4)
    fecha_consumo = models.DateTimeField(default=timezone.now)
    registrado_por = models.CharField(max_length=100, blank=True)
    movimiento_inventario = models.OneToOneField(
        MovimientoInventario, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='consumo_produccion'
    )

    class Meta:
        verbose_name = "Consumo de Producción"
        verbose_name_plural = "Consumos de Producción"

    def __str__(self):
        return f"Consumo de {self.cantidad_consumida} {self.producto.nombre} en OP-{self.orden.numero}"


class MermaProduccion(models.Model):
    """Registro de desperdicios o material dañado durante la producción"""
    orden = models.ForeignKey(OrdenProduccion, on_delete=models.CASCADE, related_name='mermas')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.DecimalField(max_digits=10, decimal_places=4)
    motivo = models.CharField(max_length=200, verbose_name="Motivo de la merma")
    es_recuperable = models.BooleanField(default=False, verbose_name="¿Es reciclable/recuperable?")
    fecha_registro = models.DateTimeField(default=timezone.now)
    movimiento_inventario = models.OneToOneField(
        MovimientoInventario, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='merma_produccion'
    )

    class Meta:
        verbose_name = "Merma de Producción"
        verbose_name_plural = "Mermas de Producción"

    def __str__(self):
        return f"Merma de {self.cantidad} {self.producto.nombre} en OP-{self.orden.numero}"


# ═══════════════════════════════════════════════════════
# COSTOS REALES
# ═══════════════════════════════════════════════════════

class CostoProduccion(models.Model):
    """Costos calculados automáticamente al finalizar la OP"""
    orden = models.OneToOneField(OrdenProduccion, on_delete=models.CASCADE, related_name='costo')
    costo_materias_primas = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    costo_mermas = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    costo_mano_obra = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    costo_indirecto = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    costo_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    costo_unitario_real = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Costo de Producción"
        verbose_name_plural = "Costos de Producción"

    def __str__(self):
        return f"Costos OP-{self.orden.numero} | Total ${self.costo_total}"
