from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResolucionFacturacionViewSet, FacturaViewSet, DetalleFacturaViewSet

router = DefaultRouter()
router.register(r'resoluciones', ResolucionFacturacionViewSet)
router.register(r'facturas', FacturaViewSet)
router.register(r'detalles', DetalleFacturaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
