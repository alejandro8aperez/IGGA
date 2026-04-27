from django.contrib.auth.models import User
from django.http import JsonResponse
from django.utils import timezone
from django.db import connections
from django.db.utils import OperationalError
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .serializers import UserSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def ping(request):
    """
    Health-check robusto que verifica la conectividad con la base de datos.
    Ideal para configurar en el "Health Check Path" de Render.
    """
    db_status = "ok"
    try:
        # Verifica que la base de datos responda correctamente
        connections['default'].cursor()
    except OperationalError:
        db_status = "disconnected"

    return JsonResponse({
        'status': 'ok' if db_status == "ok" else 'error',
        'database': db_status,
        'timestamp': timezone.now().isoformat()
    }, status=200 if db_status == "ok" else 503)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_initial_superuser(request):
    """
    Endpoint temporal para crear superusuario inicial en la nube.
    Crea o actualiza el usuario admin.
    """
    try:
        # Crear o actualizar superusuario
        user, created = User.objects.update_or_create(
            username='admin',
            defaults={
                'email': 'admin@8amperios.com',
                'is_superuser': True,
                'is_staff': True,
                'first_name': 'Administrador',
                'last_name': 'ERP'
            }
        )
        
        # Siempre actualizar la contraseña
        user.set_password('admin123')
        user.save()
        
        return JsonResponse({
            'success': True,
            'message': f"Superusuario {'creado' if created else 'actualizado'} exitosamente",
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_credentials(request):
    """
    Endpoint para verificar credenciales de usuario.
    """
    try:
        from django.contrib.auth import authenticate
        
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return JsonResponse({
                'success': False,
                'error': 'Se requiere username y password'
            }, status=400)
        
        user = authenticate(username=username, password=password)
        
        if user:
            return JsonResponse({
                'success': True,
                'message': 'Credenciales válidas',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'is_superuser': user.is_superuser
                }
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Credenciales inválidas'
            }, status=401)
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

from django.http import FileResponse
from pathlib import Path

@api_view(['GET'])
@permission_classes([AllowAny])
def test_image(request, filename):
    """Endpoint temporal para probar acceso a imágenes"""
    import os, mimetypes
    base_dir = Path(__file__).parent.parent
    image_path = base_dir / 'media' / 'productos' / filename
    
    # Debug info
    debug_info = {
        'filename': filename,
        'base_dir': str(base_dir),
        'image_path': str(image_path),
        'exists': image_path.exists(),
        'cwd': os.getcwd(),
        'files_in_media': os.listdir(str(base_dir / 'media' / 'productos')) if (base_dir / 'media' / 'productos').exists() else 'directory not found'
    }
    
    if image_path.exists():
        try:
            content_type, _ = mimetypes.guess_type(str(image_path))
            response = FileResponse(open(image_path, 'rb'), content_type=content_type or 'image/jpeg')
            response['Cache-Control'] = 'public, max-age=86400' # Cache por 24 horas
            return response
        except Exception as e:
            debug_info['error'] = str(e)
            return JsonResponse(debug_info, status=500)
    
    return JsonResponse(debug_info, status=404)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser] # Solo admins pueden gestionar usuarios
