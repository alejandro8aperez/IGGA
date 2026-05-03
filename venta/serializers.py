from rest_framework import serializers
from .models import OrdenVenta, DetalleOrdenVenta, FacturaVenta

class DetalleOrdenVentaSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    # Mapear campos del frontend al backend
    valor_unitario = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True, required=False)
    
    class Meta:
        model = DetalleOrdenVenta
        fields = ['id', 'orden', 'producto', 'producto_nombre', 'cantidad', 'precio_unitario', 'valor_unitario']
        extra_kwargs = {
            'orden': {'required': False, 'allow_null': True}
        }

class OrdenVentaSerializer(serializers.ModelSerializer):
    detalles = DetalleOrdenVentaSerializer(many=True)
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    
    class Meta:
        model = OrdenVenta
        fields = '__all__'
    
    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles', [])
        orden = OrdenVenta.objects.create(**validated_data)
        
        for detalle_data in detalles_data:
            # Mapear valor_unitario a precio_unitario si viene del frontend
            if 'valor_unitario' in detalle_data:
                detalle_data['precio_unitario'] = detalle_data.pop('valor_unitario')
            DetalleOrdenVenta.objects.create(orden=orden, **detalle_data)
        
        return orden
    
    def update(self, instance, validated_data):
        detalles_data = validated_data.pop('detalles', None)
        
        # Actualizar campos de la orden
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Actualizar detalles si se proporcionaron
        if detalles_data is not None:
            # Eliminar detalles existentes
            instance.detalles.all().delete()
            
            # Crear nuevos detalles
            for detalle_data in detalles_data:
                if 'valor_unitario' in detalle_data:
                    detalle_data['precio_unitario'] = detalle_data.pop('valor_unitario')
                DetalleOrdenVenta.objects.create(orden=instance, **detalle_data)
        
        return instance

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