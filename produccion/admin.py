from django.contrib import admin
from .models import (
    Receta, InsumoReceta, OrdenProduccion, FaseOrdenProduccion,
    ConsumoProduccion, MermaProduccion, CostoProduccion
)

class InsumoRecetaInline(admin.TabularInline):
    model = InsumoReceta
    extra = 1

@admin.register(Receta)
class RecetaAdmin(admin.ModelAdmin):
    list_display = ('producto_terminado', 'tiempo_estimado_horas', 'costo_adicional_fijo')
    search_fields = ('producto_terminado__nombre',)
    inlines = [InsumoRecetaInline]
    filter_horizontal = ('instructivos_sgc',)

class FaseOrdenInline(admin.TabularInline):
    model = FaseOrdenProduccion
    extra = 0

class ConsumoInline(admin.TabularInline):
    model = ConsumoProduccion
    extra = 0
    readonly_fields = ('fecha_consumo',)

class MermaInline(admin.TabularInline):
    model = MermaProduccion
    extra = 0
    readonly_fields = ('fecha_registro',)

class CostoInline(admin.StackedInline):
    model = CostoProduccion
    extra = 0
    readonly_fields = ('costo_materias_primas', 'costo_mermas', 'costo_mano_obra', 'costo_indirecto', 'costo_total', 'costo_unitario_real')

@admin.register(OrdenProduccion)
class OrdenProduccionAdmin(admin.ModelAdmin):
    list_display = (
        'numero', 'receta', 'cantidad_a_producir', 'cantidad_producida',
        'estado', 'prioridad', 'fecha_planeada_inicio'
    )
    list_filter = ('estado', 'prioridad', 'fecha_planeada_inicio')
    search_fields = ('numero', 'receta__producto_terminado__nombre', 'responsable')
    readonly_fields = ('numero', 'fecha_creacion', 'fecha_actualizacion')
    fieldsets = (
        ('Información de la Orden', {
            'fields': ('numero', 'receta', 'cantidad_a_producir', 'cantidad_producida', 'estado', 'prioridad', 'responsable')
        }),
        ('Planificación y Tiempos', {
            'fields': ('fecha_planeada_inicio', 'fecha_planeada_fin', 'fecha_inicio_real', 'fecha_fin_real')
        }),
        ('Observaciones y Calidad', {
            'fields': ('observaciones', 'notas_calidad')
        }),
        ('Auditoría', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )
    inlines = [FaseOrdenInline, ConsumoInline, MermaInline, CostoInline]

@admin.register(CostoProduccion)
class CostoProduccionAdmin(admin.ModelAdmin):
    list_display = ('orden', 'costo_total', 'costo_unitario_real', 'fecha_registro')
    readonly_fields = ('costo_materias_primas', 'costo_mermas', 'costo_mano_obra', 'costo_indirecto', 'costo_total', 'costo_unitario_real', 'fecha_registro')
