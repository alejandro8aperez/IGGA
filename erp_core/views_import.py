"""
Vista API para importar datos desde JSON.
Permite subir archivos JSON exportados desde local e importarlos en la nube.
"""
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core import serializers
from django.apps import apps
from django.db import transaction
import os


@csrf_exempt
@require_http_methods(["POST"])
def import_data_api(request):
    """
    API endpoint para importar datos desde JSON.
    
    POST /api/import-data/
    Body: { "model": "crm.Cliente", "data": [...] }
    """
    try:
        body = json.loads(request.body)
        model_name = body.get('model')
        data = body.get('data', [])
        
        if not model_name or not data:
            return JsonResponse({
                'success': False,
                'error': 'Se requiere "model" y "data"'
            }, status=400)
        
        # Obtener modelo
        app_label, model_name_only = model_name.split('.')
        model = apps.get_model(app_label, model_name_only)
        
        # Importar datos
        with transaction.atomic():
            created_count = 0
            updated_count = 0
            
            for item in data:
                # Crear o actualizar objeto
                obj, created = model.objects.update_or_create(
                    id=item.get('id'),
                    defaults=item
                )
                if created:
                    created_count += 1
                else:
                    updated_count += 1
        
        return JsonResponse({
            'success': True,
            'model': model_name,
            'created': created_count,
            'updated': updated_count,
            'total': len(data)
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def export_data_api(request):
    """
    API endpoint para exportar datos a JSON.
    
    POST /api/export-data/
    Body: { "model": "crm.Cliente" }
    """
    try:
        body = json.loads(request.body)
        model_name = body.get('model')
        
        if not model_name:
            return JsonResponse({
                'success': False,
                'error': 'Se requiere "model"'
            }, status=400)
        
        # Obtener modelo
        app_label, model_name_only = model_name.split('.')
        model = apps.get_model(app_label, model_name_only)
        
        # Exportar datos
        objects = model.objects.all()
        data = serializers.serialize('python', objects)
        
        # Limpiar datos para solo devolver fields
        clean_data = [item['fields'] for item in data]
        
        return JsonResponse({
            'success': True,
            'model': model_name,
            'count': len(clean_data),
            'data': clean_data
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


def list_models(request):
    """
    Lista todos los modelos disponibles para exportar/importar.
    
    GET /api/list-models/
    """
    models_info = []
    
    for app_config in apps.get_app_configs():
        for model in app_config.get_models():
            count = model.objects.count()
            models_info.append({
                'app': app_config.label,
                'model': model.__name__,
                'full_name': f"{app_config.label}.{model.__name__}",
                'count': count
            })
    
    return JsonResponse({
        'success': True,
        'models': models_info
    })
