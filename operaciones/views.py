from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Proyecto, Tarea, InformeDiarioProy
from .serializers import ProyectoSerializer, TareaSerializer, InformeDiarioProySerializer

class ProyectoViewSet(viewsets.ModelViewSet):
    queryset = Proyecto.objects.all()
    serializer_class = ProyectoSerializer
    permission_classes = [AllowAny]

class TareaViewSet(viewsets.ModelViewSet):
    queryset = Tarea.objects.all()
    serializer_class = TareaSerializer
    permission_classes = [AllowAny]

class InformeDiarioProyViewSet(viewsets.ModelViewSet):
    queryset = InformeDiarioProy.objects.all()
    serializer_class = InformeDiarioProySerializer
    permission_classes = [AllowAny]
