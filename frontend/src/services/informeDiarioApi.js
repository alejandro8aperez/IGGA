import axios from 'axios';
import { API as ENDPOINTS } from '@/config/api';

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANTE: No crear instancia propia de axios.
// Usamos el axios global que ya tiene baseURL='/api/' y token JWT
// configurados en axiosConfig.js (importado en App.jsx).
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Helper DRF
// ─────────────────────────────────────────────────────────────────────────────

const toArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

// ─────────────────────────────────────────────────────────────────────────────
// OBRAS
// ─────────────────────────────────────────────────────────────────────────────

export const obraService = {
  list:   (params) => axios.get(ENDPOINTS.INFORME_DIARIO.OBRAS, { params }).then(r => toArray(r.data)),
  create: (data)   => axios.post(ENDPOINTS.INFORME_DIARIO.OBRAS, data).then(r => r.data),
  update: (id, data) => axios.patch(`${ENDPOINTS.INFORME_DIARIO.OBRAS}${id}/`, data).then(r => r.data),
  delete: (id)     => axios.delete(`${ENDPOINTS.INFORME_DIARIO.OBRAS}${id}/`),
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORÍAS DE RECURSOS
// ─────────────────────────────────────────────────────────────────────────────

export const categoriaRecursoService = {
  list:   (params) => axios.get(ENDPOINTS.INFORME_DIARIO.CATEGORIAS_RECURSOS, { params }).then(r => toArray(r.data)),
  create: (data)   => axios.post(ENDPOINTS.INFORME_DIARIO.CATEGORIAS_RECURSOS, data).then(r => r.data),
  update: (id, data) => axios.patch(`${ENDPOINTS.INFORME_DIARIO.CATEGORIAS_RECURSOS}${id}/`, data).then(r => r.data),
  delete: (id)     => axios.delete(`${ENDPOINTS.INFORME_DIARIO.CATEGORIAS_RECURSOS}${id}/`),
};

// ─────────────────────────────────────────────────────────────────────────────
// RECURSOS
// ─────────────────────────────────────────────────────────────────────────────

export const recursoService = {
  list:   (params) => axios.get(ENDPOINTS.INFORME_DIARIO.RECURSOS, { params }).then(r => toArray(r.data)),
  create: (data)   => axios.post(ENDPOINTS.INFORME_DIARIO.RECURSOS, data).then(r => r.data),
  update: (id, data) => axios.patch(`${ENDPOINTS.INFORME_DIARIO.RECURSOS}${id}/`, data).then(r => r.data),
  delete: (id)     => axios.delete(`${ENDPOINTS.INFORME_DIARIO.RECURSOS}${id}/`),
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORÍAS DE ACTIVIDADES
// ─────────────────────────────────────────────────────────────────────────────

export const categoriaService = {
  list:   (params) => axios.get(ENDPOINTS.INFORME_DIARIO.CATEGORIAS_ACTIVIDADES, { params }).then(r => toArray(r.data)),
  create: (data)   => axios.post(ENDPOINTS.INFORME_DIARIO.CATEGORIAS_ACTIVIDADES, data).then(r => r.data),
  update: (id, data) => axios.patch(`${ENDPOINTS.INFORME_DIARIO.CATEGORIAS_ACTIVIDADES}${id}/`, data).then(r => r.data),
  delete: (id)     => axios.delete(`${ENDPOINTS.INFORME_DIARIO.CATEGORIAS_ACTIVIDADES}${id}/`),
};

// ─────────────────────────────────────────────────────────────────────────────
// INFORMES DIARIOS
// ─────────────────────────────────────────────────────────────────────────────

export const informeDiarioService = {
  list:   (params) => axios.get(ENDPOINTS.INFORME_DIARIO.INFORMES, { params }).then(r => toArray(r.data)),
  get:    (id)     => axios.get(`${ENDPOINTS.INFORME_DIARIO.INFORMES}${id}/`).then(r => r.data),
  create: (data)   => axios.post(ENDPOINTS.INFORME_DIARIO.INFORMES, data).then(r => r.data),
  update: (id, data) => axios.patch(`${ENDPOINTS.INFORME_DIARIO.INFORMES}${id}/`, data).then(r => r.data),
  delete: (id)     => axios.delete(`${ENDPOINTS.INFORME_DIARIO.INFORMES}${id}/`),

  pdfUrl:   (id) => `${ENDPOINTS.INFORME_DIARIO.INFORMES}${id}/exportar-pdf/`,
  excelUrl: (id) => `${ENDPOINTS.INFORME_DIARIO.INFORMES}${id}/exportar-excel/`,

  subirAnexo: (id, formData) =>
    axios.post(
      `${ENDPOINTS.INFORME_DIARIO.INFORMES}${id}/subir-anexo/`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ).then(r => r.data),
};

// ─────────────────────────────────────────────────────────────────────────────
// ANEXOS / FOTOS
// ─────────────────────────────────────────────────────────────────────────────

export const anexoService = {
  list:   (params) => axios.get(ENDPOINTS.INFORME_DIARIO.ANEXOS, { params }).then(r => toArray(r.data)),
  delete: (id)     => axios.delete(`${ENDPOINTS.INFORME_DIARIO.ANEXOS}${id}/`),
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

export const dashboardService = {
  resumen:      (params) => axios.get(ENDPOINTS.INFORME_DIARIO.DASHBOARD,      { params }).then(r => r.data),
  statusCounts: (params) => axios.get(ENDPOINTS.INFORME_DIARIO.STATUS_COUNTS,  { params }).then(r => r.data),
};

// ─────────────────────────────────────────────────────────────────────────────
// Upload genérico
// ─────────────────────────────────────────────────────────────────────────────

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const r = await axios.post('upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return { file_url: r.data.url };
};

export default axios;
