import axiosInstance from '../config/axiosConfig';
import { API as ENDPOINTS } from '@/config/api';

export const proveedorService = {
  list: (params) => axiosInstance.get(ENDPOINTS.COMPRAS.PROVEEDORES, { params }).then(r => {
    const data = r.data;
    return Array.isArray(data) ? data : (data?.results || []);
  }),
};

const toArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

export const obraService = {
  list:   (params) => axiosInstance.get(ENDPOINTS.INFORME_DIARIO.OBRAS, { params }).then(r => toArray(r.data)),
  create: (data)   => axiosInstance.post(ENDPOINTS.INFORME_DIARIO.OBRAS, data).then(r => r.data),
  update: (id, data) => axiosInstance.patch(`${ENDPOINTS.INFORME_DIARIO.OBRAS}${id}/`, data).then(r => r.data),
  delete: (id)     => axiosInstance.delete(`${ENDPOINTS.INFORME_DIARIO.OBRAS}${id}/`),
};

export const categoriaRecursoService = {
  list:   (params) => axiosInstance.get(ENDPOINTS.INFORME_DIARIO.CATEGORIAS_RECURSOS, { params }).then(r => toArray(r.data)),
  create: (data)   => axiosInstance.post(ENDPOINTS.INFORME_DIARIO.CATEGORIAS_RECURSOS, data).then(r => r.data),
  update: (id, data) => axiosInstance.patch(`${ENDPOINTS.INFORME_DIARIO.CATEGORIAS_RECURSOS}${id}/`, data).then(r => r.data),
  delete: (id)     => axiosInstance.delete(`${ENDPOINTS.INFORME_DIARIO.CATEGORIAS_RECURSOS}${id}/`),
};

export const recursoService = {
  list:   (params) => axiosInstance.get(ENDPOINTS.INFORME_DIARIO.RECURSOS, { params }).then(r => toArray(r.data)),
  create: (data)   => axiosInstance.post(ENDPOINTS.INFORME_DIARIO.RECURSOS, data).then(r => r.data),
  update: (id, data) => axiosInstance.patch(`${ENDPOINTS.INFORME_DIARIO.RECURSOS}${id}/`, data).then(r => r.data),
  delete: (id)     => axiosInstance.delete(`${ENDPOINTS.INFORME_DIARIO.RECURSOS}${id}/`),
};

export const categoriaService = {
  list:   (params) => axiosInstance.get(ENDPOINTS.INFORME_DIARIO.CATEGORIAS_ACTIVIDADES, { params }).then(r => toArray(r.data)),
  create: (data)   => axiosInstance.post(ENDPOINTS.INFORME_DIARIO.CATEGORIAS_ACTIVIDADES, data).then(r => r.data),
  update: (id, data) => axiosInstance.patch(`${ENDPOINTS.INFORME_DIARIO.CATEGORIAS_ACTIVIDADES}${id}/`, data).then(r => r.data),
  delete: (id)     => axiosInstance.delete(`${ENDPOINTS.INFORME_DIARIO.CATEGORIAS_ACTIVIDADES}${id}/`),
};

export const informeDiarioService = {
  list:   (params) => axiosInstance.get(ENDPOINTS.INFORME_DIARIO.INFORMES, { params }).then(r => toArray(r.data)),
  get:    (id)     => axiosInstance.get(`${ENDPOINTS.INFORME_DIARIO.INFORMES}${id}/`).then(r => r.data),
  create: (data)   => axiosInstance.post(ENDPOINTS.INFORME_DIARIO.INFORMES, data).then(r => r.data),
  update: (id, data) => axiosInstance.patch(`${ENDPOINTS.INFORME_DIARIO.INFORMES}${id}/`, data).then(r => r.data),
  delete: (id)     => axiosInstance.delete(`${ENDPOINTS.INFORME_DIARIO.INFORMES}${id}/`),

  pdfUrl:   (id) => `${ENDPOINTS.INFORME_DIARIO.INFORMES}${id}/exportar-pdf/`,
  excelUrl: (id) => `${ENDPOINTS.INFORME_DIARIO.INFORMES}${id}/exportar-excel/`,

  downloadPdf: (id) => axiosInstance.get(`${ENDPOINTS.INFORME_DIARIO.INFORMES}${id}/exportar-pdf/`, { responseType: 'blob' }).then(r => r.data),
  downloadExcel: (id) => axiosInstance.get(`${ENDPOINTS.INFORME_DIARIO.INFORMES}${id}/exportar-excel/`, { responseType: 'blob' }).then(r => r.data),

  subirAnexo: (id, formData) =>
    axiosInstance.post(
      `${ENDPOINTS.INFORME_DIARIO.INFORMES}${id}/subir-anexo/`,
      formData,
    ).then(r => r.data),
};

export const anexoService = {
  list:   (params) => axiosInstance.get(ENDPOINTS.INFORME_DIARIO.ANEXOS, { params }).then(r => toArray(r.data)),
  delete: (id)     => axiosInstance.delete(`${ENDPOINTS.INFORME_DIARIO.ANEXOS}${id}/`),
};

export const dashboardService = {
  resumen:      (params) => axiosInstance.get(ENDPOINTS.INFORME_DIARIO.DASHBOARD,     { params }).then(r => r.data),
  statusCounts: (params) => axiosInstance.get(ENDPOINTS.INFORME_DIARIO.STATUS_COUNTS, { params }).then(r => r.data),
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const r = await axiosInstance.post('upload/', formData);
  return { file_url: r.data.url };
};

export default axiosInstance;
