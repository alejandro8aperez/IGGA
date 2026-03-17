from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProveedorViewSet, OrdenCompraViewSet, DetalleOrdenCompraViewSet

router = DefaultRouter()
router.register(r'proveedores', ProveedorViewSet)
router.register(r'ordenes', OrdenCompraViewSet)
router.register(r'detalles-orden', DetalleOrdenCompraViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
