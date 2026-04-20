from rest_framework import serializers
from .models import FormatoISO9001, ProcesoISO, TrazabilidadISO

class FormatoISO9001Serializer(serializers.ModelSerializer):
    """Serializer para FormatoISO9001"""
    creado_por_nombre = serializers.CharField(source='creado_por.get_full_name', read_only=True)
    aprobado_por_nombre = serializers.CharField(source='aprobado_por.get_full_name', read_only=True)
    modulo_relacionado_display = serializers.CharField(source='get_modulo_relacionado_display', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    dias_para_revision = serializers.ReadOnlyField()
    requiere_actualizacion = serializers.ReadOnlyField()
    
    # Métodos para URLs de archivos
    archivo_pdf_url = serializers.SerializerMethodField()
    archivo_word_url = serializers.SerializerMethodField()
    archivo_plantilla_url = serializers.SerializerMethodField()

    class Meta:
        model = FormatoISO9001
        fields = [
            'id', 'codigo', 'titulo', 'tipo', 'tipo_display', 'version', 'estado', 'estado_display',
            'fecha_creacion', 'fecha_aprobacion', 'fecha_revision', 'modulo_relacionado', 
            'modulo_relacionado_display', 'proceso_afectado', 'descripcion', 'motivo_cambio',
            'creado_por', 'creado_por_nombre', 'aprobado_por', 'aprobado_por_nombre',
            'frecuencia_actualizacion', 'obligatorio', 'requiere_aprobacion',
            'ultima_auditoria', 'conformidades', 'no_conformidades',
            'dias_para_revision', 'requiere_actualizacion',
            'archivo_pdf', 'archivo_word', 'archivo_plantilla',
            'archivo_pdf_url', 'archivo_word_url', 'archivo_plantilla_url',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'creado_por']

    def get_archivo_pdf_url(self, obj):
        if obj.archivo_pdf:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.archivo_pdf.url)
            return obj.archivo_pdf.url
        return None

    def get_archivo_word_url(self, obj):
        if obj.archivo_word:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.archivo_word.url)
            return obj.archivo_word.url
        return None

    def get_archivo_plantilla_url(self, obj):
        if obj.archivo_plantilla:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.archivo_plantilla.url)
            return obj.archivo_plantilla.url
        return None

class FormatoISO9001CreateSerializer(serializers.ModelSerializer):
    """Serializer para creación de FormatoISO9001"""
    
    class Meta:
        model = FormatoISO9001
        fields = [
            'codigo', 'titulo', 'tipo', 'modulo_relacionado', 'proceso_afectado',
            'descripcion', 'frecuencia_actualizacion', 'obligatorio', 'requiere_aprobacion',
            'archivo_pdf', 'archivo_word', 'archivo_plantilla'
        ]

    def validate_codigo(self, value):
        """Validar que el código no exista"""
        if FormatoISO9001.objects.filter(codigo=value).exists():
            raise serializers.ValidationError("El código de formato ya existe.")
        return value

class ProcesoISOSerializer(serializers.ModelSerializer):
    """Serializer para ProcesoISO"""
    responsable_proceso_nombre = serializers.CharField(source='responsable_proceso.get_full_name', read_only=True)
    modulo_erp_display = serializers.CharField(source='get_modulo_erp_display', read_only=True)
    formatos_iso_data = FormatoISO9001Serializer(source='formatos_iso', many=True, read_only=True)
    formatos_count = serializers.SerializerMethodField()

    class Meta:
        model = ProcesoISO
        fields = [
            'id', 'nombre_proceso', 'modulo_erp', 'modulo_erp_display', 'descripcion',
            'formatos_iso', 'formatos_iso_data', 'formatos_count',
            'indicadores', 'frecuencia_auditoria', 'estado',
            'responsable_proceso', 'responsable_proceso_nombre',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_formatos_count(self, obj):
        return obj.formatos_iso.count()

class TrazabilidadISOSerializer(serializers.ModelSerializer):
    """Serializer para TrazabilidadISO"""
    formato_codigo = serializers.CharField(source='formato.codigo', read_only=True)
    formato_titulo = serializers.CharField(source='formato.titulo', read_only=True)
    usuario_nombre = serializers.CharField(source='usuario.get_full_name', read_only=True)
    accion_display = serializers.CharField(source='get_accion_display', read_only=True)

    class Meta:
        model = TrazabilidadISO
        fields = [
            'id', 'formato', 'formato_codigo', 'formato_titulo',
            'modulo_erp', 'registro_id', 'accion', 'accion_display',
            'fecha_uso', 'usuario', 'usuario_nombre',
            'detalles', 'ip_address'
        ]
        read_only_fields = ['fecha_uso', 'usuario']

class FormatoISO9001ListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listas"""
    modulo_display = serializers.CharField(source='get_modulo_relacionado_display', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    dias_para_revision = serializers.ReadOnlyField()
    requiere_actualizacion = serializers.ReadOnlyField()

    class Meta:
        model = FormatoISO9001
        fields = [
            'id', 'codigo', 'titulo', 'tipo_display', 'version', 'estado_display',
            'modulo_display', 'proceso_afectado', 'fecha_aprobacion', 'fecha_revision',
            'dias_para_revision', 'requiere_actualizacion', 'conformidades', 'no_conformidades'
        ]

class FormatoISO9001DashboardSerializer(serializers.ModelSerializer):
    """Serializer para dashboard de formatos ISO 9001"""
    class Meta:
        model = FormatoISO9001
        fields = [
            'id', 'codigo', 'titulo', 'modulo_relacionado', 'estado', 'version',
            'fecha_aprobacion', 'fecha_revision', 'conformidades', 'no_conformidades'
        ]
