from rest_framework import serializers
from .models import Proveedor, OrdenCompra, DetalleOrdenCompra, Contrato, RecepcionCompra, PagoCompra

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

class RecepcionCompraSerializer(serializers.ModelSerializer):
    orden_id = serializers.ReadOnlyField(source='orden.id')

    class Meta:
        model = RecepcionCompra
        fields = '__all__'

class PagoCompraSerializer(serializers.ModelSerializer):
    orden_id = serializers.ReadOnlyField(source='orden.id')

    class Meta:
        model = PagoCompra
        fields = '__all__'

class ContratoSerializer(serializers.ModelSerializer):
    proveedor_nombre = serializers.ReadOnlyField(source='proveedor.razon_social')
    duracion_dias = serializers.SerializerMethodField()

    class Meta:
        model = Contrato
        fields = '__all__'

    def get_duracion_dias(self, obj):
        return obj.duracion_dias()
