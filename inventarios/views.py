from rest_framework import viewsets
from .models import CategoriaProducto, Producto, MovimientoInventario
from .serializers import CategoriaProductoSerializer, ProductoSerializer, MovimientoInventarioSerializer

class CategoriaProductoViewSet(viewsets.ModelViewSet):
    queryset = CategoriaProducto.objects.all()
    serializer_class = CategoriaProductoSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

class MovimientoInventarioViewSet(viewsets.ModelViewSet):
    queryset = MovimientoInventario.objects.all().order_by('-fecha')
    serializer_class = MovimientoInventarioSerializer
