"""
Admin configuration para Facturación Electrónica
"""
from django.contrib import admin
from .models import FacturaElectronicaLog, ConfiguracionFacturatech


@admin.register(FacturaElectronicaLog)
class FacturaElectronicaLogAdmin(admin.ModelAdmin):
    """
    Admin para logs de facturas electrónicas
    """
    list_display = [
        'id', 'factura_numero', 'cufe_short', 'estado_interno',
        'codigo_respuesta', 'fecha_envio', 'es_produccion'
    ]
    list_filter = [
        'estado_interno', 'es_produccion', 'codigo_respuesta',
        'fecha_envio'
    ]
    search_fields = [
        'factura_numero', 'cufe', 'track_id', 
        'error_codigo', 'error_detalle'
    ]
    readonly_fields = [
        'fecha_envio', 'fecha_respuesta', 'intentos_envio',
        'xml_base64'
    ]
    ordering = ['-fecha_envio']
    
    fieldsets = (
        ('Información de Factura', {
            'fields': ('factura_id', 'factura_numero', 'estado_interno', 'estado_dian')
        }),
        ('Respuesta DIAN', {
            'fields': ('cufe', 'track_id', 'qr_code', 'codigo_respuesta', 'mensaje_respuesta')
        }),
        ('Datos de Envío', {
            'fields': ('xml_enviado', 'xml_base64', 'respuesta_ws', 'intentos_envio')
        }),
        ('Configuración', {
            'fields': ('es_produccion', 'wsdl_url', 'fecha_envio', 'fecha_respuesta')
        }),
        ('Error Tracking', {
            'fields': ('error_codigo', 'error_detalle'),
            'classes': ('collapse',)
        }),
    )
    
    def cufe_short(self, obj):
        """
        Muestra CUFE truncado en lista
        """
        if obj.cufe:
            return obj.cufe[:20] + '...'
        return '-'
    cufe_short.short_description = 'CUFE'
    
    actions = ['marcar_reenvio', 'marcar_procesada']
    
    def marcar_reenvio(self, request, queryset):
        """
        Acción para marcar facturas para reenvío
        """
        queryset.filter(estado_interno='error').update(estado_interno='pendiente')
        self.message_user(request, f"{queryset.count()} facturas marcadas para reenvío")
    marcar_reenvio.short_description = "Marcar facturas con error para reenvío"
    
    def marcar_procesada(self, request, queryset):
        """
        Acción para marcar como procesada manualmente
        """
        queryset.update(estado_interno='aceptada')
        self.message_user(request, f"{queryset.count()} facturas marcadas como aceptadas")
    marcar_procesada.short_description = "Marcar como aceptadas (proceso manual)"


@admin.register(ConfiguracionFacturatech)
class ConfiguracionFacturatechAdmin(admin.ModelAdmin):
    """
    Admin para configuración de Facturatech
    """
    list_display = [
        'nombre_config', 'nit', 'ambiente_activo', 
        'activo', 'creado', 'actualizado'
    ]
    list_filter = ['ambiente_activo', 'activo']
    search_fields = ['nombre_config', 'nit']
    
    fieldsets = (
        ('Credenciales', {
            'fields': ('nit', 'password_hash'),
            'description': 'La contraseña debe estar en SHA256'
        }),
        ('Endpoints Demo', {
            'fields': ('wsdl_demo_ventas', 'wsdl_demo_pos'),
            'classes': ('collapse',)
        }),
        ('Endpoints Producción', {
            'fields': ('wsdl_prod_ventas', 'wsdl_prod_pos'),
            'classes': ('collapse',)
        }),
        ('Configuración', {
            'fields': ('nombre_config', 'ambiente_activo', 'activo')
        }),
    )
    
    def has_delete_permission(self, request, obj=None):
        """
        Evitar borrado accidental de configuración
        """
        # Solo permitir borrado si hay más de una configuración
        count = ConfiguracionFacturatech.objects.count()
        return count > 1
