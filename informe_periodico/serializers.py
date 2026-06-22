from rest_framework import serializers
from .models import InformeSemanal, InformeMensual


class InformeSemanalSerializer(serializers.ModelSerializer):
    proyecto_nombre = serializers.CharField(source='proyecto.nombre', read_only=True, default='')
    elaborado_por_info = serializers.SerializerMethodField()
    revisado_por_info = serializers.SerializerMethodField()
    profesional_1_info = serializers.SerializerMethodField()
    profesional_2_info = serializers.SerializerMethodField()
    avance_programado = serializers.SerializerMethodField()
    avance_ejecutado = serializers.SerializerMethodField()

    class Meta:
        model = InformeSemanal
        fields = '__all__'
        read_only_fields = ['creado_en', 'actualizado_en']

    def get_avance_programado(self, obj):
        data = obj.curva_s_data
        if data and isinstance(data, list) and len(data) > 0:
            return data[-1].get('programado', 0)
        return None

    def get_avance_ejecutado(self, obj):
        data = obj.curva_s_data
        if data and isinstance(data, list) and len(data) > 0:
            return data[-1].get('ejecutado', 0)
        return None

    def get_elaborado_por_info(self, obj):
        if obj.elaborado_por:
            return {'id': obj.elaborado_por.id, 'nombre': obj.elaborado_por.nombre,
                    'cargo': obj.elaborado_por.cargo or ''}
        return None

    def get_revisado_por_info(self, obj):
        if obj.revisado_por:
            return {'id': obj.revisado_por.id, 'nombre': obj.revisado_por.nombre,
                    'cargo': obj.revisado_por.cargo or ''}
        return None

    def get_profesional_1_info(self, obj):
        if obj.profesional_1:
            return {'id': obj.profesional_1.id, 'nombre': obj.profesional_1.nombre,
                    'cargo': obj.profesional_1.cargo or ''}
        return None

    def get_profesional_2_info(self, obj):
        if obj.profesional_2:
            return {'id': obj.profesional_2.id, 'nombre': obj.profesional_2.nombre,
                    'cargo': obj.profesional_2.cargo or ''}
        return None

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['creado_por'] = request.user
        return super().create(validated_data)


class InformeMensualSerializer(serializers.ModelSerializer):
    proyecto_nombre = serializers.CharField(source='proyecto.nombre', read_only=True, default='')
    elaborado_por_info = serializers.SerializerMethodField()
    revisado_por_info = serializers.SerializerMethodField()
    profesional_1_info = serializers.SerializerMethodField()
    profesional_2_info = serializers.SerializerMethodField()
    avance_programado = serializers.SerializerMethodField()
    avance_ejecutado = serializers.SerializerMethodField()

    class Meta:
        model = InformeMensual
        fields = '__all__'
        read_only_fields = ['creado_en', 'actualizado_en']

    def get_avance_programado(self, obj):
        data = obj.curva_s_data
        if data and isinstance(data, list) and len(data) > 0:
            return data[-1].get('programado', 0)
        return None

    def get_avance_ejecutado(self, obj):
        data = obj.curva_s_data
        if data and isinstance(data, list) and len(data) > 0:
            return data[-1].get('ejecutado', 0)
        return None

    def get_elaborado_por_info(self, obj):
        if obj.elaborado_por:
            return {'id': obj.elaborado_por.id, 'nombre': obj.elaborado_por.nombre,
                    'cargo': obj.elaborado_por.cargo or ''}
        return None

    def get_revisado_por_info(self, obj):
        if obj.revisado_por:
            return {'id': obj.revisado_por.id, 'nombre': obj.revisado_por.nombre,
                    'cargo': obj.revisado_por.cargo or ''}
        return None

    def get_profesional_1_info(self, obj):
        if obj.profesional_1:
            return {'id': obj.profesional_1.id, 'nombre': obj.profesional_1.nombre,
                    'cargo': obj.profesional_1.cargo or ''}
        return None

    def get_profesional_2_info(self, obj):
        if obj.profesional_2:
            return {'id': obj.profesional_2.id, 'nombre': obj.profesional_2.nombre,
                    'cargo': obj.profesional_2.cargo or ''}
        return None

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['creado_por'] = request.user
        return super().create(validated_data)
