from datetime import date
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Sum
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver


class Cuenta(models.Model):
    TIPO_ACTIVO = 'activo'
    TIPO_PASIVO = 'pasivo'
    TIPO_PATRIMONIO = 'patrimonio'
    TIPO_INGRESO = 'ingreso'
    TIPO_GASTO = 'gasto'
    TIPO_CHOICES = [
        (TIPO_ACTIVO, 'Activo'),
        (TIPO_PASIVO, 'Pasivo'),
        (TIPO_PATRIMONIO, 'Patrimonio'),
        (TIPO_INGRESO, 'Ingreso'),
        (TIPO_GASTO, 'Gasto'),
    ]

    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=200)
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES)
    nivel = models.IntegerField(default=1)
    padre = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='hijos')

    class Meta:
        ordering = ['codigo']
        verbose_name_plural = 'Cuentas'

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

    @property
    def naturaleza(self):
        return 'deudora' if self.tipo in {self.TIPO_ACTIVO, self.TIPO_GASTO} else 'acreedora'

    def save(self, *args, **kwargs):
        if self.padre:
            self.nivel = self.padre.nivel + 1
        elif not self.nivel:
            self.nivel = 1
        super().save(*args, **kwargs)

    def get_saldo(self, desde=None, hasta=None):
        movimientos = self.movimientos.all()
        if desde:
            movimientos = movimientos.filter(asiento__fecha__gte=desde)
        if hasta:
            movimientos = movimientos.filter(asiento__fecha__lte=hasta)

        totals = movimientos.aggregate(total_debe=Sum('debe'), total_haber=Sum('haber'))
        total_debe = totals['total_debe'] or Decimal('0.00')
        total_haber = totals['total_haber'] or Decimal('0.00')

        if self.naturaleza == 'deudora':
            return total_debe - total_haber
        return total_haber - total_debe

    @property
    def saldo(self):
        return self.get_saldo()


class AsientoContable(models.Model):
    fecha = models.DateField()
    descripcion = models.CharField(max_length=500)
    referencia = models.CharField(max_length=100, blank=True)
    total_debe = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_haber = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        ordering = ['-fecha', 'id']
        verbose_name = 'Asiento Contable'
        verbose_name_plural = 'Asientos Contables'

    def __str__(self):
        return f"Asiento {self.id} - {self.fecha}"

    def clean(self):
        if self.total_debe != self.total_haber:
            raise ValidationError('El asiento contable debe estar balanceado: total_debe debe ser igual a total_haber.')

        periodo_qs = PeriodoContable.objects.filter(
            estado=PeriodoContable.ESTADO_CERRADO,
            fecha_inicio__lte=self.fecha,
            fecha_fin__gte=self.fecha,
        )
        if self.pk:
            periodo_qs = periodo_qs.exclude(asiento_cierre=self)

        if periodo_qs.exists():
            raise ValidationError('No se pueden crear ni actualizar asientos en un período contable cerrado.')

    def recalcular_totales(self):
        totals = self.movimientos.aggregate(total_debe=Sum('debe'), total_haber=Sum('haber'))
        self.total_debe = totals['total_debe'] or Decimal('0.00')
        self.total_haber = totals['total_haber'] or Decimal('0.00')

    def save(self, *args, skip_validation=False, **kwargs):
        if self.pk:
            self.recalcular_totales()
        if not skip_validation:
            self.full_clean()
        super().save(*args, **kwargs)

    @property
    def esta_balanceado(self):
        return self.total_debe == self.total_haber


class MovimientoContable(models.Model):
    asiento = models.ForeignKey(AsientoContable, related_name='movimientos', on_delete=models.CASCADE)
    cuenta = models.ForeignKey(Cuenta, on_delete=models.CASCADE, related_name='movimientos')
    debe = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    haber = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    descripcion = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ['asiento', 'id']

    def __str__(self):
        return f"{self.cuenta.nombre} - Debe: {self.debe}, Haber: {self.haber}"

    def clean(self):
        if self.debe < 0 or self.haber < 0:
            raise ValidationError('Los valores de debe y haber deben ser positivos.')
        if self.debe and self.haber:
            raise ValidationError('Un movimiento contable no puede tener valores en debe y haber al mismo tiempo.')
        if not self.debe and not self.haber:
            raise ValidationError('Un movimiento contable debe tener valor en debe o en haber.')

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)


class PeriodoContable(models.Model):
    ESTADO_ABIERTO = 'abierto'
    ESTADO_CERRADO = 'cerrado'
    ESTADO_CHOICES = [
        (ESTADO_ABIERTO, 'Abierto'),
        (ESTADO_CERRADO, 'Cerrado'),
    ]

    nombre = models.CharField(max_length=120)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default=ESTADO_ABIERTO)
    descripcion = models.TextField(blank=True)
    fecha_cierre = models.DateField(null=True, blank=True)
    asiento_cierre = models.OneToOneField(
        AsientoContable,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='periodo_cierre'
    )
    resultado = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))

    class Meta:
        ordering = ['-fecha_inicio']
        verbose_name = 'Periodo Contable'
        verbose_name_plural = 'Periodos Contables'

    def __str__(self):
        return f"{self.nombre} ({self.fecha_inicio} - {self.fecha_fin})"

    def clean(self):
        if self.fecha_inicio > self.fecha_fin:
            raise ValidationError('La fecha de inicio no puede ser mayor que la fecha de fin.')

        traslape = PeriodoContable.objects.exclude(pk=self.pk).filter(
            fecha_inicio__lte=self.fecha_fin,
            fecha_fin__gte=self.fecha_inicio,
        )

        if traslape.exists():
            raise ValidationError('No pueden existir períodos contables que se solapen.')

    def contiene_fecha(self, fecha):
        return self.fecha_inicio <= fecha <= self.fecha_fin

    def cerrar(self):
        if self.estado == self.ESTADO_CERRADO:
            raise ValidationError('El período contable ya está cerrado.')

        from .services import crear_asiento_con_movimientos

        self.full_clean()
        self.save()

        cuentas_ingreso = Cuenta.objects.filter(tipo=Cuenta.TIPO_INGRESO)
        cuentas_gasto = Cuenta.objects.filter(tipo=Cuenta.TIPO_GASTO)

        movimientos = []
        total_ingresos = Decimal('0.00')
        total_gastos = Decimal('0.00')

        for cuenta in cuentas_ingreso:
            saldo = cuenta.get_saldo(desde=self.fecha_inicio, hasta=self.fecha_fin)
            if saldo and saldo != Decimal('0.00'):
                movimientos.append({
                    'cuenta': cuenta,
                    'debe': saldo,
                    'haber': Decimal('0.00'),
                    'descripcion': f'Cierre cuenta ingreso {cuenta.codigo}',
                })
                total_ingresos += saldo

        for cuenta in cuentas_gasto:
            saldo = cuenta.get_saldo(desde=self.fecha_inicio, hasta=self.fecha_fin)
            if saldo and saldo != Decimal('0.00'):
                movimientos.append({
                    'cuenta': cuenta,
                    'debe': Decimal('0.00'),
                    'haber': saldo,
                    'descripcion': f'Cierre cuenta gasto {cuenta.codigo}',
                })
                total_gastos += saldo

        resultado_neto = total_ingresos - total_gastos
        cuenta_patrimonio, _ = Cuenta.objects.get_or_create(
            codigo='310101',
            defaults={'nombre': 'Resultado del ejercicio', 'tipo': Cuenta.TIPO_PATRIMONIO, 'nivel': 2}
        )

        if resultado_neto > Decimal('0.00'):
            movimientos.append({
                'cuenta': cuenta_patrimonio,
                'debe': Decimal('0.00'),
                'haber': resultado_neto,
                'descripcion': 'Resultado neto del período contable',
            })
        elif resultado_neto < Decimal('0.00'):
            movimientos.append({
                'cuenta': cuenta_patrimonio,
                'debe': -resultado_neto,
                'haber': Decimal('0.00'),
                'descripcion': 'Resultado neto del período contable',
            })

        if movimientos:
            total_debe = sum(m['debe'] for m in movimientos)
            total_haber = sum(m['haber'] for m in movimientos)

            asiento = crear_asiento_con_movimientos(
                fecha=self.fecha_fin,
                descripcion=f"Cierre contable {self.nombre}",
                referencia=f"CierrePeriodo:{self.id}",
                movimientos=movimientos,
            )
            self.asiento_cierre = asiento
        else:
            self.asiento_cierre = None

        self.estado = self.ESTADO_CERRADO
        self.fecha_cierre = date.today()
        self.resultado = resultado_neto
        self.save(update_fields=['estado', 'fecha_cierre', 'resultado', 'asiento_cierre'])
        return self


@receiver(post_save, sender=MovimientoContable)
def actualizar_totales_asiento(sender, instance, **kwargs):
    asiento = instance.asiento
    asiento.recalcular_totales()
    asiento.save(update_fields=['total_debe', 'total_haber'], skip_validation=True)


@receiver(post_delete, sender=MovimientoContable)
def actualizar_totales_asiento_delete(sender, instance, **kwargs):
    asiento = instance.asiento
    asiento.recalcular_totales()
    asiento.save(update_fields=['total_debe', 'total_haber'], skip_validation=True)
