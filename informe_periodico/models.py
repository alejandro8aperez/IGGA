import json
from django.db import models
from django.conf import settings
from django.utils import timezone


class InformeSemanal(models.Model):
    proyecto = models.ForeignKey(
        'operaciones.Proyecto', on_delete=models.PROTECT,
        related_name='informes_semanales', verbose_name='Proyecto/Obra',
        null=True, blank=True,
    )
    fecha_inicio = models.DateField(verbose_name='Fecha inicio')
    fecha_fin = models.DateField(verbose_name='Fecha fin')
    semana_numero = models.IntegerField(verbose_name='N° Semana', default=0)
    resumen_ejecutivo = models.TextField(blank=True, verbose_name='Resumen ejecutivo')
    logros_principales = models.TextField(blank=True, verbose_name='Logros principales')
    dificultades = models.TextField(blank=True, verbose_name='Dificultades / Retrasos')
    observaciones = models.TextField(blank=True)
    estado_terreno = models.TextField(blank=True, verbose_name='Estado del terreno')

    # S-Curve data: JSON array [{fecha, programado, ejecutado}, ...]
    curva_s_data = models.JSONField(blank=True, default=list, verbose_name='Datos Curva S')

    # Resumen de recursos (cache) — JSON
    resumen_personal = models.JSONField(blank=True, default=dict)
    resumen_maquinaria = models.JSONField(blank=True, default=dict)

    # Firmas
    elaborado_por = models.ForeignKey(
        'rrhh.Empleado', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='semanales_elaborados',
    )
    revisado_por = models.ForeignKey(
        'rrhh.Empleado', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='semanales_revisados',
    )
    profesional_1 = models.ForeignKey(
        'rrhh.Empleado', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='semanales_profesional_1',
    )
    profesional_2 = models.ForeignKey(
        'rrhh.Empleado', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='semanales_profesional_2',
    )

    status = models.CharField(max_length=20, default='borrador', choices=[
        ('borrador', 'Borrador'),
        ('enviado', 'Enviado'),
        ('aprobado', 'Aprobado'),
    ])

    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL,
    )
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_inicio']
        unique_together = [('proyecto', 'fecha_inicio', 'fecha_fin')]
        verbose_name = 'Informe Semanal'
        verbose_name_plural = 'Informes Semanales'

    def __str__(self):
        proy = self.proyecto.nombre if self.proyecto else 'Sin proyecto'
        return f"Semanal {proy} - Sem {self.semana_numero} ({self.fecha_inicio} a {self.fecha_fin})"

    @property
    def total_personal(self):
        return self.resumen_personal.get('total', 0)

    @property
    def total_maquinaria(self):
        return self.resumen_maquinaria.get('total', 0)

    @property
    def total_dias_lluvia(self):
        return self.resumen_personal.get('dias_lluvia', 0)


class InformeMensual(models.Model):
    proyecto = models.ForeignKey(
        'operaciones.Proyecto', on_delete=models.PROTECT,
        related_name='informes_mensuales', verbose_name='Proyecto/Obra',
        null=True, blank=True,
    )
    mes = models.IntegerField(verbose_name='Mes (1-12)')
    anio = models.IntegerField(verbose_name='Año')
    fecha_inicio = models.DateField(verbose_name='Fecha inicio')
    fecha_fin = models.DateField(verbose_name='Fecha fin')
    resumen_ejecutivo = models.TextField(blank=True, verbose_name='Resumen ejecutivo')
    logros_principales = models.TextField(blank=True, verbose_name='Logros principales')
    dificultades = models.TextField(blank=True, verbose_name='Dificultades / Retrasos')
    observaciones = models.TextField(blank=True)
    estado_terreno = models.TextField(blank=True, verbose_name='Estado del terreno')

    curva_s_data = models.JSONField(blank=True, default=list, verbose_name='Datos Curva S')
    resumen_personal = models.JSONField(blank=True, default=dict)
    resumen_maquinaria = models.JSONField(blank=True, default=dict)

    elaborado_por = models.ForeignKey(
        'rrhh.Empleado', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='mensuales_elaborados',
    )
    revisado_por = models.ForeignKey(
        'rrhh.Empleado', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='mensuales_revisados',
    )
    profesional_1 = models.ForeignKey(
        'rrhh.Empleado', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='mensuales_profesional_1',
    )
    profesional_2 = models.ForeignKey(
        'rrhh.Empleado', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='mensuales_profesional_2',
    )

    status = models.CharField(max_length=20, default='borrador', choices=[
        ('borrador', 'Borrador'),
        ('enviado', 'Enviado'),
        ('aprobado', 'Aprobado'),
    ])

    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL,
    )
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-anio', '-mes']
        unique_together = [('proyecto', 'mes', 'anio')]
        verbose_name = 'Informe Mensual'
        verbose_name_plural = 'Informes Mensuales'

    def __str__(self):
        proy = self.proyecto.nombre if self.proyecto else 'Sin proyecto'
        meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
        mes_nombre = meses[self.mes - 1] if 1 <= self.mes <= 12 else str(self.mes)
        return f"Mensual {proy} - {mes_nombre} {self.anio}"

    @property
    def total_personal(self):
        return self.resumen_personal.get('total', 0)

    @property
    def total_maquinaria(self):
        return self.resumen_maquinaria.get('total', 0)
