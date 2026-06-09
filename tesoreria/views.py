from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.core.exceptions import ValidationError
from datetime import datetime, timedelta, date
from decimal import Decimal

from .models import (
    CuentaBancaria, MovimientoTesoreria, ConciliacionBancaria,
    Cheque, ProyeccionFlujoCaja, IndicadorTesoreria, RegistroIndicador
)
from .serializers import (
    CuentaBancariaSerializer, CuentaBancariaDetailSerializer,
    MovimientoTesoreriaSerializer, ConciliacionBancariaSerializer,
    ConciliacionBancariaDetailSerializer, ChequeSerializer,
    ProyeccionFlujoCajaSerializer, IndicadorTesoreriaSerializer,
    RegistroIndicadorSerializer
)
from .services import (
    GestionFlujoCaja, ServicioConciliacionBancaria,
    ServicioProyeccionFlujoCaja, ServicioIndicadores,
    ValidacionTesoreria
)


# ═══════════════════════════════════════════════════════
# PAGINACIÓN
# ═══════════════════════════════════════════════════════

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100


# ═══════════════════════════════════════════════════════
# VIEWSETS
# ═══════════════════════════════════════════════════════

class CuentaBancariaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de cuentas bancarias
    """
    queryset = CuentaBancaria.objects.all()
    serializer_class = CuentaBancariaSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['banco', 'tipo_cuenta', 'activa']
    search_fields = ['numero_cuenta', 'titulares', 'banco']
    ordering_fields = ['fecha_creacion', 'saldo_sistema', 'banco']
    ordering = ['-fecha_creacion']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CuentaBancariaDetailSerializer
        return CuentaBancariaSerializer

    @action(detail=True, methods=['post'])
    def actualizar_saldo(self, request, pk=None):
        """Actualiza el saldo del sistema de la cuenta"""
        cuenta = self.get_object()
        saldo_nuevo = cuenta.actualizar_saldo_sistema()
        cuenta.save()
        
        return Response({
            'numero_cuenta': cuenta.numero_cuenta,
            'saldo_sistema': float(saldo_nuevo),
            'saldo_banco': float(cuenta.saldo_banco),
            'diferencia': float(cuenta.get_diferencia_conciliacion())
        })

    @action(detail=True, methods=['get'])
    def estado_cuenta(self, request, pk=None):
        """Obtiene estado completo de la cuenta"""
        cuenta = self.get_object()
        hace_30_dias = date.today() - timedelta(days=30)
        
        movimientos_mes = cuenta.movimientos.filter(
            fecha__gte=hace_30_dias,
            estado='confirmado'
        )
        
        ingresos = movimientos_mes.filter(tipo='ingreso').aggregate(models.Sum('monto'))['monto__sum'] or Decimal('0.00')
        egresos = movimientos_mes.filter(tipo='egreso').aggregate(models.Sum('monto'))['monto__sum'] or Decimal('0.00')
        
        return Response({
            'numero_cuenta': cuenta.numero_cuenta,
            'banco': cuenta.banco,
            'saldo_actual': float(cuenta.saldo_sistema),
            'saldo_banco': float(cuenta.saldo_banco),
            'diferencia': float(cuenta.get_diferencia_conciliacion()),
            'ingresos_mes': float(ingresos),
            'egresos_mes': float(egresos),
            'movimientos_mes': movimientos_mes.count(),
            'activa': cuenta.activa
        })


class MovimientoTesoreriaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de movimientos de tesorería
    """
    queryset = MovimientoTesoreria.objects.all()
    serializer_class = MovimientoTesoreriaSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['cuenta_banco', 'tipo', 'estado', 'conciliado']
    search_fields = ['numero_movimiento', 'concepto', 'tercero_nombre']
    ordering_fields = ['fecha', 'monto', 'fecha_creacion']
    ordering = ['-fecha', '-fecha_creacion']

    def create(self, request, *args, **kwargs):
        """Registra un nuevo movimiento"""
        try:
            movimiento = GestionFlujoCaja.registrar_movimiento(
                cuenta_banco_id=request.data.get('cuenta_banco'),
                fecha=datetime.strptime(request.data.get('fecha'), '%Y-%m-%d').date(),
                tipo=request.data.get('tipo'),
                concepto=request.data.get('concepto'),
                monto=Decimal(request.data.get('monto')),
                referencia_bancaria=request.data.get('referencia_bancaria', ''),
                tercero_nombre=request.data.get('tercero_nombre', ''),
                tercero_nit=request.data.get('tercero_nit', ''),
                documento_origen=request.data.get('documento_origen', ''),
                usuario=request.user
            )
            
            serializer = self.get_serializer(movimiento)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        """Guardar con usuario actual"""
        serializer.save(usuario_creador=self.request.user)

    @action(detail=True, methods=['post'])
    def confirmar(self, request, pk=None):
        """Confirma un movimiento"""
        movimiento = self.get_object()
        
        if movimiento.estado != 'pendiente':
            return Response(
                {'error': 'Solo se pueden confirmar movimientos pendientes'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                movimiento = GestionFlujoCaja.confirmar_movimiento(movimiento, request.user)
            
            return Response(
                MovimientoTesoreriaSerializer(movimiento).data,
                status=status.HTTP_200_OK
            )
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def registrar_lote(self, request):
        """Registra múltiples movimientos a la vez"""
        movimientos = []
        errores = []
        
        for item in request.data:
            try:
                movimiento = GestionFlujoCaja.registrar_movimiento(
                    cuenta_banco_id=item.get('cuenta_banco'),
                    fecha=datetime.strptime(item.get('fecha'), '%Y-%m-%d').date(),
                    tipo=item.get('tipo'),
                    concepto=item.get('concepto'),
                    monto=Decimal(item.get('monto')),
                    usuario=request.user
                )
                movimientos.append(movimiento)
            except ValidationError as e:
                errores.append({'item': item, 'error': str(e)})
        
        return Response({
            'movimientos_creados': len(movimientos),
            'errores': errores,
            'data': MovimientoTesoreriaSerializer(movimientos, many=True).data
        })


class ConciliacionBancariaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de conciliaciones bancarias
    """
    queryset = ConciliacionBancaria.objects.all()
    serializer_class = ConciliacionBancariaSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['cuenta_banco', 'estado', 'conciliada']
    ordering_fields = ['fecha_fin', 'fecha_creacion']
    ordering = ['-fecha_fin']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ConciliacionBancariaDetailSerializer
        return ConciliacionBancariaSerializer

    @action(detail=True, methods=['post'])
    def completar(self, request, pk=None):
        """Completa la conciliación"""
        conciliacion = self.get_object()
        
        if conciliacion.estado != 'en_proceso':
            return Response(
                {'error': 'La conciliación ya está completada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            saldo_final_banco = Decimal(request.data.get('saldo_final_banco'))
            
            # Calcular totales
            ServicioConciliacionBancaria.calcular_totales_periodo(conciliacion)
            
            # Completar
            conciliacion = ServicioConciliacionBancaria.completar_conciliacion(
                conciliacion,
                saldo_final_banco,
                request.user
            )
            
            return Response(
                ConciliacionBancariaDetailSerializer(conciliacion).data,
                status=status.HTTP_200_OK
            )
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def crear_mensual(self, request):
        """Crea conciliación mensual automática"""
        try:
            fecha_fin = date.today()
            fecha_inicio = date(fecha_fin.year, fecha_fin.month, 1)
            
            saldo_inicial_banco = Decimal(request.data.get('saldo_inicial_banco', 0))
            
            conciliacion = ServicioConciliacionBancaria.crear_conciliacion(
                cuenta_banco_id=request.data.get('cuenta_banco'),
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
                saldo_inicial_banco=saldo_inicial_banco,
                usuario=request.user
            )
            
            return Response(
                ConciliacionBancariaSerializer(conciliacion).data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ChequeViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de cheques
    """
    queryset = Cheque.objects.all()
    serializer_class = ChequeSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['cuenta_banco', 'tipo', 'estado']
    search_fields = ['numero_cheque', 'beneficiario', 'concepto']
    ordering_fields = ['fecha_emision', 'monto']
    ordering = ['-fecha_emision']


class ProyeccionFlujoCajaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para proyecciones de flujo de caja
    """
    queryset = ProyeccionFlujoCaja.objects.all()
    serializer_class = ProyeccionFlujoCajaSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['cuenta_banco', 'escenario']
    ordering_fields = ['fecha_fin', 'saldo_final_proyectado']
    ordering = ['-fecha_inicio']

    @action(detail=False, methods=['post'])
    def crear_proyeccion(self, request):
        """Crea proyección de flujo de caja"""
        try:
            fecha_inicio = date.today()
            fecha_fin = fecha_inicio + timedelta(days=int(request.data.get('dias', 30)))
            
            proyeccion = ServicioProyeccionFlujoCaja.crear_proyeccion(
                cuenta_banco_id=request.data.get('cuenta_banco'),
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
                escenario=request.data.get('escenario', 'conservador'),
                usuario=request.user
            )
            
            # Calcular proyecciones
            proyeccion = ServicioProyeccionFlujoCaja.proyectar_flujos(proyeccion)
            
            return Response(
                ProyeccionFlujoCajaSerializer(proyeccion).data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class IndicadorTesoreriaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet (solo lectura) para indicadores de tesorería
    """
    queryset = IndicadorTesoreria.objects.filter(activo=True)
    serializer_class = IndicadorTesoreriaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'codigo', 'tipo']


class RegistroIndicadorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet (solo lectura) para registros de indicadores
    """
    queryset = RegistroIndicador.objects.all()
    serializer_class = RegistroIndicadorSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['indicador', 'estado', 'fecha']
    ordering_fields = ['fecha', 'valor_real']
    ordering = ['-fecha']
