import os
import django
import json

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from customization.models import FormFormat
from django.contrib.auth.models import User

def seed_templates():
    user = User.objects.filter(is_superuser=True).first() or User.objects.first()
    
    templates = [
        {
            "nombre": "Orden de Venta",
            "archivo": "Orden de Venta.json",
            "desc": "Diseño base para el módulo de ventas"
        },
        {
            "nombre": "Cotización CRM",
            "archivo": "Cotización CRM.json",
            "desc": "Formulario de cotizaciones para clientes"
        },
        {
            "nombre": "Empleado RRHH",
            "archivo": "Empleado RRHH.json",
            "desc": "Ficha de registro de personal"
        },
        {
            "nombre": "Producción MRP",
            "archivo": "Producción MRP.json",
            "desc": "Plan Maestro de Producción (MPS)"
        },
        {
            "nombre": "No Conformidad Calidad",
            "archivo": "No Conformidad Calidad.json",
            "desc": "Reporte de hallazgos ISO 9001"
        },
        {
            "nombre": "Ficha de Producto",
            "archivo": "Ficha de Producto.json",
            "desc": "Ficha técnica y control de stock"
        },
        {
            "nombre": "Orden de Compra",
            "archivo": "Orden de Compra.json",
            "desc": "Gestión de adquisiciones"
        },
        {
            "nombre": "Registro Proveedor",
            "archivo": "Registro Proveedor.json",
            "desc": "Base de datos de proveedores"
        },
        {
            "nombre": "Registro Cliente",
            "archivo": "Registro Cliente.json",
            "desc": "Base de datos de clientes CRM"
        },
        {
            "nombre": "Orden de Trabajo",
            "archivo": "Orden de Trabajo.json",
            "desc": "Mantenimiento preventivo y correctivo"
        }
    ]

    base_path = os.path.join(os.getcwd(), 'formatos_base')

    for t in templates:
        file_path = os.path.join(base_path, t['archivo'])
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                design_data = json.load(f)
                FormFormat.objects.update_or_create(
                    nombre=t['nombre'],
                    defaults={
                        "descripcion": t['desc'],
                        "json_design": design_data,
                        "creado_por": user
                    }
                )
            print(f"Plantilla '{t['nombre']}' cargada correctamente.")
        else:
            print(f"No se encontro el archivo: {file_path}")

if __name__ == "__main__":
    seed_templates()
