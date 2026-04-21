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

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser] # Solo admins pueden gestionar usuarios
