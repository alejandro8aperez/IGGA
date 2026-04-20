#!/usr/bin/env python
import os
import sys
import django
import json

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from kave.engine import api_design_and_quote

# Datos de prueba
test_data = {
    'potencia_kva': '25',
    'vp': '13200',
    'vs': '220',
    'tipo': 'monofasico',
    'material': 'silicio'
}

print("🔧 Probando motor KAVE...")
print(f"📥 Datos de entrada: {json.dumps(test_data, indent=2)}")

try:
    resultado = api_design_and_quote(test_data)
    print(f"✅ Resultado: {json.dumps(resultado, indent=2)}")
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
