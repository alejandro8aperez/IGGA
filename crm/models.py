from django.db import models
from django.core.validators import RegexValidator
from django.utils import timezone

class Cliente(models.Model):
    # Tipos de cliente
    TIPO_CLIENTE_CHOICES = [
        ('persona_natural', 'Persona Natural'),
        ('empresa', 'Empresa'),
        ('empresa_unipersonal', 'Empresa Unipersonal'),
        ('cooperativa', 'Cooperativa'),
    ]
    
    # Regímenes tributarios
    REGIMEN_CHOICES = [
        ('comun', 'Régimen Común'),
        ('simplificado', 'Régimen Simplificado'),
        ('especial', 'Régimen Especial'),
    ]
    
    # Clasificación de cliente
    CLASIFICACION_CHOICES = [
        ('A', 'Clase A - Premium'),
        ('B', 'Clase B - Estándar'),
        ('C', 'Clase C - Básico'),
    ]
    
    # Estado del cliente
    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
        ('suspendido', 'Suspendido'),
        ('bloqueado', 'Bloqueado'),
    ]
    
    # Tipo de cuenta bancaria
    TIPO_CUENTA_CHOICES = [
        ('corriente', 'Cuenta Corriente'),
        ('ahorros', 'Cuenta de Ahorros'),
        ('nomina', 'Cuenta Nómina'),
    ]
    
    # Tipo de documento
    TIPO_DOCUMENTO_CHOICES = [
        ('NIT', 'NIT'),
        ('CC', 'Cédula de Ciudadanía'),
        ('CE', 'Cédula de Extranjería'),
        ('PAS', 'Pasaporte'),
    ]
    
    # ═══════════════════════════════════════════════════════════════
    # INFORMACIÓN BÁSICA
    # ═══════════════════════════════════════════════════════════════
    
    # ✅ CORREGIDO
    codigo_cliente = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True,
        verbose_name="Código Cliente"
    )

    nombre = models.CharField(max_length=200, verbose_name="Nombre/Razón Social")
    compania = models.CharField(max_length=200, blank=True, null=True, verbose_name="Compañía")
    logotipo = models.ImageField(upload_to='crm/logotipos/', blank=True, null=True, verbose_name="Logotipo de la Empresa")
    tipo_cliente = models.CharField(max_length=25, choices=TIPO_CLIENTE_CHOICES, default='empresa', verbose_name="Tipo de Cliente")
    
    # ═══════════════════════════════════════════════════════════════
    # IDENTIFICACIÓN Y TRIBUTACIÓN (DIAN - COLOMBIA)
    # ═══════════════════════════════════════════════════════════════
    tipo_documento = models.CharField(max_length=5, choices=TIPO_DOCUMENTO_CHOICES, default='NIT', verbose_name="Tipo de Documento")
    cedula = models.CharField(max_length=20, unique=True, blank=True, null=True, verbose_name="Cédula")
    nit = models.CharField(max_length=20, unique=True, blank=True, null=True, verbose_name="NIT")
    digito_verificacion = models.CharField(max_length=1, blank=True, null=True, verbose_name="Dígito Verificación")
    codigo_barras = models.CharField(max_length=50, blank=True, null=True, unique=True, verbose_name="Código de Barras")
    
    responsable_iva = models.BooleanField(default=False, verbose_name="¿Responsable de IVA?")
    gran_contribuyente = models.BooleanField(default=False, verbose_name="¿Gran Contribuyente?")
    agente_retenedor = models.BooleanField(default=False, verbose_name="¿Agente Retenedor?")
    regimen_tributario = models.CharField(max_length=20, choices=REGIMEN_CHOICES, default='comun', verbose_name="Régimen Tributario")
    
    numero_resolucion_dian = models.CharField(max_length=50, blank=True, null=True, verbose_name="Resolución DIAN")
    fecha_resolucion_dian = models.DateField(blank=True, null=True, verbose_name="Fecha Resolución DIAN")
    
    actividad_economica_ciiu = models.CharField(max_length=10, blank=True, null=True, verbose_name="Actividad Económica (CIIU)")
    responsabilidades_fiscales = models.CharField(max_length=100, blank=True, null=True, verbose_name="Responsabilidades Fiscales (DIAN)")
    matricula_mercantil = models.CharField(max_length=50, blank=True, null=True, verbose_name="Matrícula Mercantil")
    correo_facturacion_electronica = models.EmailField(blank=True, null=True, verbose_name="Correo para Facturación Electrónica")
    
    # ═══════════════════════════════════════════════════════════════
    # INFORMACIÓN COMERCIAL
    # ═══════════════════════════════════════════════════════════════
    clasificacion = models.CharField(max_length=1, choices=CLASIFICACION_CHOICES, default='B', verbose_name="Clasificación")
    sector_industria = models.CharField(max_length=200, blank=True, null=True, verbose_name="Sector/Industria")
    
    credito_maximo = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Crédito Máximo (COP)")
    dias_credito = models.PositiveIntegerField(default=0, verbose_name="Días de Crédito")
    descuento_general = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name="Descuento General (%)")
    
    condicion_pago = models.CharField(max_length=200, blank=True, null=True, verbose_name="Condición de Pago")
    lista_precios = models.CharField(max_length=100, blank=True, null=True, verbose_name="Lista de Precios")
    
    # ═══════════════════════════════════════════════════════════════
    # CONTACTOS
    # ═══════════════════════════════════════════════════════════════
    email = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20, blank=True, verbose_name="Teléfono Principal")
    telefono_alterno = models.CharField(max_length=20, blank=True, null=True, verbose_name="Teléfono Alterno")
    fax = models.CharField(max_length=20, blank=True, null=True, verbose_name="Fax")
    
    contacto_principal = models.CharField(max_length=200, blank=True, null=True, verbose_name="Contacto Principal")
    cargo_contacto = models.CharField(max_length=100, blank=True, null=True, verbose_name="Cargo Contacto")
    email_contacto = models.EmailField(blank=True, null=True, verbose_name="Email Contacto")
    telefono_contacto = models.CharField(max_length=20, blank=True, null=True, verbose_name="Teléfono Contacto")
    
    representante_legal = models.CharField(max_length=200, blank=True, null=True, verbose_name="Representante Legal")
    cedula_representante = models.CharField(max_length=20, blank=True, null=True, verbose_name="Cédula Representante")
    
    # ═══════════════════════════════════════════════════════════════
    # DIRECCIONES
    # ═══════════════════════════════════════════════════════════════
    direccion = models.TextField(verbose_name="Dirección de Facturación")
    ciudad = models.CharField(max_length=100, blank=True, null=True, verbose_name="Ciudad")
    departamento = models.CharField(max_length=100, blank=True, null=True, verbose_name="Departamento")
    pais = models.CharField(max_length=100, default='Colombia', verbose_name="País")
    codigo_postal = models.CharField(max_length=20, blank=True, null=True, verbose_name="Código Postal")
    
    direccion_entrega = models.TextField(blank=True, null=True, verbose_name="Dirección de Entrega")
    ciudad_entrega = models.CharField(max_length=100, blank=True, null=True, verbose_name="Ciudad Entrega")
    
    # ═══════════════════════════════════════════════════════════════
    # INFORMACIÓN BANCARIA
    # ═══════════════════════════════════════════════════════════════
    banco_nombre = models.CharField(max_length=100, blank=True, null=True, verbose_name="Banco")
    numero_cuenta = models.CharField(max_length=50, blank=True, null=True, verbose_name="Número de Cuenta")
    tipo_cuenta = models.CharField(max_length=20, choices=TIPO_CUENTA_CHOICES, blank=True, null=True, verbose_name="Tipo de Cuenta")
    titular_cuenta = models.CharField(max_length=200, blank=True, null=True, verbose_name="Titular Cuenta")
    codigo_bancario = models.CharField(max_length=10, blank=True, null=True, verbose_name="Código Bancario")
    
    # ═══════════════════════════════════════════════════════════════
    # INFORMACIÓN ADICIONAL
    # ═══════════════════════════════════════════════════════════════
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='activo', verbose_name="Estado")
    
    fecha_constitucion = models.DateField(blank=True, null=True, verbose_name="Fecha de Constitución")
    fecha_ultimo_contacto = models.DateField(blank=True, null=True, verbose_name="Fecha Último Contacto")
    
    notas = models.TextField(blank=True, null=True, verbose_name="Notas Internas")
    adjunto_archivos = models.FileField(upload_to='crm/adjuntos/', blank=True, null=True, verbose_name="Adjuntos")
    
    fecha_registro = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Registro")
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name="Última Actualización")
    
    class Meta:
        ordering = ['nombre']
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        indexes = [
            models.Index(fields=['nit']),
            models.Index(fields=['codigo_cliente']),
            models.Index(fields=['estado']),
        ]

    def __str__(self):
        return f"{self.codigo_cliente} - {self.nombre}"
    
    def save(self, *args, **kwargs):
        # Convertir strings vacías a None para evitar errores de integridad en campos Unique
        # y permitir que la base de datos los trate como NULL (evitando duplicados de '')
        if self.cedula == '': self.cedula = None
        if self.nit == '': self.nit = None
        if self.codigo_barras == '': self.codigo_barras = None
        if self.correo_facturacion_electronica == '': self.correo_facturacion_electronica = None

        # Auto-generar código de cliente si no existe
        if not self.codigo_cliente:
            from django.utils.text import slugify
            # Aseguramos un base_code por defecto si el nombre falla
            nombre_slug = slugify(self.nombre)
            base_code = nombre_slug[:8].upper() if nombre_slug else "CLI"
            count = Cliente.objects.filter(codigo_cliente__startswith=base_code).count()
            self.codigo_cliente = f"{base_code}{count + 1:04d}"
        
        super().save(*args, **kwargs)

class Oportunidad(models.Model):
    ESTADO_CHOICES = [
        ('nuevo', 'Nuevo'),
        ('calificado', 'Calificado'),
        ('propuesta', 'Propuesta'),
        ('negociacion', 'Negociación'),
        ('ganado', 'Ganado'),
        ('perdido', 'Perdido'),
    ]
    titulo = models.CharField(max_length=200, verbose_name="Título")
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='oportunidades', verbose_name="Cliente")
    valor_estimado = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Valor Estimado")
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='nuevo', verbose_name="Estado")
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    descripcion = models.TextField(blank=True, null=True, verbose_name="Descripción")

    class Meta:
        verbose_name = "Oportunidad"
        verbose_name_plural = "Oportunidades"
        ordering = ['-fecha_creacion']

    def __str__(self):
        return self.titulo

class Cotizacion(models.Model):
    ESTADO_CHOICES = [
        ('borrador', 'Borrador'),
        ('enviada', 'Enviada'),
        ('aceptada', 'Aceptada'),
        ('rechazada', 'Rechazada'),
        ('facturada', 'Facturada'),
    ]
    numero_cotizacion = models.CharField(max_length=20, unique=True, blank=True, null=True, verbose_name="N° Cotización")
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='cotizaciones', verbose_name="Cliente")
    asunto = models.CharField(max_length=200, verbose_name="Asunto")
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='borrador', verbose_name="Estado")
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    
    valor_total = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Subtotal")
    porcentaje_iva = models.DecimalField(max_digits=5, decimal_places=2, default=19, verbose_name="% IVA")
    gran_total = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Gran Total")
    
    tiempo_entrega = models.CharField(max_length=100, blank=True, null=True, verbose_name="Tiempo de Entrega")
    forma_pago = models.CharField(max_length=100, blank=True, null=True, verbose_name="Forma de Pago")
    garantia = models.CharField(max_length=100, blank=True, null=True, verbose_name="Garantía")
    validez_oferta = models.CharField(max_length=100, blank=True, null=True, verbose_name="Validez de Oferta")
    fecha_validez = models.DateField(blank=True, null=True, verbose_name="Fecha de Validez")

    class Meta:
        verbose_name = "Cotización"
        verbose_name_plural = "Cotizaciones"
        ordering = ['-fecha_creacion']

    def save(self, *args, **kwargs):
        if not self.numero_cotizacion:
            last_cot = Cotizacion.objects.all().order_by('id').last()
            new_id = (last_cot.id + 1) if last_cot else 1
            self.numero_cotizacion = f'COT-{new_id:04d}'
        
        # Calcular gran total basándose en el subtotal
        self.gran_total = float(self.valor_total) * (1 + float(self.porcentaje_iva) / 100)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.numero_cotizacion} - {self.cliente.nombre}"

class CotizacionDetalle(models.Model):
    cotizacion = models.ForeignKey(Cotizacion, on_delete=models.CASCADE, related_name='detalles', verbose_name="Cotización")
    item = models.IntegerField(verbose_name="Ítem")
    producto = models.CharField(max_length=200, verbose_name="Producto/Servicio")
    unidad = models.CharField(max_length=50, default='UND', verbose_name="Unidad")
    cantidad = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Cantidad")
    valor_unitario = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Valor Unitario")
    valor_total = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Valor Total")

    class Meta:
        verbose_name = "Detalle de Cotización"
        verbose_name_plural = "Detalles de Cotización"
        ordering = ['item']

    def save(self, *args, **kwargs):
        # El valor_total se calcula automáticamente
        self.valor_total = self.cantidad * self.valor_unitario
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.cotizacion.numero_cotizacion} - {self.producto}"