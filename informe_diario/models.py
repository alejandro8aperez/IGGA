"""
Models for the Informe Diario de Obra (Daily Construction Report) module.

Designed to plug into the ERP-8AMPERIOS Django project. Uses string-based
relations to optional external models so the app can run standalone OR
inside the real ERP (where `proyectos.ProyectoPS` exists).
"""
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator


# ---------------------------------------------------------------------------
# Catálogos maestros (configurables desde la app)
# ---------------------------------------------------------------------------

class Obra(models.Model):
    """Site/Project (Obra). If integrated with ERP, can mirror or link to
    proyectos.ProyectoPS via codigo_ps."""
    codigo = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=200)
    ubicacion = models.CharField(max_length=255, blank=True)
    cliente = models.CharField(max_length=200, blank=True)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['nombre']
        verbose_name = 'Obra'
        verbose_name_plural = 'Obras'

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"


class CategoriaRecurso(models.Model):
    """Top-level grouping for resources. Examples seeded:
    'MAQUINARIA-EQUIPOS-HERRAMIENTAS-VEHICULOS', 'PERSONAL DE OBRA'."""
    nombre = models.CharField(max_length=100, unique=True)
    orden = models.IntegerField(default=0)

    class Meta:
        ordering = ['orden', 'nombre']
        verbose_name = 'Categoría de Recurso'
        verbose_name_plural = 'Categorías de Recursos'

    def __str__(self):
        return self.nombre


class Recurso(models.Model):
    """Configurable master list: a piece of equipment or a personnel role.
    e.g. 'CAMIONETAS (Siemens)', 'Coordinadora SST'."""
    categoria = models.ForeignKey(CategoriaRecurso, on_delete=models.PROTECT,
                                  related_name='recursos')
    nombre = models.CharField(max_length=200)
    unidad = models.CharField(max_length=20, default='unidad',
                              help_text="Ej: unidad, persona, hora")
    activo = models.BooleanField(default=True)
    orden = models.IntegerField(default=0)

    class Meta:
        ordering = ['categoria', 'orden', 'nombre']
        unique_together = [('categoria', 'nombre')]
        verbose_name = 'Recurso'
        verbose_name_plural = 'Recursos'

    def __str__(self):
        return f"{self.nombre} ({self.categoria.nombre})"


class CategoriaActividad(models.Model):
    """Activity buckets in the daily report. Examples:
    'ACTIVIDADES ADMINISTRATIVAS Y DOCUMENTALES (INGESED)',
    'ACTIVIDADES DE CABLEADO (SIEMENS)', etc."""
    nombre = models.CharField(max_length=255, unique=True)
    orden = models.IntegerField(default=0)
    activo = models.BooleanField(default=True)

    class Meta:
        ordering = ['orden', 'nombre']
        verbose_name = 'Categoría de Actividad'
        verbose_name_plural = 'Categorías de Actividades'

    def __str__(self):
        return self.nombre


# ---------------------------------------------------------------------------
# Informe Diario
# ---------------------------------------------------------------------------

class InformeDiario(models.Model):
    obra = models.ForeignKey(Obra, on_delete=models.PROTECT,
                             related_name='informes')
    fecha = models.DateField()
    dia_semana = models.CharField(max_length=20, blank=True)
    numero_paginas = models.IntegerField(default=1)
    codigo_formato = models.CharField(max_length=50, default='F-141-IN')

    observaciones_generales = models.TextField(blank=True)
    estado_terreno_inicio = models.TextField(
        blank=True, help_text="Estado al iniciar la jornada (riesgos físicos/locativos)")
    estado_terreno_final = models.TextField(
        blank=True, help_text="Estado al finalizar la jornada (riesgos físicos/locativos)")

    # ── FIRMAS vinculadas a RRHH ──────────────────────────────
    elaborado_por = models.ForeignKey(
        'rrhh.Empleado',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='informes_elaborados',
        verbose_name='Elaborado por'
    )
    revisado_por = models.ForeignKey(
        'rrhh.Empleado',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='informes_revisados',
        verbose_name='Revisado por'
    )
    # Campos de respaldo para compatibilidad (se mantienen por si acaso)
    elaborado_por_texto = models.CharField(max_length=200, blank=True, verbose_name='Elaborado por (texto)')
    cargo_elaborado = models.CharField(max_length=200, blank=True)
    revisado_por_texto = models.CharField(max_length=200, blank=True, verbose_name='Revisado por (texto)')
    cargo_revisado = models.CharField(max_length=200, blank=True)
    # ─────────────────────────────────────────────────────────

    comision_topografia = models.BooleanField(default=False, help_text="Comisión de Topografía presente")

    status = models.CharField(max_length=20, default='borrador', choices=[
        ('borrador', 'Borrador'),
        ('enviado', 'Enviado'),
        ('aprobado', 'Aprobado'),
    ])

    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)
    creado_por = models.ForeignKey(settings.AUTH_USER_MODEL, null=True,
                                   blank=True, on_delete=models.SET_NULL)

    class Meta:
        ordering = ['-fecha']
        unique_together = [('obra', 'fecha')]
        verbose_name = 'Informe Diario'
        verbose_name_plural = 'Informes Diarios'

    def save(self, *args, **kwargs):
        if self.fecha and not self.dia_semana:
            dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves',
                    'Viernes', 'Sábado', 'Domingo']
            self.dia_semana = dias[self.fecha.weekday()]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.obra.codigo} - {self.fecha}"

    @property
    def total_personal(self):
        total_cat = sum(
            d.cantidad for d in self.detalles.all()
            if d.recurso.categoria.nombre.upper().startswith('PERSONAL')
        )
        total_libre = sum(p.cantidad for p in self.personal_libre.all())
        return total_cat + total_libre

    @property
    def total_maquinaria(self):
        total_cat = sum(
            d.cantidad for d in self.detalles.all()
            if not d.recurso.categoria.nombre.upper().startswith('PERSONAL')
        )
        total_libre = sum(m.cantidad for m in self.maquinaria_libre.all())
        return total_cat + total_libre

    @property
    def total_horas_lluvia(self):
        return self.reportes_lluvia.filter(con_lluvia=True).count()

    @property
    def total_actividades(self):
        return self.actividades.count()

    @property
    def nombre_elaborado(self):
        if self.elaborado_por:
            return f"{self.elaborado_por.primer_nombre} {self.elaborado_por.primer_apellido}".strip()
        return self.elaborado_por_texto

    @property
    def nombre_revisado(self):
        if self.revisado_por:
            return f"{self.revisado_por.primer_nombre} {self.revisado_por.primer_apellido}".strip()
        return self.revisado_por_texto

    @property
    def cargo_elaborado_rrhh(self):
        if self.elaborado_por and self.elaborado_por.cargo:
            return self.elaborado_por.cargo.nombre if hasattr(self.elaborado_por.cargo, 'nombre') else str(self.elaborado_por.cargo)
        return self.cargo_elaborado

    @property
    def cargo_revisado_rrhh(self):
        if self.revisado_por and self.revisado_por.cargo:
            return self.revisado_por.cargo.nombre if hasattr(self.revisado_por.cargo, 'nombre') else str(self.revisado_por.cargo)
        return self.cargo_revisado


class DetalleRecurso(models.Model):
    """Quantity of a given resource (maquinaria or personnel) for a report."""
    informe = models.ForeignKey(InformeDiario, on_delete=models.CASCADE,
                                related_name='detalles')
    recurso = models.ForeignKey(Recurso, on_delete=models.PROTECT)
    cantidad = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    empresa = models.CharField(max_length=200, blank=True)
    notas = models.TextField(blank=True, null=True, verbose_name="Notas")

    class Meta:
        unique_together = [('informe', 'recurso')]
        ordering = ['recurso__categoria__orden', 'recurso__orden']


class MaquinariaLibre(models.Model):
    """Filas de maquinaria agregadas manualmente (no catálogo)."""
    informe = models.ForeignKey(InformeDiario, on_delete=models.CASCADE, related_name='maquinaria_libre')
    descripcion = models.CharField(max_length=255)
    cantidad = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    empresa = models.CharField(max_length=200, blank=True)
    notas = models.TextField(blank=True, null=True, verbose_name="Notas")
    orden = models.IntegerField(default=0)


class PersonalLibre(models.Model):
    """Filas de personal agregadas manualmente (no catálogo)."""
    informe = models.ForeignKey(InformeDiario, on_delete=models.CASCADE, related_name='personal_libre')
    descripcion = models.CharField(max_length=255)
    cantidad = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    empresa = models.CharField(max_length=200, blank=True)
    notas = models.TextField(blank=True, null=True, verbose_name="Notas")
    orden = models.IntegerField(default=0)


class ReporteLluvia(models.Model):
    """One row per hourly slot (0-23) flagging if it rained."""
    informe = models.ForeignKey(InformeDiario, on_delete=models.CASCADE,
                                related_name='reportes_lluvia')
    hora = models.IntegerField()  # 0..23
    con_lluvia = models.BooleanField(default=False)

    class Meta:
        unique_together = [('informe', 'hora')]
        ordering = ['hora']


class Actividad(models.Model):
    """Free-text activity items under a category, for a given report."""
    informe = models.ForeignKey(InformeDiario, on_delete=models.CASCADE,
                                related_name='actividades')
    categoria = models.ForeignKey(CategoriaActividad, on_delete=models.PROTECT)
    descripcion = models.TextField()
    orden = models.IntegerField(default=0)

    class Meta:
        ordering = ['categoria__orden', 'orden', 'id']


class ItemObra(models.Model):
    """Free-text work item line for a given report (table in F-141-IN)."""
    informe = models.ForeignKey(InformeDiario, on_delete=models.CASCADE,
                                related_name='items_obra')
    item = models.CharField(max_length=50, blank=True,
                            help_text="Número/código de ítem")
    descripcion = models.TextField()
    empresa = models.CharField(max_length=200, blank=True)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    orden = models.IntegerField(default=0)

    class Meta:
        ordering = ['orden', 'id']
        verbose_name = 'Ítem de Obra'
        verbose_name_plural = 'Ítems de Obra'

    def __str__(self):
        return f"{self.informe} - Item {self.item}"


class AnexoFoto(models.Model):
    """Photo annex stored in Cloudinary (or local in dev)."""
    informe = models.ForeignKey(InformeDiario, on_delete=models.CASCADE,
                                related_name='anexos')
    descripcion = models.CharField(max_length=500, blank=True)
    imagen = models.ImageField(upload_to='informe_diario/anexos/%Y/%m/')
    seccion = models.CharField(
        max_length=50, default='actividades',
        choices=[
            ('actividades', 'Registro Fotográfico Actividades'),
            ('sst', 'Seguridad, Salud y Medio Ambiente'),
        ],
    )
    orden = models.IntegerField(default=0)
    posicion = models.PositiveSmallIntegerField(
        default=0, 
        validators=[MinValueValidator(0), MaxValueValidator(24)],
        help_text="Posición en la cuadrícula 4x6 (1-24). 0 si no está asignada."
    )
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['seccion', 'posicion', 'orden']
