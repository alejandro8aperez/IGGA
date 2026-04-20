from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'vehiculos', views.VehiculoViewSet)
router.register(r'rutas', views.RutaViewSet)
router.register(r'envios', views.EnvioViewSet)
router.register(r'detalles-envio', views.DetalleEnvioViewSet)

urlpatterns = [
    path('', include(router.urls)),
]