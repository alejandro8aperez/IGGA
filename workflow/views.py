from rest_framework import viewsets
from .models import SolicitudAprobacion
from .serializers import SolicitudAprobacionSerializer

class SolicitudAprobacionViewSet(viewsets.ModelViewSet):
    queryset = SolicitudAprobacion.objects.all()
    serializer_class = SolicitudAprobacionSerializer
