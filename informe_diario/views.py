"""
views.py — Informe Diario de Obra
Todos los ViewSets requeridos por urls.py + transformación del formato frontend → serializer.
"""
from datetime import timedelta

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django.db.models import Count
from django.utils import timezone

from .models import (
    Obra, CategoriaRecurso, Recurso, CategoriaActividad,
    InformeDiario, AnexoFoto,
)
from .serializers import (
    ObraSerializer,
    CategoriaRecursoSerializer,
    RecursoSerializer,
    CategoriaActividadSerializer,
    InformeDiarioSerializer,
    InformeDiarioListSerializer,
    AnexoFotoSerializer,
)


# ─────────────────────────────────────────────────────────────────────────────
# Transformador: formato plano del frontend → nested del serializer
# ─────────────────────────────────────────────────────────────────────────────

def _get_id(val):
    """Helper para extraer ID de objetos de selectores o valores nulos."""
    if isinstance(val, dict):
        return val.get('id')
    if str(val).lower() in ("null", "none", "undefined", ""):
        return None
    return val

def _transform_frontend_data(data):
    """
    El frontend envía un objeto plano con campos como obra_id, recursos[],
    horas_lluvia[], etc.  El serializer espera nested con nombres distintos.
    Esta función hace la traducción antes de validar.

    Mapeo:
        obra_id (int)                       → obra
        recursos  [{recurso_id, ...}]       → detalles [{recurso, ...}]
        horas_lluvia [bool x 24]            → reportes_lluvia [{hora, con_lluvia}]
        actividades [{categoria_id, ...}]   → actividades [{categoria, ...}]
        items_obra  [{item, responsable...}]→ items_obra (sin responsable, no existe en el modelo)
    """
    t = dict(data)

    # Normalización de Obra: Extraer ID limpio para evitar errores de validación
    obra_val = t.pop('obra_id', t.pop('obra', None))
    t['obra'] = _get_id(obra_val)

    # Normalización de Status: Asegurar valor plano (evita estado congelado)
    t['status'] = _get_id(t.get('status')) or 'BORRADOR'

    # recursos → detalles
    if 'recursos' in t:
        recursos_list = t.pop('recursos') or []
        t['detalles'] = [
            {
                'recurso':     _get_id(r.get('recurso_id') or r.get('recurso')),
                'cantidad':    r.get('cantidad', 0),
                'empresa':     r.get('empresa', ''),
                'observacion': r.get('observacion', ''),
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

    # Limpieza: Eliminar campos que el Serializer no espera para evitar errores 400
    for campo in ('obra_nombre', 'obra_codigo', 'dia_semana',
                  'fotos_urls', 'status_label', 'foto_principal', 'id',
                  'total_personal', 'total_maquinaria', 'total_horas_lluvia',
                  'creado_en', 'actualizado_en', 'anexos'):
        t.pop(campo, None)

    return t


# ─────────────────────────────────────────────────────────────────────────────
# Catálogos
# ─────────────────────────────────────────────────────────────────────────────

class ObraViewSet(viewsets.ModelViewSet):
    serializer_class = ObraSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields  = ['codigo', 'nombre', 'cliente']
    ordering_fields = ['codigo', 'nombre']

    def get_queryset(self):
        # El selector de obras debe mostrar únicamente aquellas que tengan 
        # proyectos registrados en el módulo de OPERACIONES.
        # Usamos distinct() para evitar duplicados si una obra tiene varios proyectos.
        qs = Obra.objects.filter(proyecto__isnull=False).distinct().order_by('codigo', 'nombre')
        
        if self.action == 'list':
            include_inactive = self.request.query_params.get('include_inactive') == 'true'
            if not include_inactive:
                qs = qs.filter(activo=True)
                
        return qs


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
        qs = super().get_queryset()
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
    queryset = (
        InformeDiario.objects
        .select_related('obra')
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
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields   = ['obra__codigo', 'obra__nombre', 'elaborado_por']
    ordering_fields = ['fecha', 'creado_en', 'status']

    def get_serializer_class(self):
        if self.action == 'list':
            return InformeDiarioListSerializer
        return InformeDiarioSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        obra   = self.request.query_params.get('obra') or self.request.query_params.get('obra_id')
        estado = self.request.query_params.get('status')
        if obra:
            qs = qs.filter(obra_id=obra)
        if estado:
            qs = qs.filter(status=estado)
        return qs

    # ── create / update con transformación ──────────────────────────────────

    def create(self, request, *args, **kwargs):
        data = _transform_frontend_data(request.data)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial  = kwargs.pop('partial', False)
        instance = self.get_object()
        data     = _transform_frontend_data(request.data)
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

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
        qs = super().get_queryset()
        informe = self.request.query_params.get('informe')
        obra = self.request.query_params.get('obra')
        if informe:
            qs = qs.filter(informe_id=informe)
        if obra:
            qs = qs.filter(informe__obra_id=obra)
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
            .select_related('obra')
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
