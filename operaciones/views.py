from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Proyecto, Tarea, InformeDiarioProy
from .serializers import ProyectoSerializer, TareaSerializer, InformeDiarioProySerializer


class ProyectoViewSet(viewsets.ModelViewSet):
    queryset = Proyecto.objects.all().order_by('-id')
    serializer_class = ProyectoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['nombre', 'fecha_inicio', 'fecha_fin_estimada', 'estado']

    def get_queryset(self):
        qs = Proyecto.objects.all().order_by('-id')
        estado = self.request.query_params.get('estado')
        if estado:
            qs = qs.filter(estado=estado)
        return qs

    @action(detail=False, methods=['get'], url_path='activos')
    def activos(self, request):
        """Proyectos en ejecución para selectores y dropdowns."""
        qs = Proyecto.objects.filter(estado='ejecucion').order_by('nombre')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class TareaViewSet(viewsets.ModelViewSet):
    serializer_class = TareaSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titulo', 'descripcion']
    ordering_fields = ['titulo', 'estado']

    def get_queryset(self):
        qs = Tarea.objects.all().select_related('proyecto').order_by('id')
        proyecto_id = self.request.query_params.get('proyecto')
        if proyecto_id:
            qs = qs.filter(proyecto_id=proyecto_id)
        estado = self.request.query_params.get('estado')
        if estado:
            qs = qs.filter(estado=estado)
        return qs


class InformeDiarioProyViewSet(viewsets.ModelViewSet):
    queryset = InformeDiarioProy.objects.all().order_by('-fecha', '-fecha_creacion')
    serializer_class = InformeDiarioProySerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['fecha', 'fecha_creacion']
