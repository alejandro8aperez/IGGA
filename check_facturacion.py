import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from facturacion_electronica.services import UBLGenerator
from lxml import etree

def main():
    print("Testing UBL Encabezado Generation...")
    data = {
        'tipo_operacion': '10',
        'tipo_documento': '01',
        'prefijo': 'FE',
        'numero': '00001',
        'fecha_emision': '2026-04-29',
        'hora_emision': '15:00:00-05:00',
        'moneda': 'COP',
        'fecha_vencimiento': '2026-05-29',
        'forma_pago': '1',
        'tipo_facturacion': '1',
        'ambiente': '2'
    }
    enc = UBLGenerator.generar_encabezado(data)
    xml_str = etree.tostring(enc, pretty_print=True, encoding='unicode')
    print(xml_str)
    
    print("\nFacturacion Electronica components loaded successfully!")

if __name__ == '__main__':
    main()
