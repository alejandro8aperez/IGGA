from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count, Sum
from django.utils import timezone
from .models import ProyectoKAVE, TareaKAVE, DocumentoKAVE, NotaKAVE
from .serializers import (
    ProyectoKAVESerializer, TareaKAVESerializer, 
    DocumentoKAVESerializer, NotaKAVESerializer
)

class ProyectoKAVEViewSet(viewsets.ModelViewSet):
    """ViewSet para la gestión de proyectos KAVE"""
    queryset = ProyectoKAVE.objects.all()
    serializer_class = ProyectoKAVESerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = ProyectoKAVE.objects.all()
        empresa_id = self.request.query_params.get('empresa', None)
        estado = self.request.query_params.get('estado', None)
        
        if empresa_id:
            queryset = queryset.filter(empresa_id=empresa_id)
        if estado:
            queryset = queryset.filter(estado=estado)
            
        return queryset.select_related('empresa', 'responsable').prefetch_related('tareas')

    @action(detail=True, methods=['get'])
    def tareas(self, request, pk=None):
        """Obtener todas las tareas de un proyecto"""
        proyecto = self.get_object()
        tareas = proyecto.tareas.all().select_related('asignado_a')
        serializer = TareaKAVESerializer(tareas, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def documentos(self, request, pk=None):
        """Obtener todos los documentos de un proyecto"""
        proyecto = self.get_object()
        documentos = proyecto.documentos.all().select_related('subido_por')
        serializer = DocumentoKAVESerializer(documentos, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def notas(self, request, pk=None):
        """Obtener todas las notas de un proyecto"""
        proyecto = self.get_object()
        notas = proyecto.notas.all().select_related('autor')
        serializer = NotaKAVESerializer(notas, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def agregar_nota(self, request, pk=None):
        """Agregar una nota a un proyecto"""
        proyecto = self.get_object()
        data = request.data.copy()
        data['proyecto'] = proyecto.id
        data['autor'] = request.user.id
        
        serializer = NotaKAVESerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Dashboard de proyectos KAVE"""
        empresa_id = request.query_params.get('empresa', None)
        queryset = self.get_queryset()
        
        if empresa_id:
            queryset = queryset.filter(empresa_id=empresa_id)
        
        # Estadísticas generales
        stats = {
            'total_proyectos': queryset.count(),
            'proyectos_por_estado': queryset.values('estado').annotate(count=Count('id')),
            'proyectos_por_prioridad': queryset.values('prioridad').annotate(count=Count('id')),
            'presupuesto_total': queryset.aggregate(total=Sum('presupuesto'))['total'] or 0,
        }
        
        # Proyectos recientes
        proyectos_recientes = queryset.order_by('-creado_en')[:5]
        proyectos_serializer = ProyectoKAVESerializer(proyectos_recientes, many=True)
        
        # Tareas pendientes
        tareas_pendientes = TareaKAVE.objects.filter(
            proyecto__in=queryset,
            estado='pendiente'
        ).select_related('proyecto', 'asignado_a').order_by('-fecha_vencimiento')[:10]
        tareas_serializer = TareaKAVESerializer(tareas_pendientes, many=True)
        
        return Response({
            'estadisticas': stats,
            'proyectos_recientes': proyectos_serializer.data,
            'tareas_pendientes': tareas_serializer.data,
        })

class TareaKAVEViewSet(viewsets.ModelViewSet):
    """ViewSet para la gestión de tareas KAVE"""
    queryset = TareaKAVE.objects.all()
    serializer_class = TareaKAVESerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = TareaKAVE.objects.all()
        proyecto_id = self.request.query_params.get('proyecto', None)
        asignado_a = self.request.query_params.get('asignado_a', None)
        estado = self.request.query_params.get('estado', None)
        
        if proyecto_id:
            queryset = queryset.filter(proyecto_id=proyecto_id)
        if asignado_a:
            queryset = queryset.filter(asignado_a_id=asignado_a)
        if estado:
            queryset = queryset.filter(estado=estado)
            
        return queryset.select_related('proyecto', 'asignado_a')

    @action(detail=True, methods=['post'])
    def marcar_completada(self, request, pk=None):
        """Marcar una tarea como completada"""
        tarea = self.get_object()
        tarea.estado = 'completada'
        tarea.save()
        serializer = self.get_serializer(tarea)
        return Response(serializer.data)

class DocumentoKAVEViewSet(viewsets.ModelViewSet):
    """ViewSet para la gestión de documentos KAVE"""
    queryset = DocumentoKAVE.objects.all()
    serializer_class = DocumentoKAVESerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = DocumentoKAVE.objects.all()
        proyecto_id = self.request.query_params.get('proyecto', None)
        tipo = self.request.query_params.get('tipo', None)
        
        if proyecto_id:
            queryset = queryset.filter(proyecto_id=proyecto_id)
        if tipo:
            queryset = queryset.filter(tipo=tipo)
            
        return queryset.select_related('proyecto', 'subido_por')

    def perform_create(self, serializer):
        serializer.save(subido_por=self.request.user)

class NotaKAVEViewSet(viewsets.ModelViewSet):
    """ViewSet para la gestión de notas KAVE"""
    queryset = NotaKAVE.objects.all()
    serializer_class = NotaKAVESerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = NotaKAVE.objects.all()
        proyecto_id = self.request.query_params.get('proyecto', None)
        
        if proyecto_id:
            queryset = queryset.filter(proyecto_id=proyecto_id)
            
        return queryset.select_related('proyecto', 'autor')

    def perform_create(self, serializer):
        serializer.save(autor=self.request.user)
