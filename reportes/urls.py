from django.urls import path
from .views import ReporteGeneralView, PowerBIReportView

urlpatterns = [
    path('general/', ReporteGeneralView.as_view(), name='reporte-general'),
    path('powerbi/', PowerBIReportView.as_view(), name='reporte-powerbi'),
]
