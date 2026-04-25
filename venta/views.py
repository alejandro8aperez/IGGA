from rest_framework import viewsets, permissions
from .models import OrdenVenta, DetalleOrdenVenta, FacturaVenta
from .serializers import OrdenVentaSerializer, DetalleOrdenVentaSerializer, FacturaVentaSerializer

class OrdenVentaViewSet(viewsets.ModelViewSet):
    queryset = OrdenVenta.objects.all()
    serializer_class = OrdenVentaSerializer
    permission_classes = [permissions.AllowAny]

class DetalleOrdenVentaViewSet(viewsets.ModelViewSet):
    queryset = DetalleOrdenVenta.objects.all()
    serializer_class = DetalleOrdenVentaSerializer
    permission_classes = [permissions.AllowAny]

class FacturaVentaViewSet(viewsets.ModelViewSet):
    queryset = FacturaVenta.objects.all()
    serializer_class = FacturaVentaSerializer
    permission_classes = [permissions.AllowAny]
