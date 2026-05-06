from django.db import models
from django.core.validators import RegexValidator

class Cliente(models.Model):
    nombre = models.CharField(max_length=200)
    compania = models.CharField(max_length=200, blank=True, null=True, verbose_name="Compañía")
    email = models.EmailField(unique=True)
    cedula = models.CharField(max_length=20, unique=True, blank=True, null=True)
    nit = models.CharField(max_length=20, unique=True, blank=True, null=True, verbose_name="NIT")
    
    # Validador para asegurar formato telefónico consistente
    phone_regex = RegexValidator(
        regex=r'^\+?[\d\s\-]{7,20}$',
        message="El número debe tener entre 7 y 20 dígitos (puede incluir espacios o guiones)."
    )
    telefono = models.CharField(validators=[phone_regex], max_length=20, blank=True)
    direccion = models.TextField(blank=True)
    notas = models.TextField(blank=True, null=True, verbose_name="Notas")
    adjunto_archivos = models.FileField(upload_to='crm/adjuntos/', blank=True, null=True, verbose_name="Adjuntos")
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre

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
