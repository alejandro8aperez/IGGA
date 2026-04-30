from io import BytesIO
from datetime import date
from decimal import Decimal
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

    @action(detail=True, methods=['post'])
    def liquidar(self, request, pk=None):
        """Generar registros de nómina completos según ley colombiana (Devengados, Deducciones y Provisiones)"""
        periodo = self.get_object()
        if periodo.cerrado:
            return Response({'error': 'El periodo ya está cerrado'}, status=400)
        
        # 1. Definición de Conceptos Base
        def get_con(codigo, nombre, tipo, base=True):
            c, _ = ConceptoNomina.objects.get_or_create(
                codigo=codigo, 
                defaults={'nombre': nombre, 'tipo': tipo, 'es_base_cotizacion': base}
            )
            return c

        c_sueldo    = get_con('DEV-SUE', 'Sueldo Básico', 'DEV')
        c_aux_trans = get_con('DEV-AUX', 'Auxilio Transporte', 'DEV', False)
        
        c_salud_ee  = get_con('DED-SAL', 'Salud Empleado (4%)', 'DED')
        c_pension_ee = get_con('DED-PEN', 'Pensión Empleado (4%)', 'DED')
        
        c_prima     = get_con('PROV-PRI', 'Provisión Prima (8.33%)', 'PROV')
        c_cesantias = get_con('PROV-CES', 'Provisión Cesantías (8.33%)', 'PROV')
        c_int_ces   = get_con('PROV-INT', 'Intereses Cesantías (1%)', 'PROV')
        c_vacaciones = get_con('PROV-VAC', 'Provisión Vacaciones (4.17%)', 'PROV')
        
        c_pension_er = get_con('PROV-PEN-ER', 'Pensión Patronal (12%)', 'PROV')
        c_arl       = get_con('PROV-ARL', 'ARL', 'PROV')
        c_caja      = get_con('PROV-CAJ', 'Caja Compensación (4%)', 'PROV')

        empleados = Empleado.objects.filter(estado='ACT')
        nominas_creadas = 0
        
        # Parámetros Legales (Ajustables)
        MIN_SALARY = Decimal('1500000')
        AUX_TRANS_VAL = Decimal('180000')
        
        ARL_RATES = {
            'I': Decimal('0.00522'), 'II': Decimal('0.01044'),
            'III': Decimal('0.02436'), 'IV': Decimal('0.04350'), 'V': Decimal('0.06960')
        }

        for emp in empleados:
            if not Nomina.objects.filter(periodo=periodo, empleado=emp).exists():
                salario = emp.salario_basico
                base_prestaciones = salario
                tiene_auxilio = False
                
                if emp.auxilio_transporte and salario <= (MIN_SALARY * 2):
                    base_prestaciones += AUX_TRANS_VAL
                    tiene_auxilio = True

                nomina = Nomina.objects.create(
                    periodo=periodo, empleado=emp, salario_base=salario,
                    dias_trabajados=30, total_devengados=0, total_deducciones=0, neto_pagar=0 
                )
                
                # --- DEVENGADOS ---
                DetalleNomina.objects.create(nomina=nomina, concepto=c_sueldo, valor_unitario=salario, cantidad=1, valor=salario)
                if tiene_auxilio:
                    DetalleNomina.objects.create(nomina=nomina, concepto=c_aux_trans, valor_unitario=AUX_TRANS_VAL, cantidad=1, valor=AUX_TRANS_VAL)
                
                # --- DEDUCCIONES (EMPLEADO) ---
                v_salud = (salario * Decimal('0.04')).quantize(Decimal('1'))
                DetalleNomina.objects.create(nomina=nomina, concepto=c_salud_ee, valor_unitario=v_salud, cantidad=1, valor=v_salud)
                
                v_pension = (salario * Decimal('0.04')).quantize(Decimal('1'))
                DetalleNomina.objects.create(nomina=nomina, concepto=c_pension_ee, valor_unitario=v_pension, cantidad=1, valor=v_pension)
                
                # --- PROVISIONES Y CARGAS (PATRONAL) ---
                # Prestaciones
                v_prima = (base_prestaciones * Decimal('0.0833')).quantize(Decimal('1'))
                DetalleNomina.objects.create(nomina=nomina, concepto=c_prima, valor_unitario=v_prima, cantidad=1, valor=v_prima)
                
                v_cesantias = (base_prestaciones * Decimal('0.0833')).quantize(Decimal('1'))
                DetalleNomina.objects.create(nomina=nomina, concepto=c_cesantias, valor_unitario=v_cesantias, cantidad=1, valor=v_cesantias)
                
                v_int_ces = (v_cesantias * Decimal('0.12') / 12).quantize(Decimal('1'))
                DetalleNomina.objects.create(nomina=nomina, concepto=c_int_ces, valor_unitario=v_int_ces, cantidad=1, valor=v_int_ces)
                
                v_vac = (salario * Decimal('0.0417')).quantize(Decimal('1'))
                DetalleNomina.objects.create(nomina=nomina, concepto=c_vacaciones, valor_unitario=v_vac, cantidad=1, valor=v_vac)
                
                # Seguridad Social y Parafiscales Patronal
                v_pen_er = (salario * Decimal('0.12')).quantize(Decimal('1'))
                DetalleNomina.objects.create(nomina=nomina, concepto=c_pension_er, valor_unitario=v_pen_er, cantidad=1, valor=v_pen_er)
                
                rate_arl = ARL_RATES.get(emp.nivel_riesgo_arl, ARL_RATES['I'])
                v_arl = (salario * rate_arl).quantize(Decimal('1'))
                DetalleNomina.objects.create(nomina=nomina, concepto=c_arl, valor_unitario=v_arl, cantidad=1, valor=v_arl)
                
                v_caja = (salario * Decimal('0.04')).quantize(Decimal('1'))
                DetalleNomina.objects.create(nomina=nomina, concepto=c_caja, valor_unitario=v_caja, cantidad=1, valor=v_caja)

                nomina.calcular_totales()
                nominas_creadas += 1
                
        return Response({'status': 'ok', 'creados': nominas_creadas})


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

    @action(detail=False, methods=['post'], url_path='voucher/pdf')
    def generar_voucher_pdf(self, request):
        """Generar comprobante de nómina en PDF"""
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.units import inch
        
        data = request.data
        
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        # Título
        c.setFont("Helvetica-Bold", 16)
        c.drawCentredString(width/2, height - inch, "COMPROBANTE DE NÓMINA")
        
        # Información del empleado
        c.setFont("Helvetica-Bold", 12)
        c.drawString(inch, height - 1.5*inch, f"Empleado: {data.get('nombre', 'N/A')}")
        c.setFont("Helvetica", 10)
        c.drawString(inch, height - 1.8*inch, f"Cédula: {data.get('cedula', 'N/A')}")
        c.drawString(inch, height - 2.0*inch, f"Cargo: {data.get('cargo', 'N/A')}")
        c.drawString(inch, height - 2.2*inch, f"Período: {data.get('periodo', 'N/A')}")
        
        # Tabla de conceptos
        c.setFont("Helvetica-Bold", 11)
        c.drawString(inch, height - 2.8*inch, "CONCEPTOS:")
        
        y = height - 3.2*inch
        c.setFont("Helvetica", 10)
        
        devengados = 0
        deducciones = 0
        
        for concepto in data.get('conceptos', []):
            c.drawString(1.2*inch, y, concepto.get('nombre', ''))
            valor = concepto.get('valor', 0)
            c.drawRightString(width - inch, y, f"${valor:,.0f}")
            
            if concepto.get('tipo') == 'devengado':
                devengados += valor
            else:
                deducciones += valor
            y -= 0.3*inch
        
        # Totales
        y -= 0.3*inch
        c.setFont("Helvetica-Bold", 11)
        c.drawString(inch, y, "TOTAL DEVENGADO:")
        c.drawRightString(width - inch, y, f"${devengados:,.0f}")
        
        y -= 0.3*inch
        c.drawString(inch, y, "TOTAL DEDUCCIONES:")
        c.drawRightString(width - inch, y, f"${deducciones:,.0f}")
        
        y -= 0.4*inch
        c.setFont("Helvetica-Bold", 14)
        c.drawString(inch, y, "NETO A PAGAR:")
        c.drawRightString(width - inch, y, f"${data.get('neto', 0):,.0f}")
        
        # Pie de página
        c.setFont("Helvetica", 8)
        c.drawCentredString(width/2, inch/2, "ERP 8AMPERIOS - Nómina Electrónica")
        
        c.showPage()
        c.save()
        
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename=voucher_{data.get("cedula", "empleado")}.pdf'
        return response


class DetalleNominaViewSet(viewsets.ModelViewSet):
    queryset = DetalleNomina.objects.all()
    serializer_class = DetalleNominaSerializer
