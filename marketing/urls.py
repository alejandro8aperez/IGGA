from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'segmentos', views.SegmentoViewSet)
router.register(r'campanas', views.CampanaViewSet)
router.register(r'leads', views.LeadViewSet)

urlpatterns = [
    path('', include(router.urls)),
]