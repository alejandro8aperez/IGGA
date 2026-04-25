# Manual de Configuración Técnica: Integración Web Service Facturatech en ERP 8AMPERIOS

## 1. Introducción y Alcance Técnico

Este documento define los lineamientos estrictos para la integración del backend Django del ERP 8AMPERIOS con el Web Service (WS) de Facturatech. El objetivo primordial es habilitar la capa de comunicación SOAP necesaria para el transporte y validación de documentos electrónicos ante la DIAN.

Este manual constituye el protocolo final de entrega para el sprint de implementación. Se requiere una adherencia absoluta a las estructuras aquí definidas; cualquier desviación resultará en un "error de estructura" por parte del proveedor tecnológico, bloqueando la emisión legal de facturas.

## 2. Obtención de Credenciales de Acceso

La autenticación con el Web Service es el primer punto crítico. No debe confundirse el acceso administrativo con el acceso de integración.

**ADVERTENCIA TÉCNICA OBLIGATORIA:** La Contraseña del Web Service es un valor alfanumérico generado exclusivamente para la API y es distinto a la contraseña de acceso al portal de usuario de Facturatech. El uso de la contraseña del portal en las peticiones SOAP invalidará la conexión.

Para la configuración, se requieren los siguientes datos del contribuyente:

* **FACTURATECH_NIT:** Identificador fiscal de la empresa. Es imperativo ingresar el NIT sin el Dígito de Verificación (DV), a menos que el endpoint específico de respuesta indique lo contrario en una excepción de validación.
* **WS Password:** Localizada en el panel de configuración técnica del portal Facturatech.

## 3. Configuración de Variables de Entorno (.env)

La persistencia de credenciales y endpoints debe gestionarse en el archivo .env del backend. Se prohíbe el hardcoding de estas rutas en el código de Django.

```env
# CREDENCIALES DEL EMISOR
FACTURATECH_NIT=900XXXXXX
# NOTA: Almacenar el HASH SHA256 resultante, no el texto plano
FACTURATECH_PASSWORD=hash_sha256_correspondiente

# WSDL URLs - AMBIENTE DEMO (PRUEBAS)
FACTURATECH_WSDL_DEMO_VENTAS=[URL_PROPORCIONADA_POR_FACTURATECH_DEMO]
FACTURATECH_WSDL_DEMO_POS=[URL_PROPORCIONADA_POR_FACTURATECH_DEMO_POS]

# WSDL URLs - AMBIENTE PRODUCCIÓN
FACTURATECH_WSDL_PROD_VENT=[URL_PROPORCIONADA_POR_FACTURATECH_PROD]
FACTURATECH_WSDL_PROD_POS=[URL_PROPORCIONADA_POR_FACTURATECH_PROD_POS]
```

## 4. Requerimiento de Seguridad: Encriptación SHA256

Por protocolo de seguridad del Web Service, la contraseña no puede ser transmitida en texto plano. Es un requisito obligatorio aplicar una función hash antes del envío.

**Flujo de transformación de credenciales:**

1. **Entrada:** Contraseña técnica obtenida del portal Facturatech.
2. **Procesamiento:** Aplicación del algoritmo SHA256.
3. **Salida:** Hash resultante en minúsculas (o según especificación del encabezado SOAP) que se inyectará en la petición.

### Ejemplo de implementación en Python:

```python
import hashlib

def hash_password_sha256(password: str) -> str:
    """Genera hash SHA256 de la contraseña para Facturatech"""
    return hashlib.sha256(password.encode('utf-8')).hexdigest().lower()
```

## 5. Flujo de Consumo: Método uploadInvoiceFile

Para el envío de una "Factura de Venta Básica", el sistema debe construir un XML basado en el estándar UBL 2.1 adaptado por Facturatech.

### 5.1 Estructura de Nodos y Jerarquía (XML Simplificado)

El orden de los nodos es descendente y su alteración provocará el rechazo inmediato del documento.

* **Nodo ENC (Encabezado):** Es obligatorio poblar los campos ENC_1, 2, 3, 4, 5, 6, 9, 10, 15, 20, 21.
* **Nodo EMI (Emisor):** Requiere estrictamente los sub-nodos hijos: TAC, DFE, ICC, CDE, y GTE.
* **Nodo ADQ (Adquiriente):** Debe contener la jerarquía completa: TCR, ILA, DFA, ICR, CDA, y GTA.
* **Nodo ITE (Ítem):** Incluye el sub-nodo IAE y, en caso de descuentos, el nodo IDE.

### 5.2 Fórmulas de Cálculo para Ítems

Para evitar discrepancias en los totales (TOT), el backend de Django debe aplicar las siguientes fórmulas matemáticas en el nodo ITE:

1. **Cálculo de Base (ITE_5 e ITE_19):**
   ```
   ITE_5 = (ITE_27 * ITE_7) - Descuento_Ítem (IDE) + Cargo_Ítem (IDE)
   ```
   (Donde ITE_27 es cantidad e ITE_7 es precio unitario)

2. **Cálculo de Total Ítem (ITE_21):**
   ```
   ITE_21 = ITE_19 + Suma_de_Impuestos_del_Ítem (IIM_2)
   ```

### 5.3 Codificación e Invocación

Una vez validada la estructura XML, se debe realizar la conversión a Base64. Este string resultante se enviará como parámetro principal en el método `uploadInvoiceFile` del Web Service.

### Ejemplo de implementación SOAP:

```python
from zeep import Client
import base64

def enviar_factura_facturatech(xml_content: str, wsdl_url: str, nit: str, password_hash: str):
    """
    Envía factura a Facturatech vía Web Service SOAP
    """
    # Convertir XML a Base64
    xml_base64 = base64.b64encode(xml_content.encode('utf-8')).decode('utf-8')
    
    # Crear cliente SOAP
    client = Client(wsdl=wsdl_url)
    
    # Llamar método uploadInvoiceFile
    response = client.service.uploadInvoiceFile(
        fileName="factura.xml",
        fileData=xml_base64,
        companyCode=nit,
        accountCode=nit,
        userPassword=password_hash
    )
    
    return response
```

## 6. Diccionario de Códigos de Respuesta Estándar

El ERP 8AMPERIOS debe interpretar las respuestas del servidor para automatizar la gestión de errores en la interfaz de React:

| Código | Significado | Contexto en el ERP 8AMPERIOS |
|--------|-------------|------------------------------|
| 200 | OK | Comunicación exitosa. Proceder con el registro del CUFE/Hash. |
| 201 | Created | Documento aceptado por la DIAN. Actualizar estado a "Emitida". |
| 400 | Bad Request | Error de validación (ej. Email mal formateado o NIT inválido). |
| 404 | Not Found | Endpoint WSDL inaccesible o incorrecto en el archivo .env. |
| 409 | Conflict | Conflicto de datos: Factura duplicada o Cédula/NIT ya registrado. |

**Nota:** Los errores 400 y 409 suelen dispararse por duplicidad de datos en el módulo CRM, conforme a las validaciones de serializers.

## 7. Verificación, Logs y Persistencia

La integración no termina con el envío; la trazabilidad en el ERP es fundamental para la auditoría fiscal.

### 7.1 Logs de Django

Es imperativo configurar un logger en `settings_production.py` que capture las excepciones de Zeep (librería SOAP). Los errores de "Estructura Mal Formada" deben registrarse con el traceback completo.

```python
# settings.py o settings_production.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'facturatech_file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/erp/facturatech.log',
        },
    },
    'loggers': {
        'facturatech': {
            'handlers': ['facturatech_file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### 7.2 Persistencia en PostgreSQL

Tras recibir una respuesta exitosa (200/201), el sistema debe actualizar la tabla `finanzas_factura`. Es obligatorio almacenar:

- XML enviado
- Respuesta del WS
- Estado final del documento
- CUFE (Código Único de Factura Electrónica)
- TrackID de seguimiento DIAN

Esto asegura que la base de datos PostgreSQL sea la única fuente de verdad ante una auditoría de la DIAN.

### Modelo sugerido para trazabilidad:

```python
class FacturaElectronicaLog(models.Model):
    factura = models.ForeignKey('finanzas.Factura', on_delete=models.CASCADE)
    xml_enviado = models.TextField()
    respuesta_ws = models.TextField()
    codigo_respuesta = models.CharField(max_length=10)
    cufe = models.CharField(max_length=100, blank=True)
    track_id = models.CharField(max_length=100, blank=True)
    fecha_envio = models.DateTimeField(auto_now_add=True)
    estado_dian = models.CharField(max_length=50)
    
    class Meta:
        db_table = 'facturacion_logs'
        ordering = ['-fecha_envio']
```

## 8. Dependencias Python Requeridas

```txt
zeep>=4.2.1
lxml>=4.9.0
cryptography>=41.0.0
```

## 9. Referencias y Soporte

- Portal Facturatech: https://www.facturatech.co
- Documentación UBL 2.1 DIAN
- Soporte técnico Facturatech: soporte@facturatech.co

---

**Documento versión:** 1.0  
**Última actualización:** Abril 2026  
**Responsable:** Equipo Técnico ERP 8AMPERIOS
