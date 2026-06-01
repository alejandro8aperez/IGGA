from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContratoInterventoriaViewSet, VisitaInterventoriaViewSet, HallazgoViewSet

router = DefaultRouter()
router.register(r'contratos', ContratoInterventoriaViewSet)
router.register(r'visitas', VisitaInterventoriaViewSet)
router.register(r'hallazgos', HallazgoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]