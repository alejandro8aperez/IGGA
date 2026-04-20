from django.contrib import admin
from .models import Segmento, Campana, Lead

@admin.register(Segmento)
class SegmentoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion')

@admin.register(Campana)
class CampanaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'segmento', 'fecha_inicio', 'estado', 'presupuesto')
    list_filter = ('estado', 'fecha_inicio')
    search_fields = ('nombre', 'segmento__nombre')

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'email', 'empresa', 'estado', 'puntuacion', 'fecha_creacion')
    list_filter = ('estado', 'fuente', 'fecha_creacion')
    search_fields = ('nombre', 'email', 'empresa')
