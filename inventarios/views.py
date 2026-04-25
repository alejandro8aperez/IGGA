from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Categoria, Producto, MovimientoInventario
from .serializers import CategoriaSerializer, ProductoSerializer, MovimientoInventarioSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny]

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [AllowAny]

class MovimientoInventarioViewSet(viewsets.ModelViewSet):
    queryset = MovimientoInventario.objects.all().order_by('-fecha')
    serializer_class = MovimientoInventarioSerializer
    permission_classes = [AllowAny]
