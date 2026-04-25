import { createContext, useContext, useState, useEffect } from 'react';

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

    useEffect(() => {
        const savedUser = localStorage.getItem('erpUser');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('erpUser');
            }
        }
        setLoading(false);
    }, []);

    const loginUser = (userData) => {
        setUser(userData);
        localStorage.setItem('erpUser', JSON.stringify(userData));
    };

    const logoutUser = () => {
        setUser(null);
        localStorage.removeItem('erpUser');
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
