from rest_framework import serializers
from .models import Equipo, OrdenMantenimiento, Repuesto, DetalleMantenimiento, CostoMantenimiento

class EquipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipo
        fields = '__all__'

class RepuestoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Repuesto
        fields = '__all__'

class DetalleMantenimientoSerializer(serializers.ModelSerializer):
    repuesto_descripcion = serializers.ReadOnlyField(source='repuesto.descripcion')
    
    class Meta:
        model = DetalleMantenimiento
        fields = '__all__'

class OrdenMantenimientoSerializer(serializers.ModelSerializer):
    equipo_nombre = serializers.ReadOnlyField(source='equipo.nombre')
    técnico_nombre = serializers.ReadOnlyField(source='técnico_asignado.username')
    detalles = DetalleMantenimientoSerializer(many=True, read_only=True)

    class Meta:
        model = OrdenMantenimiento
        fields = '__all__'


class CostoMantenimientoSerializer(serializers.ModelSerializer):
    orden_numero = serializers.ReadOnlyField(source='orden.numero')
    equipo_nombre = serializers.ReadOnlyField(source='equipo.nombre')

    class Meta:
        model = CostoMantenimiento
        fields = '__all__'