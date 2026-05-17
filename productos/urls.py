from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GrupoMaterialViewSet, FamiliaProductoViewSet, TipoEmpaqueViewSet,
    CodigoBarrasViewSet, UnidadEmpaqueViewSet, UnidadMedidaAlternativaViewSet,
    ProductoMaestroViewSet,
)

router = DefaultRouter()
router.register(r'maestro', ProductoMaestroViewSet, basename='producto-maestro')
router.register(r'grupos-material', GrupoMaterialViewSet, basename='grupo-material')
router.register(r'familias', FamiliaProductoViewSet, basename='familia-producto')
router.register(r'tipos-empaque', TipoEmpaqueViewSet, basename='tipo-empaque')
router.register(r'codigos-barras', CodigoBarrasViewSet, basename='codigo-barras')
router.register(r'unidades-empaque', UnidadEmpaqueViewSet, basename='unidad-empaque')
router.register(r'unidades-alternativas', UnidadMedidaAlternativaViewSet, basename='unidad-alternativa')

urlpatterns = [
    path('', include(router.urls)),
]
