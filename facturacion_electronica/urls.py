"""
URLs para Facturación Electrónica
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'logs', views.FacturaElectronicaLogViewSet, basename='factura-electronica-log')
router.register(r'configuracion', views.ConfiguracionFacturatechViewSet, basename='facturatech-config')

urlpatterns = [
    path('', include(router.urls)),
    # API endpoints personalizados
    path('enviar/', views.FacturacionElectronicaAPIView.as_view({'post': 'enviar'}), name='enviar-factura'),
    path('generar-xml/', views.FacturacionElectronicaAPIView.as_view({'post': 'generar_xml'}), name='generar-xml'),
    path('hash-password/', views.FacturacionElectronicaAPIView.as_view({'get': 'hash_password'}), name='hash-password'),
    path('estadisticas/', views.FacturacionElectronicaAPIView.as_view({'get': 'estadisticas'}), name='estadisticas'),
]
