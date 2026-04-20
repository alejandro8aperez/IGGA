from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'ordenes-venta', views.OrdenVentaViewSet, basename='ordenes-venta')
router.register(r'detalles-orden-venta', views.DetalleOrdenVentaViewSet, basename='detalles-orden-venta')
router.register(r'facturas-venta', views.FacturaVentaViewSet, basename='facturas-venta')
# Alias para el frontend
router.register(r'pedidos', views.OrdenVentaViewSet, basename='pedidos')
router.register(r'facturas', views.FacturaVentaViewSet, basename='facturas')

urlpatterns = [
    path('', include(router.urls)),
]