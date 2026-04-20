from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MenuConfigViewSet, FormFormatViewSet

router = DefaultRouter()
router.register(r'menu-config', MenuConfigViewSet)
router.register(r'form-formats', FormFormatViewSet)

urlpatterns = [
    path('', include(router.urls)),
]