from rest_framework import viewsets
from .models import Cuenta, AsientoContable, MovimientoContable
from .serializers import CuentaSerializer, AsientoContableSerializer, MovimientoContableSerializer

class CuentaViewSet(viewsets.ModelViewSet):
    queryset = Cuenta.objects.all()
    serializer_class = CuentaSerializer

class AsientoContableViewSet(viewsets.ModelViewSet):
    queryset = AsientoContable.objects.all()
    serializer_class = AsientoContableSerializer

class MovimientoContableViewSet(viewsets.ModelViewSet):
    queryset = MovimientoContable.objects.all()
    serializer_class = MovimientoContableSerializer
