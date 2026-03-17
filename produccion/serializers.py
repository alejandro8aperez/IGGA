from rest_framework import serializers
from .models import Receta, InsumoReceta, OrdenProduccion

class InsumoRecetaSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto_materia_prima.nombre', read_only=True)
    
    class Meta:
        model = InsumoReceta
        fields = '__all__'

class RecetaSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto_terminado.nombre', read_only=True)
    insumos = InsumoRecetaSerializer(many=True, read_only=True)
    
    class Meta:
        model = Receta
        fields = '__all__'

class OrdenProduccionSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='receta.producto_terminado.nombre', read_only=True)
    
    class Meta:
        model = OrdenProduccion
        fields = '__all__'
