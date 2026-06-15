from django.contrib import admin
from django.utils.html import mark_safe
from .models import (
    EPS, AFP, ARL, CajaCompensacion, Departamento, Cargo, CentroCosto,
    Empleado, ContactoEmergencia, Familiar, FormacionAcademica, Idioma,
    Certificacion, ExperienciaLaboral, Vacaciones, Incapacidad, Dotacion,
    ExamenMedico, EPP, Disciplinario, EvaluacionDesempeno, HistorialCargo,
    DocumentoEmpleado, ConceptoNomina, PeriodoNomina, Nomina, DetalleNomina
)

# Registramos los catálogos
@admin.register(EPS)
class EPSAdmin(admin.ModelAdmin): list_display = ('nombre', 'codigo_habilitacion', 'activa')

@admin.register(AFP)
class AFPAdmin(admin.ModelAdmin): list_display = ('nombre', 'activa')

@admin.register(ARL)
class ARLAdmin(admin.ModelAdmin): list_display = ('nombre', 'activa')

@admin.register(CajaCompensacion)
class CajaCompensacionAdmin(admin.ModelAdmin): list_display = ('nombre', 'activa')

@admin.register(Departamento)
class DepartamentoAdmin(admin.ModelAdmin): list_display = ('nombre',)

@admin.register(Cargo)
class CargoAdmin(admin.ModelAdmin): list_display = ('nombre', 'departamento')

@admin.register(CentroCosto)
class CentroCostoAdmin(admin.ModelAdmin): list_display = ('codigo', 'nombre', 'activo')

# Registro del Empleado
@admin.register(Empleado)
class EmpleadoAdmin(admin.ModelAdmin):
    list_display = ('numero_documento', 'primer_nombre', 'primer_apellido', 'cargo', 'estado')
    search_fields = ('numero_documento', 'primer_nombre', 'primer_apellido')
    list_filter = ('estado', 'tipo_contrato', 'genero')
    readonly_fields = ('foto_preview', 'firma_preview')
    fieldsets = [
        (None, {
            'fields': [
                'tipo_documento', 'numero_documento', 'fecha_expedicion_doc', 'lugar_expedicion_doc',
            ]
        }),
        ('Datos personales', {
            'fields': [
                'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido',
                'fecha_nacimiento', 'lugar_nacimiento', 'genero', 'estado_civil',
                'nacionalidad', 'grupo_sanguineo', 'estrato', 'tipo_vivienda',
                'foto', 'foto_preview', 'firma', 'firma_preview',
            ]
        }),
        ('Licencia de conducción', {
            'fields': ['tiene_licencia', 'categoria_licencia', 'vencimiento_licencia']
        }),
        ('Tallas (dotación)', {
            'fields': ['talla_camisa', 'talla_pantalon', 'talla_zapatos', 'talla_casco']
        }),
        ('Contacto', {
            'fields': ['correo_personal', 'correo_corporativo', 'telefono_trabajo', 'telefono_personal', 'telefono_movil']
        }),
        ('Dirección', {
            'fields': ['direccion', 'barrio', 'ciudad', 'departamento_residencia', 'codigo_postal', 'pais']
        }),
        ('Datos laborales', {
            'fields': [
                'cargo', 'departamento', 'centro_costo', 'jefe_directo', 'sede',
                'fecha_ingreso', 'fecha_fin_periodo_prueba', 'fecha_retiro', 'motivo_retiro',
                'tipo_contrato', 'fecha_vencimiento_contrato',
                'tipo_salario', 'salario_basico', 'auxilio_transporte', 'periodicidad_pago',
                'horas_extras_autorizadas', 'estado', 'notas',
            ]
        }),
        ('Seguridad social', {
            'fields': ['eps', 'afp', 'arl', 'caja_compensacion', 'nivel_riesgo_arl']
        }),
        ('Información bancaria', {
            'fields': ['banco', 'tipo_cuenta', 'numero_cuenta']
        }),
    ]

    def foto_preview(self, obj):
        if obj.foto:
            return mark_safe(f'<img src="{obj.foto.url}" width="100" />')
        return "Sin foto"
    foto_preview.short_description = 'Vista previa foto'

    def firma_preview(self, obj):
        if obj.firma:
            return mark_safe(f'<img src="{obj.firma.url}" height="50" />')
        return "Sin firma"
    firma_preview.short_description = 'Vista previa firma'

# Registramos el resto de componentes satélites usando configuraciones básicas
admin.site.register(ContactoEmergencia)
admin.site.register(Familiar)
admin.site.register(FormacionAcademica)
admin.site.register(Idioma)
admin.site.register(Certificacion)
admin.site.register(ExperienciaLaboral)
admin.site.register(Vacaciones)
admin.site.register(Incapacidad)
admin.site.register(Dotacion)
admin.site.register(ExamenMedico)
admin.site.register(EPP)
admin.site.register(Disciplinario)
admin.site.register(EvaluacionDesempeno)
admin.site.register(HistorialCargo)
admin.site.register(DocumentoEmpleado)

# Nómina Electrónica
@admin.register(ConceptoNomina)
class ConceptoNominaAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'nombre', 'tipo', 'activo')
    list_filter = ('tipo', 'activo')

@admin.register(PeriodoNomina)
class PeriodoNominaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'tipo', 'fecha_inicio', 'fecha_fin', 'cerrado')
    list_filter = ('tipo', 'cerrado')

@admin.register(Nomina)
class NominaAdmin(admin.ModelAdmin):
    list_display = ('periodo', 'empleado', 'salario_base', 'neto_pagar', 'procesada')
    list_filter = ('procesada', 'periodo')

@admin.register(DetalleNomina)
class DetalleNominaAdmin(admin.ModelAdmin):
    list_display = ('nomina', 'concepto', 'valor')
    list_filter = ('concepto__tipo',)
