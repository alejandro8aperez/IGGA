from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import KPIViewSet

router = DefaultRouter()
router.register(r'kpis', KPIViewSet)

urlpatterns = [
    path('', include(router.urls)),
]