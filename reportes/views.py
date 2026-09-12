from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, F, Q
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import datetime, timedelta
from collections import defaultdict

from inventarios.models import Producto, Categoria, MovimientoInventario
from finanzas.models import Cuenta, Transaccion
from crm.models import Oportunidad, Cliente
from operaciones.models import Proyecto
from facturacion.models import Factura, DetalleFactura
from compras.models import OrdenCompra, PagoCompra, Proveedor
from produccion.models import OrdenProduccion, CostoProduccion
from contabilidad.models import AsientoContable, MovimientoContable, Cuenta as CuentaContable
from pos.models import VentaPOS, SesionCaja


class ReporteGeneralView(APIView):
    def get(self, request):
        try:
            total_clientes = Cliente.objects.count()
            productos = Producto.objects.all()
            valor_inventario = sum(p.precio_venta * p.stock_actual for p in productos)
            total_transacciones = Transaccion.objects.aggregate(Sum('monto'))['monto__sum'] or 0
            valor_oportunidades = Oportunidad.objects.aggregate(Sum('valor_estimado'))['valor_estimado__sum'] or 0
            proyectos_activos = Proyecto.objects.filter(estado__in=['planificado', 'en_progreso']).count()
            data = {
                "total_clientes": total_clientes,
                "valor_inventario": valor_inventario,
                "total_transacciones": total_transacciones,
                "valor_oportunidades": valor_oportunidades,
                "proyectos_activos": proyectos_activos,
                "top_productos": [
                    {"nombre": p.nombre, "stock": p.stock_actual, "valor": p.precio_venta * p.stock_actual}
                    for p in productos.order_by('-stock_actual')[:10]
                ]
            }
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class PowerBIReportView(APIView):
    """
    Endpoint unificado para dashboard tipo Power BI.
    Devuelve todas las métricas agregadas necesarias para las vistas de reportes.
    """
    def get(self, request):
        try:
            # Fechas de los últimos 12 meses
            hoy = timezone.now().date()
            inicio_12m = (hoy.replace(day=1) - timedelta(days=365)).replace(day=1)
            inicio_6m = (hoy.replace(day=1) - timedelta(days=180)).replace(day=1)

            # ---------- VENTAS / FACTURACIÓN ----------
            facturas = Factura.objects.filter(fecha_emision__date__gte=inicio_12m)
            ventas_mensuales = defaultdict(lambda: {"ventas": 0, "facturas": 0})
            for f in facturas:
                mes = f.fecha_emision.strftime("%Y-%m")
                ventas_mensuales[mes]["ventas"] += float(f.total or 0)
                ventas_mensuales[mes]["facturas"] += 1
            ventas_mensuales_list = [
                {"mes": k, "ventas": round(v["ventas"], 2), "facturas": v["facturas"]}
                for k, v in sorted(ventas_mensuales.items())
            ]

            # Ventas por método de pago (POS)
            ventas_pos = VentaPOS.objects.filter(factura__fecha_emision__date__gte=inicio_12m)
            metodos_pago = defaultdict(float)
            for v in ventas_pos:
                metodos_pago[v.metodo_pago] += float(v.monto_recibido or 0)
            metodos_pago_list = [
                {"metodo": k, "total": round(v, 2)}
                for k, v in metodos_pago.items()
            ]

            # ---------- COMPRAS ----------
            ordenes = OrdenCompra.objects.filter(fecha_emision__gte=inicio_12m)
            compras_mensuales = defaultdict(lambda: {"total": 0, "ordenes": 0})
            for o in ordenes:
                mes = o.fecha_emision.strftime("%Y-%m")
                compras_mensuales[mes]["total"] += float(o.total or 0)
                compras_mensuales[mes]["ordenes"] += 1
            compras_mensuales_list = [
                {"mes": k, "total": round(v["total"], 2), "ordenes": v["ordenes"]}
                for k, v in sorted(compras_mensuales.items())
            ]

            # Estados de órdenes
            estados_ordenes = (
                OrdenCompra.objects.values('estado')
                .annotate(count=Count('id'), total=Sum('total'))
            )
            estados_ordenes_list = [
                {"estado": e["estado"], "cantidad": e["count"], "total": round(float(e["total"] or 0), 2)}
                for e in estados_ordenes
            ]

            # Pagos mensuales
            pagos = PagoCompra.objects.filter(fecha__gte=inicio_12m)
            pagos_mensuales = defaultdict(float)
            for p in pagos:
                mes = p.fecha.strftime("%Y-%m")
                pagos_mensuales[mes] += float(p.monto or 0)
            pagos_mensuales_list = [
                {"mes": k, "total": round(v, 2)}
                for k, v in sorted(pagos_mensuales.items())
            ]

            # Top proveedores
            top_proveedores = (
                OrdenCompra.objects.values('proveedor__razon_social')
                .annotate(total=Sum('total'), ordenes=Count('id'))
                .order_by('-total')[:8]
            )
            top_proveedores_list = [
                {"nombre": p["proveedor__razon_social"] or "Desconocido", "total": round(float(p["total"] or 0), 2), "ordenes": p["ordenes"]}
                for p in top_proveedores
            ]

            # ---------- PRODUCCIÓN ----------
            ops = OrdenProduccion.objects.filter(fecha_planeada_inicio__gte=inicio_12m)
            produccion_mensual = defaultdict(lambda: {"cantidad": 0, "ordenes": 0})
            for op in ops:
                mes = op.fecha_planeada_inicio.strftime("%Y-%m")
                produccion_mensual[mes]["cantidad"] += op.cantidad_a_producir or 0
                produccion_mensual[mes]["ordenes"] += 1
            produccion_mensual_list = [
                {"mes": k, "cantidad": v["cantidad"], "ordenes": v["ordenes"]}
                for k, v in sorted(produccion_mensual.items())
            ]

            # Estados producción
            estados_produccion = (
                OrdenProduccion.objects.values('estado')
                .annotate(count=Count('id'))
            )
            estados_produccion_list = [
                {"estado": e["estado"], "cantidad": e["count"]}
                for e in estados_produccion
            ]

            # Costos de producción
            costos = CostoProduccion.objects.filter(fecha_registro__date__gte=inicio_12m)
            costos_mensuales = defaultdict(float)
            for c in costos:
                mes = c.fecha_registro.strftime("%Y-%m")
                costos_mensuales[mes] += float(c.costo_total or 0)
            costos_mensuales_list = [
                {"mes": k, "total": round(v, 2)}
                for k, v in sorted(costos_mensuales.items())
            ]

            # ---------- CONTABILIDAD ----------
            asientos = AsientoContable.objects.filter(fecha__gte=inicio_12m)
            contabilidad_mensual = defaultdict(lambda: {"ingresos": 0, "gastos": 0})
            for a in asientos:
                mes = a.fecha.strftime("%Y-%m")
                for m in a.movimientos.all():
                    tipo = m.cuenta.tipo
                    if tipo == 'ingreso':
                        contabilidad_mensual[mes]["ingresos"] += float(m.haber or 0)
                    elif tipo == 'gasto':
                        contabilidad_mensual[mes]["gastos"] += float(m.debe or 0)
            contabilidad_mensual_list = [
                {"mes": k, "ingresos": round(v["ingresos"], 2), "gastos": round(v["gastos"], 2), "utilidad": round(v["ingresos"] - v["gastos"], 2)}
                for k, v in sorted(contabilidad_mensual.items())
            ]

            # ---------- INVENTARIO ----------
            productos_bajo_stock = Producto.objects.filter(stock_actual__lte=F('stock_minimo')).count()
            total_productos = Producto.objects.count()
            valor_inventario_total = sum(
                float(p.precio_compra or 0) * float(p.stock_actual or 0) for p in Producto.objects.all()
            )
            categorias_inv = (
                Producto.objects.values('categoria__nombre')
                .annotate(total_stock=Sum('stock_actual'), valor=Sum(F('stock_actual') * F('precio_compra')))
            )
            categorias_inv_list = [
                {"categoria": c["categoria__nombre"] or "Sin categoría", "stock": c["total_stock"] or 0, "valor": round(float(c["valor"] or 0), 2)}
                for c in categorias_inv
            ]

            movimientos_recientes = MovimientoInventario.objects.filter(fecha__date__gte=inicio_6m).count()

            # ---------- POS / CAJA ----------
            sesiones = SesionCaja.objects.filter(fecha_apertura__date__gte=inicio_12m)
            caja_mensual = defaultdict(lambda: {"aperturas": 0, "ventas": 0})
            for s in sesiones:
                mes = s.fecha_apertura.strftime("%Y-%m")
                caja_mensual[mes]["aperturas"] += 1
                caja_mensual[mes]["ventas"] += float(s.monto_final_sistema or 0)
            caja_mensual_list = [
                {"mes": k, "sesiones": v["aperturas"], "ventas": round(v["ventas"], 2)}
                for k, v in sorted(caja_mensual.items())
            ]

            # ---------- KPIs GENERALES ----------
            total_ventas_hoy = float(Factura.objects.filter(
                fecha_emision__date=hoy
            ).aggregate(t=Sum('total'))['t'] or 0)

            total_compras_hoy = float(OrdenCompra.objects.filter(
                fecha_emision=hoy
            ).aggregate(t=Sum('total'))['t'] or 0)

            total_clientes = Cliente.objects.count()
            nuevos_clientes_mes = Cliente.objects.filter(
                # Asumiendo que no hay campo fecha_registro en Cliente; omitimos si no existe
            ).count() if hasattr(Cliente, 'fecha_registro') else total_clientes

            # ---------- RESPUESTA ----------
            data = {
                "kpis": {
                    "total_ventas_hoy": round(total_ventas_hoy, 2),
                    "total_compras_hoy": round(total_compras_hoy, 2),
                    "total_clientes": total_clientes,
                    "valor_inventario": round(valor_inventario_total, 2),
                    "productos_bajo_stock": productos_bajo_stock,
                    "total_productos": total_productos,
                    "proyectos_activos": Proyecto.objects.filter(estado__in=['planificado', 'en_progreso']).count(),
                    "total_facturas": Factura.objects.count(),
                    "total_ordenes_compra": OrdenCompra.objects.count(),
                    "ordenes_pendientes": OrdenCompra.objects.filter(estado__in=['borrador', 'enviada', 'recibida_parcial']).count(),
                    "produccion_activa": OrdenProduccion.objects.filter(estado='en_proceso').count(),
                    "movimientos_inventario_6m": movimientos_recientes,
                    "total_proveedores": Proveedor.objects.count(),
                },
                "ventas_mensuales": ventas_mensuales_list,
                "compras_mensuales": compras_mensuales_list,
                "produccion_mensual": produccion_mensual_list,
                "costos_mensuales": costos_mensuales_list,
                "pagos_mensuales": pagos_mensuales_list,
                "contabilidad_mensual": contabilidad_mensual_list,
                "caja_mensual": caja_mensual_list,
                "metodos_pago": metodos_pago_list,
                "estados_ordenes": estados_ordenes_list,
                "estados_produccion": estados_produccion_list,
                "top_proveedores": top_proveedores_list,
                "categorias_inventario": categorias_inv_list,
            }
            return Response(data)
        except Exception as e:
            import traceback
            return Response({"error": str(e), "detail": traceback.format_exc()}, status=500)
