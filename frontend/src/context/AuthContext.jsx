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

    // Decodifica el payload de un JWT (sin verificar firma) y devuelve true si está vencido.
    // Si el token está malformado o no tiene 'exp', se considera inválido.
    const isJwtExpired = (token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (!payload.exp) return true;
            // Margen de 10s para evitar fallos por desfase de reloj
            return payload.exp * 1000 < (Date.now() + 10000);
        } catch {
            return true;
        }
    };

    // Intenta refrescar el access token usando el refresh token guardado.
    // Devuelve el usuario actualizado o null si falla.
    const tryRefreshSilently = async (parsedUser) => {
        if (!parsedUser?.refresh) return null;
        try {
            const cleanAxios = axios.create({ baseURL: axios.defaults.baseURL });
            const { data } = await cleanAxios.post('token/refresh/', {
                refresh: parsedUser.refresh,
            });
            const updatedUser = { ...parsedUser, access: data.access };
            localStorage.setItem('erpUser', JSON.stringify(updatedUser));
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
            return updatedUser;
        } catch {
            return null;
        }
    };

    useEffect(() => {
        let cancelled = false;

        // =====================================================================
        // Inicialización con VALIDACIÓN real del JWT.
        // Antes solo leía localStorage y daba por bueno el token, lo que dejaba
        // al usuario en "limbo" (autenticado pero sin acceso a APIs) cuando el
        // token expiraba o el backend reiniciaba con SECRET_KEY distinta.
        // =====================================================================
        const init = async () => {
            try {
                const savedUser = localStorage.getItem('erpUser');
                if (!savedUser || savedUser === 'undefined') {
                    if (!cancelled) setLoading(false);
                    return;
                }

                const parsedUser = JSON.parse(savedUser);
                if (!parsedUser?.access) {
                    localStorage.removeItem('erpUser');
                    if (!cancelled) setLoading(false);
                    return;
                }

                // ¿El access token sigue vigente?
                if (!isJwtExpired(parsedUser.access)) {
                    if (!cancelled) {
                        setUser(parsedUser);
                        axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.access}`;
                    }
                } else {
                    // Access expirado → intentar refresh silencioso
                    const refreshed = await tryRefreshSilently(parsedUser);
                    if (refreshed && !cancelled) {
                        setUser(refreshed);
                    } else {
                        // No hay forma de recuperarse → limpiar todo y forzar login
                        console.warn('[ERP] Sesión expirada — redirigiendo al login.');
                        localStorage.removeItem('erpUser');
                        delete axios.defaults.headers.common['Authorization'];
                    }
                }
            } catch (err) {
                console.warn('[ERP] Error restaurando sesión:', err);
                localStorage.removeItem('erpUser');
                delete axios.defaults.headers.common['Authorization'];
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        init();

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
        // (setLoading(false) ya se hizo en init() arriba)

        return () => {
            cancelled = true;
            axios.interceptors.response.eject(interceptor);
        };
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
