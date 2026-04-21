"""
URL configuration for erp_core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ping

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/ping/', ping, name='ping'),
    path('api/multi-empresa/', include('multi_empresa.urls')),
    path('api/mrp/', include('mrp.urls')),
    path('api/crm/', include('crm.urls')),
    path('api/inventarios/', include('inventarios.urls')),
    path('api/inventario/', include('inventarios.urls')),  # Alias para el frontend
    path('api/finanzas/', include('finanzas.urls')),
    path('api/compras/', include('compras.urls')),
    path('api/operaciones/', include('operaciones.urls')),
    path('api/rrhh/', include('rrhh.urls')),
    path('api/configuracion/', include('configuracion.urls')),
    path('api/reportes/', include('reportes.urls')),
    path('api/facturacion/', include('facturacion.urls')),
    path('api/produccion/', include('produccion.urls')),
    path('api/venta/', include('venta.urls')),
    path('api/ventas/', include('venta.urls')),  # Alias para el frontend
    path('api/contabilidad/', include('contabilidad.urls')),
    path('api/proyectos/', include('proyectos.urls')),
    path('api/logistica/', include('logistica.urls')),
    path('api/calidad/', include('calidad.urls')),
    path('api/marketing/', include('marketing.urls')),
    path('api/empresa/', include('empresa.urls')),
    path('api/workflow/', include('workflow.urls')),
    path('api/reportes-avanzados/', include('reportes_avanzados.urls')),
    path('api/planeacion/', include('planeacion.urls')),
    path('api/mantenimiento/', include('mantenimiento.urls')),
    path('api/kpis/', include('kpis.urls')),
    path('api/customization/', include('customization.urls')),
    path('api/kave/', include('kave.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include(router.urls)),
]
