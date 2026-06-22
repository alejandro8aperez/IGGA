from datetime import date
from collections import defaultdict

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import InformeSemanal, InformeMensual
from .serializers import InformeSemanalSerializer, InformeMensualSerializer
from informe_diario.models import InformeDiario, ItemObra
from operaciones.models import Proyecto


def _build_s_curve_from_diarios(diarios):
    """
    Aggregate daily reports into S-Curve data points.
    Each point: {fecha, programado, ejecutado}
    - ejecutado: cumulative sum of items_obra.cantidad per day
    - programado: linear planned distribution across the period
    """
    sorted_diarios = sorted(diarios, key=lambda d: d.fecha)
    diario_ids = [d.id for d in sorted_diarios]
    items = ItemObra.objects.filter(informe_id__in=diario_ids).values('informe_id', 'cantidad')
    items_by_informe = defaultdict(float)
    for item in items:
        items_by_informe[item['informe_id']] += float(item['cantidad'])

    total_period = sum(items_by_informe.values())
    n = len(sorted_diarios)
    daily_planned = total_period / n if n > 0 else 0

    data = []
    prog_acc = 0.0
    ejec_acc = 0.0
    for d in sorted_diarios:
        day_ejec = items_by_informe.get(d.id, 0)
        ejec_acc += day_ejec
        prog_acc += daily_planned
        data.append({
            'fecha': d.fecha.isoformat(),
            'programado': round(prog_acc, 2),
            'ejecutado': round(ejec_acc, 2),
        })
    return data


def _calc_labor_summary(diarios):
    """
    Aggregate labor and machinery from daily reports into JSON summary.
    Uses the existing model properties total_personal, total_maquinaria, total_horas_lluvia.
    """
    total_personal = sum(d.total_personal for d in diarios)
    total_maquinaria = sum(d.total_maquinaria for d in diarios)
    total_actividades = sum(d.total_actividades for d in diarios)
    total_lluvia = sum(d.total_horas_lluvia for d in diarios)
    return {
        'total_personal': total_personal,
        'total_maquinaria': total_maquinaria,
        'total_actividades': total_actividades,
        'dias_lluvia': total_lluvia,
    }


class InformeSemanalViewSet(viewsets.ModelViewSet):
    queryset = InformeSemanal.objects.select_related(
        'proyecto', 'elaborado_por', 'revisado_por', 'profesional_1', 'profesional_2',
    ).all()
    serializer_class = InformeSemanalSerializer
    filterset_fields = ['proyecto', 'status', 'semana_numero']

    @action(detail=False, methods=['post'])
    def generar_desde_diarios(self, request):
        """
        Auto-generate a weekly report from daily reports.
        Expects: { proyecto_id, fecha_inicio, fecha_fin }
        """
        proyecto_id = request.data.get('proyecto_id')
        fecha_inicio = request.data.get('fecha_inicio')
        fecha_fin = request.data.get('fecha_fin')

        if not all([proyecto_id, fecha_inicio, fecha_fin]):
            return Response({'error': 'Se requieren proyecto_id, fecha_inicio, fecha_fin'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            fecha_inicio = date.fromisoformat(fecha_inicio)
            fecha_fin = date.fromisoformat(fecha_fin)
        except (ValueError, TypeError):
            return Response({'error': 'Formato de fecha inválido (YYYY-MM-DD)'},
                            status=status.HTTP_400_BAD_REQUEST)

        diarios = list(InformeDiario.objects.filter(
            proyecto_id=proyecto_id,
            fecha__gte=fecha_inicio,
            fecha__lte=fecha_fin,
        ).order_by('fecha'))

        if not diarios:
            return Response({'error': 'No hay informes diarios en el rango seleccionado'},
                            status=status.HTTP_404_NOT_FOUND)

        # Calc semana_numero from project dates
        try:
            proyecto_obj = Proyecto.objects.get(id=proyecto_id)
            delta = fecha_inicio - proyecto_obj.fecha_inicio
            semana_numero = (delta.days // 7) + 1
        except Proyecto.DoesNotExist:
            semana_numero = 0

        # Check for existing
        existing = InformeSemanal.objects.filter(
            proyecto_id=proyecto_id,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
        ).first()
        if existing:
            return Response({'error': 'Ya existe un informe semanal para este período',
                             'id': existing.id},
                            status=status.HTTP_409_CONFLICT)

        data = _build_s_curve_from_diarios(diarios)
        summary = _calc_labor_summary(diarios)

        total_prog = data[-1]['programado'] if data else 0
        total_ejec = data[-1]['ejecutado'] if data else 0

        resumen = (
            f"Resumen Semana {semana_numero}: "
            f"Avance Programado: {total_prog:.2f}%, "
            f"Avance Ejecutado: {total_ejec:.2f}%."
        )

        informe = InformeSemanal.objects.create(
            proyecto_id=proyecto_id,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            semana_numero=semana_numero,
            resumen_ejecutivo=resumen,
            curva_s_data=data,
            resumen_personal=summary,
            resumen_maquinaria=summary,
        )

        serializer = self.get_serializer(informe)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def proyectos_con_datos(self, request):
        """Return projects that have InformeDiario data to generate weekly reports."""
        proyectos_ids = InformeDiario.objects.values_list('proyecto', flat=True).distinct()
        proyectos = Proyecto.objects.filter(id__in=proyectos_ids).values('id', 'nombre', 'codigo')
        return Response(list(proyectos))


class InformeMensualViewSet(viewsets.ModelViewSet):
    queryset = InformeMensual.objects.select_related(
        'proyecto', 'elaborado_por', 'revisado_por', 'profesional_1', 'profesional_2',
    ).all()
    serializer_class = InformeMensualSerializer
    filterset_fields = ['proyecto', 'status', 'mes', 'anio']

    @action(detail=False, methods=['post'])
    def generar_desde_semanales(self, request):
        """
        Auto-generate a monthly report from weekly reports.
        Expects: { proyecto_id, mes, anio }
        """
        proyecto_id = request.data.get('proyecto_id')
        mes = request.data.get('mes')
        anio = request.data.get('anio')

        if not all([proyecto_id, mes, anio]):
            return Response({'error': 'Se requieren proyecto_id, mes, anio'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            mes = int(mes)
            anio = int(anio)
            if mes < 1 or mes > 12:
                raise ValueError
        except (ValueError, TypeError):
            return Response({'error': 'mes debe ser 1-12 y anio válido'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Determine date range for the month
        import calendar
        _, last_day = calendar.monthrange(anio, mes)
        fecha_inicio = date(anio, mes, 1)
        fecha_fin = date(anio, mes, last_day)

        # Check for existing
        existing = InformeMensual.objects.filter(
            proyecto_id=proyecto_id, mes=mes, anio=anio
        ).first()
        if existing:
            return Response({'error': 'Ya existe un informe mensual para este mes',
                             'id': existing.id},
                            status=status.HTTP_409_CONFLICT)

        semanales = InformeSemanal.objects.filter(
            proyecto_id=proyecto_id,
            fecha_inicio__gte=fecha_inicio,
            fecha_fin__lte=fecha_fin,
        ).order_by('fecha_inicio')

        # Fall back to daily reports if no weekly reports exist
        if semanales.exists():
            # Aggregate from weekly reports
            all_data = []
            combined_summary = {'total_personal': 0, 'total_maquinaria': 0, 'total_horas': 0, 'dias_lluvia': 0}
            for s in semanales:
                all_data.extend(s.curva_s_data)
                for k in combined_summary:
                    combined_summary[k] += s.resumen_personal.get(k, 0)

            all_data.sort(key=lambda x: x.get('fecha', ''))
            resumen = f"Resumen {mes}/{anio}: basado en {semanales.count()} informe(s) semanal(es)."
            informe = InformeMensual.objects.create(
                proyecto_id=proyecto_id,
                mes=mes, anio=anio,
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
                resumen_ejecutivo=resumen,
                curva_s_data=all_data,
                resumen_personal=combined_summary,
                resumen_maquinaria=combined_summary,
            )
        else:
            # Fallback: aggregate from daily reports
            diarios = InformeDiario.objects.filter(
                proyecto_id=proyecto_id,
                fecha__gte=fecha_inicio,
                fecha__lte=fecha_fin,
            ).order_by('fecha')

            if not diarios.exists():
                return Response({'error': 'No hay informes en el rango seleccionado'},
                                status=status.HTTP_404_NOT_FOUND)

            data = _build_s_curve_from_diarios(diarios)
            summary = _calc_labor_summary(diarios)

            total_prog = data[-1]['programado'] if data else 0
            total_ejec = data[-1]['ejecutado'] if data else 0

            resumen = (
                f"Resumen {mes}/{anio}: "
                f"Avance Programado: {total_prog:.2f}%, "
                f"Avance Ejecutado: {total_ejec:.2f}%."
            )

            informe = InformeMensual.objects.create(
                proyecto_id=proyecto_id,
                mes=mes, anio=anio,
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
                resumen_ejecutivo=resumen,
                curva_s_data=data,
                resumen_personal=summary,
                resumen_maquinaria=summary,
            )

        serializer = self.get_serializer(informe)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def proyectos_con_datos(self, request):
        proyectos_ids = InformeDiario.objects.values_list('proyecto', flat=True).distinct()
        proyectos = Proyecto.objects.filter(id__in=proyectos_ids).values('id', 'nombre', 'codigo')
        return Response(list(proyectos))
