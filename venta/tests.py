from django.test import TestCase
from crm.models import Cliente
from inventarios.models import Producto
from venta.models import OrdenVenta, FacturaVenta
from contabilidad.models import AsientoContable, MovimientoContable

class VentaFacturaContabilidadTests(TestCase):
    def setUp(self):
        self.cliente = Cliente.objects.create(nombre='Cliente Test', email='test@example.com', cedula='123456')
        self.producto = Producto.objects.create(nombre='Producto Test', codigo_sku='SKU001', precio_venta=100, precio_compra=70)

    def test_factura_generar_asiento_contable(self):
        orden = OrdenVenta.objects.create(cliente=self.cliente, total=150.00, estado='confirmada')
        factura = FacturaVenta.objects.create(orden_venta=orden, numero_factura='FV-0001', total=150.00, estado='pendiente')

        self.assertTrue(factura.contabilidad_generado)
        self.assertFalse(factura.cobro_contabilizado)

        asiento = AsientoContable.objects.filter(referencia=f"FacturaVenta:{factura.id}").first()
        self.assertIsNotNone(asiento)
        self.assertEqual(float(asiento.total_debe), 150.00)
        self.assertEqual(float(asiento.total_haber), 150.00)

        movimientos = MovimientoContable.objects.filter(asiento=asiento)
        self.assertEqual(movimientos.count(), 2)
        self.assertEqual(float(movimientos.get(cuenta__codigo='110101').debe), 150.00)
        self.assertEqual(float(movimientos.get(cuenta__codigo='410101').haber), 150.00)

    def test_cobro_factura_generar_asiento_cobro(self):
        orden = OrdenVenta.objects.create(cliente=self.cliente, total=200.00)
        factura = FacturaVenta.objects.create(orden_venta=orden, numero_factura='FV-0002', total=200.00, estado='pendiente')
        factura.estado = 'pagada'
        factura.save()

        self.assertTrue(factura.cobro_contabilizado)

        asiento_cobro = AsientoContable.objects.filter(referencia=f"FacturaVentaCobro:{factura.id}").first()
        self.assertIsNotNone(asiento_cobro)

    def test_no_facturar_orden_cancelada(self):
        orden = OrdenVenta.objects.create(cliente=self.cliente, total=100.00, estado='cancelada')
        with self.assertRaises(Exception):
            FacturaVenta.objects.create(orden_venta=orden, numero_factura='FV-0003', total=100.00, estado='pendiente')

