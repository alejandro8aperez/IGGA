from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import SesionCaja, VentaPOS
from .serializers import SesionCajaSerializer, VentaPOSSerializer
from facturacion.models import Factura, DetalleFactura, ResolucionFacturacion
from crm.models import Cliente
from inventarios.models import Producto, Categoria, MovimientoInventario
import uuid
from decimal import Decimal
from django.db.models import Sum
from rest_framework.decorators import api_view

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
        
        try:
            # 0. Verificar Resolución de Facturación ANTES de procesar
            resolucion = ResolucionFacturacion.objects.filter(prefijo='POS', activa=True).first()
            if not resolucion:
                resolucion = ResolucionFacturacion.objects.filter(activa=True).first()
            
            if not resolucion:
                return Response({"error": "No hay resolución de facturación activa configurada."}, status=400)

            # 1. Obtener Cliente consumidor final (Prioridad por ID para consistencia SAP)
            cliente, _ = Cliente.objects.get_or_create(
                id=1,
                defaults={
                    'nombre': 'CONSUMIDOR FINAL',
                    'nit': '222222222222',
                    'telefono': '0000000',
                    'email': 'consumidor@final.com',
                    'direccion': 'Ciudad'
                }
            )

            # 2. Preparar totales y Validar Stock
            subtotal_total = Decimal('0.00')
            iva_total = Decimal('0.00')
            items_preparados = []

            for item in items:
                producto = Producto.objects.get(id=item['producto_id'])
                cantidad = int(item['cantidad'])
                
                # --- Validación de Stock Crítica ---
                if producto.stock_actual < cantidad:
                    return Response({
                        "error": f"Stock insuficiente para {producto.nombre}. Disponible: {producto.stock_actual}"
                    }, status=400)

                precio = producto.precio_venta
                iva_pct = Decimal('19.00') # Estándar panadería

                subt = cantidad * precio
                iva = subt * (iva_pct / Decimal('100'))

                subtotal_total += subt
                iva_total += iva
                
                items_preparados.append({
                    'producto': producto,
                    'cantidad': cantidad,
                    'precio': precio,
                    'subt': subt,
                    'iva_pct': iva_pct
                })

            # 3. Asignación de Numeración Legal Segura (Pre-save)
            prefijo = resolucion.prefijo
            proximo_numero = resolucion.numero_actual
            while Factura.objects.filter(numero_factura=f"{prefijo}{proximo_numero}").exists():
                proximo_numero += 1
            
            # 4. Crear Factura (Directamente Validada)
            factura = Factura.objects.create(
                cliente=cliente,
                numero_factura=f"{prefijo}{proximo_numero}",
                fecha_vencimiento=timezone.now().date(),
                subtotal=subtotal_total,
                iva_total=iva_total,
                total=subtotal_total + iva_total,
                cufe=str(uuid.uuid4()).replace('-', '') + "POS",
                estado_dian='validada'
            )

            # 5. Procesar Detalles, Stock y Movimientos
            for d in items_preparados:
                producto = d['producto']
                cantidad = d['cantidad']

                producto.stock_actual -= cantidad
                producto.save()

                MovimientoInventario.objects.create(
                    producto=producto,
                    tipo='salida',
                    cantidad=cantidad,
                    descripcion=f"Venta POS - Factura {factura.numero_factura}"
                )

                DetalleFactura.objects.create(
                    factura=factura,
                    producto=producto,
                    cantidad=cantidad,
                    precio_unitario=d['precio'],
                    subtotal=d['subt'],
                    porcentaje_iva=d['iva_pct']
                )
            
            # Actualizar contador de resolución
            resolucion.numero_actual = proximo_numero + 1
            resolucion.save()

            # 6. Crear registro VentaPOS
            cambio = monto_recibido - factura.total if metodo_pago == 'efectivo' else 0
            venta_pos = VentaPOS.objects.create(
                factura=factura,
                sesion_caja=sesion,
                metodo_pago=metodo_pago,
                monto_recibido=monto_recibido,
                cambio=cambio
            )

            return Response(self.get_serializer(venta_pos).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": f"Error interno: {str(e)}"}, status=500)
