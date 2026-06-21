from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InformeSemanalViewSet, InformeMensualViewSet

router = DefaultRouter()
router.register(r'informes-semanales', InformeSemanalViewSet, basename='informe-semanal')
router.register(r'informes-mensuales', InformeMensualViewSet, basename='informe-mensual')

urlpatterns = [
    path('', include(router.urls)),
]
