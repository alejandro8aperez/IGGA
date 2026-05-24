from rest_framework import serializers
from .models import (
    Obra, CategoriaRecurso, Recurso, CategoriaActividad,
    InformeDiario, DetalleRecurso, ReporteLluvia, Actividad, AnexoFoto, ItemObra,
    MaquinariaLibre, PersonalLibre
)


class ObraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Obra
        fields = '__all__'


class CategoriaRecursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriaRecurso
        fields = '__all__'


class RecursoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)

    class Meta:
        model = Recurso
        fields = ['id', 'categoria', 'categoria_nombre', 'nombre', 'unidad', 'activo', 'orden']


class CategoriaActividadSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriaActividad
        fields = '__all__'


class DetalleRecursoSerializer(serializers.ModelSerializer):
    recurso_nombre = serializers.CharField(source='recurso.nombre', read_only=True)
    categoria_nombre = serializers.CharField(source='recurso.categoria.nombre', read_only=True)

    class Meta:
        model = DetalleRecurso
        fields = ['id', 'recurso', 'recurso_nombre', 'categoria_nombre',
                  'cantidad', 'empresa', 'observacion']


class ReporteLluviaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReporteLluvia
        fields = ['id', 'hora', 'con_lluvia']


class ActividadSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)

    class Meta:
        model = Actividad
        fields = ['id', 'categoria', 'categoria_nombre', 'descripcion', 'orden']


class ItemObraSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemObra
        fields = ['id', 'item', 'descripcion', 'empresa', 'cantidad', 'orden']


class MaquinariaLibreSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaquinariaLibre
        fields = ['id', 'descripcion', 'cantidad', 'empresa', 'orden']

class PersonalLibreSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalLibre
        fields = ['id', 'descripcion', 'cantidad', 'empresa', 'orden']

class AnexoFotoSerializer(serializers.ModelSerializer):
    imagen_url = serializers.SerializerMethodField()

    class Meta:
        model = AnexoFoto
        fields = ['id', 'informe', 'descripcion', 'imagen', 'imagen_url', 'seccion', 'orden', 'posicion', 'creado_en']
        read_only_fields = ['creado_en']

    def get_imagen_url(self, obj):
        if not obj.imagen:
            return None
        try:
            return obj.imagen.url
        except Exception:
            return None


class InformeDiarioListSerializer(serializers.ModelSerializer):
    obra_codigo = serializers.CharField(source='obra.codigo', read_only=True)
    obra_nombre = serializers.CharField(source='obra.nombre', read_only=True)
    total_personal = serializers.ReadOnlyField()
    total_maquinaria = serializers.ReadOnlyField()
    total_horas_lluvia = serializers.ReadOnlyField()
    foto_principal = serializers.SerializerMethodField()
    status_label = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = InformeDiario
        fields = ['id', 'obra', 'obra_codigo', 'obra_nombre', 'fecha',
                  'dia_semana', 'elaborado_por', 'total_personal',
                  'total_maquinaria', 'total_horas_lluvia', 'creado_en',
                  'status', 'status_label', 'foto_principal']

    def get_foto_principal(self, obj):
        # Retorna la primera foto del anexo para mostrarla como thumbnail en la card
        foto = obj.anexos.first()
        if foto and foto.imagen:
            try:
                return foto.imagen.url
            except Exception:
                return None
        return None


class InformeDiarioSerializer(serializers.ModelSerializer):
    """Full nested serializer (read + write) for the daily report."""
    obra_codigo = serializers.CharField(source='obra.codigo', read_only=True)
    obra_nombre = serializers.CharField(source='obra.nombre', read_only=True)
    detalles = DetalleRecursoSerializer(many=True, required=False)
    reportes_lluvia = ReporteLluviaSerializer(many=True, required=False)
    actividades = ActividadSerializer(many=True, required=False)
    items_obra = ItemObraSerializer(many=True, required=False)
    maquinaria_libre = MaquinariaLibreSerializer(many=True, required=False)
    personal_libre = PersonalLibreSerializer(many=True, required=False)
    anexos = AnexoFotoSerializer(many=True, read_only=True)

    class Meta:
        model = InformeDiario
        fields = [
            'id', 'obra', 'obra_codigo', 'obra_nombre', 'fecha', 'dia_semana',
            'numero_paginas', 'codigo_formato',
            'observaciones_generales', 'estado_terreno_inicio',
            'estado_terreno_final',
            'elaborado_por', 'cargo_elaborado',
            'revisado_por', 'cargo_revisado',
            'comision_topografia', 'status',
            'detalles', 'reportes_lluvia', 'actividades', 'items_obra', 'anexos',
            'maquinaria_libre', 'personal_libre',
            'creado_en', 'actualizado_en',
        ]
        read_only_fields = ['creado_en', 'actualizado_en', 'dia_semana']

    def create(self, validated_data):
        detalles = validated_data.pop('detalles', [])
        lluvias = validated_data.pop('reportes_lluvia', [])
        actividades = validated_data.pop('actividades', [])
        items_obra = validated_data.pop('items_obra', [])
        m_libre = validated_data.pop('maquinaria_libre', [])
        p_libre = validated_data.pop('personal_libre', [])

        informe = InformeDiario.objects.create(**validated_data)
        for d in detalles:
            DetalleRecurso.objects.create(informe=informe, **d)
        for l in lluvias:
            ReporteLluvia.objects.create(informe=informe, **l)
        for a in actividades:
            Actividad.objects.create(informe=informe, **a)
        for i, it in enumerate(items_obra):
            ItemObra.objects.create(informe=informe, orden=i, **it)
        for i, it in enumerate(m_libre):
            MaquinariaLibre.objects.create(informe=informe, orden=i, **it)
        for i, it in enumerate(p_libre):
            PersonalLibre.objects.create(informe=informe, orden=i, **it)
        return informe

    def update(self, instance, validated_data):
        detalles = validated_data.pop('detalles', None)
        lluvias = validated_data.pop('reportes_lluvia', None)
        actividades = validated_data.pop('actividades', None)
        items_obra = validated_data.pop('items_obra', None)
        m_libre = validated_data.pop('maquinaria_libre', None)
        p_libre = validated_data.pop('personal_libre', None)

        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if detalles is not None:
            instance.detalles.all().delete()
            for d in detalles:
                DetalleRecurso.objects.create(informe=instance, **d)
        if lluvias is not None:
            instance.reportes_lluvia.all().delete()
            for lluv in lluvias:
                ReporteLluvia.objects.create(informe=instance, **lluv)
        if actividades is not None:
            instance.actividades.all().delete()
            for a in actividades:
                Actividad.objects.create(informe=instance, **a)
        if items_obra is not None:
            instance.items_obra.all().delete()
            for i, it in enumerate(items_obra):
                ItemObra.objects.create(informe=instance, orden=i, **it)
        if m_libre is not None:
            instance.maquinaria_libre.all().delete()
            for i, it in enumerate(m_libre):
                MaquinariaLibre.objects.create(informe=instance, orden=i, **it)
        if p_libre is not None:
            instance.personal_libre.all().delete()
            for i, it in enumerate(p_libre):
                PersonalLibre.objects.create(informe=instance, orden=i, **it)
        return instance
