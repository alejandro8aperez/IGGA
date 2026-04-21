from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import SesionCaja, VentaPOS
from .serializers import SesionCajaSerializer, VentaPOSSerializer
from facturacion.models import Factura, DetalleFactura, ResolucionFacturacion
from crm.models import Cliente
from inventarios.models import Producto
import uuid
from decimal import Decimal
from django.db.models import Sum
from rest_framework.decorators import api_view
from inventarios.models import Categoria

@api_view(['POST'])
def seed_bakery_data(request):
    """Siembre de datos iniciales para la panadería."""
    # 1. Resolución de Facturación POS
    ResolucionFacturacion.objects.get_or_create(
        prefijo='POS',
        activa=True,
        defaults={
            'numero_inicial': 1,
            'numero_final': 999999,
            'numero_actual': 1,
            'fecha_fin': timezone.now().date() + timezone.timedelta(days=365)
        }
    )

    # 2. Datos de la Panadería
    data_panaderia = {
        'Panadería': [
            {'sku': 'PAN001', 'nombre': 'Pan Aliñado Grande', 'precio': 5000},
            {'sku': 'PAN002', 'nombre': 'Pan de Bono (Ud)', 'precio': 2000},
            {'sku': 'PAN003', 'nombre': 'Buñuelo Calientico', 'precio': 1500},
            {'sku': 'PAN004', 'nombre': 'Croissant de Mantequilla', 'precio': 4500},
            {'sku': 'PAN005', 'nombre': 'Pan de Queso', 'precio': 2500},
        ],
        'Pastelería': [
            {'sku': 'PAS001', 'nombre': 'Pastel de Pollo', 'precio': 5500},
            {'sku': 'PAS002', 'nombre': 'Milhoja de Arequipe', 'precio': 6500},
            {'sku': 'PAS003', 'nombre': 'Torta de Chocolate (Porción)', 'precio': 8000},
            {'sku': 'PAS004', 'nombre': 'Donas Variadas', 'precio': 4000},
        ],
        'Cafetería y Bebidas': [
            {'sku': 'BEB001', 'nombre': 'Café Tinto', 'precio': 2500},
            {'sku': 'BEB002', 'nombre': 'Café con Leche', 'precio': 4000},
            {'sku': 'BEB003', 'nombre': 'Gaseosa Mini', 'precio': 2500},
            {'sku': 'BEB004', 'nombre': 'Jugo Natural', 'precio': 6000},
            {'sku': 'BEB005', 'nombre': 'Chocolate Santafereño', 'precio': 4500},
        ]
    }

    results = []
    for cat_name, productos in data_panaderia.items():
        categoria, _ = Categoria.objects.get_or_create(nombre=cat_name)
        for prod in productos:
            obj, created = Producto.objects.update_or_create(
                codigo_sku=prod['sku'],
                defaults={
                    'nombre': prod['nombre'],
                    'categoria': categoria,
                    'precio_venta': prod['precio'],
                    'precio_compra': prod['precio'] * Decimal('0.6'),
                    'stock_actual': 100
                }
            )
            results.append(f"{'Creado' if created else 'Actualizado'}: {obj.nombre}")

    return Response({"message": "Carga de datos completada", "details": results}, status=status.HTTP_201_CREATED)

class SesionCajaViewSet(viewsets.ModelViewSet):
    queryset = SesionCaja.objects.all().order_by('-fecha_apertura')
    serializer_class = SesionCajaSerializer

    @action(detail=False, methods=['get'])
    def activa(self, request):
        sesion = SesionCaja.objects.filter(estado='abierta').first()
        if not sesion:
            return Response({"error": "No hay caja abierta"}, status=404)
        return Response(self.get_serializer(sesion).data)

    @action(detail=True, methods=['post'])
    def cerrar(self, request, pk=None):
        sesion = self.get_object()
        sesion.fecha_cierre = timezone.now()
        sesion.monto_final_contado = request.data.get('monto_final_contado', 0)
        
        # Calcular el monto esperado en sistema
        total_ventas = sesion.ventas.aggregate(Sum('factura__total'))['factura__total__sum'] or 0
        sesion.monto_final_sistema = sesion.monto_inicial + total_ventas
        sesion.estado = 'cerrada'
        sesion.save()
        return Response(self.get_serializer(sesion).data)

class VentaPOSViewSet(viewsets.ModelViewSet):
    queryset = VentaPOS.objects.all()
    serializer_class = VentaPOSSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        sesion = SesionCaja.objects.filter(estado='abierta').first()
        if not sesion:
            return Response({"error": "Debe abrir caja antes de vender."}, status=400)

        data = request.data
        items = data.get('items', [])
        metodo_pago = data.get('metodo_pago', 'efectivo')
        monto_recibido = Decimal(str(data.get('monto_recibido', 0)))
        
        # 1. Obtener o crear Cliente consumidor final
        cliente, _ = Cliente.objects.get_or_create(
            cedula='222222222222',
            defaults={
                'nombre': 'CONSUMIDOR FINAL',
                'email': 'consumidor@final.com',
                'telefono': '0000000',
                'direccion': 'Ciudad'
            }
        )

        # 2. Crear Factura Borrador
        factura = Factura.objects.create(
            cliente=cliente,
            fecha_vencimiento=timezone.now().date(),
            estado_dian='borrador'
        )

        subtotal_total = Decimal('0.00')
        iva_total = Decimal('0.00')

        for item in items:
            producto = Producto.objects.get(id=item['producto_id'])
            cantidad = int(item['cantidad'])
            precio = producto.precio_venta
            iva_pct = Decimal('19.00') # Estándar panadería

            subt = cantidad * precio
            iva = subt * (iva_pct / Decimal('100'))
            
            subtotal_total += subt
            iva_total += iva

            DetalleFactura.objects.create(
                factura=factura,
                producto=producto,
                cantidad=cantidad,
                precio_unitario=precio,
                subtotal=subt,
                porcentaje_iva=iva_pct
            )

        factura.subtotal = subtotal_total
        factura.iva_total = iva_total
        factura.total = subtotal_total + iva_total
        factura.save()

        # 3. Emitir Factura (Lógica de FacturacionViewset simulada aquí)
        resolucion = ResolucionFacturacion.objects.filter(prefijo='POS', activa=True).first()
        if not resolucion:
            # Fallback a cualquier resolución activa si no hay POS
            resolucion = ResolucionFacturacion.objects.filter(activa=True).first()

        if not resolucion:
            return Response({"error": "No hay resolución de facturación activa configurada."}, status=400)

        factura.numero_factura = f"{resolucion.prefijo}{resolucion.numero_actual}"
        factura.cufe = str(uuid.uuid4()).replace('-', '') + "POS"
        factura.estado_dian = 'validada'
        
        resolucion.numero_actual += 1
        resolucion.save()

        # Descontar Inventario
        for detalle in factura.detalles.all():
            prod = detalle.producto
            prod.stock_actual -= detalle.cantidad
            prod.save()

        factura.save()

        # 4. Crear registro VentaPOS
        cambio = monto_recibido - factura.total if metodo_pago == 'efectivo' else 0
        venta_pos = VentaPOS.objects.create(
            factura=factura,
            sesion_caja=sesion,
            metodo_pago=metodo_pago,
            monto_recibido=monto_recibido,
            cambio=cambio
        )

        return Response(self.get_serializer(venta_pos).data, status=status.HTTP_201_CREATED)
