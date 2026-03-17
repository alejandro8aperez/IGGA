from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClienteViewSet, OportunidadViewSet

router = DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'oportunidades', OportunidadViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
