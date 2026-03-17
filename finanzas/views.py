from rest_framework import viewsets
from .models import Cuenta, Transaccion
from .serializers import CuentaSerializer, TransaccionSerializer

class CuentaViewSet(viewsets.ModelViewSet):
    queryset = Cuenta.objects.all().order_by('codigo')
    serializer_class = CuentaSerializer

class TransaccionViewSet(viewsets.ModelViewSet):
    queryset = Transaccion.objects.all().order_by('-fecha')
    serializer_class = TransaccionSerializer
