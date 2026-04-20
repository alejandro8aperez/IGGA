from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import Empresa, CentroCosto, Almacen, ConfiguracionEmpresa, UsuarioEmpresa
from .serializers import (
    EmpresaSerializer, EmpresaCreateSerializer, EmpresaResumenSerializer,
    CentroCostoSerializer, AlmacenSerializer, ConfiguracionEmpresaSerializer,
    UsuarioEmpresaSerializer, UsuarioEmpresaCreateSerializer
)

class IsAdminOrReadOnly(permissions.BasePermission):
    """Permiso personalizado: solo administradores pueden escribir"""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_staff

class EmpresaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de Empresas"""
    queryset = Empresa.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EmpresaCreateSerializer
        elif self.action == 'list':
            return EmpresaResumenSerializer
        return EmpresaSerializer
    
    @action(detail=True, methods=['get'])
    def sucursales(self, request, pk=None):
        """Obtener todas las sucursales de una empresa matriz"""
        empresa = self.get_object()
        if empresa.tipo_empresa != 'matriz':
            return Response(
                {'error': 'Esta empresa no es una matriz'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        sucursales = empresa.sucursales.filter(activa=True)
        serializer = EmpresaResumenSerializer(sucursales, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def centros_costo(self, request, pk=None):
        """Obtener centros de costo de una empresa"""
        empresa = self.get_object()
        centros = empresa.centros_costo.filter(activo=True)
        serializer = CentroCostoSerializer(centros, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def almacenes(self, request, pk=None):
        """Obtener almacenes de una empresa"""
        empresa = self.get_object()
        almacenes = empresa.almacenes.filter(activo=True)
        serializer = AlmacenSerializer(almacenes, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def usuarios(self, request, pk=None):
        """Obtener usuarios asignados a una empresa"""
        empresa = self.get_object()
        usuarios = empresa.usuarios_asignados.filter(activo=True)
        serializer = UsuarioEmpresaSerializer(usuarios, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def asignar_usuario(self, request, pk=None):
        """Asignar usuario a empresa"""
        empresa = self.get_object()
        serializer = UsuarioEmpresaCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            # Verificar si el usuario ya está asignado
            usuario = serializer.validated_data['usuario']
            if UsuarioEmpresa.objects.filter(usuario=usuario, empresa=empresa).exists():
                return Response(
                    {'error': 'El usuario ya está asignado a esta empresa'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer.save(empresa=empresa)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CentroCostoViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de Centros de Costo"""
    serializer_class = CentroCostoSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = CentroCosto.objects.all()
    
    def get_queryset(self):
        queryset = CentroCosto.objects.all()
        empresa_id = self.request.query_params.get('empresa_id')
        if empresa_id:
            queryset = queryset.filter(empresa_id=empresa_id)
        return queryset.filter(activo=True)

class AlmacenViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de Almacenes"""
    serializer_class = AlmacenSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Almacen.objects.all()
    
    def get_queryset(self):
        queryset = Almacen.objects.all()
        empresa_id = self.request.query_params.get('empresa_id')
        if empresa_id:
            queryset = queryset.filter(empresa_id=empresa_id)
        return queryset.filter(activo=True)

class ConfiguracionEmpresaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de Configuraciones de Empresa"""
    serializer_class = ConfiguracionEmpresaSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = ConfiguracionEmpresa.objects.all()
    
    def get_queryset(self):
        queryset = ConfiguracionEmpresa.objects.all()
        empresa_id = self.request.query_params.get('empresa_id')
        if empresa_id:
            queryset = queryset.filter(empresa_id=empresa_id)
        return queryset

class UsuarioEmpresaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de asignaciones Usuario-Empresa"""
    serializer_class = UsuarioEmpresaSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = UsuarioEmpresa.objects.all()
    
    def get_queryset(self):
        queryset = UsuarioEmpresa.objects.all()
        empresa_id = self.request.query_params.get('empresa_id')
        usuario_id = self.request.query_params.get('usuario_id')
        
        if empresa_id:
            queryset = queryset.filter(empresa_id=empresa_id)
        if usuario_id:
            queryset = queryset.filter(usuario_id=usuario_id)
            
        return queryset.filter(activo=True)
    
    @action(detail=False, methods=['get'])
    def mis_empresas(self, request):
        """Obtener empresas del usuario actual"""
        usuario = request.user
        asignaciones = UsuarioEmpresa.objects.filter(usuario=usuario, activo=True)
        serializer = self.get_serializer(asignaciones, many=True)
        return Response(serializer.data)
