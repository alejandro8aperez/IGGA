from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('obras', views.ObraViewSet, basename='obra')
router.register('categorias-recursos', views.CategoriaRecursoViewSet,
                basename='categoria-recurso')
router.register('recursos', views.RecursoViewSet, basename='recurso')
router.register('categorias-actividades', views.CategoriaActividadViewSet,
                basename='categoria-actividad')
router.register('informes', views.InformeDiarioViewSet, basename='informe')
router.register('anexos', views.AnexoFotoViewSet, basename='anexo')
router.register('dashboard', views.DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
