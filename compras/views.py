from rest_framework import viewsets, permissions, status
from erp_core.permissions import IsComprasUser
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Sum, Count, F
from django.utils import timezone

from .models import (
    Proveedor, SolicitudCompra, DetalleSolicitudCompra,
    OrdenCompra, DetalleOrdenCompra,
    RecepcionCompra, DetalleRecepcion,
    PagoCompra, Contrato, ProductoProveedor,
)
from .serializers import (
    ProveedorSerializer, ProveedorListSerializer,
    SolicitudCompraSerializer, DetalleSolicitudCompraSerializer,
    OrdenCompraSerializer, OrdenCompraListSerializer, DetalleOrdenCompraSerializer,
    RecepcionCompraSerializer, DetalleRecepcionSerializer,
    PagoCompraSerializer, ContratoSerializer, ProductoProveedorSerializer,
)


class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all().order_by('razon_social')
    serializer_class = ProveedorSerializer
    permission_classes = [IsComprasUser]

    def get_serializer_class(self):
        if self.action == 'list':
            return ProveedorListSerializer
        return ProveedorSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(razon_social__icontains=search) |
                Q(nit__icontains=search) |
                Q(nombre_comercial__icontains=search) |
                Q(contacto_nombre__icontains=search)
            )

        categoria = self.request.query_params.get('categoria')
        if categoria:
            qs = qs.filter(categoria=categoria)

        estado = self.request.query_params.get('estado')
        if estado:
            qs = qs.filter(estado=estado)

        return qs

    @action(detail=False, methods=['get'])
    def resumen(self, request):
        """Dashboard de proveedores"""
        total = Proveedor.objects.count()
        activos = Proveedor.objects.filter(estado='activo').count()
        por_categoria = list(
            Proveedor.objects.values('categoria')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        # Top 5 proveedores por compras
        top_proveedores = list(
            Proveedor.objects.filter(estado='activo')
            .annotate(
                total_compras=Sum('ordencompra__total')
            )
            .order_by('-total_compras')
            .values('id', 'razon_social', 'nit', 'total_compras')[:5]
        )

        return Response({
            'total_proveedores': total,
            'proveedores_activos': activos,
            'por_categoria': por_categoria,
            'top_proveedores': top_proveedores,
        })

    @action(detail=True, methods=['get'])
    def historial(self, request, pk=None):
        """Historial de órdenes de un proveedor"""
        proveedor = self.get_object()
        ordenes = OrdenCompra.objects.filter(proveedor=proveedor).order_by('-fecha_emision')
        serializer = OrdenCompraListSerializer(ordenes, many=True)
        return Response(serializer.data)


class SolicitudCompraViewSet(viewsets.ModelViewSet):
    queryset = SolicitudCompra.objects.prefetch_related('detalles').all()
    serializer_class = SolicitudCompraSerializer
    permission_classes = [IsComprasUser]

    def get_queryset(self):
        qs = super().get_queryset()

        estado = self.request.query_params.get('estado')
        if estado:
            qs = qs.filter(estado=estado)

        prioridad = self.request.query_params.get('prioridad')
        if prioridad:
            qs = qs.filter(prioridad=prioridad)

        origen = self.request.query_params.get('origen')
        if origen:
            qs = qs.filter(origen=origen)

        return qs

    @action(detail=True, methods=['post'])
    def aprobar(self, request, pk=None):
        """Aprueba la solicitud de compra"""
        solicitud = self.get_object()
        if solicitud.estado != 'pendiente':
            return Response(
                {'error': 'Solo se pueden aprobar solicitudes pendientes'},
                status=status.HTTP_400_BAD_REQUEST
            )
        solicitud.estado = 'aprobada'
        solicitud.aprobado_por = request.data.get('aprobado_por', 'Sistema')
        solicitud.fecha_aprobacion = timezone.now()
        solicitud.save(update_fields=['estado', 'aprobado_por', 'fecha_aprobacion'])
        return Response({'status': 'Solicitud aprobada'})

    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        """Rechaza la solicitud de compra"""
        solicitud = self.get_object()
        solicitud.estado = 'rechazada'
        solicitud.notas = request.data.get('motivo', '')
        solicitud.save(update_fields=['estado', 'notas'])
        return Response({'status': 'Solicitud rechazada'})

    @action(detail=True, methods=['post'])
    def convertir_a_oc(self, request, pk=None):
        """Convierte solicitud aprobada en orden de compra"""
        solicitud = self.get_object()
        if solicitud.estado != 'aprobada':
            return Response(
                {'error': 'Solo se pueden convertir solicitudes aprobadas'},
                status=status.HTTP_400_BAD_REQUEST
            )

        proveedor_id = request.data.get('proveedor_id')
        if not proveedor_id:
            return Response(
                {'error': 'Debe indicar un proveedor'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            proveedor = Proveedor.objects.get(pk=proveedor_id)
        except Proveedor.DoesNotExist:
            return Response(
                {'error': 'Proveedor no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Crear la OC
        orden = OrdenCompra.objects.create(
            proveedor=proveedor,
            condicion_pago=proveedor.condicion_pago,
            observaciones=f"Generada desde solicitud SC-{solicitud.numero}",
        )

        # Crear detalles
        for det in solicitud.detalles.all():
            cantidad = det.cantidad_aprobada or det.cantidad_solicitada
            DetalleOrdenCompra.objects.create(
                orden=orden,
                producto=det.producto,
                cantidad=cantidad,
                precio_unitario=det.producto.precio_compra,
            )

        # Recalcular totales
        orden.recalcular_totales()

        # Actualizar solicitud
        solicitud.estado = 'convertida'
        solicitud.orden_compra = orden
        solicitud.save(update_fields=['estado', 'orden_compra'])

        return Response({
            'status': 'Orden de compra creada',
            'orden_id': orden.id,
            'numero': orden.numero,
        })


class DetalleSolicitudCompraViewSet(viewsets.ModelViewSet):
    queryset = DetalleSolicitudCompra.objects.select_related('producto', 'proveedor_sugerido').all()
    serializer_class = DetalleSolicitudCompraSerializer
    permission_classes = [IsComprasUser]


class OrdenCompraViewSet(viewsets.ModelViewSet):
    queryset = OrdenCompra.objects.select_related('proveedor').prefetch_related('detalles').all()
    serializer_class = OrdenCompraSerializer
    permission_classes = [IsComprasUser]

    def get_serializer_class(self):
        if self.action == 'list':
            return OrdenCompraListSerializer
        return OrdenCompraSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(numero__icontains=search) |
                Q(proveedor__razon_social__icontains=search)
            )

        estado = self.request.query_params.get('estado')
        if estado:
            qs = qs.filter(estado=estado)

        proveedor = self.request.query_params.get('proveedor')
        if proveedor:
            qs = qs.filter(proveedor_id=proveedor)

        fecha_desde = self.request.query_params.get('fecha_desde')
        fecha_hasta = self.request.query_params.get('fecha_hasta')
        if fecha_desde:
            qs = qs.filter(fecha_emision__gte=fecha_desde)
        if fecha_hasta:
            qs = qs.filter(fecha_emision__lte=fecha_hasta)

        return qs

    @action(detail=True, methods=['post'])
    def recalcular(self, request, pk=None):
        """Recalcula subtotal, IVA y total"""
        orden = self.get_object()
        orden.recalcular_totales()
        return Response({'status': 'Totales recalculados', 'total': float(orden.total)})

    @action(detail=False, methods=['get'])
    def resumen(self, request):
        """Dashboard de compras"""
        hoy = timezone.now().date()
        mes_actual = hoy.replace(day=1)

        total_oc = OrdenCompra.objects.count()
        oc_abiertas = OrdenCompra.objects.filter(
            estado__in=['borrador', 'enviada', 'confirmada', 'recibida_parcial']
        ).count()
        total_mes = OrdenCompra.objects.filter(
            fecha_emision__gte=mes_actual
        ).aggregate(total=Sum('total'))['total'] or 0

        saldo_pendiente = 0
        for oc in OrdenCompra.objects.filter(estado__in=['enviada', 'confirmada', 'recibida_parcial', 'completada']):
            saldo_pendiente += oc.saldo_por_pagar

        por_estado = list(
            OrdenCompra.objects.values('estado')
            .annotate(count=Count('id'), total=Sum('total'))
            .order_by('estado')
        )

        return Response({
            'total_ordenes': total_oc,
            'ordenes_abiertas': oc_abiertas,
            'compras_mes_actual': float(total_mes),
            'saldo_pendiente_pago': float(saldo_pendiente),
            'por_estado': por_estado,
        })


class DetalleOrdenCompraViewSet(viewsets.ModelViewSet):
    queryset = DetalleOrdenCompra.objects.select_related('producto').all()
    serializer_class = DetalleOrdenCompraSerializer
    permission_classes = [IsComprasUser]

    def perform_create(self, serializer):
        detalle = serializer.save()
        detalle.orden.recalcular_totales()

    def perform_update(self, serializer):
        detalle = serializer.save()
        detalle.orden.recalcular_totales()


class RecepcionCompraViewSet(viewsets.ModelViewSet):
    queryset = RecepcionCompra.objects.select_related('orden').prefetch_related('detalles_recepcion').all()
    serializer_class = RecepcionCompraSerializer
    permission_classes = [IsComprasUser]

    def get_queryset(self):
        qs = super().get_queryset()
        orden = self.request.query_params.get('orden')
        if orden:
            qs = qs.filter(orden_id=orden)
        return qs


class DetalleRecepcionViewSet(viewsets.ModelViewSet):
    queryset = DetalleRecepcion.objects.select_related('recepcion', 'detalle_orden').all()
    serializer_class = DetalleRecepcionSerializer
    permission_classes = [IsComprasUser]


class PagoCompraViewSet(viewsets.ModelViewSet):
    queryset = PagoCompra.objects.select_related('orden').all().order_by('-fecha')
    serializer_class = PagoCompraSerializer
    permission_classes = [IsComprasUser]

    def get_queryset(self):
        qs = super().get_queryset()
        orden = self.request.query_params.get('orden')
        if orden:
            qs = qs.filter(orden_id=orden)
        return qs


class ContratoViewSet(viewsets.ModelViewSet):
    queryset = Contrato.objects.select_related('proveedor').all()
    serializer_class = ContratoSerializer
    permission_classes = [IsComprasUser]

    def get_queryset(self):
        qs = super().get_queryset()

        proveedor = self.request.query_params.get('proveedor')
        if proveedor:
            qs = qs.filter(proveedor_id=proveedor)

        estado = self.request.query_params.get('estado')
        if estado:
            qs = qs.filter(estado=estado)

        vigente = self.request.query_params.get('vigente')
        if vigente and vigente.lower() == 'true':
            qs = qs.filter(
                estado='activo',
                fecha_fin__gte=timezone.now().date()
            )

        return qs


class ProductoProveedorViewSet(viewsets.ModelViewSet):
    queryset = ProductoProveedor.objects.all().select_related('producto', 'proveedor')
    serializer_class = ProductoProveedorSerializer
    permission_classes = [IsComprasUser]

    def get_queryset(self):
        qs = super().get_queryset()
        proveedor_id = self.request.query_params.get('proveedor')
        producto_id = self.request.query_params.get('producto')
        if proveedor_id:
            qs = qs.filter(proveedor_id=proveedor_id)
        if producto_id:
            qs = qs.filter(producto_id=producto_id)
        return qs
