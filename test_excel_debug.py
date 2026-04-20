import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "erp_core.settings") # Wait, is it erp_core?
try:
    django.setup()
except:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
    django.setup()

from crm.models import Cotizacion
from crm.views import CotizacionViewSet
import traceback

try:
    cotizacion = Cotizacion.objects.first()
    if not cotizacion:
        print("No hay cotizaciones.")
    else:
        print("Probando cotización:", cotizacion.id)
        
        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.get('/')
        
        view = CotizacionViewSet.as_view({'get': 'excel'})
        response = view(request, pk=cotizacion.id)
        
        print("Status code:", response.status_code)
        if response.status_code == 200:
            print("Successfully generated Excel!")
        else:
            print(response.content)
            
except Exception as e:
    print("CRASHED!")
    traceback.print_exc()
