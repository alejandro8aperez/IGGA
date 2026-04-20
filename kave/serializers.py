from rest_framework import serializers
from .models import ProyectoKAVE, TareaKAVE, DocumentoKAVE, NotaKAVE, TransformerDesign, CalculoTransformador

class TransformerDesignSerializer(serializers.ModelSerializer):
    """Serializer para TransformerDesign"""
    disenador_nombre = serializers.CharField(source='disenador.get_full_name', read_only=True)
    relacion_transformacion = serializers.ReadOnlyField()
    corriente_primaria = serializers.ReadOnlyField()
    corriente_secundaria = serializers.ReadOnlyField()
    calculos_count = serializers.SerializerMethodField()

    class Meta:
        model = TransformerDesign
        fields = [
            'id', 'potencia_kva', 'vp', 'vs', 'tipo', 'material', 'nucleo',
            'eficiencia', 'costo', 'frecuencia', 'densidad_corriente', 'induccion_maxima',
            'proyecto', 'disenador', 'disenador_nombre', 'created_at', 'updated_at',
            'relacion_transformacion', 'corriente_primaria', 'corriente_secundaria', 'calculos_count'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_calculos_count(self, obj):
        return obj.calculos.count()

class CalculoTransformadorSerializer(serializers.ModelSerializer):
    """Serializer para CalculoTransformador"""
    disenador_nombre = serializers.CharField(source='disenador.__str__', read_only=True)

    class Meta:
        model = CalculoTransformador
        fields = [
            'id', 'disenador', 'disenador_nombre', 'area_nucleo', 'vueltas_primario',
            'vueltas_secundario', 'area_conductor_primario', 'area_conductor_secundario',
            'perdidas_nucleo', 'perdidas_cobre', 'perdidas_totales', 'created_at'
        ]
        read_only_fields = ['created_at']

class ProyectoKAVESerializer(serializers.ModelSerializer):
    """Serializer para ProyectoKAVE"""
    empresa_nombre = serializers.CharField(source='empresa.nombre', read_only=True)
    responsable_nombre = serializers.CharField(source='responsponsible.get_full_name', read_only=True)
    dias_restantes = serializers.ReadOnlyField()
    tareas_count = serializers.SerializerMethodField()
    tareas_completadas = serializers.SerializerMethodField()
    progreso = serializers.SerializerMethodField()
    transformadores_count = serializers.SerializerMethodField()

    class Meta:
        model = ProyectoKAVE
        fields = [
            'id', 'nombre', 'descripcion', 'empresa', 'empresa_nombre', 'cliente',
            'fecha_inicio', 'fecha_entrega', 'estado', 'prioridad', 'presupuesto',
            'responsable', 'responsable_nombre', 'creado_en', 'actualizado_en',
            'dias_restantes', 'tareas_count', 'tareas_completadas', 'progreso', 'transformadores_count'
        ]
        read_only_fields = ['creado_en', 'actualizado_en']

    def get_tareas_count(self, obj):
        return obj.tareas.count()

    def get_tareas_completadas(self, obj):
        return obj.tareas.filter(estado='completada').count()

    def get_progreso(self, obj):
        total = obj.tareas.count()
        if total == 0:
            return 0
        completadas = obj.tareas.filter(estado='completada').count()
        return round((completadas / total) * 100, 2)

    def get_transformadores_count(self, obj):
        return TransformerDesign.objects.filter(proyecto=obj).count()

class TareaKAVESerializer(serializers.ModelSerializer):
    """Serializer para TareaKAVE"""
    proyecto_nombre = serializers.CharField(source='proyecto.nombre', read_only=True)
    asignado_a_nombre = serializers.CharField(source='asignado_a.get_full_name', read_only=True)

    class Meta:
        model = TareaKAVE
        fields = [
            'id', 'proyecto', 'proyecto_nombre', 'titulo', 'descripcion', 'estado',
            'asignado_a', 'asignado_a_nombre', 'fecha_vencimiento',
            'horas_estimadas', 'horas_reales', 'creado_en', 'actualizado_en'
        ]
        read_only_fields = ['creado_en', 'actualizado_en']

class DocumentoKAVESerializer(serializers.ModelSerializer):
    """Serializer para DocumentoKAVE"""
    proyecto_nombre = serializers.CharField(source='proyecto.nombre', read_only=True)
    subido_por_nombre = serializers.CharField(source='subido_por.get_full_name', read_only=True)
    archivo_nombre = serializers.SerializerMethodField()

    class Meta:
        model = DocumentoKAVE
        fields = [
            'id', 'proyecto', 'proyecto_nombre', 'titulo', 'tipo', 'archivo',
            'archivo_nombre', 'descripcion', 'subido_por', 'subido_por_nombre',
            'fecha_subida'
        ]
        read_only_fields = ['subido_por', 'fecha_subida']

    def get_archivo_nombre(self, obj):
        if obj.archivo:
            return obj.archivo.name.split('/')[-1]
        return None

class NotaKAVESerializer(serializers.ModelSerializer):
    """Serializer para NotaKAVE"""
    proyecto_nombre = serializers.CharField(source='proyecto.nombre', read_only=True)
    autor_nombre = serializers.CharField(source='autor.get_full_name', read_only=True)

    class Meta:
        model = NotaKAVE
        fields = [
            'id', 'proyecto', 'proyecto_nombre', 'titulo', 'contenido',
            'autor', 'autor_nombre', 'creado_en'
        ]
        read_only_fields = ['autor', 'creado_en']
