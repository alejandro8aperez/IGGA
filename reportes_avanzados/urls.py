from django.urls import path
from . import views

urlpatterns = [
    path('ventas-mensuales/', views.VentasMensualesView.as_view(), name='ventas-mensuales'),
    path('compras-mensuales/', views.ComprasMensualesView.as_view(), name='compras-mensuales'),
    path('productos-mas-vendidos/', views.ProductosMasVendidosView.as_view(), name='productos-mas-vendidos'),
    path('clientes-mas-activos/', views.ClientesMasActivosView.as_view(), name='clientes-mas-activos'),
    path('estado-proyectos/', views.EstadoProyectosView.as_view(), name='estado-proyectos'),
    path('conversion-leads/', views.ConversionLeadsView.as_view(), name='conversion-leads'),
    path('calidad-productos/', views.CalidadProductosView.as_view(), name='calidad-productos'),
    path('flujo-caja/', views.FlujoCajaView.as_view(), name='flujo-caja'),
    path('dashboard-completo/', views.DashboardCompletoView.as_view(), name='dashboard-completo'),
]