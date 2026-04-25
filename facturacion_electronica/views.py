"""
API Views para Facturación Electrónica
"""
import logging

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import FacturaElectronicaLog, ConfiguracionFacturatech
from .services import FacturatechService
from .serializers import (
    FacturaElectronicaLogSerializer,
    ConfiguracionFacturatechSerializer,
    EnviarFacturaSerializer,
    RespuestaFacturaSerializer
)

logger = logging.getLogger('facturatech')


class FacturaElectronicaLogViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar logs de facturas electrónicas
    """
    queryset = FacturaElectronicaLog.objects.all()
    serializer_class = FacturaElectronicaLogSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros opcionales
        factura_id = self.request.query_params.get('factura_id')
        estado = self.request.query_params.get('estado')
        cufe = self.request.query_params.get('cufe')
        
        if factura_id:
            queryset = queryset.filter(factura_id=factura_id)
        if estado:
            queryset = queryset.filter(estado_interno=estado)
        if cufe:
            queryset = queryset.filter(cufe=cufe)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def reenviar(self, request, pk=None):
        """
        Reenvía una factura previamente fallida
        """
        log = self.get_object()
        
        if log.estado_interno not in ['error', 'rechazada']:
            return Response(
                {'error': 'Solo se pueden reenviar facturas con error o rechazadas'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            config = ConfiguracionFacturatech.objects.filter(activo=True).first()
            if not config:
                return Response(
                    {'error': 'No hay configuración activa'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            service = FacturatechService(config)
            exito, resultado = service.enviar_factura(
                xml_content=log.xml_enviado,
                factura_id=log.factura_id,
                factura_numero=log.factura_numero
            )
            
            return Response({
                'exito': exito,
                'resultado': resultado
            })
            
        except Exception as e:
            logger.error(f"Error reenviando factura: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def consultar_estado(self, request, pk=None):
        """
        Consulta el estado actual de una factura en la DIAN
        """
        log = self.get_object()
        
        if not log.track_id:
            return Response(
                {'error': 'Esta factura no tiene track ID'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            config = ConfiguracionFacturatech.objects.filter(activo=True).first()
            service = FacturatechService(config)
            
            resultado = service.consultar_estado_factura(log.track_id)
            return Response(resultado)
            
        except Exception as e:
            logger.error(f"Error consultando estado: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ConfiguracionFacturatechViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar configuraciones de Facturatech
    """
    queryset = ConfiguracionFacturatech.objects.all()
    serializer_class = ConfiguracionFacturatechSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def activa(self, request):
        """
        Retorna la configuración activa
        """
        config = self.get_queryset().filter(activo=True).first()
        if not config:
            return Response(
                {'error': 'No hay configuración activa'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(config)
        return Response(serializer.data)


class FacturacionElectronicaAPIView(viewsets.ViewSet):
    """
    API View para operaciones de facturación electrónica
    """
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def enviar(self, request):
        """
        Endpoint principal para enviar factura electrónica
        
        Request Body:
        {
            "factura_id": 123,
            "factura_numero": "F001-001",
            "xml_content": "<Invoice>...</Invoice>",
            "tipo": "ventas"  // opcional, default: ventas
        }
        """
        serializer = EnviarFacturaSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        try:
            # Obtener configuración activa
            config = ConfiguracionFacturatech.objects.filter(activo=True).first()
            if not config:
                return Response(
                    {'error': 'No hay configuración activa de Facturatech'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Inicializar servicio
            service = FacturatechService(config)
            
            # Enviar factura
            exito, resultado = service.enviar_factura(
                xml_content=data['xml_content'],
                factura_id=data.get('factura_id'),
                factura_numero=data.get('factura_numero'),
                tipo=data.get('tipo', 'ventas')
            )
            
            response_serializer = RespuestaFacturaSerializer(data={
                'exito': exito,
                'codigo': resultado.get('codigo'),
                'mensaje': resultado.get('mensaje'),
                'cufe': resultado.get('cufe'),
                'track_id': resultado.get('track_id'),
                'error': resultado.get('error') if not exito else None
            })
            response_serializer.is_valid(raise_exception=True)
            
            http_status = status.HTTP_200_OK if exito else status.HTTP_400_BAD_REQUEST
            return Response(response_serializer.data, status=http_status)
            
        except Exception as e:
            logger.error(f"Error en endpoint enviar: {e}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def generar_xml(self, request):
        """
        Genera XML UBL 2.1 desde datos de factura
        
        Request Body:
        {
            "encabezado": {...},
            "emisor": {...},
            "adquiriente": {...},
            "items": [...],
            "totales": {...}
        }
        """
        try:
            factura_data = request.data
            
            config = ConfiguracionFacturatech.objects.filter(activo=True).first()
            service = FacturatechService(config)
            
            xml_content = service.generar_xml_ubl(factura_data)
            
            return Response({
                'xml': xml_content,
                'generado': True
            })
            
        except Exception as e:
            logger.error(f"Error generando XML: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def hash_password(self, request):
        """
        Utilidad para generar hash SHA256 de contraseña
        
        Query Params:
        ?password=contraseña_a_hashear
        """
        password = request.query_params.get('password')
        if not password:
            return Response(
                {'error': 'Se requiere parámetro password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from .services import FacturatechService
        hash_result = FacturatechService.hash_password_sha256(password)
        
        return Response({
            'password_original': '***' + password[-3:] if len(password) > 3 else '***',
            'hash_sha256': hash_result,
            'nota': 'Guarde este hash en FACTURATECH_PASSWORD del .env'
        })
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """
        Retorna estadísticas de facturación electrónica
        """
        from django.db.models import Count
        
        logs = FacturaElectronicaLog.objects.all()
        
        # Estadísticas por estado
        por_estado = logs.values('estado_interno').annotate(
            cantidad=Count('id')
        )
        
        # Total de facturas
        total = logs.count()
        exitosas = logs.filter(estado_interno='aceptada').count()
        fallidas = logs.filter(estado_interno__in=['error', 'rechazada']).count()
        
        return Response({
            'total_facturas': total,
            'exitosas': exitosas,
            'fallidas': fallidas,
            'por_estado': list(por_estado),
            'tasa_exito': round(exitosas / total * 100, 2) if total > 0 else 0
        })
