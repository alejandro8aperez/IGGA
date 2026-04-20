from django.test import TestCase
from inventarios.models import Producto
from produccion.models import Receta, InsumoReceta, OrdenProduccion, CostoProduccion
from contabilidad.models import AsientoContable

class ProduccionCostoTests(TestCase):
    def setUp(self):
        self.producto_final = Producto.objects.create(nombre='Producto Final', codigo_sku='PF001', precio_venta=200, precio_compra=100, stock_actual=0)
        self.insumo = Producto.objects.create(nombre='Materia Prima', codigo_sku='MP001', precio_venta=0, precio_compra=10, stock_actual=500)
        self.receta = Receta.objects.create(producto_terminado=self.producto_final, tiempo_estimado_horas=2, costo_adicional_fijo=20)
        InsumoReceta.objects.create(receta=self.receta, producto_materia_prima=self.insumo, cantidad_requerida=2)

        self.orden = OrdenProduccion.objects.create(receta=self.receta, cantidad_a_producir=10, fecha_inicio='2026-04-02', estado='planeada')

    def test_iniciar(self):
        # Transición de planeada a en_proceso descontando insumos
        from rest_framework.test import APIClient
        client = APIClient()
        response = client.post(f'/api/produccion/ordenes/{self.orden.id}/iniciar/')
        self.assertEqual(response.status_code, 200)
        self.orden.refresh_from_db()
        self.assertEqual(self.orden.estado, 'en_proceso')
        self.insumo.refresh_from_db()
        self.assertEqual(self.insumo.stock_actual, 500 - 2*10)

    def test_finalizar_y_costo(self):
        from rest_framework.test import APIClient
        client = APIClient()
        self.orden.estado = 'en_proceso'
        self.orden.save()

        response = client.post(f'/api/produccion/ordenes/{self.orden.id}/finalizar/')
        self.assertEqual(response.status_code, 200)

        self.producto_final.refresh_from_db()
        self.assertEqual(self.producto_final.stock_actual, 10)

        costo = CostoProduccion.objects.get(orden=self.orden)
        self.assertGreater(costo.costo_total, 0)

        asiento = AsientoContable.objects.get(referencia=f'CostoProduccion:{self.orden.id}')
        self.assertEqual(float(asiento.total_debe), float(costo.costo_total))

