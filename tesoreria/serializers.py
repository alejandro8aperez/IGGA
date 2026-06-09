from rest_framework import serializers
from .models import (
    CuentaBancaria, MovimientoTesoreria, ConciliacionBancaria,
    Cheque, ProyeccionFlujoCaja, IndicadorTesoreria, RegistroIndicador
)


# ═══════════════════════════════════════════════════════
# SERIALIZERS BÁSICOS
# ═══════════════════════════════════════════════════════

class CuentaBancariaSerializer(serializers.ModelSerializer):
    diferencia_conciliacion = serializers.SerializerMethodField()
    
    class Meta:
        model = CuentaBancaria
        fields = [
            'id', 'banco', 'numero_cuenta', 'tipo_cuenta', 'titulares',
            'saldo_inicial', 'saldo_sistema', 'saldo_banco',
            'cuenta_contable', 'activa', 'fecha_apertura',
            'ultimo_movimiento', 'saldo_minimo_permitido',
            'saldo_maximo_permitido', 'diferencia_conciliacion'
        ]
        read_only_fields = ['saldo_sistema', 'ultimo_movimiento', 'fecha_creacion']

    def get_diferencia_conciliacion(self, obj):
        return float(obj.get_diferencia_conciliacion())


class MovimientoTesoreriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovimientoTesoreria
        fields = [
            'id', 'numero_movimiento', 'cuenta_banco', 'fecha',
            'fecha_valor', 'tipo', 'concepto', 'monto',
            'referencia_bancaria', 'documento_origen',
            'tercero_nombre', 'tercero_nit', 'tercero_banco',
            'tercero_cuenta', 'estado', 'conciliado',
            'fecha_conciliacion', 'asiento_contable',
            'usuario_creador', 'observaciones'
        ]
        read_only_fields = [
            'numero_movimiento', 'fecha_creacion', 'usuario_creador',
            'asiento_contable'
        ]


class ConciliacionBancariaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConciliacionBancaria
        fields = [
            'id', 'numero_conciliacion', 'cuenta_banco',
            'fecha_inicio', 'fecha_fin', 'fecha_conciliacion',
            'saldo_inicial_sistema', 'saldo_inicial_banco',
            'total_ingresos_sistema', 'total_ingresos_banco',
            'total_egresos_sistema', 'total_egresos_banco',
            'saldo_final_sistema', 'saldo_final_banco',
            'diferencia_total', 'estado', 'conciliada',
            'usuario_conciliador', 'notas'
        ]
        read_only_fields = [
            'numero_conciliacion', 'fecha_creacion',
            'fecha_actualizacion', 'usuario_conciliador'
        ]


class ChequeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cheque
        fields = [
            'id', 'numero_cheque', 'tipo', 'cuenta_banco',
            'fecha_emision', 'fecha_vencimiento', 'monto',
            'beneficiario', 'concepto', 'estado', 'fecha_cobro',
            'razon_devolucion', 'movimiento_tesoreria'
        ]
        read_only_fields = ['fecha_creacion']


class ProyeccionFlujoCajaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProyeccionFlujoCaja
        fields = [
            'id', 'numero_proyeccion', 'cuenta_banco',
            'fecha_inicio', 'fecha_fin', 'escenario',
            'saldo_inicial', 'ingresos_proyectados',
            'egresos_proyectados', 'saldo_final_proyectado',
            'dias_cobertura', 'alerta_insolvencia',
            'usuario_creador', 'fecha_creacion'
        ]
        read_only_fields = [
            'numero_proyeccion', 'saldo_final_proyectado',
            'dias_cobertura', 'alerta_insolvencia', 'fecha_creacion'
        ]


class IndicadorTesoreriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = IndicadorTesoreria
        fields = [
            'id', 'nombre', 'codigo', 'tipo', 'descripcion',
            'formula', 'valor_minimo', 'valor_maximo',
            'valor_objetivo', 'activo'
        ]
        read_only_fields = ['fecha_creacion']


class RegistroIndicadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroIndicador
        fields = [
            'id', 'indicador', 'fecha', 'valor_real',
            'estado', 'observaciones', 'fecha_registro'
        ]
        read_only_fields = ['fecha_registro']


# ═══════════════════════════════════════════════════════
# SERIALIZERS COMPLEJOS (con anidación)
# ═══════════════════════════════════════════════════════

class CuentaBancariaDetailSerializer(CuentaBancariaSerializer):
    """Serializer con últimos movimientos"""
    ultimos_movimientos = serializers.SerializerMethodField()
    
    class Meta(CuentaBancariaSerializer.Meta):
        fields = CuentaBancariaSerializer.Meta.fields + ['ultimos_movimientos']

    def get_ultimos_movimientos(self, obj):
        movimientos = obj.movimientos.all()[:5]
        return MovimientoTesoreriaSerializer(movimientos, many=True).data


class ConciliacionBancariaDetailSerializer(ConciliacionBancariaSerializer):
    """Serializer con movimientos sin conciliar"""
    movimientos_sin_conciliar = serializers.SerializerMethodField()
    
    class Meta(ConciliacionBancariaSerializer.Meta):
        fields = ConciliacionBancariaSerializer.Meta.fields + ['movimientos_sin_conciliar']

    def get_movimientos_sin_conciliar(self, obj):
        movimientos = obj.obtener_movimientos_sin_conciliar()
        return MovimientoTesoreriaSerializer(movimientos, many=True).data
