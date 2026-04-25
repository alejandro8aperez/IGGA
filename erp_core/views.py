from django.contrib.auth.models import User
from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .serializers import UserSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def ping(request):
    """Lightweight health-check endpoint for uptime monitoring services."""
    return JsonResponse({'status': 'ok', 'message': 'ERP 8-AMPERIOS backend is alive!'})

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

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser] # Solo admins pueden gestionar usuarios
