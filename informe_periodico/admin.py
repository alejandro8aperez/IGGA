from django.contrib import admin
from .models import InformeSemanal, InformeMensual


@admin.register(InformeSemanal)
class InformeSemanalAdmin(admin.ModelAdmin):
    list_display = ['semana_numero', 'proyecto', 'fecha_inicio', 'fecha_fin', 'status']
    list_filter = ['status', 'proyecto']
    search_fields = ['proyecto__nombre', 'resumen_ejecutivo']


@admin.register(InformeMensual)
class InformeMensualAdmin(admin.ModelAdmin):
    list_display = ['proyecto', 'mes', 'anio', 'fecha_inicio', 'fecha_fin', 'status']
    list_filter = ['status', 'proyecto', 'anio', 'mes']
    search_fields = ['proyecto__nombre', 'resumen_ejecutivo']
