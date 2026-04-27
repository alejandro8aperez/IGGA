from django.contrib import admin
from .models import Categoria, Producto, MovimientoInventario

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion')
    search_fields = ('nombre',)

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('codigo_sku', 'nombre', 'categoria', 'precio_venta', 'stock_actual', 'imagen_preview')
    list_filter = ('categoria', 'precio_venta')
    search_fields = ('nombre', 'codigo_sku')
    readonly_fields = ('imagen_preview',)
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'codigo_sku', 'categoria', 'imagen', 'imagen_preview')
        }),
        ('Precios', {
            'fields': ('precio_venta', 'precio_compra')
        }),
        ('Inventario', {
            'fields': ('stock_actual', 'stock_minimo')
        }),
    )
    
    def imagen_preview(self, obj):
        if obj.imagen:
            return f'<img src="{obj.imagen.url}" width="100" height="100" />'
        return 'Sin imagen'
    imagen_preview.short_description = 'Vista Previa'
    imagen_preview.allow_tags = True

@admin.register(MovimientoInventario)
class MovimientoInventarioAdmin(admin.ModelAdmin):
    list_display = ('producto', 'tipo', 'cantidad', 'fecha', 'motivo')
    list_filter = ('tipo', 'fecha')
    search_fields = ('producto__nombre', 'motivo')
    readonly_fields = ('fecha',)
