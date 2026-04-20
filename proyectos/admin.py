from django.contrib import admin
from .models import Proyecto, Tarea

@admin.register(Proyecto)
class ProyectoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'cliente', 'gerente', 'fecha_inicio', 'estado')
    list_filter = ('estado', 'fecha_inicio')
    search_fields = ('nombre', 'cliente__nombre')

@admin.register(Tarea)
class TareaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'proyecto', 'asignado_a', 'estado', 'progreso')
    list_filter = ('estado', 'proyecto')
    search_fields = ('nombre', 'proyecto__nombre')
