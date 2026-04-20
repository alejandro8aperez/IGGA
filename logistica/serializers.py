from rest_framework import serializers
from .models import Vehiculo, Ruta, Envio, DetalleEnvio

class VehiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehiculo
        fields = '__all__'

class RutaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ruta
        fields = '__all__'

class DetalleEnvioSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    
    class Meta:
        model = DetalleEnvio
        fields = '__all__'

class EnvioSerializer(serializers.ModelSerializer):
    detalles = DetalleEnvioSerializer(many=True, read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    vehiculo_placa = serializers.CharField(source='vehiculo.placa', read_only=True)
    
    class Meta:
        model = Envio
        fields = '__all__'