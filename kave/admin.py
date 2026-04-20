from django.contrib import admin
from .models import ProyectoKAVE, TareaKAVE, DocumentoKAVE, NotaKAVE

@admin.register(ProyectoKAVE)
class ProyectoKAVEAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'cliente', 'empresa', 'estado', 'prioridad', 'fecha_entrega', 'responsable', 'creado_en']
    list_filter = ['estado', 'prioridad', 'empresa', 'creado_en']
    search_fields = ['nombre', 'cliente', 'descripcion']
    date_hierarchy = 'creado_en'
    readonly_fields = ['creado_en', 'actualizado_en']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'descripcion', 'empresa', 'cliente')
        }),
        ('Fechas y Estado', {
            'fields': ('fecha_inicio', 'fecha_entrega', 'estado', 'prioridad')
        }),
        ('Asignación y Presupuesto', {
            'fields': ('responsable', 'presupuesto')
        }),
        ('Información de Sistema', {
            'fields': ('creado_en', 'actualizado_en'),
            'classes': ('collapse',)
        }),
    )

@admin.register(TareaKAVE)
class TareaKAVEAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'proyecto', 'estado', 'asignado_a', 'fecha_vencimiento', 'horas_estimadas', 'horas_reales']
    list_filter = ['estado', 'proyecto', 'asignado_a']
    search_fields = ['titulo', 'descripcion', 'proyecto__nombre']
    date_hierarchy = 'creado_en'
    readonly_fields = ['creado_en', 'actualizado_en']
    
    fieldsets = (
        ('Información de la Tarea', {
            'fields': ('proyecto', 'titulo', 'descripcion', 'estado')
        }),
        ('Asignación y Fechas', {
            'fields': ('asignado_a', 'fecha_vencimiento')
        }),
        ('Tiempo Estimado', {
            'fields': ('horas_estimadas', 'horas_reales')
        }),
        ('Información de Sistema', {
            'fields': ('creado_en', 'actualizado_en'),
            'classes': ('collapse',)
        }),
    )

@admin.register(DocumentoKAVE)
class DocumentoKAVEAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'proyecto', 'tipo', 'subido_por', 'fecha_subida']
    list_filter = ['tipo', 'proyecto', 'fecha_subida']
    search_fields = ['titulo', 'descripcion', 'proyecto__nombre']
    date_hierarchy = 'fecha_subida'
    readonly_fields = ['subido_por', 'fecha_subida']

@admin.register(NotaKAVE)
class NotaKAVEAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'proyecto', 'autor', 'creado_en']
    list_filter = ['proyecto', 'autor', 'creado_en']
    search_fields = ['titulo', 'contenido', 'proyecto__nombre']
    date_hierarchy = 'creado_en'
    readonly_fields = ['autor', 'creado_en']
