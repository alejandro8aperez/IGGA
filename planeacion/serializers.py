from rest_framework import serializers
from .models import PlanEstratégico, Objetivo

class ObjetivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Objetivo
        fields = '__all__'

class PlanEstratégicoSerializer(serializers.ModelSerializer):
    objetivos = ObjetivoSerializer(many=True, read_only=True)
    duracion_dias = serializers.SerializerMethodField()

    class Meta:
        model = PlanEstratégico
        fields = '__all__'

    def get_duracion_dias(self, obj):
        return obj.duracion_dias()
