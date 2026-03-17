from rest_framework import serializers
from .models import Cliente, Oportunidad

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

class OportunidadSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.ReadOnlyField(source='cliente.nombre')

    class Meta:
        model = Oportunidad
        fields = '__all__'
