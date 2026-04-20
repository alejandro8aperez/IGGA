from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EquipoViewSet, OrdenMantenimientoViewSet, RepuestoViewSet, DetalleMantenimientoViewSet, CostoMantenimientoViewSet

router = DefaultRouter()
router.register(r'equipos', EquipoViewSet)
router.register(r'ordenes', OrdenMantenimientoViewSet)
router.register(r'repuestos', RepuestoViewSet)
router.register(r'detalles', DetalleMantenimientoViewSet)
router.register(r'costos', CostoMantenimientoViewSet, basename='costo-mantenimiento')

urlpatterns = [
    path('', include(router.urls)),
]