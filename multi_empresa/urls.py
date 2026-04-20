from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmpresaViewSet, CentroCostoViewSet, AlmacenViewSet, 
    ConfiguracionEmpresaViewSet, UsuarioEmpresaViewSet
)

router = DefaultRouter()
router.register(r'empresas', EmpresaViewSet)
router.register(r'centros-costo', CentroCostoViewSet)
router.register(r'almacenes', AlmacenViewSet)
router.register(r'configuraciones', ConfiguracionEmpresaViewSet)
router.register(r'usuarios-empresa', UsuarioEmpresaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
