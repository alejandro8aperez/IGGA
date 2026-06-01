@"
from rest_framework import serializers
from django.contrib.auth.models import User
from usuarios.models import PerfilUsuario as Perfil
from .models import ContratoInterventoria, VisitaInterventoria, Hallazgo

class PerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perfil
        fields = ['cargo', 'telefono']

class UserSerializer(serializers.ModelSerializer):
    perfil = PerfilSerializer(read_only=True)
    full_name = serializers.ReadOnlyField(source='get_full_name')
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'perfil', 'is_staff']
        read_only_fields = ['id']

class ContratoInterventoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContratoInterventoria
        fields = '__all__'

class VisitaInterventoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitaInterventoria
        fields = '__all__'

class HallazgoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hallazgo
        fields = '__all__'
"@ | Set-Content interventoria\serializers.py
