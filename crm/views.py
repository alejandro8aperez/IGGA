from rest_framework import viewsets
from .models import Cliente, Oportunidad
from .serializers import ClienteSerializer, OportunidadSerializer

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all().order_by('-fecha_registro')
    serializer_class = ClienteSerializer

class OportunidadViewSet(viewsets.ModelViewSet):
    queryset = Oportunidad.objects.all().order_by('-fecha_creacion')
    serializer_class = OportunidadSerializer
