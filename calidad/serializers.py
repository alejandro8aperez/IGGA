from rest_framework import serializers
from .models import NormaCalidad, Inspeccion, Defecto, DocumentoISO, NoConformidad, AccionCorrectiva, Auditoria, EvaluacionProveedor

class NormaCalidadSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    class Meta:
        model = NormaCalidad
        fields = '__all__'

class DefectoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Defecto
        fields = '__all__'

class InspeccionSerializer(serializers.ModelSerializer):
    defectos = DefectoSerializer(many=True, read_only=True)
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    inspector_username = serializers.CharField(source='inspector.username', read_only=True)
    class Meta:
        model = Inspeccion
        fields = '__all__'

class DocumentoISOSerializer(serializers.ModelSerializer):
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    autor_nombre = serializers.CharField(source='autor.username', read_only=True)
    class Meta:
        model = DocumentoISO
        fields = '__all__'

class AccionCorrectivaSerializer(serializers.ModelSerializer):
    responsable_nombre = serializers.CharField(source='responsable.username', read_only=True)
    class Meta:
        model = AccionCorrectiva
        fields = '__all__'

class NoConformidadSerializer(serializers.ModelSerializer):
    origen_display = serializers.CharField(source='get_origen_display', read_only=True)
    reportado_por_nombre = serializers.CharField(source='reportado_por.username', read_only=True)
    capa = AccionCorrectivaSerializer(read_only=True)
    class Meta:
        model = NoConformidad
        fields = '__all__'

class AuditoriaSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    class Meta:
        model = Auditoria
        fields = '__all__'

class EvaluacionProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluacionProveedor
        fields = '__all__'