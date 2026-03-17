from django.contrib.auth.models import User
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from .serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser] # Solo admins pueden gestionar usuarios
