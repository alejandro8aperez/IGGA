from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count
from django.utils import timezone
from datetime import date, timedelta
from .models import FormatoISO9001, ProcesoISO, TrazabilidadISO
from .serializers_iso9001 import (
    FormatoISO9001Serializer, FormatoISO9001CreateSerializer, 
    FormatoISO9001ListSerializer, FormatoISO9001DashboardSerializer,
    ProcesoISOSerializer, TrazabilidadISOSerializer
)

class FormatoISO9001ViewSet(viewsets.ModelViewSet):
    """ViewSet para la gestión de Formatos ISO 9001"""
    queryset = FormatoISO9001.objects.all()
    permission_classes = [permissions.AllowAny]  # Temporal para desarrollo

    def get_serializer_class(self):
        if self.action == 'create':
            return FormatoISO9001CreateSerializer
        elif self.action == 'list':
            return FormatoISO9001ListSerializer
        elif self.action == 'dashboard':
            return FormatoISO9001DashboardSerializer
        return FormatoISO9001Serializer

    def get_queryset(self):
        queryset = FormatoISO9001.objects.all()
        modulo = self.request.query_params.get('modulo', None)
        estado = self.request.query_params.get('estado', None)
        tipo = self.request.query_params.get('tipo', None)
        requiere_actualizacion = self.request.query_params.get('requiere_actualizacion', None)
        
        if modulo:
            queryset = queryset.filter(modulo_relacionado=modulo)
        if estado:
            queryset = queryset.filter(estado=estado)
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        if requiere_actualizacion == 'true':
            # Formatos que requieren actualización en los próximos 30 días
            fecha_limite = date.today() + timedelta(days=30)
            queryset = queryset.filter(fecha_revision__lte=fecha_limite)
            
        return queryset.select_related('creado_por', 'aprobado_por').order_by('modulo_relacionado', 'codigo')

    def perform_create(self, serializer):
        """Asignar usuario creador automáticamente"""
        serializer.save(creado_por=self.request.user)

    @action(detail=True, methods=['post'])
    def aprobar(self, request, pk=None):
        """Aprobar un formato ISO 9001"""
        formato = self.get_object()
        
        if formato.estado != 'revision' and formato.estado != 'aprobacion':
            return Response({
                'error': 'Solo se pueden aprobar formatos en revisión o aprobación',
                'estado_actual': formato.estado
            }, status=status.HTTP_400_BAD_REQUEST)
        
        formato.estado = 'vigente'
        formato.aprobado_por = request.user
        formato.fecha_aprobacion = date.today()
        
        # Calcular fecha de próxima revisión
        formato.fecha_revision = date.today() + timedelta(months=formato.frecuencia_actualizacion)
        formato.save()
        
        # Registrar trazabilidad
        self._registrar_trazabilidad(formato, 'aprobacion', request.user)
        
        serializer = self.get_serializer(formato)
        return Response({
            'message': 'Formato aprobado exitosamente',
            'formato': serializer.data
        })

    @action(detail=True, methods=['post'])
    def actualizar_version(self, request, pk=None):
        """Crear nueva versión de un formato"""
        formato = self.get_object()
        
        # Crear nueva versión
        nueva_version = str(float(formato.version) + 0.1)
        
        # Actualizar formato existente
        formato.version = nueva_version
        formato.estado = 'borrador'
        formato.motivo_cambio = request.data.get('motivo_cambio', 'Actualización de versión')
        formato.creado_por = request.user
        formato.save()
        
        # Registrar trazabilidad
        self._registrar_trazabilidad(formato, 'modificacion', request.user, {
            'version_anterior': str(float(nueva_version) - 0.1),
            'version_nueva': nueva_version,
            'motivo': formato.motivo_cambio
        })
        
        serializer = self.get_serializer(formato)
        return Response({
            'message': f'Versión {nueva_version} creada exitosamente',
            'formato': serializer.data
        })

    @action(detail=True, methods=['post'])
    def registrar_auditoria(self, request, pk=None):
        """Registrar resultados de auditoría"""
        formato = self.get_object()
        
        conformidades = request.data.get('conformidades', 0)
        no_conformidades = request.data.get('no_conformidades', 0)
        
        formato.conformidades = conformidades
        formato.no_conformidades = no_conformidades
        formato.ultima_auditoria = date.today()
        formato.save()
        
        # Registrar trazabilidad
        self._registrar_trazabilidad(formato, 'auditoria', request.user, {
            'conformidades': conformidades,
            'no_conformidades': no_conformidades
        })
        
        return Response({
            'message': 'Resultados de auditoría registrados',
            'formato': {
                'conformidades': formato.conformidades,
                'no_conformidades': formato.no_conformidades,
                'ultima_auditoria': formato.ultima_auditoria
            }
        })

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Dashboard de formatos ISO 9001"""
        modulo = request.query_params.get('modulo', None)
        
        queryset = self.get_queryset()
        if modulo:
            queryset = queryset.filter(modulo_relacionado=modulo)
        
        # Estadísticas generales
        stats = {
            'total_formatos': queryset.count(),
            'por_estado': list(queryset.values('estado').annotate(count=Count('id'))),
            'por_modulo': list(queryset.values('modulo_relacionado').annotate(count=Count('id'))),
            'por_tipo': list(queryset.values('tipo').annotate(count=Count('id'))),
            'requieren_actualizacion': queryset.filter(
                fecha_revision__lte=date.today() + timedelta(days=30)
            ).count(),
            'vigentes': queryset.filter(estado='vigente').count(),
            'borradores': queryset.filter(estado='borrador').count(),
        }
        
        # Formatos recientes
        recientes = queryset.order_by('-created_at')[:10]
        recientes_serializer = FormatoISO9001DashboardSerializer(recientes, many=True)
        
        # Formatos que requieren atención
        requieren_atencion = queryset.filter(
            Q(estado='borrador') | 
            Q(fecha_revision__lte=date.today() + timedelta(days=30))
        ).order_by('fecha_revision')[:10]
        atencion_serializer = FormatoISO9001DashboardSerializer(requieren_atencion, many=True)
        
        return Response({
            'estadisticas': stats,
            'formatos_recientes': recientes_serializer.data,
            'requieren_atencion': atencion_serializer.data,
        })

    @action(detail=False, methods=['get'])
    def por_modulo(self, request):
        """Obtener formatos agrupados por módulo ERP"""
        modulos = FormatoISO9001.MODULO_ERP
        resultado = {}
        
        for modulo_id, modulo_nombre in modulos:
            formatos_modulo = self.get_queryset().filter(modulo_relacionado=modulo_id)
            serializer = FormatoISO9001ListSerializer(formatos_modulo, many=True)
            resultado[modulo_id] = {
                'nombre': modulo_nombre,
                'total': formatos_modulo.count(),
                'vigentes': formatos_modulo.filter(estado='vigente').count(),
                'requieren_actualizacion': formatos_modulo.filter(
                    fecha_revision__lte=date.today() + timedelta(days=30)
                ).count(),
                'formatos': serializer.data
            }
        
        return Response(resultado)

    def _registrar_trazabilidad(self, formato, accion, usuario, detalles=None):
        """Registrar trazabilidad automáticamente"""
        TrazabilidadISO.objects.create(
            formato=formato,
            modulo_erp=formato.modulo_relacionado,
            registro_id=formato.id,
            accion=accion,
            usuario=usuario,
            detalles=detalles or {},
            ip_address=self._get_client_ip()
        )

    def _get_client_ip(self):
        """Obtener IP del cliente"""
        request = self.context.get('request')
        if request:
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')
            return ip
        return None

class ProcesoISOViewSet(viewsets.ModelViewSet):
    """ViewSet para la gestión de Procesos ISO"""
    queryset = ProcesoISO.objects.all()
    serializer_class = ProcesoISOSerializer
    permission_classes = [permissions.AllowAny]  # Temporal para desarrollo

    def get_queryset(self):
        queryset = ProcesoISO.objects.all()
        modulo = self.request.query_params.get('modulo', None)
        estado = self.request.query_params.get('estado', None)
        
        if modulo:
            queryset = queryset.filter(modulo_erp=modulo)
        if estado:
            queryset = queryset.filter(estado=estado)
            
        return queryset.select_related('responsable_proceso').prefetch_related('formatos_iso')

    @action(detail=True, methods=['get'])
    def formatos(self, request, pk=None):
        """Obtener formatos asociados a un proceso"""
        proceso = self.get_object()
        formatos = proceso.formatos_iso.all()
        serializer = FormatoISO9001ListSerializer(formatos, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def asociar_formato(self, request, pk=None):
        """Asociar un formato a un proceso"""
        proceso = self.get_object()
        formato_id = request.data.get('formato_id')
        
        try:
            formato = FormatoISO9001.objects.get(id=formato_id)
            proceso.formatos_iso.add(formato)
            
            return Response({
                'message': f'Formato {formato.codigo} asociado al proceso {proceso.nombre_proceso}',
                'formato': FormatoISO9001ListSerializer(formato).data
            })
        except FormatoISO9001.DoesNotExist:
            return Response({
                'error': 'Formato no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)

class TrazabilidadISOViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para la consulta de Trazabilidad ISO (solo lectura)"""
    queryset = TrazabilidadISO.objects.all()
    serializer_class = TrazabilidadISOSerializer
    permission_classes = [permissions.AllowAny]  # Temporal para desarrollo

    def get_queryset(self):
        queryset = TrazabilidadISO.objects.all()
        formato_id = self.request.query_params.get('formato_id', None)
        modulo = self.request.query_params.get('modulo', None)
        usuario_id = self.request.query_params.get('usuario_id', None)
        accion = self.request.query_params.get('accion', None)
        
        if formato_id:
            queryset = queryset.filter(formato_id=formato_id)
        if modulo:
            queryset = queryset.filter(modulo_erp=modulo)
        if usuario_id:
            queryset = queryset.filter(usuario_id=usuario_id)
        if accion:
            queryset = queryset.filter(accion=accion)
            
        return queryset.select_related('formato', 'usuario').order_by('-fecha_uso')

    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Estadísticas de uso de formatos ISO"""
        queryset = self.get_queryset()
        
        stats = {
            'total_registros': queryset.count(),
            'por_accion': queryset.values('accion', 'accion_display').annotate(count=Count('id')),
            'por_modulo': queryset.values('modulo_erp').annotate(count=Count('id')),
            'por_usuario': queryset.values('usuario__username').annotate(count=Count('id')),
            'ultimos_7_dias': queryset.filter(
                fecha_uso__gte=timezone.now() - timedelta(days=7)
            ).count(),
            'hoy': queryset.filter(
                fecha_uso__date=date.today()
            ).count(),
        }
        
        return Response(stats)
