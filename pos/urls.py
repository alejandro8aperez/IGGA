from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SesionCajaViewSet, VentaPOSViewSet

router = DefaultRouter()
router.register(r'sesiones', SesionCajaViewSet)
router.register(r'ventas', VentaPOSViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
