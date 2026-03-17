from rest_framework import serializers
from .models import Proveedor, OrdenCompra, DetalleOrdenCompra

class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = '__all__'

class DetalleOrdenCompraSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    
    class Meta:
        model = DetalleOrdenCompra
        fields = '__all__'

class OrdenCompraSerializer(serializers.ModelSerializer):
    proveedor_nombre = serializers.ReadOnlyField(source='proveedor.razon_social')
    detalles = DetalleOrdenCompraSerializer(many=True, read_only=True)
    
    class Meta:
        model = OrdenCompra
        fields = '__all__'
