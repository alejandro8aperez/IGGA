from django.db import models
from django.core.validators import RegexValidator


# ─────────────────────────────────────────────
# Tablas de referencia (catálogos)
# ─────────────────────────────────────────────

class EPS(models.Model):
    nombre = models.CharField(max_length=120)
    codigo_habilitacion = models.CharField(max_length=20, blank=True)
    activa = models.BooleanField(default=True)

    class Meta:
        db_table = 'rrhh_eps'
        verbose_name = 'EPS'
        verbose_name_plural = 'EPS'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class AFP(models.Model):
    """Administradora de Fondos de Pensiones"""
    nombre = models.CharField(max_length=120)
    activa = models.BooleanField(default=True)

    class Meta:
        db_table = 'rrhh_afp'
        verbose_name = 'AFP (Pensión)'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class ARL(models.Model):
    """Administradora de Riesgos Laborales"""
    nombre = models.CharField(max_length=120)
    activa = models.BooleanField(default=True)

    class Meta:
        db_table = 'rrhh_arl'
        verbose_name = 'ARL'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class CajaCompensacion(models.Model):
    nombre = models.CharField(max_length=120)
    activa = models.BooleanField(default=True)

    class Meta:
        db_table = 'rrhh_caja_compensacion'
        verbose_name = 'Caja de Compensación'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Departamento(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)

    class Meta:
        db_table = 'rrhh_departamento'
        verbose_name = 'Departamento'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Cargo(models.Model):
    nombre = models.CharField(max_length=100)
    departamento = models.ForeignKey(
        Departamento, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='cargos'
    )
    descripcion = models.TextField(blank=True)

    class Meta:
        db_table = 'rrhh_cargo'
        verbose_name = 'Cargo'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


# ─────────────────────────────────────────────
# Modelo principal: Empleado
# ─────────────────────────────────────────────

class Empleado(models.Model):

    # ── Tipos de documento ──
    TIPO_DOC = [
        ('CC', 'Cédula de Ciudadanía'),
        ('CE', 'Cédula de Extranjería'),
        ('PA', 'Pasaporte'),
        ('TI', 'Tarjeta de Identidad'),
        ('NIT', 'NIT'),
    ]

    GENERO = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('O', 'Otro'),
        ('NI', 'No informa'),
    ]

    ESTADO_CIVIL = [
        ('S', 'Soltero/a'),
        ('C', 'Casado/a'),
        ('U', 'Unión libre'),
        ('D', 'Divorciado/a'),
        ('V', 'Viudo/a'),
    ]

    NIVEL_RIESGO_ARL = [
        ('I', 'Nivel I - Mínimo'),
        ('II', 'Nivel II - Bajo'),
        ('III', 'Nivel III - Medio'),
        ('IV', 'Nivel IV - Alto'),
        ('V', 'Nivel V - Máximo'),
    ]

    TIPO_CONTRATO = [
        ('IND', 'Término indefinido'),
        ('FIJ', 'Término fijo'),
        ('OBR', 'Obra o labor'),
        ('APR', 'Aprendizaje'),
        ('SER', 'Prestación de servicios'),
    ]

    TIPO_SALARIO = [
        ('FIJ', 'Salario fijo'),
        ('VAR', 'Salario variable'),
        ('INT', 'Salario integral'),
    ]

    BANCO = [
        ('BANCOLOMBIA', 'Bancolombia'),
        ('DAVIVIENDA', 'Davivienda'),
        ('BOGOTA', 'Banco de Bogotá'),
        ('OCCIDENTE', 'Banco de Occidente'),
        ('BBVA', 'BBVA'),
        ('NEQUI', 'Nequi'),
        ('DAVIPLATA', 'Daviplata'),
        ('OTRO', 'Otro'),
    ]

    TIPO_CUENTA = [
        ('AHO', 'Cuenta de ahorros'),
        ('CTE', 'Cuenta corriente'),
    ]

    ESTADO = [
        ('ACT', 'Activo'),
        ('INA', 'Inactivo'),
        ('VAC', 'En vacaciones'),
        ('INC', 'Incapacitado'),
        ('LIC', 'En licencia'),
        ('RET', 'Retirado'),
    ]

    # ── 1. Datos personales ──────────────────
    tipo_documento = models.CharField(max_length=5, choices=TIPO_DOC, default='CC')
    numero_documento = models.CharField(max_length=20, unique=True)
    primer_nombre = models.CharField(max_length=60)
    segundo_nombre = models.CharField(max_length=60, blank=True)
    primer_apellido = models.CharField(max_length=60)
    segundo_apellido = models.CharField(max_length=60, blank=True)
    fecha_nacimiento = models.DateField()
    lugar_nacimiento = models.CharField(max_length=100, blank=True)
    genero = models.CharField(max_length=2, choices=GENERO)
    estado_civil = models.CharField(max_length=2, choices=ESTADO_CIVIL, blank=True)
    nacionalidad = models.CharField(max_length=60, default='Colombiana')
    foto = models.ImageField(upload_to='rrhh/fotos/', null=True, blank=True)

    # ── 2. Contacto ─────────────────────────
    correo_personal = models.EmailField(blank=True)
    correo_corporativo = models.EmailField(blank=True)
    telefono_trabajo = models.CharField(max_length=20, blank=True)
    telefono_personal = models.CharField(max_length=20, blank=True)
    telefono_movil = models.CharField(max_length=20, blank=True)

    # ── 3. Dirección ────────────────────────
    direccion = models.CharField(max_length=200, blank=True)
    barrio = models.CharField(max_length=100, blank=True)
    ciudad = models.CharField(max_length=100, blank=True)
    departamento_residencia = models.CharField(max_length=100, blank=True)
    codigo_postal = models.CharField(max_length=10, blank=True)
    pais = models.CharField(max_length=60, default='Colombia')

    # ── 4. Datos laborales ──────────────────
    cargo = models.ForeignKey(
        Cargo, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='empleados'
    )
    departamento = models.ForeignKey(
        Departamento, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='empleados'
    )
    fecha_ingreso = models.DateField()
    fecha_retiro = models.DateField(null=True, blank=True)
    tipo_contrato = models.CharField(max_length=3, choices=TIPO_CONTRATO, default='IND')
    tipo_salario = models.CharField(max_length=3, choices=TIPO_SALARIO, default='FIJ')
    salario_basico = models.DecimalField(max_digits=12, decimal_places=2)
    auxilio_transporte = models.BooleanField(default=True)
    pagina_web = models.URLField(blank=True)
    estado = models.CharField(max_length=3, choices=ESTADO, default='ACT')
    notas = models.TextField(blank=True)

    # ── 5. Seguridad social ─────────────────
    eps = models.ForeignKey(
        EPS, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='empleados'
    )
    afp = models.ForeignKey(
        AFP, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='empleados'
    )
    arl = models.ForeignKey(
        ARL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='empleados'
    )
    nivel_riesgo_arl = models.CharField(
        max_length=3, choices=NIVEL_RIESGO_ARL, default='I', blank=True
    )
    caja_compensacion = models.ForeignKey(
        CajaCompensacion, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='empleados'
    )
    fondo_cesantias = models.CharField(max_length=120, blank=True)

    # ── 6. Datos bancarios ──────────────────
    banco = models.CharField(max_length=20, choices=BANCO, blank=True)
    tipo_cuenta = models.CharField(max_length=3, choices=TIPO_CUENTA, blank=True)
    numero_cuenta = models.CharField(max_length=30, blank=True)

    # ── 7. Auditoría ────────────────────────
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rrhh_empleado'
        verbose_name = 'Empleado'
        verbose_name_plural = 'Empleados'
        ordering = ['primer_apellido', 'primer_nombre']

    def __str__(self):
        return f"{self.primer_nombre} {self.primer_apellido} ({self.numero_documento})"

    @property
    def nombre_completo(self):
        partes = [self.primer_nombre, self.segundo_nombre,
                  self.primer_apellido, self.segundo_apellido]
        return ' '.join(p for p in partes if p)


# ─────────────────────────────────────────────
# Contacto de emergencia
# ─────────────────────────────────────────────

class ContactoEmergencia(models.Model):

    PARENTESCO = [
        ('CON', 'Cónyuge / Compañero(a)'),
        ('PAD', 'Padre'),
        ('MAD', 'Madre'),
        ('HIJ', 'Hijo/a'),
        ('HER', 'Hermano/a'),
        ('AMI', 'Amigo/a'),
        ('OTR', 'Otro'),
    ]

    empleado = models.ForeignKey(
        Empleado, on_delete=models.CASCADE,
        related_name='contactos_emergencia'
    )
    nombre_completo = models.CharField(max_length=150)
    parentesco = models.CharField(max_length=3, choices=PARENTESCO)
    telefono_principal = models.CharField(max_length=20)
    telefono_alternativo = models.CharField(max_length=20, blank=True)
    correo = models.EmailField(blank=True)
    es_principal = models.BooleanField(default=False)

    class Meta:
        db_table = 'rrhh_contacto_emergencia'
        verbose_name = 'Contacto de emergencia'
        verbose_name_plural = 'Contactos de emergencia'

    def __str__(self):
        return f"{self.nombre_completo} ({self.get_parentesco_display()}) — {self.empleado}"
