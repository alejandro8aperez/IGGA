from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone


class UnidadMedida(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    abreviatura = models.CharField(max_length=10, blank=True)

    class Meta:
        verbose_name = "Unidad de Medida"
        verbose_name_plural = "Unidades de Medida"

    def __str__(self):
        return self.nombre


class Categoria(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)

    class Meta:
        db_table = 'inventarios_categoriaproducto'
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"

    def __str__(self):
        return self.nombre


class Almacen(models.Model):
    """Almacenes o bodegas de la empresa"""
    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=100)
    direccion = models.TextField(blank=True)
    responsable = models.CharField(max_length=100, blank=True)
    es_principal = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Almacén"
        verbose_name_plural = "Almacenes"
        ordering = ['-es_principal', 'nombre']

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"


class Producto(models.Model):
    TIPO_PRODUCTO_CHOICES = [
        ('materia_prima', 'Materia Prima'),
        ('producto_terminado', 'Producto Terminado'),
        ('semielaborado', 'Semielaborado'),
        ('insumo', 'Insumo / Consumible'),
        ('servicio', 'Servicio'),
        ('empaque', 'Empaque / Embalaje'),
    ]

    UNIDAD_MEDIDA_CHOICES = [
        ('UN', 'Unidad'),
        ('KG', 'Kilogramo'),
        ('G', 'Gramo'),
        ('LB', 'Libra'),
        ('LT', 'Litro'),
        ('ML', 'Mililitro'),
        ('MT', 'Metro'),
        ('CM', 'Centímetro'),
        ('M2', 'Metro cuadrado'),
        ('M3', 'Metro cúbico'),
        ('GL', 'Galón'),
        ('ROL', 'Rollo'),
        ('PAQ', 'Paquete'),
        ('CJ', 'Caja'),
        ('PLG', 'Pulgada'),
    ]

    # Información básica (campos originales preservados)
    nombre = models.CharField(max_length=200)
    codigo_sku = models.CharField(max_length=50, unique=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, related_name='productos')
    precio_venta = models.DecimalField(max_digits=10, decimal_places=2)
    precio_compra = models.DecimalField(max_digits=10, decimal_places=2)
    stock_actual = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    stock_minimo = models.DecimalField(max_digits=12, decimal_places=2, default=5)
    imagen = models.ImageField(upload_to='productos/', null=True, blank=True)

    # Campos nuevos: Clasificación
    tipo_producto = models.CharField(
        max_length=20, choices=TIPO_PRODUCTO_CHOICES,
        default='producto_terminado', verbose_name="Tipo de producto"
    )
    unidad_medida = models.CharField(
        max_length=50,
        default='Unidad', verbose_name="Unidad de medida"
    )
    descripcion = models.TextField(blank=True, verbose_name="Descripción")
    marca = models.CharField(max_length=100, blank=True, verbose_name="Marca")
    referencia_fabrica = models.CharField(max_length=100, blank=True, verbose_name="Referencia de fábrica")

    # Campos nuevos: Inventario avanzado
    stock_maximo = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        verbose_name="Stock máximo"
    )
    punto_reorden = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        verbose_name="Punto de reorden",
        help_text="Cantidad en la que se debe generar una nueva orden de compra"
    )
    almacen = models.ForeignKey(
        Almacen, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='productos', verbose_name="Almacén principal"
    )
    ubicacion_almacen = models.CharField(
        max_length=50, blank=True,
        verbose_name="Ubicación (rack/pasillo)",
        help_text="Ej: Pasillo A, Rack 3, Nivel 2"
    )

    # Campos nuevos: Físicos
    peso_unitario_kg = models.DecimalField(
        max_digits=10, decimal_places=4, null=True, blank=True,
        verbose_name="Peso unitario (kg)"
    )

    # Campos nuevos: Perecederos / Trazabilidad
    es_perecedero = models.BooleanField(default=False, verbose_name="¿Es perecedero?")
    dias_vida_util = models.PositiveIntegerField(
        null=True, blank=True,
        verbose_name="Días de vida útil",
        help_text="Para productos perecederos (ej: panadería)"
    )
    requiere_lote = models.BooleanField(
        default=False, verbose_name="¿Requiere control de lote?"
    )

    # Campos nuevos: Estado
    activo = models.BooleanField(default=True, verbose_name="Activo")
    notas = models.TextField(blank=True, verbose_name="Notas internas")

    # Auditoría
    fecha_creacion = models.DateTimeField(auto_now_add=True, null=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        ordering = ['nombre']

    def __str__(self):
        return f"[{self.codigo_sku}] {self.nombre}"

    @property
    def stock_bajo(self):
        """Indica si el stock está por debajo del mínimo"""
        return self.stock_actual < self.stock_minimo

    @property
    def necesita_reorden(self):
        """Indica si se alcanzó el punto de reorden"""
        if self.punto_reorden is not None:
            return self.stock_actual <= self.punto_reorden
        return self.stock_bajo

    @property
    def valor_inventario(self):
        """Valor total del stock actual a precio de compra"""
        return self.stock_actual * self.precio_compra

    @property
    def margen_utilidad(self):
        """Margen de utilidad porcentual"""
        if self.precio_compra and self.precio_compra > 0:
            return round(((self.precio_venta - self.precio_compra) / self.precio_compra) * 100, 2)
        return 0


class Lote(models.Model):
    """Lotes de productos para trazabilidad"""
    ESTADO_CHOICES = [
        ('disponible', 'Disponible'),
        ('cuarentena', 'En cuarentena'),
        ('vencido', 'Vencido'),
        ('agotado', 'Agotado'),
    ]

    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='lotes')
    numero_lote = models.CharField(max_length=50, unique=True, verbose_name="Número de lote")
    fecha_fabricacion = models.DateField(null=True, blank=True, verbose_name="Fecha de fabricación")
    fecha_vencimiento = models.DateField(null=True, blank=True, verbose_name="Fecha de vencimiento")
    cantidad_inicial = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Cantidad inicial")
    cantidad_disponible = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Cantidad disponible")
    proveedor_origen = models.CharField(max_length=200, blank=True, verbose_name="Proveedor de origen")
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='disponible')
    notas = models.TextField(blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Lote"
        verbose_name_plural = "Lotes"
        ordering = ['fecha_vencimiento', 'numero_lote']

    def __str__(self):
        return f"Lote {self.numero_lote} - {self.producto.nombre}"

    @property
    def esta_vencido(self):
        if self.fecha_vencimiento:
            return self.fecha_vencimiento < timezone.now().date()
        return False

    @property
    def dias_para_vencer(self):
        if self.fecha_vencimiento:
            delta = self.fecha_vencimiento - timezone.now().date()
            return delta.days
        return None


class MovimientoInventario(models.Model):
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
        ('ajuste_positivo', 'Ajuste Positivo'),
        ('ajuste_negativo', 'Ajuste Negativo'),
        ('transferencia_entrada', 'Transferencia Entrada'),
        ('transferencia_salida', 'Transferencia Salida'),
        ('devolucion', 'Devolución'),
        ('merma', 'Merma / Desperdicio'),
        ('produccion', 'Salida por Producción'),
        ('producto_terminado', 'Entrada por Producción'),
    ]

    ORIGEN_CHOICES = [
        ('manual', 'Manual'),
        ('compra', 'Orden de Compra'),
        ('venta', 'Venta / POS'),
        ('produccion', 'Orden de Producción'),
        ('ajuste', 'Ajuste de Inventario'),
        ('transferencia', 'Transferencia entre Almacenes'),
        ('devolucion', 'Devolución'),
        ('mrp', 'MRP'),
    ]

    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='movimientos')
    cantidad = models.DecimalField(max_digits=12, decimal_places=2)
    tipo = models.CharField(max_length=25, choices=TIPO_CHOICES)
    fecha = models.DateTimeField(auto_now_add=True)
    motivo = models.CharField(max_length=200, blank=True, default='')

    # ─── CAMPO AGREGADO ─────────────────────────────────────────────────────────
    descripcion = models.TextField(
        blank=True,
        default='',
        verbose_name="Descripción",
        help_text="Detalle adicional del movimiento (ej: número de venta, observaciones)"
    )
    # ────────────────────────────────────────────────────────────────────────────

    # Contexto del movimiento
    origen = models.CharField(
        max_length=20, choices=ORIGEN_CHOICES,
        default='manual', verbose_name="Origen del movimiento"
    )
    documento_referencia = models.CharField(
        max_length=100, blank=True,
        verbose_name="Documento de referencia",
        help_text="Ej: OC-123, OP-456, Factura FE-789"
    )
    almacen = models.ForeignKey(
        Almacen, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='movimientos', verbose_name="Almacén"
    )
    lote = models.ForeignKey(
        Lote, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='movimientos', verbose_name="Lote"
    )
    costo_unitario = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        verbose_name="Costo unitario al momento"
    )
    stock_resultante = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        verbose_name="Stock después del movimiento"
    )
    usuario = models.CharField(max_length=100, blank=True, verbose_name="Registrado por")

    class Meta:
        verbose_name = "Movimiento de Inventario"
        verbose_name_plural = "Movimientos de Inventario"
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.get_tipo_display()} de {self.cantidad} {self.producto.nombre}"

    @property
    def es_entrada(self):
        """Determina si el movimiento suma stock"""
        return self.tipo in [
            'entrada', 'ajuste_positivo', 'transferencia_entrada',
            'devolucion', 'producto_terminado'
        ]

    def save(self, *args, **kwargs):
        """Al guardar, actualiza automáticamente el stock del producto"""
        is_new = self.pk is None

        if is_new:
            if self.es_entrada:
                self.producto.stock_actual += self.cantidad
            else:
                self.producto.stock_actual -= self.cantidad

            # Registrar el stock resultante para auditoría
            self.stock_resultante = self.producto.stock_actual

            # Registrar costo unitario si no se proporcionó
            if self.costo_unitario is None:
                self.costo_unitario = self.producto.precio_compra

        super().save(*args, **kwargs)

        if is_new:
            self.producto.save(update_fields=['stock_actual'])

            # Verificar si hay que generar alerta de stock bajo
            if self.producto.stock_bajo:
                AlertaInventario.crear_alerta_stock_bajo(self.producto)


class AlertaInventario(models.Model):
    """Alertas automáticas de inventario"""
    TIPO_ALERTA_CHOICES = [
        ('stock_bajo', 'Stock Bajo'),
        ('stock_agotado', 'Stock Agotado'),
        ('lote_por_vencer', 'Lote Próximo a Vencer'),
        ('lote_vencido', 'Lote Vencido'),
        ('sobrestock', 'Sobrestock'),
        ('punto_reorden', 'Punto de Reorden Alcanzado'),
    ]

    ESTADO_CHOICES = [
        ('activa', 'Activa'),
        ('vista', 'Vista'),
        ('resuelta', 'Resuelta'),
        ('ignorada', 'Ignorada'),
    ]

    producto = models.ForeignKey(
        Producto, on_delete=models.CASCADE, related_name='alertas'
    )
    tipo = models.CharField(max_length=20, choices=TIPO_ALERTA_CHOICES)
    mensaje = models.TextField()
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='activa')
    stock_al_momento = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_resolucion = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Alerta de Inventario"
        verbose_name_plural = "Alertas de Inventario"
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f"⚠ {self.get_tipo_display()}: {self.producto.nombre}"

    @classmethod
    def crear_alerta_stock_bajo(cls, producto):
        """Crea alerta si no existe una activa del mismo tipo para este producto"""
        alerta_existente = cls.objects.filter(
            producto=producto,
            tipo='stock_bajo' if producto.stock_actual > 0 else 'stock_agotado',
            estado='activa'
        ).exists()

        if not alerta_existente:
            tipo = 'stock_agotado' if producto.stock_actual <= 0 else 'stock_bajo'
            cls.objects.create(
                producto=producto,
                tipo=tipo,
                mensaje=(
                    f"El producto '{producto.nombre}' tiene stock de "
                    f"{producto.stock_actual} {producto.unidad_medida}. "
                    f"Mínimo requerido: {producto.stock_minimo}."
                ),
                stock_al_momento=producto.stock_actual,
            )

    def resolver(self):
        """Marca la alerta como resuelta"""
        self.estado = 'resuelta'
        self.fecha_resolucion = timezone.now()
        self.save(update_fields=['estado', 'fecha_resolucion'])


class ConteoFisico(models.Model):
    """Conteos físicos de inventario (inventario cíclico o general)"""
    TIPO_CHOICES = [
        ('ciclico', 'Conteo Cíclico'),
        ('general', 'Inventario General'),
        ('selectivo', 'Selectivo'),
    ]

    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('en_proceso', 'En Proceso'),
        ('completado', 'Completado'),
        ('aprobado', 'Aprobado'),
    ]

    nombre = models.CharField(max_length=200, verbose_name="Nombre del conteo")
    tipo = models.CharField(max_length=15, choices=TIPO_CHOICES, default='ciclico')
    almacen = models.ForeignKey(
        Almacen, on_delete=models.SET_NULL, null=True, blank=True, related_name='conteos'
    )
    estado = models.CharField(max_length=15, choices=ESTADO_CHOICES, default='pendiente')
    responsable = models.CharField(max_length=100, blank=True)
    fecha_programada = models.DateField()
    fecha_ejecucion = models.DateField(null=True, blank=True)
    observaciones = models.TextField(blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Conteo Físico"
        verbose_name_plural = "Conteos Físicos"
        ordering = ['-fecha_programada']

    def __str__(self):
        return f"{self.nombre} ({self.get_estado_display()})"


class DetalleConteoFisico(models.Model):
    """Líneas del conteo físico con diferencia vs sistema"""
    conteo = models.ForeignKey(
        ConteoFisico, on_delete=models.CASCADE, related_name='detalles'
    )
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    stock_sistema = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Stock en sistema")
    stock_contado = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        verbose_name="Stock contado"
    )
    diferencia = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        verbose_name="Diferencia"
    )
    ajustado = models.BooleanField(default=False, verbose_name="¿Ajuste aplicado?")
    notas = models.TextField(blank=True)

    class Meta:
        verbose_name = "Detalle de Conteo"
        verbose_name_plural = "Detalles de Conteo"
        unique_together = ['conteo', 'producto']

    def __str__(self):
        return f"{self.producto.nombre}: Sistema={self.stock_sistema}, Contado={self.stock_contado}"

    def calcular_diferencia(self):
        if self.stock_contado is not None:
            self.diferencia = self.stock_contado - self.stock_sistema
        return self.diferencia

    def aplicar_ajuste(self):
        """Crea un movimiento de ajuste basado en la diferencia"""
        if self.diferencia is None or self.diferencia == 0 or self.ajustado:
            return None

        tipo = 'ajuste_positivo' if self.diferencia > 0 else 'ajuste_negativo'
        movimiento = MovimientoInventario.objects.create(
            producto=self.producto,
            cantidad=abs(self.diferencia),
            tipo=tipo,
            motivo=f"Ajuste por conteo físico: {self.conteo.nombre}",
            origen='ajuste',
            documento_referencia=f"CONTEO-{self.conteo.id}",
        )
        self.ajustado = True
        self.save(update_fields=['ajustado'])
        return movimiento
