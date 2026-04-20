from rest_framework import viewsets
from .models import Proyecto, Tarea, ProyectoPS, WBSItem, HitoPS, CostoPS
from .serializers import ProyectoSerializer, TareaSerializer, ProyectoPSSerializer, WBSItemSerializer, HitoPSSerializer, CostoPSSerializer

class ProyectoViewSet(viewsets.ModelViewSet):
    queryset = Proyecto.objects.all()
    serializer_class = ProyectoSerializer

class TareaViewSet(viewsets.ModelViewSet):
    queryset = Tarea.objects.all()
    serializer_class = TareaSerializer

class ProyectoPSViewSet(viewsets.ModelViewSet):
    queryset = ProyectoPS.objects.all()
    serializer_class = ProyectoPSSerializer

class WBSItemViewSet(viewsets.ModelViewSet):
    queryset = WBSItem.objects.all()
    serializer_class = WBSItemSerializer

class HitoPSViewSet(viewsets.ModelViewSet):
    queryset = HitoPS.objects.all()
    serializer_class = HitoPSSerializer

class CostoPSViewSet(viewsets.ModelViewSet):
    queryset = CostoPS.objects.all()
    serializer_class = CostoPSSerializer
