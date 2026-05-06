from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Avg
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta, date
from decimal import Decimal
import calendar

from .models import KPI, Forecast
from .serializers import KPISerializer, ForecastSerializer
from venta.models import FacturaVenta
from compras.models import PagoCompra
from inventarios.models import Producto
from contabilidad.models import MovimientoContable

class KPIViewSet(viewsets.ModelViewSet):
    queryset = KPI.objects.all()
    serializer_class = KPISerializer

    @action(detail=False, methods=['post'])
    def calcular_todos(self, request):
        self.calcular_margen()
        self.calcular_rotacion()
        self.calcular_dias_cobrar()
        self.calcular_dias_pagar()
        return Response({'status': 'KPIs calculados'})

    def calcular_margen(self):
        # Margen = (ingresos - costos) / ingresos
        ingresos = FacturaVenta.objects.aggregate(total=Sum('total'))['total'] or 0
        costos = MovimientoContable.objects.filter(cuenta__tipo='gasto').aggregate(total=Sum('debe'))['total'] or 0
        if ingresos > 0:
            margen = ((ingresos - costos) / ingresos) * 100
        else:
            margen = 0
        KPI.objects.update_or_create(nombre='margen_ganancia', defaults={'descripcion': 'Margen de ganancia (%)', 'valor': margen})

    def calcular_rotacion(self):
        # Rotación = costo de ventas / inventario promedio
        costo_ventas = MovimientoContable.objects.filter(cuenta__codigo__startswith='510').aggregate(total=Sum('debe'))['total'] or 0
        inventario_promedio = Producto.objects.aggregate(avg=Avg('stock_actual'))['avg'] or 1
        rotacion = costo_ventas / inventario_promedio if inventario_promedio > 0 else 0
        KPI.objects.update_or_create(nombre='rotacion_inventario', defaults={'descripcion': 'Rotación de inventario', 'valor': rotacion})

    def calcular_dias_cobrar(self):
        # Días por cobrar = cuentas por cobrar / ventas diarias
        cuentas_cobrar = MovimientoContable.objects.filter(cuenta__codigo__startswith='120').aggregate(total=Sum('debe'))['total'] or 0
        ventas_diarias = FacturaVenta.objects.filter(fecha_emision__gte=timezone.now() - timedelta(days=30)).aggregate(total=Sum('total'))['total'] or 1
        ventas_diarias = ventas_diarias / 30
        dias = cuentas_cobrar / ventas_diarias if ventas_diarias > 0 else 0
        KPI.objects.update_or_create(nombre='dias_por_cobrar', defaults={'descripcion': 'Días promedio por cobrar', 'valor': dias})

    def calcular_dias_pagar(self):
        # Días por pagar = cuentas por pagar / compras diarias
        cuentas_pagar = MovimientoContable.objects.filter(cuenta__codigo__startswith='210').aggregate(total=Sum('haber'))['total'] or 0
        compras_diarias = PagoCompra.objects.filter(fecha__gte=timezone.now() - timedelta(days=30)).aggregate(total=Sum('monto'))['total'] or 1
        compras_diarias = compras_diarias / 30
        dias = cuentas_pagar / compras_diarias if compras_diarias > 0 else 0
        KPI.objects.update_or_create(nombre='dias_por_pagar', defaults={'descripcion': 'Días promedio por pagar', 'valor': dias})

    def _add_months_to_date(self, source_date, months):
        month = source_date.month - 1 + months
        year = source_date.year + month // 12
        month = month % 12 + 1
        day = min(source_date.day, calendar.monthrange(year, month)[1])
        return date(year, month, day)

    @action(detail=False, methods=['post'])
    def predecir_ventas(self, request):
        meses_futuro = int(request.data.get('meses', 3))

        ventas_por_mes = (FacturaVenta.objects
            .annotate(mes=TruncMonth('fecha_emision'))
            .values('mes')
            .annotate(total=Sum('total'))
            .order_by('mes'))

        if len(ventas_por_mes) == 0:
            return Response({'error': 'Datos insuficientes para predicción. Al menos un mes con ventas es necesario.'}, status=status.HTTP_400_BAD_REQUEST)

        x = list(range(len(ventas_por_mes)))
        y = [float(item['total'] or 0) for item in ventas_por_mes]

        if len(ventas_por_mes) == 1:
            pendiente = 0
            intercepto = y[0]
        else:
            x_mean = sum(x) / len(x)
            y_mean = sum(y) / len(y)

            numerador = sum((xi - x_mean) * (yi - y_mean) for xi, yi in zip(x, y))
            denominador = sum((xi - x_mean) ** 2 for xi in x)
            pendiente = numerador / denominador if denominador != 0 else 0
            intercepto = y_mean - pendiente * x_mean

        ultimo_mes_entry = ventas_por_mes.last()
        if not ultimo_mes_entry:
            return Response({'error': 'No se pudo obtener el mes final de ventas'}, status=status.HTTP_400_BAD_REQUEST)

        ultimo_mes = ultimo_mes_entry['mes']
        pronosticos = []

        for i in range(1, meses_futuro + 1):
            x_pred = len(x) - 1 + i
            valor_pred = max(intercepto + pendiente * x_pred, 0)
            periodo_pred = self._add_months_to_date(ultimo_mes, i)

            valor_decimal = Decimal(str(round(valor_pred, 2))).quantize(Decimal('0.01'))

            forecast, _ = Forecast.objects.update_or_create(
                tipo='ventas',
                periodo=periodo_pred,
                defaults={'valor': valor_decimal}
            )

            pronosticos.append({
                'periodo': periodo_pred.isoformat(),
                'valor': float(valor_decimal)
            })

        KPI.objects.update_or_create(
            nombre='ventas_predichas_ultimos_meses',
            defaults={
                'descripcion': f'Predicción de ventas para los siguientes {meses_futuro} meses',
                'valor': float(pronosticos[-1]['valor']) if pronosticos else 0
            }
        )

        return Response({
            'series_historica': [{'periodo': item['mes'].isoformat(), 'total': float(item['total'] or 0)} for item in ventas_por_mes],
            'pronosticos': pronosticos
        }, status=status.HTTP_200_OK)

