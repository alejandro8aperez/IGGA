from django.contrib import admin
from django.utils.html import format_html
from .models import (
    CuentaBancaria, MovimientoTesoreria, ConciliacionBancaria,
    Cheque, ProyeccionFlujoCaja, IndicadorTesoreria, RegistroIndicador
)


# ═══════════════════════════════════════════════════════
# ADMIN CUENTAS BANCARIAS
# ═══════════════════════════════════════════════════════

@admin.register(CuentaBancaria)
class CuentaBancariaAdmin(admin.ModelAdmin):
    list_display = [
        'numero_cuenta', 'banco', 'tipo_cuenta',
        'saldo_sistema_display', 'saldo_banco_display',
        'diferencia_display', 'activa', 'ultimo_movimiento'
    ]
    list_filter = ['banco', 'tipo_cuenta', 'activa', 'fecha_creacion']
    search_fields = ['numero_cuenta', 'titulares', 'banco']
    readonly_fields = [
        'saldo_sistema', 'ultimo_movimiento', 'fecha_creacion',
        'fecha_actualizacion', 'diferencia_display'
    ]
    fieldsets = (
        ('Datos de la Cuenta', {
            'fields': ('banco', 'numero_cuenta', 'tipo_cuenta', 'titulares')
        }),
        ('Saldos', {
            'fields': (
                'saldo_inicial', 'saldo_sistema', 'saldo_banco',
                'diferencia_display'
            )
        }),
        ('Límites', {
            'fields': ('saldo_minimo_permitido', 'saldo_maximo_permitido')
        }),
        ('Vinculación', {
            'fields': ('cuenta_contable',)
        }),
        ('Control', {
            'fields': (
                'activa', 'fecha_apertura', 'ultimo_movimiento',
                'fecha_creacion', 'fecha_actualizacion'
            )
        }),
    )

    def saldo_sistema_display(self, obj):
        return format_html(
            '<strong>${:,.0f}</strong>',
            obj.saldo_sistema
        )
    saldo_sistema_display.short_description = 'Saldo Sistema'

    def saldo_banco_display(self, obj):
        return format_html(
            '<strong>${:,.0f}</strong>',
            obj.saldo_banco
        )
    saldo_banco_display.short_description = 'Saldo Banco'

    def diferencia_display(self, obj):
        diferencia = obj.get_diferencia_conciliacion()
        color = 'green' if diferencia == 0 else 'red'
        return format_html(
            '<span style="color: {};">${:,.0f}</span>',
            color, diferencia
        )
    diferencia_display.short_description = 'Diferencia'


# ═══════════════════════════════════════════════════════
# ADMIN MOVIMIENTOS TESORERÍA
# ═══════════════════════════════════════════════════════

@admin.register(MovimientoTesoreria)
class MovimientoTesoreriaAdmin(admin.ModelAdmin):
    list_display = [
        'numero_movimiento', 'cuenta_banco', 'fecha',
        'tipo_display', 'concepto', 'monto_display',
        'estado', 'conciliado'
    ]
    list_filter = [
        'tipo', 'estado', 'conciliado', 'fecha',
        'cuenta_banco', 'fecha_creacion'
    ]
    search_fields = [
        'numero_movimiento', 'concepto', 'tercero_nombre',
        'documento_origen'
    ]
    readonly_fields = [
        'numero_movimiento', 'fecha_creacion', 'usuario_creador',
        'asiento_contable', 'fecha_conciliacion'
    ]
    fieldsets = (
        ('Identificación', {
            'fields': (
                'numero_movimiento', 'cuenta_banco',
                'fecha', 'fecha_valor'
            )
        }),
        ('Movimiento', {
            'fields': (
                'tipo', 'concepto', 'monto',
                'referencia_bancaria', 'documento_origen'
            )
        }),
        ('Tercero', {
            'fields': (
                'tercero_nombre', 'tercero_nit',
                'tercero_banco', 'tercero_cuenta'
            ),
            'classes': ('collapse',)
        }),
        ('Control', {
            'fields': (
                'estado', 'conciliado', 'fecha_conciliacion',
                'asiento_contable'
            )
        }),
        ('Auditoría', {
            'fields': (
                'usuario_creador', 'fecha_creacion', 'observaciones'
            ),
            'classes': ('collapse',)
        }),
    )

    def tipo_display(self, obj):
        colors = {
            'ingreso': '#28a745',
            'egreso': '#dc3545',
            'transferencia': '#007bff',
            'retencion': '#ffc107',
            'devolucion': '#6c757d'
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 6px; border-radius: 3px;">{}</span>',
            colors.get(obj.tipo, '#000'),
            obj.get_tipo_display()
        )
    tipo_display.short_description = 'Tipo'

    def monto_display(self, obj):
        return format_html(
            '<strong>${:,.0f}</strong>',
            obj.monto
        )
    monto_display.short_description = 'Monto'


# ═══════════════════════════════════════════════════════
# ADMIN CONCILIACIONES
# ═══════════════════════════════════════════════════════

@admin.register(ConciliacionBancaria)
class ConciliacionBancariaAdmin(admin.ModelAdmin):
    list_display = [
        'numero_conciliacion', 'cuenta_banco',
        'fecha_inicio', 'fecha_fin',
        'saldo_final_sistema_display', 'saldo_final_banco_display',
        'diferencia_display', 'conciliada'
    ]
    list_filter = ['estado', 'conciliada', 'cuenta_banco', 'fecha_fin']
    search_fields = ['numero_conciliacion', 'cuenta_banco__numero_cuenta']
    readonly_fields = [
        'numero_conciliacion', 'fecha_creacion', 'fecha_actualizacion',
        'usuario_conciliador', 'diferencia_display'
    ]
    fieldsets = (
        ('Identificación', {
            'fields': (
                'numero_conciliacion', 'cuenta_banco',
                'fecha_inicio', 'fecha_fin', 'fecha_conciliacion'
            )
        }),
        ('Saldos Iniciales', {
            'fields': (
                'saldo_inicial_sistema', 'saldo_inicial_banco'
            )
        }),
        ('Movimientos del Período', {
            'fields': (
                'total_ingresos_sistema', 'total_ingresos_banco',
                'total_egresos_sistema', 'total_egresos_banco'
            )
        }),
        ('Saldos Finales', {
            'fields': (
                'saldo_final_sistema', 'saldo_final_banco',
                'diferencia_display'
            )
        }),
        ('Estado', {
            'fields': (
                'estado', 'conciliada', 'usuario_conciliador'
            )
        }),
        ('Observaciones', {
            'fields': ('notas',)
        }),
        ('Auditoría', {
            'fields': (
                'fecha_creacion', 'fecha_actualizacion'
            ),
            'classes': ('collapse',)
        }),
    )

    def saldo_final_sistema_display(self, obj):
        return format_html(
            '<strong>${:,.0f}</strong>',
            obj.saldo_final_sistema
        )
    saldo_final_sistema_display.short_description = 'Saldo Final Sistema'

    def saldo_final_banco_display(self, obj):
        return format_html(
            '<strong>${:,.0f}</strong>',
            obj.saldo_final_banco
        )
    saldo_final_banco_display.short_description = 'Saldo Final Banco'

    def diferencia_display(self, obj):
        color = 'green' if obj.diferencia_total == 0 else 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">${:,.0f}</span>',
            color, obj.diferencia_total
        )
    diferencia_display.short_description = 'Diferencia'


# ═══════════════════════════════════════════════════════
# ADMIN CHEQUES
# ═══════════════════════════════════════════════════════

@admin.register(Cheque)
class ChequeAdmin(admin.ModelAdmin):
    list_display = [
        'numero_cheque', 'tipo_display', 'cuenta_banco',
        'fecha_emision', 'monto_display', 'beneficiario', 'estado'
    ]
    list_filter = ['tipo', 'estado', 'fecha_emision', 'cuenta_banco']
    search_fields = ['numero_cheque', 'beneficiario', 'concepto']
    readonly_fields = ['fecha_creacion']

    def tipo_display(self, obj):
        color = '#28a745' if obj.tipo == 'emitido' else '#007bff'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 6px; border-radius: 3px;">{}</span>',
            color, obj.get_tipo_display()
        )
    tipo_display.short_description = 'Tipo'

    def monto_display(self, obj):
        return format_html(
            '<strong>${:,.0f}</strong>',
            obj.monto
        )
    monto_display.short_description = 'Monto'


# ═══════════════════════════════════════════════════════
# ADMIN PROYECCIONES
# ═══════════════════════════════════════════════════════

@admin.register(ProyeccionFlujoCaja)
class ProyeccionFlujoCajaAdmin(admin.ModelAdmin):
    list_display = [
        'numero_proyeccion', 'cuenta_banco', 'escenario',
        'fecha_inicio', 'fecha_fin', 'saldo_final_display',
        'dias_cobertura_display', 'alerta_display'
    ]
    list_filter = ['escenario', 'alerta_insolvencia', 'cuenta_banco']
    search_fields = ['numero_proyeccion', 'cuenta_banco__numero_cuenta']
    readonly_fields = [
        'numero_proyeccion', 'saldo_final_proyectado',
        'dias_cobertura', 'alerta_insolvencia', 'fecha_creacion'
    ]

    def saldo_final_display(self, obj):
        color = 'green' if obj.saldo_final_proyectado >= 0 else 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">${:,.0f}</span>',
            color, obj.saldo_final_proyectado
        )
    saldo_final_display.short_description = 'Saldo Final'

    def dias_cobertura_display(self, obj):
        return format_html(
            '<strong>{} días</strong>',
            obj.dias_cobertura or 'N/A'
        )
    dias_cobertura_display.short_description = 'Cobertura'

    def alerta_display(self, obj):
        if obj.alerta_insolvencia:
            return format_html(
                '<span style="background-color: #dc3545; color: white; padding: 2px 6px; border-radius: 3px;">⚠️ ALERTA</span>'
            )
        return format_html('<span style="color: green;">✓ OK</span>')
    alerta_display.short_description = 'Estado'


# ═══════════════════════════════════════════════════════
# ADMIN INDICADORES
# ═══════════════════════════════════════════════════════

@admin.register(IndicadorTesoreria)
class IndicadorTesoreriaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'codigo', 'tipo', 'valor_objetivo', 'activo']
    list_filter = ['tipo', 'activo']
    search_fields = ['nombre', 'codigo']


@admin.register(RegistroIndicador)
class RegistroIndicadorAdmin(admin.ModelAdmin):
    list_display = ['indicador', 'fecha', 'valor_real', 'estado']
    list_filter = ['estado', 'indicador', 'fecha']
    search_fields = ['indicador__nombre']
    readonly_fields = ['fecha_registro']
