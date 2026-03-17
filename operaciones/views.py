from rest_framework import viewsets
from .models import Proyecto, Tarea
from .serializers import ProyectoSerializer, TareaSerializer

class ProyectoViewSet(viewsets.ModelViewSet):
    queryset = Proyecto.objects.all()
    serializer_class = ProyectoSerializer

class TareaViewSet(viewsets.ModelViewSet):
    queryset = Tarea.objects.all()
    serializer_class = TareaSerializer
