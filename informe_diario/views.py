from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncMonth
from django.http import HttpResponse
from datetime import date, timedelta

from .models import (
    Obra, CategoriaRecurso, Recurso, CategoriaActividad,
    InformeDiario, AnexoFoto, ReporteLluvia, ItemObra,
)
from .serializers import (
    ObraSerializer, CategoriaRecursoSerializer, RecursoSerializer,
    CategoriaActividadSerializer, InformeDiarioSerializer,
    InformeDiarioListSerializer, AnexoFotoSerializer,
)
from . import exports


class ObraViewSet(viewsets.ModelViewSet):
    queryset = Obra.objects.all()
    serializer_class = ObraSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['codigo', 'nombre', 'cliente']
    ordering_fields = ['nombre', 'codigo', 'creado_en']
    permission_classes = [AllowAny]


class CategoriaRecursoViewSet(viewsets.ModelViewSet):
    queryset = CategoriaRecurso.objects.all()
    serializer_class = CategoriaRecursoSerializer
    permission_classes = [AllowAny]


class RecursoViewSet(viewsets.ModelViewSet):
    queryset = Recurso.objects.select_related('categoria').all()
    serializer_class = RecursoSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'categoria__nombre']
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        categoria = self.request.query_params.get('categoria')
        if categoria:
            qs = qs.filter(categoria_id=categoria)
        only_active = self.request.query_params.get('activo')
        if only_active in ('1', 'true', 'True'):
            qs = qs.filter(activo=True)
        return qs


class CategoriaActividadViewSet(viewsets.ModelViewSet):
    queryset = CategoriaActividad.objects.all()
    serializer_class = CategoriaActividadSerializer
    permission_classes = [AllowAny]


class InformeDiarioViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = InformeDiario.objects.select_related('obra').prefetch_related(
        'detalles__recurso__categoria',
        'reportes_lluvia',
        'actividades__categoria',
        'items_obra',
        'anexos',
    ).all()
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['obra__codigo', 'obra__nombre', 'observaciones_generales']
    ordering_fields = ['fecha', 'creado_en']

    def get_serializer_class(self):
        if self.action == 'list':
            return InformeDiarioListSerializer
        return InformeDiarioSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        obra = self.request.query_params.get('obra')
        fecha_desde = self.request.query_params.get('fecha_desde')
        fecha_hasta = self.request.query_params.get('fecha_hasta')
        if obra:
            qs = qs.filter(obra_id=obra)
        if fecha_desde:
            qs = qs.filter(fecha__gte=fecha_desde)
        if fecha_hasta:
            qs = qs.filter(fecha__lte=fecha_hasta)
        return qs

    @action(detail=True, methods=['get'], url_path='exportar-pdf')
    def exportar_pdf(self, request, pk=None):
        informe = self.get_object()
        pdf_bytes = exports.generar_pdf(informe)
        resp = HttpResponse(pdf_bytes, content_type='application/pdf')
        resp['Content-Disposition'] = (
            f'attachment; filename="Informe_Diario_{informe.obra.codigo}_{informe.fecha}.pdf"'
        )
        return resp

    @action(detail=True, methods=['get'], url_path='exportar-excel')
    def exportar_excel(self, request, pk=None):
        informe = self.get_object()
        xlsx_bytes = exports.generar_excel(informe)
        resp = HttpResponse(
            xlsx_bytes,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        resp['Content-Disposition'] = (
            f'attachment; filename="Informe_Diario_{informe.obra.codigo}_{informe.fecha}.xlsx"'
        )
        return resp

    @action(detail=True, methods=['post'], url_path='subir-anexo',
            parser_classes=[MultiPartParser, FormParser])
    def subir_anexo(self, request, pk=None):
        informe = self.get_object()
        serializer = AnexoFotoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(informe=informe)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AnexoFotoViewSet(viewsets.ModelViewSet):
    queryset = AnexoFoto.objects.all()
    serializer_class = AnexoFotoSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        informe_id = self.request.query_params.get('informe')
        if informe_id:
            qs = qs.filter(informe_id=informe_id)
        return qs
class DashboardViewSet(viewsets.ViewSet):
    """Read-only stats endpoints for the dashboard."""

    @action(detail=False, methods=['get'])
    def resumen(self, request):
        obra_id = request.query_params.get('obra')
        qs = InformeDiario.objects.all()
        if obra_id:
            qs = qs.filter(obra_id=obra_id)

        hoy = date.today()
        ult_30 = hoy - timedelta(days=30)

        total_informes = qs.count()
        informes_mes = qs.filter(fecha__gte=ult_30).count()

        # Horas de lluvia últimos 30 días
        horas_lluvia_30 = ReporteLluvia.objects.filter(
            informe__in=qs, informe__fecha__gte=ult_30, con_lluvia=True,
        ).count()

        # Personal promedio últimos 30 días (Catálogo + Libre)
        from .models import DetalleRecurso, PersonalLibre
        personal_qs = DetalleRecurso.objects.filter(
            informe__in=qs, informe__fecha__gte=ult_30,
            recurso__categoria__nombre__icontains='PERSONAL',
        )
        personal_libre_qs = PersonalLibre.objects.filter(
            informe__in=qs, informe__fecha__gte=ult_30
        )
        total_personal_30 = (personal_qs.aggregate(s=Sum('cantidad'))['s'] or 0) + \
                           (personal_libre_qs.aggregate(s=Sum('cantidad'))['s'] or 0)

        n_dias = qs.filter(fecha__gte=ult_30).count() or 1
        personal_promedio = round(float(total_personal_30) / n_dias, 2)

        return Response({
            'total_informes': total_informes,
            'informes_ultimos_30_dias': informes_mes,
            'horas_lluvia_ultimos_30_dias': horas_lluvia_30,
            'personal_promedio_ultimos_30_dias': personal_promedio,
        })

    @action(detail=False, methods=['get'], url_path='lluvia-mensual')
    def lluvia_mensual(self, request):
        obra_id = request.query_params.get('obra')
        qs = ReporteLluvia.objects.filter(con_lluvia=True)
        if obra_id:
            qs = qs.filter(informe__obra_id=obra_id)
        data = (
            qs.annotate(mes=TruncMonth('informe__fecha'))
              .values('mes')
              .annotate(horas=Count('id'))
              .order_by('mes')
        )
        return Response([
            {'mes': r['mes'].strftime('%Y-%m') if r['mes'] else None,
             'horas': r['horas']}
            for r in data
        ])

    @action(detail=False, methods=['get'], url_path='personal-por-rol')
    def personal_por_rol(self, request):
        from .models import DetalleRecurso
        obra_id = request.query_params.get('obra')
        fecha_desde = request.query_params.get('fecha_desde')
        fecha_hasta = request.query_params.get('fecha_hasta')
        qs = DetalleRecurso.objects.filter(
            recurso__categoria__nombre__icontains='PERSONAL',
        )
        if obra_id:
            qs = qs.filter(informe__obra_id=obra_id)
        if fecha_desde:
            qs = qs.filter(informe__fecha__gte=fecha_desde)
        if fecha_hasta:
            qs = qs.filter(informe__fecha__lte=fecha_hasta)
        data = (
            qs.values('recurso__nombre')
              .annotate(total=Sum('cantidad'))
              .order_by('-total')
        )
        return Response([
            {'rol': r['recurso__nombre'], 'total': float(r['total'] or 0)}
            for r in data
        ])
