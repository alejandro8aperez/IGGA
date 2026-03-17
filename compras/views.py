from rest_framework import viewsets
from .models import Proveedor, OrdenCompra, DetalleOrdenCompra
from .serializers import ProveedorSerializer, OrdenCompraSerializer, DetalleOrdenCompraSerializer

class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all().order_by('razon_social')
    serializer_class = ProveedorSerializer

class OrdenCompraViewSet(viewsets.ModelViewSet):
    queryset = OrdenCompra.objects.all().order_by('-fecha_emision')
    serializer_class = OrdenCompraSerializer

class DetalleOrdenCompraViewSet(viewsets.ModelViewSet):
    queryset = DetalleOrdenCompra.objects.all()
    serializer_class = DetalleOrdenCompraSerializer
