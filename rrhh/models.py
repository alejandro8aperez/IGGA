from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


# ═══════════════════════════════════════════════════════
# TABLAS DE REFERENCIA (Catálogos)
# ═══════════════════════════════════════════════════════

class EPS(models.Model):
    nombre = models.CharField(max_length=120)
    codigo_habilitacion = models.CharField(max_length=20, blank=True)
    activa = models.BooleanField(default=True)

    class Meta:
        db_table = 'rrhh_eps'
        verbose_name = 'EPS'
        ordering = ['nombre']

    def __str__(self): return self.nombre


class AFP(models.Model):
    nombre = models.CharField(max_length=120)
    activa = models.BooleanField(default=True)

    class Meta:
        db_table = 'rrhh_afp'
        verbose_name = 'AFP (Pensión)'
        ordering = ['nombre']

    def __str__(self): return self.nombre


class ARL(models.Model):
    nombre = models.CharField(max_length=120)
    activa = models.BooleanField(default=True)

    class Meta:
        db_table = 'rrhh_arl'
        verbose_name = 'ARL'
        ordering = ['nombre']

    def __str__(self): return self.nombre


class CajaCompensacion(models.Model):
    nombre = models.CharField(max_length=120)
    activa = models.BooleanField(default=True)

    class Meta:
        db_table = 'rrhh_caja_compensacion'
        verbose_name = 'Caja de Compensación'
        ordering = ['nombre']

    def __str__(self): return self.nombre


class Departamento(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)

    class Meta:
        db_table = 'rrhh_departamento'
        verbose_name = 'Departamento'
        ordering = ['nombre']

    def __str__(self): return self.nombre


class Cargo(models.Model):
    nombre = models.CharField(max_length=100)
    departamento = models.ForeignKey(
        Departamento, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='cargos'
    )
    descripcion = models.TextField(blank=True)
    salario_minimo = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salario_maximo = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'rrhh_cargo'
        verbose_name = 'Cargo'
        ordering = ['nombre']

    def __str__(self): return self.nombre


class CentroCosto(models.Model):
    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=100)
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = 'rrhh_centro_costo'
        verbose_name = 'Centro de Costo'
        ordering = ['codigo']

    def __str__(self): return f"{self.codigo} - {self.nombre}"


# ═══════════════════════════════════════════════════════
# MODELO PRINCIPAL: EMPLEADO
# ═══════════════════════════════════════════════════════

class Empleado(models.Model):

    # ── Choices ──────────────────────────────────────
    TIPO_DOC = [
        ('CC', 'Cédula de Ciudadanía'),
        ('CE', 'Cédula de Extranjería'),
        ('PA', 'Pasaporte'),
        ('TI', 'Tarjeta de Identidad'),
        ('NIT', 'NIT'),
    ]
    GENERO = [
        ('M', 'Masculino'), ('F', 'Femenino'),
        ('O', 'Otro'), ('NI', 'No informa'),
    ]
    ESTADO_CIVIL = [
        ('S', 'Soltero/a'), ('C', 'Casado/a'), ('U', 'Unión libre'),
        ('D', 'Divorciado/a'), ('V', 'Viudo/a'),
    ]
    GRUPO_SANGUINEO = [
        ('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'), ('O+', 'O+'), ('O-', 'O-'),
    ]
    NIVEL_RIESGO_ARL = [
        ('I', 'Nivel I - Mínimo'), ('II', 'Nivel II - Bajo'),
        ('III', 'Nivel III - Medio'), ('IV', 'Nivel IV - Alto'),
        ('V', 'Nivel V - Máximo'),
    ]
    TIPO_CONTRATO = [
        ('IND', 'Término indefinido'), ('FIJ', 'Término fijo'),
        ('OBR', 'Obra o labor'), ('APR', 'Aprendizaje'),
        ('SER', 'Prestación de servicios'),
    ]
    TIPO_SALARIO = [
        ('FIJ', 'Salario fijo'), ('VAR', 'Salario variable'),
        ('INT', 'Salario integral'),
    ]
    PERIODICIDAD_PAGO = [
        ('SEM', 'Semanal'), ('QUI', 'Quincenal'), ('MEN', 'Mensual'),
    ]
    BANCO = [
        ('BANCOLOMBIA', 'Bancolombia'), ('DAVIVIENDA', 'Davivienda'),
        ('BOGOTA', 'Banco de Bogotá'), ('OCCIDENTE', 'Banco de Occidente'),
        ('BBVA', 'BBVA'), ('NEQUI', 'Nequi'), ('DAVIPLATA', 'Daviplata'),
        ('POPULAR', 'Banco Popular'), ('ITAU', 'Itaú'),
        ('SCOTIABANK', 'Scotiabank Colpatria'), ('OTRO', 'Otro'),
    ]
    TIPO_CUENTA = [
        ('AHO', 'Cuenta de ahorros'), ('CTE', 'Cuenta corriente'),
    ]
    TIPO_VIVIENDA = [
        ('PRO', 'Propia'), ('ARR', 'Arrendada'), ('FAM', 'Familiar'), ('OTR', 'Otra'),
    ]
    ESTADO = [
        ('ACT', 'Activo'), ('INA', 'Inactivo'), ('VAC', 'En vacaciones'),
        ('INC', 'Incapacitado'), ('LIC', 'En licencia'), ('RET', 'Retirado'),
    ]
    MOTIVO_RETIRO = [
        ('REN', 'Renuncia voluntaria'), ('DES', 'Despido sin justa causa'),
        ('DJC', 'Despido con justa causa'), ('MUT', 'Mutuo acuerdo'),
        ('FCC', 'Fin de contrato'), ('FAL', 'Fallecimiento'), ('OTR', 'Otro'),
    ]

    # ── 1. Identificación ────────────────────────────
    tipo_documento = models.CharField(max_length=5, choices=TIPO_DOC, default='CC')
    numero_documento = models.CharField(max_length=20, unique=True)
    fecha_expedicion_doc = models.DateField(null=True, blank=True)
    lugar_expedicion_doc = models.CharField(max_length=100, blank=True)

    # ── 2. Datos personales ──────────────────────────
    primer_nombre = models.CharField(max_length=60)
    segundo_nombre = models.CharField(max_length=60, blank=True)
    primer_apellido = models.CharField(max_length=60)
    segundo_apellido = models.CharField(max_length=60, blank=True)
    fecha_nacimiento = models.DateField()
    lugar_nacimiento = models.CharField(max_length=100, blank=True)
    genero = models.CharField(max_length=2, choices=GENERO)
    estado_civil = models.CharField(max_length=2, choices=ESTADO_CIVIL, blank=True)
    nacionalidad = models.CharField(max_length=60, default='Colombiana')
    grupo_sanguineo = models.CharField(max_length=4, choices=GRUPO_SANGUINEO, blank=True)
    estrato = models.IntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(6)]
    )
    tipo_vivienda = models.CharField(max_length=3, choices=TIPO_VIVIENDA, blank=True)
    foto = models.ImageField(upload_to='rrhh/fotos/', null=True, blank=True)

    # ── 3. Licencia de conducción ────────────────────
    tiene_licencia = models.BooleanField(default=False)
    categoria_licencia = models.CharField(max_length=10, blank=True)
    vencimiento_licencia = models.DateField(null=True, blank=True)

    # ── 4. Tallas (dotación) ─────────────────────────
    talla_camisa = models.CharField(max_length=5, blank=True)
    talla_pantalon = models.CharField(max_length=5, blank=True)
    talla_zapatos = models.CharField(max_length=5, blank=True)
    talla_casco = models.CharField(max_length=5, blank=True)

    # ── 5. Contacto ──────────────────────────────────
    correo_personal = models.EmailField(blank=True)
    correo_corporativo = models.EmailField(blank=True)
    telefono_trabajo = models.CharField(max_length=20, blank=True)
    telefono_personal = models.CharField(max_length=20, blank=True)
    telefono_movil = models.CharField(max_length=20, blank=True)

    # ── 6. Dirección ─────────────────────────────────
    direccion = models.CharField(max_length=200, blank=True)
    barrio = models.CharField(max_length=100, blank=True)
    ciudad = models.CharField(max_length=100, blank=True)
    departamento_residencia = models.CharField(max_length=100, blank=True)
    codigo_postal = models.CharField(max_length=10, blank=True)
    pais = models.CharField(max_length=60, default='Colombia')

    # ── 7. Datos laborales ───────────────────────────
    cargo = models.CharField(max_length=100, blank=True)
    departamento = models.CharField(max_length=100, blank=True)
    centro_costo = models.ForeignKey(
        CentroCosto, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='empleados'
    )
    jefe_directo = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='subordinados'
    )
    sede = models.CharField(max_length=100, blank=True)
    fecha_ingreso = models.DateField()
    fecha_fin_periodo_prueba = models.DateField(null=True, blank=True)
    fecha_retiro = models.DateField(null=True, blank=True)
    motivo_retiro = models.CharField(max_length=3, choices=MOTIVO_RETIRO, blank=True)
    tipo_contrato = models.CharField(max_length=3, choices=TIPO_CONTRATO, default='IND')
    fecha_vencimiento_contrato = models.DateField(null=True, blank=True)
    tipo_salario = models.CharField(max_length=3, choices=TIPO_SALARIO, default='FIJ')
    salario_basico = models.DecimalField(max_digits=12, decimal_places=2)
    auxilio_transporte = models.BooleanField(default=True)
    periodicidad_pago = models.CharField(max_length=3, choices=PERIODICIDAD_PAGO, default='MEN')
    horas_extras_autorizadas = models.BooleanField(default=False)
    estado = models.CharField(max_length=3, choices=ESTADO, default='ACT')
    notas = models.TextField(blank=True)

    # ── 8. Seguridad social ──────────────────────────
    eps = models.ForeignKey(EPS, on_delete=models.SET_NULL, null=True, blank=True, related_name='empleados')
    afp = models.ForeignKey(AFP, on_delete=models.SET_NULL, null=True, blank=True, related_name='empleados')
    arl = models.ForeignKey(ARL, on_delete=models.SET_NULL, null=True, blank=True, related_name='empleados')
    nivel_riesgo_arl = models.CharField(max_length=3, choices=NIVEL_RIESGO_ARL, blank=True)
    caja_compensacion = models.ForeignKey(CajaCompensacion, on_delete=models.SET_NULL, null=True, blank=True, related_name='empleados')
    fondo_cesantias = models.CharField(max_length=120, blank=True)

    # ── 9. Datos bancarios ───────────────────────────
    banco = models.CharField(max_length=20, choices=BANCO, blank=True)
    tipo_cuenta = models.CharField(max_length=3, choices=TIPO_CUENTA, blank=True)
    numero_cuenta = models.CharField(max_length=30, blank=True)

    # ── 10. Auditoría ────────────────────────────────
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


# ═══════════════════════════════════════════════════════
# CONTACTO DE EMERGENCIA
# ═══════════════════════════════════════════════════════

class ContactoEmergencia(models.Model):
    PARENTESCO = [
        ('CON', 'Cónyuge / Compañero(a)'), ('PAD', 'Padre'), ('MAD', 'Madre'),
        ('HIJ', 'Hijo/a'), ('HER', 'Hermano/a'), ('AMI', 'Amigo/a'), ('OTR', 'Otro'),
    ]
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='contactos_emergencia')
    nombre_completo = models.CharField(max_length=150)
    parentesco = models.CharField(max_length=3, choices=PARENTESCO)
    telefono_principal = models.CharField(max_length=20)
    telefono_alternativo = models.CharField(max_length=20, blank=True)
    correo = models.EmailField(blank=True)
    es_principal = models.BooleanField(default=False)

    class Meta:
        db_table = 'rrhh_contacto_emergencia'
        verbose_name = 'Contacto de emergencia'

    def __str__(self):
        return f"{self.nombre_completo} ({self.get_parentesco_display()}) — {self.empleado}"


# ═══════════════════════════════════════════════════════
# NÚCLEO FAMILIAR / BENEFICIARIOS
# ═══════════════════════════════════════════════════════

class Familiar(models.Model):
    PARENTESCO = [
        ('CON', 'Cónyuge / Compañero(a)'), ('HIJ', 'Hijo/a'),
        ('PAD', 'Padre'), ('MAD', 'Madre'), ('HER', 'Hermano/a'), ('OTR', 'Otro'),
    ]
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='familiares')
    nombre_completo = models.CharField(max_length=150)
    parentesco = models.CharField(max_length=3, choices=PARENTESCO)
    tipo_documento = models.CharField(max_length=5, blank=True)
    numero_documento = models.CharField(max_length=20, blank=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    depende_economicamente = models.BooleanField(default=False)
    beneficiario_eps = models.BooleanField(default=False)
    beneficiario_caja = models.BooleanField(default=False)

    class Meta:
        db_table = 'rrhh_familiar'
        verbose_name = 'Familiar / Beneficiario'

    def __str__(self):
        return f"{self.nombre_completo} — {self.empleado}"


# ═══════════════════════════════════════════════════════
# FORMACIÓN ACADÉMICA
# ═══════════════════════════════════════════════════════

class FormacionAcademica(models.Model):
    NIVEL = [
        ('PRI', 'Primaria'), ('SEC', 'Secundaria / Bachillerato'),
        ('TEC', 'Técnico'), ('TEN', 'Tecnólogo'), ('UNI', 'Universitario'),
        ('ESP', 'Especialización'), ('MAE', 'Maestría'), ('DOC', 'Doctorado'),
    ]
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='formacion_academica')
    nivel = models.CharField(max_length=3, choices=NIVEL)
    titulo = models.CharField(max_length=150)
    institucion = models.CharField(max_length=150)
    año_inicio = models.IntegerField(null=True, blank=True)
    año_fin = models.IntegerField(null=True, blank=True)
    graduado = models.BooleanField(default=True)
    tarjeta_profesional = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'rrhh_formacion_academica'
        verbose_name = 'Formación académica'

    def __str__(self):
        return f"{self.get_nivel_display()} — {self.titulo} ({self.empleado})"


# ═══════════════════════════════════════════════════════
# IDIOMAS
# ═══════════════════════════════════════════════════════

class Idioma(models.Model):
    NIVEL = [
        ('BAS', 'Básico'), ('INT', 'Intermedio'),
        ('AVZ', 'Avanzado'), ('NAT', 'Nativo'),
    ]
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='idiomas')
    idioma = models.CharField(max_length=60)
    nivel_oral = models.CharField(max_length=3, choices=NIVEL, default='BAS')
    nivel_escrito = models.CharField(max_length=3, choices=NIVEL, default='BAS')
    certificado = models.BooleanField(default=False)
    nombre_certificado = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = 'rrhh_idioma'
        verbose_name = 'Idioma'

    def __str__(self):
        return f"{self.idioma} ({self.get_nivel_oral_display()}) — {self.empleado}"


# ═══════════════════════════════════════════════════════
# CERTIFICACIONES Y CURSOS
# ═══════════════════════════════════════════════════════

class Certificacion(models.Model):
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='certificaciones')
    nombre = models.CharField(max_length=150)
    entidad_emisora = models.CharField(max_length=150)
    fecha_obtencion = models.DateField(null=True, blank=True)
    fecha_vencimiento = models.DateField(null=True, blank=True)
    numero_certificado = models.CharField(max_length=50, blank=True)
    archivo = models.FileField(upload_to='rrhh/certificaciones/', null=True, blank=True)

    class Meta:
        db_table = 'rrhh_certificacion'
        verbose_name = 'Certificación / Curso'

    def __str__(self):
        return f"{self.nombre} — {self.empleado}"


# ═══════════════════════════════════════════════════════
# EXPERIENCIA LABORAL ANTERIOR
# ═══════════════════════════════════════════════════════

class ExperienciaLaboral(models.Model):
    MOTIVO_SALIDA = [
        ('REN', 'Renuncia'), ('DES', 'Despido'), ('FCC', 'Fin de contrato'),
        ('MUT', 'Mutuo acuerdo'), ('OTR', 'Otro'),
    ]
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='experiencia_laboral')
    empresa = models.CharField(max_length=150)
    cargo = models.CharField(max_length=100)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    salario = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    motivo_salida = models.CharField(max_length=3, choices=MOTIVO_SALIDA, blank=True)
    jefe_nombre = models.CharField(max_length=150, blank=True)
    jefe_telefono = models.CharField(max_length=20, blank=True)
    funciones = models.TextField(blank=True)

    class Meta:
        db_table = 'rrhh_experiencia_laboral'
        verbose_name = 'Experiencia laboral'
        ordering = ['-fecha_inicio']

    def __str__(self):
        return f"{self.empresa} — {self.cargo} ({self.empleado})"


# ═══════════════════════════════════════════════════════
# VACACIONES
# ═══════════════════════════════════════════════════════

class Vacaciones(models.Model):
    ESTADO = [
        ('SOL', 'Solicitada'), ('APR', 'Aprobada'),
        ('REC', 'Rechazada'), ('DIS', 'Disfrutada'),
    ]
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='vacaciones')
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    dias_habiles = models.IntegerField()
    estado = models.CharField(max_length=3, choices=ESTADO, default='SOL')
    aprobado_por = models.ForeignKey(
        Empleado, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='vacaciones_aprobadas'
    )
    observaciones = models.TextField(blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'rrhh_vacaciones'
        verbose_name = 'Vacaciones'
        ordering = ['-fecha_inicio']

    def __str__(self):
        return f"{self.empleado} — {self.fecha_inicio} al {self.fecha_fin}"


# ═══════════════════════════════════════════════════════
# INCAPACIDADES Y LICENCIAS
# ═══════════════════════════════════════════════════════

class Incapacidad(models.Model):
    TIPO = [
        ('ENF', 'Enfermedad general'), ('ACC', 'Accidente de trabajo'),
        ('ENP', 'Enfermedad profesional'), ('MAT', 'Maternidad'),
        ('PAT', 'Paternidad'), ('LUT', 'Luto'), ('OTR', 'Otra'),
    ]
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='incapacidades')
    tipo = models.CharField(max_length=3, choices=TIPO)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    dias = models.IntegerField()
    entidad_emisora = models.CharField(max_length=100, blank=True)
    diagnostico = models.CharField(max_length=200, blank=True)
    codigo_cie10 = models.CharField(max_length=10, blank=True)
    archivo = models.FileField(upload_to='rrhh/incapacidades/', null=True, blank=True)
    observaciones = models.TextField(blank=True)

    class Meta:
        db_table = 'rrhh_incapacidad'
        verbose_name = 'Incapacidad / Licencia'
        ordering = ['-fecha_inicio']

    def __str__(self):
        return f"{self.get_tipo_display()} — {self.empleado} ({self.fecha_inicio})"


# ═══════════════════════════════════════════════════════
# DOTACIÓN
# ═══════════════════════════════════════════════════════

class Dotacion(models.Model):
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='dotaciones')
    fecha_entrega = models.DateField()
    item = models.CharField(max_length=100)
    talla = models.CharField(max_length=10, blank=True)
    cantidad = models.IntegerField(default=1)
    observaciones = models.CharField(max_length=200, blank=True)
    recibido_por = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = 'rrhh_dotacion'
        verbose_name = 'Dotación'
        ordering = ['-fecha_entrega']

    def __str__(self):
        return f"{self.item} — {self.empleado} ({self.fecha_entrega})"


# ═══════════════════════════════════════════════════════
# SALUD OCUPACIONAL / EXÁMENES MÉDICOS
# ═══════════════════════════════════════════════════════

class ExamenMedico(models.Model):
    TIPO = [
        ('ING', 'Ingreso'), ('PER', 'Periódico'),
        ('RET', 'Retiro'), ('POS', 'Post-incapacidad'),
    ]
    RESULTADO = [
        ('APT', 'Apto'), ('APR', 'Apto con restricciones'), ('NAP', 'No apto'),
    ]
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='examenes_medicos')
    tipo = models.CharField(max_length=3, choices=TIPO)
    fecha = models.DateField()
    resultado = models.CharField(max_length=3, choices=RESULTADO, blank=True)
    restricciones = models.TextField(blank=True)
    entidad = models.CharField(max_length=150, blank=True)
    medico = models.CharField(max_length=150, blank=True)
    proxima_revision = models.DateField(null=True, blank=True)
    archivo = models.FileField(upload_to='rrhh/examenes/', null=True, blank=True)

    class Meta:
        db_table = 'rrhh_examen_medico'
        verbose_name = 'Examen médico'
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.get_tipo_display()} — {self.empleado} ({self.fecha})"


# ═══════════════════════════════════════════════════════
# EPP (ELEMENTOS DE PROTECCIÓN PERSONAL)
# ═══════════════════════════════════════════════════════

class EPP(models.Model):
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='epps')
    elemento = models.CharField(max_length=100)
    marca = models.CharField(max_length=60, blank=True)
    fecha_entrega = models.DateField()
    fecha_vencimiento = models.DateField(null=True, blank=True)
    cantidad = models.IntegerField(default=1)
    devuelto = models.BooleanField(default=False)
    fecha_devolucion = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'rrhh_epp'
        verbose_name = 'EPP'
        verbose_name_plural = 'EPP'
        ordering = ['-fecha_entrega']

    def __str__(self):
        return f"{self.elemento} — {self.empleado}"


# ═══════════════════════════════════════════════════════
# HISTORIAL DISCIPLINARIO
# ═══════════════════════════════════════════════════════

class Disciplinario(models.Model):
    TIPO = [
        ('LLA', 'Llamado de atención verbal'),
        ('MEM', 'Memorando escrito'),
        ('SUS', 'Suspensión'),
        ('DES', 'Descargo'),
        ('OTR', 'Otro'),
    ]
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='disciplinarios')
    tipo = models.CharField(max_length=3, choices=TIPO)
    fecha = models.DateField()
    motivo = models.TextField()
    dias_suspension = models.IntegerField(default=0)
    firmado_empleado = models.BooleanField(default=False)
    archivo = models.FileField(upload_to='rrhh/disciplinarios/', null=True, blank=True)
    creado_por = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = 'rrhh_disciplinario'
        verbose_name = 'Registro disciplinario'
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.get_tipo_display()} — {self.empleado} ({self.fecha})"


# ═══════════════════════════════════════════════════════
# EVALUACIONES DE DESEMPEÑO
# ═══════════════════════════════════════════════════════

class EvaluacionDesempeno(models.Model):
    PERIODO = [
        ('T1', 'Primer trimestre'), ('T2', 'Segundo trimestre'),
        ('T3', 'Tercer trimestre'), ('T4', 'Cuarto trimestre'),
        ('SEM1', 'Primer semestre'), ('SEM2', 'Segundo semestre'),
        ('ANU', 'Anual'),
    ]
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='evaluaciones')
    año = models.IntegerField()
    periodo = models.CharField(max_length=5, choices=PERIODO)
    calificacion = models.DecimalField(
        max_digits=4, decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    fortalezas = models.TextField(blank=True)
    oportunidades_mejora = models.TextField(blank=True)
    plan_accion = models.TextField(blank=True)
    evaluado_por = models.ForeignKey(
        Empleado, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='evaluaciones_realizadas'
    )
    fecha_evaluacion = models.DateField()

    class Meta:
        db_table = 'rrhh_evaluacion_desempeno'
        verbose_name = 'Evaluación de desempeño'
        ordering = ['-año', '-periodo']

    def __str__(self):
        return f"{self.empleado} — {self.año} {self.get_periodo_display()} ({self.calificacion})"


# ═══════════════════════════════════════════════════════
# HISTORIAL DE CARGOS
# ═══════════════════════════════════════════════════════

class HistorialCargo(models.Model):
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='historial_cargos')
    cargo = models.CharField(max_length=100)
    departamento = models.CharField(max_length=100, blank=True)
    salario = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    motivo_cambio = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = 'rrhh_historial_cargo'
        verbose_name = 'Historial de cargo'
        ordering = ['-fecha_inicio']

    def __str__(self):
        return f"{self.cargo} — {self.empleado} desde {self.fecha_inicio}"


# ═══════════════════════════════════════════════════════
# DOCUMENTOS DEL EMPLEADO
# ═══════════════════════════════════════════════════════

class DocumentoEmpleado(models.Model):
    TIPO = [
        ('HV', 'Hoja de vida'), ('CC', 'Copia cédula'),
        ('DIP', 'Diplomas / Actas'), ('CER', 'Certificaciones'),
        ('EXM', 'Examen médico'), ('CTR', 'Contrato firmado'),
        ('AFI', 'Afiliaciones SS'), ('OTR', 'Otro'),
    ]
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='documentos')
    tipo = models.CharField(max_length=3, choices=TIPO)
    nombre = models.CharField(max_length=150)
    archivo = models.FileField(upload_to='rrhh/documentos/')
    fecha_carga = models.DateTimeField(auto_now_add=True)
    observaciones = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = 'rrhh_documento_empleado'
        verbose_name = 'Documento del empleado'
        ordering = ['-fecha_carga']

    def __str__(self):
        return f"{self.get_tipo_display()} — {self.empleado}"
