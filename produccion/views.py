from rest_framework import viewsets, status, permissions
from erp_core.permissions import IsProduccionUser
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Sum, Count, Q
from django.utils import timezone

from inventarios.models import MovimientoInventario

from .models import (
    Receta, InsumoReceta, OrdenProduccion, FaseOrdenProduccion,
    ConsumoProduccion, MermaProduccion, CostoProduccion
)
from .serializers import (
    RecetaSerializer, InsumoRecetaSerializer,
    OrdenProduccionSerializer, OrdenProduccionListSerializer,
    FaseOrdenProduccionSerializer, ConsumoProduccionSerializer,
    MermaProduccionSerializer, CostoProduccionSerializer
)


class RecetaViewSet(viewsets.ModelViewSet):
    queryset = Receta.objects.select_related('producto_terminado').prefetch_related('insumos').all()
    serializer_class = RecetaSerializer
    permission_classes = [IsProduccionUser]


class InsumoRecetaViewSet(viewsets.ModelViewSet):
    queryset = InsumoReceta.objects.select_related('producto_materia_prima', 'receta').all()
    serializer_class = InsumoRecetaSerializer
    permission_classes = [IsProduccionUser]


class OrdenProduccionViewSet(viewsets.ModelViewSet):
    queryset = OrdenProduccion.objects.select_related('receta__producto_terminado').prefetch_related(
        'fases', 'consumos', 'mermas'
    ).all().order_by('-fecha_creacion')
    serializer_class = OrdenProduccionSerializer
    permission_classes = [IsProduccionUser]

    def get_serializer_class(self):
        if self.action == 'list':
            return OrdenProduccionListSerializer
        return OrdenProduccionSerializer

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        qs = OrdenProduccion.objects.all()
        total_ordenes = qs.count()
        ordenes_abiertas = qs.filter(estado__in=['planeada', 'en_proceso', 'pausada']).count()
        
        por_estado = list(qs.values('estado').annotate(count=Count('id')))
        
        return Response({
            'total_ordenes': total_ordenes,
            'ordenes_abiertas': ordenes_abiertas,
            'por_estado': por_estado,
        })

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def iniciar(self, request, pk=None):
        orden = self.get_object()
        if orden.estado not in ['borrador', 'planeada']:
            return Response(
                {'error': 'Solo las órdenes borrador o planeadas pueden iniciarse.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generar las fases si no existen basados en la ruta (si hubiera), 
        # pero por ahora generamos fases básicas si está vacía.
        if not orden.fases.exists():
            fases_defaults = ['Preparación', 'Ensamblaje / Bobinado', 'Pruebas / Control Calidad', 'Empaque']
            for i, nombre in enumerate(fases_defaults, start=1):
                FaseOrdenProduccion.objects.create(
                    orden=orden,
                    nombre_fase=nombre,
                    secuencia=i,
                    estado='pendiente'
                )

        orden.estado = 'en_proceso'
        orden.fecha_inicio_real = timezone.now()
        orden.save()
        return Response({'status': 'Orden en proceso. Fases generadas.'})

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def registrar_consumo(self, request, pk=None):
        """Registra el consumo real de material desde el inventario a la producción"""
        orden = self.get_object()
        if orden.estado != 'en_proceso':
            return Response(
                {'error': 'La orden debe estar en proceso para registrar consumos.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        producto_id = request.data.get('producto_id')
        cantidad = float(request.data.get('cantidad', 0))

        if not producto_id or cantidad <= 0:
            return Response(
                {'error': 'Debe proveer un producto_id y una cantidad mayor a 0.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Buscar el producto en la receta para ver si es válido (o permitir extra)
        from inventarios.models import Producto
        try:
            producto = Producto.objects.get(pk=producto_id)
        except Producto.DoesNotExist:
            return Response({'error': 'Producto no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        if producto.stock_actual < cantidad:
            return Response(
                {'error': f'Stock insuficiente. Hay {producto.stock_actual} {producto.unidad_medida}.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Crear el movimiento de inventario (Salida por Producción)
        mov = MovimientoInventario.objects.create(
            producto=producto,
            cantidad=cantidad,
            tipo='produccion',
            origen='produccion',
            motivo=f"Consumo para OP-{orden.numero or orden.id}",
            documento_referencia=f"OP-{orden.numero or orden.id}",
            costo_unitario=producto.precio_compra,
            usuario=request.user.username if request.user.is_authenticated else 'Sistema'
        )

        # Registrar el consumo en la orden
        ConsumoProduccion.objects.create(
            orden=orden,
            producto=producto,
            cantidad_consumida=cantidad,
            registrado_por=request.user.username if request.user.is_authenticated else 'Sistema',
            movimiento_inventario=mov
        )

        return Response({'status': 'Consumo registrado y descontado del inventario.'})

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def registrar_merma(self, request, pk=None):
        """Registra desperdicios de material en la producción"""
        orden = self.get_object()
        if orden.estado != 'en_proceso':
            return Response(
                {'error': 'La orden debe estar en proceso para registrar mermas.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        producto_id = request.data.get('producto_id')
        cantidad = float(request.data.get('cantidad', 0))
        motivo = request.data.get('motivo', 'Merma de producción')

        if not producto_id or cantidad <= 0:
            return Response({'error': 'Datos inválidos.'}, status=status.HTTP_400_BAD_REQUEST)

        from inventarios.models import Producto
        try:
            producto = Producto.objects.get(pk=producto_id)
        except Producto.DoesNotExist:
            return Response({'error': 'Producto no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        if producto.stock_actual < cantidad:
            return Response({'error': 'Stock insuficiente.'}, status=status.HTTP_400_BAD_REQUEST)

        # Salida por Merma
        mov = MovimientoInventario.objects.create(
            producto=producto,
            cantidad=cantidad,
            tipo='merma',
            origen='produccion',
            motivo=motivo,
            documento_referencia=f"OP-{orden.numero or orden.id}",
            costo_unitario=producto.precio_compra,
            usuario=request.user.username if request.user.is_authenticated else 'Sistema'
        )

        MermaProduccion.objects.create(
            orden=orden,
            producto=producto,
            cantidad=cantidad,
            motivo=motivo,
            movimiento_inventario=mov
        )

        return Response({'status': 'Merma registrada.'})

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def finalizar(self, request, pk=None):
        orden = self.get_object()
        if orden.estado != 'en_proceso':
            return Response(
                {'error': 'Solo las órdenes en proceso pueden finalizarse.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cantidad_producida = float(request.data.get('cantidad_producida', orden.cantidad_a_producir))
        
        if cantidad_producida <= 0:
            return Response(
                {'error': 'La cantidad producida debe ser mayor a 0.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calcular costo basado en los CONSUMOS REALES
        costo_materias = 0.0
        for consumo in orden.consumos.all():
            precio = float(consumo.producto.precio_compra)
            costo_materias += float(consumo.cantidad_consumida) * precio

        # Calcular costo de mermas
        costo_mermas = 0.0
        for merma in orden.mermas.all():
            precio = float(merma.producto.precio_compra)
            costo_mermas += float(merma.cantidad) * precio

        # Mano de obra basada en el tiempo real de las fases
        horas_reales = sum(float(fase.horas_reales) for fase in orden.fases.all())
        if horas_reales == 0:
            # Fallback al estimado
            horas_reales = float(orden.receta.tiempo_estimado_horas or 0) * cantidad_producida
            
        costo_mano_obra = horas_reales * 20.0  # (Tasa por hora harcodeada, idealmente viene de config)
        costo_indirecto = float(orden.receta.costo_adicional_fijo or 0) * cantidad_producida
        
        costo_total = costo_materias + costo_mermas + costo_mano_obra + costo_indirecto
        costo_unitario_real = costo_total / cantidad_producida if cantidad_producida > 0 else 0

        CostoProduccion.objects.update_or_create(
            orden=orden,
            defaults={
                'costo_materias_primas': costo_materias,
                'costo_mermas': costo_mermas,
                'costo_mano_obra': costo_mano_obra,
                'costo_indirecto': costo_indirecto,
                'costo_total': costo_total,
                'costo_unitario_real': costo_unitario_real
            }
        )

        # Ingresar el producto terminado al inventario
        producto_terminado = orden.receta.producto_terminado
        MovimientoInventario.objects.create(
            producto=producto_terminado,
            cantidad=cantidad_producida,
            tipo='producto_terminado',
            origen='produccion',
            motivo=f"Entrada por producción terminada OP-{orden.numero or orden.id}",
            documento_referencia=f"OP-{orden.numero or orden.id}",
            costo_unitario=costo_unitario_real,
            usuario=request.user.username if request.user.is_authenticated else 'Sistema'
        )

        try:
            from contabilidad.services import crear_asiento_costo_produccion
            crear_asiento_costo_produccion(
                orden,
                costo_total,
                costo_materias,
                costo_indirecto,
                costo_mano_obra,
            )
        except Exception:
            pass # Si falla contabilidad, no bloqueamos la producción

        orden.cantidad_producida = cantidad_producida
        orden.estado = 'terminada'
        orden.fecha_fin_real = timezone.now()
        orden.notas_calidad = request.data.get('notas_calidad', '')
        orden.save()
        
        return Response({
            'status': 'Orden terminada', 
            'costos': {
                'total': costo_total,
                'unitario': costo_unitario_real
            }
        })


class FaseOrdenProduccionViewSet(viewsets.ModelViewSet):
    queryset = FaseOrdenProduccion.objects.all()
    serializer_class = FaseOrdenProduccionSerializer
    permission_classes = [IsProduccionUser]


class ConsumoProduccionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ConsumoProduccion.objects.all()
    serializer_class = ConsumoProduccionSerializer
    permission_classes = [IsProduccionUser]


class MermaProduccionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MermaProduccion.objects.all()
    serializer_class = MermaProduccionSerializer
    permission_classes = [IsProduccionUser]


class CostoProduccionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CostoProduccion.objects.all().order_by('-fecha_registro')
    serializer_class = CostoProduccionSerializer
    permission_classes = [IsProduccionUser]
