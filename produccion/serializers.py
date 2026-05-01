from rest_framework import serializers
from .models import (
    Receta, InsumoReceta, OrdenProduccion, FaseOrdenProduccion,
    ConsumoProduccion, MermaProduccion, CostoProduccion
)
from calidad.serializers import DocumentoISOSerializer

class InsumoRecetaSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto_materia_prima.nombre')
    producto_unidad = serializers.ReadOnlyField(source='producto_materia_prima.unidad_medida')
    
    class Meta:
        model = InsumoReceta
        fields = '__all__'

class RecetaSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto_terminado.nombre')
    insumos = InsumoRecetaSerializer(many=True, read_only=True)
    instructivos_sgc_detalles = DocumentoISOSerializer(source='instructivos_sgc', many=True, read_only=True)
    
    class Meta:
        model = Receta
        fields = '__all__'

class FaseOrdenProduccionSerializer(serializers.ModelSerializer):
    estado_display = serializers.ReadOnlyField(source='get_estado_display')

    class Meta:
        model = FaseOrdenProduccion
        fields = '__all__'

class ConsumoProduccionSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    producto_unidad = serializers.ReadOnlyField(source='producto.unidad_medida')

    class Meta:
        model = ConsumoProduccion
        fields = '__all__'

class MermaProduccionSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    producto_unidad = serializers.ReadOnlyField(source='producto.unidad_medida')

    class Meta:
        model = MermaProduccion
        fields = '__all__'

class CostoProduccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostoProduccion
        fields = '__all__'

class OrdenProduccionSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='receta.producto_terminado.nombre')
    estado_display = serializers.ReadOnlyField(source='get_estado_display')
    prioridad_display = serializers.ReadOnlyField(source='get_prioridad_display')
    
    fases = FaseOrdenProduccionSerializer(many=True, read_only=True)
    consumos = ConsumoProduccionSerializer(many=True, read_only=True)
    mermas = MermaProduccionSerializer(many=True, read_only=True)
    costo = CostoProduccionSerializer(read_only=True)
    
    class Meta:
        model = OrdenProduccion
        fields = '__all__'

class OrdenProduccionListSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='receta.producto_terminado.nombre')
    estado_display = serializers.ReadOnlyField(source='get_estado_display')
    
    class Meta:
        model = OrdenProduccion
        fields = (
            'id', 'numero', 'producto_nombre', 'cantidad_a_producir', 
            'cantidad_producida', 'estado', 'estado_display', 
            'prioridad', 'fecha_planeada_inicio', 'fecha_planeada_fin'
        )
