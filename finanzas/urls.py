from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CuentaViewSet, TransaccionViewSet, ActivoFijoViewSet

router = DefaultRouter()
router.register(r'cuentas', CuentaViewSet)
router.register(r'transacciones', TransaccionViewSet)
router.register(r'activos-fijos', ActivoFijoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
