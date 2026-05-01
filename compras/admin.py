from django.contrib import admin
from django.utils.html import mark_safe
from .models import (
    Proveedor, SolicitudCompra, DetalleSolicitudCompra,
    OrdenCompra, DetalleOrdenCompra,
    RecepcionCompra, DetalleRecepcion,
    PagoCompra, Contrato, ProductoProveedor,
)


# ═══════════════════════════════════════════════════════
# PROVEEDOR
# ═══════════════════════════════════════════════════════

@admin.register(Proveedor)
class ProveedorAdmin(admin.ModelAdmin):
    list_display = (
        'razon_social', 'nit', 'categoria', 'estado',
        'contacto_nombre', 'contacto_telefono', 'ciudad',
        'calificacion',
    )
    list_filter = ('categoria', 'estado', 'ciudad')
    search_fields = ('razon_social', 'nit', 'nombre_comercial', 'contacto_nombre')
    list_editable = ('estado',)
    fieldsets = (
        ('Identificación', {
            'fields': (
                'razon_social', 'nombre_comercial',
                'tipo_documento', 'nit', 'categoria', 'estado',
            )
        }),
        ('Contacto Principal', {
            'fields': (
                'contacto_nombre', 'contacto_email',
                'contacto_telefono', 'contacto_telefono_alt',
            )
        }),
        ('Ubicación', {
            'fields': ('direccion', 'ciudad', 'departamento', 'sitio_web')
        }),
        ('Condiciones Comerciales', {
            'fields': (
                'condicion_pago', 'descuento_general',
                'moneda', 'tiempo_entrega_promedio_dias',
            )
        }),
        ('Evaluación', {
            'fields': ('calificacion', 'notas'),
            'classes': ('collapse',),
        }),
    )


# ═══════════════════════════════════════════════════════
# SOLICITUD DE COMPRA
# ═══════════════════════════════════════════════════════

class DetalleSolicitudInline(admin.TabularInline):
    model = DetalleSolicitudCompra
    extra = 1
    autocomplete_fields = ['producto']


@admin.register(SolicitudCompra)
class SolicitudCompraAdmin(admin.ModelAdmin):
    list_display = (
        'numero', 'solicitante', 'departamento',
        'prioridad', 'estado', 'origen', 'fecha_solicitud',
    )
    list_filter = ('estado', 'prioridad', 'origen')
    search_fields = ('numero', 'solicitante', 'departamento')
    readonly_fields = ('numero', 'fecha_solicitud')
    inlines = [DetalleSolicitudInline]


# ═══════════════════════════════════════════════════════
# ORDEN DE COMPRA
# ═══════════════════════════════════════════════════════

class DetalleOCInline(admin.TabularInline):
    model = DetalleOrdenCompra
    extra = 1
    readonly_fields = ('subtotal', 'cantidad_recibida')
    autocomplete_fields = ['producto']


class PagoInline(admin.TabularInline):
    model = PagoCompra
    extra = 0
    readonly_fields = ('fecha_registro',)


@admin.register(OrdenCompra)
class OrdenCompraAdmin(admin.ModelAdmin):
    list_display = (
        'numero_display', 'proveedor', 'fecha_emision',
        'estado', 'subtotal', 'iva', 'total',
        'saldo_display', 'porcentaje_recibido_display',
    )
    list_filter = ('estado', 'fecha_emision', 'proveedor')
    search_fields = ('numero', 'proveedor__razon_social')
    readonly_fields = ('numero', 'subtotal', 'iva', 'total')
    inlines = [DetalleOCInline, PagoInline]

    def numero_display(self, obj):
        return f"OC-{obj.numero or obj.id}"
    numero_display.short_description = "Número"

    def saldo_display(self, obj):
        saldo = obj.saldo_por_pagar
        if saldo <= 0:
            return mark_safe('<span style="color: green;">Pagada</span>')
        return mark_safe(f'<span style="color: red;">${saldo:,.0f}</span>')
    saldo_display.short_description = "Saldo"

    def porcentaje_recibido_display(self, obj):
        pct = obj.porcentaje_recibido
        if pct >= 100:
            return mark_safe('<span style="color: green;">100%</span>')
        elif pct > 0:
            return mark_safe(f'<span style="color: orange;">{pct}%</span>')
        return "0%"
    porcentaje_recibido_display.short_description = "Recibido"


# ═══════════════════════════════════════════════════════
# RECEPCIÓN
# ═══════════════════════════════════════════════════════

class DetalleRecepcionInline(admin.TabularInline):
    model = DetalleRecepcion
    extra = 1


@admin.register(RecepcionCompra)
class RecepcionCompraAdmin(admin.ModelAdmin):
    list_display = ('numero', 'orden', 'fecha', 'recibido_por')
    list_filter = ('fecha',)
    search_fields = ('numero', 'orden__numero')
    readonly_fields = ('numero', 'fecha_registro')
    inlines = [DetalleRecepcionInline]


# ═══════════════════════════════════════════════════════
# CONTRATO
# ═══════════════════════════════════════════════════════

@admin.register(Contrato)
class ContratoAdmin(admin.ModelAdmin):
    list_display = (
        'codigo', 'proveedor', 'tipo', 'estado',
        'fecha_inicio', 'fecha_fin', 'valor_contrato',
        'vigencia_display',
    )
    list_filter = ('tipo', 'estado')
    search_fields = ('codigo', 'proveedor__razon_social')

    def vigencia_display(self, obj):
        if obj.esta_vigente:
            return mark_safe('<span style="color: green;">Vigente</span>')
        return mark_safe('<span style="color: red;">No vigente</span>')
    vigencia_display.short_description = "Vigencia"


# ═══════════════════════════════════════════════════════
# PRODUCTO-PROVEEDOR
# ═══════════════════════════════════════════════════════

@admin.register(ProductoProveedor)
class ProductoProveedorAdmin(admin.ModelAdmin):
    list_display = (
        'producto', 'proveedor', 'codigo_proveedor',
        'precio_proveedor', 'tiempo_entrega_dias', 'es_proveedor_principal',
    )
    list_filter = ('es_proveedor_principal', 'proveedor')
    search_fields = ('producto__nombre', 'proveedor__razon_social')
    autocomplete_fields = ['producto', 'proveedor']
