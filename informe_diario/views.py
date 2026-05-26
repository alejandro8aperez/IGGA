# =============================================================================
# views.py — Informe Diario de Obra (F-141-IN)
# ERP 8AMPERIOS
# =============================================================================

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Count, Sum

from .models import (
    Obra,
    CategoriaRecurso,
    Recurso,
    CategoriaActividad,
    InformeDiario,
    AnexoFoto
)

from .serializers import (
    ObraSerializer,
    CategoriaRecursoSerializer,
    RecursoSerializer,
    CategoriaActividadSerializer,
    InformeDiarioSerializer,
    AnexoFotoSerializer
)


# =============================================================================
# OBRAS
# =============================================================================

class ObraViewSet(viewsets.ModelViewSet):
    queryset = Obra.objects.all().order_by('-id')
    serializer_class = ObraSerializer


# =============================================================================
# CATEGORÍAS DE RECURSOS
# =============================================================================

class CategoriaRecursoViewSet(viewsets.ModelViewSet):
    queryset = CategoriaRecurso.objects.all().order_by('nombre')
    serializer_class = CategoriaRecursoSerializer


# =============================================================================
# RECURSOS
# =============================================================================

class RecursoViewSet(viewsets.ModelViewSet):
    queryset = Recurso.objects.all().order_by('nombre')
    serializer_class = RecursoSerializer


# =============================================================================
# CATEGORÍAS DE ACTIVIDADES
# =============================================================================

class CategoriaActividadViewSet(viewsets.ModelViewSet):
    queryset = CategoriaActividad.objects.all().order_by('nombre')
    serializer_class = CategoriaActividadSerializer


# =============================================================================
# INFORMES DIARIOS
# =============================================================================

class InformeDiarioViewSet(viewsets.ModelViewSet):
    queryset = InformeDiario.objects.all().order_by('-fecha', '-id')
    serializer_class = InformeDiarioSerializer

    @action(detail=False, methods=['get'], url_path='recientes')
    def recientes(self, request):
        informes = InformeDiario.objects.all().order_by('-fecha', '-id')[:10]
        serializer = self.get_serializer(informes, many=True)
        return Response(serializer.data)


# =============================================================================
# ANEXOS / FOTOS
# =============================================================================

class AnexoFotoViewSet(viewsets.ModelViewSet):
    queryset = AnexoFoto.objects.all().order_by('-id')
    serializer_class = AnexoFotoSerializer


# =============================================================================
# DASHBOARD
# =============================================================================

class DashboardViewSet(viewsets.ViewSet):

    # -------------------------------------------------------------------------
    # RESUMEN GENERAL
    # GET:
    # /api/informe-diario/dashboard/resumen/
    # -------------------------------------------------------------------------
    @action(detail=False, methods=['get'], url_path='resumen')
    def resumen(self, request):

        total_informes = InformeDiario.objects.count()
        total_obras = Obra.objects.count()
        total_recursos = Recurso.objects.count()

        data = {
            "total_informes": total_informes,
            "total_obras": total_obras,
            "total_recursos": total_recursos,
        }

        return Response(data)


    # -------------------------------------------------------------------------
    # STATUS COUNTS
    # GET:
    # /api/informe-diario/dashboard/status-counts/
    # -------------------------------------------------------------------------
    @action(detail=False, methods=['get'], url_path='status-counts')
    def status_counts(self, request):

        # Ajusta estos estados según tu modelo real
        estados = (
            InformeDiario.objects
            .values('estado')
            .annotate(total=Count('id'))
            .order_by('estado')
        )

        resultado = {
            "borrador": 0,
            "pendiente": 0,
            "aprobado": 0,
            "rechazado": 0,
        }

        for item in estados:
            estado = str(item['estado']).lower()

            if estado in resultado:
                resultado[estado] = item['total']

        return Response(resultado)


    # -------------------------------------------------------------------------
    # LLUVIA MENSUAL
    # GET:
    # /api/informe-diario/dashboard/lluvia-mensual/
    # -------------------------------------------------------------------------
    @action(detail=False, methods=['get'], url_path='lluvia-mensual')
    def lluvia_mensual(self, request):

        total = (
            InformeDiario.objects
            .filter(lluvia=True)
            .count()
        )

        return Response({
            "dias_con_lluvia": total
        })


    # -------------------------------------------------------------------------
    # PERSONAL POR ROL
    # GET:
    # /api/informe-diario/dashboard/personal-por-rol/
    # -------------------------------------------------------------------------
    @action(detail=False, methods=['get'], url_path='personal-por-rol')
    def personal_por_rol(self, request):

        # Ajusta este cálculo según tu estructura real
        total = (
            InformeDiario.objects
            .aggregate(total=Sum('cantidad_personal'))
        )

        return Response({
            "total_personal": total['total'] or 0
        })
