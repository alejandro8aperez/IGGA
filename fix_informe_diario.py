#!/usr/bin/env python
"""
fix_informe_diario.py - Script de reparación para el módulo informe_diario
ERP-8AMPERIOS

Instrucciones:
1. Copiar este archivo a la raíz del proyecto Django
2. Ejecutar: python fix_informe_diario.py
3. Reiniciar el servidor Django
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    django.setup()
except Exception as e:
    print(f"❌ Error al configurar Django: {e}")
    print("Asegúrate de ejecutar este script desde la raíz del proyecto.")
    sys.exit(1)

from django.core.management import call_command
from django.db import connection


def check_migrations():
    """Verifica si hay migraciones pendientes."""
    print("\n🔍 Verificando migraciones pendientes...")
    try:
        call_command('showmigrations', 'informe_diario', '--plan')
    except Exception as e:
        print(f"⚠️  No se pudo verificar migraciones: {e}")


def create_migrations():
    """Crea migraciones para informe_diario."""
    print("\n📝 Creando migraciones...")
    try:
        call_command('makemigrations', 'informe_diario')
        print("✅ Migraciones creadas")
    except Exception as e:
        print(f"❌ Error creando migraciones: {e}")


def apply_migrations():
    """Aplica las migraciones."""
    print("\n🚀 Aplicando migraciones...")
    try:
        call_command('migrate', 'informe_diario')
        print("✅ Migraciones aplicadas")
    except Exception as e:
        print(f"❌ Error aplicando migraciones: {e}")


def verify_model():
    """Verifica que el modelo funcione correctamente."""
    print("\n🔎 Verificando modelo InformeDiario...")
    try:
        from informe_diario.models import InformeDiario
        count = InformeDiario.objects.count()
        print(f"✅ Modelo OK. Total de informes: {count}")

        # Verificar que las properties funcionen
        if count > 0:
            informe = InformeDiario.objects.first()
            print(f"   - Total personal: {informe.total_personal}")
            print(f"   - Total maquinaria: {informe.total_maquinaria}")
            print(f"   - Horas lluvia: {informe.total_horas_lluvia}")
    except Exception as e:
        print(f"❌ Error verificando modelo: {e}")


def verify_api():
    """Verifica que la API responda correctamente."""
    print("\n🌐 Verificando endpoint de la API...")
    try:
        from django.test import Client
        client = Client()

        # Probar endpoint de listado
        response = client.get('/api/informe-diario/informes/')
        print(f"   - Status code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"   - Resultados: {len(data.get('results', []))}")
            print("✅ API respondiendo correctamente")
        else:
            print(f"⚠️  API respondió con status {response.status_code}")
            print(f"   Respuesta: {response.content.decode()[:200]}")
    except Exception as e:
        print(f"❌ Error verificando API: {e}")


def main():
    print("=" * 60)
    print("  REPARACIÓN MÓDULO INFORME DIARIO - ERP-8AMPERIOS")
    print("=" * 60)

    check_migrations()
    create_migrations()
    apply_migrations()
    verify_model()
    verify_api()

    print("\n" + "=" * 60)
    print("  PROCESO COMPLETADO")
    print("=" * 60)
    print("\n📋 Próximos pasos:")
    print("   1. Reinicia el servidor Django: python manage.py runserver")
    print("   2. Verifica que el frontend pueda conectarse")
    print("   3. Prueba crear un informe diario")


if __name__ == '__main__':
    main()
