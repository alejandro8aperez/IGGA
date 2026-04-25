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
    Solo funciona si no hay usuarios en la base de datos.
    """
    try:
        # Verificar si ya hay usuarios
        if User.objects.filter(is_superuser=True).exists():
            return JsonResponse({
                'success': False,
                'error': 'Ya existe un superusuario. Endpoint desactivado.'
            }, status=403)
        
        # Crear superusuario
        user = User.objects.create_superuser(
            username='admin',
            email='admin@8amperios.com',
            password='admin123',
            first_name='Administrador',
            last_name='ERP'
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Superusuario creado exitosamente',
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

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser] # Solo admins pueden gestionar usuarios
