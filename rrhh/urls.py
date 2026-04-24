from rest_framework.routers import DefaultRouter
from .views import (
    EPSViewSet, AFPViewSet, ARLViewSet, CajaCompensacionViewSet,
    DepartamentoViewSet, CargoViewSet, CentroCostoViewSet,
    EmpleadoViewSet, ContactoEmergenciaViewSet, FamiliarViewSet,
    FormacionAcademicaViewSet, IdiomaViewSet, CertificacionViewSet,
    ExperienciaLaboralViewSet, VacacionesViewSet, IncapacidadViewSet,
    DotacionViewSet, ExamenMedicoViewSet, EPPViewSet,
    DisciplinarioViewSet, EvaluacionDesempenoViewSet,
    HistorialCargoViewSet, DocumentoEmpleadoViewSet,
    ConceptoNominaViewSet, PeriodoNominaViewSet, NominaViewSet, DetalleNominaViewSet
)

router = DefaultRouter()

# Catálogos
router.register(r'eps', EPSViewSet)
router.register(r'afp', AFPViewSet)
router.register(r'arl', ARLViewSet)
router.register(r'cajas-compensacion', CajaCompensacionViewSet)
router.register(r'departamentos', DepartamentoViewSet)
router.register(r'cargos', CargoViewSet)
router.register(r'centros-costo', CentroCostoViewSet)

# Empleado
router.register(r'empleados', EmpleadoViewSet)

# Satélites / Componentes relacionados
router.register(r'contactos-emergencia', ContactoEmergenciaViewSet)
router.register(r'familiares', FamiliarViewSet)
router.register(r'formacion-academica', FormacionAcademicaViewSet)
router.register(r'idiomas', IdiomaViewSet)
router.register(r'certificaciones', CertificacionViewSet)
router.register(r'experiencia-laboral', ExperienciaLaboralViewSet)
router.register(r'vacaciones', VacacionesViewSet)
router.register(r'incapacidades', IncapacidadViewSet)
router.register(r'dotaciones', DotacionViewSet)
router.register(r'examenes-medicos', ExamenMedicoViewSet)
router.register(r'epps', EPPViewSet)
router.register(r'disciplinarios', DisciplinarioViewSet)
router.register(r'evaluaciones-desempeno', EvaluacionDesempenoViewSet)
router.register(r'historial-cargos', HistorialCargoViewSet)
router.register(r'documentos-empleado', DocumentoEmpleadoViewSet)

# Nómina Electrónica
router.register(r'conceptos-nomina', ConceptoNominaViewSet)
router.register(r'periodos-nomina', PeriodoNominaViewSet)
router.register(r'nominas', NominaViewSet)
router.register(r'detalles-nomina', DetalleNominaViewSet)

urlpatterns = router.urls