from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count
from inventarios.models import Producto
from finanzas.models import Cuenta, Transaccion
from crm.models import Oportunidad, Cliente
from operaciones.models import Proyecto

class ReporteGeneralView(APIView):
    def get(self, request):
        try:
            # Stats from different apps
            total_clientes = Cliente.objects.count()
            
            # Inventory Value
            productos = Producto.objects.all()
            valor_inventario = sum(p.precio_venta * p.stock_actual for p in productos)

            # Finances
            total_transacciones = Transaccion.objects.aggregate(Sum('monto'))['monto__sum'] or 0
            
            # CRM opportunities
            valor_oportunidades = Oportunidad.objects.aggregate(Sum('valor_estimado'))['valor_estimado__sum'] or 0
            
            # Active Projects
            proyectos_activos = Proyecto.objects.filter(estado__in=['planificacion', 'ejecucion']).count()
            
            # Create a more detailed break down if needed, but for now just general stats
            data = {
                "total_clientes": total_clientes,
                "valor_inventario": valor_inventario,
                "total_transacciones": total_transacciones,
                "valor_oportunidades": valor_oportunidades,
                "proyectos_activos": proyectos_activos,
                
                # We can add more specific things like top products here to be served by the Report endpoint
                "top_productos": [
                    {"nombre": p.nombre, "stock": p.stock_actual, "valor": p.precio_venta * p.stock_actual}
                    for p in productos.order_by('-stock_actual')[:10]
                ]
            }
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
