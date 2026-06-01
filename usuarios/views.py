from django.contrib.auth.models import User
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import PerfilUsuario, Rol, PermisoModulo
from .serializers import (
    UsuarioSerializer, RolSerializer, RolWriteSerializer,
    CambiarPasswordSerializer, MiPerfilSerializer, PerfilUsuarioSerializer,
)


class EsSuperuserOAdmin(permissions.BasePermission):
    """Solo superusers o usuarios con rol admin pueden gestionar usuarios."""
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True
        try:
            return request.user.perfil.tiene_acceso('usuarios', 'admin')
        except Exception:
            return False


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset           = User.objects.select_related('perfil__rol').all().order_by('username')
    serializer_class   = UsuarioSerializer

    def get_permissions(self):
        if self.action in ['me', 'cambiar_password', 'subir_foto']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), EsSuperuserOAdmin()]

    # ── GET /api/usuarios/me/ ──────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        serializer = MiPerfilSerializer(request.user)
        return Response(serializer.data)

    # ── POST /api/usuarios/me/cambiar_password/ ───────────────────────
    @action(detail=False, methods=['post'], url_path='me/cambiar_password')
    def cambiar_password(self, request):
        serializer = CambiarPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data['password_actual']):
            return Response({'error': 'Contraseña actual incorrecta.'},
                            status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['password_nuevo'])
        user.save()
        return Response({'mensaje': 'Contraseña actualizada correctamente.'})

    # ── POST /api/usuarios/{id}/activar/ ──────────────────────────────
    @action(detail=True, methods=['post'])
    def activar(self, request, pk=None):
        usuario = self.get_object()
        usuario.is_active = True
        usuario.save()
        try:
            usuario.perfil.activo = True
            usuario.perfil.save()
        except Exception:
            pass
        return Response({'mensaje': f'Usuario {usuario.username} activado.'})

    # ── POST /api/usuarios/{id}/desactivar/ ───────────────────────────
    @action(detail=True, methods=['post'])
    def desactivar(self, request, pk=None):
        usuario = self.get_object()
        if usuario == request.user:
            return Response({'error': 'No puedes desactivar tu propio usuario.'},
                            status=status.HTTP_400_BAD_REQUEST)
        usuario.is_active = False
        usuario.save()
        try:
            usuario.perfil.activo = False
            usuario.perfil.save()
        except Exception:
            pass
        return Response({'mensaje': f'Usuario {usuario.username} desactivado.'})

    # ── POST /api/usuarios/{id}/asignar_rol/ ─────────────────────────
    @action(detail=True, methods=['post'], url_path='asignar_rol')
    def asignar_rol(self, request, pk=None):
        usuario = self.get_object()
        rol_id  = request.data.get('rol_id')
        try:
            rol = Rol.objects.get(pk=rol_id)
        except Rol.DoesNotExist:
            return Response({'error': 'Rol no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        perfil, _ = PerfilUsuario.objects.get_or_create(user=usuario)
        perfil.rol = rol
        perfil.save()
        return Response({'mensaje': f'Rol "{rol.nombre}" asignado a {usuario.username}.'})

    # ── POST /api/usuarios/me/subir_foto/ ─────────────────────────────
    @action(detail=False, methods=['post'], url_path='me/subir_foto')
    def subir_foto(self, request):
        foto = request.FILES.get('foto')
        if not foto:
            return Response({'error': 'No se recibió ninguna foto.'}, status=400)
        perfil, _ = PerfilUsuario.objects.get_or_create(user=request.user)
        perfil.foto = foto
        perfil.save()
        return Response({'foto_url': request.build_absolute_uri(perfil.foto.url)})


class RolViewSet(viewsets.ModelViewSet):
    queryset         = Rol.objects.prefetch_related('permisos').all().order_by('nombre')
    permission_classes = [permissions.IsAuthenticated, EsSuperuserOAdmin]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return RolWriteSerializer
        return RolSerializer

    # ── GET /api/roles/modulos/ ───────────────────────────────────────
    @action(detail=False, methods=['get'])
    def modulos(self, request):
        return Response({
            'modulos': [{'value': m[0], 'label': m[1]} for m in PermisoModulo.MODULOS],
            'niveles': [{'value': n[0], 'label': n[1]} for n in PermisoModulo.NIVELES],
        })
