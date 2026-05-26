import axios from 'axios';
import { API as ENDPOINTS } from '@/config/api';

// ─────────────────────────────────────────────────────────────────────────────
// Cliente axios con token JWT
// ─────────────────────────────────────────────────────────────────────────────

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Interceptor JWT
// ─────────────────────────────────────────────────────────────────────────────

API.interceptors.request.use(config => {

  const token = localStorage.getItem('access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;

});

// ─────────────────────────────────────────────────────────────────────────────
// Helper DRF
// ─────────────────────────────────────────────────────────────────────────────

const toArray = (data) => {

  if (Array.isArray(data)) return data;

  if (data && Array.isArray(data.results)) {
    return data.results;
  }

  return [];

};

// ─────────────────────────────────────────────────────────────────────────────
// OBRAS
// ─────────────────────────────────────────────────────────────────────────────

export const obraService = {

  list: (params) =>
    API.get(
      ENDPOINTS.INFORME_DIARIO.OBRAS,
      { params }
    ).then(r => toArray(r.data)),

  create: (data) =>
    API.post(
      ENDPOINTS.INFORME_DIARIO.OBRAS,
      data
    ).then(r => r.data),

  update: (id, data) =>
    API.patch(
      `${ENDPOINTS.INFORME_DIARIO.OBRAS}${id}/`,
      data
    ).then(r => r.data),

  delete: (id) =>
    API.delete(
      `${ENDPOINTS.INFORME_DIARIO.OBRAS}${id}/`
    ),
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORÍAS DE RECURSOS
// ─────────────────────────────────────────────────────────────────────────────

export const categoriaRecursoService = {

  list: (params) =>
    API.get(
      ENDPOINTS.INFORME_DIARIO.CATEGORIAS_RECURSOS,
      { params }
    ).then(r => toArray(r.data)),

  create: (data) =>
    API.post(
      ENDPOINTS.INFORME_DIARIO.CATEGORIAS_RECURSOS,
      data
    ).then(r => r.data),

  update: (id, data) =>
    API.patch(
      `${ENDPOINTS.INFORME_DIARIO.CATEGORIAS_RECURSOS}${id}/`,
      data
    ).then(r => r.data),

  delete: (id) =>
    API.delete(
      `${ENDPOINTS.INFORME_DIARIO.CATEGORIAS_RECURSOS}${id}/`
    ),
};

// ─────────────────────────────────────────────────────────────────────────────
// RECURSOS
// ─────────────────────────────────────────────────────────────────────────────

export const recursoService = {

  list: (params) =>
    API.get(
      ENDPOINTS.INFORME_DIARIO.RECURSOS,
      { params }
    ).then(r => toArray(r.data)),

  create: (data) =>
    API.post(
      ENDPOINTS.INFORME_DIARIO.RECURSOS,
      data
    ).then(r => r.data),

  update: (id, data) =>
    API.patch(
      `${ENDPOINTS.INFORME_DIARIO.RECURSOS}${id}/`,
      data
    ).then(r => r.data),

  delete: (id) =>
    API.delete(
      `${ENDPOINTS.INFORME_DIARIO.RECURSOS}${id}/`
    ),
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORÍAS DE ACTIVIDADES
// ─────────────────────────────────────────────────────────────────────────────

export const categoriaService = {

  list: (params) =>
    API.get(
      ENDPOINTS.INFORME_DIARIO.CATEGORIAS_ACTIVIDADES,
      { params }
    ).then(r => toArray(r.data)),

  create: (data) =>
    API.post(
      ENDPOINTS.INFORME_DIARIO.CATEGORIAS_ACTIVIDADES,
      data
    ).then(r => r.data),

  update: (id, data) =>
    API.patch(
      `${ENDPOINTS.INFORME_DIARIO.CATEGORIAS_ACTIVIDADES}${id}/`,
      data
    ).then(r => r.data),

  delete: (id) =>
    API.delete(
      `${ENDPOINTS.INFORME_DIARIO.CATEGORIAS_ACTIVIDADES}${id}/`
    ),
};

// ─────────────────────────────────────────────────────────────────────────────
// INFORMES DIARIOS
// ─────────────────────────────────────────────────────────────────────────────

export const informeDiarioService = {

  list: (params) =>
    API.get(
      ENDPOINTS.INFORME_DIARIO.INFORMES,
      { params }
    ).then(r => toArray(r.data)),

  get: (id) =>
    API.get(
      `${ENDPOINTS.INFORME_DIARIO.INFORMES}${id}/`
    ).then(r => r.data),

  create: (data) =>
    API.post(
      ENDPOINTS.INFORME_DIARIO.INFORMES,
      data
    ).then(r => r.data),

  update: (id, data) =>
    API.patch(
      `${ENDPOINTS.INFORME_DIARIO.INFORMES}${id}/`,
      data
    ).then(r => r.data),

  delete: (id) =>
    API.delete(
      `${ENDPOINTS.INFORME_DIARIO.INFORMES}${id}/`
    ),

  pdfUrl: (id) =>
    `${ENDPOINTS.INFORME_DIARIO.INFORMES}${id}/exportar-pdf/`,

  excelUrl: (id) =>
    `${ENDPOINTS.INFORME_DIARIO.INFORMES}${id}/exportar-excel/`,

  subirAnexo: (id, formData) =>
    API.post(
      `${ENDPOINTS.INFORME_DIARIO.INFORMES}${id}/subir-anexo/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    ).then(r => r.data),
};

// ─────────────────────────────────────────────────────────────────────────────
// ANEXOS / FOTOS
// ─────────────────────────────────────────────────────────────────────────────

export const anexoService = {

  list: (params) =>
    API.get(
      ENDPOINTS.INFORME_DIARIO.ANEXOS,
      { params }
    ).then(r => toArray(r.data)),

  delete: (id) =>
    API.delete(
      `${ENDPOINTS.INFORME_DIARIO.ANEXOS}${id}/`
    ),
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

export const dashboardService = {

  resumen: (params) =>
    API.get(
      ENDPOINTS.INFORME_DIARIO.DASHBOARD_RESUMEN,
      { params }
    ).then(r => r.data),

  lluvia: (params) =>
    API.get(
      ENDPOINTS.INFORME_DIARIO.DASHBOARD_LLUVIA,
      { params }
    ).then(r => r.data),

  personal: (params) =>
    API.get(
      ENDPOINTS.INFORME_DIARIO.DASHBOARD_PERSONAL,
      { params }
    ).then(r => r.data),

  // ✅ NUEVO
  statusCounts: (params) =>
    API.get(
      ENDPOINTS.INFORME_DIARIO.STATUS_COUNTS,
      { params }
    ).then(r => r.data),
};

// ─────────────────────────────────────────────────────────────────────────────
// Upload genérico
// ─────────────────────────────────────────────────────────────────────────────

export const uploadFile = async (file) => {

  const formData = new FormData();

  formData.append('file', file);

  const r = await API.post(
    '/upload/',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return {
    file_url: r.data.url,
  };
};

export default API;
