from io import BytesIO
from datetime import date
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom
from .models import (
    EPS, AFP, ARL, CajaCompensacion, Departamento, Cargo, CentroCosto,
    Empleado, ContactoEmergencia, Familiar, FormacionAcademica, Idioma,
    Certificacion, ExperienciaLaboral, Vacaciones, Incapacidad, Dotacion,
    ExamenMedico, EPP, Disciplinario, EvaluacionDesempeno, HistorialCargo,
    DocumentoEmpleado, ConceptoNomina, PeriodoNomina, Nomina, DetalleNomina
)
from .serializers import (
    EPSSerializer, AFPSerializer, ARLSerializer, CajaCompensacionSerializer,
    DepartamentoSerializer, CargoSerializer, CentroCostoSerializer,
    EmpleadoSerializer, ContactoEmergenciaSerializer, FamiliarSerializer,
    FormacionAcademicaSerializer, IdiomaSerializer, CertificacionSerializer,
    ExperienciaLaboralSerializer, VacacionesSerializer, IncapacidadSerializer,
    DotacionSerializer, ExamenMedicoSerializer, EPPSerializer,
    DisciplinarioSerializer, EvaluacionDesempenoSerializer,
    HistorialCargoSerializer, DocumentoEmpleadoSerializer,
    ConceptoNominaSerializer, PeriodoNominaSerializer, NominaSerializer, DetalleNominaSerializer
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


# ── Nómina Electrónica ─────────────────────────────────────
class ConceptoNominaViewSet(viewsets.ModelViewSet):
    queryset = ConceptoNomina.objects.all()
    serializer_class = ConceptoNominaSerializer


class PeriodoNominaViewSet(viewsets.ModelViewSet):
    queryset = PeriodoNomina.objects.all()
    serializer_class = PeriodoNominaSerializer


class NominaViewSet(viewsets.ModelViewSet):
    queryset = Nomina.objects.all()
    serializer_class = NominaSerializer

    @action(detail=False, methods=['get'], url_path='exportar-electronica')
    def exportar_electronica(self, request):
        """Exportar nómina electrónica en formato XML para DIAN (Colombia)"""
        periodo_id = request.query_params.get('periodo_id')
        if not periodo_id:
            return Response({'error': 'Se requiere periodo_id'}, status=400)

        try:
            periodo = PeriodoNomina.objects.get(id=periodo_id)
        except PeriodoNomina.DoesNotExist:
            return Response({'error': 'Período no encontrado'}, status=404)

        nominas = Nomina.objects.filter(periodo=periodo, procesada=True)

        # Crear XML básico para nómina electrónica
        root = Element('NominaElectronica')
        root.set('xmlns', 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2')
        root.set('xmlns:cac', 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2')
        root.set('xmlns:cbc', 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2')

        # Cabecera
        id_elem = SubElement(root, 'cbc:ID')
        id_elem.text = f"NE-{periodo.id}"

        issue_date = SubElement(root, 'cbc:IssueDate')
        issue_date.text = str(date.today())

        # Empleados
        for nomina in nominas:
            employee = SubElement(root, 'cac:Employee')
            
            id_emp = SubElement(employee, 'cbc:ID')
            id_emp.text = nomina.empleado.numero_documento
            
            name = SubElement(employee, 'cbc:Name')
            name.text = nomina.empleado.nombre_completo
            
            salary = SubElement(employee, 'cbc:Salary')
            salary.text = str(nomina.salario_base)
            
            net_pay = SubElement(employee, 'cbc:NetPay')
            net_pay.text = str(nomina.neto_pagar)

        # Formatear XML
        rough_string = tostring(root, 'utf-8')
        reparsed = minidom.parseString(rough_string)
        xml_str = reparsed.toprettyxml(indent="  ", encoding='utf-8')

        response = HttpResponse(xml_str, content_type='application/xml')
        response['Content-Disposition'] = f'attachment; filename=nomina_electronica_{periodo.nombre}.xml'
        return response


class DetalleNominaViewSet(viewsets.ModelViewSet):
    queryset = DetalleNomina.objects.all()
    serializer_class = DetalleNominaSerializer
