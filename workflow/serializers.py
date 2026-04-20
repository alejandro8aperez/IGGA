from rest_framework import serializers
from .models import SolicitudAprobacion

class SolicitudAprobacionSerializer(serializers.ModelSerializer):
    solicitante_username = serializers.CharField(source='solicitante.username', read_only=True)
    aprobador_username = serializers.CharField(source='aprobador.username', read_only=True)
    
    class Meta:
        model = SolicitudAprobacion
        fields = '__all__'