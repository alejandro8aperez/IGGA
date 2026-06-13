"""
views.py — Informe Diario de Obra
Todos los ViewSets requeridos por urls.py + transformación del formato frontend → serializer.
"""
from datetime import timedelta
import io

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django.db.models import Count
from django.utils import timezone
from django.http import HttpResponse

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

    Firmas RRHH:
        elaborado_por_id (int)              → elaborado_por
        revisado_por_id (int)               → revisado_por
    """
    t = dict(data)

    # Obra: Extraer ID del selector (filtrado por OPERACIONES en ViewSet)
    t['obra'] = _get_id(t.pop('obra_id', t.pop('obra', None)))

    # Status: Asegurar valor plano (evita estado congelado)
    t['status'] = _get_id(t.get('status')) or 'borrador'

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
    for campo in ('obra_nombre', 'obra_codigo', 'dia_semana',
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

class ObraViewSet(viewsets.ModelViewSet):
    queryset = Obra.objects.all()  # requerido por el router para determinar basename
    serializer_class = ObraSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields  = ['codigo', 'nombre', 'cliente']
    ordering_fields = ['codigo', 'nombre']

    def get_queryset(self):
        qs = Obra.objects.all().order_by('codigo', 'nombre')

        if self.action == 'list':
            include_inactive = self.request.query_params.get('include_inactive') == 'true'
            if not include_inactive:
                qs = qs.filter(activo=True)

        return qs

    def list(self, request, *args, **kwargs):
        """Si no hay obras, sincroniza automáticamente desde operaciones.Proyecto."""
        if not Obra.objects.exists():
            self._sync_from_proyectos()
        return super().list(request, *args, **kwargs)

    def _sync_from_proyectos(self):
        """Crea registros en informe_diario.Obra a partir de operaciones.Proyecto en ejecución."""
        try:
            from django.apps import apps
            Proyecto = apps.get_model('operaciones', 'Proyecto')
            for p in Proyecto.objects.filter(estado='ejecucion'):
                codigo = f"PROY-{p.id}"
                nombre = getattr(p, 'nombre', codigo)
                cliente = ""
                try:
                    if p.cliente:
                        cliente = str(p.cliente)
                except Exception:
                    pass
                Obra.objects.get_or_create(
                    codigo=codigo,
                    defaults={'nombre': nombre, 'cliente': cliente, 'activo': True},
                )
        except Exception:
            pass


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
        .select_related('obra', 'elaborado_por', 'revisado_por')
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
    search_fields   = ['obra__codigo', 'obra__nombre', 'elaborado_por__primer_nombre', 
                       'elaborado_por__primer_apellido', 'revisado_por__primer_nombre',
                       'revisado_por__primer_apellido']
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

    # ── Acción: exportar Excel ───────────────────────────────────────────────

    @action(detail=True, methods=['get'], url_path='exportar-excel')
    def exportar_excel(self, request, pk=None):
        try:
            import openpyxl
            from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
        except ImportError:
            return Response({'error': 'openpyxl no está instalado'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        informe = self.get_object()
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Informe Diario'

        header_font = Font(bold=True, color='FFFFFF')
        header_fill = PatternFill('solid', fgColor='1B3A5C')
        thin = Border(
            left=Side(style='thin'), right=Side(style='thin'),
            top=Side(style='thin'), bottom=Side(style='thin'),
        )

        ws.column_dimensions['A'].width = 30
        ws.column_dimensions['B'].width = 20
        ws.column_dimensions['C'].width = 15
        ws.column_dimensions['D'].width = 30

        def hrow(row, vals, fill=header_fill, font=header_font):
            for col, val in enumerate(vals, 1):
                c = ws.cell(row=row, column=col, value=val)
                c.fill = fill
                c.font = font
                c.border = thin
                c.alignment = Alignment(horizontal='center', vertical='center')

        def drow(row, vals):
            for col, val in enumerate(vals, 1):
                c = ws.cell(row=row, column=col, value=val)
                c.border = thin

        r = 1
        ws.merge_cells(f'A{r}:D{r}')
        c = ws.cell(r, 1, f'INFORME DIARIO DE OBRA — {informe.obra} — {informe.fecha}')
        c.font = Font(bold=True, size=13, color='FFFFFF')
        c.fill = header_fill
        c.alignment = Alignment(horizontal='center')
        r += 1

        hrow(r, ['Campo', 'Valor', '', ''])
        r += 1
        for campo, val in [
            ('Obra', str(informe.obra)),
            ('Fecha', str(informe.fecha)),
            ('Día', informe.dia_semana),
            ('Estado', informe.get_status_display()),
            ('Elaborado por', informe.nombre_elaborado),
            ('Revisado por', informe.nombre_revisado),
            ('Total personal', str(informe.total_personal)),
            ('Horas con lluvia', str(informe.total_horas_lluvia)),
            ('Observaciones', informe.observaciones_generales),
        ]:
            ws.merge_cells(f'B{r}:D{r}')
            drow(r, [campo, val])
            r += 1

        r += 1
        hrow(r, ['Recurso', 'Categoría', 'Cantidad', 'Empresa'])
        r += 1
        for d in informe.detalles.select_related('recurso__categoria').all():
            drow(r, [d.recurso.nombre, d.recurso.categoria.nombre, float(d.cantidad), d.empresa])
            r += 1
        for m in informe.maquinaria_libre.all():
            drow(r, [m.descripcion, 'MAQUINARIA LIBRE', float(m.cantidad), m.empresa])
            r += 1
        for p in informe.personal_libre.all():
            drow(r, [p.descripcion, 'PERSONAL LIBRE', float(p.cantidad), p.empresa])
            r += 1

        r += 1
        hrow(r, ['Actividad', 'Categoría', '', ''])
        r += 1
        for a in informe.actividades.select_related('categoria').all():
            ws.merge_cells(f'C{r}:D{r}')
            drow(r, [a.descripcion, a.categoria.nombre])
            r += 1

        buf = io.BytesIO()
        wb.save(buf)
        buf.seek(0)
        fname = f'informe_{informe.obra.codigo}_{informe.fecha}.xlsx'
        resp = HttpResponse(buf.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        resp['Content-Disposition'] = f'attachment; filename="{fname}"'
        return resp

    # ── Acción: exportar PDF (HTML simple si no hay librería PDF) ─────────────

    @action(detail=True, methods=['get'], url_path='exportar-pdf')
    def exportar_pdf(self, request, pk=None):
        informe = self.get_object()
        detalles = informe.detalles.select_related('recurso__categoria').all()
        actividades = informe.actividades.select_related('categoria').all()
        m_libre = informe.maquinaria_libre.all()
        p_libre = informe.personal_libre.all()

        rows_recursos = ''.join(
            f'<tr><td>{d.recurso.nombre}</td><td>{d.recurso.categoria.nombre}</td>'
            f'<td>{d.cantidad}</td><td>{d.empresa}</td></tr>'
            for d in detalles
        ) + ''.join(
            f'<tr><td>{m.descripcion}</td><td>MAQUINARIA LIBRE</td>'
            f'<td>{m.cantidad}</td><td>{m.empresa}</td></tr>'
            for m in m_libre
        ) + ''.join(
            f'<tr><td>{p.descripcion}</td><td>PERSONAL LIBRE</td>'
            f'<td>{p.cantidad}</td><td>{p.empresa}</td></tr>'
            for p in p_libre
        )
        rows_act = ''.join(
            f'<tr><td>{a.categoria.nombre}</td><td>{a.descripcion}</td></tr>'
            for a in actividades
        )

        html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>Informe {informe.obra.codigo} - {informe.fecha}</title>
<style>
  body{{font-family:Arial,sans-serif;font-size:11px;margin:20px}}
  h1{{font-size:14px;background:#1B3A5C;color:#fff;padding:8px 12px;border-radius:4px}}
  h2{{font-size:12px;background:#e2e8f0;padding:5px 10px;margin-top:16px}}
  table{{width:100%;border-collapse:collapse;margin-top:6px}}
  th{{background:#1B3A5C;color:#fff;padding:4px 8px;text-align:left;font-size:10px}}
  td{{padding:4px 8px;border:1px solid #cbd5e1;font-size:10px}}
  tr:nth-child(even){{background:#f8fafc}}
  .meta td:first-child{{font-weight:bold;width:160px;background:#f1f5f9}}
  @media print{{body{{margin:0}}}}
</style>
</head><body>
<h1>INFORME DIARIO DE OBRA — Formato {informe.codigo_formato}</h1>
<h2>Datos Generales</h2>
<table class="meta">
  <tr><td>Obra</td><td>{informe.obra}</td><td>Fecha</td><td>{informe.fecha}</td></tr>
  <tr><td>Día</td><td>{informe.dia_semana}</td><td>Estado</td><td>{informe.get_status_display()}</td></tr>
  <tr><td>Elaborado por</td><td>{informe.nombre_elaborado}</td><td>Cargo</td><td>{informe.cargo_elaborado_rrhh}</td></tr>
  <tr><td>Revisado por</td><td>{informe.nombre_revisado}</td><td>Cargo</td><td>{informe.cargo_revisado_rrhh}</td></tr>
  <tr><td>Total personal</td><td>{informe.total_personal}</td><td>Horas lluvia</td><td>{informe.total_horas_lluvia}</td></tr>
</table>
<h2>Observaciones Generales</h2>
<p>{informe.observaciones_generales or '—'}</p>
<h2>Recursos</h2>
<table><tr><th>Recurso</th><th>Categoría</th><th>Cantidad</th><th>Empresa</th></tr>{rows_recursos}</table>
<h2>Actividades</h2>
<table><tr><th>Categoría</th><th>Descripción</th></tr>{rows_act}</table>
</body></html>"""

        resp = HttpResponse(html, content_type='text/html; charset=utf-8')
        resp['Content-Disposition'] = f'inline; filename="informe_{informe.obra.codigo}_{informe.fecha}.html"'
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
