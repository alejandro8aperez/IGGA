import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

import traceback
from rrhh.models import PeriodoNomina, Empleado
from rrhh.views import PeriodoNominaViewSet

try:
    p = PeriodoNomina.objects.get(id=1)
    view = PeriodoNominaViewSet()
    view.kwargs = {'pk': '1'}
    # Fake request
    class FakeRequest:
        pass
    view.request = FakeRequest()
    res = view.liquidar(view.request, pk='1')
    print("STATUS:", res.status_code)
    print("DATA:", res.data)
except Exception as e:
    print("CAUGHT EXCEPTION!")
    traceback.print_exc()
