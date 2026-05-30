// =============================================================================
// config/api.js — ERP 8AMPERIOS
// Paths RELATIVOS: axios los combina con baseURL = '/api/'
// No hardcodear http://localhost ni VITE_API_URL aquí.
// =============================================================================

export const API = {

  AUTH: {
    LOGIN:   'token/',
    REFRESH: 'token/refresh/',
  },

  CRM: {
    CLIENTES:     'crm/clientes/',
    CONTACTOS:    'crm/contactos/',
    COTIZACIONES: 'crm/cotizaciones/',
    OPORTUNIDADES:'crm/oportunidades/',
  },

  PEDIDOS: {
    LIST:   'venta/pedidos/',
    CREATE: 'venta/pedidos/',
    DETAIL: (id) => `venta/pedidos/${id}/`,
  },

  VENTAS: {
    PEDIDOS:  'venta/pedidos/',
    FACTURAS: 'venta/facturas/',
  },

  COMPRAS: {
    PROVEEDORES: 'compras/proveedores/',
    ORDENES:     'compras/ordenes/',
  },

  INVENTARIO: {
    PRODUCTOS:   'inventario/productos/',
    MOVIMIENTOS: 'inventario/movimientos/',
    RESUMEN:     'inventario/productos/resumen/',
  },

  // mantener alias viejo para no romper Ventas.jsx
  INVENTARIOS: {
    PRODUCTOS:   'inventario/productos/',
    MOVIMIENTOS: 'inventario/movimientos/',
  },

  PRODUCTOS: {
    RESUMEN: 'inventario/productos/resumen/',
  },

  OPERACIONES: {
    PROYECTOS: 'operaciones/proyectos/',
  },

  INFORME_DIARIO: {
    INFORMES:               'informe-diario/informes/',
    OBRAS:                  'informe-diario/obras/',
    RECURSOS:               'informe-diario/recursos/',
    CATEGORIAS_RECURSOS:    'informe-diario/categorias-recursos/',
    CATEGORIAS_ACTIVIDADES: 'informe-diario/categorias-actividades/',
    ANEXOS:                 'informe-diario/anexos/',
    STATUS_COUNTS:          'informe-diario/informes/status-counts/',
    DASHBOARD:              'informe-diario/dashboard/',
  },

  KAVE: {
    BASE:    'kave/',
    DESIGNS: 'kave/designs/',   // ← corregido (era "disenos")
    QUOTE:   'kave/quote/',
    DESIGN:  'kave/design/',
  },

  DASHBOARD: {
    GENERAL: 'dashboard/',
    STATS:   'dashboard/stats/',
  },

  USERS: {
    LIST:    'users/',
    PROFILE: 'users/profile/',
  },

  REPORTES: {
    GENERAL: 'reportes/',
  },

};

export default API;
