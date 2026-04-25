// =============================================================================
// axiosConfig.js — ERP 8AMPERIOS
// Configuración global de axios: interceptores, manejo de errores, token JWT
// Importar este archivo UNA vez en App.jsx o main.jsx: import './config/axiosConfig';
// =============================================================================

import axios from 'axios';

const DEFAULT_LOCAL_URL = 'http://localhost:8000/api';
const BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? DEFAULT_LOCAL_URL
    : `${window.location.origin}/api`);

const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

axios.defaults.baseURL = cleanBaseUrl;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// ─── Interceptor de REQUEST ───────────────────────────────────────────────────
// Adjunta el token JWT a cada petición si existe en localStorage
axios.interceptors.request.use(
    (config) => {
        const userData = localStorage.getItem('erpUser');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                if (user.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            } catch {
                // JSON malformado — limpiar silenciosamente
                localStorage.removeItem('erpUser');
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Interceptor de RESPONSE ──────────────────────────────────────────────────
// Maneja errores globales: token expirado, sin conexión, servidor caído
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            // Token expirado o inválido — cerrar sesión y redirigir
            localStorage.removeItem('erpUser');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        } else if (status === 403) {
            // Sin permisos — no redirigir, dejar que el componente lo maneje
            console.warn('[ERP] Acceso denegado (403):', error.config?.url);
        } else if (status === 500) {
            console.error('[ERP] Error del servidor (500):', error.config?.url);
        } else if (!error.response) {
            // Sin conexión con el backend
            console.error('[ERP] Sin conexión con el backend:', error.config?.url);
        }

        return Promise.reject(error);
    }
);

export default axios;
