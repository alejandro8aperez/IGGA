from decimal import Decimal
from datetime import datetime, timedelta, date
from django.db import transaction
from django.core.exceptions import ValidationError
from django.db.models import Sum, Q, F
from contabilidad.models import AsientoContable, MovimientoContable, Cuenta, PeriodoContable
from contabilidad.services import crear_asiento_contable, confirmar_asiento
from .models import (
    CuentaBancaria, MovimientoTesoreria, ConciliacionBancaria,
    ProyeccionFlujoCaja, Cheque, IndicadorTesoreria, RegistroIndicador
)


# ═══════════════════════════════════════════════════════
# SERVICIOS DE VALIDACIÓN
# ═══════════════════════════════════════════════════════

class ValidacionTesoreria:
    """Validaciones específicas de tesorería"""
    
    @staticmethod
    def validar_cuenta_activa(cuenta_banco):
        """Verifica que la cuenta esté activa"""
        if not cuenta_banco.activa:
            raise ValidationError(f"La cuenta {cuenta_banco.numero_cuenta} está inactiva")
        return True

    @staticmethod
    def validar_limites_saldo(cuenta_banco, nuevo_saldo):
        """Valida límites de saldo"""
        if cuenta_banco.saldo_minimo_permitido and nuevo_saldo < cuenta_banco.saldo_minimo_permitido:
            raise ValidationError(
                f"Saldo mínimo requerido: ${cuenta_banco.saldo_minimo_permitido:,.2f}"
            )
        
        if cuenta_banco.saldo_maximo_permitido and nuevo_saldo > cuenta_banco.saldo_maximo_permitido:
            raise ValidationError(
                f"Saldo máximo permitido: ${cuenta_banco.saldo_maximo_permitido:,.2f}"
            )
        
        return True

    @staticmethod
    def validar_movimiento(movimiento):
        """Valida integridad de movimiento"""
        if movimiento.monto <= 0:
            raise ValidationError("El monto debe ser mayor a 0")
        
        if not movimiento.cuenta_banco.activa:
            raise ValidationError("La cuenta bancaria está inactiva")
        
        return True


# ═══════════════════════════════════════════════════════
# SERVICIOS DE GESTIÓN DE FLUJO DE CAJA
# ═══════════════════════════════════════════════════════

class GestionFlujoCaja:
    """Gestión de flujo de caja y movimientos tesorería"""
    
    @staticmethod
    def registrar_movimiento(cuenta_banco, fecha, tipo, concepto, monto, 
                            referencia_bancaria='', tercero_nombre='', tercero_nit='',
                            documento_origen='', usuario=None, numero_movimiento=None):
        """
        Registra un movimiento de tesorería
        
        Tipos: 'ingreso', 'egreso', 'transferencia', 'retencion', 'devolucion'
        """
        ValidacionTesoreria.validar_cuenta_activa(cuenta_banco)
        ValidacionTesoreria.validar_movimiento(
            type('obj', (object,), {'monto': monto, 'cuenta_banco': cuenta_banco})()
        )
        
        # Generar número de movimiento
        if not numero_movimiento:
            ultimo = MovimientoTesoreria.objects.filter(
                cuenta_banco=cuenta_banco
            ).order_by('-id').first()
            
            if ultimo:
                numero = int(ultimo.numero_movimiento.split('-')[-1]) + 1
            else:
                numero = 1
            
            numero_movimiento = f"{cuenta_banco.numero_cuenta}-{fecha.strftime('%Y%m%d')}-{numero:05d}"
        
        # Crear movimiento
        movimiento = MovimientoTesoreria.objects.create(
            numero_movimiento=numero_movimiento,
            cuenta_banco=cuenta_banco,
            fecha=fecha,
            tipo=tipo,
            concepto=concepto,
            monto=monto,
            referencia_bancaria=referencia_bancaria,
            tercero_nombre=tercero_nombre,
            tercero_nit=tercero_nit,
            documento_origen=documento_origen,
            usuario_creador=usuario,
            estado='pendiente'
        )
        
        # Actualizar último movimiento de la cuenta
        cuenta_banco.ultimo_movimiento = fecha
        cuenta_banco.save()
        
        return movimiento

    @staticmethod
    def confirmar_movimiento(movimiento, usuario=None):
        """Confirma un movimiento (se puede conciliar después)"""
        if movimiento.estado != 'pendiente':
            raise ValidationError("Solo se pueden confirmar movimientos pendientes")
        
        movimiento.estado = 'confirmado'
        movimiento.save()
        
        # Crear asiento contable automático
        GestionFlujoCaja.generar_asiento_movimiento(movimiento, usuario)
        
        return movimiento

    @staticmethod
    def generar_asiento_movimiento(movimiento, usuario=None):
        """
        Genera automáticamente un asiento contable para el movimiento
        Vincula tesorería con contabilidad
        """
        if movimiento.asiento_contable:
            return movimiento.asiento_contable
        
        # Obtener período actual
        periodo = PeriodoContable.objects.filter(
            estado='abierto',
            fecha_inicio__lte=movimiento.fecha,
            fecha_fin__gte=movimiento.fecha
        ).first()
        
        if not periodo:
            raise ValidationError("No hay período abierto para esta fecha")
        
        # Cuenta contable de la cuenta bancaria
        cuenta_banco_contable = movimiento.cuenta_banco.cuenta_contable
        if not cuenta_banco_contable:
            raise ValidationError(f"La cuenta bancaria no tiene vinculación contable")
        
        # Determinar contrapartida según tipo
        if movimiento.tipo == 'ingreso':
            # Débito a Caja, Crédito a Ingresos/CxC
            cuenta_contrapartida_codigo = '110101'  # CxC clientes
            cuenta_contrapartida_nombre = 'Cuentas por Cobrar Clientes'
        elif movimiento.tipo == 'egreso':
            # Débito a Gastos/CxP, Crédito a Caja
            cuenta_contrapartida_codigo = '210101'  # CxP proveedores
            cuenta_contrapartida_nombre = 'Cuentas por Pagar Proveedores'
        elif movimiento.tipo == 'transferencia':
            # Transferencia a otra cuenta (débito-crédito entre bancos)
            cuenta_contrapartida_codigo = '100101'  # Otro banco
            cuenta_contrapartida_nombre = 'Caja y Bancos'
        else:
            cuenta_contrapartida_codigo = '100101'
            cuenta_contrapartida_nombre = 'Caja y Bancos'
        
        # Obtener/crear cuenta contrapartida
        cuenta_contrapartida, _ = Cuenta.objects.get_or_create(
            codigo=cuenta_contrapartida_codigo,
            defaults={
                'nombre': cuenta_contrapartida_nombre,
                'tipo': 'activo' if 'activo' in cuenta_contrapartida_codigo else 'pasivo',
                'naturaleza': 'deudora' if movimiento.tipo == 'ingreso' else 'acreedora',
                'nivel': 3
            }
        )
        
        # Crear asiento
        asiento_data = [
            {
                'cuenta': cuenta_banco_contable,
                'debe': movimiento.monto if movimiento.tipo == 'ingreso' else Decimal('0.00'),
                'haber': movimiento.monto if movimiento.tipo == 'egreso' else Decimal('0.00'),
                'descripcion': movimiento.concepto,
                'documento_referencia': movimiento.numero_movimiento,
                'tercero': movimiento.tercero_nombre,
            },
            {
                'cuenta': cuenta_contrapartida,
                'debe': movimiento.monto if movimiento.tipo == 'egreso' else Decimal('0.00'),
                'haber': movimiento.monto if movimiento.tipo == 'ingreso' else Decimal('0.00'),
                'descripcion': movimiento.concepto,
                'documento_referencia': movimiento.numero_movimiento,
                'tercero': movimiento.tercero_nombre,
            }
        ]
        
        asiento = crear_asiento_contable(
            numero_asiento=f"TES-{movimiento.numero_movimiento}",
            periodo_contable=periodo,
            fecha_documento=movimiento.fecha,
            descripcion=f"Tesorería: {movimiento.concepto}",
            referencia=movimiento.numero_movimiento,
            movimientos_data=asiento_data,
            tipo='ingreso' if movimiento.tipo == 'ingreso' else 'egreso',
            modulo_origen='tesoreria',
            usuario=usuario,
        )
        
        confirmar_asiento(asiento, usuario)
        
        # Vincular asiento
        movimiento.asiento_contable = asiento
        movimiento.save()
        
        return asiento


# ═══════════════════════════════════════════════════════
# SERVICIOS DE CONCILIACIÓN BANCARIA
# ═══════════════════════════════════════════════════════

class ServicioConciliacionBancaria:
    """Servicios para conciliación bancaria"""
    
    @staticmethod
    def crear_conciliacion(cuenta_banco, fecha_inicio, fecha_fin, 
                          saldo_inicial_banco, usuario=None, numero_conciliacion=None):
        """
        Crea una conciliación bancaria para un período
        """
        # Generar número
        if not numero_conciliacion:
            ultimo = ConciliacionBancaria.objects.filter(
                cuenta_banco=cuenta_banco
            ).order_by('-id').first()
            
            if ultimo:
                numero = int(ultimo.numero_conciliacion.split('-')[-1]) + 1
            else:
                numero = 1
            
            numero_conciliacion = f"CONC-{cuenta_banco.numero_cuenta}-{fecha_inicio.strftime('%Y%m')}-{numero:03d}"
        
        # Obtener saldo inicial del sistema
        movimientos_anteriores = MovimientoTesoreria.objects.filter(
            cuenta_banco=cuenta_banco,
            fecha__lt=fecha_inicio,
            estado='confirmado'
        )
        
        total_ingresos_ant = movimientos_anteriores.filter(tipo='ingreso').aggregate(Sum('monto'))['monto__sum'] or Decimal('0.00')
        total_egresos_ant = movimientos_anteriores.filter(tipo='egreso').aggregate(Sum('monto'))['monto__sum'] or Decimal('0.00')
        
        saldo_inicial_sistema = cuenta_banco.saldo_inicial + total_ingresos_ant - total_egresos_ant
        
        # Crear conciliación
        conciliacion = ConciliacionBancaria.objects.create(
            numero_conciliacion=numero_conciliacion,
            cuenta_banco=cuenta_banco,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            saldo_inicial_sistema=saldo_inicial_sistema,
            saldo_inicial_banco=saldo_inicial_banco,
            usuario_conciliador=usuario,
            estado='en_proceso'
        )
        
        return conciliacion

    @staticmethod
    def calcular_totales_periodo(conciliacion):
        """Calcula totales del período para la conciliación"""
        movimientos = MovimientoTesoreria.objects.filter(
            cuenta_banco=conciliacion.cuenta_banco,
            fecha__gte=conciliacion.fecha_inicio,
            fecha__lte=conciliacion.fecha_fin,
            estado='confirmado'
        )
        
        ingresos = movimientos.filter(tipo='ingreso').aggregate(Sum('monto'))['monto__sum'] or Decimal('0.00')
        egresos = movimientos.filter(tipo='egreso').aggregate(Sum('monto'))['monto__sum'] or Decimal('0.00')
        
        # Actualizar conciliación
        conciliacion.total_ingresos_sistema = ingresos
        conciliacion.total_egresos_sistema = egresos
        conciliacion.saldo_final_sistema = conciliacion.saldo_inicial_sistema + ingresos - egresos
        
        return conciliacion

    @staticmethod
    def completar_conciliacion(conciliacion, saldo_final_banco, usuario=None):
        """
        Completa la conciliación y marca movimientos como conciliados
        """
        # Calcular diferencia
        conciliacion.saldo_final_banco = saldo_final_banco
        conciliacion.calcular_diferencia()
        
        # Si la diferencia es 0, conciliación OK
        if conciliacion.diferencia_total == 0:
            conciliacion.conciliada = True
            
            # Marcar movimientos como conciliados
            movimientos = MovimientoTesoreria.objects.filter(
                cuenta_banco=conciliacion.cuenta_banco,
                fecha__gte=conciliacion.fecha_inicio,
                fecha__lte=conciliacion.fecha_fin,
                estado='confirmado',
                conciliado=False
            )
            
            movimientos.update(
                conciliado=True,
                fecha_conciliacion=date.today()
            )
        else:
            # Hay diferencia, registrar y alertar
            conciliacion.notas = f"Diferencia sin conciliar: ${conciliacion.diferencia_total:,.2f}"
        
        conciliacion.estado = 'completada'
        conciliacion.fecha_conciliacion = datetime.now()
        conciliacion.usuario_conciliador = usuario
        conciliacion.save()
        
        return conciliacion

    @staticmethod
    def obtener_movimientos_pendientes(conciliacion):
        """Obtiene movimientos sin conciliar en el período"""
        return MovimientoTesoreria.objects.filter(
            cuenta_banco=conciliacion.cuenta_banco,
            fecha__gte=conciliacion.fecha_inicio,
            fecha__lte=conciliacion.fecha_fin,
            estado='confirmado',
            conciliado=False
        ).order_by('-fecha')


# ═══════════════════════════════════════════════════════
# SERVICIOS DE PROYECCIÓN DE FLUJO DE CAJA
# ═══════════════════════════════════════════════════════

class ServicioProyeccionFlujoCaja:
    """Servicios para proyección de flujo de caja"""
    
    @staticmethod
    def crear_proyeccion(cuenta_banco, fecha_inicio, fecha_fin, 
                        escenario='conservador', usuario=None):
        """
        Crea una proyección de flujo de caja
        """
        # Generar número
        numero_proyeccion = f"PROY-{cuenta_banco.numero_cuenta}-{fecha_inicio.strftime('%Y%m%d')}-{escenario[:3].upper()}"
        
        # Saldo inicial actual
        saldo_inicial = cuenta_banco.saldo_sistema
        
        # Crear proyección
        proyeccion = ProyeccionFlujoCaja.objects.create(
            numero_proyeccion=numero_proyeccion,
            cuenta_banco=cuenta_banco,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            escenario=escenario,
            saldo_inicial=saldo_inicial,
            usuario_creador=usuario
        )
        
        return proyeccion

    @staticmethod
    def proyectar_flujos(proyeccion):
        """
        Proyecta ingresos y egresos basado en histórico
        Usa diferentes factores según escenario
        """
        dias_proyeccion = (proyeccion.fecha_fin - proyeccion.fecha_inicio).days
        
        # Obtener histórico de últimos 90 días
        fecha_inicio_hist = proyeccion.fecha_inicio - timedelta(days=90)
        movimientos_hist = MovimientoTesoreria.objects.filter(
            cuenta_banco=proyeccion.cuenta_banco,
            fecha__gte=fecha_inicio_hist,
            fecha__lt=proyeccion.fecha_inicio,
            estado='confirmado'
        )
        
        ingresos_hist = movimientos_hist.filter(tipo='ingreso').aggregate(Sum('monto'))['monto__sum'] or Decimal('0.00')
        egresos_hist = movimientos_hist.filter(tipo='egreso').aggregate(Sum('monto'))['monto__sum'] or Decimal('0.00')
        
        dias_hist = 90
        ingreso_diario_prom = ingresos_hist / dias_hist if dias_hist > 0 else Decimal('0.00')
        egreso_diario_prom = egresos_hist / dias_hist if dias_hist > 0 else Decimal('0.00')
        
        # Aplicar factores según escenario
        if proyeccion.escenario == 'pesimista':
            factor_ingresos = Decimal('0.70')
            factor_egresos = Decimal('1.20')
        elif proyeccion.escenario == 'optimista':
            factor_ingresos = Decimal('1.30')
            factor_egresos = Decimal('0.80')
        else:  # conservador
            factor_ingresos = Decimal('1.00')
            factor_egresos = Decimal('1.00')
        
        # Calcular proyecciones
        proyeccion.ingresos_proyectados = (ingreso_diario_prom * factor_ingresos) * dias_proyeccion
        proyeccion.egresos_proyectados = (egreso_diario_prom * factor_egresos) * dias_proyeccion
        
        proyeccion.calcular_saldo_final()
        proyeccion.calcular_dias_cobertura()
        
        # Detectar alerta de insolvencia
        if proyeccion.saldo_final_proyectado < 0:
            proyeccion.alerta_insolvencia = True
        
        proyeccion.save()
        
        return proyeccion


# ═══════════════════════════════════════════════════════
# SERVICIOS DE INDICADORES
# ═══════════════════════════════════════════════════════

class ServicioIndicadores:
    """Servicios para cálculo de indicadores de tesorería"""
    
    @staticmethod
    def calcular_indicador_liquidez_inmediata(cuenta_banco):
        """
        Liquidez Inmediata = Saldo Actual / Egresos Diarios Promedio
        Indica cuántos días puede operar sin ingresos
        """
        # Egresos últimos 30 días
        hace_30_dias = date.today() - timedelta(days=30)
        egresos_30dias = MovimientoTesoreria.objects.filter(
            cuenta_banco=cuenta_banco,
            tipo='egreso',
            fecha__gte=hace_30_dias,
            estado='confirmado'
        ).aggregate(Sum('monto'))['monto__sum'] or Decimal('0.00')
        
        egreso_diario_promedio = egresos_30dias / 30 if egresos_30dias > 0 else Decimal('1.00')
        
        liquidez = cuenta_banco.saldo_sistema / egreso_diario_promedio if egreso_diario_promedio > 0 else Decimal('0.00')
        
        return {
            'valor': float(liquidez),
            'interpretacion': f"{float(liquidez):.1f} días de cobertura"
        }

    @staticmethod
    def calcular_ciclo_operativo(cuenta_banco):
        """
        Ciclo Operativo = Días para cobrar a clientes + Días para pagar a proveedores
        """
        hace_90_dias = date.today() - timedelta(days=90)
        
        ingresos = MovimientoTesoreria.objects.filter(
            cuenta_banco=cuenta_banco,
            tipo='ingreso',
            fecha__gte=hace_90_dias,
            estado='confirmado'
        ).count()
        
        egresos = MovimientoTesoreria.objects.filter(
            cuenta_banco=cuenta_banco,
            tipo='egreso',
            fecha__gte=hace_90_dias,
            estado='confirmado'
        ).count()
        
        dias_ingreso = 90 / ingresos if ingresos > 0 else 0
        dias_egreso = 90 / egresos if egresos > 0 else 0
        
        ciclo = dias_ingreso + dias_egreso
        
        return {
            'valor': float(ciclo),
            'dias_cobro': float(dias_ingreso),
            'dias_pago': float(dias_egreso)
        }

    @staticmethod
    def registrar_indicador(indicador, valor, usuario=None):
        """Registra un valor de indicador en el tiempo"""
        # Determinar estado basado en umbrales
        if indicador.valor_minimo and valor < indicador.valor_minimo:
            estado = 'crítico'
        elif indicador.valor_objetivo and valor < indicador.valor_objetivo * Decimal('0.8'):
            estado = 'alerta'
        elif indicador.valor_objetivo and valor <= indicador.valor_objetivo:
            estado = 'bueno'
        elif indicador.valor_maximo and valor > indicador.valor_maximo:
            estado = 'alerta'
        else:
            estado = 'excelente'
        
        registro = RegistroIndicador.objects.create(
            indicador=indicador,
            fecha=date.today(),
            valor_real=valor,
            estado=estado
        )
        
        return registro
