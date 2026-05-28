// =============================================================================
// config/api.js — ERP 8AMPERIOS
// Central de endpoints. TODOS los módulos deben importar de aquí.
// En producción (Render) setear la variable: VITE_API_URL
// =============================================================================

const BASE =
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000';

// =============================================================================
// ENDPOINTS API
// =============================================================================

export const API = {
  // ---------------------------------------------------------------------------
  // AUTH
  // ---------------------------------------------------------------------------
  AUTH: {
    LOGIN: `${BASE}/api/token/`,
    REFRESH: `${BASE}/api/token/refresh/`,
    PROFILE: `${BASE}/api/auth/profile/`,
  },

  // ---------------------------------------------------------------------------
  // CRM
  // ---------------------------------------------------------------------------
  CRM: {
    CLIENTES: `${BASE}/api/crm/clientes/`,
    CONTACTOS: `${BASE}/api/crm/contactos/`,
    COTIZACIONES: `${BASE}/api/crm/cotizaciones/`,
    OPORTUNIDADES: `${BASE}/api/crm/oportunidades/`,
  },

  // ---------------------------------------------------------------------------
  // INFORME DIARIO
  // ---------------------------------------------------------------------------
  INFORME_DIARIO: {
    INFORMES: `${BASE}/api/informe-diario/informes/`,

    // ✅ FIX CORRECTO
    STATUS_COUNTS: `${BASE}/api/informe-diario/informes/status-counts/`,

    DASHBOARD: `${BASE}/api/informe-diario/dashboard/`,
  },

  // ---------------------------------------------------------------------------
  // DASHBOARDS GENERALES
  // ---------------------------------------------------------------------------
  DASHBOARD: {
    GENERAL: `${BASE}/api/dashboard/`,
    METRICS: `${BASE}/api/dashboard/metrics/`,
  },

  // ---------------------------------------------------------------------------
  // USUARIOS
  // ---------------------------------------------------------------------------
  USERS: {
    LIST: `${BASE}/api/users/`,
    PROFILE: `${BASE}/api/users/profile/`,
  },
};

// =============================================================================
// EXPORT DEFAULT
// =============================================================================

export default API;
