from rest_framework import serializers
from .models import Segmento, Campana, Lead

class SegmentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Segmento
        fields = '__all__'

class CampanaSerializer(serializers.ModelSerializer):
    segmento_nombre = serializers.CharField(source='segmento.nombre', read_only=True)
    tasa_conversion = serializers.ReadOnlyField()
    
    class Meta:
        model = Campana
        fields = '__all__'

class LeadSerializer(serializers.ModelSerializer):
    campana_nombre = serializers.CharField(source='campana.nombre', read_only=True)
    cliente_convertido_nombre = serializers.CharField(source='cliente_convertido.nombre', read_only=True)
    
    class Meta:
        model = Lead
        fields = '__all__'