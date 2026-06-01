from django.contrib import admin
from .models import ContratoInterventoria, VisitaInterventoria, Hallazgo

class HallazgoInline(admin.TabularInline):
    model = Hallazgo
    extra = 1

@admin.register(ContratoInterventoria)
class ContratoInterventoriaAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'nombre', 'fecha_inicio', 'fecha_fin', 'activo')
    search_fields = ('codigo', 'nombre')
    list_filter = ('activo',)

@admin.register(VisitaInterventoria)
class VisitaInterventoriaAdmin(admin.ModelAdmin):
    list_display = ('contrato', 'fecha', 'ubicacion', 'registrado_por')
    list_filter = ('fecha', 'contrato')
    inlines = [HallazgoInline]

@admin.register(Hallazgo)
class HallazgoAdmin(admin.ModelAdmin):
    list_display = ('visita', 'nivel_riesgo', 'cerrado', 'fecha_cierre')
    list_filter = ('nivel_riesgo', 'cerrado')
    search_fields = ('descripcion', 'plan_accion')