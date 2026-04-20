from rest_framework import serializers
from .models import KPI, Forecast

class KPISerializer(serializers.ModelSerializer):
    class Meta:
        model = KPI
        fields = '__all__'

class ForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forecast
        fields = '__all__'