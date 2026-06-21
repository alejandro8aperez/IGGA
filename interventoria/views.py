from rest_framework import viewsets
from .models import ContratoInterventoria, VisitaInterventoria, Hallazgo
from .serializers import ContratoInterventoriaSerializer, VisitaInterventoriaSerializer, HallazgoSerializer

class ContratoInterventoriaViewSet(viewsets.ModelViewSet):
    queryset = ContratoInterventoria.objects.all().order_by('-fecha_inicio')
    serializer_class = ContratoInterventoriaSerializer

class VisitaInterventoriaViewSet(viewsets.ModelViewSet):
    queryset = VisitaInterventoria.objects.all().order_by('-fecha')
    serializer_class = VisitaInterventoriaSerializer

    def perform_create(self, serializer):
        serializer.save(registrado_por=self.request.user)

class HallazgoViewSet(viewsets.ModelViewSet):
    queryset = Hallazgo.objects.all().order_by('-visita__fecha', 'nivel_riesgo')
    serializer_class = HallazgoSerializer