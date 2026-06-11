"""
Módulo PRODUCTOS — Maestro de materiales estilo SAP MM.
Extiende inventarios.Producto sin duplicar el hub de datos transaccional.
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from inventarios.models import Producto, UnidadMedida


class GrupoMaterial(models.Model):
    """Grupo de materiales SAP (ej: ROH, FERT, HALB, VERP)."""
    codigo = models.CharField(max_length=10, unique=True)
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Grupo de Material"
        verbose_name_plural = "Grupos de Material"
        ordering = ['codigo']

    def __str__(self):
        return f"{self.codigo} — {self.nombre}"


class FamiliaProducto(models.Model):
    """Familia / subfamilia de productos."""
    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=100)
    padre = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='subfamilias'
    )
    descripcion = models.TextField(blank=True)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Familia de Producto"
        verbose_name_plural = "Familias de Producto"
        ordering = ['codigo']

    def __str__(self):
        return f"{self.codigo} — {self.nombre}"


class TipoEmpaque(models.Model):
    """Catálogo de tipos de empaque (caja, bolsa, pallet, etc.)."""
    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Tipo de Empaque"
        verbose_name_plural = "Tipos de Empaque"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class FichaProducto(models.Model):
    """
    Vista ampliada del maestro de materiales (SAP MM).
    OneToOne con inventarios.Producto.
    """
    ESTADO_MATERIAL_CHOICES = [
        ('activo', 'Activo'),
        ('bloqueado', 'Bloqueado'),
        ('obsoleto', 'Obsoleto'),
        ('en_desarrollo', 'En desarrollo'),
    ]

    CLASE_ABC_CHOICES = [
        ('A', 'Clase A — Alto valor/rotación'),
        ('B', 'Clase B — Medio'),
        ('C', 'Clase C — Bajo'),
    ]

    POLITICA_INVENTARIO_CHOICES = [
        ('lote_por_lote', 'Lote por lote'),
        ('punto_reorden', 'Punto de reorden'),
        ('planificacion', 'Planificación MRP'),
        ('sin_planificacion', 'Sin planificación'),
    ]

    producto = models.OneToOneField(
        Producto, on_delete=models.CASCADE, related_name='ficha'
    )

    # ── Clasificación SAP ─────────────────────────────────────────────────────
    grupo_material = models.ForeignKey(
        GrupoMaterial, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='productos'
    )
    familia = models.ForeignKey(
        FamiliaProducto, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='productos'
    )
    codigo_interno = models.CharField(max_length=50, blank=True, verbose_name="Código interno")
    codigo_dian = models.CharField(max_length=50, blank=True, verbose_name="Código DIAN / FE")
    codigo_arancelario = models.CharField(max_length=20, blank=True, verbose_name="Partida arancelaria (HS)")
    codigo_gtin = models.CharField(max_length=14, blank=True, verbose_name="GTIN / EAN principal")

    # ── Empaque y presentación ─────────────────────────────────────────────────
    tipo_empaque = models.ForeignKey(
        TipoEmpaque, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='productos'
    )
    presentacion = models.CharField(max_length=200, blank=True, help_text="Ej: Caja x 12 unidades")
    contenido_neto = models.DecimalField(
        max_digits=12, decimal_places=4, null=True, blank=True,
        verbose_name="Contenido neto"
    )
    unidad_contenido = models.CharField(max_length=30, blank=True, verbose_name="UM contenido")
    unidades_por_empaque = models.PositiveIntegerField(
        null=True, blank=True, verbose_name="Unidades por empaque"
    )

    # ── Dimensiones y peso ─────────────────────────────────────────────────────
    largo_cm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    ancho_cm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    alto_cm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    volumen_m3 = models.DecimalField(max_digits=12, decimal_places=6, null=True, blank=True)
    peso_bruto_kg = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    peso_neto_kg = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)

    # ── Origen y fabricante ────────────────────────────────────────────────────
    pais_origen = models.CharField(max_length=80, blank=True, default='Colombia')
    fabricante = models.CharField(max_length=200, blank=True)
    proveedor_habitual = models.CharField(max_length=200, blank=True)

    # ── Vista Compras ──────────────────────────────────────────────────────────
    lead_time_dias = models.PositiveIntegerField(null=True, blank=True, verbose_name="Lead time (días)")
    cantidad_minima_compra = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="MOQ compra"
    )
    moneda_compra = models.CharField(max_length=3, default='COP', blank=True)
    ultimo_precio_compra = models.DecimalField(
        max_digits=14, decimal_places=2, null=True, blank=True
    )
    fecha_ultima_compra = models.DateField(null=True, blank=True)

    # ── Vista Ventas ───────────────────────────────────────────────────────────
    lista_precios = models.CharField(max_length=50, blank=True, default='General')
    iva_porcentaje = models.DecimalField(
        max_digits=5, decimal_places=2, default=19,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    precio_sugerido = models.DecimalField(
        max_digits=14, decimal_places=2, null=True, blank=True
    )
    permite_descuento = models.BooleanField(default=True)
    es_vendible = models.BooleanField(default=True)

    # ── Vista MRP / Planificación ──────────────────────────────────────────────
    politica_inventario = models.CharField(
        max_length=20, choices=POLITICA_INVENTARIO_CHOICES,
        default='punto_reorden'
    )
    planificador = models.CharField(max_length=100, blank=True)
    tiempo_produccion_dias = models.PositiveIntegerField(null=True, blank=True)
    lote_minimo_produccion = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    lote_estandar = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )

    # ── Vista Almacén ──────────────────────────────────────────────────────────
    gestion_lote = models.BooleanField(default=False)
    gestion_serie = models.BooleanField(default=False)
    temperatura_almacenamiento = models.CharField(max_length=100, blank=True)
    clase_abc = models.CharField(
        max_length=1, choices=CLASE_ABC_CHOICES, blank=True
    )
    estado_material = models.CharField(
        max_length=15, choices=ESTADO_MATERIAL_CHOICES, default='activo'
    )

    # ── Regulatorio / Calidad ────────────────────────────────────────────────────
    requiere_certificado = models.BooleanField(default=False)
    norma_calidad = models.CharField(max_length=100, blank=True)
    ficha_tecnica_url = models.URLField(blank=True)
    
    # ✅ NUEVO CAMPO: Imagen del producto
    imagen = models.ImageField(
        upload_to='productos/imagenes/',
        blank=True,
        null=True,
        verbose_name='Imagen del Producto'
    )
    
    observaciones = models.TextField(blank=True)

    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Ficha de Producto"
        verbose_name_plural = "Fichas de Producto"

    def __str__(self):
        return f"Ficha: {self.producto.codigo_sku}"


class CodigoBarras(models.Model):
    """Códigos de barras alternos por producto (EAN-13, UPC, interno, etc.)."""
    TIPO_CODIGO_CHOICES = [
        ('EAN13', 'EAN-13'),
        ('EAN8', 'EAN-8'),
        ('UPC', 'UPC-A'),
        ('CODE128', 'Code 128'),
        ('CODE39', 'Code 39'),
        ('QR', 'QR'),
        ('INTERNO', 'Código interno'),
        ('GTIN14', 'GTIN-14 (caja)'),
    ]

    producto = models.ForeignKey(
        Producto, on_delete=models.CASCADE, related_name='codigos_barras'
    )
    codigo = models.CharField(max_length=50)
    tipo = models.CharField(max_length=10, choices=TIPO_CODIGO_CHOICES, default='EAN13')
    es_principal = models.BooleanField(default=False)
    descripcion = models.CharField(max_length=100, blank=True)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Código de Barras"
        verbose_name_plural = "Códigos de Barras"
        unique_together = [['producto', 'codigo']]
        ordering = ['-es_principal', 'tipo']

    def __str__(self):
        return f"{self.codigo} ({self.get_tipo_display()})"

    def save(self, *args, **kwargs):
        if self.es_principal:
            CodigoBarras.objects.filter(
                producto=self.producto, es_principal=True
            ).exclude(pk=self.pk).update(es_principal=False)
        super().save(*args, **kwargs)


class UnidadEmpaque(models.Model):
    """Jerarquía de empaque: unidad → caja → pallet con factor de conversión."""
    NIVEL_CHOICES = [
        ('unidad', 'Unidad base'),
        ('inner', 'Empaque interno'),
        ('caja', 'Caja / Cartón'),
        ('bulto', 'Bulto'),
        ('pallet', 'Pallet / Estiba'),
        ('contenedor', 'Contenedor'),
    ]

    producto = models.ForeignKey(
        Producto, on_delete=models.CASCADE, related_name='unidades_empaque'
    )
    nivel = models.CharField(max_length=15, choices=NIVEL_CHOICES, default='caja')
    codigo = models.CharField(max_length=30, blank=True)
    descripcion = models.CharField(max_length=100)
    factor_conversion = models.DecimalField(
        max_digits=12, decimal_places=4,
        validators=[MinValueValidator(0.0001)],
        help_text="Cuántas unidades base contiene este empaque"
    )
    codigo_barras = models.CharField(max_length=50, blank=True)
    peso_kg = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    largo_cm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    ancho_cm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    alto_cm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    es_predeterminado = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Unidad de Empaque"
        verbose_name_plural = "Unidades de Empaque"
        ordering = ['factor_conversion']

    def __str__(self):
        return f"{self.descripcion} (×{self.factor_conversion})"


class UnidadMedidaAlternativa(models.Model):
    """Unidades de medida alternativas con factor de conversión a la UM base."""
    producto = models.ForeignKey(
        Producto, on_delete=models.CASCADE, related_name='unidades_alternativas'
    )
    unidad = models.ForeignKey(
        UnidadMedida, on_delete=models.PROTECT, related_name='conversiones_producto'
    )
    factor_a_base = models.DecimalField(
        max_digits=12, decimal_places=6,
        validators=[MinValueValidator(0.000001)],
        help_text="1 [esta UM] = X unidades base"
    )
    codigo_barras = models.CharField(max_length=50, blank=True)
    es_predeterminada_venta = models.BooleanField(default=False)
    es_predeterminada_compra = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Unidad de Medida Alternativa"
        verbose_name_plural = "Unidades de Medida Alternativas"
        unique_together = [['producto', 'unidad']]

    def __str__(self):
        return f"{self.unidad} (×{self.factor_a_base})"
