from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Proyecto, Tarea
from .serializers import ProyectoSerializer, TareaSerializer

class ProyectoViewSet(viewsets.ModelViewSet):
    queryset = Proyecto.objects.all()
    serializer_class = ProyectoSerializer
    permission_classes = [AllowAny]

class TareaViewSet(viewsets.ModelViewSet):
    queryset = Tarea.objects.all()
    serializer_class = TareaSerializer
    permission_classes = [AllowAny]
