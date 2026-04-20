from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RecetaViewSet, InsumoRecetaViewSet, OrdenProduccionViewSet, CostoProduccionViewSet

router = DefaultRouter()
router.register(r'recetas', RecetaViewSet)
router.register(r'insumos', InsumoRecetaViewSet)
router.register(r'ordenes', OrdenProduccionViewSet)
router.register(r'costos', CostoProduccionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
