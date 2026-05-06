from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from .models import OrdenVenta, DetalleOrdenVenta, FacturaVenta, NotaCredito, DetalleNotaCredito
from .serializers import OrdenVentaSerializer, DetalleOrdenVentaSerializer, FacturaVentaSerializer, NotaCreditoSerializer, DetalleNotaCreditoSerializer

class OrdenVentaViewSet(viewsets.ModelViewSet):
    queryset = OrdenVenta.objects.all()
    serializer_class = OrdenVentaSerializer

class DetalleOrdenVentaViewSet(viewsets.ModelViewSet):
    queryset = DetalleOrdenVenta.objects.all()
    serializer_class = DetalleOrdenVentaSerializer

class FacturaVentaViewSet(viewsets.ModelViewSet):
    queryset = FacturaVenta.objects.all()
    serializer_class = FacturaVentaSerializer

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        factura = self.get_object()
        content = f"""FACTURA DE VENTA
        Numero: {factura.numero_factura}
        Fecha: {factura.fecha_emision}
        Total: ${factura.total}
        Estado: {factura.estado}
        Orden: {factura.orden_venta.id if factura.orden_venta else 'N/A'}
        """
        response = HttpResponse(content, content_type='text/plain')
        response['Content-Disposition'] = f'attachment; filename="factura_{factura.numero_factura}.txt"'
        return response

    @action(detail=True, methods=['get'])
    def xml(self, request, pk=None):
        factura = self.get_object()
        xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<Factura>
    <Numero>{factura.numero_factura}</Numero>
    <Fecha>{factura.fecha_emision}</Fecha>
    <Total>{factura.total}</Total>
    <Estado>{factura.estado}</Estado>
</Factura>"""
        response = HttpResponse(xml_content, content_type='application/xml')
        response['Content-Disposition'] = f'attachment; filename="factura_{factura.numero_factura}.xml"'
        return response


class NotaCreditoViewSet(viewsets.ModelViewSet):
    queryset = NotaCredito.objects.all()
    serializer_class = NotaCreditoSerializer
    
    @action(detail=True, methods=['post'])
    def enviar_dian(self, request, pk=None):
        nota_credito = self.get_object()
        nota_credito.estado = 'enviada'
        nota_credito.save()
        return Response({'status': 'Nota de crédito enviada a DIAN'})
    
    @action(detail=True, methods=['post'])
    def aprobar(self, request, pk=None):
        nota_credito = self.get_object()
        nota_credito.estado = 'aprobada'
        nota_credito.save()
        return Response({'status': 'Nota de crédito aprobada'})


class DetalleNotaCreditoViewSet(viewsets.ModelViewSet):
    queryset = DetalleNotaCredito.objects.all()
    serializer_class = DetalleNotaCreditoSerializer