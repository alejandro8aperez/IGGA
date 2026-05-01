from rest_framework import permissions

class HasRolePermission(permissions.BasePermission):
    """
    Permiso base que verifica si el usuario pertenece a uno de los grupos (roles) permitidos.
    """
    allowed_roles = []

    def has_permission(self, request, view):
        # Si no hay roles definidos, denegar
        if not self.allowed_roles:
            return False
            
        # Superusuarios tienen acceso a todo
        if request.user and request.user.is_superuser:
            return True
            
        # Verificar si el usuario está autenticado y pertenece a un grupo permitido
        if request.user and request.user.is_authenticated:
            # Comprobar si el usuario tiene alguno de los roles requeridos
            user_groups = request.user.groups.values_list('name', flat=True)
            return any(role in user_groups for role in self.allowed_roles)
            
        return False


# --- Permisos Específicos por Módulo ---

class IsInventarioUser(HasRolePermission):
    """Acceso al módulo de Inventarios"""
    allowed_roles = ['Administrador', 'Inventario', 'Produccion', 'Compras']

class IsComprasUser(HasRolePermission):
    """Acceso al módulo de Compras"""
    allowed_roles = ['Administrador', 'Compras', 'Inventario']

class IsProduccionUser(HasRolePermission):
    """Acceso al módulo de Producción"""
    allowed_roles = ['Administrador', 'Produccion', 'Ingenieria']

class IsIngenieriaUser(HasRolePermission):
    """Acceso a KAVE y MRP avanzado"""
    allowed_roles = ['Administrador', 'Ingenieria', 'Produccion']

class IsContabilidadUser(HasRolePermission):
    """Acceso a finanzas y contabilidad"""
    allowed_roles = ['Administrador', 'Contabilidad', 'Gerencia']

class IsGerenciaUser(HasRolePermission):
    """Acceso a dashboards gerenciales y configuraciones sensibles"""
    allowed_roles = ['Administrador', 'Gerencia']
