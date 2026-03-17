from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Receta, InsumoReceta, OrdenProduccion
from .serializers import RecetaSerializer, InsumoRecetaSerializer, OrdenProduccionSerializer

class RecetaViewSet(viewsets.ModelViewSet):
    queryset = Receta.objects.all()
    serializer_class = RecetaSerializer

class InsumoRecetaViewSet(viewsets.ModelViewSet):
    queryset = InsumoReceta.objects.all()
    serializer_class = InsumoRecetaSerializer

class OrdenProduccionViewSet(viewsets.ModelViewSet):
    queryset = OrdenProduccion.objects.all()
    serializer_class = OrdenProduccionSerializer

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
        
        # Sumar el producto terminado al inventario
        producto_terminado = orden.receta.producto_terminado
        producto_terminado.stock_actual += orden.cantidad_a_producir
        producto_terminado.save()
        
        orden.estado = 'terminada'
        orden.save()
        return Response({'status': 'Orden terminada. Productos añadidos al inventario.'})
