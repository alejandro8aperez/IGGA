from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RecetaViewSet, InsumoRecetaViewSet, OrdenProduccionViewSet, 
    FaseOrdenProduccionViewSet, ConsumoProduccionViewSet, 
    MermaProduccionViewSet, CostoProduccionViewSet
)

router = DefaultRouter()
router.register(r'recetas', RecetaViewSet)
router.register(r'insumos', InsumoRecetaViewSet)
router.register(r'ordenes', OrdenProduccionViewSet)
router.register(r'fases', FaseOrdenProduccionViewSet)
router.register(r'consumos', ConsumoProduccionViewSet)
router.register(r'mermas', MermaProduccionViewSet)
router.register(r'costos', CostoProduccionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
