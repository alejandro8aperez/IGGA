from django.test import TestCase
from crm.models import Cliente
from inventarios.models import Producto
from compras.models import Proveedor, OrdenCompra, RecepcionCompra, PagoCompra
from contabilidad.models import AsientoContable

class ComprasRecepcionPagoTests(TestCase):
    def setUp(self):
        self.cliente = Cliente.objects.create(nombre='Cliente Test', email='cli@test.com', cedula='111')
        self.proveedor = Proveedor.objects.create(razon_social='Proveedor Test', nit='P-001', contacto_nombre='Juan', contacto_email='juan@prov.com')
        self.producto = Producto.objects.create(nombre='Producto Test', codigo_sku='SKU-01', precio_venta=100, precio_compra=80)

    def test_recepcion_completa_cambia_estado(self):
        orden = OrdenCompra.objects.create(proveedor=self.proveedor, fecha_entrega_esperada='2026-12-31', estado='enviada', total=300)
        RecepcionCompra.objects.create(orden=orden, cantidad_recibida=300)
        orden.refresh_from_db()
        self.assertEqual(orden.estado, 'completada')

    def test_pago_generar_asiento_contable(self):
        orden = OrdenCompra.objects.create(proveedor=self.proveedor, fecha_entrega_esperada='2026-12-31', estado='enviada', total=300)
        pago = PagoCompra.objects.create(orden=orden, monto=300)
        asiento = AsientoContable.objects.filter(referencia=f'PagoCompra:{pago.id}').first()
        self.assertIsNotNone(asiento)
        self.assertEqual(float(asiento.total_debe), 300)
        self.assertEqual(float(asiento.total_haber), 300)

    def test_no_pago_orden_cancelada(self):
        orden = OrdenCompra.objects.create(proveedor=self.proveedor, estado='cancelada', total=100)
        with self.assertRaises(Exception):
            PagoCompra.objects.create(orden=orden, monto=100)

