from django.contrib import admin
from .models import Cuenta, AsientoContable, MovimientoContable, PeriodoContable

@admin.register(Cuenta)
class CuentaAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'nombre', 'tipo', 'nivel')
    list_filter = ('tipo', 'nivel')
    search_fields = ('codigo', 'nombre')

@admin.register(AsientoContable)
class AsientoContableAdmin(admin.ModelAdmin):
    list_display = ('id', 'fecha', 'descripcion', 'total_debe', 'total_haber')
    list_filter = ('fecha',)
    search_fields = ('descripcion', 'referencia')

@admin.register(MovimientoContable)
class MovimientoContableAdmin(admin.ModelAdmin):
    list_display = ('asiento_contable', 'cuenta', 'debe', 'haber')
    list_filter = ('cuenta',)

@admin.register(PeriodoContable)
class PeriodoContableAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'fecha_inicio', 'fecha_fin', 'estado', 'fecha_cierre', 'resultado')
    list_filter = ('estado',)
    search_fields = ('nombre', 'descripcion')
    readonly_fields = ('fecha_cierre', 'asiento_cierre', 'resultado')
