from rest_framework import viewsets
from .models import Cuenta, Transaccion, ActivoFijo
from .serializers import CuentaSerializer, TransaccionSerializer, ActivoFijoSerializer

class CuentaViewSet(viewsets.ModelViewSet):
    queryset = Cuenta.objects.all().order_by('codigo')
    serializer_class = CuentaSerializer

class TransaccionViewSet(viewsets.ModelViewSet):
    queryset = Transaccion.objects.all().order_by('-fecha')
    serializer_class = TransaccionSerializer

class ActivoFijoViewSet(viewsets.ModelViewSet):
    queryset = ActivoFijo.objects.all().order_by('codigo')
    serializer_class = ActivoFijoSerializer
