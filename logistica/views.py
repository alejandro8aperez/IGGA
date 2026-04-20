from rest_framework import viewsets
from .models import Vehiculo, Ruta, Envio, DetalleEnvio
from .serializers import VehiculoSerializer, RutaSerializer, EnvioSerializer, DetalleEnvioSerializer

class VehiculoViewSet(viewsets.ModelViewSet):
    queryset = Vehiculo.objects.all()
    serializer_class = VehiculoSerializer

class RutaViewSet(viewsets.ModelViewSet):
    queryset = Ruta.objects.all()
    serializer_class = RutaSerializer

class EnvioViewSet(viewsets.ModelViewSet):
    queryset = Envio.objects.all()
    serializer_class = EnvioSerializer

class DetalleEnvioViewSet(viewsets.ModelViewSet):
    queryset = DetalleEnvio.objects.all()
    serializer_class = DetalleEnvioSerializer
