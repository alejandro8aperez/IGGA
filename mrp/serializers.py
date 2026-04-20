from rest_framework import serializers
from .models import (
    PlanMaestroProduccion, ListaMateriales, RutaManufactura, 
    RequerimientoMaterial, PlanCapacidad, EjecucionMRP, CentroTrabajo
)
from inventarios.models import Producto

class PlanMaestroProduccionSerializer(serializers.ModelSerializer):
    """Serializer para Plan Maestro de Producción (MPS)"""
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    producto_codigo = serializers.CharField(source='producto.codigo_sku', read_only=True)
    progreso = serializers.ReadOnlyField()
    
    class Meta:
        model = PlanMaestroProduccion
        fields = '__all__'

class ListaMaterialesSerializer(serializers.ModelSerializer):
    """Serializer para Bill of Materials (BOM)"""
    producto_padre_nombre = serializers.CharField(source='producto_padre.nombre', read_only=True)
    producto_hijo_nombre = serializers.CharField(source='producto_hijo.nombre', read_only=True)
    producto_hijo_codigo = serializers.CharField(source='producto_hijo.codigo_sku', read_only=True)
    
    class Meta:
        model = ListaMateriales
        fields = '__all__'

class ListaMaterialesCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear BOM"""
    class Meta:
        model = ListaMateriales
        fields = [
            'producto_padre', 'producto_hijo', 'cantidad_requerida', 
            'unidad_medida', 'nivel', 'porcentaje_desperdicio', 
            'tiempo_espera', 'tipo_componente'
        ]

class RutaManufacturaSerializer(serializers.ModelSerializer):
    """Serializer para Ruta de Manufactura"""
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    centro_trabajo_nombre = serializers.CharField(source='centro_trabajo.nombre', read_only=True)
    tiempo_total_minutos = serializers.ReadOnlyField()
    
    class Meta:
        model = RutaManufactura
        fields = '__all__'

class RequerimientoMaterialSerializer(serializers.ModelSerializer):
    """Serializer para Requerimientos de Material"""
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    producto_codigo = serializers.CharField(source='producto.codigo_sku', read_only=True)
    cantidad_por_ordenar = serializers.ReadOnlyField()
    
    class Meta:
        model = RequerimientoMaterial
        fields = '__all__'

class PlanCapacidadSerializer(serializers.ModelSerializer):
    """Serializer para Plan de Capacidad"""
    centro_trabajo_nombre = serializers.CharField(source='centro_trabajo.nombre', read_only=True)
    
    class Meta:
        model = PlanCapacidad
        fields = '__all__'

class EjecucionMRPSerializer(serializers.ModelSerializer):
    """Serializer para Ejecuciones MRP"""
    class Meta:
        model = EjecucionMRP
        fields = '__all__'

class ProductoSimpleSerializer(serializers.ModelSerializer):
    """Serializer simple para productos en BOM"""
    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'codigo_sku', 'stock_actual']

class CentroTrabajoSimpleSerializer(serializers.ModelSerializer):
    """Serializer simple para centros de trabajo"""
    class Meta:
        model = CentroTrabajo
        fields = ['id', 'nombre']

class BOMExplosionSerializer(serializers.Serializer):
    """Serializer para explosión de BOM"""
    producto = ProductoSimpleSerializer()
    componentes = ListaMaterialesSerializer(many=True)
    niveles_explosion = serializers.IntegerField(default=0)

class MRPResultadoSerializer(serializers.Serializer):
    """Serializer para resultados de ejecución MRP"""
    ejecucion_id = serializers.IntegerField()
    requerimientos_brutos = serializers.IntegerField()
    requerimientos_netos = serializers.IntegerField()
    productos_afectados = serializers.IntegerField()
    recomendaciones = serializers.ListField(child=serializers.DictField())
    periodo_plan = serializers.CharField(max_length=100)

class MPSResumenSerializer(serializers.Serializer):
    """Serializer para resumen de MPS"""
    total_items = serializers.IntegerField()
    cantidad_total = serializers.IntegerField()
    porcentaje_completado = serializers.FloatField()
    proximas_entregas = serializers.ListField(child=serializers.DictField())

class CapacidadResumenSerializer(serializers.Serializer):
    """Serializer para resumen de capacidad"""
    centros_trabajo = serializers.IntegerField()
    dias_planificados = serializers.IntegerField()
    utilizacion_promedio = serializers.FloatField()
    cuellos_botella = serializers.ListField(child=serializers.DictField())
