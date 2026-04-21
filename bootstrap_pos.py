import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from crm.models import Cliente
from facturacion.models import ResolucionFacturacion
from django.utils import timezone
from datetime import timedelta

def bootstrap():
    print("Iniciando Bootstrap de POS...")
    
    # 1. Crear Cliente Consumidor Final
    cliente, created = Cliente.objects.get_or_create(
        cedula='222222222222',
        defaults={
            'nombre': 'CONSUMIDOR FINAL',
            'email': 'consumidor@final.com',
            'telefono': '0000000',
            'direccion': 'Ciudad'
        }
    )
    if created:
        print(f"Cliente 'CONSUMIDOR FINAL' creado.")
    else:
        print(f"Cliente 'CONSUMIDOR FINAL' ya existe.")

    # 2. Crear Resolución de Facturación POS
    resolucion, created = ResolucionFacturacion.objects.get_or_create(
        prefijo='POS',
        activa=True,
        defaults={
            'numero_inicial': 1,
            'numero_final': 999999,
            'numero_actual': 1,
            'fecha_fin': timezone.now().date() + timedelta(days=365)
        }
    )
    if created:
        print(f"Resolución de facturación 'POS' creada.")
    else:
        print(f"Resolución de facturación 'POS' ya existe.")

    print("Bootstrap completado con éxito.")

if __name__ == '__main__':
    bootstrap()
