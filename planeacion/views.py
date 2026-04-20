from rest_framework import viewsets
from .models import PlanEstratégico, Objetivo
from .serializers import PlanEstratégicoSerializer, ObjetivoSerializer

class PlanEstratégicoViewSet(viewsets.ModelViewSet):
    queryset = PlanEstratégico.objects.all().order_by('codigo')
    serializer_class = PlanEstratégicoSerializer

class ObjetivoViewSet(viewsets.ModelViewSet):
    queryset = Objetivo.objects.all().order_by('id')
    serializer_class = ObjetivoSerializer
