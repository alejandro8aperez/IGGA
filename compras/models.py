from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from inventarios.models import Producto, MovimientoInventario
from contabilidad.services import crear_asiento_pago_proveedor


# ═══════════════════════════════════════════════════════
# PROVEEDOR
# ═══════════════════════════════════════════════════════

class Proveedor(models.Model):
    TIPO_DOCUMENTO_CHOICES = [
        ('NIT', 'NIT'),
        ('CC', 'Cédula de Ciudadanía'),
        ('CE', 'Cédula de Extranjería'),
        ('PAS', 'Pasaporte'),
    ]

    CATEGORIA_CHOICES = [
        ('materias_primas', 'Materias Primas'),
        ('insumos', 'Insumos / Consumibles'),
        ('maquinaria', 'Maquinaria y Equipos'),
        ('servicios', 'Servicios'),
        ('empaques', 'Empaques'),
        ('transporte', 'Transporte / Logística'),
        ('tecnologia', 'Tecnología'),
        ('otro', 'Otro'),
    ]

    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
        ('bloqueado', 'Bloqueado'),
        ('en_evaluacion', 'En Evaluación'),
    ]

    # Información básica (campos originales preservados)
    razon_social = models.CharField(max_length=200, verbose_name="Razón Social")
    nit = models.CharField(max_length=50, unique=True, verbose_name="NIT / Documento")
    contacto_nombre = models.CharField(max_length=100, verbose_name="Nombre del Contacto")
    contacto_email = models.EmailField(verbose_name="Email del Contacto")
    contacto_telefono = models.CharField(max_length=20, blank=True, verbose_name="Teléfono")
    direccion = models.TextField(blank=True, verbose_name="Dirección")

    # Campos nuevos: Clasificación
    tipo_documento = models.CharField(
        max_length=5, choices=TIPO_DOCUMENTO_CHOICES,
        default='NIT', verbose_name="Tipo de documento"
    )
    nombre_comercial = models.CharField(
        max_length=200, blank=True, verbose_name="Nombre comercial"
    )
    categoria = models.CharField(
        max_length=20, choices=CATEGORIA_CHOICES,
        default='materias_primas', verbose_name="Categoría"
    )
    estado = models.CharField(
        max_length=15, choices=ESTADO_CHOICES,
        default='activo', verbose_name="Estado"
    )

    # Campos nuevos: Contacto adicional
    ciudad = models.CharField(max_length=100, blank=True, verbose_name="Ciudad")
    departamento = models.CharField(max_length=100, blank=True, verbose_name="Departamento")
    sitio_web = models.URLField(blank=True, verbose_name="Sitio web")
    contacto_telefono_alt = models.CharField(
        max_length=20, blank=True, verbose_name="Teléfono alternativo"
    )

    # Campos nuevos: Condiciones comerciales
    condicion_pago = models.CharField(
        max_length=50, blank=True, default="Contado",
        verbose_name="Condición de pago",
        help_text="Ej: Contado, 30 días, 60 días"
    )
    descuento_general = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Descuento general (%)"
    )
    moneda = models.CharField(
        max_length=10, default='COP',
        verbose_name="Moneda",
        help_text="COP, USD, EUR"
    )
    tiempo_entrega_promedio_dias = models.PositiveIntegerField(
        default=7, verbose_name="Tiempo de entrega promedio (días)"
    )

    # Campos nuevos: Evaluación
    calificacion = models.DecimalField(
        max_digits=3, decimal_places=1, null=True, blank=True,
        verbose_name="Calificación (1-5)",
        help_text="Evaluación de desempeño del proveedor"
    )
    notas = models.TextField(blank=True, verbose_name="Notas internas")

    # Auditoría
    fecha_registro = models.DateTimeField(auto_now_add=True, null=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"
        ordering = ['razon_social']

    def __str__(self):
        return f"{self.razon_social} ({self.nit})"

    @property
    def total_ordenes(self):
        return self.ordencompra_set.count()

    @property
    def total_comprado(self):
        from django.db.models import Sum
        return self.ordencompra_set.filter(
            estado__in=['completada', 'recibida_parcial']
        ).aggregate(total=Sum('total'))['total'] or 0


# ═══════════════════════════════════════════════════════
# SOLICITUD DE COMPRA (nuevo)
# ═══════════════════════════════════════════════════════

class SolicitudCompra(models.Model):
    """Solicitudes internas de materiales — origen de órdenes de compra"""
    PRIORIDAD_CHOICES = [
        ('baja', 'Baja'),
        ('normal', 'Normal'),
        ('alta', 'Alta'),
        ('urgente', 'Urgente'),
    ]

    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('aprobada', 'Aprobada'),
        ('rechazada', 'Rechazada'),
        ('convertida', 'Convertida a OC'),
        ('cancelada', 'Cancelada'),
    ]

    ORIGEN_CHOICES = [
        ('manual', 'Manual'),
        ('mrp', 'MRP'),
        ('produccion', 'Producción'),
        ('mantenimiento', 'Mantenimiento'),
        ('almacen', 'Almacén (Stock Bajo)'),
    ]

    numero = models.CharField(
        max_length=30, unique=True, blank=True,
        verbose_name="Número de solicitud"
    )
    solicitante = models.CharField(max_length=100, verbose_name="Solicitante")
    departamento = models.CharField(max_length=100, blank=True, verbose_name="Departamento")
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    fecha_requerida = models.DateField(
        null=True, blank=True, verbose_name="Fecha requerida"
    )
    prioridad = models.CharField(
        max_length=10, choices=PRIORIDAD_CHOICES,
        default='normal', verbose_name="Prioridad"
    )
    estado = models.CharField(
        max_length=15, choices=ESTADO_CHOICES,
        default='pendiente', verbose_name="Estado"
    )
    origen = models.CharField(
        max_length=15, choices=ORIGEN_CHOICES,
        default='manual', verbose_name="Origen"
    )
    justificacion = models.TextField(blank=True, verbose_name="Justificación")
    aprobado_por = models.CharField(max_length=100, blank=True, verbose_name="Aprobado por")
    fecha_aprobacion = models.DateTimeField(null=True, blank=True)
    orden_compra = models.ForeignKey(
        'OrdenCompra', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='solicitudes', verbose_name="Orden de Compra generada"
    )
    notas = models.TextField(blank=True)

    class Meta:
        verbose_name = "Solicitud de Compra"
        verbose_name_plural = "Solicitudes de Compra"
        ordering = ['-fecha_solicitud']

    def __str__(self):
        return f"SC-{self.numero or self.id} ({self.get_estado_display()})"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new and not self.numero:
            self.numero = f"SC-{self.id:05d}"
            type(self).objects.filter(pk=self.pk).update(numero=self.numero)


class DetalleSolicitudCompra(models.Model):
    """Líneas de la solicitud de compra"""
    solicitud = models.ForeignKey(
        SolicitudCompra, on_delete=models.CASCADE,
        related_name='detalles', verbose_name="Solicitud"
    )
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT, verbose_name="Producto")
    cantidad_solicitada = models.DecimalField(
        max_digits=12, decimal_places=2, verbose_name="Cantidad solicitada"
    )
    cantidad_aprobada = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        verbose_name="Cantidad aprobada"
    )
    proveedor_sugerido = models.ForeignKey(
        Proveedor, on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name="Proveedor sugerido"
    )
    notas = models.CharField(max_length=200, blank=True)

    class Meta:
        verbose_name = "Detalle de Solicitud"
        verbose_name_plural = "Detalles de Solicitud"

    def __str__(self):
        return f"{self.cantidad_solicitada} x {self.producto.nombre}"


# ═══════════════════════════════════════════════════════
# ORDEN DE COMPRA
# ═══════════════════════════════════════════════════════

class OrdenCompra(models.Model):
    ESTADO_CHOICES = [
        ('borrador', 'Borrador'),
        ('enviada', 'Enviada al Proveedor'),
        ('confirmada', 'Confirmada por Proveedor'),
        ('recibida_parcial', 'Recibida Parcialmente'),
        ('completada', 'Completada'),
        ('cancelada', 'Cancelada'),
    ]

    numero = models.CharField(
        max_length=30, unique=True, blank=True,
        verbose_name="Número de OC"
    )
    proveedor = models.ForeignKey(Proveedor, on_delete=models.CASCADE, verbose_name="Proveedor")
    fecha_emision = models.DateField(auto_now_add=True, verbose_name="Fecha de emisión")
    fecha_entrega_esperada = models.DateField(
        null=True, blank=True, verbose_name="Fecha de entrega esperada"
    )
    estado = models.CharField(
        max_length=20, choices=ESTADO_CHOICES,
        default='borrador', verbose_name="Estado"
    )
    condicion_pago = models.CharField(
        max_length=50, blank=True, verbose_name="Condición de pago"
    )

    # Totales
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0, verbose_name="Subtotal")
    porcentaje_iva = models.DecimalField(max_digits=5, decimal_places=2, default=19, verbose_name="% IVA")
    iva = models.DecimalField(max_digits=14, decimal_places=2, default=0, verbose_name="IVA")
    descuento = models.DecimalField(max_digits=14, decimal_places=2, default=0, verbose_name="Descuento")
    total = models.DecimalField(max_digits=14, decimal_places=2, default=0, verbose_name="Total")

    observaciones = models.TextField(blank=True, verbose_name="Observaciones")

    class Meta:
        verbose_name = "Orden de Compra"
        verbose_name_plural = "Órdenes de Compra"
        ordering = ['-fecha_emision']

    def __str__(self):
        return f"OC-{self.numero or self.id} / {self.proveedor.razon_social}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new and not self.numero:
            self.numero = f"{self.id:05d}"
            type(self).objects.filter(pk=self.pk).update(numero=self.numero)

    def recalcular_totales(self):
        """Recalcula subtotal, IVA y total basado en los detalles"""
        from django.db.models import Sum, F
        agg = self.detalles.aggregate(
            sub=Sum(F('cantidad') * F('precio_unitario'))
        )
        self.subtotal = agg['sub'] or 0
        self.iva = (self.subtotal * self.porcentaje_iva) / 100
        self.total = self.subtotal + self.iva - self.descuento
        self.save(update_fields=['subtotal', 'iva', 'total'])

    @property
    def recibido_total(self):
        from django.db.models import Sum
        return self.recepciones.aggregate(
            total=Sum('detalles_recepcion__cantidad_recibida')
        )['total'] or 0

    @property
    def saldo_por_pagar(self):
        from django.db.models import Sum
        pagado = self.pagos.aggregate(total=Sum('monto'))['total'] or 0
        return max(self.total - pagado, 0)

    @property
    def porcentaje_recibido(self):
        """Porcentaje de productos recibidos vs pedidos"""
        total_pedido = self.detalles.aggregate(
            total=models.Sum('cantidad')
        )['total'] or 0
        if total_pedido == 0:
            return 0
        return round((self.recibido_total / total_pedido) * 100, 1)

    @property
    def esta_pagada(self):
        return self.saldo_por_pagar <= 0


class DetalleOrdenCompra(models.Model):
    orden = models.ForeignKey(
        OrdenCompra, related_name='detalles', on_delete=models.CASCADE
    )
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT, verbose_name="Producto")
    cantidad = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Cantidad")
    precio_unitario = models.DecimalField(
        max_digits=12, decimal_places=2, verbose_name="Precio unitario"
    )
    subtotal = models.DecimalField(
        max_digits=14, decimal_places=2, default=0, verbose_name="Subtotal línea"
    )
    cantidad_recibida = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name="Cantidad recibida acumulada"
    )
    notas = models.CharField(max_length=200, blank=True)

    class Meta:
        verbose_name = "Detalle de Orden de Compra"
        verbose_name_plural = "Detalles de Orden de Compra"

    def __str__(self):
        return f"{self.cantidad}x {self.producto.nombre} (OC-{self.orden.numero or self.orden.id})"

    def save(self, *args, **kwargs):
        self.subtotal = self.cantidad * self.precio_unitario
        super().save(*args, **kwargs)

    @property
    def cantidad_pendiente(self):
        return max(self.cantidad - self.cantidad_recibida, 0)

    @property
    def completamente_recibido(self):
        return self.cantidad_recibida >= self.cantidad


# ═══════════════════════════════════════════════════════
# RECEPCIÓN DE MERCANCÍA
# ═══════════════════════════════════════════════════════

class RecepcionCompra(models.Model):
    """Recepciones de mercancía — puede haber varias por OC"""
    orden = models.ForeignKey(
        OrdenCompra, related_name='recepciones', on_delete=models.CASCADE
    )
    numero = models.CharField(max_length=30, unique=True, blank=True, verbose_name="Número")
    fecha = models.DateField(default=timezone.now, verbose_name="Fecha de recepción")
    recibido_por = models.CharField(max_length=100, blank=True, verbose_name="Recibido por")
    comentario = models.TextField(blank=True, verbose_name="Comentarios")
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Recepción de Mercancía"
        verbose_name_plural = "Recepciones de Mercancía"
        ordering = ['-fecha']

    def __str__(self):
        return f"REC-{self.numero or self.id} (OC-{self.orden.numero or self.orden.id})"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new and not self.numero:
            self.numero = f"{self.id:05d}"
            type(self).objects.filter(pk=self.pk).update(numero=self.numero)


class DetalleRecepcion(models.Model):
    """Líneas de recepción — qué productos y cuánto se recibió"""
    recepcion = models.ForeignKey(
        RecepcionCompra, related_name='detalles_recepcion', on_delete=models.CASCADE
    )
    detalle_orden = models.ForeignKey(
        DetalleOrdenCompra, on_delete=models.CASCADE,
        related_name='recepciones_detalle', verbose_name="Línea de OC"
    )
    cantidad_recibida = models.DecimalField(
        max_digits=12, decimal_places=2, verbose_name="Cantidad recibida"
    )
    cantidad_rechazada = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name="Cantidad rechazada"
    )
    motivo_rechazo = models.CharField(max_length=200, blank=True, verbose_name="Motivo del rechazo")
    lote = models.CharField(max_length=50, blank=True, verbose_name="Número de lote")
    notas = models.CharField(max_length=200, blank=True)

    class Meta:
        verbose_name = "Detalle de Recepción"
        verbose_name_plural = "Detalles de Recepción"

    def __str__(self):
        return f"{self.cantidad_recibida}x {self.detalle_orden.producto.nombre}"


# ═══════════════════════════════════════════════════════
# PAGO DE COMPRA
# ═══════════════════════════════════════════════════════

class PagoCompra(models.Model):
    METODO_CHOICES = [
        ('transferencia', 'Transferencia Bancaria'),
        ('efectivo', 'Efectivo'),
        ('cheque', 'Cheque'),
        ('tarjeta', 'Tarjeta Corporativa'),
        ('credito', 'Crédito del Proveedor'),
    ]

    orden = models.ForeignKey(
        OrdenCompra, related_name='pagos', on_delete=models.CASCADE
    )
    fecha = models.DateField(default=timezone.now, verbose_name="Fecha de pago")
    monto = models.DecimalField(max_digits=14, decimal_places=2, verbose_name="Monto")
    metodo = models.CharField(
        max_length=20, choices=METODO_CHOICES,
        default='transferencia', verbose_name="Método de pago"
    )
    referencia = models.CharField(
        max_length=100, blank=True,
        verbose_name="Referencia / Comprobante"
    )
    notas = models.TextField(blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Pago de Compra"
        verbose_name_plural = "Pagos de Compra"
        ordering = ['-fecha']

    def clean(self):
        if self.orden.estado == 'cancelada':
            raise ValidationError('No se puede registrar pago para orden cancelada.')
        if self.monto <= 0:
            raise ValidationError('El monto debe ser mayor a cero.')

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Pago OC-{self.orden.numero or self.orden.id} ${self.monto}"


# ═══════════════════════════════════════════════════════
# CONTRATO
# ═══════════════════════════════════════════════════════

class Contrato(models.Model):
    TIPO_CHOICES = [
        ('compra', 'Compra'),
        ('venta', 'Venta'),
        ('suministro', 'Suministro'),
        ('servicio', 'Prestación de Servicios'),
    ]

    ESTADO_CHOICES = [
        ('negociacion', 'Negociación'),
        ('activo', 'Activo'),
        ('vencido', 'Vencido'),
        ('cancelado', 'Cancelado'),
    ]

    codigo = models.CharField(max_length=80, unique=True, verbose_name="Código")
    proveedor = models.ForeignKey(
        Proveedor, on_delete=models.CASCADE,
        related_name='contratos', verbose_name="Proveedor"
    )
    tipo = models.CharField(
        max_length=20, choices=TIPO_CHOICES,
        default='compra', verbose_name="Tipo"
    )
    descripcion = models.TextField(blank=True, verbose_name="Descripción")
    fecha_inicio = models.DateField(verbose_name="Fecha de inicio")
    fecha_fin = models.DateField(null=True, blank=True, verbose_name="Fecha de fin")
    valor_contrato = models.DecimalField(
        max_digits=14, decimal_places=2, verbose_name="Valor del contrato"
    )
    estado = models.CharField(
        max_length=25, choices=ESTADO_CHOICES,
        default='negociacion', verbose_name="Estado"
    )
    archivo = models.FileField(
        upload_to='compras/contratos/', null=True, blank=True,
        verbose_name="Archivo del contrato"
    )
    notas = models.TextField(blank=True)

    class Meta:
        verbose_name = "Contrato"
        verbose_name_plural = "Contratos"
        ordering = ['-fecha_inicio']

    def duracion_dias(self):
        if self.fecha_fin and self.fecha_inicio:
            return (self.fecha_fin - self.fecha_inicio).days
        return None

    @property
    def esta_vigente(self):
        if self.fecha_fin:
            return self.fecha_fin >= timezone.now().date() and self.estado == 'activo'
        return self.estado == 'activo'

    def __str__(self):
        return f"CON-{self.codigo} ({self.proveedor.razon_social})"


# ═══════════════════════════════════════════════════════
# PRODUCTO-PROVEEDOR
# ═══════════════════════════════════════════════════════

class ProductoProveedor(models.Model):
    """Relación entre Producto y Proveedor — qué productos vende cada proveedor"""
    producto = models.ForeignKey(
        Producto, on_delete=models.CASCADE,
        related_name='proveedores', verbose_name="Producto"
    )
    proveedor = models.ForeignKey(
        Proveedor, on_delete=models.CASCADE,
        related_name='productos', verbose_name="Proveedor"
    )
    codigo_proveedor = models.CharField(
        max_length=50, blank=True,
        help_text="Código del producto según el proveedor"
    )
    precio_proveedor = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        verbose_name="Precio del proveedor"
    )
    tiempo_entrega_dias = models.IntegerField(
        default=7, help_text="Días de entrega promedio"
    )
    es_proveedor_principal = models.BooleanField(
        default=False, help_text="Proveedor principal para este producto"
    )
    notas = models.TextField(blank=True)

    class Meta:
        db_table = 'compras_productoproveedor'
        unique_together = ['producto', 'proveedor']
        verbose_name = "Producto por Proveedor"
        verbose_name_plural = "Productos por Proveedor"

    def __str__(self):
        return f"{self.producto.nombre} - {self.proveedor.razon_social}"


# ═══════════════════════════════════════════════════════
# SEÑALES — Automatización post-guardado
# ═══════════════════════════════════════════════════════

@receiver(post_save, sender=DetalleRecepcion)
def post_save_detalle_recepcion(sender, instance, created, **kwargs):
    """Al recibir mercancía: actualizar cantidad recibida en OC y crear movimiento de inventario"""
    if not created:
        return

    detalle_oc = instance.detalle_orden

    # 1. Actualizar cantidad recibida acumulada en la línea de OC
    detalle_oc.cantidad_recibida += instance.cantidad_recibida
    detalle_oc.save(update_fields=['cantidad_recibida'])

    # 2. Crear movimiento de entrada en inventario
    MovimientoInventario.objects.create(
        producto=detalle_oc.producto,
        cantidad=instance.cantidad_recibida,
        tipo='entrada',
        motivo=f"Recepción de OC-{instance.recepcion.orden.numero or instance.recepcion.orden.id}",
        origen='compra',
        documento_referencia=f"OC-{instance.recepcion.orden.numero or instance.recepcion.orden.id} / REC-{instance.recepcion.numero or instance.recepcion.id}",
        costo_unitario=detalle_oc.precio_unitario,
    )

    # 3. Actualizar estado de la OC
    orden = instance.recepcion.orden
    todas_recibidas = all(
        d.completamente_recibido for d in orden.detalles.all()
    )
    if todas_recibidas:
        orden.estado = 'completada'
    elif orden.estado not in ['completada', 'cancelada']:
        orden.estado = 'recibida_parcial'
    orden.save(update_fields=['estado'])


@receiver(post_save, sender=PagoCompra)
def post_save_pago(sender, instance, created, **kwargs):
    """Al registrar pago: crear asiento contable y actualizar estado OC"""
    if not created:
        return

    orden = instance.orden

    # Crear asiento contable
    try:
        crear_asiento_pago_proveedor(instance.fecha, orden, instance.monto)
    except Exception:
        pass  # No bloquear la operación si contabilidad falla

    # Actualizar estado si ya se pagó todo
    if orden.saldo_por_pagar <= 0 and orden.estado != 'cancelada':
        orden.estado = 'completada'
        orden.save(update_fields=['estado'])
