from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoriaViewSet, AlmacenViewSet, ProductoViewSet, LoteViewSet,
    MovimientoInventarioViewSet, AlertaInventarioViewSet,
    ConteoFisicoViewSet, DetalleConteoFisicoViewSet, UnidadMedidaViewSet
)

router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet)
router.register(r'unidades-medida', UnidadMedidaViewSet)
router.register(r'almacenes', AlmacenViewSet)
router.register(r'productos', ProductoViewSet)
router.register(r'lotes', LoteViewSet)
router.register(r'movimientos', MovimientoInventarioViewSet)
router.register(r'alertas', AlertaInventarioViewSet)
router.register(r'conteos', ConteoFisicoViewSet)
router.register(r'conteos-detalle', DetalleConteoFisicoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
