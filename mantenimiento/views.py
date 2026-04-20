from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import DjangoModelPermissions
from django.db import transaction
from django.utils import timezone

from .models import Equipo, OrdenMantenimiento, Repuesto, DetalleMantenimiento, CostoMantenimiento
from .serializers import EquipoSerializer, OrdenMantenimientoSerializer, RepuestoSerializer, DetalleMantenimientoSerializer, CostoMantenimientoSerializer

class EquipoViewSet(viewsets.ModelViewSet):
    queryset = Equipo.objects.all().order_by('codigo')
    serializer_class = EquipoSerializer
    permission_classes = []  # Sin permisos para desarrollo

class OrdenMantenimientoViewSet(viewsets.ModelViewSet):
    queryset = OrdenMantenimiento.objects.all().order_by('-fecha_creación')
    serializer_class = OrdenMantenimientoSerializer
    permission_classes = []  # Sin permisos para desarrollo

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def iniciar(self, request, pk=None):
        orden = self.get_object()
        if orden.estado != 'planificada':
            return Response({'error': 'Solo órdenes planificadas pueden iniciarse.'}, status=status.HTTP_400_BAD_REQUEST)

        orden.estado = 'en_ejecución'
        orden.fecha_ejecución = timezone.now().date()
        orden.equipo.estado = 'mantenimiento'
        orden.equipo.save()
        orden.save()

        return Response({'status': 'Orden en ejecución y equipo marcado en mantenimiento'})

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def finalizar(self, request, pk=None):
        orden = self.get_object()
        if orden.estado != 'en_ejecución':
            return Response({'error': 'Solo órdenes en ejecución pueden finalizarse.'}, status=status.HTTP_400_BAD_REQUEST)

        horas_reales = request.data.get('horas_reales')
        costo_hora = request.data.get('costo_hora', 30.0)

        if horas_reales is None:
            return Response({'error': 'Debe proveer horas_reales en el payload.'}, status=status.HTTP_400_BAD_REQUEST)

        orden.horas_reales = horas_reales
        monto_mano_obra = float(horas_reales) * float(costo_hora)

        costo_repuestos = 0.0
        for detalle in orden.detalles.all():
            if detalle.repuesto and detalle.repuesto.costo_unitario:
                costo_repuestos += float(detalle.cantidad_usada) * float(detalle.repuesto.costo_unitario)

        costo_total = monto_mano_obra + costo_repuestos
        orden.costo_real = costo_total
        orden.estado = 'completada'
        orden.equipo.estado = 'activo'
        orden.equipo.save()
        orden.save()

        CostoMantenimiento.objects.update_or_create(
            orden=orden,
            defaults={
                'equipo': orden.equipo,
                'costo_mano_obra': monto_mano_obra,
                'costo_repuestos': costo_repuestos,
                'costo_total': costo_total,
            }
        )

        from contabilidad.models import Cuenta, AsientoContable, MovimientoContable

        cuenta_costo_maint, _ = Cuenta.objects.get_or_create(
            codigo='520101',
            defaults={'nombre': 'Costo Mantenimiento', 'tipo': 'gasto', 'nivel': 2}
        )
        cuenta_banco, _ = Cuenta.objects.get_or_create(
            codigo='110101',
            defaults={'nombre': 'Caja/Banco', 'tipo': 'activo', 'nivel': 2}
        )
        cuenta_equipos, _ = Cuenta.objects.get_or_create(
            codigo='170101',
            defaults={'nombre': 'Equipos', 'tipo': 'activo', 'nivel': 2}
        )

        asiento = AsientoContable.objects.create(
            fecha=timezone.now().date(),
            descripcion=f"Costo mantenimiento orden {orden.numero}",
            referencia=f"Mantenimiento:{orden.numero}",
            total_debe=costo_total,
            total_haber=costo_total
        )

        MovimientoContable.objects.create(asiento=asiento, cuenta=cuenta_costo_maint, debe=costo_total, haber=0, descripcion='Costo de mano de obra y repuestos')
        MovimientoContable.objects.create(asiento=asiento, cuenta=cuenta_banco, debe=0, haber=costo_total, descripcion='Pago de mantenimiento')

        return Response({'status': 'Orden completada y costo registrado y contabilizado.', 'costo_total': costo_total})

class RepuestoViewSet(viewsets.ModelViewSet):
    queryset = Repuesto.objects.all().order_by('codigo')
    serializer_class = RepuestoSerializer
    permission_classes = []  # Sin permisos para desarrollo

class DetalleMantenimientoViewSet(viewsets.ModelViewSet):
    queryset = DetalleMantenimiento.objects.all()
    serializer_class = DetalleMantenimientoSerializer
    permission_classes = []  # Sin permisos para desarrollo

class CostoMantenimientoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CostoMantenimiento.objects.all().order_by('-fecha_registro')
    serializer_class = CostoMantenimientoSerializer
    permission_classes = []  # Sin permisos para desarrollo
