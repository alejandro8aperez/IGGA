// =============================================================================
// axiosConfig.js — ERP 8AMPERIOS
// Configuracion global de axios: baseURL, headers, interceptores de request.
// El manejo del 401 con refresh de token esta en AuthContext.jsx.
// Importar este archivo UNA vez en App.jsx o main.jsx: import './config/axiosConfig';
// =============================================================================
import axios from 'axios';

const DEFAULT_LOCAL_URL = 'http://localhost:8000/api';

let BASE_URL =
    import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? DEFAULT_LOCAL_URL
        : `${window.location.origin}/api`);

/**
 * Normalizacion critica: Asegura que la baseURL siempre termine en /api/
 * para que las peticiones relativas (ej: 'token/') no causen un 404.
 */
const cleanBaseUrl = BASE_URL.replace(/\/+$/, '').replace(/\/api$/, '');
axios.defaults.baseURL = `${cleanBaseUrl}/api/`;

// Log para verificar en la consola de Render/Navegador
console.log(`[ERP] Axios BaseURL: ${axios.defaults.baseURL}`);

if (import.meta.env.MODE === 'production') {
    console.log(`[ERP] Conectando al Backend en: ${axios.defaults.baseURL}`);
}

// Aumentar timeout a 60s para soportar el "cold start" de Render Free Tier
axios.defaults.timeout = 60000; 

axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// ─── Interceptor de REQUEST ───────────────────────────────────────────────────
// Adjunta el token JWT a cada peticion si existe en localStorage.
axios.interceptors.request.use(
    (config) => {
        config.timeout = 60000;
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
                    console.error('[ERP] Error al recuperar datos de sesion:', e);
                }
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Interceptor de RESPONSE ──────────────────────────────────────────────────
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        if (status === 403) {
            console.warn('[ERP] Acceso denegado (403):', error.config?.url);
        } else if (status === 500) {
            console.error('[ERP] Error del servidor (500) en:', error.config?.url);
        } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            console.error('[ERP] Timeout en:', error.config?.url);
        } else if (!error.response) {
            console.error('[ERP] Sin conexion con el backend:', error.config?.url);
        }
        return Promise.reject(error);
    }
);

// ═══════════════════════════════════════════════════════════════════════════════
//  HELPERS PARA CONSTRUIR URLs CORRECTAS (usar en todos los modulos)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Construye una URL completa para un endpoint de la API.
 * Ejemplo: apiUrl('inventarios/productos/') -> https://.../api/inventarios/productos/
 */
export function apiUrl(endpoint) {
    // Eliminar slash inicial si existe
    const cleanEndpoint = endpoint.replace(/^\//, '');
    return `${axios.defaults.baseURL}${cleanEndpoint}`;
}

/**
 * Devuelve la base URL del backend (sin /api/)
 * Ejemplo: getBaseUrl() -> https://erp-backend-a37b.onrender.com
 */
export function getBaseUrl() {
    return axios.defaults.baseURL.replace(/\/api\/$/, '');
}

/**
 * Devuelve la base URL de la API (con /api/)
 * Ejemplo: getApiBaseUrl() -> https://erp-backend-a37b.onrender.com/api/
 */
export function getApiBaseUrl() {
    return axios.defaults.baseURL;
}

export default axios;
