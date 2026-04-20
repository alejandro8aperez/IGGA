from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import DjangoModelPermissions
from django.db import transaction
from .models import Receta, InsumoReceta, OrdenProduccion, CostoProduccion
from .serializers import RecetaSerializer, InsumoRecetaSerializer, OrdenProduccionSerializer, CostoProduccionSerializer

class RecetaViewSet(viewsets.ModelViewSet):
    queryset = Receta.objects.all()
    serializer_class = RecetaSerializer
    permission_classes = [DjangoModelPermissions]

class InsumoRecetaViewSet(viewsets.ModelViewSet):
    queryset = InsumoReceta.objects.all()
    serializer_class = InsumoRecetaSerializer
    permission_classes = [DjangoModelPermissions]

class OrdenProduccionViewSet(viewsets.ModelViewSet):
    queryset = OrdenProduccion.objects.all()
    serializer_class = OrdenProduccionSerializer
    permission_classes = [DjangoModelPermissions]

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def iniciar(self, request, pk=None):
        orden = self.get_object()
        if orden.estado != 'planeada':
            return Response({'error': 'Solo las órdenes planeadas pueden iniciarse.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar y descontar stock de insumos
        insumos = orden.receta.insumos.all()
        for insumo in insumos:
            cantidad_total_necesaria = insumo.cantidad_requerida * orden.cantidad_a_producir
            producto = insumo.producto_materia_prima
            
            if producto.stock_actual < cantidad_total_necesaria:
                return Response({'error': f'Stock insuficiente de {producto.nombre}. Se requieren {cantidad_total_necesaria}, hay {producto.stock_actual}.'}, status=status.HTTP_400_BAD_REQUEST)
            
            producto.stock_actual -= cantidad_total_necesaria
            producto.save()
            
        orden.estado = 'en_proceso'
        orden.save()
        return Response({'status': 'Orden en proceso. Insumos descontados del inventario.'})

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def finalizar(self, request, pk=None):
        orden = self.get_object()
        if orden.estado != 'en_proceso':
            return Response({'error': 'Solo las órdenes en proceso pueden finalizarse.'}, status=status.HTTP_400_BAD_REQUEST)
        
        producto_terminado = orden.receta.producto_terminado
        producto_terminado.stock_actual += orden.cantidad_a_producir
        producto_terminado.save()

        # Calcular costos
        costo_materias = 0.0
        for insumo in orden.receta.insumos.all():
            cantidad_insumo = float(insumo.cantidad_requerida)
            cantidad_orden = float(orden.cantidad_a_producir)
            precio_mp = float(insumo.producto_materia_prima.precio_compra)
            costo_materias += cantidad_insumo * cantidad_orden * precio_mp

        costo_mano_obra = float(orden.receta.tiempo_estimado_horas or 0) * 20.0 * float(orden.cantidad_a_producir)
        costo_indirecto = float(orden.receta.costo_adicional_fijo or 0)
        costo_total = costo_materias + costo_mano_obra + costo_indirecto

        CostoProduccion.objects.create(
            orden=orden,
            costo_materias_primas=costo_materias,
            costo_mano_obra=costo_mano_obra,
            costo_indirecto=costo_indirecto,
            costo_total=costo_total
        )

        from contabilidad.models import Cuenta, AsientoContable, MovimientoContable

        cuenta_inventario_pt, _ = Cuenta.objects.get_or_create(
            codigo='140101',
            defaults={'nombre': 'Inventario producto terminado', 'tipo': 'activo', 'nivel': 2}
        )
        cuenta_inventario_mp, _ = Cuenta.objects.get_or_create(
            codigo='120101',
            defaults={'nombre': 'Inventario materia prima', 'tipo': 'activo', 'nivel': 2}
        )
        cuenta_costo, _ = Cuenta.objects.get_or_create(
            codigo='510101',
            defaults={'nombre': 'Costo de producción', 'tipo': 'gasto', 'nivel': 2}
        )

        asiento = AsientoContable.objects.create(
            fecha=orden.fecha_fin_estimada or orden.fecha_inicio,
            descripcion=f"Costo de producción OC-{orden.id}",
            referencia=f"CostoProduccion:{orden.id}",
            total_debe=costo_total,
            total_haber=costo_total
        )

        MovimientoContable.objects.create(asiento=asiento, cuenta=cuenta_inventario_pt, debe=costo_total, haber=0, descripcion=f"Ingreso de producto terminado OC-{orden.id}")
        MovimientoContable.objects.create(asiento=asiento, cuenta=cuenta_inventario_mp, debe=0, haber=costo_materias, descripcion='Consumo de materia prima')
        MovimientoContable.objects.create(asiento=asiento, cuenta=cuenta_costo, debe=0, haber=(costo_mano_obra + costo_indirecto), descripcion='Costo recurrente y mano de obra')

        orden.estado = 'terminada'
        orden.save()
        return Response({'status': 'Orden terminada. Productos añadidos al inventario y costos contabilizados.'})


class CostoProduccionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CostoProduccion.objects.all().order_by('-fecha_registro')
    serializer_class = CostoProduccionSerializer
