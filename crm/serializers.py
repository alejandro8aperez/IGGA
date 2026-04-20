from rest_framework import serializers
from .models import Cliente, Oportunidad, Cotizacion, CotizacionDetalle

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

class OportunidadSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.ReadOnlyField(source='cliente.nombre')

    class Meta:
        model = Oportunidad
        fields = '__all__'

class CotizacionDetalleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CotizacionDetalle
        fields = '__all__'
        read_only_fields = ('cotizacion', 'valor_total')

class CotizacionSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.ReadOnlyField(source='cliente.nombre')
    detalles = CotizacionDetalleSerializer(many=True, required=False)

    class Meta:
        model = Cotizacion
        fields = '__all__'

    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles', [])
        cotizacion = Cotizacion.objects.create(**validated_data)
        total_global = 0
        for detalle_data in detalles_data:
            detalle = CotizacionDetalle.objects.create(cotizacion=cotizacion, **detalle_data)
            if detalle.valor_total:
                total_global += detalle.valor_total
        
        cotizacion.valor_total = total_global
        cotizacion.save()
        return cotizacion

    def update(self, instance, validated_data):
        detalles_data = validated_data.pop('detalles', None)
        
        instance.cliente = validated_data.get('cliente', instance.cliente)
        instance.asunto = validated_data.get('asunto', instance.asunto)
        instance.estado = validated_data.get('estado', instance.estado)
        instance.fecha_validez = validated_data.get('fecha_validez', instance.fecha_validez)

        if detalles_data is not None:
            instance.detalles.all().delete()
            total_global = 0
            for detalle_data in detalles_data:
                detalle = CotizacionDetalle.objects.create(cotizacion=instance, **detalle_data)
                if detalle.valor_total:
                    total_global += detalle.valor_total
            instance.valor_total = total_global
        else:
            instance.valor_total = validated_data.get('valor_total', instance.valor_total)

        instance.save()
        return instance
