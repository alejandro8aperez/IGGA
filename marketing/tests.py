from django.test import TestCase
from .models import Segmento, Campana, Lead
from crm.models import Cliente

class MarketingTestCase(TestCase):
    def setUp(self):
        self.segmento = Segmento.objects.create(
            nombre="Clientes Potenciales",
            descripcion="Segmento de clientes potenciales en Bogotá"
        )
        self.campana = Campana.objects.create(
            nombre="Campaña Email Q1",
            segmento=self.segmento,
            fecha_inicio="2024-01-01",
            presupuesto=5000.00
        )
        self.lead = Lead.objects.create(
            nombre="Juan Pérez",
            email="juan@example.com",
            telefono="3001234567",
            empresa="Empresa ABC",
            fuente="campana",
            campana=self.campana
        )

    def test_segmento_creation(self):
        self.assertEqual(self.segmento.nombre, "Clientes Potenciales")

    def test_campana_auto_numbering(self):
        self.assertTrue(self.campana.numero_campana.startswith("CAMP-"))

    def test_lead_creation(self):
        self.assertEqual(self.lead.nombre, "Juan Pérez")
        self.assertEqual(self.lead.email, "juan@example.com")

    def test_lead_conversion(self):
        # Verificar que inicialmente no hay cliente convertido
        self.assertIsNone(self.lead.cliente_convertido)
        self.assertEqual(self.campana.conversiones, 0)
        
        # Actualizar leads_generados antes de convertir
        self.campana.leads_generados = 1
        self.campana.save()
        
        # Convertir lead a cliente
        cliente = self.lead.convertir_a_cliente()
        
        # Verificar conversión
        self.assertIsNotNone(self.lead.cliente_convertido)
        self.assertEqual(cliente.nombre, "Juan Pérez")
        self.assertEqual(cliente.email, "juan@example.com")
        self.assertEqual(self.lead.estado, 'ganado')
        self.assertEqual(self.campana.conversiones, 1)
        
        # Verificar tasa de conversión
        self.assertEqual(self.campana.tasa_conversion, 100.0)  # 1 conversión de 1 lead

    def test_campana_metrics(self):
        # Crear más leads
        Lead.objects.create(
            nombre="María García",
            email="maria@example.com",
            campana=self.campana,
            fuente="campana"
        )
        
        # Actualizar métricas
        self.campana.leads_generados = 2
        self.campana.save()
        
        # Convertir uno
        self.lead.convertir_a_cliente()
        
        # Verificar métricas
        self.assertEqual(self.campana.leads_generados, 2)
        self.assertEqual(self.campana.conversiones, 1)
        self.assertEqual(self.campana.tasa_conversion, 50.0)
