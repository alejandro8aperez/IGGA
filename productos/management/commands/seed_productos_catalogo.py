"""Carga catálogos iniciales: grupos de material SAP y tipos de empaque."""
from django.core.management.base import BaseCommand
from productos.models import GrupoMaterial, TipoEmpaque, FamiliaProducto

GRUPOS = [
    ('ROH', 'Materia prima', 'Raw materials'),
    ('HALB', 'Semielaborado', 'Semi-finished products'),
    ('FERT', 'Producto terminado', 'Finished products'),
    ('HAWA', 'Mercancía', 'Trading goods'),
    ('VERP', 'Material de empaque', 'Packaging materials'),
    ('ERSA', 'Repuestos', 'Spare parts'),
    ('NLAG', 'Material no valorable', 'Non-stock materials'),
    ('DIEN', 'Servicios', 'Services'),
]

TIPOS_EMPAQUE = [
    ('CAJ', 'Caja / Cartón'),
    ('BOL', 'Bolsa'),
    ('PAL', 'Pallet / Estiba'),
    ('BLT', 'Bulto'),
    ('TAR', 'Tarro / Envase'),
    ('BOT', 'Botella'),
    ('TUB', 'Tubo'),
    ('ROL', 'Rollo'),
    ('SAC', 'Saco'),
    ('UND', 'Unidad suelta'),
]

FAMILIAS = [
    ('GEN', 'General'),
    ('ELE', 'Eléctrico'),
    ('MEC', 'Mecánico'),
    ('QUI', 'Químico'),
    ('ALM', 'Alimentos'),
]


class Command(BaseCommand):
    help = 'Carga grupos de material, familias y tipos de empaque estilo SAP'

    def handle(self, *args, **options):
        for codigo, nombre, desc in GRUPOS:
            GrupoMaterial.objects.get_or_create(
                codigo=codigo,
                defaults={'nombre': nombre, 'descripcion': desc},
            )
        for codigo, nombre in TIPOS_EMPAQUE:
            TipoEmpaque.objects.get_or_create(codigo=codigo, defaults={'nombre': nombre})
        for codigo, nombre in FAMILIAS:
            FamiliaProducto.objects.get_or_create(codigo=codigo, defaults={'nombre': nombre})

        self.stdout.write(self.style.SUCCESS(
            f'Catálogo listo: {GrupoMaterial.objects.count()} grupos, '
            f'{TipoEmpaque.objects.count()} tipos empaque, '
            f'{FamiliaProducto.objects.count()} familias'
        ))
