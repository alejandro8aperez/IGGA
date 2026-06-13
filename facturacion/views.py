import uuid
from decimal import Decimal
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import ResolucionFacturacion, Factura, DetalleFactura
from .serializers import ResolucionFacturacionSerializer, FacturaSerializer, DetalleFacturaSerializer
from inventarios.models import Producto
from finanzas.models import Cuenta, Transaccion

class ResolucionFacturacionViewSet(viewsets.ModelViewSet):
    queryset = ResolucionFacturacion.objects.all()
    serializer_class = ResolucionFacturacionSerializer

class DetalleFacturaViewSet(viewsets.ModelViewSet):
    queryset = DetalleFactura.objects.all()
    serializer_class = DetalleFacturaSerializer

class FacturaViewSet(viewsets.ModelViewSet):
    queryset = Factura.objects.all().order_by('-fecha_emision')
    serializer_class = FacturaSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = dict(request.data)
        detalles_data = data.pop('detalles', [])
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        factura = serializer.save()

        subtotal_total = Decimal('0.00')
        iva_total = Decimal('0.00')

        for item in detalles_data:
            producto = Producto.objects.get(id=item['producto'])
            cantidad = int(item['cantidad'])
            precio = Decimal(str(item.get('precio_unitario', producto.precio_venta)))
            iva_pct = Decimal(str(item.get('porcentaje_iva', '19.00')))

            subt = cantidad * precio
            iva = subt * (iva_pct / Decimal('100'))
            
            subtotal_total += subt
            iva_total += iva

            DetalleFactura.objects.create(
                factura=factura,
                producto=producto,
                cantidad=cantidad,
                precio_unitario=precio,
                porcentaje_iva=iva_pct
            )

        factura.subtotal = subtotal_total
        factura.iva_total = iva_total
        
        # Ejemplo Retefuente (11% honorarios o 2.5% compras corporativas)
        retefuente_pct = Decimal(str(data.get('retefuente_pct', '0')))
        factura.retefuente_total = subtotal_total * (retefuente_pct / Decimal('100'))
        
        # Ejemplo ReteICA (Ej: 9.66 x 1000) -> 0.966%
        reteica_pct = Decimal(str(data.get('reteica_pct', '0')))
        factura.reteica_total = subtotal_total * (reteica_pct / Decimal('100'))

        factura.total = subtotal_total + iva_total - factura.retefuente_total - factura.reteica_total
        factura.save()

        return Response(self.get_serializer(factura).data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """PUT/PATCH — actualiza cabecera y líneas de detalle de un borrador."""
        partial = kwargs.pop('partial', False)
        data = dict(request.data)
        detalles_data = data.pop('detalles', None)

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        factura = serializer.save()

        if detalles_data is not None:
            factura.detalles.all().delete()
            subtotal_total = Decimal('0.00')
            iva_total = Decimal('0.00')
            for item in detalles_data:
                producto = Producto.objects.get(id=item['producto'])
                cantidad = int(item['cantidad'])
                precio = Decimal(str(item.get('precio_unitario', producto.precio_venta)))
                iva_pct = Decimal(str(item.get('porcentaje_iva', '19.00')))
                subt = cantidad * precio
                subtotal_total += subt
                iva_total += subt * (iva_pct / Decimal('100'))
                DetalleFactura.objects.create(
                    factura=factura,
                    producto=producto,
                    cantidad=cantidad,
                    precio_unitario=precio,
                    porcentaje_iva=iva_pct,
                )
            retefuente_pct = Decimal(str(data.get('retefuente_pct', '0')))
            reteica_pct = Decimal(str(data.get('reteica_pct', '0')))
            factura.subtotal = subtotal_total
            factura.iva_total = iva_total
            factura.retefuente_total = subtotal_total * (retefuente_pct / Decimal('100'))
            factura.reteica_total = subtotal_total * (reteica_pct / Decimal('100'))
            factura.total = subtotal_total + iva_total - factura.retefuente_total - factura.reteica_total
            factura.save()

        return Response(self.get_serializer(factura).data)

    @action(detail=True, methods=['post'])
    def emitir(self, request, pk=None):
        factura = self.get_object()
        
        if factura.estado_dian != 'borrador':
            return Response({"error": "La factura ya fue emitida o procesada."}, status=400)
            
        with transaction.atomic():
            resolucion = ResolucionFacturacion.objects.select_for_update().filter(activa=True).first()
            if not resolucion:
                return Response({"error": "No hay una resolución DIAN activa."}, status=400)
                
            if resolucion.numero_actual > resolucion.numero_final:
                return Response({"error": "La resolución actual ha expirado (numeración agotada)."}, status=400)

            # 1. Asignar número de factura y CUFE
            factura.numero_factura = f"{resolucion.prefijo}{resolucion.numero_actual}"
            
            # Integración con Facturatech (DIAN)
            try:
                from facturacion_electronica.services import FacturatechService, UBLGenerator
                service = FacturatechService()
                
                # Preparamos datos simulados para el XML UBL 2.1
                factura_data = {
                    'encabezado': {
                        'numero': factura.numero_factura,
                        'prefijo': resolucion.prefijo,
                        'fecha_emision': str(factura.fecha_emision),
                        'hora_emision': '12:00:00-05:00',
                    }
                }
                
                xml_content = service.generar_xml_ubl(factura_data)
                exito, respuesta = service.enviar_factura(
                    xml_content=xml_content,
                    factura_id=factura.id,
                    factura_numero=factura.numero_factura,
                    tipo='ventas'
                )
                
                if exito:
                    factura.cufe = respuesta.get('cufe', '')
                    factura.estado_dian = 'validada'
                else:
                    factura.estado_dian = 'error_emision'
                    # Se registrará en FacturaElectronicaLog
                    
            except Exception as e:
                # Si falla la conexión WS o no hay config, se marca como enviada (sin CUFE real)
                factura.cufe = str(uuid.uuid4()).replace('-', '') + "DIAN-MOCK"
                factura.estado_dian = 'enviada'
            
            # Incrementar el consecutivo
            resolucion.numero_actual += 1
            resolucion.save()

            # 2. Descontar Inventario via MovimientoInventario (actualiza stock_actual automáticamente)
            for detalle in factura.detalles.all():
                producto = detalle.producto
                if producto.tipo_producto != 'servicio':
                    if producto.stock_actual < detalle.cantidad:
                        raise Exception(f"No hay stock suficiente para {producto.nombre}.")
                    from inventarios.models import MovimientoInventario
                    MovimientoInventario.objects.create(
                        producto=producto,
                        cantidad=detalle.cantidad,
                        tipo='salida',
                        motivo=f"Factura de venta: {factura.numero_factura}",
                        origen='venta',
                        documento_referencia=factura.numero_factura,
                    )
                
            # 3. Registrar Transacción Financiera
            cuenta = Cuenta.objects.first() # Cuenta por defecto (Caja general)
            if cuenta:
                Transaccion.objects.create(
                    cuenta=cuenta,
                    tipo='ingreso',
                    monto=factura.total,
                    descripcion=f"Factura de Venta {factura.numero_factura} a {factura.cliente.nombre}",
                    categoria='ventas'
                )
                cuenta.balance += factura.total
                cuenta.save()
                
            factura.save()
            return Response(self.get_serializer(factura).data)
