from rest_framework import serializers
from .models import OrdenVenta, DetalleOrdenVenta, FacturaVenta

class DetalleOrdenVentaSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    
    class Meta:
        model = DetalleOrdenVenta
        fields = '__all__'

class OrdenVentaSerializer(serializers.ModelSerializer):
    detalles = DetalleOrdenVentaSerializer(many=True, read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    
    class Meta:
        model = OrdenVenta
        fields = '__all__'

class FacturaVentaSerializer(serializers.ModelSerializer):
    orden_venta_cliente = serializers.CharField(source='orden_venta.cliente.nombre', read_only=True)

    class Meta:
        model = FacturaVenta
        fields = '__all__'
        read_only_fields = ('contabilidad_generado', 'cobro_contabilizado')

    def validate_orden_venta(self, value):
        if value.estado == 'cancelada':
            raise serializers.ValidationError('No se puede generar factura para una orden de venta cancelada.')
        return value