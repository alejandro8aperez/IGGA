from rest_framework import serializers
from .models import Proyecto, Tarea, InformeDiarioProy
from crm.models import Cliente

class ProyectoSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)

    class Meta:
        model = Proyecto
        fields = '__all__'

class TareaSerializer(serializers.ModelSerializer):
    proyecto_nombre = serializers.CharField(source='proyecto.nombre', read_only=True)

    class Meta:
        model = Tarea
        fields = '__all__'


class InformeDiarioProySerializer(serializers.ModelSerializer):
    creado_por_nombre = serializers.CharField(source='creado_por.username', read_only=True)
    
    class Meta:
        model = InformeDiarioProy
        fields = '__all__'
