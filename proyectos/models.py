from django.db import models
from django.contrib.auth.models import User
from django.db.models import Sum
import datetime
from crm.models import Cliente

class Proyecto(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, null=True, blank=True, related_name='proyectos_proyecto_set')
    gerente = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    presupuesto = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    estado = models.CharField(max_length=20, choices=[
        ('planificado', 'Planificado'),
        ('en_progreso', 'En Progreso'),
        ('completado', 'Completado'),
        ('cancelado', 'Cancelado')
    ], default='planificado')

    def __str__(self):
        return self.nombre

class ProyectoPS(models.Model):
    codigo_ps = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, null=True, blank=True, related_name='proyectos_ps_set')
    gerente = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    presupuesto = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    costo_comprometido = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    costo_real = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    estado = models.CharField(max_length=20, choices=[
        ('planificado', 'Planificado'),
        ('en_ejecucion', 'En Ejecución'),
        ('completado', 'Completado'),
        ('cerrado', 'Cerrado'),
        ('cancelado', 'Cancelado')
    ], default='planificado')

    def avance(self):
        hitos = self.hitos_ps.aggregate(total=Sum('progreso'))['total'] or 0
        count = self.hitos_ps.count() or 1
        return round(hitos / count, 2)

    def cpi(self):
        return None if self.costo_real == 0 else round(float(self.presupuesto) / float(self.costo_real), 2)

    def spi(self):
        today = datetime.date.today()
        planned_duration = (self.fecha_fin - self.fecha_inicio).days if self.fecha_fin and self.fecha_inicio else 1
        elapsed = (today - self.fecha_inicio).days if self.fecha_inicio else 0
        atp = (elapsed / planned_duration) if planned_duration > 0 else 0
        progression = self.avance() / 100
        return None if atp == 0 else round(progression / atp, 2)

    def __str__(self):
        return f"{self.codigo_ps} - {self.nombre}"

class WBSItem(models.Model):
    proyecto = models.ForeignKey(ProyectoPS, on_delete=models.CASCADE, related_name='wbs_items')
    codigo = models.CharField(max_length=50)
    nombre = models.CharField(max_length=200)
    padre = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='sub_items')
    cantidad = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    @property
    def valor_total(self):
        return self.cantidad * self.precio_unitario

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

class HitoPS(models.Model):
    proyecto = models.ForeignKey(ProyectoPS, on_delete=models.CASCADE, related_name='hitos_ps')
    nombre = models.CharField(max_length=200)
    fecha_programada = models.DateField()
    fecha_real = models.DateField(null=True, blank=True)
    progreso = models.IntegerField(default=0)

    def estado(self):
        if self.progreso >= 100:
            return 'completado'
        return 'en_progreso'

    def __str__(self):
        return f"Hito {self.nombre} ({self.proyecto.codigo_ps})"

class CostoPS(models.Model):
    proyecto = models.ForeignKey(ProyectoPS, on_delete=models.CASCADE, related_name='costos')
    descripcion = models.CharField(max_length=255)
    tipo = models.CharField(max_length=50, choices=[('mano_obra', 'Mano de Obra'), ('materiales', 'Materiales'), ('subcontrato', 'Subcontrato'), ('otro', 'Otro')])
    monto = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    fecha = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.tipo} - {self.monto}"

class Tarea(models.Model):
    proyecto = models.ForeignKey(Proyecto, related_name='tareas', on_delete=models.CASCADE)
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    asignado_a = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_fin = models.DateField(null=True, blank=True)
    progreso = models.IntegerField(default=0)  # 0-100
    estado = models.CharField(max_length=20, choices=[
        ('pendiente', 'Pendiente'),
        ('en_progreso', 'En Progreso'),
        ('completada', 'Completada')
    ], default='pendiente')

    def __str__(self):
        return f"{self.nombre} - {self.proyecto.nombre}"
