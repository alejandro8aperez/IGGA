from django.db import models
from inventarios.models import Producto
from django.contrib.auth.models import User

# ---- EXISTENTES ----
class NormaCalidad(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    parametro = models.CharField(max_length=100)  # e.g., 'peso', 'dimension', 'pureza'
    valor_minimo = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    valor_maximo = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    unidad = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.nombre} - {self.producto.nombre}"

class Inspeccion(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    lote = models.CharField(max_length=50, blank=True)
    fecha_inspeccion = models.DateTimeField(auto_now_add=True)
    inspector = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    resultado = models.CharField(max_length=20, choices=[
        ('aprobado', 'Aprobado'),
        ('rechazado', 'Rechazado'),
        ('pendiente', 'Pendiente')
    ], default='pendiente')
    observaciones = models.TextField(blank=True)

    def __str__(self):
        return f"Inspección {self.producto.nombre} - {self.fecha_inspeccion.date()}"

class Defecto(models.Model):
    inspeccion = models.ForeignKey(Inspeccion, related_name='defectos', on_delete=models.CASCADE)
    descripcion = models.CharField(max_length=200)
    severidad = models.CharField(max_length=20, choices=[
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
        ('critica', 'Crítica')
    ], default='baja')
    cantidad_afectada = models.IntegerField(default=1)

    def __str__(self):
        return f"Defecto: {self.descripcion} ({self.severidad})"

# ---- NUEVOS PILARES ISO 9001 ----

class DocumentoISO(models.Model):
    CATEGORIA_CHOICES = [
        ('1_base', '1. Base del sistema (Manual/Política)'),
        ('2_procedimiento', '2. Procedimientos obligatorios'),
        ('3_instructivo', '3. Instructivos de fabricación'),
        ('4_registro', '4. Formatos y registros (Evidencia)'),
    ]
    codigo = models.CharField(max_length=50, unique=True, verbose_name="Código Doc")
    titulo = models.CharField(max_length=200)
    categoria = models.CharField(max_length=20, choices=CATEGORIA_CHOICES)
    version = models.CharField(max_length=10, default="1.0")
    estado = models.CharField(max_length=20, choices=[('borrador','Borrador'),('vigente','Vigente'),('obsoleto','Obsoleto')], default='vigente')
    fecha_aprobacion = models.DateField(auto_now_add=True)
    autor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"[{self.codigo}] {self.titulo} v{self.version}"

class NoConformidad(models.Model):
    ORIGEN_CHOICES = [
        ('auditoria', 'Auditoría Interna/Externa'),
        ('inspeccion', 'Inspección de Producto'),
        ('cliente', 'Queja de Cliente'),
        ('proveedor', 'Falla de Proveedor')
    ]
    fecha_reporte = models.DateField(auto_now_add=True)
    descripcion = models.TextField(verbose_name="Descripción de la No Conformidad")
    origen = models.CharField(max_length=20, choices=ORIGEN_CHOICES)
    inspeccion_relacionada = models.ForeignKey(Inspeccion, on_delete=models.SET_NULL, null=True, blank=True)
    reportado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='nc_reportadas')
    estado = models.CharField(max_length=20, choices=[('abierta','Abierta'),('investigacion','En Investigación'),('cerrada','Cerrada')], default='abierta')

    def __str__(self): return f"NC-{self.id} ({self.get_origen_display()})"

class AccionCorrectiva(models.Model): # CAPA
    no_conformidad = models.OneToOneField(NoConformidad, on_delete=models.CASCADE, related_name='capa')
    analisis_causa_raiz = models.TextField(blank=True, help_text="5 Porqués o Ishikawa")
    plan_accion = models.TextField(verbose_name="Plan de Acción")
    responsable = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    fecha_limite = models.DateField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=[('por_iniciar','Por Iniciar'),('en_curso','En Curso'),('verificada','Verificada/Cerrada')], default='por_iniciar')

class Auditoria(models.Model):
    TIPO_CHOICES = [('interna','Interna'), ('externa','Externa/Certificación')]
    fecha_programada = models.DateField()
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='interna')
    alcance = models.CharField(max_length=200, help_text="Procesos a auditar")
    auditor_lider = models.CharField(max_length=100)
    estado = models.CharField(max_length=20, choices=[('planeada','Planeada'),('ejecucion','En Ejecución'),('concluida','Concluida')], default='planeada')
    hallazgos_totales = models.IntegerField(default=0)

class EvaluacionProveedor(models.Model):
    proveedor_nombre = models.CharField(max_length=200)
    fecha_evaluacion = models.DateField(auto_now_add=True)
    calificacion_calidad = models.IntegerField(default=100, help_text="Puntaje Base 100")
    calificacion_tiempos = models.IntegerField(default=100, help_text="Puntaje Base 100")
    aprobado = models.BooleanField(default=True)
    observaciones = models.TextField(blank=True)

# ---- NUEVOS MODELOS ISO 9001 INTEGRADOS ----

class FormatoISO9001(models.Model):
    """Formato oficial de certificación ISO 9001"""
    TIPO_FORMATO = [
        ('manual_calidad', 'Manual de Calidad'),
        ('procedimiento', 'Procedimiento Operativo'),
        ('instructivo', 'Instructivo de Trabajo'),
        ('formato_registro', 'Formato/Registro'),
        ('checklist', 'Checklist de Verificación'),
        ('informe_auditoria', 'Informe de Auditoría'),
        ('accion_correctiva', 'Acción Correctiva'),
        ('evaluacion_proveedor', 'Evaluación Proveedor'),
        ('control_proceso', 'Control de Proceso'),
        ('especificacion_tecnica', 'Especificación Técnica'),
    ]
    
    MODULO_ERP = [
        ('calidad', 'Módulo Calidad'),
        ('produccion', 'Módulo Producción'),
        ('compras', 'Módulo Compras'),
        ('ventas', 'Módulo Ventas'),
        ('mrp', 'MRP/SAP'),
        ('kave', 'Diseño Transformadores'),
        ('inventarios', 'Inventarios'),
        ('mantenimiento', 'Mantenimiento'),
        ('rrhh', 'Recursos Humanos'),
        ('finanzas', 'Finanzas'),
        ('contabilidad', 'Contabilidad'),
        ('multi_empresa', 'Multi-Empresa'),
    ]
    
    codigo = models.CharField(max_length=50, unique=True, verbose_name="Código Formato")
    titulo = models.CharField(max_length=200, verbose_name="Título del Formato")
    tipo = models.CharField(max_length=30, choices=TIPO_FORMATO, verbose_name="Tipo de Formato")
    version = models.CharField(max_length=10, default="1.0", verbose_name="Versión")
    
    # Fechas de control
    fecha_creacion = models.DateField(auto_now_add=True, verbose_name="Fecha Creación")
    fecha_aprobacion = models.DateField(null=True, blank=True, verbose_name="Fecha Aprobación")
    fecha_revision = models.DateField(null=True, blank=True, verbose_name="Fecha Próxima Revisión")
    
    # Responsables
    creado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='formatos_creados')
    aprobado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='formatos_aprobados')
    
    # Integración con ERP
    modulo_relacionado = models.CharField(max_length=50, choices=MODULO_ERP, verbose_name="Módulo ERP")
    proceso_afectado = models.CharField(max_length=200, verbose_name="Proceso Afectado")
    
    # Control de cambios
    motivo_cambio = models.TextField(blank=True, verbose_name="Motivo del Cambio")
    descripcion = models.TextField(verbose_name="Descripción del Formato")
    
    # Estado y aprobación
    estado = models.CharField(max_length=20, choices=[
        ('borrador', 'Borrador'),
        ('revision', 'En Revisión'),
        ('aprobacion', 'En Aprobación'),
        ('vigente', 'Vigente'),
        ('obsoleto', 'Obsoleto'),
    ], default='borrador', verbose_name="Estado")
    
    # Archivos
    archivo_pdf = models.FileField(upload_to='iso9001/formatos/', null=True, blank=True, verbose_name="Archivo PDF")
    archivo_word = models.FileField(upload_to='iso9001/editables/', null=True, blank=True, verbose_name="Archivo Editable")
    archivo_plantilla = models.FileField(upload_to='iso9001/plantillas/', null=True, blank=True, verbose_name="Plantilla")
    
    # Metadata
    frecuencia_actualizacion = models.IntegerField(default=12, help_text="Meses para próxima revisión", verbose_name="Frecuencia Actualización")
    obligatorio = models.BooleanField(default=True, verbose_name="Formato Obligatorio")
    requiere_aprobacion = models.BooleanField(default=True, verbose_name="Requiere Aprobación")
    
    # Auditoría
    ultima_auditoria = models.DateField(null=True, blank=True, verbose_name="Última Auditoría")
    conformidades = models.IntegerField(default=0, verbose_name="Conformidades")
    no_conformidades = models.IntegerField(default=0, verbose_name="No Conformidades")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creado en")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Actualizado en")

    class Meta:
        verbose_name = "Formato ISO 9001"
        verbose_name_plural = "Formatos ISO 9001"
        ordering = ['modulo_relacionado', 'codigo']
        indexes = [
            models.Index(fields=['modulo_relacionado', 'estado']),
            models.Index(fields=['codigo', 'version']),
            models.Index(fields=['tipo', 'estado']),
        ]

    def __str__(self):
        return f"[{self.codigo}] {self.titulo} v{self.version} ({self.get_modulo_relacionado_display()})"

    @property
    def dias_para_revision(self):
        """Días restantes para próxima revisión"""
        from datetime import date
        if self.fecha_revision:
            delta = self.fecha_revision - date.today()
            return delta.days
        return None

    @property
    def requiere_actualizacion(self):
        """Verifica si requiere actualización"""
        dias = self.dias_para_revision
        return dias is not None and dias <= 30

class ProcesoISO(models.Model):
    """Procesos del ERP certificados ISO 9001"""
    nombre_proceso = models.CharField(max_length=200, verbose_name="Nombre del Proceso")
    modulo_erp = models.CharField(max_length=50, choices=FormatoISO9001.MODULO_ERP, verbose_name="Módulo ERP")
    descripcion = models.TextField(verbose_name="Descripción del Proceso")
    
    # Formatos asociados
    formatos_iso = models.ManyToManyField(FormatoISO9001, related_name='procesos_asociados', blank=True)
    
    # Indicadores del proceso
    indicadores = models.JSONField(default=dict, verbose_name="Indicadores KPI")
    frecuencia_auditoria = models.IntegerField(default=12, verbose_name="Frecuencia Auditoría (meses)")
    
    # Estado del proceso
    estado = models.CharField(max_length=20, choices=[
        ('activo', 'Activo'),
        ('mejora', 'En Mejora'),
        ('suspendido', 'Suspendido'),
    ], default='activo', verbose_name="Estado del Proceso")
    
    # Responsables
    responsable_proceso = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Responsable del Proceso")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creado en")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Actualizado en")

    class Meta:
        verbose_name = "Proceso ISO"
        verbose_name_plural = "Procesos ISO"
        ordering = ['modulo_erp', 'nombre_proceso']

    def __str__(self):
        return f"{self.nombre_proceso} ({self.get_modulo_erp_display()})"

class TrazabilidadISO(models.Model):
    """Trazabilidad de documentos ISO en el ERP"""
    formato = models.ForeignKey(FormatoISO9001, on_delete=models.CASCADE, verbose_name="Formato ISO")
    modulo_erp = models.CharField(max_length=50, verbose_name="Módulo ERP")
    registro_id = models.IntegerField(verbose_name="ID del Registro")
    accion = models.CharField(max_length=50, choices=[
        ('creacion', 'Creación'),
        ('modificacion', 'Modificación'),
        ('aprobacion', 'Aprobación'),
        ('consulta', 'Consulta'),
        ('auditoria', 'Auditoría'),
    ], verbose_name="Acción Realizada")
    
    fecha_uso = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Uso")
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Usuario")
    
    # Detalles adicionales
    detalles = models.JSONField(default=dict, blank=True, verbose_name="Detalles Adicionales")
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="Dirección IP")

    class Meta:
        verbose_name = "Trazabilidad ISO"
        verbose_name_plural = "Trazabilidad ISO"
        ordering = ['-fecha_uso']
        indexes = [
            models.Index(fields=['formato', '-fecha_uso']),
            models.Index(fields=['modulo_erp', '-fecha_uso']),
            models.Index(fields=['usuario', '-fecha_uso']),
        ]

    def __str__(self):
        return f"{self.formato.codigo} - {self.get_accion_display()} ({self.fecha_uso.date()})"
