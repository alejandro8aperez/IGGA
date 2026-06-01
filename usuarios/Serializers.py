from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import PerfilUsuario, Rol, PermisoModulo


class PermisoModuloSerializer(serializers.ModelSerializer):
    class Meta:
        model  = PermisoModulo
        fields = ['id', 'modulo', 'nivel']


class RolSerializer(serializers.ModelSerializer):
    permisos = PermisoModuloSerializer(many=True, read_only=True)

    class Meta:
        model  = Rol
        fields = ['id', 'nombre', 'descripcion', 'permisos', 'creado_en']


class RolWriteSerializer(serializers.ModelSerializer):
    permisos = PermisoModuloSerializer(many=True)

    class Meta:
        model  = Rol
        fields = ['id', 'nombre', 'descripcion', 'permisos']

    def create(self, validated_data):
        permisos_data = validated_data.pop('permisos', [])
        rol = Rol.objects.create(**validated_data)
        for p in permisos_data:
            PermisoModulo.objects.create(rol=rol, **p)
        return rol

    def update(self, instance, validated_data):
        permisos_data = validated_data.pop('permisos', [])
        instance.nombre      = validated_data.get('nombre', instance.nombre)
        instance.descripcion = validated_data.get('descripcion', instance.descripcion)
        instance.save()
        instance.permisos.all().delete()
        for p in permisos_data:
            PermisoModulo.objects.create(rol=instance, **p)
        return instance


class PerfilUsuarioSerializer(serializers.ModelSerializer):
    rol_nombre = serializers.CharField(source='rol.nombre', read_only=True)

    class Meta:
        model  = PerfilUsuario
        fields = ['id', 'rol', 'rol_nombre', 'cargo', 'telefono',
                  'foto', 'empresa', 'activo', 'creado_en', 'actualizado']


class UsuarioSerializer(serializers.ModelSerializer):
    perfil     = PerfilUsuarioSerializer(read_only=True)
    password   = serializers.CharField(write_only=True, required=False)
    rol        = serializers.PrimaryKeyRelatedField(
                     queryset=Rol.objects.all(), write_only=True, required=False)
    cargo      = serializers.CharField(write_only=True, required=False)
    telefono   = serializers.CharField(write_only=True, required=False)
    empresa    = serializers.CharField(write_only=True, required=False)

    class Meta:
        model  = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email',
                  'is_active', 'is_staff', 'date_joined',
                  'password', 'perfil', 'rol', 'cargo', 'telefono', 'empresa']
        read_only_fields = ['date_joined']

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        perfil_fields = {k: validated_data.pop(k, None)
                         for k in ['rol', 'cargo', 'telefono', 'empresa']}
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        PerfilUsuario.objects.create(
            user=user,
            rol=perfil_fields.get('rol'),
            cargo=perfil_fields.get('cargo') or '',
            telefono=perfil_fields.get('telefono') or '',
            empresa=perfil_fields.get('empresa') or '',
        )
        return user

    def update(self, instance, validated_data):
        perfil_fields = {k: validated_data.pop(k, None)
                         for k in ['rol', 'cargo', 'telefono', 'empresa']}
        password = validated_data.pop('password', None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        if password:
            instance.set_password(password)
        instance.save()
        perfil, _ = PerfilUsuario.objects.get_or_create(user=instance)
        if perfil_fields.get('rol') is not None:
            perfil.rol = perfil_fields['rol']
        if perfil_fields.get('cargo') is not None:
            perfil.cargo = perfil_fields['cargo']
        if perfil_fields.get('telefono') is not None:
            perfil.telefono = perfil_fields['telefono']
        if perfil_fields.get('empresa') is not None:
            perfil.empresa = perfil_fields['empresa']
        perfil.save()
        return instance


class CambiarPasswordSerializer(serializers.Serializer):
    password_actual = serializers.CharField(required=True)
    password_nuevo  = serializers.CharField(required=True)

    def validate_password_nuevo(self, value):
        validate_password(value)
        return value


class MiPerfilSerializer(serializers.ModelSerializer):
    perfil          = PerfilUsuarioSerializer()
    nombre_completo = serializers.SerializerMethodField()
    permisos        = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email',
                  'is_staff', 'is_superuser', 'nombre_completo', 'perfil', 'permisos']

    def get_nombre_completo(self, obj):
        return obj.get_full_name() or obj.username

    def get_permisos(self, obj):
        try:
            if obj.is_superuser:
                return {m[0]: 'admin' for m in PermisoModulo.MODULOS}
            rol = obj.perfil.rol
            if not rol:
                return {}
            return {p.modulo: p.nivel for p in rol.permisos.all()}
        except Exception:
            return {}
