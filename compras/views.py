from rest_framework import viewsets, permissions
from .models import Proveedor, OrdenCompra, DetalleOrdenCompra, Contrato, RecepcionCompra, PagoCompra, ProductoProveedor
from .serializers import ProveedorSerializer, OrdenCompraSerializer, DetalleOrdenCompraSerializer, ContratoSerializer, RecepcionCompraSerializer, PagoCompraSerializer, ProductoProveedorSerializer

class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all().order_by('razon_social')
    serializer_class = ProveedorSerializer
    permission_classes = [permissions.AllowAny]

class OrdenCompraViewSet(viewsets.ModelViewSet):
    queryset = OrdenCompra.objects.all().order_by('-fecha_emision')
    serializer_class = OrdenCompraSerializer
    permission_classes = [permissions.AllowAny]

class DetalleOrdenCompraViewSet(viewsets.ModelViewSet):
    queryset = DetalleOrdenCompra.objects.all()
    serializer_class = DetalleOrdenCompraSerializer
    permission_classes = [permissions.AllowAny]

class RecepcionCompraViewSet(viewsets.ModelViewSet):
    queryset = RecepcionCompra.objects.all().order_by('-fecha')
    serializer_class = RecepcionCompraSerializer
    permission_classes = [permissions.AllowAny]

class PagoCompraViewSet(viewsets.ModelViewSet):
    queryset = PagoCompra.objects.all().order_by('-fecha')
    serializer_class = PagoCompraSerializer
    permission_classes = [permissions.AllowAny]

class ContratoViewSet(viewsets.ModelViewSet):
    queryset = Contrato.objects.all().order_by('codigo')
    serializer_class = ContratoSerializer
    permission_classes = [permissions.AllowAny]

class ProductoProveedorViewSet(viewsets.ModelViewSet):
    queryset = ProductoProveedor.objects.all().select_related('producto', 'proveedor')
    serializer_class = ProductoProveedorSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        proveedor_id = self.request.query_params.get('proveedor')
        producto_id = self.request.query_params.get('producto')
        if proveedor_id:
            queryset = queryset.filter(proveedor_id=proveedor_id)
        if producto_id:
            queryset = queryset.filter(producto_id=producto_id)
        return queryset
