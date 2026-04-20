from rest_framework import serializers
from .models import Categoria, Producto, MovimientoInventario

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.ReadOnlyField(source='categoria.nombre')

    class Meta:
        model = Producto
        fields = '__all__'

class MovimientoInventarioSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')

    class Meta:
        model = MovimientoInventario
        fields = '__all__'
