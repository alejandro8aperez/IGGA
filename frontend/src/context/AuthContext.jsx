import { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// =============================================================================
// Permisos por rol — qué módulos puede ver cada cargo
// =============================================================================
export const PERMISOS_ROL = {
    Administrador: '*',
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
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    // Refs para manejar múltiples peticiones simultáneas que fallen con 401
    const isRefreshing = useRef(false);
    const failedQueue  = useRef([]);

    const processQueue = (error, token = null) => {
        failedQueue.current.forEach(({ resolve, reject }) => {
            if (error) reject(error);
            else resolve(token);
        });
        failedQueue.current = [];
    };

    const logoutUser = () => {
        setUser(null);
        localStorage.removeItem('erpUser');
        delete axios.defaults.headers.common['Authorization'];
    };

    useEffect(() => {
        // Restaurar sesión desde localStorage al montar
        const savedUser = localStorage.getItem('erpUser');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                // Si el token parece muy antiguo o faltan campos, forzar login
                if (!parsedUser.access || !parsedUser.refresh) {
                    logoutUser();
                } else {
                    // Verificar si el token no es un string "undefined" accidental
                    if (parsedUser.access !== "undefined" && parsedUser.access !== null) {
                        setUser(parsedUser);
                        axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.access}`;
                    } else {
                        logoutUser();
                    }
                }
            } catch {
                logoutUser();
            }
        }

        // =====================================================================
        // INTERCEPTOR DE RESPUESTA con refresh automático de token
        // Flujo:
        //   1. Petición falla con 401
        //   2. Intentamos POST /api/auth/token/refresh/ con el refresh token
        //   3. Si funciona → guardamos el nuevo access token y reintentamos
        //   4. Si falla   → logout y el usuario vuelve al login
        //
        // Las peticiones que llegan mientras el refresh está en curso se encolan
        // y se resuelven/rechazan cuando el refresh termina (failedQueue).
        // =====================================================================
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // Solo actuar en 401; evitar bucle con _retry
                if (error.response?.status === 401 && !originalRequest._retry) {

                    // Si ya hay un refresh en progreso, encolar esta petición
                    if (isRefreshing.current) {
                        return new Promise((resolve, reject) => {
                            failedQueue.current.push({ resolve, reject });
                        }).then((token) => {
                            originalRequest.headers['Authorization'] = `Bearer ${token}`;
                            return axios(originalRequest);
                        }).catch((err) => Promise.reject(err));
                    }

                    originalRequest._retry    = true;
                    isRefreshing.current      = true;

                    try {
                        const savedUser     = localStorage.getItem('erpUser');
                        const parsedUser    = savedUser ? JSON.parse(savedUser) : null;
                        const refreshToken  = parsedUser?.refresh;

                        if (!refreshToken) throw new Error('Sin refresh token');

                        // Petición de refresco usando ruta relativa para respetar el /api/ del baseURL
                        const cleanAxios = axios.create({ baseURL: axios.defaults.baseURL });
                        const { data } = await cleanAxios.post('token/refresh/', { refresh: refreshToken });

                        // Persistir el nuevo access token
                        const updatedUser = { ...parsedUser, access: data.access };
                        localStorage.setItem('erpUser', JSON.stringify(updatedUser));
                        axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
                        originalRequest.headers['Authorization']       = `Bearer ${data.access}`;
                        setUser(updatedUser);

                        processQueue(null, data.access);
                        return axios(originalRequest);

                    } catch (refreshError) {
                        processQueue(refreshError, null);
                        console.warn('[ERP] Refresh token inválido o expirado. Cerrando sesión.');
                        logoutUser();
                        return Promise.reject(refreshError);

                    } finally {
                        isRefreshing.current = false;
                    }
                }

                return Promise.reject(error);
            }
        );

        // Liberar pantalla de carga una vez configurado todo
        setLoading(false);

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
