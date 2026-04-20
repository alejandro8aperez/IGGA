from rest_framework import viewsets
from .models import Segmento, Campana, Lead
from .serializers import SegmentoSerializer, CampanaSerializer, LeadSerializer

class SegmentoViewSet(viewsets.ModelViewSet):
    queryset = Segmento.objects.all()
    serializer_class = SegmentoSerializer

class CampanaViewSet(viewsets.ModelViewSet):
    queryset = Campana.objects.all()
    serializer_class = CampanaSerializer

class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
