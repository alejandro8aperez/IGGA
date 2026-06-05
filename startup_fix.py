#!/usr/bin/env python
"""
Script de emergencia para inicializar Render sin Shell.
Se ejecuta automáticamente al arrancar Gunicorn.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db import connection

User = get_user_model()

def ensure_superuser():
    """Crea superusuario si no existe ninguno."""
    if User.objects.filter(is_superuser=True).exists():
        print("✅ Superusuario ya existe. Saltando.")
        return
    
    print("⚠️ No hay superusuario. Creando 'admin'...")
    
    # Crear usuario
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
    
    # Crear tabla de perfil si no existe
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
        
        cursor.execute("""
            INSERT INTO usuarios_perfilusuario (user_id, cargo, activo)
            VALUES (%s, 'Administrador', TRUE)
            ON CONFLICT DO NOTHING
        """, [user.id])
    
    print(f"✅ Superusuario 'admin' creado con password: {password}")

if __name__ == '__main__':
    ensure_superuser()
