from rest_framework import viewsets
from .models import ContratoInterventoria, VisitaInterventoria, Hallazgo
from .serializers import ContratoInterventoriaSerializer, VisitaInterventoriaSerializer, HallazgoSerializer
from erp_core.permissions import IsAuthenticated # Usando el permiso base por ahora

class ContratoInterventoriaViewSet(viewsets.ModelViewSet):
    queryset = ContratoInterventoria.objects.all().order_by('-fecha_inicio')
    serializer_class = ContratoInterventoriaSerializer
    permission_classes = [IsAuthenticated]

class VisitaInterventoriaViewSet(viewsets.ModelViewSet):
    queryset = VisitaInterventoria.objects.all().order_by('-fecha')
    serializer_class = VisitaInterventoriaSerializer

class HallazgoViewSet(viewsets.ModelViewSet):
    queryset = Hallazgo.objects.all()
    serializer_class = HallazgoSerializer