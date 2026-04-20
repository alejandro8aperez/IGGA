from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (NormaCalidadViewSet, InspeccionViewSet, DefectoViewSet,
                    DocumentoISOViewSet, NoConformidadViewSet, AccionCorrectivaViewSet,
                    AuditoriaViewSet, EvaluacionProveedorViewSet)
from .views_iso9001 import FormatoISO9001ViewSet, ProcesoISOViewSet, TrazabilidadISOViewSet

router = DefaultRouter()
# Endpoints existentes
router.register(r'normas-calidad', NormaCalidadViewSet)
router.register(r'inspecciones', InspeccionViewSet)
router.register(r'defectos', DefectoViewSet)
router.register(r'documentos-iso', DocumentoISOViewSet)
router.register(r'noconformidades', NoConformidadViewSet)
router.register(r'capas', AccionCorrectivaViewSet)
router.register(r'auditorias', AuditoriaViewSet)
router.register(r'evaluaciones-proveedor', EvaluacionProveedorViewSet)

# Nuevos endpoints ISO 9001
router.register(r'formatos-iso9001', FormatoISO9001ViewSet, basename='formatoiso9001')
router.register(r'procesos-iso', ProcesoISOViewSet, basename='procesoiso')
router.register(r'tazabilidad-iso', TrazabilidadISOViewSet, basename='trazabilidadiso')

urlpatterns = [
    path('', include(router.urls)),
]