from django.contrib import admin
from .models import Segmento, Campana, Lead

@admin.register(Segmento)
class SegmentoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion')

@admin.register(Campana)
class CampanaAdmin(admin.ModelAdmin):
    list_display = ('numero_campana', 'nombre', 'segmento', 'fecha_inicio', 'estado', 'presupuesto', 'leads_generados', 'conversiones', 'tasa_conversion')
    list_filter = ('estado', 'fecha_inicio')
    search_fields = ('numero_campana', 'nombre', 'segmento__nombre')
    readonly_fields = ('tasa_conversion',)

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'email', 'empresa', 'estado', 'puntuacion', 'fecha_creacion', 'cliente_convertido')
    list_filter = ('estado', 'fuente', 'fecha_creacion')
    search_fields = ('nombre', 'email', 'empresa')
