import json
from django.utils.deprecation import MiddlewareMixin
from calidad.models import TrazabilidadISO, FormatoISO9001

class AuditLogMiddleware(MiddlewareMixin):
    """
    Middleware empresarial para registrar todas las operaciones de escritura.
    Asegura trazabilidad ISO 9001 en todo el ERP.
    """
    def process_response(self, request, response):
        # Solo registrar si el usuario está autenticado y es una operación de cambio
        if hasattr(request, 'user') and request.user.is_authenticated and request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            if response.status_code >= 200 and response.status_code < 300:
                try:
                    # Intentamos obtener el módulo desde la URL
                    path_parts = request.path.strip('/').split('/')
                    modulo = path_parts[1] if len(path_parts) > 1 else 'core'
                    
                    # Buscamos un formato ISO relacionado o creamos una entrada genérica
                    formato, _ = FormatoISO9001.objects.get_or_create(
                        codigo='AUDIT-LOG',
                        defaults={'titulo': 'Registro de Auditoría Automática', 'tipo': 'control_proceso', 'modulo_relacionado': 'calidad'}
                    )

                    TrazabilidadISO.objects.create(
                        formato=formato,
                        modulo_erp=modulo,
                        registro_id=0, # Podría extraerse del body si es necesario
                        accion='modificacion' if request.method != 'POST' else 'creacion',
                        usuario=request.user,
                        ip_address=self.get_client_ip(request),
                        detalles={'path': request.path, 'method': request.method, 'status': response.status_code}
                    )
                except Exception:
                    pass # No bloquear la respuesta si falla el log
        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for: return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')