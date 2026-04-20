from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncMonth, TruncYear
from venta.models import OrdenVenta
from compras.models import OrdenCompra
from crm.models import Cliente
from inventarios.models import Producto
from finanzas.models import Transaccion
from proyectos.models import Proyecto
from marketing.models import Lead, Campana
from calidad.models import Inspeccion
import datetime

class VentasMensualesView(APIView):
    def get(self, request):
        year = request.GET.get('year', datetime.date.today().year)
        data = OrdenVenta.objects.filter(
            fecha_emision__year=year,
            estado='entregada'
        ).annotate(
            month=TruncMonth('fecha_emision')
        ).values('month').annotate(
            total=Sum('total')
        ).order_by('month')
        
        return Response(list(data))

class ComprasMensualesView(APIView):
    def get(self, request):
        year = request.GET.get('year', datetime.date.today().year)
        data = OrdenCompra.objects.filter(
            fecha_emision__year=year,
            estado='completada'
        ).annotate(
            month=TruncMonth('fecha_emision')
        ).values('month').annotate(
            total=Sum('total')
        ).order_by('month')
        
        return Response(list(data))

class ProductosMasVendidosView(APIView):
    def get(self, request):
        limit = int(request.GET.get('limit', 10))
        data = Producto.objects.annotate(
            total_vendido=Sum('venta_detalle__cantidad')
        ).filter(total_vendido__gt=0).order_by('-total_vendido')[:limit].values(
            'nombre', 'total_vendido'
        )
        
        return Response(list(data))

class ClientesMasActivosView(APIView):
    def get(self, request):
        limit = int(request.GET.get('limit', 10))
        data = Cliente.objects.annotate(
            total_compras=Sum('ordenventa__total')
        ).filter(total_compras__gt=0).order_by('-total_compras')[:limit].values(
            'nombre', 'total_compras'
        )
        
        return Response(list(data))

class EstadoProyectosView(APIView):
    def get(self, request):
        data = Proyecto.objects.values('estado').annotate(
            count=Count('id')
        ).order_by('estado')
        
        return Response(list(data))

class ConversionLeadsView(APIView):
    def get(self, request):
        data = Lead.objects.values('estado').annotate(
            count=Count('id')
        ).order_by('estado')
        
        return Response(list(data))

class CalidadProductosView(APIView):
    def get(self, request):
        data = Inspeccion.objects.values('resultado').annotate(
            count=Count('id')
        ).order_by('resultado')
        
        return Response(list(data))

class FlujoCajaView(APIView):
    def get(self, request):
        year = request.GET.get('year', datetime.date.today().year)
        ingresos = Transaccion.objects.filter(
            fecha__year=year,
            tipo='ingreso'
        ).aggregate(total=Sum('monto'))['total'] or 0
        
        egresos = Transaccion.objects.filter(
            fecha__year=year,
            tipo='egreso'
        ).aggregate(total=Sum('monto'))['total'] or 0
        
        data = {
            'ingresos': ingresos,
            'egresos': egresos,
            'flujo_neto': ingresos - egresos
        }
        
        return Response(data)

class DashboardCompletoView(APIView):
    def get(self, request):
        # Ventas del mes actual
        mes_actual = datetime.date.today().month
        year_actual = datetime.date.today().year
        
        ventas_mes = OrdenVenta.objects.filter(
            fecha_emision__month=mes_actual,
            fecha_emision__year=year_actual,
            estado='entregada'
        ).aggregate(total=Sum('total'))['total'] or 0
        
        # Compras del mes
        compras_mes = OrdenCompra.objects.filter(
            fecha_emision__month=mes_actual,
            fecha_emision__year=year_actual,
            estado='completada'
        ).aggregate(total=Sum('total'))['total'] or 0
        
        # Productos bajo stock
        productos_bajo_stock = Producto.objects.filter(stock__lt=10).count()
        
        # Proyectos activos
        proyectos_activos = Proyecto.objects.filter(estado='en_progreso').count()
        
        # Leads calificados
        leads_calificados = Lead.objects.filter(estado='calificado').count()
        
        # Productos aprobados en calidad
        calidad_aprobada = Inspeccion.objects.filter(resultado='aprobado').count()
        
        data = {
            'ventas_mes_actual': ventas_mes,
            'compras_mes_actual': compras_mes,
            'productos_bajo_stock': productos_bajo_stock,
            'proyectos_activos': proyectos_activos,
            'leads_calificados': leads_calificados,
            'productos_calidad_aprobada': calidad_aprobada,
            'utilidad_bruta': ventas_mes - compras_mes
        }
        
        return Response(data)
