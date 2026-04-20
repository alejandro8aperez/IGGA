from rest_framework import serializers
from .models import Cuenta, AsientoContable, MovimientoContable

class CuentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuenta
        fields = '__all__'

class MovimientoContableSerializer(serializers.ModelSerializer):
    cuenta_nombre = serializers.CharField(source='cuenta.nombre', read_only=True)
    
    class Meta:
        model = MovimientoContable
        fields = '__all__'

class AsientoContableSerializer(serializers.ModelSerializer):
    movimientos = MovimientoContableSerializer(many=True, read_only=True)
    
    class Meta:
        model = AsientoContable
        fields = '__all__'