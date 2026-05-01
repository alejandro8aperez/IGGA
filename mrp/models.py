from django.db import models
from django.db.models import Sum, F
from django.utils import timezone
from datetime import datetime, timedelta
from inventarios.models import Producto

class CentroTrabajo(models.Model):
    """Centro de trabajo para MRP (creado localmente para evitar dependencias)"""
    nombre = models.CharField(max_length=100)
    codigo = models.CharField(max_length=20, unique=True)
    descripcion = models.TextField(blank=True)
    capacidad_horas_dia = models.DecimalField(max_digits=5, decimal_places=2, default=8.0)
    eficiencia = models.DecimalField(max_digits=5, decimal_places=2, default=100.0)
    activo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Centro de Trabajo"
        verbose_name_plural = "Centros de Trabajo"
        ordering = ['codigo']
    
    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

class PlanMaestroProduccion(models.Model):
    """Master Production Schedule (MPS) - Plan maestro de producción"""
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    cantidad_planificada = models.IntegerField()
    cantidad_real = models.IntegerField(default=0)
    estado = models.CharField(max_length=20, choices=[
        ('planificado', 'Planificado'),
        ('en_progreso', 'En Progreso'),
        ('completado', 'Completado'),
        ('cancelado', 'Cancelado')
    ], default='planificado')
    prioridad = models.IntegerField(default=5)  # 1=alta, 5=baja
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Plan Maestro de Producción"
        verbose_name_plural = "Planes Maestros de Producción"
        ordering = ['-fecha_inicio', '-prioridad']
    
    def __str__(self):
        return f"MPS-{self.id}: {self.producto.nombre} ({self.cantidad_planificada} uds)"
    
    @property
    def progreso(self):
        if self.cantidad_planificada == 0:
            return 0
        return min((self.cantidad_real / self.cantidad_planificada) * 100, 100)

class ListaMateriales(models.Model):
    """Bill of Materials (BOM) - Lista de materiales"""
    producto_padre = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='boms_padre')
    producto_hijo = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='boms_hijo')
    cantidad_requerida = models.DecimalField(max_digits=10, decimal_places=2)
    unidad_medida = models.CharField(max_length=20, default='UN')
    nivel = models.IntegerField(default=1)  # Nivel en el árbol BOM
    porcentaje_desperdicio = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tiempo_espera = models.IntegerField(default=0)  # días
    efectiva_desde = models.DateField(default=timezone.now)
    efectiva_hasta = models.DateField(null=True, blank=True)
    tipo_componente = models.CharField(max_length=20, choices=[
        ('material', 'Material'),
        ('subensamble', 'Subensamble'),
        ('servicio', 'Servicio')
    ], default='material')
    
    class Meta:
        verbose_name = "Lista de Materiales"
        verbose_name_plural = "Listas de Materiales"
        unique_together = ['producto_padre', 'producto_hijo', 'efectiva_desde']
        ordering = ['producto_padre', 'nivel']
    
    def __str__(self):
        return f"BOM: {self.producto_padre.nombre} → {self.producto_hijo.nombre} ({self.cantidad_requerida})"

class RutaManufactura(models.Model):
    """Ruta de manufactura - Secuencia de operaciones"""
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='rutas')
    secuencia = models.IntegerField()
    centro_trabajo = models.ForeignKey(CentroTrabajo, on_delete=models.CASCADE)
    descripcion_operacion = models.CharField(max_length=200)
    tiempo_preparacion = models.DecimalField(max_digits=8, decimal_places=2)  # minutos
    tiempo_operacion = models.DecimalField(max_digits=8, decimal_places=2)  # minutos por unidad
    eficiencia = models.DecimalField(max_digits=5, decimal_places=2, default=100)  # %
    setup_fijo = models.BooleanField(default=False)
    overlapping = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Ruta de Manufactura"
        verbose_name_plural = "Rutas de Manufactura"
        unique_together = ['producto', 'secuencia']
        ordering = ['producto', 'secuencia']
    
    def __str__(self):
        return f"Ruta {self.producto.nombre}: Op{self.secuencia} - {self.descripcion_operacion}"
    
    @property
    def tiempo_total_minutos(self):
        """Tiempo total en minutos para una unidad"""
        return float(self.tiempo_preparacion) + float(self.tiempo_operacion)

class RequerimientoMaterial(models.Model):
    """Material Requirements - Resultados del MRP"""
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    fecha_requerimiento = models.DateField()
    tipo_requerimiento = models.CharField(max_length=20, choices=[
        ('bruto', 'Requerimiento Bruto'),
        ('neto', 'Requerimiento Neto'),
        ('orden_compra', 'Orden Compra'),
        ('orden_produccion', 'Orden Producción')
    ], default='neto')
    cantidad_requerida = models.DecimalField(max_digits=12, decimal_places=2)
    cantidad_ordenada = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cantidad_pendiente = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    estado = models.CharField(max_length=20, choices=[
        ('pendiente', 'Pendiente'),
        ('ordenado', 'Ordenado'),
        ('recibido', 'Recibido'),
        ('cancelado', 'Cancelado')
    ], default='pendiente')
    origen = models.CharField(max_length=100)  # MPS, BOM, etc.
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Requerimiento de Material"
        verbose_name_plural = "Requerimientos de Materiales"
        ordering = ['fecha_requerimiento', 'producto']
    
    def __str__(self):
        return f"Req: {self.producto.nombre} - {self.cantidad_requerida} ({self.fecha_requerimiento})"
    
    @property
    def cantidad_por_ordenar(self):
        return max(float(self.cantidad_requerida) - float(self.cantidad_ordenada), 0)

class PlanCapacidad(models.Model):
    """Capacity Requirements Planning - Plan de capacidad"""
    centro_trabajo = models.ForeignKey(CentroTrabajo, on_delete=models.CASCADE)
    fecha = models.DateField()
    capacidad_disponible = models.DecimalField(max_digits=8, decimal_places=2)  # horas
    carga_requerida = models.DecimalField(max_digits=8, decimal_places=2)  # horas
    carga_porcentaje = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    estado = models.CharField(max_length=20, choices=[
        ('subutilizado', 'Subutilizado'),
        ('optimo', 'Óptimo'),
        ('sobrecargado', 'Sobrecargado')
    ], default='optimo')
    
    class Meta:
        verbose_name = "Plan de Capacidad"
        verbose_name_plural = "Planes de Capacidad"
        unique_together = ['centro_trabajo', 'fecha']
        ordering = ['fecha', 'centro_trabajo']
    
    def __str__(self):
        return f"Capacidad {self.centro_trabajo.nombre} - {self.fecha}: {self.carga_porcentaje}%"
    
    def calcular_estado(self):
        if self.capacidad_disponible == 0:
            self.carga_porcentaje = 0
            self.estado = 'subutilizado'
        else:
            self.carga_porcentaje = (self.carga_requerida / self.capacidad_disponible) * 100
            
            if self.carga_porcentaje < 70:
                self.estado = 'subutilizado'
            elif self.carga_porcentaje > 100:
                self.estado = 'sobrecargado'
            else:
                self.estado = 'optimo'
        
        self.save()

class EjecucionMRP(models.Model):
    """Ejecución y resultados del proceso MRP"""
    fecha_ejecucion = models.DateTimeField(auto_now_add=True)
    fecha_plan_desde = models.DateField()
    fecha_plan_hasta = models.DateField()
    estado = models.CharField(max_length=20, choices=[
        ('en_progreso', 'En Progreso'),
        ('completado', 'Completado'),
        ('error', 'Error')
    ], default='en_progreso')
    mensaje = models.TextField(blank=True)
    parametros = models.JSONField(default=dict)
    resumen = models.JSONField(default=dict)
    
    class Meta:
        verbose_name = "Ejecución MRP"
        verbose_name_plural = "Ejecuciones MRP"
        ordering = ['-fecha_ejecucion']
    
    def __str__(self):
        return f"MRP {self.fecha_ejecucion.strftime('%Y-%m-%d %H:%M')} - {self.estado}"

# Create your models here.
