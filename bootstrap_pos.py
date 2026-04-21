import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from crm.models import Cliente
from facturacion.models import ResolucionFacturacion
from inventarios.models import Categoria, Producto
from django.utils import timezone
from datetime import timedelta

def bootstrap():
    print("Iniciando Bootstrap de POS para Panadería LA BOQUILLA...")
    
    # 1. Crear Cliente Consumidor Final
    cliente, _ = Cliente.objects.get_or_create(
        cedula='222222222222',
        defaults={
            'nombre': 'CONSUMIDOR FINAL',
            'email': 'consumidor@final.com',
            'telefono': '0000000',
            'direccion': 'Ciudad'
        }
    )
    print("- Cliente consumidior final listo.")

    # 2. Crear Resolución de Facturación POS
    ResolucionFacturacion.objects.get_or_create(
        prefijo='POS',
        activa=True,
        defaults={
            'numero_inicial': 1,
            'numero_final': 999999,
            'numero_actual': 1,
            'fecha_fin': timezone.now().date() + timedelta(days=365)
        }
    )
    print("- Resolución POS lista.")

    # 3. Datos de la Panadería (Categorías y Productos)
    data_panaderia = {
        'Panadería': [
            {'sku': 'PAN001', 'nombre': 'Pan Aliñado Grande', 'precio': 5000},
            {'sku': 'PAN002', 'nombre': 'Pan de Bono (Ud)', 'precio': 2000},
            {'sku': 'PAN003', 'nombre': 'Buñuelo Calientico', 'precio': 1500},
            {'sku': 'PAN004', 'nombre': 'Croissant de Mantequilla', 'precio': 4500},
            {'sku': 'PAN005', 'nombre': 'Pan de Queso', 'precio': 2500},
        ],
        'Pastelería': [
            {'sku': 'PAS001', 'nombre': 'Pastel de Pollo', 'precio': 5500},
            {'sku': 'PAS002', 'nombre': 'Milhoja de Arequipe', 'precio': 6500},
            {'sku': 'PAS003', 'nombre': 'Torta de Chocolate (Porción)', 'precio': 8000},
            {'sku': 'PAS004', 'nombre': 'Donas Variadas', 'precio': 4000},
        ],
        'Cafetería y Bebidas': [
            {'sku': 'BEB001', 'nombre': 'Café Tinto', 'precio': 2500},
            {'sku': 'BEB002', 'nombre': 'Café con Leche', 'precio': 4000},
            {'sku': 'BEB003', 'nombre': 'Gaseosa Mini', 'precio': 2500},
            {'sku': 'BEB004', 'nombre': 'Jugo Natural', 'precio': 6000},
            {'sku': 'BEB005', 'nombre': 'Chocolate Santafereño', 'precio': 4500},
        ]
    }

    for cat_name, productos in data_panaderia.items():
        categoria, _ = Categoria.objects.get_or_create(nombre=cat_name)
        for prod in productos:
            Producto.objects.update_or_create(
                codigo_sku=prod['sku'],
                defaults={
                    'nombre': prod['nombre'],
                    'categoria': categoria,
                    'precio_venta': prod['precio'],
                    'precio_compra': prod['precio'] * 0.6, # Estimación de costo
                    'stock_actual': 100
                }
            )
    
    print("- Productos de panadería cargados con éxito.")
    print("¡Bootstrap completado!")

if __name__ == '__main__':
    bootstrap()
