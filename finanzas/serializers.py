from rest_framework import serializers
from .models import Cuenta, Transaccion, ActivoFijo

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

class ActivoFijoSerializer(serializers.ModelSerializer):
    valor_neto = serializers.SerializerMethodField()

    class Meta:
        model = ActivoFijo
        fields = '__all__'

    def get_valor_neto(self, obj):
        return obj.valor_neto()
