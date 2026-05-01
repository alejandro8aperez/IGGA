from rest_framework import viewsets
from .models import Proyecto, Tarea, InformeDiarioProy
from .serializers import ProyectoSerializer, TareaSerializer, InformeDiarioProySerializer

class ProyectoViewSet(viewsets.ModelViewSet):
    queryset = Proyecto.objects.all()
    serializer_class = ProyectoSerializer

class TareaViewSet(viewsets.ModelViewSet):
    queryset = Tarea.objects.all()
    serializer_class = TareaSerializer

class InformeDiarioProyViewSet(viewsets.ModelViewSet):
    queryset = InformeDiarioProy.objects.all()
    serializer_class = InformeDiarioProySerializer