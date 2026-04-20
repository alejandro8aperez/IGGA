from rest_framework import viewsets
from .models import (
    EPS, AFP, ARL, CajaCompensacion, Departamento, Cargo, CentroCosto,
    Empleado, ContactoEmergencia, Familiar, FormacionAcademica, Idioma,
    Certificacion, ExperienciaLaboral, Vacaciones, Incapacidad, Dotacion,
    ExamenMedico, EPP, Disciplinario, EvaluacionDesempeno, HistorialCargo,
    DocumentoEmpleado
)
from .serializers import (
    EPSSerializer, AFPSerializer, ARLSerializer, CajaCompensacionSerializer,
    DepartamentoSerializer, CargoSerializer, CentroCostoSerializer,
    EmpleadoSerializer, ContactoEmergenciaSerializer, FamiliarSerializer,
    FormacionAcademicaSerializer, IdiomaSerializer, CertificacionSerializer,
    ExperienciaLaboralSerializer, VacacionesSerializer, IncapacidadSerializer,
    DotacionSerializer, ExamenMedicoSerializer, EPPSerializer,
    DisciplinarioSerializer, EvaluacionDesempenoSerializer,
    HistorialCargoSerializer, DocumentoEmpleadoSerializer
)

# ── Catálogos ──────────────────────────────────────────────
class EPSViewSet(viewsets.ModelViewSet):
    queryset = EPS.objects.all()
    serializer_class = EPSSerializer

class AFPViewSet(viewsets.ModelViewSet):
    queryset = AFP.objects.all()
    serializer_class = AFPSerializer

class ARLViewSet(viewsets.ModelViewSet):
    queryset = ARL.objects.all()
    serializer_class = ARLSerializer

class CajaCompensacionViewSet(viewsets.ModelViewSet):
    queryset = CajaCompensacion.objects.all()
    serializer_class = CajaCompensacionSerializer

class DepartamentoViewSet(viewsets.ModelViewSet):
    queryset = Departamento.objects.all()
    serializer_class = DepartamentoSerializer

class CargoViewSet(viewsets.ModelViewSet):
    queryset = Cargo.objects.all()
    serializer_class = CargoSerializer

class CentroCostoViewSet(viewsets.ModelViewSet):
    queryset = CentroCosto.objects.all()
    serializer_class = CentroCostoSerializer

# ── Modelos Anidados (SATÉLITES DE EMPLEADO) ───────────────
class ContactoEmergenciaViewSet(viewsets.ModelViewSet):
    queryset = ContactoEmergencia.objects.all()
    serializer_class = ContactoEmergenciaSerializer

class FamiliarViewSet(viewsets.ModelViewSet):
    queryset = Familiar.objects.all()
    serializer_class = FamiliarSerializer

class FormacionAcademicaViewSet(viewsets.ModelViewSet):
    queryset = FormacionAcademica.objects.all()
    serializer_class = FormacionAcademicaSerializer

class IdiomaViewSet(viewsets.ModelViewSet):
    queryset = Idioma.objects.all()
    serializer_class = IdiomaSerializer

class CertificacionViewSet(viewsets.ModelViewSet):
    queryset = Certificacion.objects.all()
    serializer_class = CertificacionSerializer

class ExperienciaLaboralViewSet(viewsets.ModelViewSet):
    queryset = ExperienciaLaboral.objects.all()
    serializer_class = ExperienciaLaboralSerializer

class VacacionesViewSet(viewsets.ModelViewSet):
    queryset = Vacaciones.objects.all()
    serializer_class = VacacionesSerializer

class IncapacidadViewSet(viewsets.ModelViewSet):
    queryset = Incapacidad.objects.all()
    serializer_class = IncapacidadSerializer

class DotacionViewSet(viewsets.ModelViewSet):
    queryset = Dotacion.objects.all()
    serializer_class = DotacionSerializer

class ExamenMedicoViewSet(viewsets.ModelViewSet):
    queryset = ExamenMedico.objects.all()
    serializer_class = ExamenMedicoSerializer

class EPPViewSet(viewsets.ModelViewSet):
    queryset = EPP.objects.all()
    serializer_class = EPPSerializer

class DisciplinarioViewSet(viewsets.ModelViewSet):
    queryset = Disciplinario.objects.all()
    serializer_class = DisciplinarioSerializer

class EvaluacionDesempenoViewSet(viewsets.ModelViewSet):
    queryset = EvaluacionDesempeno.objects.all()
    serializer_class = EvaluacionDesempenoSerializer

class HistorialCargoViewSet(viewsets.ModelViewSet):
    queryset = HistorialCargo.objects.all()
    serializer_class = HistorialCargoSerializer

class DocumentoEmpleadoViewSet(viewsets.ModelViewSet):
    queryset = DocumentoEmpleado.objects.all()
    serializer_class = DocumentoEmpleadoSerializer

# ── Empleado ───────────────────────────────────────────────
class EmpleadoViewSet(viewsets.ModelViewSet):
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer
