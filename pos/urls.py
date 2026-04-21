from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SesionCajaViewSet, VentaPOSViewSet, seed_bakery_data

router = DefaultRouter()
router.register(r'sesiones', SesionCajaViewSet)
router.register(r'ventas', VentaPOSViewSet)

urlpatterns = [
    path('seed-bakery/', seed_bakery_data, name='seed-bakery-pos'),
    path('', include(router.urls)),
]
