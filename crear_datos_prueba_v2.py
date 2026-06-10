#!/usr/bin/env python
"""
Script para poblar ERP-8AMPERIOS con datos de prueba.
Detecta automaticamente los campos de cada modelo.
Ejecutar desde la raiz del proyecto:
    python crear_datos_prueba_v2.py
"""

import os
import sys
import django
from datetime import date, datetime

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import models
import random
from decimal import Decimal

User = get_user_model()

def get_model_fields(model_class):
    """Obtiene los nombres de campos de un modelo"""
    return [f.name for f in model_class._meta.get_fields() if not f.auto_created]

def create_instance(model_class, data):
    """Crea una instancia usando solo los campos que existen en el modelo"""
    fields = get_model_fields(model_class)
    filtered_data = {k: v for k, v in data.items() if k in fields}

    # Manejar campos de fecha/hora
    for field_name in filtered_data:
        field = model_class._meta.get_field(field_name)
        if isinstance(field, models.DateTimeField) and isinstance(filtered_data[field_name], date):
            filtered_data[field_name] = datetime.combine(filtered_data[field_name], datetime.min.time())
        if isinstance(field, models.DateField) and isinstance(filtered_data[field_name], datetime):
            filtered_data[field_name] = filtered_data[field_name].date()

    return model_class.objects.create(**filtered_data)

def get_or_create_instance(model_class, lookup_field, lookup_value, data):
    """Busca por campo de lookup, si no existe crea con datos filtrados"""
    fields = get_model_fields(model_class)

    if lookup_field not in fields:
        return None, False

    try:
        kwargs = {lookup_field: lookup_value}
        instance = model_class.objects.get(**kwargs)
        return instance, False
    except model_class.DoesNotExist:
        filtered_data = {k: v for k, v in data.items() if k in fields}

        # Manejar campos de fecha/hora
        for field_name in filtered_data:
            field = model_class._meta.get_field(field_name)
            if isinstance(field, models.DateTimeField) and isinstance(filtered_data[field_name], date):
                filtered_data[field_name] = datetime.combine(filtered_data[field_name], datetime.min.time())
            if isinstance(field, models.DateField) and isinstance(filtered_data[field_name], datetime):
                filtered_data[field_name] = filtered_data[field_name].date()

        instance = model_class.objects.create(**filtered_data)
        return instance, True

print("=" * 60)
print("  CREANDO DATOS DE PRUEBA - ERP 8AMPERIOS")
print("  (Detectando campos automaticamente)")
print("=" * 60)

# ============================================================
# 1. USUARIOS
# ============================================================
print("\n[1/15] Creando usuarios...")
usuarios_data = [
    {"username": "vendedor1", "email": "vendedor1@8amperios.com", "first_name": "Carlos", "last_name": "Rodriguez", "password": "test12345"},
    {"username": "contador1", "email": "contador1@8amperios.com", "first_name": "Ana", "last_name": "Martinez", "password": "test12345"},
    {"username": "almacen1", "email": "almacen1@8amperios.com", "first_name": "Luis", "last_name": "Garcia", "password": "test12345"},
    {"username": "gerente1", "email": "gerente1@8amperios.com", "first_name": "Maria", "last_name": "Lopez", "password": "test12345"},
    {"username": "tecnico1", "email": "tecnico1@8amperios.com", "first_name": "Pedro", "last_name": "Sanchez", "password": "test12345"},
]

usuarios_creados = []
for data in usuarios_data:
    user, created = User.objects.get_or_create(
        username=data["username"],
        defaults={k: v for k, v in data.items() if k != "password"}
    )
    if created:
        user.set_password(data["password"])
        user.save()
        usuarios_creados.append(user)
        print(f"  + Usuario creado: {user.username}")
    else:
        print(f"  = Usuario ya existe: {user.username}")

# ============================================================
# 2. CLIENTES (CRM)
# ============================================================
print("\n[2/15] Creando clientes...")
try:
    from crm.models import Cliente
    fields = get_model_fields(Cliente)
    print(f"  Campos detectados: {fields}")

    clientes_data = []
    for i in range(5):
        data = {
            "nombre": f"Cliente Empresa {i+1} S.A.S.",
            "nit": f"900{i+1}00000-{i+1}",
            "email": f"contacto{i+1}@empresa{i+1}.com",
            "telefono": f"300{i+1}000000",
            "direccion": f"Calle {i+1}00 # {i+1}0-{i+1}0, Bogota",
            "ciudad": "Bogota",
            "estado": "activo",
        }
        # Filtrar solo campos que existen
        filtered = {k: v for k, v in data.items() if k in fields}

        # Buscar campo unico para get_or_create
        unique_field = None
        for f in ["nit", "cedula", "numero_documento", "email"]:
            if f in fields:
                unique_field = f
                break

        if unique_field:
            instance, created = get_or_create_instance(Cliente, unique_field, filtered.get(unique_field), filtered)
            if instance:
                print(f"  {'+' if created else '='} Cliente: {getattr(instance, 'nombre', instance.id)}")
            else:
                print(f"  ! No se pudo crear cliente {i+1}")
        else:
            instance = Cliente.objects.create(**filtered)
            print(f"  + Cliente creado: {getattr(instance, 'nombre', instance.id)}")
except Exception as e:
    print(f"  ! Error en clientes: {e}")

# ============================================================
# 3. PROVEEDORES
# ============================================================
print("\n[3/15] Creando proveedores...")
try:
    from compras.models import Proveedor
    fields = get_model_fields(Proveedor)
    print(f"  Campos detectados: {fields}")

    for i in range(5):
        data = {
            "razon_social": f"Proveedor Electrico {i+1} Ltda.",
            "nit": f"800{i+1}00000-{i+1}",
            "contacto_nombre": f"Contacto {i+1}",
            "contacto_email": f"ventas{i+1}@proveedor{i+1}.com",
            "contacto_telefono": f"310{i+1}000000",
            "direccion": f"Zona Industrial {i+1}, Bogota",
            "categoria": "electricos",
            "estado": "activo",
        }
        filtered = {k: v for k, v in data.items() if k in fields}

        unique_field = None
        for f in ["nit", "razon_social"]:
            if f in fields:
                unique_field = f
                break

        if unique_field:
            instance, created = get_or_create_instance(Proveedor, unique_field, filtered.get(unique_field), filtered)
            if instance:
                print(f"  {'+' if created else '='} Proveedor: {getattr(instance, 'razon_social', instance.id)}")
        else:
            instance = Proveedor.objects.create(**filtered)
            print(f"  + Proveedor creado: {getattr(instance, 'razon_social', instance.id)}")
except Exception as e:
    print(f"  ! Error en proveedores: {e}")

# ============================================================
# 4. PRODUCTOS
# ============================================================
print("\n[4/15] Creando productos...")
try:
    from productos.models import Producto
    fields = get_model_fields(Producto)
    print(f"  Campos detectados: {fields}")

    productos_nombres = [
        ("CAB-001", "Cable THW 12 AWG Rojo", "cables", 1250),
        ("TRA-001", "Transformador 15KVA Trifasico", "transformadores", 2850000),
        ("LED-001", "Panel LED 60W 6000K", "iluminacion", 45000),
        ("BRK-001", "Breaker 2P 30A", "proteccion", 28000),
        ("TUB-001", "Tubo PVC Conduit 1/2\"", "conduit", 8500),
    ]

    for codigo, nombre, categoria, precio in productos_nombres:
        data = {
            "codigo_sku": codigo,
            "nombre": nombre,
            "descripcion": f"Producto de prueba: {nombre}",
            "categoria": categoria,
            "precio_venta": Decimal(str(precio)),
            "stock_actual": random.randint(10, 100),
            "unidad_medida": "unidad",
            "activo": True,
        }
        filtered = {k: v for k, v in data.items() if k in fields}

        unique_field = None
        for f in ["codigo_sku", "nombre", "referencia_fabrica"]:
            if f in fields:
                unique_field = f
                break

        if unique_field:
            instance, created = get_or_create_instance(Producto, unique_field, filtered.get(unique_field), filtered)
            if instance:
                print(f"  {'+' if created else '='} Producto: {getattr(instance, 'nombre', instance.id)}")
        else:
            instance = Producto.objects.create(**filtered)
            print(f"  + Producto creado: {getattr(instance, 'nombre', instance.id)}")
except Exception as e:
    print(f"  ! Error en productos: {e}")

# ============================================================
# 5. INFORMES DIARIOS
# ============================================================
print("\n[5/15] Creando informes diarios...")
try:
    from informe_diario.models import InformeDiario
    fields = get_model_fields(InformeDiario)
    print(f"  Campos detectados: {fields}")

    turnos = ["manana", "tarde", "noche"]
    supervisores = ["Carlos Rodriguez", "Ana Martinez", "Luis Garcia", "Maria Lopez", "Pedro Sanchez"]

    for i in range(5):
        data = {
            "fecha": timezone.now().date(),
            "turno": turnos[i % 3],
            "observaciones_generales": f"Informe de prueba {i+1}. Actividades realizadas correctamente.",
            "status": "completado",
        }
        # Mapear campos comunes
        if "elaborado_por" in fields:
            data["elaborado_por"] = supervisores[i]
        if "creado_por_id" in fields and User.objects.filter(username="vendedor1").exists():
            data["creado_por_id"] = User.objects.get(username="vendedor1").id

        filtered = {k: v for k, v in data.items() if k in fields}
        instance = InformeDiario.objects.create(**filtered)
        print(f"  + Informe creado: {instance.id} - {getattr(instance, 'fecha', '')}")
except Exception as e:
    print(f"  ! Error en informes diarios: {e}")

# ============================================================
# 6. ORDENES DE COMPRA
# ============================================================
print("\n[6/15] Creando ordenes de compra...")
try:
    from compras.models import OrdenCompra
    fields = get_model_fields(OrdenCompra)
    print(f"  Campos detectados: {fields}")

    estados = ["pendiente", "aprobada", "recibida"]
    for i in range(5):
        data = {
            "numero": f"OC-2024-{i+1:03d}",
            "fecha_emision": timezone.now().date(),
            "total": Decimal(str(random.randint(500000, 5000000))),
            "estado": estados[i % 3],
            "observaciones": f"Orden de compra de prueba {i+1}",
        }
        filtered = {k: v for k, v in data.items() if k in fields}

        unique_field = None
        for f in ["numero", "id"]:
            if f in fields:
                unique_field = f
                break

        if unique_field:
            instance, created = get_or_create_instance(OrdenCompra, unique_field, filtered.get(unique_field), filtered)
            if instance:
                print(f"  {'+' if created else '='} Orden: {getattr(instance, 'numero', instance.id)}")
        else:
            instance = OrdenCompra.objects.create(**filtered)
            print(f"  + Orden creada: {getattr(instance, 'numero', instance.id)}")
except Exception as e:
    print(f"  ! Error en ordenes de compra: {e}")

# ============================================================
# 7. FACTURAS
# ============================================================
print("\n[7/15] Creando facturas...")
try:
    from facturacion.models import Factura
    fields = get_model_fields(Factura)
    print(f"  Campos detectados: {fields}")

    for i in range(5):
        subtotal = Decimal(str(random.randint(1000000, 5000000)))
        iva = subtotal * Decimal("0.19")
        total = subtotal + iva

        data = {
            "numero_factura": f"FAC-2024-{i+1:03d}",
            "fecha_emision": timezone.now().date(),
            "subtotal": subtotal,
            "iva_total": iva,
            "total": total,
            "estado_dian": "aprobada" if i % 2 == 0 else "pendiente",
        }
        filtered = {k: v for k, v in data.items() if k in fields}

        unique_field = None
        for f in ["numero_factura", "id"]:
            if f in fields:
                unique_field = f
                break

        if unique_field:
            instance, created = get_or_create_instance(Factura, unique_field, filtered.get(unique_field), filtered)
            if instance:
                print(f"  {'+' if created else '='} Factura: {getattr(instance, 'numero_factura', instance.id)}")
        else:
            instance = Factura.objects.create(**filtered)
            print(f"  + Factura creada: {getattr(instance, 'numero_factura', instance.id)}")
except Exception as e:
    print(f"  ! Error en facturas: {e}")

# ============================================================
# 8. PROYECTOS
# ============================================================
print("\n[8/15] Creando proyectos...")
try:
    from proyectos.models import Proyecto
    fields = get_model_fields(Proyecto)
    print(f"  Campos detectados: {fields}")

    for i in range(5):
        data = {
            "nombre": f"Proyecto Electrico {i+1}",
            "descripcion": f"Descripcion del proyecto {i+1}",
            "fecha_inicio": timezone.now().date(),
            "estado": ["planificado", "en_progreso", "completado"][i % 3],
            "presupuesto": Decimal(str(random.randint(5000000, 25000000))),
        }
        filtered = {k: v for k, v in data.items() if k in fields}

        unique_field = None
        for f in ["nombre", "id"]:
            if f in fields:
                unique_field = f
                break

        if unique_field:
            instance, created = get_or_create_instance(Proyecto, unique_field, filtered.get(unique_field), filtered)
            if instance:
                print(f"  {'+' if created else '='} Proyecto: {getattr(instance, 'nombre', instance.id)}")
        else:
            instance = Proyecto.objects.create(**filtered)
            print(f"  + Proyecto creado: {getattr(instance, 'nombre', instance.id)}")
except Exception as e:
    print(f"  ! Error en proyectos: {e}")

# ============================================================
# 9. EMPLEADOS (RRHH)
# ============================================================
print("\n[9/15] Creando empleados...")
try:
    from rrhh.models import Empleado
    fields = get_model_fields(Empleado)
    print(f"  Campos detectados: {fields}")

    nombres = [
        ("Juan Carlos", "Mendoza"),
        ("Diana Patricia", "Torres"),
        ("Luis Alberto", "Garcia"),
        ("Maria Fernanda", "Lopez"),
        ("Pedro Jose", "Sanchez"),
    ]

    for i, (nombre, apellido) in enumerate(nombres):
        data = {
            "primer_nombre": nombre.split()[0],
            "segundo_nombre": nombre.split()[1] if len(nombre.split()) > 1 else "",
            "primer_apellido": apellido,
            "cargo": ["Ingeniero", "Contador", "Tecnico", "Gerente", "Almacenista"][i],
            "departamento": ["Proyectos", "Contabilidad", "Operaciones", "Ventas", "Logistica"][i],
            "salario_basico": Decimal(str(random.randint(2000000, 5500000))),
            "fecha_ingreso": timezone.now().date(),
            "estado": "activo",
        }
        filtered = {k: v for k, v in data.items() if k in fields}

        unique_field = None
        for f in ["numero_documento", "correo_corporativo", "id"]:
            if f in fields:
                unique_field = f
                break

        if unique_field and unique_field != "id":
            if unique_field == "numero_documento":
                lookup_value = f"{i+1}00000000"
                filtered[unique_field] = lookup_value
            instance, created = get_or_create_instance(Empleado, unique_field, filtered.get(unique_field), filtered)
            if instance:
                print(f"  {'+' if created else '='} Empleado: {getattr(instance, 'primer_nombre', instance.id)} {getattr(instance, 'primer_apellido', '')}")
        else:
            instance = Empleado.objects.create(**filtered)
            print(f"  + Empleado creado: {getattr(instance, 'primer_nombre', instance.id)}")
except Exception as e:
    print(f"  ! Error en empleados: {e}")

# ============================================================
# 10. MOVIMIENTOS INVENTARIO
# ============================================================
print("\n[10/15] Creando movimientos de inventario...")
try:
    from inventarios.models import MovimientoInventario
    fields = get_model_fields(MovimientoInventario)
    print(f"  Campos detectados: {fields}")

    tipos = ["entrada", "salida"]
    for i in range(5):
        data = {
            "tipo": tipos[i % 2],
            "cantidad": random.randint(5, 50),
            "fecha": timezone.now(),
            "descripcion": f"Movimiento de prueba {i+1}",
        }
        filtered = {k: v for k, v in data.items() if k in fields}
        instance = MovimientoInventario.objects.create(**filtered)
        print(f"  + Movimiento: {getattr(instance, 'tipo', '')} - {getattr(instance, 'cantidad', '')}")
except Exception as e:
    print(f"  ! Error en movimientos: {e}")

# ============================================================
# 11. TESORERIA
# ============================================================
print("\n[11/15] Creando transacciones de tesoreria...")
try:
    # Intentar importar diferentes modelos posibles
    try:
        from tesoreria.models import MovimientoTesoreria as Transaccion
    except ImportError:
        try:
            from tesoreria.models import Transaccion
        except ImportError:
            from tesoreria.models import Pago
            Transaccion = Pago

    fields = get_model_fields(Transaccion)
    print(f"  Campos detectados: {fields}")

    for i in range(5):
        data = {
            "tipo": ["ingreso", "egreso"][i % 2],
            "monto": Decimal(str(random.randint(1000000, 5000000))),
            "fecha": timezone.now().date(),
            "estado": "completado",
        }
        # Mapear campos comunes
        if "concepto" in fields:
            data["concepto"] = f"Transaccion de prueba {i+1}"
        if "descripcion" in fields:
            data["descripcion"] = f"Descripcion transaccion {i+1}"

        filtered = {k: v for k, v in data.items() if k in fields}
        instance = Transaccion.objects.create(**filtered)
        print(f"  + Transaccion: {getattr(instance, 'tipo', '')} - ${getattr(instance, 'monto', '')}")
except Exception as e:
    print(f"  ! Error en tesoreria: {e}")

# ============================================================
# 12. MANTENIMIENTO
# ============================================================
print("\n[12/15] Creando ordenes de mantenimiento...")
try:
    from mantenimiento.models import OrdenMantenimiento
    fields = get_model_fields(OrdenMantenimiento)
    print(f"  Campos detectados: {fields}")

    for i in range(5):
        data = {
            "numero": f"OM-2024-{i+1:03d}",
            "equipo": f"Equipo Electrico {i+1}",
            "tipo": ["preventivo", "correctivo"][i % 2],
            "fecha_programada": timezone.now().date(),
            "estado": ["programado", "en_progreso", "completado"][i % 3],
            "descripcion": f"Mantenimiento de prueba {i+1}",
        }
        filtered = {k: v for k, v in data.items() if k in fields}

        unique_field = None
        for f in ["numero", "id"]:
            if f in fields:
                unique_field = f
                break

        if unique_field:
            instance, created = get_or_create_instance(OrdenMantenimiento, unique_field, filtered.get(unique_field), filtered)
            if instance:
                print(f"  {'+' if created else '='} Orden: {getattr(instance, 'numero', instance.id)}")
        else:
            instance = OrdenMantenimiento.objects.create(**filtered)
            print(f"  + Orden creada: {getattr(instance, 'numero', instance.id)}")
except Exception as e:
    print(f"  ! Error en mantenimiento: {e}")

# ============================================================
# 13. CALIDAD
# ============================================================
print("\n[13/15] Creando inspecciones de calidad...")
try:
    from calidad.models import Inspeccion
    fields = get_model_fields(Inspeccion)
    print(f"  Campos detectados: {fields}")

    for i in range(5):
        data = {
            "fecha_inspeccion": timezone.now().date(),
            "inspector": f"Inspector {i+1}",
            "resultado": ["aprobado", "rechazado", "observaciones"][i % 3],
            "observaciones": f"Inspeccion de prueba {i+1}",
        }
        filtered = {k: v for k, v in data.items() if k in fields}
        instance = Inspeccion.objects.create(**filtered)
        print(f"  + Inspeccion: {getattr(instance, 'resultado', '')}")
except Exception as e:
    print(f"  ! Error en calidad: {e}")

# ============================================================
# 14. MARKETING
# ============================================================
print("\n[14/15] Creando campañas de marketing...")
try:
    from marketing.models import Campana
    fields = get_model_fields(Campana)
    print(f"  Campos detectados: {fields}")

    for i in range(5):
        data = {
            "nombre": f"Campaña Prueba {i+1}",
            "descripcion": f"Descripcion campaña {i+1}",
            "fecha_inicio": timezone.now().date(),
            "presupuesto": Decimal(str(random.randint(1000000, 5000000))),
            "estado": ["activa", "planificada", "completada"][i % 3],
        }
        filtered = {k: v for k, v in data.items() if k in fields}

        unique_field = None
        for f in ["nombre", "numero_campana", "id"]:
            if f in fields:
                unique_field = f
                break

        if unique_field:
            instance, created = get_or_create_instance(Campana, unique_field, filtered.get(unique_field), filtered)
            if instance:
                print(f"  {'+' if created else '='} Campaña: {getattr(instance, 'nombre', instance.id)}")
        else:
            instance = Campana.objects.create(**filtered)
            print(f"  + Campaña creada: {getattr(instance, 'nombre', instance.id)}")
except Exception as e:
    print(f"  ! Error en marketing: {e}")

# ============================================================
# 15. LOGISTICA
# ============================================================
print("\n[15/15] Creando envios...")
try:
    from logistica.models import Envio
    fields = get_model_fields(Envio)
    print(f"  Campos detectados: {fields}")

    for i in range(5):
        data = {
            "numero_envio": f"ENV-2024-{i+1:03d}",
            "fecha_envio": timezone.now().date(),
            "estado": ["preparacion", "transito", "entregado"][i % 3],
            "peso_total": random.randint(10, 100),
        }
        filtered = {k: v for k, v in data.items() if k in fields}

        unique_field = None
        for f in ["numero_envio", "id"]:
            if f in fields:
                unique_field = f
                break

        if unique_field:
            instance, created = get_or_create_instance(Envio, unique_field, filtered.get(unique_field), filtered)
            if instance:
                print(f"  {'+' if created else '='} Envio: {getattr(instance, 'numero_envio', instance.id)}")
        else:
            instance = Envio.objects.create(**filtered)
            print(f"  + Envio creado: {getattr(instance, 'numero_envio', instance.id)}")
except Exception as e:
    print(f"  ! Error en logistica: {e}")

# ============================================================
# RESUMEN FINAL
# ============================================================
print("\n" + "=" * 60)
print("  PROCESO COMPLETADO")
print("=" * 60)
print("\nRevisa los mensajes arriba para ver que se creo correctamente.")
print("Los datos de prueba estan listos en tu ERP!")
print("=" * 60)
