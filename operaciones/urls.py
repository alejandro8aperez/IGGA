from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProyectoViewSet, TareaViewSet, InformeDiarioProyViewSet

router = DefaultRouter()
router.register(r'proyectos', ProyectoViewSet)
router.register(r'tareas', TareaViewSet)
router.register(r'informes-diarios', InformeDiarioProyViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
