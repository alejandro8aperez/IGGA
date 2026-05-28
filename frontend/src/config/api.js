```js
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

  // ✅ BASE URL
  BASE,

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
  // PEDIDOS
  // ---------------------------------------------------------------------------
  PEDIDOS: {
    LIST: `${BASE}/api/pedidos/`,
    CREATE: `${BASE}/api/pedidos/`,
    DETAIL: (id) => `${BASE}/api/pedidos/${id}/`,
  },

  // ---------------------------------------------------------------------------
  // COMPRAS
  // ---------------------------------------------------------------------------
  COMPRAS: {
    PROVEEDORES: `${BASE}/api/compras/proveedores/`,
    ORDENES: `${BASE}/api/compras/ordenes/`,
  },

  // ---------------------------------------------------------------------------
  // INVENTARIOS
  // ---------------------------------------------------------------------------
  INVENTARIOS: {
    PRODUCTOS: `${BASE}/api/inventario/productos/`,
    MOVIMIENTOS: `${BASE}/api/inventario/movimientos/`,
  },

  // ---------------------------------------------------------------------------
  // PRODUCTOS
  // ---------------------------------------------------------------------------
  PRODUCTOS: {
    RESUMEN: `${BASE}/api/inventario/productos/resumen/`,
  },

  // ---------------------------------------------------------------------------
  // INFORME DIARIO
  // ---------------------------------------------------------------------------
  INFORME_DIARIO: {

    INFORMES: `${BASE}/api/informe-diario/informes/`,

    // ✅ FIX STATUS COUNTS
    STATUS_COUNTS:
      `${BASE}/api/informe-diario/informes/status-counts/`,

    DASHBOARD:
      `${BASE}/api/informe-diario/dashboard/`,
  },

  // ---------------------------------------------------------------------------
  // DASHBOARD GENERAL
  // ---------------------------------------------------------------------------
  DASHBOARD: {
    GENERAL: `${BASE}/api/dashboard/`,
    METRICS: `${BASE}/api/dashboard/metrics/`,
  },

  // ---------------------------------------------------------------------------
  // USERS
  // ---------------------------------------------------------------------------
  USERS: {
    LIST: `${BASE}/api/users/`,
    PROFILE: `${BASE}/api/users/profile/`,
  },

  // ---------------------------------------------------------------------------
  // REPORTES
  // ---------------------------------------------------------------------------
  REPORTES: {
    GENERAL: `${BASE}/api/reportes/`,
  },

};

// =============================================================================
// EXPORT DEFAULT
// =============================================================================

export default API;
```
