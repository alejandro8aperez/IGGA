import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// =============================================================================
// Permisos por rol — qué módulos puede ver cada cargo
// =============================================================================
export const PERMISOS_ROL = {
    Administrador: '*', // acceso total
    Gerente:       ['dashboard', 'crm', 'ventas', 'compras', 'finanzas', 'contabilidad',
                    'tesoreria', 'rrhh', 'reportes', 'operaciones', 'produccion',
                    'inventario', 'logistica', 'activos', 'kave', 'multi-empresa'],
    Contador:      ['dashboard', 'contabilidad', 'finanzas', 'tesoreria', 'facturacion',
                    'reportes', 'compras'],
    'Jefe Producción': ['dashboard', 'produccion', 'mrp', 'inventario', 'compras',
                        'operaciones', 'mantenimiento', 'calidad'],
    Vendedor:      ['dashboard', 'crm', 'ventas', 'facturacion', 'inventario', 'cotizador'],
    Comprador:     ['dashboard', 'compras', 'inventario', 'proveedores'],
    Almacenista:   ['dashboard', 'inventario', 'logistica', 'compras'],
    Técnico:       ['dashboard', 'mantenimiento', 'activos', 'operaciones'],
    RH:            ['dashboard', 'rrhh', 'configuracion'],
    Planificador:  ['dashboard', 'mrp', 'produccion', 'inventario', 'operaciones'],
    Invitado:      ['dashboard'],
};

export const tienePermiso = (user, modulo) => {
    if (!user) return false;
    const permisos = PERMISOS_ROL[user.cargo];
    if (!permisos) return false;
    if (permisos === '*') return true;
    return permisos.includes(modulo);
};

// =============================================================================
// Provider
// =============================================================================
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logoutUser = () => {
        setUser(null);
        localStorage.removeItem('erpUser');
        // Limpiar el encabezado de autorización global
        delete axios.defaults.headers.common['Authorization'];
    };

    useEffect(() => {
        const savedUser = localStorage.getItem('erpUser');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                // Configurar el token para todas las peticiones futuras de Axios
                if (parsedUser.access) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.access}`;
                }
            } catch {
                logoutUser();
            }
        }
        setLoading(false);

        // INTERCEPTOR: Si recibimos un 401 (No autorizado), cerramos sesión automáticamente.
        // Esto arregla el problema de "solo funciona en modo incógnito".
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    console.warn('Sesión expirada o inválida. Limpiando datos...');
                    logoutUser();
                }
                return Promise.reject(error);
            }
        );

        // Limpiar el interceptor al desmontar el componente
        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    const loginUser = (userData) => {
        setUser(userData);
        localStorage.setItem('erpUser', JSON.stringify(userData));
        if (userData.access) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${userData.access}`;
        }
    };

    const value = {
        user,
        loginUser,
        logoutUser,
        isAuthenticated: !!user,
        loading,
        tienePermiso: (modulo) => tienePermiso(user, modulo),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
    return ctx;
}
export default AuthContext;
