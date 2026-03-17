from rest_framework import serializers
from .models import Empleado, Asistencia

class EmpleadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = '__all__'

class AsistenciaSerializer(serializers.ModelSerializer):
    empleado_nombre = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Asistencia
        fields = '__all__'
        
    def get_empleado_nombre(self, obj):
        return f"{obj.empleado.nombre} {obj.empleado.apellidos}"
