#!/usr/bin/env python
import requests
import json

# Test de conexión a la API KAVE
url = "http://localhost:8000/api/kave/quote/"
data = {
    "potencia_kva": "25",
    "vp": "13200", 
    "vs": "220",
    "tipo": "monofasico",
    "material": "silicio"
}

print("🔧 Probando API KAVE con requests...")
print(f"📥 URL: {url}")
print(f"📊 Datos: {json.dumps(data, indent=2)}")

try:
    response = requests.post(url, json=data, timeout=10)
    print(f"✅ Status Code: {response.status_code}")
    print(f"📋 Response Headers: {dict(response.headers)}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"🎉 Respuesta: {json.dumps(result, indent=2)}")
    else:
        print(f"❌ Error Response: {response.text}")
        
except requests.exceptions.ConnectionError as e:
    print(f"❌ Error de Conexión: {e}")
except requests.exceptions.Timeout as e:
    print(f"❌ Timeout: {e}")
except Exception as e:
    print(f"❌ Error General: {e}")
