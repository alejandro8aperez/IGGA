# erp_core/views_health.py
# Endpoint público /api/health/ — usado por el ping keep-alive del frontend
# y por Render para health checks.

from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
import django
import sys
import os
try:
    import cloudinary
    has_cloudinary = True
except ImportError:
    has_cloudinary = False


def _mask(val, prefix=2, suffix=2):
    if not val:
        return None
    v = str(val)
    if len(v) <= prefix + suffix:
        return v[:1] + "*" * (len(v) - 2) + v[-1:]
    return v[:prefix] + "*" * (len(v) - prefix - suffix) + v[-suffix:]


@csrf_exempt
@require_GET
def health_check(request):
    """
    Endpoint público (sin autenticación) que responde 200 OK.
    Sirve para:
      1. Mantener vivo el servicio en Render (plan free hiberna tras 15 min).
      2. Health check de Render / load balancers.
    """
    info = {
        "status": "ok",
        "python": sys.version,
        "django": django.get_version(),
    }

    if has_cloudinary:
        cfg = cloudinary.config()
        info["cloudinary"] = {
            "cloud_name": cfg.cloud_name,
            "api_key_prefix": _mask(cfg.api_key, 4, 0),
            "signature_algorithm": cfg.signature_algorithm,
            "secure": cfg.secure,
        }
        info["env"] = {
            "USE_CLOUDINARY": os.environ.get("USE_CLOUDINARY"),
            "CLOUDINARY_CLOUD_NAME": os.environ.get("CLOUDINARY_CLOUD_NAME"),
            "CLOUDINARY_API_KEY_PREFIX": _mask(os.environ.get("CLOUDINARY_API_KEY"), 4, 0),
            "CLOUDINARY_API_SECRET_PREFIX": _mask(os.environ.get("CLOUDINARY_API_SECRET"), 2, 2),
            "CLOUDINARY_URL_PRESENT": "CLOUDINARY_URL" in os.environ,
        }

    return JsonResponse(info)
