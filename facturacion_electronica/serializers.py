"""
Serializers para Facturación Electrónica
"""
from rest_framework import serializers
from .models import FacturaElectronicaLog, ConfiguracionFacturatech


class FacturaElectronicaLogSerializer(serializers.ModelSerializer):
    """
    Serializer para logs de facturas electrónicas
    """
    class Meta:
        model = FacturaElectronicaLog
        fields = '__all__'
        read_only_fields = [
            'fecha_envio', 
            'fecha_respuesta', 
            'xml_base64',
            'intentos_envio'
        ]


class ConfiguracionFacturatechSerializer(serializers.ModelSerializer):
    """
    Serializer para configuración de Facturatech
    """
    # No exponer el password_hash completo en la API
    password_mask = serializers.SerializerMethodField()
    
    class Meta:
        model = ConfiguracionFacturatech
        fields = [
            'id', 'nombre_config', 'nit', 'password_mask',
            'wsdl_demo_ventas', 'wsdl_demo_pos',
            'wsdl_prod_ventas', 'wsdl_prod_pos',
            'ambiente_activo', 'activo',
            'creado', 'actualizado'
        ]
        read_only_fields = ['creado', 'actualizado']
        extra_kwargs = {
            'password_hash': {'write_only': True}
        }
    
    def get_password_mask(self, obj):
        """
        Muestra solo los primeros y últimos 4 caracteres del hash
        """
        if obj.password_hash:
            return obj.password_hash[:4] + '****' + obj.password_hash[-4:]
        return None


class EnviarFacturaSerializer(serializers.Serializer):
    """
    Serializer para request de envío de factura
    """
    factura_id = serializers.IntegerField(required=False, allow_null=True)
    factura_numero = serializers.CharField(required=False, allow_blank=True)
    xml_content = serializers.CharField(required=True)
    tipo = serializers.ChoiceField(
        choices=['ventas', 'pos'],
        default='ventas',
        required=False
    )


class RespuestaFacturaSerializer(serializers.Serializer):
    """
    Serializer para respuesta de envío de factura
    """
    exito = serializers.BooleanField()
    codigo = serializers.CharField(required=False, allow_blank=True)
    mensaje = serializers.CharField(required=False, allow_blank=True)
    cufe = serializers.CharField(required=False, allow_blank=True)
    track_id = serializers.CharField(required=False, allow_blank=True)
    error = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class GenerarXMLSerializer(serializers.Serializer):
    """
    Serializer para generación de XML
    """
    encabezado = serializers.DictField()
    emisor = serializers.DictField()
    adquiriente = serializers.DictField()
    items = serializers.ListField()
    totales = serializers.DictField(required=False)
