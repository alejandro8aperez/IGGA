from django.contrib import admin
from .models import Cuenta, AsientoContable, MovimientoContable

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
    list_display = ('asiento', 'cuenta', 'debe', 'haber')
    list_filter = ('cuenta',)
