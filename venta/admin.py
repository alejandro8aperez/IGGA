from django.contrib import admin
from .models import OrdenVenta, DetalleOrdenVenta, FacturaVenta

@admin.register(OrdenVenta)
class OrdenVentaAdmin(admin.ModelAdmin):
    list_display = ('id', 'cliente', 'fecha_emision', 'estado', 'total')
    list_filter = ('estado', 'fecha_emision')
    search_fields = ('cliente__nombre',)

@admin.register(DetalleOrdenVenta)
class DetalleOrdenVentaAdmin(admin.ModelAdmin):
    list_display = ('orden', 'producto', 'cantidad', 'precio_unitario')
    list_filter = ('producto',)

@admin.register(FacturaVenta)
class FacturaVentaAdmin(admin.ModelAdmin):
    list_display = ('numero_factura', 'orden_venta', 'fecha_emision', 'total', 'estado')
    list_filter = ('estado', 'fecha_emision')
    search_fields = ('numero_factura', 'orden_venta__cliente__nombre')
