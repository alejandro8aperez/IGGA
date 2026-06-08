from decimal import Decimal
from datetime import datetime, timedelta
from django.db import transaction
from django.core.exceptions import ValidationError
from django.db.models import Sum, Q
from .models import (
    AsientoContable, Cuenta, MovimientoContable, PeriodoContable, 
    CentroCosto, Retencion, ControlAuditoria
)


# ═══════════════════════════════════════════════════════
# SERVICIOS DE VALIDACIÓN
# ═══════════════════════════════════════════════════════

class ValidacionAsientos:
    """Validaciones para asientos contables"""
    
    @staticmethod
    def validar_integridad_asiento(asiento):
        """Valida que el asiento esté balanceado"""
        if asiento.total_debe != asiento.total_haber:
            raise ValidationError(
                f"Asiento descuadrado: Debe (${asiento.total_debe:,.2f}) ≠ Haber (${asiento.total_haber:,.2f})"
            )
        
        movimientos = asiento.movimientos.all()
        if movimientos.count() < 2:
            raise ValidationError("El asiento debe tener al menos 2 movimientos contables")
        
        # Valida que no hay movimientos con debe y haber
        for mov in movimientos:
            if mov.debe > 0 and mov.haber > 0:
                raise ValidationError(f"Movimiento línea {mov.linea}: No puede tener débito y crédito simultáneamente")
        
        return True

    @staticmethod
    def validar_periodo_abierto(periodo):
        """Verifica que el período esté abierto"""
        if periodo.estado != 'abierto':
            raise ValidationError(f"El período {periodo.nombre} no está abierto para movimientos")
        return True

    @staticmethod
    def validar_cuenta_activa(cuenta):
        """Verifica que la cuenta esté activa"""
        if not cuenta.activa:
            raise ValidationError(f"La cuenta {cuenta.codigo} está inactiva")
        return True

    @staticmethod
    def validar_limites_saldo(cuenta):
        """Valida límites de saldo de la cuenta"""
        saldo = cuenta.get_saldo()
        
        if cuenta.saldo_minimo and saldo < cuenta.saldo_minimo:
            raise ValidationError(
                f"Saldo de {cuenta.codigo} (${saldo:,.2f}) por debajo del mínimo (${cuenta.saldo_minimo:,.2f})"
            )
        
        if cuenta.saldo_maximo and saldo > cuenta.saldo_maximo:
            raise ValidationError(
                f"Saldo de {cuenta.codigo} (${saldo:,.2f}) por encima del máximo (${cuenta.saldo_maximo:,.2f})"
            )
        
        return True

    @staticmethod
    def validar_requerimientos_movimiento(movimiento):
        """Valida que el movimiento cumpla con los requerimientos de la cuenta"""
        cuenta = movimiento.cuenta
        
        if cuenta.requiere_tercero and not movimiento.tercero:
            raise ValidationError(f"La cuenta {cuenta.codigo} requiere un tercero (cliente/proveedor)")
        
        if cuenta.requiere_centro_costo and not movimiento.centro_costo:
            raise ValidationError(f"La cuenta {cuenta.codigo} requiere un centro de costo")
        
        if cuenta.requiere_proyecto and not movimiento.proyecto:
            raise ValidationError(f"La cuenta {cuenta.codigo} requiere un proyecto")
        
        return True


# ═══════════════════════════════════════════════════════
# SERVICIOS DE CÁLCULOS
# ═══════════════════════════════════════════════════════

class CalculoSaldos:
    """Calcula saldos contables de forma correcta"""
    
    @staticmethod
    def get_saldo_cuenta_periodo(cuenta, periodo):
        """Obtiene el saldo de una cuenta para un período específico"""
        movimientos = MovimientoContable.objects.filter(
            cuenta=cuenta,
            asiento_contable__periodo_contable=periodo,
            asiento_contable__estado='confirmado'
        )
        
        total_debe = movimientos.aggregate(Sum('debe'))['debe__sum'] or Decimal('0.00')
        total_haber = movimientos.aggregate(Sum('haber'))['haber__sum'] or Decimal('0.00')
        
        if cuenta.naturaleza == 'deudora':
            saldo = Decimal(str(total_debe)) - Decimal(str(total_haber))
        else:  # acreedora
            saldo = Decimal(str(total_haber)) - Decimal(str(total_debe))
        
        return Decimal(str(saldo))

    @staticmethod
    def get_saldo_cuenta_acumulado(cuenta, hasta_periodo=None):
        """Obtiene el saldo acumulado de una cuenta hasta un período"""
        query = MovimientoContable.objects.filter(
            cuenta=cuenta,
            asiento_contable__estado='confirmado'
        )
        
        if hasta_periodo:
            query = query.filter(asiento_contable__periodo_contable__fecha_fin__lte=hasta_periodo.fecha_fin)
        
        total_debe = query.aggregate(Sum('debe'))['debe__sum'] or Decimal('0.00')
        total_haber = query.aggregate(Sum('haber'))['haber__sum'] or Decimal('0.00')
        
        if cuenta.naturaleza == 'deudora':
            saldo = Decimal(str(total_debe)) - Decimal(str(total_haber))
        else:
            saldo = Decimal(str(total_haber)) - Decimal(str(total_debe))
        
        return Decimal(str(saldo))

    @staticmethod
    def get_balance_general(periodo):
        """Genera el balance general completo para un período"""
        balance = {
            'activos': {'total': Decimal('0.00'), 'cuentas': []},
            'pasivos': {'total': Decimal('0.00'), 'cuentas': []},
            'patrimonio': {'total': Decimal('0.00'), 'cuentas': []},
        }
        
        cuentas = Cuenta.objects.filter(activa=True, tipo__in=['activo', 'pasivo', 'patrimonio']).order_by('codigo')
        
        for cuenta in cuentas:
            saldo = CalculoSaldos.get_saldo_cuenta_periodo(cuenta, periodo)
            
            cuenta_data = {
                'id': cuenta.id,
                'codigo': cuenta.codigo,
                'nombre': cuenta.nombre,
                'saldo': saldo,
            }
            
            if cuenta.tipo == 'activo':
                balance['activos']['cuentas'].append(cuenta_data)
                balance['activos']['total'] += saldo
            elif cuenta.tipo == 'pasivo':
                balance['pasivos']['cuentas'].append(cuenta_data)
                balance['pasivos']['total'] += saldo
            elif cuenta.tipo == 'patrimonio':
                balance['patrimonio']['cuentas'].append(cuenta_data)
                balance['patrimonio']['total'] += saldo
        
        balance['verificacion'] = balance['activos']['total'] == (balance['pasivos']['total'] + balance['patrimonio']['total'])
        
        return balance

    @staticmethod
    def get_estado_resultados(periodo):
        """Genera el estado de resultados para un período"""
        resultados = {
            'ingresos': {'total': Decimal('0.00'), 'cuentas': []},
            'gastos': {'total': Decimal('0.00'), 'cuentas': []},
            'resultado_neto': Decimal('0.00'),
        }
        
        # Ingresos
        cuentas_ingresos = Cuenta.objects.filter(activa=True, tipo='ingreso').order_by('codigo')
        for cuenta in cuentas_ingresos:
            saldo = abs(CalculoSaldos.get_saldo_cuenta_periodo(cuenta, periodo))
            resultados['ingresos']['cuentas'].append({
                'id': cuenta.id,
                'codigo': cuenta.codigo,
                'nombre': cuenta.nombre,
                'valor': saldo,
            })
            resultados['ingresos']['total'] += saldo
        
        # Gastos
        cuentas_gastos = Cuenta.objects.filter(activa=True, tipo='gasto').order_by('codigo')
        for cuenta in cuentas_gastos:
            saldo = abs(CalculoSaldos.get_saldo_cuenta_periodo(cuenta, periodo))
            resultados['gastos']['cuentas'].append({
                'id': cuenta.id,
                'codigo': cuenta.codigo,
                'nombre': cuenta.nombre,
                'valor': saldo,
            })
            resultados['gastos']['total'] += saldo
        
        resultados['resultado_neto'] = resultados['ingresos']['total'] - resultados['gastos']['total']
        
        return resultados


# ═══════════════════════════════════════════════════════
# SERVICIOS DE OPERACIONES
# ═══════════════════════════════════════════════════════

def obtener_cuenta(codigo, nombre, tipo, nivel=2, naturaleza='deudora'):
    """Obtiene o crea una cuenta contable"""
    cuenta, _ = Cuenta.objects.get_or_create(
        codigo=codigo,
        defaults={
            'nombre': nombre,
            'tipo': tipo,
            'nivel': nivel,
            'naturaleza': naturaleza
        }
    )
    return cuenta


@transaction.atomic
def crear_asiento_contable(
    numero_asiento, periodo_contable, fecha_documento, descripcion, 
    referencia, movimientos_data, tipo='ingreso', modulo_origen='sistema',
    usuario=None, metadata=None
):
    """
    Crea un asiento contable con validaciones completas
    
    movimientos_data = [
        {
            'cuenta': Cuenta objeto,
            'debe': Decimal,
            'haber': Decimal,
            'descripcion': str,
            'centro_costo': CentroCosto (opcional),
            'proyecto': Proyecto (opcional),
            'tercero': str (opcional),
        }
    ]
    """
    # Validar período
    ValidacionAsientos.validar_periodo_abierto(periodo_contable)
    
    # Calcular totales
    total_debe = sum(Decimal(str(m.get('debe', 0) or 0)) for m in movimientos_data)
    total_haber = sum(Decimal(str(m.get('haber', 0) or 0)) for m in movimientos_data)
    
    # Validar balance
    if total_debe != total_haber:
        raise ValidationError(f"Asiento descuadrado: Debe (${total_debe:,.2f}) ≠ Haber (${total_haber:,.2f})")
    
    if len(movimientos_data) < 2:
        raise ValidationError("El asiento debe tener al menos 2 movimientos")
    
    # Crear asiento
    asiento = AsientoContable.objects.create(
        numero_asiento=numero_asiento,
        periodo_contable=periodo_contable,
        fecha_documento=fecha_documento,
        descripcion=descripcion,
        referencia=referencia,
        valor=total_debe,
        total_debe=total_debe,
        total_haber=total_haber,
        tipo=tipo,
        modulo_origen=modulo_origen,
        usuario_creador=usuario,
        estado='borrador',
        metadata=metadata or {}
    )
    
    # Crear movimientos
    for linea, mov_data in enumerate(movimientos_data, 1):
        cuenta = mov_data['cuenta']
        
        # Validar cuenta
        ValidacionAsientos.validar_cuenta_activa(cuenta)
        ValidacionAsientos.validar_requerimientos_movimiento(
            type('obj', (object,), mov_data)()
        )
        
        MovimientoContable.objects.create(
            asiento_contable=asiento,
            cuenta=cuenta,
            descripcion=mov_data.get('descripcion', ''),
            debe=Decimal(str(mov_data.get('debe', 0) or 0)),
            haber=Decimal(str(mov_data.get('haber', 0) or 0)),
            centro_costo=mov_data.get('centro_costo'),
            proyecto=mov_data.get('proyecto'),
            tercero=mov_data.get('tercero', ''),
            documento_referencia=mov_data.get('documento_referencia', ''),
            linea=linea,
        )
    
    return asiento


@transaction.atomic
def confirmar_asiento(asiento, usuario):
    """Confirma un asiento (lo hace inmutable)"""
    if asiento.estado != 'borrador':
        raise ValidationError("Solo se pueden confirmar asientos en borrador")
    
    # Validar integridad
    ValidacionAsientos.validar_integridad_asiento(asiento)
    
    asiento.estado = 'confirmado'
    asiento.usuario_modificador = usuario
    asiento.save()
    
    # Registrar en auditoría
    ControlAuditoria.objects.create(
        asiento=asiento,
        usuario=usuario,
        accion='confirmacion',
        descripcion=f"Asiento {asiento.numero_asiento} confirmado"
    )
    
    return asiento


@transaction.atomic
def reversar_asiento(asiento, motivo, usuario):
    """Crea un asiento de reverso"""
    if not asiento.puede_reversarse():
        raise ValidationError("Este asiento no puede reversarse")
    
    asiento_reverso = asiento.reversar(motivo, usuario)
    asiento_reverso.confirmar()
    
    # Registrar en auditoría
    ControlAuditoria.objects.create(
        asiento=asiento,
        usuario=usuario,
        accion='reverso',
        descripcion=f"Asiento reversado. Motivo: {motivo}"
    )
    
    return asiento_reverso


# ═══════════════════════════════════════════════════════
# SERVICIOS DE CIERRE DE PERÍODO
# ═══════════════════════════════════════════════════════

@transaction.atomic
def cerrar_periodo(periodo, usuario):
    """Cierra un período contable"""
    
    # Validar que puede cerrarse
    puede_cerrar, msg = periodo.puede_cerrarse()
    if not puede_cerrar:
        raise ValidationError(f"No se puede cerrar el período: {msg}")
    
    # Calcular resultado
    estado_resultados = CalculoSaldos.get_estado_resultados(periodo)
    periodo.resultado = estado_resultados['resultado_neto']
    
    # Crear asiento de cierre (opcional - según política)
    # TODO: Implementar trasferencia de resultados
    
    periodo.estado = 'cerrado'
    periodo.fecha_cierre = datetime.now()
    periodo.usuario_cierre = usuario
    periodo.save()
    
    # Registrar en auditoría
    ControlAuditoria.objects.create(
        asiento=None,
        usuario=usuario,
        accion='otro',
        descripcion=f"Período {periodo.nombre} cerrado. Resultado: ${periodo.resultado:,.2f}"
    )
    
    return periodo


# ═══════════════════════════════════════════════════════
# SERVICIOS ESPECÍFICOS POR MÓDULO
# ═══════════════════════════════════════════════════════

def crear_asiento_venta(factura, usuario):
    """Crea asiento por venta (integración facturación)"""
    periodo = PeriodoContable.objects.filter(
        estado='abierto',
        fecha_inicio__lte=factura.fecha_emision.date(),
        fecha_fin__gte=factura.fecha_emision.date()
    ).first()
    
    if not periodo:
        raise ValidationError("No hay período abierto para esta fecha")
    
    cuenta_cxc = obtener_cuenta('110101', 'Cuentas por cobrar clientes', 'activo', naturaleza='deudora')
    cuenta_ingresos = obtener_cuenta('410101', 'Ingresos por ventas', 'ingreso', naturaleza='acreedora')
    
    asiento = crear_asiento_contable(
        numero_asiento=f"VENTA-{factura.id}",
        periodo_contable=periodo,
        fecha_documento=factura.fecha_emision.date(),
        descripcion=f"Venta factura {factura.numero_factura}",
        referencia=f"FAC:{factura.numero_factura}",
        movimientos_data=[
            {
                'cuenta': cuenta_cxc,
                'debe': factura.total,
                'haber': Decimal('0.00'),
                'descripcion': f'Venta cliente {factura.cliente.nombre}',
                'tercero': factura.cliente.nombre,
                'documento_referencia': factura.numero_factura,
            },
            {
                'cuenta': cuenta_ingresos,
                'debe': Decimal('0.00'),
                'haber': factura.total,
                'descripcion': 'Ingreso por ventas',
            },
        ],
        tipo='ingreso',
        modulo_origen='facturacion',
        usuario=usuario,
        metadata={'factura_id': factura.id, 'cliente_id': factura.cliente.id}
    )
    
    confirmar_asiento(asiento, usuario)
    return asiento


def crear_asiento_cobro(factura, monto_cobro, usuario):
    """Crea asiento por cobro de factura"""
    periodo = PeriodoContable.objects.filter(
        estado='abierto',
        fecha_inicio__lte=datetime.now().date(),
        fecha_fin__gte=datetime.now().date()
    ).first()
    
    if not periodo:
        raise ValidationError("No hay período abierto")
    
    cuenta_caja = obtener_cuenta('100101', 'Caja y bancos', 'activo', naturaleza='deudora')
    cuenta_cxc = obtener_cuenta('110101', 'Cuentas por cobrar clientes', 'activo', naturaleza='deudora')
    
    asiento = crear_asiento_contable(
        numero_asiento=f"COBRO-{factura.id}",
        periodo_contable=periodo,
        fecha_documento=datetime.now().date(),
        descripcion=f"Cobro factura {factura.numero_factura}",
        referencia=f"COB:{factura.numero_factura}",
        movimientos_data=[
            {
                'cuenta': cuenta_caja,
                'debe': monto_cobro,
                'haber': Decimal('0.00'),
                'descripcion': f'Cobro factura {factura.numero_factura}',
            },
            {
                'cuenta': cuenta_cxc,
                'debe': Decimal('0.00'),
                'haber': monto_cobro,
                'descripcion': f'Baja CxC factura {factura.numero_factura}',
            },
        ],
        tipo='ingreso',
        modulo_origen='tesoreria',
        usuario=usuario,
    )
    
    confirmar_asiento(asiento, usuario)
    return asiento
