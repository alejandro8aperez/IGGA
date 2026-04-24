from django.contrib import admin
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
