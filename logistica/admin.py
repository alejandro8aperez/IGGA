from django.contrib import admin
from .models import Vehiculo, Ruta, Envio, DetalleEnvio

@admin.register(Vehiculo)
class VehiculoAdmin(admin.ModelAdmin):
    list_display = ('placa', 'modelo', 'capacidad', 'estado')
    list_filter = ('estado',)

@admin.register(Ruta)
class RutaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'origen', 'destino', 'distancia_km')

@admin.register(Envio)
class EnvioAdmin(admin.ModelAdmin):
    list_display = ('numero_envio', 'cliente', 'vehiculo', 'estado', 'fecha_envio')
    list_filter = ('estado', 'fecha_envio')
    search_fields = ('numero_envio', 'cliente__nombre')

@admin.register(DetalleEnvio)
class DetalleEnvioAdmin(admin.ModelAdmin):
    list_display = ('envio', 'producto', 'cantidad')
    list_filter = ('producto',)
