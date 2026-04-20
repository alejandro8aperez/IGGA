from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'proyectos', views.ProyectoViewSet)
router.register(r'tareas', views.TareaViewSet)
router.register(r'proyectos-ps', views.ProyectoPSViewSet)
router.register(r'wbs-items', views.WBSItemViewSet)
router.register(r'hitos-ps', views.HitoPSViewSet)
router.register(r'costos-ps', views.CostoPSViewSet)

urlpatterns = [
    path('', include(router.urls)),
]