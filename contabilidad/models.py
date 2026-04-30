from django.db import models

class PeriodoContable(models.Model):
    """
    Períodos contables (meses, trimestres, años fiscales)
    """
    ESTADO_CHOICES = [
        ('abierto', 'Abierto'),
        ('cerrado', 'Cerrado'),
    ]

    nombre = models.CharField(max_length=50, verbose_name="Nombre del Período")
    fecha_inicio = models.DateField(verbose_name="Fecha Inicio")
    fecha_fin = models.DateField(verbose_name="Fecha Fin")
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='abierto', verbose_name="Estado")
    descripcion = models.TextField(blank=True, verbose_name="Descripción")
    fecha_cierre = models.DateTimeField(null=True, blank=True, verbose_name="Fecha de Cierre")
    asiento_cierre = models.ForeignKey('AsientoContable', on_delete=models.SET_NULL, null=True, blank=True, related_name='cierre_periodo')
    resultado = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Resultado del Período")

    def __str__(self):
        return f"{self.nombre} ({self.fecha_inicio} - {self.fecha_fin})"

    class Meta:
        verbose_name = "Período Contable"
        verbose_name_plural = "Períodos Contables"
        ordering = ['-fecha_inicio']


class Cuenta(models.Model):
    """
    Catálogo de cuentas contables (Plan Único de Cuentas - PUC Colombia)
    """
    TIPO_CHOICES = [
        ('activo', 'Activo'),
        ('pasivo', 'Pasivo'),
        ('patrimonio', 'Patrimonio'),
        ('ingreso', 'Ingreso'),
        ('gasto', 'Gasto'),
    ]

    codigo = models.CharField(max_length=20, unique=True, verbose_name="Código PUC")
    nombre = models.CharField(max_length=100, verbose_name="Nombre de la Cuenta")
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, verbose_name="Tipo de Cuenta")
    nivel = models.PositiveSmallIntegerField(default=2, verbose_name="Nivel (1=Mayor, 2=Auxiliar)")
    cuenta_padre = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcuentas')
    activa = models.BooleanField(default=True, verbose_name="Cuenta Activa")

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

    class Meta:
        verbose_name = "Cuenta Contable"
        verbose_name_plural = "Catálogo de Cuentas"
        ordering = ['codigo']


class MovimientoContable(models.Model):
    """
    Movimientos contables asociados a un asiento contable (Partida Doble).
    """
    asiento_contable = models.ForeignKey('AsientoContable', on_delete=models.CASCADE, null=True, related_name='movimientos')
    cuenta = models.ForeignKey('Cuenta', on_delete=models.CASCADE, related_name='movimientos')
    descripcion = models.CharField(max_length=255, blank=True, verbose_name="Descripción del Movimiento")
    debe = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Débito")
    haber = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Crédito")

    def __str__(self):
        tipo = "DEBE" if self.debe > 0 else "HABER"
        monto = self.debe if self.debe > 0 else self.haber
        return f"{self.asiento_contable.fecha.strftime('%d/%m/%Y')} - {self.cuenta.codigo} - {tipo} ${monto:,.0f}"

    class Meta:
        verbose_name = "Movimiento Contable"
        verbose_name_plural = "Movimientos Contables"


class AsientoContable(models.Model):
    """
    Modelo central del Libro Mayor (General Ledger).
    Registra cada movimiento financiero disparado por los módulos del ERP.
    """
    TIPO_CHOICES = [
        ('ingreso', 'Ingreso (Entrada de Dinero)'),
        ('egreso', 'Egreso (Salida de Dinero)'),
        ('ajuste', 'Ajuste Contable'),
    ]

    fecha = models.DateTimeField(auto_now_add=True, verbose_name="Fecha del Registro")
    descripcion = models.CharField(max_length=255, verbose_name="Concepto/Descripción")
    referencia = models.CharField(max_length=100, blank=True, verbose_name="Referencia Documento")
    valor = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Monto Total")
    total_debe = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Total Débitos")
    total_haber = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Total Créditos")
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES, default='ingreso', verbose_name="Tipo de Movimiento")
    
    # Trazabilidad: permite saber qué módulo generó el gasto (rrhh, pos, ventas, etc.)
    modulo_origen = models.CharField(max_length=50, default='sistema', verbose_name="Módulo de Origen")
    
    # Almacenamiento flexible para detalles adicionales (ID de empleado, CUFE de factura, etc.)
    metadata = models.JSONField(default=dict, blank=True, null=True, verbose_name="Datos Adicionales (JSON)")

    def __str__(self):
        return f"[{self.modulo_origen.upper()}] {self.fecha.strftime('%d/%m/%Y')} - {self.descripcion} - ${self.valor:,.0f}"

    class Meta:
        verbose_name = "Asiento Contable"
        verbose_name_plural = "Libro Mayor (Asientos Contables)"
        ordering = ['-fecha']
        # Indexación para búsquedas rápidas de auditoría
        indexes = [
            models.Index(fields=['fecha', 'modulo_origen']),
        ]