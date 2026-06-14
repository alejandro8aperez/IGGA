from django.contrib import admin
from . import models

admin.site.register(models.CategoriaRecurso)
admin.site.register(models.Recurso)
admin.site.register(models.CategoriaActividad)

@admin.register(models.InformeDiario)
class InformeDiarioAdmin(admin.ModelAdmin):
    list_display = ('proyecto', 'fecha', 'status', 'elaborado_por', 'creado_en')
    list_filter = ('status', 'fecha', 'proyecto')
    search_fields = ('proyecto__nombre', 'proyecto__codigo', 'elaborado_por__primer_nombre', 'elaborado_por__primer_apellido')
    date_hierarchy = 'fecha'

admin.site.register(models.DetalleRecurso)
admin.site.register(models.ReporteLluvia)
admin.site.register(models.Actividad)
admin.site.register(models.AnexoFoto)
admin.site.register(models.ItemObra)
