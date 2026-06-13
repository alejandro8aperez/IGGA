from rest_framework import viewsets, status
from erp_core.permissions import IsInventarioUser
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Sum, F, Count
from django.utils import timezone

from .models import (
    Categoria, Almacen, Producto, Lote,
    MovimientoInventario, AlertaInventario,
    ConteoFisico, DetalleConteoFisico, UnidadMedida
)
from .serializers import (
    CategoriaSerializer, AlmacenSerializer,
    ProductoSerializer, ProductoListSerializer, LoteSerializer,
    MovimientoInventarioSerializer, AlertaInventarioSerializer,
    ConteoFisicoSerializer, DetalleConteoFisicoSerializer,
    UnidadMedidaSerializer
)


class UnidadMedidaViewSet(viewsets.ModelViewSet):
    queryset = UnidadMedida.objects.all()
    serializer_class = UnidadMedidaSerializer
    permission_classes = [IsInventarioUser]


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsInventarioUser]


class AlmacenViewSet(viewsets.ModelViewSet):
    queryset = Almacen.objects.all()
    serializer_class = AlmacenSerializer
    permission_classes = [IsInventarioUser]


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.select_related('categoria', 'almacen').all()
    serializer_class = ProductoSerializer
    permission_classes = [IsInventarioUser]

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductoListSerializer
        return ProductoSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        # Filtro por categoría
        categoria = self.request.query_params.get('categoria')
        if categoria:
            qs = qs.filter(categoria_id=categoria)

        # Filtro por tipo de producto
        tipo = self.request.query_params.get('tipo')
        if tipo:
            qs = qs.filter(tipo_producto=tipo)

        # Filtro por almacén
        almacen = self.request.query_params.get('almacen')
        if almacen:
            qs = qs.filter(almacen_id=almacen)

        # Filtro: solo activos (por defecto)
        activo = self.request.query_params.get('activo')
        if activo is not None:
            qs = qs.filter(activo=activo.lower() == 'true')

        # Filtro: stock bajo
        stock_bajo = self.request.query_params.get('stock_bajo')
        if stock_bajo and stock_bajo.lower() == 'true':
            qs = qs.filter(stock_actual__lt=F('stock_minimo'))

        # Búsqueda
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(nombre__icontains=search) |
                Q(codigo_sku__icontains=search) |
                Q(marca__icontains=search) |
                Q(referencia_fabrica__icontains=search)
            )

        return qs

    def destroy(self, request, *args, **kwargs):
        from django.db.models import ProtectedError
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            # Si no se puede borrar, lo desactivamos automáticamente
            instance = self.get_object()
            instance.activo = False
            instance.nombre = f"[OBSOLETO] {instance.nombre}"
            instance.save(update_fields=['activo', 'nombre'])
            return Response(
                {"detail": "El producto tiene historial y no puede borrarse definitivamente. Ha sido marcado como INACTIVO y archivado automáticamente."},
                status=status.HTTP_200_OK
            )

    @action(detail=False, methods=['get'])
    def stock_bajo(self, request):
        """Productos con stock por debajo del mínimo"""
        productos = self.get_queryset().filter(
            stock_actual__lt=F('stock_minimo'), activo=True
        )
        serializer = ProductoListSerializer(productos, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def resumen(self, request):
        """Resumen general del inventario"""
        qs = Producto.objects.filter(activo=True)
        total_productos = qs.count()
        total_stock_bajo = qs.filter(stock_actual__lt=F('stock_minimo')).count()
        total_agotados = qs.filter(stock_actual__lte=0).count()
        valor_inventario = qs.aggregate(
            total=Sum(F('stock_actual') * F('precio_compra'))
        )['total'] or 0

        # Distribución por tipo
        por_tipo = list(
            qs.values('tipo_producto')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Alertas activas
        alertas_activas = AlertaInventario.objects.filter(estado='activa').count()

        return Response({
            'total_productos': total_productos,
            'total_stock_bajo': total_stock_bajo,
            'total_agotados': total_agotados,
            'valor_inventario_total': float(valor_inventario),
            'alertas_activas': alertas_activas,
            'distribucion_por_tipo': por_tipo,
        })

    @action(detail=True, methods=['get'])
    def historial(self, request, pk=None):
        """Historial de movimientos de un producto específico"""
        producto = self.get_object()
        movimientos = MovimientoInventario.objects.filter(producto=producto)[:50]
        serializer = MovimientoInventarioSerializer(movimientos, many=True)
        return Response(serializer.data)


class LoteViewSet(viewsets.ModelViewSet):
    queryset = Lote.objects.select_related('producto').all()
    serializer_class = LoteSerializer
    permission_classes = [IsInventarioUser]

    def get_queryset(self):
        qs = super().get_queryset()

        producto = self.request.query_params.get('producto')
        if producto:
            qs = qs.filter(producto_id=producto)

        estado = self.request.query_params.get('estado')
        if estado:
            qs = qs.filter(estado=estado)

        return qs

    @action(detail=False, methods=['get'])
    def por_vencer(self, request):
        """Lotes próximos a vencer en los próximos 30 días"""
        dias = int(request.query_params.get('dias', 30))
        fecha_limite = timezone.now().date() + timezone.timedelta(days=dias)
        lotes = self.get_queryset().filter(
            fecha_vencimiento__lte=fecha_limite,
            fecha_vencimiento__gte=timezone.now().date(),
            estado='disponible',
        )
        serializer = self.get_serializer(lotes, many=True)
        return Response(serializer.data)


class MovimientoInventarioViewSet(viewsets.ModelViewSet):
    """
    Los movimientos son registros de auditoría inmutables.
    Solo se permiten GET (list/retrieve) y POST (create).
    PUT, PATCH y DELETE están bloqueados: modificarlos rompería
    la integridad del stock sin revertir stock_actual.
    """
    queryset = MovimientoInventario.objects.select_related(
        'producto', 'almacen', 'lote'
    ).all().order_by('-fecha')
    serializer_class = MovimientoInventarioSerializer
    permission_classes = [IsInventarioUser]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        qs = super().get_queryset()

        producto = self.request.query_params.get('producto')
        if producto:
            qs = qs.filter(producto_id=producto)

        tipo = self.request.query_params.get('tipo')
        if tipo:
            qs = qs.filter(tipo=tipo)

        origen = self.request.query_params.get('origen')
        if origen:
            qs = qs.filter(origen=origen)

        # Filtro por rango de fechas
        fecha_desde = self.request.query_params.get('fecha_desde')
        fecha_hasta = self.request.query_params.get('fecha_hasta')
        if fecha_desde:
            qs = qs.filter(fecha__date__gte=fecha_desde)
        if fecha_hasta:
            qs = qs.filter(fecha__date__lte=fecha_hasta)

        return qs


class AlertaInventarioViewSet(viewsets.ModelViewSet):
    queryset = AlertaInventario.objects.select_related('producto').all()
    serializer_class = AlertaInventarioSerializer
    permission_classes = [IsInventarioUser]

    def get_queryset(self):
        qs = super().get_queryset()

        estado = self.request.query_params.get('estado')
        if estado:
            qs = qs.filter(estado=estado)
        elif self.action == 'list':
            # En listados, por defecto solo alertas activas.
            # En detail/resolver/ignorar se necesita acceder a cualquier estado.
            qs = qs.filter(estado='activa')

        tipo = self.request.query_params.get('tipo')
        if tipo:
            qs = qs.filter(tipo=tipo)

        return qs

    @action(detail=True, methods=['post'])
    def resolver(self, request, pk=None):
        """Marca una alerta como resuelta"""
        alerta = self.get_object()
        alerta.resolver()
        return Response({'status': 'Alerta resuelta'})

    @action(detail=True, methods=['post'])
    def ignorar(self, request, pk=None):
        """Marca una alerta como ignorada"""
        alerta = self.get_object()
        alerta.estado = 'ignorada'
        alerta.save(update_fields=['estado'])
        return Response({'status': 'Alerta ignorada'})


class ConteoFisicoViewSet(viewsets.ModelViewSet):
    queryset = ConteoFisico.objects.select_related('almacen').prefetch_related('detalles').all()
    serializer_class = ConteoFisicoSerializer
    permission_classes = [IsInventarioUser]

    @action(detail=True, methods=['post'])
    def aplicar_ajustes(self, request, pk=None):
        """Aplica todos los ajustes del conteo físico"""
        from django.db import transaction
        conteo = self.get_object()
        ajustes = 0

        with transaction.atomic():
            for detalle in conteo.detalles.filter(ajustado=False):
                detalle.calcular_diferencia()
                # Persistir la diferencia calculada antes de aplicar el ajuste
                detalle.save(update_fields=['diferencia'])
                if detalle.diferencia and detalle.diferencia != 0:
                    detalle.aplicar_ajuste()
                    ajustes += 1

            conteo.estado = 'aprobado'
            conteo.save(update_fields=['estado'])

        return Response({
            'status': 'Ajustes aplicados',
            'total_ajustes': ajustes
        })


class DetalleConteoFisicoViewSet(viewsets.ModelViewSet):
    queryset = DetalleConteoFisico.objects.select_related('producto', 'conteo').all()
    serializer_class = DetalleConteoFisicoSerializer
    permission_classes = [IsInventarioUser]
