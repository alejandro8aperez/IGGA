from django.contrib import admin
from .models import (
    GrupoMaterial, FamiliaProducto, TipoEmpaque, FichaProducto,
    CodigoBarras, UnidadEmpaque, UnidadMedidaAlternativa,
)


@admin.register(FichaProducto)
class FichaProductoAdmin(admin.ModelAdmin):
    list_display = [
        'producto', 'grupo_material', 'familia', 'tipo_empaque',
        'estado_material', 'clase_abc', 'imagen_preview'
    ]
    list_filter = ['estado_material', 'grupo_material', 'familia', 'clase_abc']
    search_fields = [
        'producto__codigo_sku', 'producto__nombre',
        'codigo_gtin', 'codigo_interno', 'codigo_dian'
    ]
    readonly_fields = ['imagen_preview', 'fecha_creacion', 'fecha_actualizacion']

    fieldsets = (
        ('Clasificacion SAP', {
            'fields': ('producto', 'grupo_material', 'familia', 'codigo_interno',
                       'codigo_dian', 'codigo_arancelario', 'codigo_gtin')
        }),
        ('Empaque', {
            'fields': ('tipo_empaque', 'presentacion', 'contenido_neto',
                       'unidad_contenido', 'unidades_por_empaque')
        }),
        ('Dimensiones y peso', {
            'fields': ('largo_cm', 'ancho_cm', 'alto_cm', 'volumen_m3',
                       'peso_bruto_kg', 'peso_neto_kg')
        }),
        ('Compras', {
            'fields': ('lead_time_dias', 'cantidad_minima_compra', 'moneda_compra',
                       'ultimo_precio_compra', 'fecha_ultima_compra')
        }),
        ('Ventas', {
            'fields': ('lista_precios', 'iva_porcentaje', 'precio_sugerido',
                       'permite_descuento', 'es_vendible')
        }),
        ('MRP / Planificacion', {
            'fields': ('politica_inventario', 'planificador',
                       'tiempo_produccion_dias', 'lote_minimo_produccion', 'lote_estandar')
        }),
        ('Almacen', {
            'fields': ('gestion_lote', 'gestion_serie', 'temperatura_almacenamiento',
                       'clase_abc', 'estado_material')
        }),
        ('Regulatorio / Calidad', {
            'fields': ('requiere_certificado', 'norma_calidad', 'ficha_tecnica_url')
        }),
        ('Imagen', {
            'fields': ('imagen', 'imagen_preview')
        }),
        ('Observaciones', {
            'fields': ('observaciones',)
        }),
        ('Auditoria', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )

    def imagen_preview(self, obj):
        from django.utils.html import format_html
        if obj.imagen:
            return format_html('<img src="{}" style="max-height: 100px; max-width: 150px;" />', obj.imagen.url)
        return "Sin imagen"
    imagen_preview.short_description = "Vista previa"


@admin.register(GrupoMaterial)
class GrupoMaterialAdmin(admin.ModelAdmin):
    list_display = ['codigo', 'nombre', 'activo']
    list_filter = ['activo']
    search_fields = ['codigo', 'nombre']


@admin.register(FamiliaProducto)
class FamiliaProductoAdmin(admin.ModelAdmin):
    list_display = ['codigo', 'nombre', 'padre', 'activo']
    list_filter = ['activo', 'padre']
    search_fields = ['codigo', 'nombre']


@admin.register(TipoEmpaque)
class TipoEmpaqueAdmin(admin.ModelAdmin):
    list_display = ['codigo', 'nombre', 'activo']
    list_filter = ['activo']
    search_fields = ['codigo', 'nombre']


@admin.register(CodigoBarras)
class CodigoBarrasAdmin(admin.ModelAdmin):
    list_display = ['producto', 'codigo', 'tipo', 'es_principal', 'activo']
    list_filter = ['tipo', 'es_principal', 'activo']
    search_fields = ['codigo', 'producto__codigo_sku', 'producto__nombre']


@admin.register(UnidadEmpaque)
class UnidadEmpaqueAdmin(admin.ModelAdmin):
    list_display = ['producto', 'nivel', 'descripcion', 'factor_conversion', 'es_predeterminado']
    list_filter = ['nivel', 'es_predeterminado']
    search_fields = ['producto__codigo_sku', 'descripcion']


@admin.register(UnidadMedidaAlternativa)
class UnidadMedidaAlternativaAdmin(admin.ModelAdmin):
    list_display = ['producto', 'unidad', 'factor_a_base', 'es_predeterminada_venta', 'es_predeterminada_compra']
    list_filter = ['es_predeterminada_venta', 'es_predeterminada_compra']
    search_fields = ['producto__codigo_sku', 'unidad__nombre']
