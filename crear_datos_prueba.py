#!/usr/bin/env python
"""
Script para poblar ERP-8AMPERIOS con datos de prueba.
Ejecutar desde la raiz del proyecto:
    python crear_datos_prueba.py
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.utils import timezone
import random
from decimal import Decimal

User = get_user_model()

print("=" * 60)
print("  CREANDO DATOS DE PRUEBA - ERP 8AMPERIOS")
print("=" * 60)

# ============================================================
# 1. USUARIOS (5 usuarios adicionales al superusuario)
# ============================================================
print("\n[1/15] Creando usuarios...")
usuarios_data = [
    {"username": "vendedor1", "email": "vendedor1@8amperios.com", "first_name": "Carlos", "last_name": "Rodriguez", "password": "test12345", "rol": "vendedor"},
    {"username": "contador1", "email": "contador1@8amperios.com", "first_name": "Ana", "last_name": "Martinez", "password": "test12345", "rol": "contador"},
    {"username": "almacen1", "email": "almacen1@8amperios.com", "first_name": "Luis", "last_name": "Garcia", "password": "test12345", "rol": "almacenista"},
    {"username": "gerente1", "email": "gerente1@8amperios.com", "first_name": "Maria", "last_name": "Lopez", "password": "test12345", "rol": "gerente"},
    {"username": "tecnico1", "email": "tecnico1@8amperios.com", "first_name": "Pedro", "last_name": "Sanchez", "password": "test12345", "rol": "tecnico"},
]

usuarios_creados = []
for data in usuarios_data:
    user, created = User.objects.get_or_create(
        username=data["username"],
        defaults={
            "email": data["email"],
            "first_name": data["first_name"],
            "last_name": data["last_name"],
        }
    )
    if created:
        user.set_password(data["password"])
        user.save()
        usuarios_creados.append(user)
        print(f"  + Usuario creado: {user.username} ({data['rol']})")
    else:
        print(f"  = Usuario ya existe: {user.username}")

# ============================================================
# 2. CLIENTES (5 clientes)
# ============================================================
print("\n[2/15] Creando clientes...")
try:
    from crm.models import Cliente

    clientes_data = [
        {"nombre": "Constructora ABC S.A.S.", "nit": "900123456-7", "contacto": "Juan Perez", "telefono": "3001234567", "email": "contacto@abc.com", "direccion": "Calle 123 # 45-67, Bogota", "tipo": "empresa"},
        {"nombre": "Ingenieria Delta Ltda.", "nit": "800987654-3", "contacto": "Diana Torres", "telefono": "3109876543", "email": "info@delta.com", "direccion": "Carrera 45 # 67-89, Medellin", "tipo": "empresa"},
        {"nombre": "Electromontajes Orion", "nit": "901234567-8", "contacto": "Roberto Diaz", "telefono": "3204567890", "email": "ventas@orion.com", "direccion": "Avenida 78 # 12-34, Cali", "tipo": "empresa"},
        {"nombre": "Servicios Electricos Sur", "nit": "902345678-9", "contacto": "Carmen Ruiz", "telefono": "3156789012", "email": "admin@sures.com", "direccion": "Diagonal 56 # 78-90, Barranquilla", "tipo": "empresa"},
        {"nombre": "Proyectos Industriales Norte", "nit": "903456789-0", "contacto": "Andres Vargas", "telefono": "3189012345", "email": "proyectos@pinorte.com", "direccion": "Transversal 34 # 56-78, Cartagena", "tipo": "empresa"},
    ]

    for data in clientes_data:
        cliente, created = Cliente.objects.get_or_create(
            nit=data["nit"],
            defaults=data
        )
        if created:
            print(f"  + Cliente creado: {cliente.nombre}")
        else:
            print(f"  = Cliente ya existe: {cliente.nombre}")
except Exception as e:
    print(f"  ! Error en clientes: {e}")

# ============================================================
# 3. PROVEEDORES (5 proveedores)
# ============================================================
print("\n[3/15] Creando proveedores...")
try:
    from compras.models import Proveedor

    proveedores_data = [
        {"nombre": "Cableados Colombia S.A.", "nit": "800111222-3", "contacto": "Miguel Angel", "telefono": "3011112222", "email": "ventas@cableados.com", "direccion": "Zona Industrial, Bogota", "categoria": "cables"},
        {"nombre": "Transformadores Andinos", "nit": "800222333-4", "contacto": "Laura Jimenez", "telefono": "3022223333", "email": "info@transformandinos.com", "direccion": "Parque Industrial, Medellin", "categoria": "transformadores"},
        {"nombre": "Iluminacion LED Pro", "nit": "800333444-5", "contacto": "Santiago Moreno", "telefono": "3033334444", "email": "pedidos@ledpro.com", "direccion": "Centro Empresarial, Cali", "categoria": "iluminacion"},
        {"nombre": "Seguridad Electrica SAS", "nit": "800444555-6", "contacto": "Patricia Castro", "telefono": "3044445555", "email": "contacto@seguridadelec.com", "direccion": "Via 40 # 72-100, Barranquilla", "categoria": "seguridad"},
        {"nombre": "Herramientas Electricas MX", "nit": "800555666-7", "contacto": "Fernando Rios", "telefono": "3055556666", "email": "ventas@herramientasmx.com", "direccion": "Calle del Comercio, Cartagena", "categoria": "herramientas"},
    ]

    for data in proveedores_data:
        proveedor, created = Proveedor.objects.get_or_create(
            nit=data["nit"],
            defaults=data
        )
        if created:
            print(f"  + Proveedor creado: {proveedor.nombre}")
        else:
            print(f"  = Proveedor ya existe: {proveedor.nombre}")
except Exception as e:
    print(f"  ! Error en proveedores: {e}")

# ============================================================
# 4. PRODUCTOS (5 productos)
# ============================================================
print("\n[4/15] Creando productos...")
try:
    from productos.models import Producto

    productos_data = [
        {"codigo": "CAB-001", "nombre": "Cable THW 12 AWG Rojo", "descripcion": "Cable de cobre calibre 12, 600V, uso general", "categoria": "cables", "precio": Decimal("1250.00"), "stock": 100, "unidad": "metro"},
        {"codigo": "TRA-001", "nombre": "Transformador 15KVA", "descripcion": "Transformador trifasico 15KVA, 220V/440V", "categoria": "transformadores", "precio": Decimal("2850000.00"), "stock": 5, "unidad": "unidad"},
        {"codigo": "LED-001", "nombre": "Luminaria LED 60W", "descripcion": "Panel LED 60W, 6000K, alta eficiencia", "categoria": "iluminacion", "precio": Decimal("45000.00"), "stock": 50, "unidad": "unidad"},
        {"codigo": "BRK-001", "nombre": "Breaker 2P 30A", "descripcion": "Interruptor termomagnetico bipolar 30A", "categoria": "proteccion", "precio": Decimal("28000.00"), "stock": 30, "unidad": "unidad"},
        {"codigo": "TUB-001", "nombre": "Tubo PVC 1/2\"", "descripcion": "Tubo conduit PVC 1/2 pulgada, 3 metros", "categoria": "conduit", "precio": Decimal("8500.00"), "stock": 200, "unidad": "unidad"},
    ]

    for data in productos_data:
        producto, created = Producto.objects.get_or_create(
            codigo=data["codigo"],
            defaults=data
        )
        if created:
            print(f"  + Producto creado: {producto.nombre}")
        else:
            print(f"  = Producto ya existe: {producto.nombre}")
except Exception as e:
    print(f"  ! Error en productos: {e}")

# ============================================================
# 5. INFORMES DIARIOS (5 informes)
# ============================================================
print("\n[5/15] Creando informes diarios...")
try:
    from informe_diario.models import InformeDiario

    informes_data = [
        {"fecha": timezone.now().date(), "turno": "manana", "supervisor": "Carlos Rodriguez", "actividades": "Instalacion de tablero electrico principal en planta A. Verificacion de conexiones y pruebas de aislamiento.", "observaciones": "Trabajo completado sin novedades. Cliente satisfecho.", "estado": "completado"},
        {"fecha": timezone.now().date(), "turno": "tarde", "supervisor": "Ana Martinez", "actividades": "Mantenimiento preventivo transformador 15KVA. Limpieza, ajuste de bornes, medicion de resistencia de aislamiento.", "observaciones": "Transformador en optimas condiciones. Proximo mantenimiento en 3 meses.", "estado": "completado"},
        {"fecha": timezone.now().date(), "turno": "manana", "supervisor": "Luis Garcia", "actividades": "Instalacion de luminarias LED en bodega central. Total 24 unidades instaladas.", "observaciones": "Iluminacion mejorada significativamente. Reduccion de consumo estimada 40%.", "estado": "completado"},
        {"fecha": timezone.now().date(), "turno": "tarde", "supervisor": "Maria Lopez", "actividades": "Diagnostico de falla en sistema de bombeo. Reemplazo de contactor y cableado de control.", "observaciones": "Sistema operando normalmente. Se recomienda monitoreo durante 48 horas.", "estado": "completado"},
        {"fecha": timezone.now().date(), "turno": "manana", "supervisor": "Pedro Sanchez", "actividades": "Cableado de nueva oficina administrativa. 12 puntos de red, 8 puntos de energia, 4 puntos de iluminacion.", "observaciones": "Entrega a satisfaccion. Documentacion de planos as-built entregada.", "estado": "completado"},
    ]

    for i, data in enumerate(informes_data):
        informe, created = InformeDiario.objects.get_or_create(
            fecha=data["fecha"],
            turno=data["turno"],
            supervisor=data["supervisor"],
            defaults=data
        )
        if created:
            print(f"  + Informe creado: {informe.fecha} - {informe.turno} - {informe.supervisor}")
        else:
            print(f"  = Informe ya existe: {informe.fecha} - {informe.turno}")
except Exception as e:
    print(f"  ! Error en informes diarios: {e}")

# ============================================================
# 6. ORDENES DE COMPRA (5 ordenes)
# ============================================================
print("\n[6/15] Creando ordenes de compra...")
try:
    from compras.models import OrdenCompra

    ordenes_data = [
        {"numero": "OC-2024-001", "proveedor_nit": "800111222-3", "fecha": timezone.now().date(), "total": Decimal("1250000.00"), "estado": "aprobada", "observaciones": "Urgente para proyecto ABC"},
        {"numero": "OC-2024-002", "proveedor_nit": "800222333-4", "fecha": timezone.now().date(), "total": Decimal("5700000.00"), "estado": "pendiente", "observaciones": "Transformadores para planta nueva"},
        {"numero": "OC-2024-003", "proveedor_nit": "800333444-5", "fecha": timezone.now().date(), "total": Decimal("900000.00"), "estado": "recibida", "observaciones": "Luminarias para remodelacion"},
        {"numero": "OC-2024-004", "proveedor_nit": "800444555-6", "fecha": timezone.now().date(), "total": Decimal("340000.00"), "estado": "aprobada", "observaciones": "Material de seguridad obreros"},
        {"numero": "OC-2024-005", "proveedor_nit": "800555666-7", "fecha": timezone.now().date(), "total": Decimal("510000.00"), "estado": "pendiente", "observaciones": "Herramientas nuevos tecnicos"},
    ]

    for data in ordenes_data:
        orden, created = OrdenCompra.objects.get_or_create(
            numero=data["numero"],
            defaults=data
        )
        if created:
            print(f"  + Orden creada: {orden.numero}")
        else:
            print(f"  = Orden ya existe: {orden.numero}")
except Exception as e:
    print(f"  ! Error en ordenes de compra: {e}")

# ============================================================
# 7. FACTURAS (5 facturas)
# ============================================================
print("\n[7/15] Creando facturas...")
try:
    from facturacion.models import Factura

    facturas_data = [
        {"numero": "FAC-001", "cliente_nit": "900123456-7", "fecha": timezone.now().date(), "subtotal": Decimal("2500000.00"), "iva": Decimal("475000.00"), "total": Decimal("2975000.00"), "estado": "pagada"},
        {"numero": "FAC-002", "cliente_nit": "800987654-3", "fecha": timezone.now().date(), "subtotal": Decimal("1800000.00"), "iva": Decimal("342000.00"), "total": Decimal("2142000.00"), "estado": "pendiente"},
        {"numero": "FAC-003", "cliente_nit": "901234567-8", "fecha": timezone.now().date(), "subtotal": Decimal("3200000.00"), "iva": Decimal("608000.00"), "total": Decimal("3808000.00"), "estado": "pagada"},
        {"numero": "FAC-004", "cliente_nit": "902345678-9", "fecha": timezone.now().date(), "subtotal": Decimal("950000.00"), "iva": Decimal("180500.00"), "total": Decimal("1130500.00"), "estado": "pendiente"},
        {"numero": "FAC-005", "cliente_nit": "903456789-0", "fecha": timezone.now().date(), "subtotal": Decimal("4100000.00"), "iva": Decimal("779000.00"), "total": Decimal("4879000.00"), "estado": "pagada"},
    ]

    for data in facturas_data:
        factura, created = Factura.objects.get_or_create(
            numero=data["numero"],
            defaults=data
        )
        if created:
            print(f"  + Factura creada: {factura.numero}")
        else:
            print(f"  = Factura ya existe: {factura.numero}")
except Exception as e:
    print(f"  ! Error en facturas: {e}")

# ============================================================
# 8. PROYECTOS (5 proyectos)
# ============================================================
print("\n[8/15] Creando proyectos...")
try:
    from proyectos.models import Proyecto

    proyectos_data = [
        {"codigo": "PROY-001", "nombre": "Instalacion Electrica Planta ABC", "cliente_nit": "900123456-7", "fecha_inicio": timezone.now().date(), "estado": "en_progreso", "presupuesto": Decimal("15000000.00"), "descripcion": "Instalacion completa sistema electrico industrial"},
        {"codigo": "PROY-002", "nombre": "Remodelacion Sistema Iluminacion Delta", "cliente_nit": "800987654-3", "fecha_inicio": timezone.now().date(), "estado": "planificado", "presupuesto": Decimal("8500000.00"), "descripcion": "Cambio a LED y automatizacion de iluminacion"},
        {"codigo": "PROY-003", "nombre": "Subestacion Electrica Orion", "cliente_nit": "901234567-8", "fecha_inicio": timezone.now().date(), "estado": "en_progreso", "presupuesto": Decimal("25000000.00"), "descripcion": "Construccion subestacion 33KV/13.2KV"},
        {"codigo": "PROY-004", "nombre": "Mantenimiento Tableros Sur", "cliente_nit": "902345678-9", "fecha_inicio": timezone.now().date(), "estado": "completado", "presupuesto": Decimal("3200000.00"), "descripcion": "Mantenimiento preventivo 12 tableros de distribucion"},
        {"codigo": "PROY-005", "nombre": "Cableado Estructurado PINorte", "cliente_nit": "903456789-0", "fecha_inicio": timezone.now().date(), "estado": "en_progreso", "presupuesto": Decimal("5600000.00"), "descripcion": "Cableado de red y energia nueva sede"},
    ]

    for data in proyectos_data:
        proyecto, created = Proyecto.objects.get_or_create(
            codigo=data["codigo"],
            defaults=data
        )
        if created:
            print(f"  + Proyecto creado: {proyecto.nombre}")
        else:
            print(f"  = Proyecto ya existe: {proyecto.nombre}")
except Exception as e:
    print(f"  ! Error en proyectos: {e}")

# ============================================================
# 9. EMPLEADOS / RRHH (5 empleados)
# ============================================================
print("\n[9/15] Creando empleados...")
try:
    from rrhh.models import Empleado

    empleados_data = [
        {"codigo": "EMP-001", "nombre": "Juan Carlos Mendoza", "cargo": "Ingeniero Electrico", "departamento": "Proyectos", "salario": Decimal("4500000.00"), "fecha_ingreso": timezone.now().date(), "estado": "activo"},
        {"codigo": "EMP-002", "nombre": "Diana Patricia Torres", "cargo": "Contadora", "departamento": "Contabilidad", "salario": Decimal("3800000.00"), "fecha_ingreso": timezone.now().date(), "estado": "activo"},
        {"codigo": "EMP-003", "nombre": "Luis Alberto Garcia", "cargo": "Tecnico Electricista", "departamento": "Operaciones", "salario": Decimal("2800000.00"), "fecha_ingreso": timezone.now().date(), "estado": "activo"},
        {"codigo": "EMP-004", "nombre": "Maria Fernanda Lopez", "cargo": "Gerente Comercial", "departamento": "Ventas", "salario": Decimal("5200000.00"), "fecha_ingreso": timezone.now().date(), "estado": "activo"},
        {"codigo": "EMP-005", "nombre": "Pedro Jose Sanchez", "cargo": "Almacenista", "departamento": "Logistica", "salario": Decimal("2200000.00"), "fecha_ingreso": timezone.now().date(), "estado": "activo"},
    ]

    for data in empleados_data:
        empleado, created = Empleado.objects.get_or_create(
            codigo=data["codigo"],
            defaults=data
        )
        if created:
            print(f"  + Empleado creado: {empleado.nombre}")
        else:
            print(f"  = Empleado ya existe: {empleado.nombre}")
except Exception as e:
    print(f"  ! Error en empleados: {e}")

# ============================================================
# 10. INVENTARIO / MOVIMIENTOS (5 movimientos)
# ============================================================
print("\n[10/15] Creando movimientos de inventario...")
try:
    from inventarios.models import MovimientoInventario

    movimientos_data = [
        {"tipo": "entrada", "producto_codigo": "CAB-001", "cantidad": 50, "fecha": timezone.now().date(), "observaciones": "Compra proveedor Cableados Colombia", "responsable": "Luis Garcia"},
        {"tipo": "salida", "producto_codigo": "TRA-001", "cantidad": 2, "fecha": timezone.now().date(), "observaciones": "Despacho proyecto Planta ABC", "responsable": "Carlos Rodriguez"},
        {"tipo": "entrada", "producto_codigo": "LED-001", "cantidad": 30, "fecha": timezone.now().date(), "observaciones": "Compra Iluminacion LED Pro", "responsable": "Luis Garcia"},
        {"tipo": "salida", "producto_codigo": "BRK-001", "cantidad": 10, "fecha": timezone.now().date(), "observaciones": "Despacho mantenimiento tableros", "responsable": "Pedro Sanchez"},
        {"tipo": "entrada", "producto_codigo": "TUB-001", "cantidad": 100, "fecha": timezone.now().date(), "observaciones": "Compra mensual conduit", "responsable": "Luis Garcia"},
    ]

    for data in movimientos_data:
        mov, created = MovimientoInventario.objects.get_or_create(
            producto_codigo=data["producto_codigo"],
            fecha=data["fecha"],
            tipo=data["tipo"],
            defaults=data
        )
        if created:
            print(f"  + Movimiento creado: {mov.tipo} - {mov.producto_codigo} - {mov.cantidad}")
        else:
            print(f"  = Movimiento ya existe: {mov.tipo} - {mov.producto_codigo}")
except Exception as e:
    print(f"  ! Error en movimientos: {e}")

# ============================================================
# 11. TESORERIA / TRANSACCIONES (5 transacciones)
# ============================================================
print("\n[11/15] Creando transacciones de tesoreria...")
try:
    from tesoreria.models import Transaccion

    transacciones_data = [
        {"tipo": "ingreso", "concepto": "Pago factura FAC-001", "monto": Decimal("2975000.00"), "fecha": timezone.now().date(), "categoria": "ventas", "estado": "conciliado"},
        {"tipo": "egreso", "concepto": "Pago OC-2024-001", "monto": Decimal("1250000.00"), "fecha": timezone.now().date(), "categoria": "compras", "estado": "conciliado"},
        {"tipo": "ingreso", "concepto": "Pago factura FAC-003", "monto": Decimal("3808000.00"), "fecha": timezone.now().date(), "categoria": "ventas", "estado": "conciliado"},
        {"tipo": "egreso", "concepto": "Nomina empleados", "monto": Decimal("18500000.00"), "fecha": timezone.now().date(), "categoria": "nomina", "estado": "conciliado"},
        {"tipo": "ingreso", "concepto": "Pago factura FAC-005", "monto": Decimal("4879000.00"), "fecha": timezone.now().date(), "categoria": "ventas", "estado": "pendiente"},
    ]

    for i, data in enumerate(transacciones_data):
        trans, created = Transaccion.objects.get_or_create(
            concepto=data["concepto"],
            fecha=data["fecha"],
            defaults=data
        )
        if created:
            print(f"  + Transaccion creada: {trans.concepto} - ${trans.monto}")
        else:
            print(f"  = Transaccion ya existe: {trans.concepto}")
except Exception as e:
    print(f"  ! Error en transacciones: {e}")

# ============================================================
# 12. MANTENIMIENTO / ORDENES (5 ordenes)
# ============================================================
print("\n[12/15] Creando ordenes de mantenimiento...")
try:
    from mantenimiento.models import OrdenMantenimiento

    ordenes_mant_data = [
        {"codigo": "OM-001", "equipo": "Transformador Principal 15KVA", "tipo": "preventivo", "fecha_programada": timezone.now().date(), "tecnico": "Pedro Sanchez", "estado": "completado", "descripcion": "Limpieza, ajuste de bornes, medicion de resistencia de aislamiento"},
        {"codigo": "OM-002", "equipo": "Tablero Distribucion Planta A", "tipo": "correctivo", "fecha_programada": timezone.now().date(), "tecnico": "Luis Garcia", "estado": "en_progreso", "descripcion": "Reemplazo de breaker principal quemado"},
        {"codigo": "OM-003", "equipo": "Grupo Electrogeno 50KVA", "tipo": "preventivo", "fecha_programada": timezone.now().date(), "tecnico": "Pedro Sanchez", "estado": "programado", "descripcion": "Cambio de aceite y filtros, prueba de carga"},
        {"codigo": "OM-004", "equipo": "Sistema UPS Oficinas", "tipo": "preventivo", "fecha_programada": timezone.now().date(), "tecnico": "Luis Garcia", "estado": "completado", "descripcion": "Prueba de baterias, limpieza de ventiladores"},
        {"codigo": "OM-005", "equipo": "Iluminacion Emergencia", "tipo": "correctivo", "fecha_programada": timezone.now().date(), "tecnico": "Pedro Sanchez", "estado": "pendiente", "descripcion": "Reemplazo de 8 luminarias de emergencia defectuosas"},
    ]

    for data in ordenes_mant_data:
        orden, created = OrdenMantenimiento.objects.get_or_create(
            codigo=data["codigo"],
            defaults=data
        )
        if created:
            print(f"  + Orden mantenimiento creada: {orden.codigo} - {orden.equipo}")
        else:
            print(f"  = Orden mantenimiento ya existe: {orden.codigo}")
except Exception as e:
    print(f"  ! Error en ordenes de mantenimiento: {e}")

# ============================================================
# 13. CALIDAD / INSPECCIONES (5 inspecciones)
# ============================================================
print("\n[13/15] Creando inspecciones de calidad...")
try:
    from calidad.models import Inspeccion

    inspecciones_data = [
        {"codigo": "INS-001", "proyecto_codigo": "PROY-001", "tipo": "instalacion", "fecha": timezone.now().date(), "inspector": "Carlos Rodriguez", "resultado": "aprobado", "observaciones": "Instalacion conforme a norma RETIE. Todas las pruebas superadas."},
        {"codigo": "INS-002", "proyecto_codigo": "PROY-003", "tipo": "seguridad", "fecha": timezone.now().date(), "inspector": "Maria Lopez", "resultado": "aprobado", "observaciones": "Sistema de puesta a tierra dentro de parametros. Resistencia 2.5 ohms."},
        {"codigo": "INS-003", "proyecto_codigo": "PROY-002", "tipo": "iluminacion", "fecha": timezone.now().date(), "inspector": "Ana Martinez", "resultado": "aprobado", "observaciones": "Niveles de iluminacion cumplen norma. Medicion: 520 lux promedio."},
        {"codigo": "INS-004", "proyecto_codigo": "PROY-004", "tipo": "tableros", "fecha": timezone.now().date(), "inspector": "Luis Garcia", "resultado": "observaciones", "observaciones": "2 tableros requieren reemplazo de terminales. Plazo 15 dias."},
        {"codigo": "INS-005", "proyecto_codigo": "PROY-005", "tipo": "cableado", "fecha": timezone.now().date(), "inspector": "Pedro Sanchez", "resultado": "aprobado", "observaciones": "Cableado estructurado certificado. Categoria 6, pruebas de transmision OK."},
    ]

    for data in inspecciones_data:
        insp, created = Inspeccion.objects.get_or_create(
            codigo=data["codigo"],
            defaults=data
        )
        if created:
            print(f"  + Inspeccion creada: {insp.codigo} - {insp.resultado}")
        else:
            print(f"  = Inspeccion ya existe: {insp.codigo}")
except Exception as e:
    print(f"  ! Error en inspecciones: {e}")

# ============================================================
# 14. MARKETING / CAMPAÑAS (5 campañas)
# ============================================================
print("\n[14/15] Creando campañas de marketing...")
try:
    from marketing.models import Campana

    campanas_data = [
        {"nombre": "Lanzamiento LED Industrial 2024", "tipo": "email", "fecha_inicio": timezone.now().date(), "presupuesto": Decimal("2500000.00"), "estado": "activa", "descripcion": "Campaña de correo para clientes industriales sobre nueva linea LED"},
        {"nombre": "Feria Electrica Medellin", "tipo": "evento", "fecha_inicio": timezone.now().date(), "presupuesto": Decimal("8000000.00"), "estado": "planificada", "descripcion": "Stand y demostraciones en feria del sector electrico"},
        {"nombre": "Descuento Mantenimiento Q3", "tipo": "promocion", "fecha_inicio": timezone.now().date(), "presupuesto": Decimal("1500000.00"), "estado": "activa", "descripcion": "20% descuento en mantenimiento preventivo durante julio-septiembre"},
        {"nombre": "Webinar Normas RETIE", "tipo": "webinar", "fecha_inicio": timezone.now().date(), "presupuesto": Decimal("500000.00"), "estado": "completada", "descripcion": "Capacitacion virtual gratuita sobre actualizaciones RETIE 2024"},
        {"nombre": "Referidos Clientes VIP", "tipo": "referidos", "fecha_inicio": timezone.now().date(), "presupuesto": Decimal("1000000.00"), "estado": "activa", "descripcion": "Programa de referidos con bonos para clientes existentes"},
    ]

    for data in campanas_data:
        camp, created = Campana.objects.get_or_create(
            nombre=data["nombre"],
            defaults=data
        )
        if created:
            print(f"  + Campana creada: {camp.nombre}")
        else:
            print(f"  = Campana ya existe: {camp.nombre}")
except Exception as e:
    print(f"  ! Error en campañas: {e}")

# ============================================================
# 15. LOGISTICA / ENVIOS (5 envios)
# ============================================================
print("\n[15/15] Creando envios/logistica...")
try:
    from logistica.models import Envio

    envios_data = [
        {"guia": "ENV-001", "orden_compra": "OC-2024-001", "destinatario": "Constructora ABC S.A.S.", "direccion": "Calle 123 # 45-67, Bogota", "fecha_envio": timezone.now().date(), "estado": "entregado", "transportista": "Servientrega"},
        {"guia": "ENV-002", "orden_compra": "OC-2024-002", "destinatario": "Ingenieria Delta Ltda.", "direccion": "Carrera 45 # 67-89, Medellin", "fecha_envio": timezone.now().date(), "estado": "transito", "transportista": "TCC"},
        {"guia": "ENV-003", "orden_compra": "OC-2024-003", "destinatario": "Electromontajes Orion", "direccion": "Avenida 78 # 12-34, Cali", "fecha_envio": timezone.now().date(), "estado": "entregado", "transportista": "Interrapidisimo"},
        {"guia": "ENV-004", "orden_compra": "OC-2024-004", "destinatario": "Servicios Electricos Sur", "direccion": "Diagonal 56 # 78-90, Barranquilla", "fecha_envio": timezone.now().date(), "estado": "preparacion", "transportista": "Servientrega"},
        {"guia": "ENV-005", "orden_compra": "OC-2024-005", "destinatario": "Proyectos Industriales Norte", "direccion": "Transversal 34 # 56-78, Cartagena", "fecha_envio": timezone.now().date(), "estado": "transito", "transportista": "TCC"},
    ]

    for data in envios_data:
        envio, created = Envio.objects.get_or_create(
            guia=data["guia"],
            defaults=data
        )
        if created:
            print(f"  + Envio creado: {envio.guia} - {envio.estado}")
        else:
            print(f"  = Envio ya existe: {envio.guia}")
except Exception as e:
    print(f"  ! Error en envios: {e}")

# ============================================================
# RESUMEN FINAL
# ============================================================
print("\n" + "=" * 60)
print("  DATOS DE PRUEBA CREADOS EXITOSAMENTE")
print("=" * 60)
print("\nResumen por modulo:")
print("  - Usuarios: 5 adicionales + tu superusuario")
print("  - Clientes: 5 empresas")
print("  - Proveedores: 5 proveedores")
print("  - Productos: 5 productos en inventario")
print("  - Informes Diarios: 5 informes de trabajo")
print("  - Ordenes de Compra: 5 ordenes")
print("  - Facturas: 5 facturas")
print("  - Proyectos: 5 proyectos activos")
print("  - Empleados: 5 empleados")
print("  - Movimientos Inventario: 5 movimientos")
print("  - Transacciones Tesoreria: 5 transacciones")
print("  - Ordenes Mantenimiento: 5 ordenes")
print("  - Inspecciones Calidad: 5 inspecciones")
print("  - Campañas Marketing: 5 campañas")
print("  - Envios Logistica: 5 envios")
print("\n" + "=" * 60)
print("  Ahora puedes iniciar el ERP y ver todos los datos!")
print("=" * 60)
