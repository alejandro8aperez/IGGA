from rest_framework import viewsets
from .models import ContratoInterventoria, VisitaInterventoria, Hallazgo
from .serializers import ContratoInterventoriaSerializer, VisitaInterventoriaSerializer, HallazgoSerializer

class ContratoInterventoriaViewSet(viewsets.ModelViewSet):
    queryset = ContratoInterventoria.objects.all().order_by('-fecha_inicio')
    serializer_class = ContratoInterventoriaSerializer

class VisitaInterventoriaViewSet(viewsets.ModelViewSet):
    queryset = VisitaInterventoria.objects.all().order_by('-fecha')
    serializer_class = VisitaInterventoriaSerializer

class HallazgoViewSet(viewsets.ModelViewSet):
    queryset = Hallazgo.objects.all()
    serializer_class = HallazgoSerializer