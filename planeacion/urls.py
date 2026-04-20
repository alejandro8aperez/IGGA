from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlanEstratégicoViewSet, ObjetivoViewSet

router = DefaultRouter()
router.register(r'planes', PlanEstratégicoViewSet)
router.register(r'objetivos', ObjetivoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]