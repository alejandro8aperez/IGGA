from django.urls import path
from . import views

urlpatterns = [
    path('metrics/', views.DashboardView.as_view(), name='dashboard-metrics'),
]