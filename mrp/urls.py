from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PlanMaestroProduccionViewSet, ListaMaterialesViewSet, RutaManufacturaViewSet,
    RequerimientoMaterialViewSet, PlanCapacidadViewSet, EjecucionMRPViewSet
)

router = DefaultRouter()
router.register(r'plan-maestro-produccion', PlanMaestroProduccionViewSet)
router.register(r'listas-materiales', ListaMaterialesViewSet)
router.register(r'rutas-manufactura', RutaManufacturaViewSet)
router.register(r'requerimientos-materiales', RequerimientoMaterialViewSet)
router.register(r'planes-capacidad', PlanCapacidadViewSet)
router.register(r'ejecuciones-mrp', EjecucionMRPViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
