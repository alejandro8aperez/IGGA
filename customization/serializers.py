from rest_framework import serializers
from .models import MenuConfig, FormFormat

class MenuConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuConfig
        fields = '__all__'

class FormFormatSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormFormat
        fields = '__all__'