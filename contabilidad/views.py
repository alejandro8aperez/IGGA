from io import BytesIO
from datetime import date
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.http import HttpResponse
from django.utils.dateparse import parse_date
from rest_framework import status, viewsets
from erp_core.permissions import IsContabilidadUser
from rest_framework.decorators import action
from rest_framework.response import Response
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from openpyxl import Workbook

from .models import AsientoContable, Cuenta, MovimientoContable, PeriodoContable
from .serializers import (
    AsientoContableSerializer,
    CuentaSerializer,
    MovimientoContableSerializer,
    PeriodoContableSerializer,
)


class CuentaViewSet(viewsets.ModelViewSet):
    queryset = Cuenta.objects.all()
    serializer_class = CuentaSerializer


class AsientoContableViewSet(viewsets.ModelViewSet):
    queryset = AsientoContable.objects.all()
    serializer_class = AsientoContableSerializer

    def _parse_date_param(self, value):
        if not value:
            return None
        return parse_date(value)

    def _filter_by_dates(self, request, queryset):
        fecha_inicio = self._parse_date_param(request.query_params.get('fecha_inicio'))
        fecha_fin = self._parse_date_param(request.query_params.get('fecha_fin'))
        if fecha_inicio:
            queryset = queryset.filter(fecha__gte=fecha_inicio)
        if fecha_fin:
            queryset = queryset.filter(fecha__lte=fecha_fin)
        return queryset

    def _serialize_balance(self, fecha_inicio=None, fecha_fin=None):
        cuentas = Cuenta.objects.all().order_by('codigo')
        grouped = {tipo: [] for tipo, _ in Cuenta.TIPO_CHOICES}
        totals = {tipo: 0.0 for tipo, _ in Cuenta.TIPO_CHOICES}

        for cuenta in cuentas:
            # TODO: Implementar cálculo de saldo real
            saldo = 0.0
            grouped[cuenta.tipo].append({
                'id': cuenta.id,
                'codigo': cuenta.codigo,
                'nombre': cuenta.nombre,
                'saldo': saldo,
            })
            totals[cuenta.tipo] += saldo

        return grouped, totals

    def _serialize_estado_resultados(self, fecha_inicio, fecha_fin):
        ingresos = []
        gastos = []
        total_ingresos = 0.0
        total_gastos = 0.0

        for cuenta in Cuenta.objects.filter(tipo='ingreso').order_by('codigo'):
            # TODO: Implementar cálculo de saldo real
            saldo = 0.0
            ingresos.append({'id': cuenta.id, 'codigo': cuenta.codigo, 'nombre': cuenta.nombre, 'saldo': saldo})
            total_ingresos += saldo

        for cuenta in Cuenta.objects.filter(tipo='gasto').order_by('codigo'):
            # TODO: Implementar cálculo de saldo real
            saldo = 0.0
            gastos.append({'id': cuenta.id, 'codigo': cuenta.codigo, 'nombre': cuenta.nombre, 'saldo': saldo})
            total_gastos += saldo

        return {
            'ingresos': ingresos,
            'gastos': gastos,
            'total_ingresos': round(total_ingresos, 2),
            'total_gastos': round(total_gastos, 2),
            'utilidad_neta': round(total_ingresos - total_gastos, 2),
            'periodo': {'fecha_inicio': str(fecha_inicio), 'fecha_fin': str(fecha_fin)},
        }

    @action(detail=False, methods=['get'], url_path='plan-de-cuentas')
    def plan_de_cuentas(self, request):
        def build_tree(cuenta):
            return {
                'id': cuenta.id,
                'codigo': cuenta.codigo,
                'nombre': cuenta.nombre,
                'tipo': cuenta.tipo,
                'nivel': cuenta.nivel,
                'saldo': 0.0,
                'hijos': [build_tree(child) for child in cuenta.subcuentas.order_by('codigo')],
            }

        cuentas = Cuenta.objects.filter(cuenta_padre__isnull=True).order_by('codigo')
        return Response({'plan_de_cuentas': [build_tree(cuenta) for cuenta in cuentas]})

    @action(detail=False, methods=['get'], url_path='balance-general')
    def balance_general(self, request):
        fecha_inicio = self._parse_date_param(request.query_params.get('fecha_inicio'))
        fecha_fin = self._parse_date_param(request.query_params.get('fecha_fin'))
        grouped, totals = self._serialize_balance(fecha_inicio, fecha_fin)
        return Response({'balance_general': grouped, 'totales': totals})

    @action(detail=False, methods=['get'], url_path='estado-resultados')
    def estado_resultados(self, request):
        fecha_inicio = self._parse_date_param(request.query_params.get('fecha_inicio')) or date(date.today().year, 1, 1)
        fecha_fin = self._parse_date_param(request.query_params.get('fecha_fin')) or date.today()
        return Response({'estado_resultados': self._serialize_estado_resultados(fecha_inicio, fecha_fin)})

    @action(detail=False, methods=['get'], url_path='estados-financieros')
    def estados_financieros(self, request):
        fecha_inicio = self._parse_date_param(request.query_params.get('fecha_inicio')) or date(date.today().year, 1, 1)
        fecha_fin = self._parse_date_param(request.query_params.get('fecha_fin')) or date.today()
        balance, totals = self._serialize_balance(fecha_inicio, fecha_fin)
        return Response({
            'balance_general': {'cuentas': balance, 'totales': totals},
            'estado_resultados': self._serialize_estado_resultados(fecha_inicio, fecha_fin),
        })

    @action(detail=False, methods=['get'], url_path='export-excel')
    def export_excel(self, request):
        asientos = self._filter_by_dates(request, self.queryset)
        workbook = Workbook()
        worksheet = workbook.active
        worksheet.title = 'Asientos'
        headers = ['Asiento', 'Fecha', 'Descripción', 'Referencia', 'Cuenta', 'Tipo Cuenta', 'Debe', 'Haber', 'Movimiento']
        worksheet.append(headers)

        for asiento in asientos:
            for movimiento in asiento.movimientos.all():
                worksheet.append([
                    asiento.id,
                    asiento.fecha.strftime('%Y-%m-%d'),
                    asiento.descripcion,
                    asiento.referencia,
                    movimiento.cuenta.codigo,
                    movimiento.cuenta.tipo,
                    float(movimiento.debe),
                    float(movimiento.haber),
                    movimiento.descripcion,
                ])

        output = BytesIO()
        workbook.save(output)
        output.seek(0)

        response = HttpResponse(
            output.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename=Asientos_{date.today().isoformat()}.xlsx'
        return response

    @action(detail=False, methods=['get'], url_path='export-pdf')
    def export_pdf(self, request):
        asientos = self._filter_by_dates(request, self.queryset)
        buffer = BytesIO()
        document = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = [Paragraph('Reporte de Asientos Contables', styles['Heading2']), Spacer(1, 12)]

        data = [['Asiento', 'Fecha', 'Cuenta', 'Debe', 'Haber', 'Detalle']]
        for asiento in asientos:
            for movimiento in asiento.movimientos.all():
                data.append([
                    str(asiento.id),
                    asiento.fecha.strftime('%Y-%m-%d'),
                    f'{movimiento.cuenta.codigo} {movimiento.cuenta.nombre}',
                    str(movimiento.debe),
                    str(movimiento.haber),
                    movimiento.descripcion,
                ])

        table = Table(data, repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#d3d3d3')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('ALIGN', (3, 0), (4, -1), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(table)
        document.build(elements)
        buffer.seek(0)

        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename=Asientos_{date.today().isoformat()}.pdf'
        return response


class PeriodoContableViewSet(viewsets.ModelViewSet):
    queryset = PeriodoContable.objects.all().order_by('-fecha_inicio')
    serializer_class = PeriodoContableSerializer

    @action(detail=True, methods=['post'], url_path='cerrar')
    def cerrar(self, request, pk=None):
        periodo = self.get_object()
        try:
            periodo.cerrar()
            serializer = self.get_serializer(periodo)
            return Response(serializer.data)
        except ValidationError as exc:
            return Response({'error': exc.message_dict if hasattr(exc, 'message_dict') else str(exc)}, status=status.HTTP_400_BAD_REQUEST)


class MovimientoContableViewSet(viewsets.ModelViewSet):
    queryset = MovimientoContable.objects.all()
    serializer_class = MovimientoContableSerializer
