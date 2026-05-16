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
    
    # ═══════════════════════════════════════════════════════════════
    # INFORMACIÓN BÁSICA
    # ═══════════════════════════════════════════════════════════════
    codigo_cliente = models.CharField(max_length=50, unique=True, verbose_name="Código Cliente")
    nombre = models.CharField(max_length=200, verbose_name="Nombre/Razón Social")
    compania = models.CharField(max_length=200, blank=True, null=True, verbose_name="Compañía")
    logotipo = models.ImageField(upload_to='crm/logotipos/', blank=True, null=True, verbose_name="Logotipo de la Empresa")
    tipo_cliente = models.CharField(max_length=25, choices=TIPO_CLIENTE_CHOICES, default='empresa', verbose_name="Tipo de Cliente")
    
    # ═══════════════════════════════════════════════════════════════
    # IDENTIFICACIÓN Y TRIBUTACIÓN (DIAN - COLOMBIA)
    # ═══════════════════════════════════════════════════════════════
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
        # Auto-generar código de cliente si no existe
        if not self.codigo_cliente:
            from django.utils.text import slugify
            base_code = slugify(self.nombre)[:8].upper()
            count = Cliente.objects.filter(codigo_cliente__startswith=base_code).count()
            self.codigo_cliente = f"{base_code}{count + 1:04d}"
        
        super().save(*args, **kwargs)

class Oportunidad(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=200)
    valor_estimado = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=20, choices=[
        ('nueva', 'Nueva'),
        ('negociacion', 'En Negociación'),
        ('ganada', 'Ganada'),
        ('perdida', 'Perdida')
    ], default='nueva')
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.titulo} - {self.cliente.nombre}"

class Cotizacion(models.Model):
    numero_cotizacion = models.CharField(max_length=50, unique=True, blank=True, null=True)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    asunto = models.CharField(max_length=200)
    porcentaje_iva = models.DecimalField(max_digits=5, decimal_places=2, default=19.00)
    valor_total = models.DecimalField(max_digits=12, decimal_places=2) # Subtotal
    gran_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    estado = models.CharField(max_length=20, choices=[
        ('borrador', 'Borrador'),
        ('enviada', 'Enviada'),
        ('aceptada', 'Aceptada'),
        ('rechazada', 'Rechazada')
    ], default='borrador')
    tiempo_entrega = models.CharField(max_length=200, blank=True, null=True, default="15 días hábiles")
    forma_pago = models.CharField(max_length=200, blank=True, null=True, default="Contado")
    garantia = models.CharField(max_length=200, blank=True, null=True, default="1 Año")
    validez_oferta = models.CharField(max_length=200, blank=True, null=True, default="30 Días")
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_validez = models.DateField(null=True, blank=True)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        
        if self.valor_total is not None and self.porcentaje_iva is not None:
            iva_amount = (self.valor_total * self.porcentaje_iva) / 100
            self.gran_total = self.valor_total + iva_amount
            
        super().save(*args, **kwargs)
        
        if is_new and not self.numero_cotizacion:
            self.numero_cotizacion = f"KAVE-{self.id:04d}"
            type(self).objects.filter(pk=self.pk).update(numero_cotizacion=self.numero_cotizacion)

    def __str__(self):
        numero = self.numero_cotizacion or str(self.id)
        return f"Cotización #{numero} - {self.asunto} - {self.cliente.nombre}"

class CotizacionDetalle(models.Model):
    cotizacion = models.ForeignKey(Cotizacion, related_name='detalles', on_delete=models.CASCADE)
    item = models.PositiveIntegerField()
    producto = models.CharField(max_length=200)
    unidad = models.CharField(max_length=50)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    valor_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    valor_total = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)

    def save(self, *args, **kwargs):
        self.valor_total = self.cantidad * self.valor_unitario
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Detalle {self.item} - {self.producto} ({self.cotizacion.id})"
