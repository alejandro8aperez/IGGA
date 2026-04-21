from rest_framework import serializers
from .models import SesionCaja, VentaPOS
from facturacion.serializers import FacturaSerializer

class SesionCajaSerializer(serializers.ModelSerializer):
    class Meta:
        model = SesionCaja
        fields = '__all__'

class VentaPOSSerializer(serializers.ModelSerializer):
    factura_detalle = FacturaSerializer(source='factura', read_only=True)
    
    class Meta:
        model = VentaPOS
        fields = '__all__'
