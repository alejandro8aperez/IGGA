from django.contrib import admin
from django.utils.html import mark_safe
from .models import (
    Categoria, Almacen, Producto, Lote,
    MovimientoInventario, AlertaInventario,
    ConteoFisico, DetalleConteoFisico,
)


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion', 'total_productos')
    search_fields = ('nombre',)

    def total_productos(self, obj):
        return obj.productos.count()
    total_productos.short_description = 'Productos'


@admin.register(Almacen)
class AlmacenAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'nombre', 'responsable', 'es_principal', 'activo')
    list_filter = ('es_principal', 'activo')
    search_fields = ('codigo', 'nombre')


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = (
        'codigo_sku', 'nombre', 'categoria', 'tipo_producto',
        'precio_venta', 'stock_actual', 'stock_minimo',
        'stock_estado', 'activo', 'imagen_preview',
    )
    list_filter = ('categoria', 'tipo_producto', 'activo', 'es_perecedero', 'almacen')
    search_fields = ('nombre', 'codigo_sku', 'marca', 'referencia_fabrica')
    readonly_fields = ('imagen_preview', 'fecha_creacion', 'fecha_actualizacion')
    list_editable = ('activo',)
    fieldsets = (
        ('Información Básica', {
            'fields': (
                'nombre', 'codigo_sku', 'descripcion', 'categoria',
                'marca', 'referencia_fabrica', 'imagen', 'imagen_preview',
            )
        }),
        ('Clasificación', {
            'fields': ('tipo_producto', 'unidad_medida')
        }),
        ('Precios', {
            'fields': ('precio_venta', 'precio_compra')
        }),
        ('Inventario', {
            'fields': (
                'stock_actual', 'stock_minimo', 'stock_maximo',
                'punto_reorden', 'almacen', 'ubicacion_almacen',
            )
        }),
        ('Características Físicas', {
            'fields': ('peso_unitario_kg',),
            'classes': ('collapse',),
        }),
        ('Perecedero / Trazabilidad', {
            'fields': ('es_perecedero', 'dias_vida_util', 'requiere_lote'),
            'classes': ('collapse',),
        }),
        ('Estado y Notas', {
            'fields': ('activo', 'notas')
        }),
        ('Auditoría', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',),
        }),
    )

    def imagen_preview(self, obj):
        if obj.imagen:
            return mark_safe(f'<img src="{obj.imagen.url}" width="80" height="80" style="object-fit: cover; border-radius: 4px;" />')
        return 'Sin imagen'
    imagen_preview.short_description = 'Vista Previa'

    def stock_estado(self, obj):
        if obj.stock_actual <= 0:
            return mark_safe('<span style="color: red; font-weight: bold;">⛔ AGOTADO</span>')
        elif obj.stock_bajo:
            return mark_safe('<span style="color: orange; font-weight: bold;">⚠ BAJO</span>')
        return mark_safe('<span style="color: green;">✅ OK</span>')
    stock_estado.short_description = 'Estado Stock'


@admin.register(Lote)
class LoteAdmin(admin.ModelAdmin):
    list_display = (
        'numero_lote', 'producto', 'cantidad_disponible',
        'fecha_vencimiento', 'estado',
    )
    list_filter = ('estado', 'producto')
    search_fields = ('numero_lote', 'producto__nombre')


@admin.register(MovimientoInventario)
class MovimientoInventarioAdmin(admin.ModelAdmin):
    list_display = (
        'producto', 'tipo', 'cantidad', 'origen',
        'documento_referencia', 'stock_resultante', 'fecha',
    )
    list_filter = ('tipo', 'origen', 'fecha')
    search_fields = ('producto__nombre', 'motivo', 'documento_referencia')
    readonly_fields = ('fecha', 'stock_resultante')


@admin.register(AlertaInventario)
class AlertaInventarioAdmin(admin.ModelAdmin):
    list_display = ('producto', 'tipo', 'estado', 'stock_al_momento', 'fecha_creacion')
    list_filter = ('tipo', 'estado')
    search_fields = ('producto__nombre', 'mensaje')
    readonly_fields = ('fecha_creacion',)
    actions = ['marcar_resueltas']

    def marcar_resueltas(self, request, queryset):
        from django.utils import timezone
        queryset.update(estado='resuelta', fecha_resolucion=timezone.now())
    marcar_resueltas.short_description = "Marcar seleccionadas como resueltas"


class DetalleConteoInline(admin.TabularInline):
    model = DetalleConteoFisico
    extra = 1


@admin.register(ConteoFisico)
class ConteoFisicoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'tipo', 'almacen', 'estado', 'fecha_programada', 'responsable')
    list_filter = ('tipo', 'estado')
    inlines = [DetalleConteoInline]
