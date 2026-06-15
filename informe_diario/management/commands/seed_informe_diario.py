"""Seed initial data for the Informe Diario module.

Creates default categories, resources, activity buckets and one sample Obra
based on the original Excel "Ampliación SE LA LOMA 500 kV".
"""
from django.core.management.base import BaseCommand
from informe_diario.models import (
    Obra, CategoriaRecurso, Recurso, CategoriaActividad,
)


MAQUINARIA = [
    'CAMIONETAS (Siemens)',
    'GENERADOR DE ENERGIA',
    'BUSETA-VANS',
    'CAMIÓN GRÚA (CTE INTERCOLOMBIA)',
    'GRÚA (CTE INTERCOLOMBIA)',
    'PLATAFORMA ELEVADORA "MANLIFT" (Edemsa)',
    'EQUIPO DE GENERACION FOTOVOLTAICA',
    'CAMIONETAS (Edemsa)',
    'CAMIONETAS (CTE INTERCOLOMBIA)',
    'RETROCARGADOR',
]

PERSONAL = [
    'Coordinadora SST',
    'Supervisor S.S.T (Siemens)',
    'Director de proyecto (Siemens)',
    'Residente Técnico (Siemens)',
    'Ing. Ambiental y Supervisor Ambiental',
    'Oficial de obra Civil',
    'Ayudante técnico (Siemens)',
    'Guarda de seguridad',
    'Supervisor QA-QC',
    'Almacenista',
    'Topógrafo',
    'Programación y Planeación',
    'Conductor camioneta (CTE INTERCOLOMBIA)',
    'Aux Administrativo',
    'Operador de grúa',
    'Conductor (Siemens)',
]

ACT_CATEGORIAS = [
    'ACTIVIDADES ADMINISTRATIVAS Y DOCUMENTALES (INGESED)',
    'ACTIVIDADES DE CABLEADO, CONEXIONADO Y PRUEBAS FUNCIONALES (SIEMENS)',
    'ACTIVIDADES RELACIONADAS CON PRUEBAS DE EQUIPOS Y MONTAJE DE REACTORES (CTE INTERCOLOMBIA)',
    'ACTIVIDADES DE OBRA CIVIL (EDEMSA)',
    'GESTIÓN EN LA SEGURIDAD Y LA SALUD EN EL TRABAJO',
    'ACTIVIDADES AMBIENTALES Y SOCIALES',
]


class Command(BaseCommand):
    help = "Seed initial Informe Diario master data"

    def handle(self, *args, **opts):
        cat_maq, _ = CategoriaRecurso.objects.get_or_create(
            nombre='MAQUINARIA-EQUIPOS-HERRAMIENTAS-VEHICULOS',
            defaults={'orden': 1},
        )
        cat_pers, _ = CategoriaRecurso.objects.get_or_create(
            nombre='PERSONAL DE OBRA',
            defaults={'orden': 2},
        )

        for i, name in enumerate(MAQUINARIA, 1):
            Recurso.objects.get_or_create(
                categoria=cat_maq, nombre=name,
                defaults={'unidad': 'unidad', 'orden': i},
            )
        for i, name in enumerate(PERSONAL, 1):
            Recurso.objects.get_or_create(
                categoria=cat_pers, nombre=name,
                defaults={'unidad': 'persona', 'orden': i},
            )

        for i, name in enumerate(ACT_CATEGORIAS, 1):
            CategoriaActividad.objects.get_or_create(
                nombre=name, defaults={'orden': i},
            )

        Obra.objects.get_or_create(
            codigo='P.SOLA',
            defaults={
                'nombre': 'Ampliación SE LA LOMA 500 kV',
                'ubicacion': 'La Loma',
                'cliente': 'INTERCOLOMBIA',
            },
        )

        self.stdout.write(self.style.SUCCESS(
            f"Seed OK: {CategoriaRecurso.objects.count()} categorías, "
            f"{Recurso.objects.count()} recursos, "
            f"{CategoriaActividad.objects.count()} cat. actividades, "
            f"{Obra.objects.count()} obras."
        ))
