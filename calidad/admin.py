from django.contrib import admin
from .models import (
    NormaCalidad, Inspeccion, Defecto, DocumentoISO, NoConformidad, 
    AccionCorrectiva, Auditoria, EvaluacionProveedor,
    FormatoISO9001, ProcesoISO, TrazabilidadISO
)

@admin.register(FormatoISO9001)
class FormatoISO9001Admin(admin.ModelAdmin):
    list_display = [
        'codigo', 'titulo', 'tipo', 'modulo_relacionado', 'estado', 'version',
        'fecha_aprobacion', 'fecha_revision', 'creado_por', 'requiere_actualizacion'
    ]
    list_filter = [
        'tipo', 'modulo_relacionado', 'estado', 'obligatorio', 'requiere_aprobacion'
    ]
    search_fields = ['codigo', 'titulo', 'proceso_afectado', 'descripcion']
    date_hierarchy = 'fecha_creacion'
    readonly_fields = ['created_at', 'updated_at', 'dias_para_revision', 'requiere_actualizacion']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('codigo', 'titulo', 'tipo', 'version', 'estado')
        }),
        ('Integración ERP', {
            'fields': ('modulo_relacionado', 'proceso_afectado')
        }),
        ('Descripción y Control', {
            'fields': ('descripcion', 'motivo_cambio')
        }),
        ('Fechas', {
            'fields': ('fecha_creacion', 'fecha_aprobacion', 'fecha_revision')
        }),
        ('Responsables', {
            'fields': ('creado_por', 'aprobado_por')
        }),
        ('Configuración', {
            'fields': ('frecuencia_actualizacion', 'obligatorio', 'requiere_aprobacion')
        }),
        ('Archivos', {
            'fields': ('archivo_pdf', 'archivo_word', 'archivo_plantilla')
        }),
        ('Auditoría', {
            'fields': ('ultima_auditoria', 'conformidades', 'no_conformidades')
        }),
        ('Sistema', {
            'fields': ('created_at', 'updated_at', 'dias_para_revision', 'requiere_actualizacion'),
            'classes': ('collapse',)
        }),
    )

@admin.register(ProcesoISO)
class ProcesoISOAdmin(admin.ModelAdmin):
    list_display = [
        'nombre_proceso', 'modulo_erp', 'estado', 'responsable_proceso', 
        'frecuencia_auditoria', 'get_formatos_count'
    ]
    list_filter = ['modulo_erp', 'estado']
    search_fields = ['nombre_proceso', 'descripcion']
    readonly_fields = ['created_at', 'updated_at', 'get_formatos_count']
    
    fieldsets = (
        ('Información del Proceso', {
            'fields': ('nombre_proceso', 'modulo_erp', 'descripcion', 'estado')
        }),
        ('Configuración', {
            'fields': ('frecuencia_auditoria', 'indicadores')
        }),
        ('Responsable', {
            'fields': ('responsable_proceso',)
        }),
        ('Formatos Asociados', {
            'fields': ('formatos_iso',)
        }),
        ('Sistema', {
            'fields': ('created_at', 'updated_at', 'get_formatos_count'),
            'classes': ('collapse',)
        }),
    )
    
    def get_formatos_count(self, obj):
        """Método para contar formatos asociados"""
        return obj.formatos_iso.count()
    get_formatos_count.short_description = 'Formatos ISO'

@admin.register(TrazabilidadISO)
class TrazabilidadISOAdmin(admin.ModelAdmin):
    list_display = [
        'formato', 'modulo_erp', 'accion', 'usuario', 'fecha_uso'
    ]
    list_filter = ['accion', 'modulo_erp', 'fecha_uso']
    search_fields = ['formato__codigo', 'formato__titulo', 'usuario__username']
    date_hierarchy = 'fecha_uso'
    readonly_fields = ['fecha_uso', 'usuario', 'ip_address']
    
    fieldsets = (
        ('Información de Trazabilidad', {
            'fields': ('formato', 'modulo_erp', 'registro_id', 'accion')
        }),
        ('Usuario y Fecha', {
            'fields': ('usuario', 'fecha_uso', 'ip_address')
        }),
        ('Detalles Adicionales', {
            'fields': ('detalles',)
        }),
    )

# Registros existentes
@admin.register(NormaCalidad)
class NormaCalidadAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'producto', 'parametro', 'valor_minimo', 'valor_maximo', 'unidad']
    list_filter = ['producto']
    search_fields = ['nombre', 'parametro']

@admin.register(Inspeccion)
class InspeccionAdmin(admin.ModelAdmin):
    list_display = ['producto', 'lote', 'fecha_inspeccion', 'inspector', 'resultado']
    list_filter = ['resultado', 'fecha_inspeccion']
    search_fields = ['producto__nombre', 'lote']
    date_hierarchy = 'fecha_inspeccion'

@admin.register(Defecto)
class DefectoAdmin(admin.ModelAdmin):
    list_display = ['inspeccion', 'descripcion', 'severidad', 'cantidad_afectada']
    list_filter = ['severidad']
    search_fields = ['descripcion', 'inspeccion__producto__nombre']

@admin.register(DocumentoISO)
class DocumentoISOAdmin(admin.ModelAdmin):
    list_display = ['codigo', 'titulo', 'categoria', 'version', 'estado', 'fecha_aprobacion', 'autor']
    list_filter = ['categoria', 'estado', 'fecha_aprobacion']
    search_fields = ['codigo', 'titulo']
    date_hierarchy = 'fecha_aprobacion'

@admin.register(NoConformidad)
class NoConformidadAdmin(admin.ModelAdmin):
    list_display = ['id', 'origen', 'fecha_reporte', 'reportado_por', 'estado']
    list_filter = ['origen', 'estado', 'fecha_reporte']
    search_fields = ['descripcion']
    date_hierarchy = 'fecha_reporte'

@admin.register(AccionCorrectiva)
class AccionCorrectivaAdmin(admin.ModelAdmin):
    list_display = ['no_conformidad', 'responsable', 'fecha_limite', 'estado']
    list_filter = ['estado', 'fecha_limite']
    search_fields = ['no_conformidad__descripcion', 'plan_accion']

@admin.register(Auditoria)
class AuditoriaAdmin(admin.ModelAdmin):
    list_display = ['fecha_programada', 'tipo', 'alcance', 'auditor_lider', 'estado', 'hallazgos_totales']
    list_filter = ['tipo', 'estado', 'fecha_programada']
    search_fields = ['alcance', 'auditor_lider']
    date_hierarchy = 'fecha_programada'

@admin.register(EvaluacionProveedor)
class EvaluacionProveedorAdmin(admin.ModelAdmin):
    list_display = ['proveedor_nombre', 'fecha_evaluacion', 'calificacion_calidad', 'calificacion_tiempos', 'aprobado']
    list_filter = ['aprobado', 'fecha_evaluacion']
    search_fields = ['proveedor_nombre']
    date_hierarchy = 'fecha_evaluacion'
