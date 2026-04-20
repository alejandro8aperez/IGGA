from django.test import TestCase, Client
from django.contrib.auth.models import User
from .models import Equipo, OrdenMantenimiento, Repuesto, DetalleMantenimiento, CostoMantenimiento

class MantenimientoOrdenTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='tec', password='1234')
        self.equipo = Equipo.objects.create(codigo='EQ-001', nombre='Compresor', estado='activo')
        self.orden = OrdenMantenimiento.objects.create(
            numero='OC-100', equipo=self.equipo, tipo='correctivo', fecha_programada='2026-04-10'
        )
        self.repuesto = Repuesto.objects.create(codigo='RP-001', descripcion='Filtro', equipo=self.equipo, cantidad_disponible=10, costo_unitario='50.00')
        self.detalle = DetalleMantenimiento.objects.create(orden=self.orden, descripción_trabajo='Cambio filtro', repuesto=self.repuesto, cantidad_usada=2)

    def test_iniciar_orden(self):
        response = self.client.post(f'/api/mantenimiento/ordenes/{self.orden.id}/iniciar/')
        self.assertEqual(response.status_code, 200)
        self.orden.refresh_from_db()
        self.assertEqual(self.orden.estado, 'en_ejecución')
        self.equipo.refresh_from_db()
        self.assertEqual(self.equipo.estado, 'mantenimiento')

    def test_finalizar_orden_y_costo(self):
        # iniciar antes de finalizar
        self.client.post(f'/api/mantenimiento/ordenes/{self.orden.id}/iniciar/')
        payload = {'horas_reales': 3, 'costo_hora': 40.0}
        response = self.client.post(f'/api/mantenimiento/ordenes/{self.orden.id}/finalizar/', data=payload, content_type='application/json')
        self.assertEqual(response.status_code, 200)

        self.orden.refresh_from_db()
        self.assertEqual(self.orden.estado, 'completada')
        self.assertAlmostEqual(float(self.orden.costo_real), 220.0)

        costo = CostoMantenimiento.objects.get(orden=self.orden)
        self.assertEqual(float(costo.costo_total), 220.0)

        self.equipo.refresh_from_db()
        self.assertEqual(self.equipo.estado, 'activo')
