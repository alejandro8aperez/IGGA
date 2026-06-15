from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from decimal import Decimal


# ═══════════════════════════════════════════════════════
# 1. CATÁLOGOS BÁSICOS
# ═══════════════════════════════════════════════════════

class CentroCosto(models.Model):
    """
    Centros de costo para análisis de gastos por área
    """
    codigo = models.CharField(max_length=20, unique=True, verbose_name="Código")
    nombre = models.CharField(max_length=100, verbose_name="Nombre del Centro")
    descripcion = models.TextField(blank=True, verbose_name="Descripción")
    
    TIPO_CHOICES = [
        ('produccion', 'Producción'),
        ('administrativo', 'Administrativo'),
        ('ventas', 'Ventas'),
        ('distribucion', 'Distribución'),
        ('servicios', 'Servicios'),
        ('otro', 'Otro'),
    ]
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='administrativo', verbose_name="Tipo")
    
    responsable = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='centros_costo_contabilidad', verbose_name="Responsable")
    presupuesto_anual = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name="Presupuesto Anual")
    activo = models.BooleanField(default=True, verbose_name="Activo")
    
    # Auditoría
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

    class Meta:
        verbose_name = "Centro de Costo"
        verbose_name_plural = "Centros de Costo"
        ordering = ['codigo']


# ═══════════════════════════════════════════════════════
# 2. PERÍODO CONTABLE - MEJORADO
# ═══════════════════════════════════════════════════════

class PeriodoContable(models.Model):
    """
    Períodos contables (meses, trimestres, años fiscales)
    MEJORADO: + auditoría, + usuario cierre, + validaciones
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
    
    # Cierre
    fecha_cierre = models.DateTimeField(null=True, blank=True, verbose_name="Fecha de Cierre")
    usuario_cierre = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Usuario que cerró")
    asiento_cierre = models.ForeignKey('AsientoContable', on_delete=models.SET_NULL, null=True, blank=True, related_name='cierre_periodo')
    
    # Resultados
    resultado = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Resultado del Período")
    utilidad_retenida = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Utilidad Retenida")
    
    # Auditoría
    permite_descuadre = models.BooleanField(default=False, verbose_name="¿Permite descuadre?")

    def __str__(self):
        return f"{self.nombre} ({self.fecha_inicio.strftime('%Y-%m-%d')} - {self.fecha_fin.strftime('%Y-%m-%d')})"

    def puede_cerrarse(self):
        """Valida si período puede cerrarse"""
        # Todas las cuentas deben estar balanceadas
        for cuenta in Cuenta.objects.filter(activa=True):
            if not self.permite_descuadre:
                saldo = cuenta.get_saldo_periodo(self)
                if saldo != 0 and not cuenta.requiere_tercero:
                    return False, f"Cuenta {cuenta.codigo} descuadrada"
        return True, "OK"

    class Meta:
        verbose_name = "Período Contable"
        verbose_name_plural = "Períodos Contables"
        ordering = ['-fecha_inicio']


# ═══════════════════════════════════════════════════════
# 3. CUENTA - MEJORADA
# ═══════════════════════════════════════════════════════

class Cuenta(models.Model):
    """
    Catálogo de cuentas contables (Plan Único de Cuentas - PUC Colombia)
    MEJORADO: + naturaleza, + validaciones, + controladores
    """
    TIPO_CHOICES = [
        ('activo', 'Activo'),
        ('pasivo', 'Pasivo'),
        ('patrimonio', 'Patrimonio'),
        ('ingreso', 'Ingreso'),
        ('gasto', 'Gasto'),
    ]
    
    NATURALEZA_CHOICES = [
        ('deudora', 'Deudora'),
        ('acreedora', 'Acreedora'),
    ]

    # Identificación PUC
    codigo = models.CharField(max_length=20, unique=True, verbose_name="Código PUC")
    nombre = models.CharField(max_length=100, verbose_name="Nombre de la Cuenta")
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, verbose_name="Tipo de Cuenta")
    nivel = models.PositiveSmallIntegerField(default=2, verbose_name="Nivel (1=Mayor, 2=Auxiliar, 3=Sub, 4=Detalle)")
    
    # Jerárquico
    cuenta_padre = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcuentas', verbose_name="Cuenta Padre")
    
    # Características
    naturaleza = models.CharField(max_length=10, choices=NATURALEZA_CHOICES, verbose_name="Naturaleza")
    requiere_tercero = models.BooleanField(default=False, verbose_name="¿Requiere Tercero (Cliente/Proveedor)?")
    requiere_centro_costo = models.BooleanField(default=False, verbose_name="¿Requiere Centro de Costo?")
    requiere_proyecto = models.BooleanField(default=False, verbose_name="¿Requiere Proyecto?")
    es_verificable = models.BooleanField(default=True, verbose_name="¿Es verificable en flujo?")
    
    # Control
    activa = models.BooleanField(default=True, verbose_name="Cuenta Activa")
    saldo_minimo = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name="Saldo Mínimo Permitido")
    saldo_maximo = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name="Saldo Máximo Permitido")
    clasificacion_dian = models.CharField(max_length=10, blank=True, verbose_name="Clasificación DIAN")

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

    def get_saldo(self, fecha_hasta=None):
        """Calcula el saldo real de la cuenta (CORREGIDO)"""
        from datetime import datetime
        movimientos = self.movimientos.filter(asiento_contable__estado='confirmado')
        
        if fecha_hasta:
            movimientos = movimientos.filter(asiento_contable__fecha__lte=fecha_hasta)
        
        total_debe = movimientos.aggregate(models.Sum('debe'))['debe__sum'] or Decimal('0.00')
        total_haber = movimientos.aggregate(models.Sum('haber'))['haber__sum'] or Decimal('0.00')
        
        # Calcula según naturaleza
        if self.naturaleza == 'deudora':
            saldo = total_debe - total_haber
        else:  # acreedora
            saldo = total_haber - total_debe
            
        return Decimal(str(saldo))

    def get_saldo_periodo(self, periodo):
        """Obtiene saldo para un período específico"""
        movimientos = self.movimientos.filter(
            asiento_contable__estado='confirmado',
            asiento_contable__periodo_contable=periodo
        )
        
        total_debe = movimientos.aggregate(models.Sum('debe'))['debe__sum'] or Decimal('0.00')
        total_haber = movimientos.aggregate(models.Sum('haber'))['haber__sum'] or Decimal('0.00')
        
        if self.naturaleza == 'deudora':
            saldo = total_debe - total_haber
        else:
            saldo = total_haber - total_debe
            
        return Decimal(str(saldo))

    def validar_limites_saldo(self):
        """Valida si saldo está dentro de límites permitidos"""
        saldo = self.get_saldo()
        
        if self.saldo_minimo and saldo < self.saldo_minimo:
            return False, f"Saldo ({saldo}) por debajo del mínimo ({self.saldo_minimo})"
        
        if self.saldo_maximo and saldo > self.saldo_maximo:
            return False, f"Saldo ({saldo}) por encima del máximo ({self.saldo_maximo})"
        
        return True, "OK"

    class Meta:
        verbose_name = "Cuenta Contable"
        verbose_name_plural = "Catálogo de Cuentas"
        ordering = ['codigo']
        indexes = [
            models.Index(fields=['codigo', 'activa']),
            models.Index(fields=['tipo']),
        ]


# ═══════════════════════════════════════════════════════
# 4. ASIENTO CONTABLE - MEJORADO
# ═══════════════════════════════════════════════════════

class AsientoContable(models.Model):
    """
    Modelo central del Libro Mayor (General Ledger).
    Registra cada movimiento financiero disparado por los módulos del ERP.
    MEJORADO: + numeración, + estado, + auditoría, + usuario_creador
    """
    TIPO_CHOICES = [
        ('ingreso', 'Ingreso (Entrada de Dinero)'),
        ('egreso', 'Egreso (Salida de Dinero)'),
        ('ajuste', 'Ajuste Contable'),
        ('contra_asiento', 'Contra-asiento (Reverso)'),
    ]
    
    ESTADO_CHOICES = [
        ('borrador', 'Borrador'),
        ('confirmado', 'Confirmado'),
        ('reversado', 'Reversado'),
        ('procesado', 'Procesado'),
    ]

    # Identificación
    numero_asiento = models.CharField(max_length=20, unique=True, verbose_name="Número Asiento")
    periodo_contable = models.ForeignKey(PeriodoContable, null=True, blank=True, on_delete=models.PROTECT, verbose_name="Período")
    
    # Datos principales
    fecha = models.DateTimeField(auto_now_add=True, verbose_name="Fecha del Registro")
    fecha_documento = models.DateField(verbose_name="Fecha Documento", null=True, blank=True)
    descripcion = models.CharField(max_length=255, verbose_name="Concepto/Descripción")
    referencia = models.CharField(max_length=100, blank=True, verbose_name="Referencia Documento")
    
    # Importes
    valor = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Monto Total")
    total_debe = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Total Débitos")
    total_haber = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Total Créditos")
    
    # Clasificación
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='ingreso', verbose_name="Tipo de Movimiento")
    modulo_origen = models.CharField(max_length=50, default='sistema', verbose_name="Módulo de Origen")
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='borrador', verbose_name="Estado")
    
    # Auditoría - Creación
    usuario_creador = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='asientos_creados', verbose_name="Usuario Creador")
    
    # Auditoría - Modificación
    usuario_modificador = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='asientos_modificados', verbose_name="Usuario Modificador")
    fecha_modificacion = models.DateTimeField(auto_now=True, verbose_name="Fecha Modificación")
    
    # Reverso
    asiento_original = models.OneToOneField('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='asiento_reverso', verbose_name="Asiento Original (si es reverso)")
    motivo_reverso = models.TextField(blank=True, verbose_name="Motivo del Reverso")
    
    # Flexible
    comentarios = models.TextField(blank=True, verbose_name="Comentarios")
    metadata = models.JSONField(default=dict, blank=True, null=True, verbose_name="Datos Adicionales (JSON)")

    def __str__(self):
        return f"[{self.numero_asiento}] {self.fecha.strftime('%d/%m/%Y')} - {self.descripcion} - ${self.valor:,.0f}"

    def confirmar(self):
        """Confirma el asiento (no permite edición posterior)"""
        if self.estado != 'borrador':
            raise ValidationError("Solo se pueden confirmar asientos en borrador")
        
        # Valida integridad
        self.validar_integridad()
        
        self.estado = 'confirmado'
        self.save()

    def validar_integridad(self):
        """Valida que debe = haber y otros controles"""
        if self.total_debe != self.total_haber:
            raise ValidationError(f"Asiento descuadrado: Debe ({self.total_debe}) ≠ Haber ({self.total_haber})")
        
        movimientos = self.movimientos.all()
        if movimientos.count() < 2:
            raise ValidationError("El asiento debe tener al menos 2 movimientos")
        
        for mov in movimientos:
            if mov.debe > 0 and mov.haber > 0:
                raise ValidationError(f"Movimiento {mov.id} tiene debe y haber al mismo tiempo")

    def puede_modificarse(self):
        """Verifica si el asiento puede modificarse"""
        return self.estado == 'borrador' and self.periodo_contable.estado == 'abierto'

    def puede_reversarse(self):
        """Verifica si el asiento puede reversarse"""
        return self.estado in ['borrador', 'confirmado']

    def reversar(self, motivo, usuario):
        """Crea un asiento de reverso"""
        if not self.puede_reversarse():
            raise ValidationError("Este asiento no puede reversarse")
        
        # Crear asiento de reverso
        reverso = AsientoContable.objects.create(
            numero_asiento=f"REVERSO-{self.numero_asiento}",
            periodo_contable=self.periodo_contable,
            fecha_documento=self.fecha_documento,
            descripcion=f"REVERSO: {self.descripcion}",
            referencia=self.referencia,
            valor=self.valor,
            total_debe=self.total_haber,
            total_haber=self.total_debe,
            tipo='contra_asiento',
            modulo_origen=self.modulo_origen,
            estado='borrador',
            usuario_creador=usuario,
            asiento_original=self,
            motivo_reverso=motivo,
        )
        
        # Crear movimientos de reverso (invertidos)
        for mov in self.movimientos.all():
            MovimientoContable.objects.create(
                asiento_contable=reverso,
                cuenta=mov.cuenta,
                descripcion=f"Reverso: {mov.descripcion}",
                debe=mov.haber,
                haber=mov.debe,
                centro_costo=mov.centro_costo,
                proyecto=mov.proyecto,
                linea=mov.linea,
            )
        
        # Marcar original como reversado
        self.estado = 'reversado'
        self.save()
        
        return reverso

    class Meta:
        verbose_name = "Asiento Contable"
        verbose_name_plural = "Libro Mayor (Asientos Contables)"
        ordering = ['-fecha']
        indexes = [
            models.Index(fields=['fecha', 'modulo_origen']),
            models.Index(fields=['estado', 'periodo_contable']),
            models.Index(fields=['numero_asiento']),
        ]


# ═══════════════════════════════════════════════════════
# 5. MOVIMIENTO CONTABLE - MEJORADO
# ═══════════════════════════════════════════════════════

class MovimientoContable(models.Model):
    """
    Movimientos contables asociados a un asiento contable (Partida Doble).
    MEJORADO: + centro_costo, + proyecto, + linea
    """
    asiento_contable = models.ForeignKey(AsientoContable, on_delete=models.CASCADE, null=True, related_name='movimientos')
    cuenta = models.ForeignKey(Cuenta, on_delete=models.CASCADE, related_name='movimientos')
    
    # Datos básicos
    descripcion = models.CharField(max_length=255, blank=True, verbose_name="Descripción del Movimiento")
    debe = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Débito")
    haber = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Crédito")
    
    # Segmentación
    centro_costo = models.ForeignKey(CentroCosto, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Centro de Costo")
    proyecto = models.ForeignKey('proyectos.Proyecto', on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Proyecto")
    
    # Referencia
    documento_referencia = models.CharField(max_length=100, blank=True, verbose_name="Documento Referencia")
    tercero = models.CharField(max_length=100, blank=True, verbose_name="Tercero (Cliente/Proveedor)")
    linea = models.PositiveSmallIntegerField(default=1, verbose_name="Línea en Asiento")
    porcentaje = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name="Porcentaje (si aplica)")

    def __str__(self):
        tipo = "DEBE" if self.debe > 0 else "HABER"
        monto = self.debe if self.debe > 0 else self.haber
        fecha_str = self.asiento_contable.fecha.strftime('%d/%m/%Y') if self.asiento_contable else 'N/A'
        return f"{fecha_str} - {self.cuenta.codigo} - {tipo} ${monto:,.0f}"

    def clean(self):
        """Validaciones antes de guardar"""
        if self.debe > 0 and self.haber > 0:
            raise ValidationError("Un movimiento no puede tener débito y crédito al mismo tiempo")
        
        if self.debe == 0 and self.haber == 0:
            raise ValidationError("El movimiento debe tener un monto debe o haber")
        
        if self.cuenta.requiere_centro_costo and not self.centro_costo:
            raise ValidationError(f"La cuenta {self.cuenta.codigo} requiere un centro de costo")
        
        if self.cuenta.requiere_proyecto and not self.proyecto:
            raise ValidationError(f"La cuenta {self.cuenta.codigo} requiere un proyecto")

    class Meta:
        verbose_name = "Movimiento Contable"
        verbose_name_plural = "Movimientos Contables"
        ordering = ['asiento_contable', 'linea']
        indexes = [
            models.Index(fields=['asiento_contable', 'linea']),
            models.Index(fields=['cuenta', 'centro_costo']),
        ]


# ═══════════════════════════════════════════════════════
# 6. RETENCIONES (NUEVO)
# ═══════════════════════════════════════════════════════

class Retencion(models.Model):
    """
    Gestión de retenciones en la fuente (RTE-FUENTE) y retenciones RETEICA
    """
    TIPO_RETENCION = [
        ('rte-fuente', 'Retención en la Fuente'),
        ('reteica', 'RETEICA'),
        ('rete-iva', 'RETE IVA'),
        ('otra', 'Otra'),
    ]
    
    TIPO_TERCERO = [
        ('proveedor', 'Proveedor'),
        ('cliente', 'Cliente'),
    ]

    numero_documento = models.CharField(max_length=50, unique=True, verbose_name="Número Documento")
    fecha = models.DateField(verbose_name="Fecha")
    tipo_retencion = models.CharField(max_length=20, choices=TIPO_RETENCION, verbose_name="Tipo Retencion")
    
    # Tercero
    tipo_tercero = models.CharField(max_length=20, choices=TIPO_TERCERO, verbose_name="Tipo Tercero")
    tercero_nit = models.CharField(max_length=20, verbose_name="NIT Tercero")
    tercero_nombre = models.CharField(max_length=200, verbose_name="Nombre Tercero")
    
    # Importes
    base_retencion = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Base Retención")
    porcentaje_retencion = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Porcentaje (%)")
    valor_retencion = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Valor Retención")
    
    # Referencia
    documento_origen = models.CharField(max_length=100, verbose_name="Documento Origen (Factura, OC)")
    asiento_contable = models.ForeignKey(AsientoContable, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Asiento Contable")
    
    # Auditoría
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Usuario")
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.numero_documento} - {self.tipo_retencion} - ${self.valor_retencion:,.0f}"

    def calcular_valor(self):
        """Calcula automáticamente el valor de retención"""
        self.valor_retencion = self.base_retencion * (self.porcentaje_retencion / 100)
        return self.valor_retencion

    class Meta:
        verbose_name = "Retención"
        verbose_name_plural = "Retenciones"
        ordering = ['-fecha']


# ═══════════════════════════════════════════════════════
# 7. AUDITORÍA Y CONTROL (NUEVO)
# ═══════════════════════════════════════════════════════

class ControlAuditoria(models.Model):
    """
    Trail completo de auditoría de los asientos contables
    """
    ACCION_CHOICES = [
        ('creacion', 'Creación'),
        ('modificacion', 'Modificación'),
        ('confirmacion', 'Confirmación'),
        ('reverso', 'Reverso'),
        ('acceso', 'Acceso a Información'),
        ('exportacion', 'Exportación'),
        ('otro', 'Otro'),
    ]

    asiento = models.ForeignKey(AsientoContable, on_delete=models.CASCADE, related_name='auditorias', verbose_name="Asiento")
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Usuario")
    accion = models.CharField(max_length=20, choices=ACCION_CHOICES, verbose_name="Acción")
    descripcion = models.TextField(verbose_name="Descripción de Cambios")
    direccion_ip = models.GenericIPAddressField(null=True, blank=True, verbose_name="Dirección IP")
    fecha_hora = models.DateTimeField(auto_now_add=True, verbose_name="Fecha/Hora")
    datos_anteriores = models.JSONField(null=True, blank=True, verbose_name="Datos Anteriores")
    datos_nuevos = models.JSONField(null=True, blank=True, verbose_name="Datos Nuevos")

    def __str__(self):
        return f"{self.asiento.numero_asiento} - {self.accion} - {self.fecha_hora.strftime('%d/%m/%Y %H:%M')}"

    class Meta:
        verbose_name = "Control de Auditoría"
        verbose_name_plural = "Controles de Auditoría"
        ordering = ['-fecha_hora']
        indexes = [
            models.Index(fields=['asiento', 'fecha_hora']),
            models.Index(fields=['usuario', 'accion']),
        ]
