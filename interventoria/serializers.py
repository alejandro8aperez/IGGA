from rest_framework import serializers
from .models import ContratoInterventoria, VisitaInterventoria, Hallazgo

class HallazgoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hallazgo
        fields = '__all__'

class VisitaInterventoriaSerializer(serializers.ModelSerializer):
    hallazgos = HallazgoSerializer(many=True, read_only=True)
    registrado_por_nombre = serializers.ReadOnlyField(source='registrado_por.get_full_name')

    class Meta:
        model = VisitaInterventoria
        fields = '__all__'

class ContratoInterventoriaSerializer(serializers.ModelSerializer):
    visitas_count = serializers.IntegerField(source='visitas.count', read_only=True)
    interventor_nombre = serializers.ReadOnlyField(source='interventor_encargado.get_full_name')

    class Meta:
        model = ContratoInterventoria
        fields = '__all__'