from django.urls import path
from .views import ReporteGeneralView

urlpatterns = [
    path('general/', ReporteGeneralView.as_view(), name='reporte-general'),
]
