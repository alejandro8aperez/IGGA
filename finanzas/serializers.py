from rest_framework import serializers
from .models import Cuenta, Transaccion

class CuentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuenta
        fields = '__all__'

class TransaccionSerializer(serializers.ModelSerializer):
    cuenta_nombre = serializers.ReadOnlyField(source='cuenta.nombre')
    cuenta_codigo = serializers.ReadOnlyField(source='cuenta.codigo')

    class Meta:
        model = Transaccion
        fields = '__all__'
