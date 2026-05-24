import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const informeDiarioService = {
  list: (params) => API.get('/informe-diario/', { params }).then(r => r.data),
  create: (data) => API.post('/informe-diario/', data).then(r => r.data),
  update: (id, data) => API.patch(`/informe-diario/${id}/`, data).then(r => r.data),
  delete: (id) => API.delete(`/informe-diario/${id}/`).then(r => r.data),
};

export const obraService = {
  list: () => API.get('/obras/').then(r => r.data),
  create: (data) => API.post('/obras/', data).then(r => r.data),
  update: (id, data) => API.patch(`/obras/${id}/`, data).then(r => r.data),
  delete: (id) => API.delete(`/obras/${id}/`).then(r => r.data),
};

export const recursoService = {
  list: () => API.get('/recursos/?ordering=orden').then(r => r.data),
  create: (data) => API.post('/recursos/', data).then(r => r.data),
  update: (id, data) => API.patch(`/recursos/${id}/`, data).then(r => r.data),
  delete: (id) => API.delete(`/recursos/${id}/`).then(r => r.data),
};

export const categoriaService = {
  list: () => API.get('/categorias-actividad/?ordering=orden').then(r => r.data),
  create: (data) => API.post('/categorias-actividad/', data).then(r => r.data),
  update: (id, data) => API.patch(`/categorias-actividad/${id}/`, data).then(r => r.data),
  delete: (id) => API.delete(`/categorias-actividad/${id}/`).then(r => r.data),
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const r = await API.post('/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return { file_url: r.data.url };
};