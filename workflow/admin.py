from django.contrib import admin
from .models import SolicitudAprobacion

@admin.register(SolicitudAprobacion)
class SolicitudAprobacionAdmin(admin.ModelAdmin):
    list_display = ('tipo', 'solicitante', 'aprobador', 'estado', 'fecha_solicitud', 'monto')
    list_filter = ('estado', 'tipo', 'fecha_solicitud')
    search_fields = ('solicitante__username', 'aprobador__username')
