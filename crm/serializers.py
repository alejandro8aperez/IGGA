from rest_framework import serializers
from .models import Cliente, Oportunidad, Cotizacion, CotizacionDetalle

class ClienteSerializer(serializers.ModelSerializer):
    logotipo_url = serializers.SerializerMethodField()
    tipo_cliente_display = serializers.CharField(source='get_tipo_cliente_display', read_only=True)
    regimen_tributario_display = serializers.CharField(source='get_regimen_tributario_display', read_only=True)
    clasificacion_display = serializers.CharField(source='get_clasificacion_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    tipo_cuenta_display = serializers.SerializerMethodField()

    def get_tipo_cuenta_display(self, obj):
        return obj.get_tipo_cuenta_display() if obj.tipo_cuenta else None

    class Meta:
        model = Cliente
        fields = '__all__'
    
    def get_logotipo_url(self, obj):
        if obj.logotipo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logotipo.url)
            return obj.logotipo.url
        return None

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

        scalar_fields = [
            'cliente', 'asunto', 'estado', 'fecha_validez',
            'tiempo_entrega', 'forma_pago', 'garantia',
            'validez_oferta', 'porcentaje_iva',
        ]
        for field in scalar_fields:
            setattr(instance, field, validated_data.get(field, getattr(instance, field)))

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
