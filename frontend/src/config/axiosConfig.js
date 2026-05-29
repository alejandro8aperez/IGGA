// =============================================================================
// axiosConfig.js — ERP 8AMPERIOS
// Configuración global de axios: baseURL, headers, interceptores de request.
// El manejo del 401 con refresh de token está en AuthContext.jsx.
// Importar este archivo UNA vez en App.jsx o main.jsx: import './config/axiosConfig';
// =============================================================================
import axios from 'axios';

const DEFAULT_LOCAL_URL = 'http://localhost:8000/api';

let BASE_URL =
    import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? DEFAULT_LOCAL_URL
        : `${window.location.origin}/api`);

// Asegurar que la baseURL de Axios siempre apunte al prefijo /api para evitar 404 en producción
if (BASE_URL && !BASE_URL.toLowerCase().endsWith('/api') && !BASE_URL.toLowerCase().endsWith('/api/')) {
    BASE_URL = BASE_URL.endsWith('/') ? `${BASE_URL}api` : `${BASE_URL}/api`;
}

const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

axios.defaults.baseURL = cleanBaseUrl;

// Aumentar timeout a 60s para soportar el "cold start" de Render Free Tier
axios.defaults.timeout = 60000; 

axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// ─── Interceptor de REQUEST ───────────────────────────────────────────────────
// Adjunta el token JWT a cada petición si existe en localStorage.
// Esto cubre el caso en que axios.defaults.headers no esté seteado todavía
// (por ejemplo al recargar la página antes de que AuthContext se monte).
axios.interceptors.request.use(
    (config) => {
        // FORZADO: Sobreescribir cualquier timeout local (como los 10s del POS)
        // para dar tiempo a Render de iniciar el servicio.
        config.timeout = 60000;

        // No sobreescribir si ya viene con Authorization (lo puso AuthContext)
        // Y NO adjuntar en peticiones de login o refresh para evitar conflictos
        const isAuthRequest = config.url.includes('token/');

        if (!config.headers.Authorization && !isAuthRequest) {
            const userData = localStorage.getItem('erpUser');
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    const token = user.access || user.token;
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                } catch (e) {
                    // Error al parsear el JSON o acceso a localStorage.
                    // Evitamos el borrado automático para que AuthContext decida el flujo.
                    console.error('[ERP] Error al recuperar datos de sesión:', e);
                }
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Interceptor de RESPONSE ──────────────────────────────────────────────────
// SOLO maneja errores que NO son 401.
// El 401 lo gestiona AuthContext.jsx con lógica de refresh de token.
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 403) {
            // Sin permisos — no redirigir, dejar que el componente lo maneje
            console.warn('[ERP] Acceso denegado (403):', error.config?.url);
        } else if (status === 500) {
            console.error('[ERP] Error del servidor (500) en:', error.config?.url);
            if (error.response?.data) {
                console.error('[ERP] Detalle del error:', error.response.data);
            }
        } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            // Error específico de tiempo de espera excedido
            console.error('[ERP] Tiempo de espera agotado (Timeout). El servidor de Render podría estar despertando:', error.config?.url);
        } else if (!error.response) {
            // Sin conexión con el backend
            console.error('[ERP] Sin conexión con el backend (Network Error):', error.config?.url);
        }

        // IMPORTANTE: No manejar el 401 aquí.
        // AuthContext.jsx tiene el interceptor con refresh que lo captura primero.
        return Promise.reject(error);
    }
);

export default axios;
