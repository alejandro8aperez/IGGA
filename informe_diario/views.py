"""
views.py — Informe Diario de Obra
Todos los ViewSets requeridos por urls.py + transformación del formato frontend → serializer.
"""
from datetime import timedelta
import io
import logging

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django.db.models import Count, Prefetch, Q
from django.utils import timezone
from django.http import HttpResponse
from rest_framework.exceptions import ValidationError

from .models import (
    CategoriaRecurso, Recurso, CategoriaActividad,
    InformeDiario, AnexoFoto, DetalleRecurso,
)
from .serializers import (
    CategoriaRecursoSerializer,
    RecursoSerializer,
    CategoriaActividadSerializer,
    ProyectoProxySerializer,
    InformeDiarioSerializer,
    InformeDiarioListSerializer,
    AnexoFotoSerializer,
)
from .exports import generar_excel, generar_pdf

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Transformador: formato plano del frontend → nested del serializer
# ─────────────────────────────────────────────────────────────────────────────

def _get_id(val):
    """Helper para extraer ID de objetos de selectores o valores nulos."""
    if isinstance(val, dict):
        return val.get('id')
    if str(val).lower() in ("null", "none", "undefined", ""):
        return None
    try:
        return int(val)
    except (ValueError, TypeError):
        return None

def _transform_frontend_data(data):
    """
    El frontend envía un objeto plano con campos como obra_id, recursos[],
    horas_lluvia[], etc.  El serializer espera nested con nombres distintos.
    Esta función hace la traducción antes de validar.

    Mapeo:
        obra_id (int)                       → obra
        proyecto_id (int)                   → proyecto
        recursos  [{recurso_id, ...}]       → detalles [{recurso, ...}]
        horas_lluvia [bool x 24]            → reportes_lluvia [{hora, con_lluvia}]
        actividades [{categoria_id, ...}]   → actividades [{categoria, ...}]
        items_obra  [{item, responsable...}]→ items_obra (sin responsable, no existe en el modelo)

    Firmas RRHH:
        elaborado_por_id (int)              → elaborado_por
        revisado_por_id (int)               → revisado_por
    """
    t = dict(data)

    # Proyecto: Extraer ID (Búsqueda exhaustiva para compatibilidad total)
    proyecto_id = t.pop('proyecto_id', None) or t.pop('proyecto', None) or \
                  t.pop('obra_id', None) or t.pop('obra', None)
    
    t['proyecto'] = _get_id(proyecto_id)

    # Status: Asegurar valor plano (evita estado congelado)
    raw_status = t.get('status')
    if raw_status is None or str(raw_status).lower() in ('null', 'none', 'undefined', ''):
        t['status'] = 'borrador'
    else:
        t['status'] = str(raw_status).lower()

    # ── FIRMAS RRHH ─────────────────────────────────────────
    # Transformar elaborado_por_id → elaborado_por (FK)
    elaborado_id = t.pop('elaborado_por_id', None)
    if elaborado_id:
        t['elaborado_por'] = _get_id(elaborado_id)
    else:
        t.pop('elaborado_por', None)

    revisado_id = t.pop('revisado_por_id', None)
    if revisado_id:
        t['revisado_por'] = _get_id(revisado_id)
    else:
        t.pop('revisado_por', None)
    # ─────────────────────────────────────────────────────────

    # recursos → detalles
    if 'recursos' in t:
        recursos_list = t.pop('recursos') or []
        t['detalles'] = [
            {
                'recurso':     _get_id(r.get('recurso_id') or r.get('recurso')),
                'cantidad':    r.get('cantidad', 0),
                'empresa':     r.get('empresa', ''),
                'notas':       r.get('notas', ''),
            } 
            for r in recursos_list 
            if _get_id(r.get('recurso_id') or r.get('recurso'))
        ]

    # horas_lluvia [bool x 24] → reportes_lluvia
    if 'horas_lluvia' in t:
        horas = t.pop('horas_lluvia') or []
        t['reportes_lluvia'] = [
            {'hora': i, 'con_lluvia': bool(v)}
            for i, v in enumerate(horas)
        ]

    # actividades: categoria_id → categoria
    if 'actividades' in t:
        t['actividades'] = [
            {
                'categoria':   _get_id(a.get('categoria_id') or a.get('categoria')),
                'descripcion': a.get('descripcion', ''),
                'orden':       idx,
            }
            for idx, a in enumerate(t.get('actividades') or [])
        ]

    # items_obra: responsable no existe en el modelo → se descarta
    if 'items_obra' in t:
        t['items_obra'] = [
            {
                'item':        it.get('item', ''),
                'descripcion': it.get('descripcion', ''),
                'empresa':     it.get('empresa', ''),
                'cantidad':    it.get('cantidad', 0),
                'orden':       idx,
            }
            for idx, it in enumerate(t.get('items_obra') or [])
        ]

    # Asegurar que maquinaria_libre y personal_libre mantengan los campos requeridos
    for key in ('maquinaria_libre', 'personal_libre'):
        if key in t:
            for item in t[key]:
                # Eliminar IDs de items existentes para evitar conflictos en el bulk-delete/create del serializer
                item.pop('id', None)
                item.setdefault('notas', '')

    # Limpieza: Eliminar campos de solo lectura para evitar errores 400
    for campo in ('proyecto_nombre', 'proyecto_codigo', 'obra_nombre', 'obra_codigo', 'dia_semana',
                  'fotos_urls', 'status_label', 'foto_principal', 'id',
                  'total_personal', 'total_maquinaria', 'total_horas_lluvia',
                  'creado_en', 'actualizado_en', 'anexos',
                  'elaborado_por_detalle', 'revisado_por_detalle',
                  'nombre_elaborado', 'nombre_revisado'):
        t.pop(campo, None)
    return t

# ─────────────────────────────────────────────────────────────────────────────
# Catálogos
# ─────────────────────────────────────────────────────────────────────────────

class ObraViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Proxy ViewSet: Redirige las peticiones de 'Obras' directamente a 'Proyectos' de Operaciones.
    Esto permite que el frontend siga funcionando mientras se actualizan las URLs.
    """
    pagination_class = None
    serializer_class = ProyectoProxySerializer

    def get_queryset(self):
        try:
            from django.apps import apps
            Proyecto = apps.get_model('operaciones', 'Proyecto')

            # 1. Intentar obtener proyectos prioritarios (En ejecución o Activos)
            try:
                # Usamos una sola consulta flexible para evitar hits innecesarios a la DB
                qs = Proyecto.objects.filter(
                    Q(estado__icontains='ejecucion') | 
                    Q(status__icontains='ejecucion') |
                    Q(estado__icontains='activo') |
                    Q(status__icontains='activo')
                )
                if qs.exists():
                    return qs.order_by('codigo')
            except Exception:
                pass

            # 2. Fallback final: Si lo anterior falla o está vacío, devolver TODOS los proyectos
            # Esto asegura que el botón OBRA* no esté vacío si hay CUALQUIER dato en Operaciones.
            return Proyecto.objects.all().order_by('codigo')
        except Exception as e:
            logger.error(f"CRITICAL: Error en ObraViewSet (Proxy) accediendo a Operaciones: {str(e)}")
            return []

class CategoriaRecursoViewSet(viewsets.ModelViewSet):
    queryset = CategoriaRecurso.objects.all().order_by('orden', 'nombre')
    serializer_class = CategoriaRecursoSerializer


class RecursoViewSet(viewsets.ModelViewSet):
    queryset = Recurso.objects.select_related('categoria').filter(activo=True)
    serializer_class = RecursoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields   = ['nombre', 'categoria__nombre']
    ordering_fields = ['nombre', 'orden']

    def get_queryset(self):
        qs = Recurso.objects.select_related('categoria').filter(activo=True)
        cat = self.request.query_params.get('categoria')
        if cat:
            qs = qs.filter(categoria__nombre__icontains=cat)
        return qs


class CategoriaActividadViewSet(viewsets.ModelViewSet):
    queryset = CategoriaActividad.objects.filter(activo=True).order_by('orden', 'nombre')
    serializer_class = CategoriaActividadSerializer


# ─────────────────────────────────────────────────────────────────────────────
# Informe Diario
# ─────────────────────────────────────────────────────────────────────────────

class InformeDiarioViewSet(viewsets.ModelViewSet):
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields   = ['proyecto__codigo', 'proyecto__nombre', 'elaborado_por__primer_nombre', 
                       'elaborado_por__primer_apellido', 'revisado_por__primer_nombre',
                       'revisado_por__primer_apellido']
    ordering_fields = ['fecha', 'creado_en', 'status']

    def get_serializer_class(self):
        if self.action == 'list':
            return InformeDiarioListSerializer
        return InformeDiarioSerializer

    def get_queryset(self):
        qs = (
            InformeDiario.objects
            .select_related('proyecto', 'elaborado_por', 'revisado_por')
            .prefetch_related(
                'detalles__recurso__categoria',
                'reportes_lluvia',
                'actividades__categoria',
                'items_obra',
                'anexos',
                'maquinaria_libre',
                'personal_libre',
            )
            .order_by('-fecha')
        )
        proyecto = self.request.query_params.get('proyecto') or self.request.query_params.get('proyecto_id') or self.request.query_params.get('obra_id') or self.request.query_params.get('obra')
        estado = self.request.query_params.get('status')
        if proyecto:
            qs = qs.filter(proyecto_id=proyecto)
        if estado:
            qs = qs.filter(status=estado)
        return qs

    # ── create / update con transformación ──────────────────────────────────

    def create(self, request, *args, **kwargs):
        try:
            data = _transform_frontend_data(request.data)
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except ValidationError:
            raise
        except Exception as e:
            logger.error(f"Error en create InformeDiario: {str(e)}", exc_info=True)
            return Response(
                {"error": "Error al crear informe", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        try:
            partial  = kwargs.pop('partial', False)
            instance = self.get_object()
            data     = _transform_frontend_data(request.data)
            serializer = self.get_serializer(instance, data=data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except ValidationError:
            raise
        except Exception as e:
            logger.error(f"Error en update InformeDiario: {str(e)}", exc_info=True)
            return Response(
                {"error": "Error al actualizar informe", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error en list InformeDiario: {str(e)}", exc_info=True)
            return Response(
                {"error": "Error al obtener informes", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # ── Acción: exportar Excel ───────────────────────────────────────────────

    @action(detail=True, methods=['get'], url_path='exportar-excel')
    def exportar_excel(self, request, pk=None):
        informe = self.get_object()
        content = generar_excel(informe)
        cod = informe.proyecto.codigo if informe.proyecto else 'sin-obra'
        fname = f'informe_{cod}_{informe.fecha}.xlsx'
        resp = HttpResponse(content, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        resp['Content-Disposition'] = f'attachment; filename="{fname}"'
        return resp

    # ── Acción: exportar PDF (HTML simple si no hay librería PDF) ─────────────

    @action(detail=True, methods=['get'], url_path='exportar-pdf')
    def exportar_pdf(self, request, pk=None):
        informe = self.get_object()
        content = generar_pdf(informe)
        resp = HttpResponse(content, content_type='application/pdf')
        cod = informe.proyecto.codigo if informe.proyecto else 'sin-obra'
        resp['Content-Disposition'] = f'attachment; filename="informe_{cod}_{informe.fecha}.pdf"'
        return resp

    # ── Acción: subir anexo de foto ──────────────────────────────────────────

    @action(detail=True, methods=['post'], url_path='subir-anexo',
            parser_classes=[MultiPartParser, FormParser])
    def subir_anexo(self, request, pk=None):
        from .serializers import AnexoFotoSerializer
        informe = self.get_object()
        data = request.data.copy()
        data['informe'] = informe.id
        serializer = AnexoFotoSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # ── Acción: conteo por estado (para StatsHeader) ─────────────────────────

    @action(detail=False, methods=['get'], url_path='status-counts')
    def status_counts(self, request):
        try:
            rows = (
                InformeDiario.objects
                .values('status')
                .annotate(total=Count('id'))
            )
            result = {'borrador': 0, 'enviado': 0, 'aprobado': 0}
            for row in rows:
                key = str(row.get('status', '')).lower()
                if key in result:
                    result[key] = row.get('total', 0)
            return Response(result)
        except Exception as e:
            logger.error(f"Error en status_counts: {str(e)}", exc_info=True)
            return Response(
                {'borrador': 0, 'enviado': 0, 'aprobado': 0, 'error': str(e)},
                status=status.HTTP_200_OK,
            )


# ─────────────────────────────────────────────────────────────────────────────
# Anexos / Fotos
# ─────────────────────────────────────────────────────────────────────────────

class AnexoFotoViewSet(viewsets.ModelViewSet):
    queryset       = AnexoFoto.objects.all().order_by('seccion', 'posicion', 'orden')
    serializer_class = AnexoFotoSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        qs = AnexoFoto.objects.all().order_by('seccion', 'posicion', 'orden')
        informe = self.request.query_params.get('informe')
        obra = self.request.query_params.get('obra')
        if informe:
            qs = qs.filter(informe_id=informe)
        if obra:
            qs = qs.filter(informe__proyecto_id=obra)
        return qs

    # ── Acción: reorganizar cuadrícula 4×6 (drag & drop del frontend) ────────

    @action(detail=False, methods=['post'], url_path='reorganizar-cuadricula')
    def reorganizar_cuadricula(self, request):
        """
        Recibe: [{id: <int>, posicion: <int>}, ...]
        Actualiza posiciones en bulk y devuelve los ids actualizados.
        """
        items = request.data
        if not isinstance(items, list):
            return Response(
                {'error': 'Se esperaba una lista de {id, posicion}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Optimización: Uso de bulk_update para procesar las 24 posiciones de la cuadrícula en una sola transacción
        ids = [item.get('id') for item in items if item.get('id')]
        anexos_map = {a.id: a for a in AnexoFoto.objects.filter(id__in=ids)}
        updated = []

        for item in items:
            anexo = anexos_map.get(item.get('id'))
            if anexo:
                anexo.posicion = item.get('posicion', 0)
                updated.append(anexo)

        AnexoFoto.objects.bulk_update(updated, ['posicion'])
        return Response({'updated': [a.id for a in updated], 'count': len(updated)})


# ─────────────────────────────────────────────────────────────────────────────
# Dashboard
# ─────────────────────────────────────────────────────────────────────────────

class DashboardViewSet(viewsets.ViewSet):
    """Estadísticas generales para el panel principal del módulo."""

    def list(self, request):
        hoy   = timezone.now().date()
        desde = hoy - timedelta(days=30)

        # Totales por estado
        por_estado_qs = (
            InformeDiario.objects
            .values('status')
            .annotate(total=Count('id'))
        )
        estado_map = {'borrador': 0, 'enviado': 0, 'aprobado': 0}
        for row in por_estado_qs:
            k = str(row.get('status', '')).lower()
            if k in estado_map:
                estado_map[k] = row['total']

        # Últimos 5 informes (últimos 30 días)
        recientes_qs = (
            InformeDiario.objects
            .select_related('proyecto')
            .filter(fecha__gte=desde)
            .order_by('-fecha')[:5]
        )
        recientes_data = InformeDiarioListSerializer(
            recientes_qs, many=True, context={'request': request}
        ).data

        # Informes por día (últimos 7 días) — útil para mini-gráfico
        ultimos_7 = (
            InformeDiario.objects
            .filter(fecha__gte=hoy - timedelta(days=6))
            .values('fecha')
            .annotate(total=Count('id'))
            .order_by('fecha')
        )

        return Response({
            'total':          InformeDiario.objects.count(),
            'por_estado':     estado_map,
            'recientes':      recientes_data,
            'por_dia':        list(ultimos_7),
            'periodo_dias':   30,
        })
