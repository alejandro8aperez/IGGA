from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmpleadoViewSet, AsistenciaViewSet

router = DefaultRouter()
router.register(r'empleados', EmpleadoViewSet)
router.register(r'asistencias', AsistenciaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
