from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CuentaBancariaViewSet, MovimientoTesoreriaViewSet,
    ConciliacionBancariaViewSet, ChequeViewSet,
    ProyeccionFlujoCajaViewSet, IndicadorTesoreriaViewSet,
    RegistroIndicadorViewSet
)

# Router
router = DefaultRouter()
router.register(r'cuentas-bancarias', CuentaBancariaViewSet)
router.register(r'movimientos', MovimientoTesoreriaViewSet)
router.register(r'conciliaciones', ConciliacionBancariaViewSet)
router.register(r'cheques', ChequeViewSet)
router.register(r'proyecciones', ProyeccionFlujoCajaViewSet)
router.register(r'indicadores', IndicadorTesoreriaViewSet)
router.register(r'registros-indicadores', RegistroIndicadorViewSet)

app_name = 'tesoreria'

urlpatterns = [
    path('', include(router.urls)),
]
