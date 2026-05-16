from django.contrib import admin
from .models import Cliente, Oportunidad, Cotizacion, CotizacionDetalle


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('codigo_cliente', 'nombre', 'nit', 'email', 'clasificacion', 'estado', 'credito_maximo')
    list_filter = ('estado', 'tipo_cliente', 'clasificacion', 'regimen_tributario', 'responsable_iva', 'gran_contribuyente', 'agente_retenedor', 'fecha_registro')
    search_fields = ('codigo_cliente', 'nombre', 'nit', 'cedula', 'email', 'contacto_principal')
    readonly_fields = ('fecha_registro', 'fecha_actualizacion', 'codigo_cliente')
    
    fieldsets = (
        ('📋 INFORMACIÓN BÁSICA', {
            'fields': ('codigo_cliente', 'nombre', 'compania', 'tipo_cliente', 'logotipo', 'estado')
        }),
        ('🏛️ IDENTIFICACIÓN Y TRIBUTACIÓN (DIAN)', {
            'fields': ('nit', 'digito_verificacion', 'cedula', 'codigo_barras', 'responsable_iva', 'gran_contribuyente', 'agente_retenedor', 'regimen_tributario', 'numero_resolucion_dian', 'fecha_resolucion_dian'),
            'classes': ('collapse',)
        }),
        ('💰 INFORMACIÓN COMERCIAL', {
            'fields': ('clasificacion', 'sector_industria', 'credito_maximo', 'dias_credito', 'descuento_general', 'condicion_pago', 'lista_precios'),
        }),
        ('👥 CONTACTOS', {
            'fields': ('email', 'telefono', 'telefono_alterno', 'fax', 'contacto_principal', 'cargo_contacto', 'email_contacto', 'telefono_contacto', 'representante_legal', 'cedula_representante'),
        }),
        ('🏠 DIRECCIONES', {
            'fields': ('direccion', 'ciudad', 'departamento', 'pais', 'codigo_postal', 'direccion_entrega', 'ciudad_entrega'),
        }),
        ('🏦 INFORMACIÓN BANCARIA', {
            'fields': ('banco_nombre', 'numero_cuenta', 'tipo_cuenta', 'titular_cuenta', 'codigo_bancario'),
            'classes': ('collapse',)
        }),
        ('📅 INFORMACIÓN ADICIONAL', {
            'fields': ('fecha_constitucion', 'fecha_ultimo_contacto', 'notas', 'adjunto_archivos', 'fecha_registro', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)


@admin.register(Oportunidad)
class OportunidadAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'cliente', 'valor_estimado', 'estado', 'fecha_creacion')
    list_filter = ('estado', 'fecha_creacion')
    search_fields = ('titulo', 'cliente__nombre')


class CotizacionDetalleInline(admin.TabularInline):
    model = CotizacionDetalle
    extra = 1
    fields = ('item', 'producto', 'unidad', 'cantidad', 'valor_unitario', 'valor_total')
    readonly_fields = ('valor_total',)


@admin.register(Cotizacion)
class CotizacionAdmin(admin.ModelAdmin):
    list_display = ('numero_cotizacion', 'cliente', 'asunto', 'valor_total', 'estado', 'fecha_creacion')
    list_filter = ('estado', 'fecha_creacion')
    search_fields = ('numero_cotizacion', 'asunto', 'cliente__nombre')
    readonly_fields = ('numero_cotizacion', 'gran_total', 'fecha_creacion')
    inlines = [CotizacionDetalleInline]
    
    fieldsets = (
        ('Información General', {
            'fields': ('numero_cotizacion', 'cliente', 'asunto', 'estado', 'fecha_creacion')
        }),
        ('Valores', {
            'fields': ('valor_total', 'porcentaje_iva', 'gran_total')
        }),
        ('Condiciones Comerciales', {
            'fields': ('tiempo_entrega', 'forma_pago', 'garantia', 'validez_oferta', 'fecha_validez')
        }),
    )
