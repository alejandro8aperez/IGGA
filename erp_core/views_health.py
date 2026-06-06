# erp_core/views_health.py
# Endpoint público /api/health/ — usado por el ping keep-alive del frontend
# y por Render para health checks.

from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
import django
import sys


@csrf_exempt
@require_GET
def health_check(request):
    """
    Endpoint público (sin autenticación) que responde 200 OK.
    Sirve para:
      1. Mantener vivo el servicio en Render (plan free hiberna tras 15 min).
      2. Health check de Render / load balancers.
    """
    return JsonResponse({
        "status": "ok",
        "python": sys.version,
        "django": django.get_version(),
    })
