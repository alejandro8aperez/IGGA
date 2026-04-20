from rest_framework import viewsets
from .models import NormaCalidad, Inspeccion, Defecto, DocumentoISO, NoConformidad, AccionCorrectiva, Auditoria, EvaluacionProveedor
from .serializers import (NormaCalidadSerializer, InspeccionSerializer, DefectoSerializer, 
                          DocumentoISOSerializer, NoConformidadSerializer, AccionCorrectivaSerializer, 
                          AuditoriaSerializer, EvaluacionProveedorSerializer)

class NormaCalidadViewSet(viewsets.ModelViewSet):
    queryset = NormaCalidad.objects.all()
    serializer_class = NormaCalidadSerializer

class InspeccionViewSet(viewsets.ModelViewSet):
    queryset = Inspeccion.objects.all()
    serializer_class = InspeccionSerializer

class DefectoViewSet(viewsets.ModelViewSet):
    queryset = Defecto.objects.all()
    serializer_class = DefectoSerializer

class DocumentoISOViewSet(viewsets.ModelViewSet):
    queryset = DocumentoISO.objects.all().order_by('categoria', 'codigo')
    serializer_class = DocumentoISOSerializer

class NoConformidadViewSet(viewsets.ModelViewSet):
    queryset = NoConformidad.objects.all().order_by('-fecha_reporte')
    serializer_class = NoConformidadSerializer

class AccionCorrectivaViewSet(viewsets.ModelViewSet):
    queryset = AccionCorrectiva.objects.all()
    serializer_class = AccionCorrectivaSerializer

class AuditoriaViewSet(viewsets.ModelViewSet):
    queryset = Auditoria.objects.all().order_by('-fecha_programada')
    serializer_class = AuditoriaSerializer

class EvaluacionProveedorViewSet(viewsets.ModelViewSet):
    queryset = EvaluacionProveedor.objects.all().order_by('-fecha_evaluacion')
    serializer_class = EvaluacionProveedorSerializer
