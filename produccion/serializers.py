from rest_framework import serializers
from .models import Receta, InsumoReceta, OrdenProduccion, CostoProduccion

from calidad.serializers import DocumentoISOSerializer

class InsumoRecetaSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto_materia_prima.nombre', read_only=True)
    
    class Meta:
        model = InsumoReceta
        fields = '__all__'

class RecetaSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto_terminado.nombre', read_only=True)
    insumos = InsumoRecetaSerializer(many=True, read_only=True)
    instructivos_sgc_detalles = DocumentoISOSerializer(source='instructivos_sgc', many=True, read_only=True)
    
    class Meta:
        model = Receta
        fields = '__all__'

class OrdenProduccionSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='receta.producto_terminado.nombre', read_only=True)
    receta_detalles = RecetaSerializer(source='receta', read_only=True)
    
    class Meta:
        model = OrdenProduccion
        fields = '__all__'


class CostoProduccionSerializer(serializers.ModelSerializer):
    orden_detalle = serializers.CharField(source='orden.__str__', read_only=True)

    class Meta:
        model = CostoProduccion
        fields = '__all__'
