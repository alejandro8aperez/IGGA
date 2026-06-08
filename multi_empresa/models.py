from django.db import models
from django.contrib.auth.models import User

class Empresa(models.Model):
    """Modelo principal para gestión multi-empresa"""
    nit = models.CharField(max_length=20, unique=True, verbose_name="NIT")
    razon_social = models.CharField(max_length=200, verbose_name="Razón Social")
    nombre_comercial = models.CharField(max_length=200, blank=True, verbose_name="Nombre Comercial")
    tipo_empresa = models.CharField(max_length=50, choices=[
        ('matriz', 'Matriz'),
        ('sucursal', 'Sucursal'),
        ('filial', 'Filial'),
        ('independiente', 'Independiente'),
    ], default='independiente')
    
    # Relaciones jerárquicas
    empresa_matriz = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, 
                                       related_name='sucursales', verbose_name="Empresa Matriz")
    
    # Información fiscal y legal
    regimen_fiscal = models.CharField(max_length=50, choices=[
        ('comun', 'Régimen Común'),
        ('simplificado', 'Régimen Simplificado'),
        ('especial', 'Régimen Especial'),
    ], default='comun')
    tipo_contribuyente = models.CharField(max_length=50, choices=[
        ('persona_natural', 'Persona Natural'),
        ('persona_juridica', 'Persona Jurídica'),
    ], default='persona_juridica')
    
    # Información de contacto
    direccion = models.TextField(blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    sitio_web = models.URLField(blank=True)
    
    # Información económica
    moneda_base = models.CharField(max_length=3, default='COP')
    pais = models.CharField(max_length=50, default='Colombia')
    ciudad = models.CharField(max_length=50, blank=True)
    
    # Configuración del sistema
    activa = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_ultima_modificacion = models.DateTimeField(auto_now=True)
    
    # Responsables
    administrador = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, 
                                      related_name='empresas_administradas', verbose_name="Administrador")
    
    class Meta:
        verbose_name = "Empresa"
        verbose_name_plural = "Empresas"
        ordering = ['razon_social']
    
    def __str__(self):
        return f"{self.razon_social} ({self.nit})"
    
    @property
    def es_matriz(self):
        return self.tipo_empresa == 'matriz'
    
    @property
    def sucursales_count(self):
        return self.sucursales.count()

class CentroCosto(models.Model):
    """Centros de costo para control presupuestal"""
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='centros_costo')
    codigo = models.CharField(max_length=20, verbose_name="Código")
    nombre = models.CharField(max_length=100, verbose_name="Nombre")
    descripcion = models.TextField(blank=True)
    
    tipo_centro = models.CharField(max_length=50, choices=[
        ('produccion', 'Producción'),
        ('administrativo', 'Administrativo'),
        ('ventas', 'Ventas'),
        ('distribucion', 'Distribución'),
        ('servicio', 'Servicio'),
    ], default='administrativo')
    
    responsable = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='centros_costo_multi_empresa')
    activo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Centro de Costo"
        verbose_name_plural = "Centros de Costo"
        unique_together = ['empresa', 'codigo']
        ordering = ['empresa', 'codigo']
    
    def __str__(self):
        return f"{self.codigo} - {self.nombre} ({self.empresa.razon_social})"

class Almacen(models.Model):
    """Gestión de múltiples almacenes por empresa"""
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='almacenes')
    codigo = models.CharField(max_length=20, verbose_name="Código Almacén")
    nombre = models.CharField(max_length=100, verbose_name="Nombre")
    direccion = models.TextField(blank=True)
    ciudad = models.CharField(max_length=50, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    
    tipo_almacen = models.CharField(max_length=50, choices=[
        ('principal', 'Principal'),
        ('secundario', 'Secundario'),
        ('transito', 'Tránsito'),
        ('devoluciones', 'Devoluciones'),
        ('consignacion', 'Consignación'),
    ], default='principal')
    
    responsable = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='centros_costo_multi_empresa')
    activo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Almacén"
        verbose_name_plural = "Almacenes"
        unique_together = ['empresa', 'codigo']
        ordering = ['empresa', 'codigo']
    
    def __str__(self):
        return f"{self.codigo} - {self.nombre} ({self.empresa.razon_social})"

class ConfiguracionEmpresa(models.Model):
    """Configuraciones específicas por empresa"""
    empresa = models.OneToOneField(Empresa, on_delete=models.CASCADE, related_name='configuracion')
    
    # Configuración financiera
    año_fiscal_inicio = models.IntegerField(default=1)  # Mes de inicio (1-12)
    moneda_reportes = models.CharField(max_length=3, default='COP')
    formato_fecha = models.CharField(max_length=20, default='DD/MM/YYYY')
    
    # Configuración de inventarios
    metodo_valuacion_inventario = models.CharField(max_length=50, choices=[
        ('fifo', 'FIFO'),
        ('lifo', 'LIFO'),
        ('promedio_ponderado', 'Promedio Ponderado'),
        ('identificacion_especifica', 'Identificación Específica'),
    ], default='promedio_ponderado')
    
    # Configuración de ventas
    porcentaje_iva_default = models.DecimalField(max_digits=5, decimal_places=2, default=19.00)
    porcentaje_retefuente_default = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    porcentaje_reteica_default = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    # Configuración de contabilidad
    digitos_cuenta_contable = models.IntegerField(default=8)
    permite_asientos_automaticos = models.BooleanField(default=True)
    
    # Configuración de aprovisionamiento
    requiere_aprobacion_compras = models.BooleanField(default=True)
    monto_minimo_aprobacion = models.DecimalField(max_digits=14, decimal_places=2, default=1000000)
    
    class Meta:
        verbose_name = "Configuración de Empresa"
        verbose_name_plural = "Configuraciones de Empresa"
    
    def __str__(self):
        return f"Configuración - {self.empresa.razon_social}"

class UsuarioEmpresa(models.Model):
    """Asignación de usuarios a empresas con roles específicos"""
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='usuarios_asignados')
    
    rol_empresa = models.CharField(max_length=50, choices=[
        ('administrador', 'Administrador'),
        ('gerente', 'Gerente'),
        ('supervisor', 'Supervisor'),
        ('operador', 'Operador'),
        ('consultor', 'Consultor'),
    ], default='operador')
    
    permisos_especificos = models.JSONField(default=dict, blank=True, 
                                           help_text="Permisos específicos por módulo")
    
    activo = models.BooleanField(default=True)
    fecha_asignacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Usuario Empresa"
        verbose_name_plural = "Usuarios Empresa"
        unique_together = ['usuario', 'empresa']
        ordering = ['empresa', 'rol_empresa', 'usuario']
    
    def __str__(self):
        return f"{self.usuario.username} - {self.empresa.razon_social} ({self.rol_empresa})"

# Create your models here.
