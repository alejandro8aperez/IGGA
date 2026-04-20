from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'cuentas', views.CuentaViewSet)
router.register(r'asientos', views.AsientoContableViewSet)
router.register(r'movimientos', views.MovimientoContableViewSet)

urlpatterns = [
    path('', include(router.urls)),
]