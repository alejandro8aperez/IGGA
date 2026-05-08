from rest_framework import serializers
from .models import (
    Categoria, Almacen, Producto, Lote,
    MovimientoInventario, AlertaInventario,
    ConteoFisico, DetalleConteoFisico, UnidadMedida
)


class UnidadMedidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnidadMedida
        fields = '__all__'



class CategoriaSerializer(serializers.ModelSerializer):
    total_productos = serializers.SerializerMethodField()

    class Meta:
        model = Categoria
        fields = '__all__'

    def get_total_productos(self, obj):
        return obj.productos.count()


class AlmacenSerializer(serializers.ModelSerializer):
    total_productos = serializers.SerializerMethodField()

    class Meta:
        model = Almacen
        fields = '__all__'

    def get_total_productos(self, obj):
        return obj.productos.count()


class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.ReadOnlyField(source='categoria.nombre')
    almacen_nombre = serializers.ReadOnlyField(source='almacen.nombre')
    tipo_producto_display = serializers.ReadOnlyField(source='get_tipo_producto_display')
    unidad_medida_display = serializers.ReadOnlyField(source='get_unidad_medida_display')
    imagen_url = serializers.SerializerMethodField()
    stock_bajo = serializers.ReadOnlyField()
    necesita_reorden = serializers.ReadOnlyField()
    valor_inventario = serializers.ReadOnlyField()
    margen_utilidad = serializers.ReadOnlyField()

    class Meta:
        model = Producto
        fields = (
            'id', 'nombre', 'codigo_sku', 'descripcion', 'marca', 'referencia_fabrica',
            # Clasificación
            'categoria', 'categoria_nombre', 'tipo_producto', 'tipo_producto_display',
            'unidad_medida', 'unidad_medida_display',
            # Precios
            'precio_venta', 'precio_compra', 'margen_utilidad',
            # Stock
            'stock_actual', 'stock_minimo', 'stock_maximo', 'punto_reorden',
            'stock_bajo', 'necesita_reorden', 'valor_inventario',
            # Ubicación
            'almacen', 'almacen_nombre', 'ubicacion_almacen',
            # Físico
            'peso_unitario_kg',
            # Perecedero / Trazabilidad
            'es_perecedero', 'dias_vida_util', 'requiere_lote',
            # Estado
            'activo', 'notas',
            # Imagen
            'imagen', 'imagen_url',
            # Auditoría
            'fecha_creacion', 'fecha_actualizacion',
        )

    def get_imagen_url(self, obj):
        """Construye la URL completa de la imagen"""
        if not obj.imagen:
            return None

        request = self.context.get('request')
        image_url = obj.imagen.url

        if request:
            return request.build_absolute_uri(image_url)

        # Fallback: la URL ya debe incluir /media/ desde Django
        return image_url if image_url.startswith('/') else f"/{image_url}"


class ProductoListSerializer(serializers.ModelSerializer):
    """Serializer ligero para listados y selects"""
    categoria_nombre = serializers.ReadOnlyField(source='categoria.nombre')
    unidad_medida_display = serializers.ReadOnlyField(source='get_unidad_medida_display')
    stock_bajo = serializers.ReadOnlyField()
    imagen_url = serializers.SerializerMethodField()

    class Meta:
        model = Producto
        fields = (
            'id', 'nombre', 'codigo_sku', 'categoria_nombre',
            'tipo_producto', 'unidad_medida', 'unidad_medida_display',
            'precio_venta', 'stock_actual', 'stock_bajo', 'activo',
            'imagen', 'imagen_url',
        )

    def get_imagen_url(self, obj):
        if not obj.imagen:
            return None
        request = self.context.get('request')
        image_url = obj.imagen.url
        if request:
            return request.build_absolute_uri(image_url)
        return image_url if image_url.startswith('/') else f"/{image_url}"


class LoteSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    esta_vencido = serializers.ReadOnlyField()
    dias_para_vencer = serializers.ReadOnlyField()

    class Meta:
        model = Lote
        fields = '__all__'


class MovimientoInventarioSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    tipo_display = serializers.ReadOnlyField(source='get_tipo_display')
    origen_display = serializers.ReadOnlyField(source='get_origen_display')
    almacen_nombre = serializers.ReadOnlyField(source='almacen.nombre')
    lote_numero = serializers.ReadOnlyField(source='lote.numero_lote')

    class Meta:
        model = MovimientoInventario
        fields = '__all__'


class AlertaInventarioSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    tipo_display = serializers.ReadOnlyField(source='get_tipo_display')
    estado_display = serializers.ReadOnlyField(source='get_estado_display')

    class Meta:
        model = AlertaInventario
        fields = '__all__'


class DetalleConteoFisicoSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')

    class Meta:
        model = DetalleConteoFisico
        fields = '__all__'


class ConteoFisicoSerializer(serializers.ModelSerializer):
    detalles = DetalleConteoFisicoSerializer(many=True, read_only=True)
    estado_display = serializers.ReadOnlyField(source='get_estado_display')
    tipo_display = serializers.ReadOnlyField(source='get_tipo_display')
    almacen_nombre = serializers.ReadOnlyField(source='almacen.nombre')

    class Meta:
        model = ConteoFisico
        fields = '__all__'
