from rest_framework import viewsets, permissions
from .models import Proveedor, OrdenCompra, DetalleOrdenCompra, Contrato, RecepcionCompra, PagoCompra
from .serializers import ProveedorSerializer, OrdenCompraSerializer, DetalleOrdenCompraSerializer, ContratoSerializer, RecepcionCompraSerializer, PagoCompraSerializer

class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all().order_by('razon_social')
    serializer_class = ProveedorSerializer
    permission_classes = []  # Sin permisos para desarrollo

class OrdenCompraViewSet(viewsets.ModelViewSet):
    queryset = OrdenCompra.objects.all().order_by('-fecha_emision')
    serializer_class = OrdenCompraSerializer
    permission_classes = []  # Sin permisos para desarrollo

class DetalleOrdenCompraViewSet(viewsets.ModelViewSet):
    queryset = DetalleOrdenCompra.objects.all()
    serializer_class = DetalleOrdenCompraSerializer
    permission_classes = []  # Sin permisos para desarrollo

class RecepcionCompraViewSet(viewsets.ModelViewSet):
    queryset = RecepcionCompra.objects.all().order_by('-fecha')
    serializer_class = RecepcionCompraSerializer
    permission_classes = []  # Sin permisos para desarrollo

class PagoCompraViewSet(viewsets.ModelViewSet):
    queryset = PagoCompra.objects.all().order_by('-fecha')
    serializer_class = PagoCompraSerializer
    permission_classes = []  # Sin permisos para desarrollo

class ContratoViewSet(viewsets.ModelViewSet):
    queryset = Contrato.objects.all().order_by('codigo')
    serializer_class = ContratoSerializer
    permission_classes = []  # Sin permisos para desarrollo
