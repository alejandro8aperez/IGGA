from datetime import date
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from .models import AsientoContable, Cuenta, MovimientoContable, PeriodoContable


class ContabilidadModelTests(TestCase):
    def test_cuenta_get_saldo_y_naturaleza(self):
        cuenta = Cuenta.objects.create(codigo='1001', nombre='Caja', tipo='activo')
        asiento = AsientoContable.objects.create(fecha=date(2026, 1, 1), descripcion='Saldo inicial', referencia='INIT', total_debe=Decimal('200.00'), total_haber=Decimal('200.00'))
        MovimientoContable.objects.create(asiento=asiento, cuenta=cuenta, debe=Decimal('200.00'), haber=Decimal('0'))

        self.assertEqual(cuenta.get_saldo(), Decimal('200.00'))
        self.assertEqual(cuenta.naturaleza, 'deudora')

    def test_movimiento_contable_no_puede_tener_debe_y_haber(self):
        cuenta = Cuenta.objects.create(codigo='1002', nombre='Caja alternativa', tipo='activo')
        asiento = AsientoContable.objects.create(fecha=date(2026, 1, 2), descripcion='Prueba', referencia='PRU', total_debe=Decimal('100.00'), total_haber=Decimal('100.00'))

        movimiento = MovimientoContable(asiento=asiento, cuenta=cuenta, debe=Decimal('100.00'), haber=Decimal('100.00'))
        with self.assertRaises(ValidationError):
            movimiento.full_clean()


class ContabilidadAPITests(APITestCase):
    def test_asiento_balanced_nested_creation(self):
        cuenta_activo = Cuenta.objects.create(codigo='1001', nombre='Caja', tipo='activo')
        cuenta_ingreso = Cuenta.objects.create(codigo='4101', nombre='Ingresos por ventas', tipo='ingreso')

        payload = {
            'fecha': '2026-04-24',
            'descripcion': 'Venta de prueba',
            'referencia': 'VTA-001',
            'movimientos': [
                {'cuenta': cuenta_activo.id, 'debe': '150.00', 'haber': '0', 'descripcion': 'Ingreso a caja'},
                {'cuenta': cuenta_ingreso.id, 'debe': '0', 'haber': '150.00', 'descripcion': 'Venta registrada'},
            ]
        }

        response = self.client.post('/api/contabilidad/asientos/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        asiento = AsientoContable.objects.get(pk=response.data['id'])
        self.assertTrue(asiento.esta_balanceado)
        self.assertEqual(asiento.movimientos.count(), 2)
        self.assertEqual(asiento.total_debe, Decimal('150.00'))
        self.assertEqual(asiento.total_haber, Decimal('150.00'))

    def test_asiento_desbalanceado_rechazado(self):
        cuenta_activo = Cuenta.objects.create(codigo='1003', nombre='Banco', tipo='activo')
        cuenta_ingreso = Cuenta.objects.create(codigo='4102', nombre='Ingresos varios', tipo='ingreso')

        payload = {
            'fecha': '2026-04-24',
            'descripcion': 'Venta desbalanceada',
            'referencia': 'VTA-002',
            'movimientos': [
                {'cuenta': cuenta_activo.id, 'debe': '150.00', 'haber': '0', 'descripcion': 'Ingreso parcial'},
                {'cuenta': cuenta_ingreso.id, 'debe': '0', 'haber': '100.00', 'descripcion': 'Ingreso registrado'},
            ]
        }

        response = self.client.post('/api/contabilidad/asientos/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('El asiento contable debe estar balanceado', str(response.data))

    def test_balance_general_endpoint(self):
        cuenta_activo = Cuenta.objects.create(codigo='1004', nombre='Caja principal', tipo='activo')
        cuenta_pasivo = Cuenta.objects.create(codigo='2001', nombre='Proveedores', tipo='pasivo')
        asiento = AsientoContable.objects.create(fecha=date(2026, 4, 24), descripcion='Prueba balance', referencia='BAL-01', total_debe=Decimal('500.00'), total_haber=Decimal('500.00'))
        MovimientoContable.objects.create(asiento=asiento, cuenta=cuenta_activo, debe=Decimal('500.00'), haber=Decimal('0'))
        MovimientoContable.objects.create(asiento=asiento, cuenta=cuenta_pasivo, debe=Decimal('0'), haber=Decimal('500.00'))

        response = self.client.get('/api/contabilidad/asientos/balance-general/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['totales']['activo'], 500.0)
        self.assertEqual(response.data['totales']['pasivo'], 500.0)

    def test_cierre_periodo_generates_asiento_de_cierre(self):
        cuenta_ingreso = Cuenta.objects.create(codigo='4103', nombre='Ventas', tipo='ingreso')
        cuenta_gasto = Cuenta.objects.create(codigo='5102', nombre='Gastos operativos', tipo='gasto')
        asiento = AsientoContable.objects.create(fecha=date(2026, 3, 31), descripcion='Asiento 1', referencia='PER-01', total_debe=Decimal('500.00'), total_haber=Decimal('500.00'))
        MovimientoContable.objects.create(asiento=asiento, cuenta=cuenta_ingreso, debe=Decimal('0'), haber=Decimal('1000.00'))
        MovimientoContable.objects.create(asiento=asiento, cuenta=cuenta_gasto, debe=Decimal('500.00'), haber=Decimal('0'))

        periodo = PeriodoContable.objects.create(nombre='Marzo 2026', fecha_inicio=date(2026, 3, 1), fecha_fin=date(2026, 3, 31), descripcion='Periodo de cierre de marzo')
        periodo.cerrar()

        self.assertEqual(periodo.estado, PeriodoContable.ESTADO_CERRADO)
        self.assertIsNotNone(periodo.asiento_cierre)
        self.assertEqual(periodo.asiento_cierre.movimientos.count(), 3)
        self.assertEqual(periodo.resultado, Decimal('500.00'))

    def test_export_endpoints_return_files(self):
        cuenta_activo = Cuenta.objects.create(codigo='1005', nombre='Caja secundaria', tipo='activo')
        cuenta_ingreso = Cuenta.objects.create(codigo='4104', nombre='Ventas varias', tipo='ingreso')
        payload = {
            'fecha': '2026-04-24',
            'descripcion': 'Venta exportable',
            'referencia': 'VTA-EXP',
            'movimientos': [
                {'cuenta': cuenta_activo.id, 'debe': '200.00', 'haber': '0', 'descripcion': 'Ingreso a caja exportable'},
                {'cuenta': cuenta_ingreso.id, 'debe': '0', 'haber': '200.00', 'descripcion': 'Venta exportable'},
            ]
        }
        self.client.post('/api/contabilidad/asientos/', payload, format='json')

        response_excel = self.client.get('/api/contabilidad/asientos/export-excel/?fecha_inicio=2026-04-01&fecha_fin=2026-04-30')
        self.assertEqual(response_excel.status_code, status.HTTP_200_OK)
        self.assertIn('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', response_excel['Content-Type'])

        response_pdf = self.client.get('/api/contabilidad/asientos/export-pdf/?fecha_inicio=2026-04-01&fecha_fin=2026-04-30')
        self.assertEqual(response_pdf.status_code, status.HTTP_200_OK)
        self.assertIn('application/pdf', response_pdf['Content-Type'])
