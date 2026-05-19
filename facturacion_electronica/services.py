"""
Servicio de integración con Facturatech Web Service SOAP
"""
import hashlib
import base64
import logging
from datetime import datetime
from typing import Optional, Dict, Any, Tuple

from zeep import Client, Settings
from zeep.exceptions import Fault, TransportError, XMLSyntaxError
from lxml import etree
try:
    import ollama
except ImportError:
    ollama = None

from django.conf import settings
from .models import FacturaElectronicaLog, ConfiguracionFacturatech

logger = logging.getLogger('facturatech')


class FacturatechService:
    """
    Servicio para integración con Web Service SOAP de Facturatech
    """
    
    def __init__(self, config: Optional[ConfiguracionFacturatech] = None):
        """
        Inicializa el servicio con configuración
        """
        if config is None:
            config = ConfiguracionFacturatech.objects.filter(activo=True).first()
        
        if not config:
            raise ValueError("No hay configuración activa de Facturatech")
        
        self.config = config
        self.client = None
        self._init_soap_client()
    
    def _init_soap_client(self, tipo: str = 'ventas'):
        """
        Inicializa el cliente SOAP con Zeep
        """
        wsdl_url = self.config.get_wsdl_url(tipo)
        
        if not wsdl_url:
            raise ValueError(f"No hay WSDL URL configurado para tipo: {tipo}")
        
        try:
            # Configuración de Zeep para manejo de SOAP
            zeep_settings = Settings(
                strict=True,
                xml_huge_tree=True,
                raw_response=False,
            )
            
            self.client = Client(wsdl=wsdl_url, settings=zeep_settings)
            logger.info(f"Cliente SOAP inicializado: {wsdl_url}")
            
        except Exception as e:
            logger.error(f"Error inicializando cliente SOAP: {str(e)}")
            raise
    
    @staticmethod
    def hash_password_sha256(password: str) -> str:
        """
        Genera hash SHA256 de la contraseña para Facturatech
        
        Args:
            password: Contraseña técnica del portal Facturatech
            
        Returns:
            Hash SHA256 en minúsculas
        """
        return hashlib.sha256(password.encode('utf-8')).hexdigest().lower()
    
    def generar_xml_ubl(self, factura_data: Dict[str, Any]) -> str:
        """
        Genera XML UBL 2.1 para factura electrónica
        
        Args:
            factura_data: Diccionario con datos de la factura
            
        Returns:
            String XML formateado
        """
        # Este método debe implementarse según la estructura específica
        # de Facturatech UBL 2.1
        
        enc = factura_data.get('encabezado', {})
        emi = factura_data.get('emisor', {})
        adq = factura_data.get('adquiriente', {})
        items = factura_data.get('items', [])
        totales = factura_data.get('totales', {})
        
        # Construir XML usando lxml para mejor manejo de namespaces
        nsmap = {
            'sts': 'dian:gov:co:facturaelectronica:Structures-2-1',
            'cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
            'cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
            'ext': 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2',
            'xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        }
        
        root = etree.Element('Invoice', nsmap=nsmap)
        
        # Aquí se construye el XML según especificación Facturatech
        # Por ahora retornamos un placeholder - implementación completa
        # requiere mapeo detallado de todos los campos UBL
        
        xml_string = etree.tostring(root, pretty_print=True, encoding='unicode')
        return xml_string
    
    def calcular_totales_item(self, item: Dict[str, Any]) -> Dict[str, float]:
        """
        Calcula totales para un ítem según fórmulas de Facturatech
        
        Fórmulas:
        - ITE_5 = (ITE_27 * ITE_7) - Descuento + Cargo
        - ITE_21 = ITE_19 + Suma_impuestos
        
        Args:
            item: Datos del ítem
            
        Returns:
            Diccionario con valores calculados
        """
        cantidad = float(item.get('cantidad', 0))  # ITE_27
        precio_unitario = float(item.get('precio_unitario', 0))  # ITE_7
        descuento = float(item.get('descuento', 0))
        cargo = float(item.get('cargo', 0))
        impuestos = float(item.get('impuestos', 0))
        
        # ITE_5 - Base calculada
        base_calculada = (cantidad * precio_unitario) - descuento + cargo
        
        # ITE_19 - Base imponible (generalmente igual a ITE_5)
        base_imponible = base_calculada
        
        # ITE_21 - Total del ítem con impuestos
        total_item = base_imponible + impuestos
        
        return {
            'ite_5': round(base_calculada, 2),
            'ite_19': round(base_imponible, 2),
            'ite_21': round(total_item, 2),
        }
    
    def enviar_factura(
        self, 
        xml_content: str, 
        factura_id: Optional[int] = None,
        factura_numero: Optional[str] = None,
        tipo: str = 'ventas'
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Envía factura a Facturatech vía Web Service SOAP
        
        Args:
            xml_content: XML UBL 2.1 de la factura
            factura_id: ID interno de la factura
            factura_numero: Número de factura
            tipo: 'ventas' o 'pos'
            
        Returns:
            Tuple (éxito: bool, respuesta: dict)
        """
        # Crear log de trazabilidad
        log = FacturaElectronicaLog.objects.create(
            factura_id=factura_id,
            factura_numero=factura_numero,
            xml_enviado=xml_content,
            estado_interno='enviada',
            es_produccion=self.config.ambiente_activo == 'produccion',
            wsdl_url=self.config.get_wsdl_url(tipo)
        )
        
        try:
            # Convertir XML a Base64
            xml_base64 = base64.b64encode(xml_content.encode('utf-8')).decode('utf-8')
            log.xml_base64 = xml_base64
            log.save()
            
            # Preparar credenciales
            password_hash = self.config.password_hash
            
            # Reinicializar cliente si es necesario
            if not self.client or tipo != 'ventas':
                self._init_soap_client(tipo)
            
            # Llamar método uploadInvoiceFile
            logger.info(f"Enviando factura {factura_numero} a Facturatech")
            
            response = self.client.service.uploadInvoiceFile(
                fileName=f"factura_{factura_numero or factura_id}.xml",
                fileData=xml_base64,
                companyCode=self.config.nit,
                accountCode=self.config.nit,
                userPassword=password_hash
            )
            
            # Procesar respuesta
            resultado = self._procesar_respuesta(response, log)
            
            return resultado['exito'], resultado
            
        except Fault as e:
            # Error SOAP específico
            logger.error(f"Error SOAP: {e}")
            self._registrar_error(log, 'SOAP_FAULT', str(e), '400')
            return False, {'exito': False, 'error': str(e), 'codigo': '400'}
            
        except TransportError as e:
            # Error de transporte HTTP
            logger.error(f"Error de transporte: {e}")
            self._registrar_error(log, 'TRANSPORT_ERROR', str(e), '404')
            return False, {'exito': False, 'error': str(e), 'codigo': '404'}
            
        except Exception as e:
            # Error general
            logger.error(f"Error inesperado: {e}", exc_info=True)
            self._registrar_error(log, 'ERROR_GENERAL', str(e), '500')
            return False, {'exito': False, 'error': str(e), 'codigo': '500'}
    
    def _procesar_respuesta(
        self, 
        response: Any, 
        log: FacturaElectronicaLog
    ) -> Dict[str, Any]:
        """
        Procesa la respuesta del Web Service
        
        Args:
            response: Objeto de respuesta SOAP
            log: Instancia de log para actualizar
            
        Returns:
            Diccionario con resultado procesado
        """
        resultado = {
            'exito': False,
            'cufe': None,
            'track_id': None,
            'mensaje': None,
            'codigo': None,
        }
        
        try:
            # Convertir respuesta a string para logging
            respuesta_str = str(response)
            log.respuesta_ws = respuesta_str
            
            # Extraer datos según estructura de respuesta de Facturatech
            # La respuesta típica incluye: código, mensaje, cufe, trackId
            
            if hasattr(response, 'codigo'):
                resultado['codigo'] = str(response.codigo)
                log.codigo_respuesta = resultado['codigo']
            
            if hasattr(response, 'mensaje'):
                resultado['mensaje'] = response.mensaje
                log.mensaje_respuesta = resultado['mensaje']
            
            if hasattr(response, 'cufe'):
                resultado['cufe'] = response.cufe
                log.cufe = response.cufe
            
            if hasattr(response, 'trackId'):
                resultado['track_id'] = response.trackId
                log.track_id = response.trackId
            
            # Determinar éxito según código
            if resultado['codigo'] in ['200', '201']:
                resultado['exito'] = True
                log.estado_interno = 'aceptada'
                log.estado_dian = 'Aceptada'
            else:
                log.estado_interno = 'rechazada'
                log.estado_dian = 'Rechazada'
                # Intentar obtener una explicación amigable del error
                if resultado['mensaje']:
                    resultado['explicacion_ia'] = self.explicar_error_con_ia(resultado['mensaje'])
                    log.explicacion_ia = resultado['explicacion_ia']
                else:
                    resultado['explicacion_ia'] = None
                    log.explicacion_ia = None
            
            log.fecha_respuesta = datetime.now()
            log.intentos_envio += 1
            log.save()
            
            logger.info(f"Factura procesada: {log.factura_numero} - Código: {resultado['codigo']}")
            
        except Exception as e:
            logger.error(f"Error procesando respuesta: {e}")
            self._registrar_error(log, 'ERROR_PROCESAMIENTO', str(e), '500')
        
        return resultado
    
    def _registrar_error(
        self, 
        log: FacturaElectronicaLog, 
        codigo_error: str, 
        detalle: str,
        codigo_http: str
    ):
        """
        Registra un error en el log
        """
        log.error_codigo = codigo_error
        log.error_detalle = detalle
        log.codigo_respuesta = codigo_http
        log.estado_interno = 'error'
        log.intentos_envio += 1
        log.fecha_respuesta = datetime.now()
        log.save()
        
        logger.error(f"Error registrado para factura {log.factura_numero}: {codigo_error} - {detalle}")
    
    def consultar_estado_factura(self, track_id: str) -> Dict[str, Any]:
        """
        Consulta el estado de una factura en la DIAN via Facturatech
        
        Args:
            track_id: ID de seguimiento de la factura
            
        Returns:
            Estado actual de la factura
        """
        try:
            # Implementar consulta según método disponible en WSDL
            # Esto puede variar según la versión del WS de Facturatech
            
            response = self.client.service.getStatus(
                trackId=track_id,
                companyCode=self.config.nit,
                userPassword=self.config.password_hash
            )
            
            return {
                'exito': True,
                'estado': getattr(response, 'estado', 'Desconocido'),
                'detalle': str(response)
            }
            
        except Exception as e:
            logger.error(f"Error consultando estado: {e}")
            return {
                'exito': False,
                'error': str(e)
            }

    def explicar_error_con_ia(self, mensaje_error: str) -> str:
        """
        Usa Ollama para traducir un error técnico de la DIAN a lenguaje humano
        """
        if ollama is None:
            return f"Error técnico (IA no disponible): {mensaje_error}"

        try:
            prompt = (
                "### SISTEMA KAVE - SOPORTE DIAN ###\n"
                "Actúa como un experto en impuestos DIAN Colombia.\n"
                "INSTRUCCIÓN: Traduce el error técnico a lenguaje administrativo simple.\n"
                "REGLA: Máximo 200 caracteres, sé amable y directo.\n"
                f"ERROR TÉCNICO: {mensaje_error}"
            )
            response = ollama.chat(model='phi3', messages=[
                {
                    'role': 'user',
                    'content': prompt,
                },
            ])
            # Extraer contenido de forma segura
            return response.get('message', {}).get('content', "No se pudo obtener una explicación detallada.")
        except ollama.ResponseError as e:
            logger.error(f"Error de respuesta de Ollama (Posible saturación): {e}")
            return "El servidor de IA está saturado. Por favor, verifique el NIT y los datos básicos manualmente."
        except Exception as e:
            # Si Ollama no está corriendo, devolvemos un mensaje genérico sin romper el flujo
            logger.warning(f"Ollama no disponible o error de conexión: {e}")
            return f"Se detectó un error técnico. Por favor revise los datos del cliente y el prefijo de facturación."


class UBLGenerator:
    """
    Generador de XML UBL 2.1 para Facturatech
    """
    
    @staticmethod
    def generar_encabezado(data: Dict[str, Any]) -> etree.Element:
        """
        Genera nodo ENC (Encabezado) del XML
        
        Campos obligatorios según Facturatech:
        ENC_1, 2, 3, 4, 5, 6, 9, 10, 15, 20, 21
        """
        enc = etree.Element('ENC')
        
        # ENC_1 - Tipo de operación
        etree.SubElement(enc, 'ENC_1').text = data.get('tipo_operacion', '10')  # 10 = Venta
        
        # ENC_2 - Tipo de documento
        etree.SubElement(enc, 'ENC_2').text = data.get('tipo_documento', '01')  # 01 = Factura
        
        # ENC_3 - Prefijo
        etree.SubElement(enc, 'ENC_3').text = data.get('prefijo', '')
        
        # ENC_4 - Número de factura
        etree.SubElement(enc, 'ENC_4').text = data.get('numero', '')
        
        # ENC_5 - Fecha de emisión
        etree.SubElement(enc, 'ENC_5').text = data.get('fecha_emision', '')
        
        # ENC_6 - Hora de emisión
        etree.SubElement(enc, 'ENC_6').text = data.get('hora_emision', '')
        
        # ENC_9 - Moneda
        etree.SubElement(enc, 'ENC_9').text = data.get('moneda', 'COP')
        
        # ENC_10 - Fecha de vencimiento
        etree.SubElement(enc, 'ENC_10').text = data.get('fecha_vencimiento', '')
        
        # ENC_15 - Forma de pago
        etree.SubElement(enc, 'ENC_15').text = data.get('forma_pago', '1')  # 1 = Contado
        
        # ENC_20 - Tipo de facturación
        etree.SubElement(enc, 'ENC_20').text = data.get('tipo_facturacion', '1')  # 1 = Estandar
        
        # ENC_21 - Ambiente
        etree.SubElement(enc, 'ENC_21').text = data.get('ambiente', '2')  # 2 = Pruebas
        
        return enc
