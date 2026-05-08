from rest_framework import serializers
from .models import ResolucionFacturacion, Factura, DetalleFactura
from crm.serializers import ClienteSerializer

class ResolucionFacturacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResolucionFacturacion
        fields = '__all__'

class DetalleFacturaSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')

    class Meta:
        model = DetalleFactura
        fields = '__all__'

class FacturaSerializer(serializers.ModelSerializer):
    detalles = DetalleFacturaSerializer(many=True, read_only=True)
    cliente_nombre = serializers.ReadOnlyField(source='cliente.nombre')
    cliente_ruc = serializers.ReadOnlyField(source='cliente.cedula')

    class Meta:
        model = Factura
        fields = '__all__'
