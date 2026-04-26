from rest_framework import serializers
from .models import Categoria, Producto, MovimientoInventario

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.ReadOnlyField(source='categoria.nombre')
    imagen_url = serializers.SerializerMethodField()

    class Meta:
        model = Producto
        fields = ('id', 'nombre', 'codigo_sku', 'categoria', 'categoria_nombre', 
                  'precio_venta', 'precio_compra', 'stock_actual', 'stock_minimo', 
                  'imagen', 'imagen_url')
    
    def get_imagen_url(self, obj):
        """Construye la URL completa de la imagen"""
        if not obj.imagen:
            return None
            
        request = self.context.get('request')
        image_url = obj.imagen.url
        
        if request:
            return request.build_absolute_uri(image_url)
        
        # Fallback: construir URL manualmente
        return f"/media{image_url}" if not image_url.startswith('http') else image_url

class MovimientoInventarioSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')

    class Meta:
        model = MovimientoInventario
        fields = '__all__'
