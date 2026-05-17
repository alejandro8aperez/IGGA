from django.contrib import admin
from .models import (
    GrupoMaterial, FamiliaProducto, TipoEmpaque, FichaProducto,
    CodigoBarras, UnidadEmpaque, UnidadMedidaAlternativa,
)


@admin.register(FichaProducto)
class FichaProductoAdmin(admin.ModelAdmin):
    list_display = ['producto', 'grupo_material', 'tipo_empaque', 'estado_material', 'clase_abc']
    list_filter = ['estado_material', 'grupo_material', 'clase_abc']
    search_fields = ['producto__codigo_sku', 'producto__nombre', 'codigo_gtin']


admin.site.register(GrupoMaterial)
admin.site.register(FamiliaProducto)
admin.site.register(TipoEmpaque)
admin.site.register(CodigoBarras)
admin.site.register(UnidadEmpaque)
admin.site.register(UnidadMedidaAlternativa)
