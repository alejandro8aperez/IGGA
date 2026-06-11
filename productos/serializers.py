from rest_framework import serializers
from inventarios.models import Producto, Categoria, Almacen
from inventarios.serializers import ProductoSerializer
from .models import (
    GrupoMaterial, FamiliaProducto, TipoEmpaque, FichaProducto,
    CodigoBarras, UnidadEmpaque, UnidadMedidaAlternativa,
)


class GrupoMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrupoMaterial
        fields = '__all__'


class FamiliaProductoSerializer(serializers.ModelSerializer):
    padre_nombre = serializers.ReadOnlyField(source='padre.nombre')

    class Meta:
        model = FamiliaProducto
        fields = '__all__'


class TipoEmpaqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoEmpaque
        fields = '__all__'


class CodigoBarrasSerializer(serializers.ModelSerializer):
    tipo_display = serializers.ReadOnlyField(source='get_tipo_display')

    class Meta:
        model = CodigoBarras
        fields = '__all__'


class UnidadEmpaqueSerializer(serializers.ModelSerializer):
    nivel_display = serializers.ReadOnlyField(source='get_nivel_display')

    class Meta:
        model = UnidadEmpaque
        fields = '__all__'


class UnidadMedidaAlternativaSerializer(serializers.ModelSerializer):
    unidad_nombre = serializers.ReadOnlyField(source='unidad.nombre')
    unidad_abreviatura = serializers.ReadOnlyField(source='unidad.abreviatura')

    class Meta:
        model = UnidadMedidaAlternativa
        fields = '__all__'


class FichaProductoSerializer(serializers.ModelSerializer):
    grupo_material_nombre = serializers.ReadOnlyField(source='grupo_material.nombre')
    familia_nombre = serializers.ReadOnlyField(source='familia.nombre')
    tipo_empaque_nombre = serializers.ReadOnlyField(source='tipo_empaque.nombre')
    estado_material_display = serializers.ReadOnlyField(source='get_estado_material_display')
    politica_inventario_display = serializers.ReadOnlyField(source='get_politica_inventario_display')
    clase_abc_display = serializers.ReadOnlyField(source='get_clase_abc_display')
    imagen_url = serializers.SerializerMethodField()  # NUEVO: URL completa de la imagen

    class Meta:
        model = FichaProducto
        fields = '__all__'
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']

    def get_imagen_url(self, obj):
        if not obj.imagen:
            return None
        request = self.context.get('request')
        url = obj.imagen.url
        return request.build_absolute_uri(url) if request else url


class ProductoMaestroListSerializer(serializers.ModelSerializer):
    """Listado ligero del maestro de productos."""
    categoria_nombre = serializers.ReadOnlyField(source='categoria.nombre')
    tipo_producto_display = serializers.ReadOnlyField(source='get_tipo_producto_display')
    stock_bajo = serializers.ReadOnlyField()
    codigo_barras_principal = serializers.SerializerMethodField()
    imagen_url = serializers.SerializerMethodField()      # NUEVO
    familia = serializers.SerializerMethodField()         # NUEVO
    familia_nombre = serializers.SerializerMethodField()  # NUEVO
    grupo_material = serializers.SerializerMethodField()
    tipo_empaque = serializers.SerializerMethodField()
    estado_material = serializers.SerializerMethodField()

    class Meta:
        model = Producto
        fields = (
            'id', 'codigo_sku', 'nombre', 'categoria', 'categoria_nombre',
            'tipo_producto', 'tipo_producto_display', 'unidad_medida',
            'precio_venta', 'precio_compra', 'stock_actual', 'stock_bajo',
            'marca', 'activo', 'codigo_barras_principal',
            'imagen_url', 'familia', 'familia_nombre',  # AGREGADOS
            'grupo_material', 'tipo_empaque', 'estado_material',
        )

    def _ficha(self, obj):
        try:
            return obj.ficha
        except FichaProducto.DoesNotExist:
            return None

    def get_codigo_barras_principal(self, obj):
        ficha = self._ficha(obj)
        if ficha and ficha.codigo_gtin:
            return ficha.codigo_gtin
        cb = obj.codigos_barras.filter(es_principal=True, activo=True).first()
        return cb.codigo if cb else None

    def get_imagen_url(self, obj):                          # NUEVO
        try:
            imagen = obj.ficha.imagen
        except FichaProducto.DoesNotExist:
            return None
        if not imagen:
            return None
        request = self.context.get('request')
        url = imagen.url
        return request.build_absolute_uri(url) if request else url

    def get_familia(self, obj):                             # NUEVO
        ficha = self._ficha(obj)
        return ficha.familia_id if ficha and ficha.familia else None

    def get_familia_nombre(self, obj):                      # NUEVO
        ficha = self._ficha(obj)
        return ficha.familia.nombre if ficha and ficha.familia else None

    def get_grupo_material(self, obj):
        ficha = self._ficha(obj)
        return ficha.grupo_material.nombre if ficha and ficha.grupo_material else None

    def get_tipo_empaque(self, obj):
        ficha = self._ficha(obj)
        return ficha.tipo_empaque.nombre if ficha and ficha.tipo_empaque else None

    def get_estado_material(self, obj):
        ficha = self._ficha(obj)
        return ficha.get_estado_material_display() if ficha else 'Activo'


class ProductoMaestroSerializer(serializers.ModelSerializer):
    """
    Maestro completo: Producto + Ficha SAP + codigos de barras + empaques.
    """
    categoria_nombre = serializers.ReadOnlyField(source='categoria.nombre')
    almacen_nombre = serializers.ReadOnlyField(source='almacen.nombre')
    tipo_producto_display = serializers.ReadOnlyField(source='get_tipo_producto_display')
    stock_bajo = serializers.ReadOnlyField()
    margen_utilidad = serializers.ReadOnlyField()
    imagen_url = serializers.SerializerMethodField()

    ficha = FichaProductoSerializer(required=False)
    codigos_barras = CodigoBarrasSerializer(many=True, required=False)
    unidades_empaque = UnidadEmpaqueSerializer(many=True, required=False)
    unidades_alternativas = UnidadMedidaAlternativaSerializer(many=True, required=False)

    class Meta:
        model = Producto
        fields = (
            'id', 'nombre', 'codigo_sku', 'descripcion', 'marca', 'referencia_fabrica',
            'categoria', 'categoria_nombre', 'tipo_producto', 'tipo_producto_display',
            'unidad_medida', 'precio_venta', 'precio_compra', 'margen_utilidad',
            'stock_actual', 'stock_minimo', 'stock_maximo', 'punto_reorden', 'stock_bajo',
            'almacen', 'almacen_nombre', 'ubicacion_almacen',
            'peso_unitario_kg', 'es_perecedero', 'dias_vida_util', 'requiere_lote',
            'activo', 'notas', 'imagen', 'imagen_url',
            'fecha_creacion', 'fecha_actualizacion',
            'ficha', 'codigos_barras', 'unidades_empaque', 'unidades_alternativas',
        )

    def get_imagen_url(self, obj):
        try:
            imagen = obj.ficha.imagen
        except FichaProducto.DoesNotExist:
            return None
        if not imagen:
            return None
        request = self.context.get('request')
        url = imagen.url
        return request.build_absolute_uri(url) if request else url

    def _sync_nested(self, producto, ficha_data, barras_data, empaques_data, ums_data):
        if ficha_data is not None:
            ficha_data = {k: v for k, v in ficha_data.items()
                          if k not in ('id', 'producto', 'fecha_creacion', 'fecha_actualizacion')}
            FichaProducto.objects.update_or_create(
                producto=producto, defaults=ficha_data
            )
        if barras_data is not None:
            producto.codigos_barras.all().delete()
            for b in barras_data:
                CodigoBarras.objects.create(producto=producto, **b)
        if empaques_data is not None:
            producto.unidades_empaque.all().delete()
            for e in empaques_data:
                UnidadEmpaque.objects.create(producto=producto, **e)
        if ums_data is not None:
            producto.unidades_alternativas.all().delete()
            for u in ums_data:
                UnidadMedidaAlternativa.objects.create(producto=producto, **u)

    def create(self, validated_data):
        ficha_data = validated_data.pop('ficha', None)
        barras_data = validated_data.pop('codigos_barras', None)
        empaques_data = validated_data.pop('unidades_empaque', None)
        ums_data = validated_data.pop('unidades_alternativas', None)

        producto = Producto.objects.create(**validated_data)
        self._sync_nested(producto, ficha_data or {}, barras_data, empaques_data, ums_data)
        return producto

    def update(self, instance, validated_data):
        ficha_data = validated_data.pop('ficha', None)
        barras_data = validated_data.pop('codigos_barras', None)
        empaques_data = validated_data.pop('unidades_empaque', None)
        ums_data = validated_data.pop('unidades_alternativas', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        self._sync_nested(instance, ficha_data, barras_data, empaques_data, ums_data)
        return instance
