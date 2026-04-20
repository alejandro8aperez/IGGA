from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count
from venta.models import OrdenVenta
from compras.models import OrdenCompra
from inventarios.models import Producto
from crm.models import Cliente
from .models import Metrica

class DashboardView(APIView):
    def get(self, request):
        # Métricas de ventas
        ventas_totales = OrdenVenta.objects.filter(estado='entregada').aggregate(
            total=Sum('total'))['total'] or 0
        
        # Métricas de compras
        compras_totales = OrdenCompra.objects.filter(estado='completada').aggregate(
            total=Sum('total'))['total'] or 0
        
        # Inventario
        productos_totales = Producto.objects.count()
        productos_bajo_stock = Producto.objects.filter(stock__lt=10).count()
        
        # Clientes
        clientes_totales = Cliente.objects.count()
        
        data = {
            'ventas_totales': ventas_totales,
            'compras_totales': compras_totales,
            'productos_totales': productos_totales,
            'productos_bajo_stock': productos_bajo_stock,
            'clientes_totales': clientes_totales,
        }
        
        return Response(data)
