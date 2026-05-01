import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from django.contrib.auth.models import Group

grupos = [
    'Administrador',
    'Inventario',
    'Compras',
    'Produccion',
    'Ingenieria',
    'Contabilidad',
    'Gerencia'
]

for nombre in grupos:
    grupo, creado = Group.objects.get_or_create(name=nombre)
    if creado:
        print(f"Grupo creado: {nombre}")
    else:
        print(f"Grupo existente: {nombre}")

print("Inicialización de roles completada.")
