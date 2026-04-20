import requests
import json
import datetime

payload = {
    # Identificación
    "tipo_documento": 'CC', "numero_documento": '1234567890', "fecha_expedicion_doc": None, "lugar_expedicion_doc": '',
    # Personal
    "primer_nombre": 'Test', "segundo_nombre": '', "primer_apellido": 'User', "segundo_apellido": '',
    "fecha_nacimiento": '1990-01-01', "lugar_nacimiento": '', "genero": 'M', "estado_civil": '',
    "nacionalidad": 'Colombiana', "grupo_sanguineo": '', "estrato": None, "tipo_vivienda": '',
    # Licencia
    "tiene_licencia": False, "categoria_licencia": '', "vencimiento_licencia": None,
    # Tallas
    "talla_camisa": '', "talla_pantalon": '', "talla_zapatos": '', "talla_casco": '',
    # Contacto
    "correo_personal": '', "correo_corporativo": '', "telefono_trabajo": '',
    "telefono_personal": '', "telefono_movil": '',
    # Dirección
    "direccion": '', "barrio": '', "ciudad": '', "departamento_residencia": '', "codigo_postal": '', "pais": 'Colombia',
    # Laboral
    "cargo": '', "departamento": '', "sede": '',
    "fecha_ingreso": '2023-01-01',
    "fecha_fin_periodo_prueba": None, "fecha_retiro": None, "motivo_retiro": '',
    "tipo_contrato": 'IND', "fecha_vencimiento_contrato": None,
    "tipo_salario": 'FIJ', "salario_basico": 0, "auxilio_transporte": True,
    "periodicidad_pago": 'MEN', "horas_extras_autorizadas": False,
    "estado": 'ACT', "notas": '',
    # Seguridad social
    "eps": None, "afp": None, "arl": None, "nivel_riesgo_arl": '', "caja_compensacion": None, "fondo_cesantias": '',
    # Bancario
    "banco": '', "tipo_cuenta": '', "numero_cuenta": '',
}

url = "http://localhost:8000/api/rrhh/empleados/"
res = requests.post(url, json=payload)
print(res.status_code)
print(res.json())
