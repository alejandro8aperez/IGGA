from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Empresa, CentroCosto, Almacen, ConfiguracionEmpresa, UsuarioEmpresa

class EmpresaSerializer(serializers.ModelSerializer):
    """Serializer para modelo Empresa"""
    sucursales_count = serializers.ReadOnlyField()
    es_matriz = serializers.ReadOnlyField()
    nombre_matriz = serializers.CharField(source='empresa_matriz.razon_social', read_only=True)
    administrador_nombre = serializers.CharField(source='administrador.username', read_only=True)
    
    class Meta:
        model = Empresa
        fields = '__all__'
        read_only_fields = ['fecha_creacion', 'fecha_ultima_modificacion']

class EmpresaCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear empresas"""
    class Meta:
        model = Empresa
        fields = ['nit', 'razon_social', 'nombre_comercial', 'tipo_empresa', 'empresa_matriz',
                 'regimen_fiscal', 'tipo_contribuyente', 'direccion', 'telefono', 'email', 
                 'sitio_web', 'moneda_base', 'pais', 'ciudad', 'administrador']

class CentroCostoSerializer(serializers.ModelSerializer):
    """Serializer para modelo CentroCosto"""
    empresa_nombre = serializers.CharField(source='empresa.razon_social', read_only=True)
    responsable_nombre = serializers.CharField(source='responsponsible.username', read_only=True)
    
    class Meta:
        model = CentroCosto
        fields = '__all__'

class AlmacenSerializer(serializers.ModelSerializer):
    """Serializer para modelo Almacen"""
    empresa_nombre = serializers.CharField(source='empresa.razon_social', read_only=True)
    responsable_nombre = serializers.CharField(source='responsponsible.username', read_only=True)
    
    class Meta:
        model = Almacen
        fields = '__all__'

class ConfiguracionEmpresaSerializer(serializers.ModelSerializer):
    """Serializer para modelo ConfiguracionEmpresa"""
    empresa_nombre = serializers.CharField(source='empresa.razon_social', read_only=True)
    
    class Meta:
        model = ConfiguracionEmpresa
        fields = '__all__'

class UsuarioEmpresaSerializer(serializers.ModelSerializer):
    """Serializer para modelo UsuarioEmpresa"""
    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True)
    usuario_email = serializers.CharField(source='usuario.email', read_only=True)
    empresa_nombre = serializers.CharField(source='empresa.razon_social', read_only=True)
    
    class Meta:
        model = UsuarioEmpresa
        fields = '__all__'

class UsuarioEmpresaCreateSerializer(serializers.ModelSerializer):
    """Serializer para asignar usuarios a empresas"""
    class Meta:
        model = UsuarioEmpresa
        fields = ['usuario', 'empresa', 'rol_empresa', 'permisos_especificos']

class EmpresaResumenSerializer(serializers.ModelSerializer):
    """Serializer simplificado para resúmenes y listados"""
    sucursales_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Empresa
        fields = ['id', 'nit', 'razon_social', 'tipo_empresa', 'ciudad', 'activa', 'sucursales_count']
