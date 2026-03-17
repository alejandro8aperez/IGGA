from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RecetaViewSet, InsumoRecetaViewSet, OrdenProduccionViewSet

router = DefaultRouter()
router.register(r'recetas', RecetaViewSet)
router.register(r'insumos', InsumoRecetaViewSet)
router.register(r'ordenes', OrdenProduccionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
