from django.contrib import admin
from .models import PerfilUsuario, Rol, PermisoModulo


class PermisoModuloInline(admin.TabularInline):
    model  = PermisoModulo
    extra  = 0


@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'descripcion', 'creado_en']
    inlines      = [PermisoModuloInline]


@admin.register(PerfilUsuario)
class PerfilUsuarioAdmin(admin.ModelAdmin):
    list_display  = ['user', 'cargo', 'empresa', 'rol', 'activo']
    list_filter   = ['activo', 'rol', 'cargo']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'empresa']
