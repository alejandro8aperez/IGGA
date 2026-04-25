"""
Modelos para Facturación Electrónica - Integración Facturatech
"""
from django.db import models


class FacturaElectronicaLog(models.Model):
    """
    Registro de trazabilidad para envío de facturas electrónicas a la DIAN
    via Facturatech Web Service
    """
    ESTADOS_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('enviada', 'Enviada'),
        ('aceptada', 'Aceptada por DIAN'),
        ('rechazada', 'Rechazada'),
        ('error', 'Error de envío'),
    ]
    
    # Relación con factura del sistema
    factura_id = models.IntegerField(null=True, blank=True, help_text="ID de factura interna")
    factura_numero = models.CharField(max_length=50, blank=True, help_text="Número de factura")
    
    # Datos del envío
    xml_enviado = models.TextField(help_text="XML UBL 2.1 enviado a Facturatech")
    xml_base64 = models.TextField(help_text="XML codificado en Base64")
    
    # Respuesta del Web Service
    respuesta_ws = models.TextField(blank=True, help_text="Respuesta completa del Web Service")
    codigo_respuesta = models.CharField(max_length=10, blank=True, help_text="Código HTTP de respuesta")
    mensaje_respuesta = models.TextField(blank=True, help_text="Mensaje descriptivo de la respuesta")
    
    # Datos de validación DIAN
    cufe = models.CharField(max_length=100, blank=True, help_text="Código Único de Factura Electrónica")
    track_id = models.CharField(max_length=100, blank=True, help_text="ID de seguimiento DIAN")
    qr_code = models.TextField(blank=True, help_text="Datos para generación de código QR")
    
    # Estado y tracking
    estado_dian = models.CharField(max_length=50, blank=True, help_text="Estado en la DIAN")
    estado_interno = models.CharField(
        max_length=20, 
        choices=ESTADOS_CHOICES, 
        default='pendiente',
        help_text="Estado interno del proceso"
    )
    
    # Metadata del envío
    fecha_envio = models.DateTimeField(auto_now_add=True)
    fecha_respuesta = models.DateTimeField(null=True, blank=True)
    intentos_envio = models.IntegerField(default=0, help_text="Número de intentos de envío")
    
    # Error tracking
    error_detalle = models.TextField(blank=True, help_text="Detalle del error si falla")
    error_codigo = models.CharField(max_length=20, blank=True, help_text="Código de error interno")
    
    # Ambiente (demo/producción)
    es_produccion = models.BooleanField(default=False, help_text="True=Producción, False=Demo")
    wsdl_url = models.URLField(blank=True, help_text="URL del WSDL usado")
    
    class Meta:
        db_table = 'facturacion_electronica_logs'
        ordering = ['-fecha_envio']
        verbose_name = 'Log de Factura Electrónica'
        verbose_name_plural = 'Logs de Facturas Electrónicas'
        indexes = [
            models.Index(fields=['factura_id']),
            models.Index(fields=['cufe']),
            models.Index(fields=['track_id']),
            models.Index(fields=['estado_interno']),
            models.Index(fields=['fecha_envio']),
        ]

    def __str__(self):
        return f"FE-{self.factura_numero or self.id} - {self.estado_interno}"


class ConfiguracionFacturatech(models.Model):
    """
    Configuración de credenciales y endpoints para Facturatech
    """
    nombre_config = models.CharField(max_length=100, default="Configuración Principal")
    
    # Credenciales
    nit = models.CharField(max_length=20, help_text="NIT sin DV")
    password_hash = models.CharField(max_length=64, help_text="Contraseña hasheada en SHA256")
    
    # Endpoints Demo
    wsdl_demo_ventas = models.URLField(blank=True, help_text="WSDL Demo Ventas")
    wsdl_demo_pos = models.URLField(blank=True, help_text="WSDL Demo POS")
    
    # Endpoints Producción
    wsdl_prod_ventas = models.URLField(blank=True, help_text="WSDL Producción Ventas")
    wsdl_prod_pos = models.URLField(blank=True, help_text="WSDL Producción POS")
    
    # Configuración
    ambiente_activo = models.CharField(
        max_length=10,
        choices=[('demo', 'Demo/Pruebas'), ('produccion', 'Producción')],
        default='demo'
    )
    activo = models.BooleanField(default=True)
    
    # Timestamps
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'facturacion_electronica_config'
        verbose_name = 'Configuración Facturatech'
        verbose_name_plural = 'Configuraciones Facturatech'

    def __str__(self):
        return f"{self.nombre_config} ({self.ambiente_activo})"

    def get_wsdl_url(self, tipo='ventas'):
        """Retorna el WSDL URL según ambiente y tipo"""
        if self.ambiente_activo == 'produccion':
            return self.wsdl_prod_ventas if tipo == 'ventas' else self.wsdl_prod_pos
        return self.wsdl_demo_ventas if tipo == 'ventas' else self.wsdl_demo_pos
