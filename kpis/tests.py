from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from crm.models import Cliente
from venta.models import OrdenVenta, FacturaVenta
from .models import KPI, Forecast

class KPITests(TestCase):
    def setUp(self):
        self.kpi = KPI.objects.create(nombre='test_kpi', descripcion='Test KPI', valor=100.0)
        self.client = APIClient()

    def test_kpi_creation(self):
        self.assertEqual(self.kpi.nombre, 'test_kpi')
        self.assertEqual(float(self.kpi.valor), 100.0)

    def test_predecir_ventas_endpoint(self):
        cliente = Cliente.objects.create(nombre='Cliente Test', email='cliente@test.com', cedula='12345')
        ov1 = OrdenVenta.objects.create(cliente=cliente, total=1000)
        ov2 = OrdenVenta.objects.create(cliente=cliente, total=1500)
        FacturaVenta.objects.create(orden_venta=ov1, numero_factura='F0001', total=1000, estado='pendiente')
        FacturaVenta.objects.create(orden_venta=ov2, numero_factura='F0002', total=1500, estado='pendiente')

        response = self.client.post('/api/kpis/kpis/predecir_ventas/', {'meses': 3}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('pronosticos', response.data)
        self.assertGreaterEqual(len(response.data['pronosticos']), 1)

        # Verificar que el KPI de predicción se creó
        kpi = KPI.objects.get(nombre='ventas_predichas_ultimos_meses')
        self.assertIsNotNone(kpi)

        # Verificar que se guardaron registros de Forecast
        self.assertGreaterEqual(Forecast.objects.filter(tipo='ventas').count(), 1)
