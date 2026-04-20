from django.db import models
from django.contrib.auth.models import User
from empresa.models import Empresa

class TransformerDesign(models.Model):
    """Diseño de Transformadores - Sistema KAVE"""
    TIPO_CHOICES = [
        ('monofasico', 'Monofásico'),
        ('trifasico', 'Trifásico'),
        ('autotransformador', 'Autotransformador'),
    ]
    
    MATERIAL_CHOICES = [
        ('silicio', 'Acero al Silicio M-4/M-5 Gobernado'),
        ('amorfoso', 'Acero Amorfo'),
        ('nanocristalino', 'Nanocristalino'),
        ('ferrita', 'Ferrita'),
    ]
    
    REFRIGERACION_CHOICES = [
        ('seco', 'Seco'),
        ('aceite', 'En Aceite'),
    ]
    
    FORMA_NUCLEO_CHOICES = [
        ('ei', 'Acorazado (E-I) / Columnas'),
        ('toroidal', 'Toroidal'),
    ]
    
    MATERIAL_BOBINAS_CHOICES = [
        ('aluminio', 'Aluminio'),
        ('cobre', 'Cobre'),
    ]

    potencia_kva = models.FloatField(verbose_name="Potencia (kVA)")
    vp = models.FloatField(verbose_name="Voltaje Primario (V)")
    vs = models.FloatField(verbose_name="Voltaje Secundario (V)")
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, verbose_name="Tipo de Sistema")
    refrigeracion = models.CharField(max_length=20, choices=REFRIGERACION_CHOICES, default='seco', verbose_name="Tipo de Refrigeración")
    forma_nucleo = models.CharField(max_length=20, choices=FORMA_NUCLEO_CHOICES, default='ei', verbose_name="Forma del Núcleo")
    material = models.CharField(max_length=40, choices=MATERIAL_CHOICES, verbose_name="Material del Núcleo")
    material_bobinas = models.CharField(max_length=20, choices=MATERIAL_BOBINAS_CHOICES, default='aluminio', verbose_name="Material de Devanados")
    nucleo = models.CharField(max_length=50, blank=True, verbose_name="Referencia/Tipo de Núcleo (Opcional)")
    eficiencia = models.FloatField(default=98.0, verbose_name="Eficiencia Esperada (%)")
    costo = models.FloatField(null=True, blank=True, verbose_name="Costo Estimado ($)")
    
    # Campos adicionales para diseño completo
    frecuencia = models.FloatField(default=60, verbose_name="Frecuencia (Hz)")
    densidad_corriente = models.FloatField(default=2.5, verbose_name="Densidad de Corriente (A/mm²)")
    induccion_maxima = models.FloatField(default=1.5, verbose_name="Inducción Máxima (T)")
    
    # Geometría Núcleo Convencional (E-I / Columnas)
    altura_ventana = models.FloatField(null=True, blank=True, verbose_name="Altura de Ventana (mm)")
    ancho_ventana = models.FloatField(null=True, blank=True, verbose_name="Ancho de Ventana (mm)")
    ancho_pierna = models.FloatField(null=True, blank=True, verbose_name="Ancho de Pierna Central (mm)")
    profundidad_nucleo = models.FloatField(null=True, blank=True, verbose_name="Profundidad del Núcleo (mm)")
    factor_apilamiento = models.FloatField(default=0.96, verbose_name="Factor de Apilamiento (Ku)")

    # Geometría Núcleo Toroidal
    diametro_interno = models.FloatField(null=True, blank=True, verbose_name="Diámetro Interno Toroidal (mm)")
    diametro_externo = models.FloatField(null=True, blank=True, verbose_name="Diámetro Externo Toroidal (mm)")
    altura_toroide = models.FloatField(null=True, blank=True, verbose_name="Altura del Toroide (mm)")

    # Construcción / Aislamiento (Configuraciones de Bobinado)
    canal_entre_capas = models.FloatField(default=0.1, verbose_name="Canal/Aislamiento entre capas (mm)")
    margen_seguridad_extremos = models.FloatField(default=5.0, verbose_name="Margen de seguridad extremos (mm)")
    aislamiento_tubo = models.FloatField(default=2.0, verbose_name="Espesor del Tubo/Carrete (mm)")
    aislamiento_entre_devanados = models.FloatField(default=1.0, verbose_name="Aislamiento Prim/Sec (mm)")
    levante_bobinado = models.FloatField(default=15.0, verbose_name="Swell/Levante de Bobinado (%)")
    
    # Relaciones con otros modelos
    proyecto = models.ForeignKey('ProyectoKAVE', on_delete=models.CASCADE, null=True, blank=True, verbose_name="Proyecto Asociado")
    disenador = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Diseñador")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creado en")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Actualizado en")

    class Meta:
        verbose_name = "Diseño de Transformador"
        verbose_name_plural = "Diseños de Transformadores"
        ordering = ['-created_at']

    def __str__(self):
        return f"Transformador {self.get_tipo_display()} - {self.potencia_kva} kVA"

    @property
    def relacion_transformacion(self):
        """Calcular relación de transformación"""
        if float(self.vp) > 0 and float(self.vs) > 0:
            return round(float(self.vp) / float(self.vs), 4)
        return None

    @property
    def area_nucleo_real_cm2(self):
        """Calcula el área física transversal efectiva del núcleo en cm2"""
        if self.forma_nucleo == 'toroidal':
            if self.diametro_externo and self.diametro_interno and self.altura_toroide:
                ancho = (float(self.diametro_externo) - float(self.diametro_interno)) / 2.0
                area_mm2 = ancho * float(self.altura_toroide) * float(self.factor_apilamiento)
                return round(area_mm2 / 100.0, 2)
        else: # ei o columnas
            if self.ancho_pierna and self.profundidad_nucleo:
                area_mm2 = float(self.ancho_pierna) * float(self.profundidad_nucleo) * float(self.factor_apilamiento)
                return round(area_mm2 / 100.0, 2)
        return None

    @property
    def area_ventana_util_mm2(self):
        """Área disponible descontando márgenes y carretes básicos"""
        if self.forma_nucleo == 'toroidal':
            import math
            if self.diametro_interno:
                r_int = float(self.diametro_interno) / 2.0
                r_util = r_int - float(self.aislamiento_tubo)
                if r_util > 0: return round(math.pi * (r_util**2), 2)
        else:
            if self.altura_ventana and self.ancho_ventana:
                h_util = float(self.altura_ventana) - 2*(float(self.margen_seguridad_extremos))
                w_util = float(self.ancho_ventana) - float(self.aislamiento_tubo)
                return round(h_util * w_util, 2)
        return None

    @property
    def corriente_primaria(self):
        """Calcular corriente primaria"""
        if float(self.potencia_kva) > 0 and float(self.vp) > 0:
            coef = 1.732 if self.tipo == 'trifasico' else 1.0
            return round((float(self.potencia_kva) * 1000) / (float(self.vp) * coef), 2)
        return None

    @property
    def corriente_secundaria(self):
        """Calcular corriente secundaria"""
        if float(self.potencia_kva) > 0 and float(self.vs) > 0:
            coef = 1.732 if self.tipo == 'trifasico' else 1.0
            return round((float(self.potencia_kva) * 1000) / (float(self.vs) * coef), 2)
        return None

class CalculoTransformador(models.Model):
    """Cálculos detallados del transformador - Base de Ingeniería"""
    TIPO_CONDUCTOR_CHOICES = [
        ('awg', 'Hilo Redondo (AWG)'),
        ('platina', 'Platina (Rectangular)'),
    ]

    disenador = models.ForeignKey(TransformerDesign, on_delete=models.CASCADE, related_name='calculos')
    
    # Parámetros del cálculo eléctrico
    area_nucleo = models.FloatField(verbose_name="Área Eléctrica Teórica (cm²)")
    vueltas_primario = models.IntegerField(verbose_name="Vueltas Primario")
    vueltas_secundario = models.IntegerField(verbose_name="Vueltas Secundario")
    
    # Diseño Físico del Conductor Primario
    tipo_conductor_primario = models.CharField(max_length=20, choices=TIPO_CONDUCTOR_CHOICES, default='awg')
    calibre_awg_primario = models.CharField(max_length=10, blank=True, verbose_name="Calibre AWG Primario")
    alto_platina_primario = models.FloatField(null=True, blank=True, verbose_name="Alto Platina Primario (mm)")
    ancho_platina_primario = models.FloatField(null=True, blank=True, verbose_name="Ancho Platina Primario (mm)")
    area_conductor_primario = models.FloatField(verbose_name="Área Conductor Primario Efectiva (mm²)")
    
    # Diseño Físico del Conductor Secundario
    tipo_conductor_secundario = models.CharField(max_length=20, choices=TIPO_CONDUCTOR_CHOICES, default='awg')
    calibre_awg_secundario = models.CharField(max_length=10, blank=True, verbose_name="Calibre AWG Secundario")
    alto_platina_secundario = models.FloatField(null=True, blank=True, verbose_name="Alto Platina Secundario (mm)")
    ancho_platina_secundario = models.FloatField(null=True, blank=True, verbose_name="Ancho Platina Secundario (mm)")
    area_conductor_secundario = models.FloatField(verbose_name="Área Conductor Secundario Efectiva (mm²)")
    
    # Análisis de Construcción y Manufactura
    espesor_total_bobinado = models.FloatField(null=True, blank=True, verbose_name="Espesor Radial Construido (mm)")
    altura_efectiva_bobinado = models.FloatField(null=True, blank=True, verbose_name="Altura Bobinado Efectiva (mm)")
    factor_utilizacion_ventana = models.FloatField(null=True, blank=True, verbose_name="Ku (Factor Ventana)")
    viabilidad_construccion = models.BooleanField(default=False, verbose_name="¿Cabe en Ventana?")
    mensajes_viabilidad = models.TextField(blank=True, verbose_name="Diagnóstico de Ventana")

    # Estimaciones Físicas y Pérdidas
    peso_cobre_estimado = models.FloatField(null=True, blank=True, verbose_name="Peso Bobinas (kg)")
    peso_nucleo_estimado = models.FloatField(null=True, blank=True, verbose_name="Peso Núcleo (kg)")
    perdidas_nucleo = models.FloatField(verbose_name="Pérdidas en Núcleo (W) - P0")
    perdidas_cobre = models.FloatField(verbose_name="Pérdidas en Cobre (W) - Pcu")
    perdidas_totales = models.FloatField(verbose_name="Pérdidas Totales (W)")
    impedancia_z = models.FloatField(null=True, blank=True, verbose_name="Impedancia Esperada Z(%)")
    elevacion_temperatura_c = models.FloatField(null=True, blank=True, verbose_name="Elevación Térmica (ΔT °C)")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creado en")

    class Meta:
        verbose_name = "Cálculo de Transformador"
        verbose_name_plural = "Cálculos de Transformadores"
        ordering = ['-created_at']

    def __str__(self):
        return f"Cálculo - {self.disenador}"

class ProyectoKAVE(models.Model):
    """Proyectos del sistema KAVE"""
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('en_progreso', 'En Progreso'),
        ('completado', 'Completado'),
        ('cancelado', 'Cancelado'),
    ]
    
    PRIORIDAD_CHOICES = [
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
        ('urgente', 'Urgente'),
    ]

    nombre = models.CharField(max_length=200, verbose_name="Nombre del Proyecto")
    descripcion = models.TextField(blank=True, verbose_name="Descripción")
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, verbose_name="Empresa")
    cliente = models.CharField(max_length=200, verbose_name="Cliente")
    fecha_inicio = models.DateField(verbose_name="Fecha de Inicio")
    fecha_entrega = models.DateField(verbose_name="Fecha de Entrega Estimada")
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente', verbose_name="Estado")
    prioridad = models.CharField(max_length=10, choices=PRIORIDAD_CHOICES, default='media', verbose_name="Prioridad")
    presupuesto = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Presupuesto")
    responsable = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Responsable")
    creado_en = models.DateTimeField(auto_now_add=True, verbose_name="Creado en")
    actualizado_en = models.DateTimeField(auto_now=True, verbose_name="Actualizado en")

    class Meta:
        verbose_name = "Proyecto KAVE"
        verbose_name_plural = "Proyectos KAVE"
        ordering = ['-creado_en']

    def __str__(self):
        return f"{self.nombre} - {self.cliente}"

    @property
    def dias_restantes(self):
        from datetime import date
        if self.fecha_entrega:
            delta = self.fecha_entrega - date.today()
            return delta.days
        return None

class TareaKAVE(models.Model):
    """Tareas específicas de los proyectos KAVE"""
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('en_progreso', 'En Progreso'),
        ('completada', 'Completada'),
        ('bloqueada', 'Bloqueada'),
    ]

    proyecto = models.ForeignKey(ProyectoKAVE, on_delete=models.CASCADE, related_name='tareas', verbose_name="Proyecto")
    titulo = models.CharField(max_length=200, verbose_name="Título de la Tarea")
    descripcion = models.TextField(blank=True, verbose_name="Descripción")
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente', verbose_name="Estado")
    asignado_a = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Asignado a")
    fecha_vencimiento = models.DateField(null=True, blank=True, verbose_name="Fecha de Vencimiento")
    horas_estimadas = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name="Horas Estimadas")
    horas_reales = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name="Horas Reales")
    creado_en = models.DateTimeField(auto_now_add=True, verbose_name="Creado en")
    actualizado_en = models.DateTimeField(auto_now=True, verbose_name="Actualizado en")

    class Meta:
        verbose_name = "Tarea KAVE"
        verbose_name_plural = "Tareas KAVE"
        ordering = ['-creado_en']

    def __str__(self):
        return f"{self.titulo} - {self.proyecto.nombre}"

class DocumentoKAVE(models.Model):
    """Documentos asociados a proyectos KAVE"""
    TIPO_CHOICES = [
        ('contrato', 'Contrato'),
        ('cotizacion', 'Cotización'),
        ('factura', 'Factura'),
        ('informe', 'Informe'),
        ('plano', 'Plano'),
        ('especificacion', 'Especificación'),
        ('otro', 'Otro'),
    ]

    proyecto = models.ForeignKey(ProyectoKAVE, on_delete=models.CASCADE, related_name='documentos', verbose_name="Proyecto")
    titulo = models.CharField(max_length=200, verbose_name="Título del Documento")
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, verbose_name="Tipo de Documento")
    archivo = models.FileField(upload_to='kave/documentos/', verbose_name="Archivo")
    descripcion = models.TextField(blank=True, verbose_name="Descripción")
    subido_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Subido por")
    fecha_subida = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Subida")

    class Meta:
        verbose_name = "Documento KAVE"
        verbose_name_plural = "Documentos KAVE"
        ordering = ['-fecha_subida']

    def __str__(self):
        return f"{self.titulo} - {self.proyecto.nombre}"

class NotaKAVE(models.Model):
    """Notas y seguimiento de proyectos KAVE"""
    proyecto = models.ForeignKey(ProyectoKAVE, on_delete=models.CASCADE, related_name='notas', verbose_name="Proyecto")
    titulo = models.CharField(max_length=200, verbose_name="Título de la Nota")
    contenido = models.TextField(verbose_name="Contenido")
    autor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Autor")
    creado_en = models.DateTimeField(auto_now_add=True, verbose_name="Creado en")

    class Meta:
        verbose_name = "Nota KAVE"
        verbose_name_plural = "Notas KAVE"
        ordering = ['-creado_en']

    def __str__(self):
        return f"{self.titulo} - {self.proyecto.nombre}"
