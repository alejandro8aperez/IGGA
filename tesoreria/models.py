from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from decimal import Decimal
from datetime import datetime, timedelta


# ═══════════════════════════════════════════════════════
# 1. CUENTAS BANCARIAS
# ═══════════════════════════════════════════════════════

class CuentaBancaria(models.Model):
    """
    Gestión de cuentas bancarias para Tesorería
    """
    BANCO_CHOICES = [
        ('bancolombia', 'Bancolombia'),
        ('bbva', 'BBVA'),
        ('davivienda', 'Davivienda'),
        ('bogota', 'Banco de Bogotá'),
        ('occidente', 'Banco de Occidente'),
        ('colpatria', 'Colpatria'),
        ('pichincha', 'Banco Pichincha'),
        ('nequi', 'Nequi'),
        ('otro', 'Otro'),
    ]
    
    TIPO_CUENTA_CHOICES = [
        ('corriente', 'Corriente'),
        ('ahorro', 'Ahorro'),
        ('monedasextranjeras', 'Moneda Extranjera'),
    ]

    # Identificación
    banco = models.CharField(max_length=50, choices=BANCO_CHOICES, verbose_name="Banco")
    numero_cuenta = models.CharField(max_length=30, unique=True, verbose_name="Número de Cuenta")
    tipo_cuenta = models.CharField(max_length=20, choices=TIPO_CUENTA_CHOICES, verbose_name="Tipo de Cuenta")
    titulares = models.CharField(max_length=200, verbose_name="Titulares")
    
    # Saldos
    saldo_inicial = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Saldo Inicial")
    saldo_sistema = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Saldo Sistema")
    saldo_banco = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Saldo del Banco")
    
    # Vinculación Contable
    cuenta_contable = models.OneToOneField('contabilidad.Cuenta', on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Cuenta Contable")
    
    # Control
    activa = models.BooleanField(default=True, verbose_name="Activa")
    fecha_apertura = models.DateField(auto_now_add=True, verbose_name="Fecha Apertura")
    ultimo_movimiento = models.DateField(null=True, blank=True, verbose_name="Último Movimiento")
    
    # Límites
    saldo_minimo_permitido = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name="Saldo Mínimo")
    saldo_maximo_permitido = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name="Saldo Máximo")
    
    # Auditoría
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.banco.upper()} - {self.numero_cuenta}"

    def get_diferencia_conciliacion(self):
        """Diferencia entre banco y sistema"""
        return self.saldo_banco - self.saldo_sistema

    def actualizar_saldo_sistema(self):
        """Calcula saldo sistema = inicial + movimientos"""
        movimientos = self.movimientos.filter(
            conciliado=True,
            tipo__in=['ingreso', 'egreso']
        )
        
        total_ingresos = movimientos.filter(tipo='ingreso').aggregate(models.Sum('monto'))['monto__sum'] or Decimal('0.00')
        total_egresos = movimientos.filter(tipo='egreso').aggregate(models.Sum('monto'))['monto__sum'] or Decimal('0.00')
        
        self.saldo_sistema = self.saldo_inicial + total_ingresos - total_egresos
        return self.saldo_sistema

    class Meta:
        verbose_name = "Cuenta Bancaria"
        verbose_name_plural = "Cuentas Bancarias"
        ordering = ['-fecha_creacion']


# ═══════════════════════════════════════════════════════
# 2. MOVIMIENTOS DE TESORERÍA
# ═══════════════════════════════════════════════════════

class MovimientoTesoreria(models.Model):
    """
    Movimientos de tesorería (ingresos, egresos, transferencias)
    """
    TIPO_MOVIMIENTO = [
        ('ingreso', 'Ingreso'),
        ('egreso', 'Egreso'),
        ('transferencia', 'Transferencia'),
        ('retencion', 'Retención'),
        ('devolucion', 'Devolución'),
    ]

    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('confirmado', 'Confirmado'),
        ('conciliado', 'Conciliado'),
        ('reversado', 'Reversado'),
    ]

    # Identificación
    numero_movimiento = models.CharField(max_length=30, unique=True, verbose_name="Número Movimiento")
    cuenta_banco = models.ForeignKey(CuentaBancaria, on_delete=models.PROTECT, related_name='movimientos', verbose_name="Cuenta Bancaria")
    
    # Datos del movimiento
    fecha = models.DateField(verbose_name="Fecha")
    fecha_valor = models.DateField(null=True, blank=True, verbose_name="Fecha Valor")
    tipo = models.CharField(max_length=20, choices=TIPO_MOVIMIENTO, verbose_name="Tipo")
    concepto = models.CharField(max_length=255, verbose_name="Concepto")
    monto = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Monto")
    
    # Referencia
    referencia_bancaria = models.CharField(max_length=100, blank=True, verbose_name="Referencia Banco (Cheque, Referencia)")
    documento_origen = models.CharField(max_length=100, blank=True, verbose_name="Documento Origen (Factura, OC)")
    
    # Tercero
    tercero_nombre = models.CharField(max_length=200, blank=True, verbose_name="Nombre Tercero")
    tercero_nit = models.CharField(max_length=20, blank=True, verbose_name="NIT Tercero")
    tercero_banco = models.CharField(max_length=100, blank=True, verbose_name="Banco Tercero")
    tercero_cuenta = models.CharField(max_length=30, blank=True, verbose_name="Cuenta Tercero")
    
    # Control
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente', verbose_name="Estado")
    conciliado = models.BooleanField(default=False, verbose_name="¿Conciliado?")
    fecha_conciliacion = models.DateField(null=True, blank=True, verbose_name="Fecha Conciliación")
    
    # Vinculación Contable
    asiento_contable = models.ForeignKey('contabilidad.AsientoContable', on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Asiento Contable")
    
    # Auditoría
    usuario_creador = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='movimientos_tesoreria_creados')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    observaciones = models.TextField(blank=True, verbose_name="Observaciones")

    def __str__(self):
        return f"{self.numero_movimiento} - {self.concepto} - ${self.monto:,.0f}"

    def clean(self):
        """Validaciones antes de guardar"""
        if self.monto <= 0:
            raise ValidationError("El monto debe ser mayor a 0")
        
        if not self.cuenta_banco.activa:
            raise ValidationError("La cuenta bancaria está inactiva")

    class Meta:
        verbose_name = "Movimiento de Tesorería"
        verbose_name_plural = "Movimientos de Tesorería"
        ordering = ['-fecha', '-fecha_creacion']
        indexes = [
            models.Index(fields=['cuenta_banco', 'fecha']),
            models.Index(fields=['estado', 'conciliado']),
            models.Index(fields=['numero_movimiento']),
        ]


# ═══════════════════════════════════════════════════════
# 3. CONCILIACIÓN BANCARIA
# ═══════════════════════════════════════════════════════

class ConciliacionBancaria(models.Model):
    """
    Proceso de conciliación bancaria mensual
    """
    ESTADO_CHOICES = [
        ('en_proceso', 'En Proceso'),
        ('completada', 'Completada'),
        ('reversada', 'Reversada'),
    ]

    # Identificación
    numero_conciliacion = models.CharField(max_length=30, unique=True, verbose_name="Número Conciliación")
    cuenta_banco = models.ForeignKey(CuentaBancaria, on_delete=models.PROTECT, verbose_name="Cuenta Bancaria")
    
    # Fechas
    fecha_inicio = models.DateField(verbose_name="Fecha Inicio")
    fecha_fin = models.DateField(verbose_name="Fecha Fin")
    fecha_conciliacion = models.DateTimeField(null=True, blank=True, verbose_name="Fecha Conciliación")
    
    # Saldos Iniciales
    saldo_inicial_sistema = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Saldo Inicial Sistema")
    saldo_inicial_banco = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Saldo Inicial Banco")
    
    # Totales
    total_ingresos_sistema = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Total Ingresos Sistema")
    total_ingresos_banco = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Total Ingresos Banco")
    total_egresos_sistema = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Total Egresos Sistema")
    total_egresos_banco = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Total Egresos Banco")
    
    # Saldos Finales
    saldo_final_sistema = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Saldo Final Sistema")
    saldo_final_banco = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Saldo Final Banco")
    
    # Diferencia
    diferencia_total = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Diferencia Total")
    
    # Estado
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='en_proceso', verbose_name="Estado")
    conciliada = models.BooleanField(default=False, verbose_name="¿Conciliada?")
    
    # Usuario
    usuario_conciliador = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Usuario Conciliador")
    
    # Observaciones
    notas = models.TextField(blank=True, verbose_name="Notas")
    
    # Auditoría
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.numero_conciliacion} - {self.cuenta_banco} ({self.fecha_inicio} - {self.fecha_fin})"

    def calcular_diferencia(self):
        """Calcula la diferencia entre banco y sistema"""
        self.diferencia_total = self.saldo_final_banco - self.saldo_final_sistema
        return self.diferencia_total

    def obtener_movimientos_sin_conciliar(self):
        """Obtiene movimientos del período sin conciliar"""
        return MovimientoTesoreria.objects.filter(
            cuenta_banco=self.cuenta_banco,
            fecha__gte=self.fecha_inicio,
            fecha__lte=self.fecha_fin,
            conciliado=False,
            estado='confirmado'
        )

    class Meta:
        verbose_name = "Conciliación Bancaria"
        verbose_name_plural = "Conciliaciones Bancarias"
        ordering = ['-fecha_fin']


# ═══════════════════════════════════════════════════════
# 4. GESTIÓN DE CHEQUES
# ═══════════════════════════════════════════════════════

class Cheque(models.Model):
    """
    Gestión de cheques emitidos y recibidos
    """
    TIPO_CHOICES = [
        ('emitido', 'Emitido'),
        ('recibido', 'Recibido'),
    ]
    
    ESTADO_CHOICES = [
        ('emitido', 'Emitido'),
        ('entregado', 'Entregado'),
        ('cobrado', 'Cobrado'),
        ('devuelto', 'Devuelto'),
        ('cancelado', 'Cancelado'),
    ]

    # Identificación
    numero_cheque = models.CharField(max_length=20, unique=True, verbose_name="Número Cheque")
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, verbose_name="Tipo")
    
    # Datos del cheque
    cuenta_banco = models.ForeignKey(CuentaBancaria, on_delete=models.PROTECT, related_name='cheques', verbose_name="Cuenta Bancaria")
    fecha_emision = models.DateField(verbose_name="Fecha Emisión")
    fecha_vencimiento = models.DateField(verbose_name="Fecha Vencimiento")
    monto = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Monto")
    
    # Beneficiario
    beneficiario = models.CharField(max_length=200, verbose_name="Beneficiario")
    concepto = models.CharField(max_length=255, verbose_name="Concepto")
    
    # Control
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='emitido', verbose_name="Estado")
    fecha_cobro = models.DateField(null=True, blank=True, verbose_name="Fecha Cobro")
    razon_devolucion = models.TextField(blank=True, verbose_name="Razón Devolución")
    
    # Vinculación
    movimiento_tesoreria = models.OneToOneField(MovimientoTesoreria, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Movimiento Tesorería")
    
    # Auditoría
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cheque {self.numero_cheque} - ${self.monto:,.0f}"

    class Meta:
        verbose_name = "Cheque"
        verbose_name_plural = "Cheques"
        ordering = ['-fecha_emision']


# ═══════════════════════════════════════════════════════
# 5. PROYECCIÓN DE FLUJO DE CAJA
# ═══════════════════════════════════════════════════════

class ProyeccionFlujoCaja(models.Model):
    """
    Proyección de flujo de caja (30, 60, 90 días)
    """
    ESCENARIO_CHOICES = [
        ('pesimista', 'Pesimista'),
        ('conservador', 'Conservador'),
        ('optimista', 'Optimista'),
    ]

    # Identificación
    numero_proyeccion = models.CharField(max_length=30, unique=True, verbose_name="Número Proyección")
    cuenta_banco = models.ForeignKey(CuentaBancaria, on_delete=models.PROTECT, verbose_name="Cuenta Bancaria")
    
    # Fechas
    fecha_inicio = models.DateField(verbose_name="Fecha Inicio")
    fecha_fin = models.DateField(verbose_name="Fecha Fin")
    escenario = models.CharField(max_length=20, choices=ESCENARIO_CHOICES, default='conservador', verbose_name="Escenario")
    
    # Datos
    saldo_inicial = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Saldo Inicial")
    ingresos_proyectados = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Ingresos Proyectados")
    egresos_proyectados = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Egresos Proyectados")
    saldo_final_proyectado = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Saldo Final Proyectado")
    
    # Análisis
    dias_cobertura = models.IntegerField(null=True, blank=True, verbose_name="Días de Cobertura")
    alerta_insolvencia = models.BooleanField(default=False, verbose_name="¿Alerta de Insolvencia?")
    
    # Auditoría
    usuario_creador = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Proyección {self.numero_proyeccion} ({self.escenario})"

    def calcular_saldo_final(self):
        """Calcula saldo final proyectado"""
        self.saldo_final_proyectado = self.saldo_inicial + self.ingresos_proyectados - self.egresos_proyectados
        return self.saldo_final_proyectado

    def calcular_dias_cobertura(self):
        """Calcula días de cobertura con egresos diarios promedio"""
        dias = (self.fecha_fin - self.fecha_inicio).days
        if dias > 0 and self.egresos_proyectados > 0:
            egreso_diario = self.egresos_proyectados / dias
            self.dias_cobertura = int(self.saldo_final_proyectado / egreso_diario) if egreso_diario > 0 else None
        return self.dias_cobertura

    class Meta:
        verbose_name = "Proyección Flujo Caja"
        verbose_name_plural = "Proyecciones Flujo Caja"
        ordering = ['-fecha_inicio']


# ═══════════════════════════════════════════════════════
# 6. INDICADORES DE TESORERÍA (KPIs)
# ═══════════════════════════════════════════════════════

class IndicadorTesoreria(models.Model):
    """
    KPIs y métricas de tesorería para análisis
    """
    TIPO_INDICADOR = [
        ('liquidez', 'Liquidez'),
        ('solvencia', 'Solvencia'),
        ('cobertura', 'Cobertura'),
        ('eficiencia', 'Eficiencia'),
    ]

    # Identificación
    nombre = models.CharField(max_length=100, verbose_name="Nombre Indicador")
    codigo = models.CharField(max_length=30, unique=True, verbose_name="Código")
    tipo = models.CharField(max_length=20, choices=TIPO_INDICADOR, verbose_name="Tipo")
    
    # Descripción
    descripcion = models.TextField(verbose_name="Descripción")
    formula = models.TextField(verbose_name="Fórmula de Cálculo")
    
    # Umbrales
    valor_minimo = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name="Valor Mínimo Aceptable")
    valor_maximo = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name="Valor Máximo Aceptable")
    valor_objetivo = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name="Valor Objetivo")
    
    # Control
    activo = models.BooleanField(default=True, verbose_name="Activo")

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Indicador Tesorería"
        verbose_name_plural = "Indicadores Tesorería"
        ordering = ['tipo', 'nombre']


class RegistroIndicador(models.Model):
    """
    Registro histórico de indicadores
    """
    indicador = models.ForeignKey(IndicadorTesoreria, on_delete=models.CASCADE, related_name='registros')
    fecha = models.DateField(verbose_name="Fecha")
    valor_real = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Valor Real")
    estado = models.CharField(
        max_length=20,
        choices=[
            ('excelente', 'Excelente'),
            ('bueno', 'Bueno'),
            ('aceptable', 'Aceptable'),
            ('alerta', 'Alerta'),
            ('crítico', 'Crítico'),
        ],
        verbose_name="Estado"
    )
    observaciones = models.TextField(blank=True)
    
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.indicador.nombre} - {self.fecha}"

    class Meta:
        verbose_name = "Registro Indicador"
        verbose_name_plural = "Registros Indicadores"
        ordering = ['-fecha']
