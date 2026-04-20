from rest_framework import serializers
from .models import Proyecto, Tarea, ProyectoPS, WBSItem, HitoPS, CostoPS

class TareaSerializer(serializers.ModelSerializer):
    asignado_a_username = serializers.CharField(source='asignado_a.username', read_only=True)

    class Meta:
        model = Tarea
        fields = '__all__'

class ProyectoSerializer(serializers.ModelSerializer):
    tareas = TareaSerializer(many=True, read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    gerente_username = serializers.CharField(source='gerente.username', read_only=True)

    class Meta:
        model = Proyecto
        fields = '__all__'

class WBSItemSerializer(serializers.ModelSerializer):
    valor_total = serializers.SerializerMethodField()

    class Meta:
        model = WBSItem
        fields = '__all__'

    def get_valor_total(self, obj):
        return obj.valor_total

class HitoPSSerializer(serializers.ModelSerializer):
    estado = serializers.SerializerMethodField()

    class Meta:
        model = HitoPS
        fields = '__all__'

    def get_estado(self, obj):
        return obj.estado()

class CostoPSSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostoPS
        fields = '__all__'

class ProyectoPSSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    gerente_username = serializers.CharField(source='gerente.username', read_only=True)
    avance = serializers.SerializerMethodField()
    cpi = serializers.SerializerMethodField()
    spi = serializers.SerializerMethodField()
    wbs_items = WBSItemSerializer(many=True, read_only=True)
    hitos_ps = HitoPSSerializer(many=True, read_only=True)
    costos = CostoPSSerializer(many=True, read_only=True)

    class Meta:
        model = ProyectoPS
        fields = '__all__'

    def get_avance(self, obj):
        return obj.avance()

    def get_cpi(self, obj):
        return obj.cpi()

    def get_spi(self, obj):
        return obj.spi()