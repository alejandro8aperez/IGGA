#!/usr/bin/env python
"""
Auto-setup para Render. Se ejecuta en el startCommand.
Crea superusuario, tabla de perfil, y datos semilla si no existen.
"""
import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')

import django
django.setup()

from django.contrib.auth import get_user_model
from django.db import connection, DatabaseError

User = get_user_model()


def run():
    print("=" * 60)
    print("AUTO-SETUP: Verificando inicialización...")
    print("=" * 60)

    # 1. Verificar/Crear superusuario
    if User.objects.filter(is_superuser=True).exists():
        print("✅ Superusuario ya existe.")
    else:
        print("⚠️ Creando superusuario 'admin'...")
        user = User(
            username='admin',
            email='admin@8amperios.com',
            is_superuser=True,
            is_staff=True,
            is_active=True,
        )
        password = os.getenv('ADMIN_PASSWORD', 'admin123456')
        user.set_password(password)
        user.save()
        print(f"✅ Superusuario creado. Password: {password}")

    # 2. Crear tabla de perfil si no existe
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS usuarios_perfilusuario (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES auth_user(id) ON DELETE CASCADE,
                    rol_id INTEGER,
                    cargo VARCHAR(100),
                    telefono VARCHAR(50),
                    foto VARCHAR(100),
                    empresa VARCHAR(100),
                    activo BOOLEAN DEFAULT TRUE,
                    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            print("✅ Tabla usuarios_perfilusuario verificada.")
    except Exception as e:
        print(f"⚠️ Error con tabla perfil: {e}")

    # 3. Crear perfil para admin si no tiene
    try:
        admin = User.objects.get(username='admin')
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO usuarios_perfilusuario (user_id, cargo, activo)
                VALUES (%s, 'Administrador', TRUE)
                ON CONFLICT DO NOTHING
            """, [admin.id])
            print("✅ Perfil de admin verificado.")
    except Exception as e:
        print(f"⚠️ Error con perfil admin: {e}")

    # 4. Datos semilla para Informe Diario
    try:
        from informe_diario.models import Recurso, Obra

        recursos = [
            {"nombre": "Mano de Obra", "tipo": "HUMANO", "unidad": "Hora", "costo_unitario": 15000},
            {"nombre": "Soldador", "tipo": "HUMANO", "unidad": "Hora", "costo_unitario": 25000},
            {"nombre": "Acero Laminado", "tipo": "MATERIAL", "unidad": "Kg", "costo_unitario": 8500},
            {"nombre": "Cobre Esmaltado", "tipo": "MATERIAL", "unidad": "Kg", "costo_unitario": 45000},
            {"nombre": "Aceite Dieléctrico", "tipo": "MATERIAL", "unidad": "Litro", "costo_unitario": 12000},
            {"nombre": "Transporte", "tipo": "SERVICIO", "unidad": "Viaje", "costo_unitario": 180000},
        ]

        for r in recursos:
            Recurso.objects.get_or_create(nombre=r["nombre"], defaults=r)
        print(f"✅ {len(recursos)} recursos creados/verificados.")

        obras = [
            {"codigo": "OB-001", "nombre": "Transformador 500KVA", "cliente": "ElectroHuila", "estado": "EN_PROCESO"},
            {"codigo": "OB-002", "nombre": "Transformador 1000KVA", "cliente": "Celsia", "estado": "PENDIENTE"},
            {"codigo": "OB-003", "nombre": "Mantenimiento Subestación", "cliente": "EPM", "estado": "EN_PROCESO"},
        ]

        for o in obras:
            Obra.objects.get_or_create(codigo=o["codigo"], defaults={**o, "creado_por": admin})
        print(f"✅ {len(obras)} obras creadas/verificadas.")

    except Exception as e:
        print(f"⚠️ Error con datos semilla: {e}")

    print("=" * 60)
    print("AUTO-SETUP: Completo.")
    print("Login con usuario: admin | password: admin123456")
    print("=" * 60)


if __name__ == '__main__':
    run()
