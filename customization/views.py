from rest_framework import viewsets
from .models import MenuConfig, FormFormat
from .serializers import MenuConfigSerializer, FormFormatSerializer

class MenuConfigViewSet(viewsets.ModelViewSet):
    queryset = MenuConfig.objects.all()
    serializer_class = MenuConfigSerializer

class FormFormatViewSet(viewsets.ModelViewSet):
    queryset = FormFormat.objects.all()
    serializer_class = FormFormatSerializer

    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user)
