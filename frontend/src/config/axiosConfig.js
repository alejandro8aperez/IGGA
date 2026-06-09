// ============================================================
//  axiosConfig.js  –  ERP-8AMPERIOS
// ============================================================
import axiosInstance from '../config/axiosConfig';

// ── Base URL ────────────────────────────────────────────────
const rawUrl = import.meta.env.VITE_API_URL || 'https://erp-backend-a37b.onrender.com/api/';
const BASE_URL = rawUrl.endsWith('/api/') ? rawUrl
               : rawUrl.endsWith('/api')  ? rawUrl + '/'
               : rawUrl.replace(/\/?$/, '/api/');

console.log('[ERP] Axios BaseURL:', BASE_URL);
console.log('[ERP] Conectando al Backend en:', BASE_URL);

// ── Instancia principal ──────────────────────────────────────
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Estado de refresco ───────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ── Logout limpio ────────────────────────────────────────────
const performLogout = () => {
  console.warn('[ERP] Refresh token inválido o expirado. Cerrando sesión.');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  if (window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
};

// ── Request interceptor ──────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ─────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ── Ignorar 401 en rutas de autenticación ──────────────
    // Un 401 en /token/ significa credenciales incorrectas, no token expirado
    const isAuthRoute = originalRequest.url?.includes('token/');
    if (isAuthRoute) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      isRefreshing = false;
      processQueue(error, null);
      performLogout();
      return Promise.reject(error);
    }

    try {
      const response = await axiosInstance.post(`${BASE_URL}token/refresh/`, {
        refresh: refreshToken,
      });

      const newAccessToken = response.data.access;
      localStorage.setItem('access_token', newAccessToken);
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      processQueue(null, newAccessToken);
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      performLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;
export { BASE_URL };
