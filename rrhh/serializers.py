from rest_framework import serializers
from .models import (
    EPS, AFP, ARL, CajaCompensacion, Departamento, Cargo, CentroCosto,
    Empleado, ContactoEmergencia, Familiar, FormacionAcademica, Idioma,
    Certificacion, ExperienciaLaboral, Vacaciones, Incapacidad, Dotacion,
    ExamenMedico, EPP, Disciplinario, EvaluacionDesempeno, HistorialCargo,
    DocumentoEmpleado, ConceptoNomina, PeriodoNomina, Nomina, DetalleNomina
)

# ── Catálogos ──────────────────────────────────────────────
class EPSSerializer(serializers.ModelSerializer):
    class Meta: model = EPS; fields = '__all__'

class AFPSerializer(serializers.ModelSerializer):
    class Meta: model = AFP; fields = '__all__'

class ARLSerializer(serializers.ModelSerializer):
    class Meta: model = ARL; fields = '__all__'

class CajaCompensacionSerializer(serializers.ModelSerializer):
    class Meta: model = CajaCompensacion; fields = '__all__'

class DepartamentoSerializer(serializers.ModelSerializer):
    class Meta: model = Departamento; fields = '__all__'

class CargoSerializer(serializers.ModelSerializer):
    class Meta: model = Cargo; fields = '__all__'

class CentroCostoSerializer(serializers.ModelSerializer):
    class Meta: model = CentroCosto; fields = '__all__'


# ── Modelos Anidados (SATÉLITES DE EMPLEADO) ───────────────
class ContactoEmergenciaSerializer(serializers.ModelSerializer):
    class Meta: model = ContactoEmergencia; fields = '__all__'

class FamiliarSerializer(serializers.ModelSerializer):
    class Meta: model = Familiar; fields = '__all__'

class FormacionAcademicaSerializer(serializers.ModelSerializer):
    class Meta: model = FormacionAcademica; fields = '__all__'

class IdiomaSerializer(serializers.ModelSerializer):
    class Meta: model = Idioma; fields = '__all__'

class CertificacionSerializer(serializers.ModelSerializer):
    class Meta: model = Certificacion; fields = '__all__'

class ExperienciaLaboralSerializer(serializers.ModelSerializer):
    class Meta: model = ExperienciaLaboral; fields = '__all__'

class VacacionesSerializer(serializers.ModelSerializer):
    class Meta: model = Vacaciones; fields = '__all__'

class IncapacidadSerializer(serializers.ModelSerializer):
    class Meta: model = Incapacidad; fields = '__all__'

class DotacionSerializer(serializers.ModelSerializer):
    class Meta: model = Dotacion; fields = '__all__'

class ExamenMedicoSerializer(serializers.ModelSerializer):
    class Meta: model = ExamenMedico; fields = '__all__'

class EPPSerializer(serializers.ModelSerializer):
    class Meta: model = EPP; fields = '__all__'

class DisciplinarioSerializer(serializers.ModelSerializer):
    class Meta: model = Disciplinario; fields = '__all__'

class EvaluacionDesempenoSerializer(serializers.ModelSerializer):
    class Meta: model = EvaluacionDesempeno; fields = '__all__'

class HistorialCargoSerializer(serializers.ModelSerializer):
    class Meta: model = HistorialCargo; fields = '__all__'

class DocumentoEmpleadoSerializer(serializers.ModelSerializer):
    class Meta: model = DocumentoEmpleado; fields = '__all__'


# ── Empleado ───────────────────────────────────────────────
class EmpleadoSerializer(serializers.ModelSerializer):
    # Relaciones anidadas como campos de solo lectura para listar todo el perfil del empleado
    contactos_emergencia = ContactoEmergenciaSerializer(many=True, read_only=True)
    familiares = FamiliarSerializer(many=True, read_only=True)
    formacion_academica = FormacionAcademicaSerializer(many=True, read_only=True)
    idiomas = IdiomaSerializer(many=True, read_only=True)
    certificaciones = CertificacionSerializer(many=True, read_only=True)
    experiencia_laboral = ExperienciaLaboralSerializer(many=True, read_only=True)
    vacaciones = VacacionesSerializer(many=True, read_only=True)
    incapacidades = IncapacidadSerializer(many=True, read_only=True)
    dotaciones = DotacionSerializer(many=True, read_only=True)
    examenes_medicos = ExamenMedicoSerializer(many=True, read_only=True)
    epps = EPPSerializer(many=True, read_only=True)
    disciplinarios = DisciplinarioSerializer(many=True, read_only=True)
    evaluaciones = EvaluacionDesempenoSerializer(many=True, read_only=True)
    historial_cargos = HistorialCargoSerializer(many=True, read_only=True)
    documentos = DocumentoEmpleadoSerializer(many=True, read_only=True)

    class Meta:
        model = Empleado
        fields = '__all__'


# ── Nómina Electrónica ─────────────────────────────────────
class ConceptoNominaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConceptoNomina
        fields = '__all__'


class PeriodoNominaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PeriodoNomina
        fields = '__all__'


class DetalleNominaSerializer(serializers.ModelSerializer):
    concepto_nombre = serializers.CharField(source='concepto.nombre', read_only=True)

    class Meta:
        model = DetalleNomina
        fields = '__all__'


class NominaSerializer(serializers.ModelSerializer):
    empleado_nombre = serializers.CharField(source='empleado.nombre_completo', read_only=True)
    periodo_nombre = serializers.CharField(source='periodo.nombre', read_only=True)
    detalles = DetalleNominaSerializer(many=True, read_only=True)

    class Meta:
        model = Nomina
        fields = '__all__'
        read_only_fields = ('total_devengados', 'total_deducciones', 'total_provisiones', 'neto_pagar')
