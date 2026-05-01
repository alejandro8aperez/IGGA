import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from contabilidad.models import Cuenta

# Base structure of Colombian PUC (Plan Único de Cuentas)
puc_basico = [
    # Activos (Nivel 1 y 2)
    {'codigo': '1', 'nombre': 'ACTIVO', 'tipo': 'activo', 'nivel': 1, 'padre_codigo': None},
    {'codigo': '1001', 'nombre': 'Efectivo y Equivalentes de Efectivo', 'tipo': 'activo', 'nivel': 2, 'padre_codigo': '1'},
    {'codigo': '100101', 'nombre': 'Caja y bancos', 'tipo': 'activo', 'nivel': 3, 'padre_codigo': '1001'},
    {'codigo': '1101', 'nombre': 'Cuentas por Cobrar', 'tipo': 'activo', 'nivel': 2, 'padre_codigo': '1'},
    {'codigo': '110101', 'nombre': 'Cuentas por cobrar clientes', 'tipo': 'activo', 'nivel': 3, 'padre_codigo': '1101'},
    {'codigo': '1201', 'nombre': 'Inventario de Materias Primas', 'tipo': 'activo', 'nivel': 2, 'padre_codigo': '1'},
    {'codigo': '120101', 'nombre': 'Inventario materia prima', 'tipo': 'activo', 'nivel': 3, 'padre_codigo': '1201'},
    {'codigo': '1401', 'nombre': 'Inventario de Producto Terminado', 'tipo': 'activo', 'nivel': 2, 'padre_codigo': '1'},
    {'codigo': '140101', 'nombre': 'Inventario producto terminado', 'tipo': 'activo', 'nivel': 3, 'padre_codigo': '1401'},
    
    # Pasivos
    {'codigo': '2', 'nombre': 'PASIVO', 'tipo': 'pasivo', 'nivel': 1, 'padre_codigo': None},
    {'codigo': '2101', 'nombre': 'Cuentas por Pagar', 'tipo': 'pasivo', 'nivel': 2, 'padre_codigo': '2'},
    {'codigo': '210101', 'nombre': 'Cuentas por pagar proveedores', 'tipo': 'pasivo', 'nivel': 3, 'padre_codigo': '2101'},
    {'codigo': '2401', 'nombre': 'Impuestos por Pagar', 'tipo': 'pasivo', 'nivel': 2, 'padre_codigo': '2'},
    {'codigo': '240101', 'nombre': 'IVA por pagar', 'tipo': 'pasivo', 'nivel': 3, 'padre_codigo': '2401'},
    
    # Patrimonio
    {'codigo': '3', 'nombre': 'PATRIMONIO', 'tipo': 'patrimonio', 'nivel': 1, 'padre_codigo': None},
    {'codigo': '3101', 'nombre': 'Capital Social', 'tipo': 'patrimonio', 'nivel': 2, 'padre_codigo': '3'},
    {'codigo': '310101', 'nombre': 'Resultado del ejercicio', 'tipo': 'patrimonio', 'nivel': 3, 'padre_codigo': '3101'},
    
    # Ingresos
    {'codigo': '4', 'nombre': 'INGRESOS', 'tipo': 'ingreso', 'nivel': 1, 'padre_codigo': None},
    {'codigo': '4101', 'nombre': 'Ingresos Operacionales', 'tipo': 'ingreso', 'nivel': 2, 'padre_codigo': '4'},
    {'codigo': '410101', 'nombre': 'Ingresos por ventas', 'tipo': 'ingreso', 'nivel': 3, 'padre_codigo': '4101'},
    
    # Gastos / Costos
    {'codigo': '5', 'nombre': 'GASTOS Y COSTOS', 'tipo': 'gasto', 'nivel': 1, 'padre_codigo': None},
    {'codigo': '5101', 'nombre': 'Costo de Ventas y Producción', 'tipo': 'gasto', 'nivel': 2, 'padre_codigo': '5'},
    {'codigo': '510101', 'nombre': 'Costo de producción', 'tipo': 'gasto', 'nivel': 3, 'padre_codigo': '5101'},
    {'codigo': '5201', 'nombre': 'Gastos Operativos', 'tipo': 'gasto', 'nivel': 2, 'padre_codigo': '5'},
    {'codigo': '520101', 'nombre': 'Costo Mantenimiento', 'tipo': 'gasto', 'nivel': 3, 'padre_codigo': '5201'},
]

cuentas_creadas = 0

# Crear primero nivel 1, luego nivel 2, etc.
for nivel in range(1, 4):
    for c in puc_basico:
        if c['nivel'] == nivel:
            padre = None
            if c['padre_codigo']:
                padre = Cuenta.objects.filter(codigo=c['padre_codigo']).first()
                
            cuenta, created = Cuenta.objects.get_or_create(
                codigo=c['codigo'],
                defaults={
                    'nombre': c['nombre'],
                    'tipo': c['tipo'],
                    'nivel': c['nivel'],
                    'padre': padre
                }
            )
            if created:
                cuentas_creadas += 1

print(f"PUC Inicializado. {cuentas_creadas} cuentas creadas exitosamente.")
