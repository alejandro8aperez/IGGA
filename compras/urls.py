from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProveedorViewSet, OrdenCompraViewSet, DetalleOrdenCompraViewSet, RecepcionCompraViewSet, PagoCompraViewSet, ContratoViewSet, ProductoProveedorViewSet

router = DefaultRouter()
router.register(r'proveedores', ProveedorViewSet)
router.register(r'ordenes', OrdenCompraViewSet)
router.register(r'detalles-orden', DetalleOrdenCompraViewSet)
router.register(r'recepciones', RecepcionCompraViewSet)
router.register(r'pagos', PagoCompraViewSet)
router.register(r'contratos', ContratoViewSet)
router.register(r'productos-proveedor', ProductoProveedorViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
