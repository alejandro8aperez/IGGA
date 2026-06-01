from django.db import models
from django.contrib.auth.models import User


class Rol(models.Model):
    PERMISOS = [
        ('admin',        'Administrador'),
        ('operador',     'Operador'),
        ('solo_lectura', 'Solo Lectura'),
        ('interventor',  'Interventor'),
        ('contador',     'Contador'),
    ]
    nombre      = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True)
    creado_en   = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name      = 'Rol'
        verbose_name_plural = 'Roles'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class PermisoModulo(models.Model):
    MODULOS = [
        ('dashboard',       'Dashboard'),
        ('crm',             'CRM'),
        ('ventas',          'Ventas'),
        ('compras',         'Compras'),
        ('inventarios',     'Inventarios'),
        ('produccion',      'Producción'),
        ('rrhh',            'RRHH'),
        ('contabilidad',    'Contabilidad'),
        ('reportes',        'Reportes'),
        ('informe_diario',  'Informe Diario'),
        ('interventoria',   'Interventoría'),
        ('pos',             'Punto de Venta'),
        ('kave',            'KAVE Simulador'),
        ('configuracion',   'Configuración'),
        ('usuarios',        'Usuarios'),
    ]
    NIVELES = [
        ('sin_acceso',  'Sin Acceso'),
        ('lectura',     'Solo Lectura'),
        ('operador',    'Operador'),
        ('admin',       'Administrador'),
    ]
    rol     = models.ForeignKey(Rol, on_delete=models.CASCADE, related_name='permisos')
    modulo  = models.CharField(max_length=50, choices=MODULOS)
    nivel   = models.CharField(max_length=20, choices=NIVELES, default='sin_acceso')

    class Meta:
        unique_together     = ('rol', 'modulo')
        verbose_name        = 'Permiso de Módulo'
        verbose_name_plural = 'Permisos de Módulos'

    def __str__(self):
        return f'{self.rol.nombre} → {self.modulo} ({self.nivel})'


class PerfilUsuario(models.Model):
    CARGOS = [
        ('director',          'Director de Proyecto'),
        ('residente',         'Residente Técnico'),
        ('coordinador',       'Coordinador'),
        ('ingeniero',         'Ingeniero'),
        ('supervisor_sst',    'Supervisor SST'),
        ('almacenista',       'Almacenista'),
        ('aux_admin',         'Auxiliar Administrativo'),
        ('operador',          'Operador'),
        ('otro',              'Otro'),
    ]

    user        = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    rol         = models.ForeignKey(Rol, on_delete=models.SET_NULL, null=True, blank=True)
    cargo       = models.CharField(max_length=50, choices=CARGOS, blank=True)
    telefono    = models.CharField(max_length=20, blank=True)
    foto        = models.ImageField(upload_to='usuarios/fotos/', null=True, blank=True)
    empresa     = models.CharField(max_length=100, blank=True)
    activo      = models.BooleanField(default=True)
    creado_en   = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Perfil de Usuario'
        verbose_name_plural = 'Perfiles de Usuarios'

    def __str__(self):
        return f'{self.user.get_full_name() or self.user.username} — {self.cargo}'

    @property
    def nombre_completo(self):
        return self.user.get_full_name() or self.user.username

    def tiene_acceso(self, modulo, nivel_requerido='lectura'):
        if not self.rol:
            return False
        if self.user.is_superuser:
            return True
        orden = ['sin_acceso', 'lectura', 'operador', 'admin']
        try:
            permiso = self.rol.permisos.get(modulo=modulo)
            return orden.index(permiso.nivel) >= orden.index(nivel_requerido)
        except PermisoModulo.DoesNotExist:
            return False
