from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count

# IMPORTANTE:
# verifica que el modelo se llame InformeDiario
from .models import InformeDiario


@action(detail=False, methods=['get'], url_path='status-counts')
def status_counts(self, request):

    try:

        # Contar estados de forma segura
        data = (
            InformeDiario.objects
            .values('estado')
            .annotate(total=Count('id'))
        )

        response = {
            'borrador': 0,
            'enviado': 0,
            'aprobado': 0,
        }

        for item in data:

            estado = str(item.get('estado', '')).lower()
            total = item.get('total', 0)

            if estado in response:
                response[estado] = total

        return Response(response)

    except Exception as e:

        return Response({
            'borrador': 0,
            'enviado': 0,
            'aprobado': 0,
            'error': str(e)
        }, status=200)
