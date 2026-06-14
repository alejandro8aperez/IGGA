// =============================================================================
// config/api.js — ERP 8AMPERIOS
// Paths RELATIVOS: axios los combina con baseURL = '/api/'
// NO hardcodear http://localhost ni VITE_API_URL aquí.
// =============================================================================

export const API = {

  // ---------------------------------------------------------------------------
  // AUTH
  // ---------------------------------------------------------------------------
  AUTH: {
    LOGIN:   'token/',
    REFRESH: 'token/refresh/',
  },

  // ---------------------------------------------------------------------------
  // CRM
  // ---------------------------------------------------------------------------
  CRM: {
    CLIENTES:      'crm/clientes/',
    CONTACTOS:     'crm/contactos/',
    COTIZACIONES:  'crm/cotizaciones/',
    OPORTUNIDADES: 'crm/oportunidades/',
  },

  // ---------------------------------------------------------------------------
  // VENTAS / PEDIDOS
  // ---------------------------------------------------------------------------
  VENTAS: {
    PEDIDOS:  'venta/pedidos/',
    FACTURAS: 'venta/facturas/',
  },
  PEDIDOS: {
    LIST:   'venta/pedidos/',
    CREATE: 'venta/pedidos/',
    DETAIL: (id) => `venta/pedidos/${id}/`,
  },

  // ---------------------------------------------------------------------------
  // COMPRAS
  // ---------------------------------------------------------------------------
  COMPRAS: {
    PROVEEDORES: 'compras/proveedores/',
    ORDENES:     'compras/ordenes/',
  },

  // ---------------------------------------------------------------------------
  // INVENTARIOS
  // ---------------------------------------------------------------------------
  INVENTARIO: {
    PRODUCTOS:   'inventario/productos/',
    MOVIMIENTOS: 'inventario/movimientos/',
    CATEGORIAS:  'inventario/categorias/',
    ALMACENES:   'inventario/almacenes/',
    LOTES:       'inventario/lotes/',
    ALERTAS:     'inventario/alertas/',
    CONTEOS:     'inventario/conteos/',
    RESUMEN:     'inventario/productos/resumen/',
  },
  // alias para no romper módulos que ya usan INVENTARIOS
  INVENTARIOS: {
    PRODUCTOS:   'inventario/productos/',
    MOVIMIENTOS: 'inventario/movimientos/',
    CATEGORIAS:  'inventario/categorias/',
    ALMACENES:   'inventario/almacenes/',
    LOTES:       'inventario/lotes/',
    ALERTAS:     'inventario/alertas/',
    CONTEOS:     'inventario/conteos/',
    RESUMEN:     'inventario/productos/resumen/',
  },

  // ---------------------------------------------------------------------------
  // PRODUCTOS
  // ---------------------------------------------------------------------------
  PRODUCTOS: {
    RESUMEN: 'inventario/productos/resumen/',
  },

  // ---------------------------------------------------------------------------
  // OPERACIONES
  // ---------------------------------------------------------------------------
  OPERACIONES: {
    PROYECTOS: 'operaciones/proyectos/',
  },

  // ---------------------------------------------------------------------------
  // INFORME DIARIO
  // ---------------------------------------------------------------------------
  INFORME_DIARIO: {
    INFORMES:               'informe-diario/informes/',
    OBRAS:                  'operaciones/proyectos/',   // ← FIX: vinculado a Operaciones
    RECURSOS:               'informe-diario/recursos/',
    CATEGORIAS_RECURSOS:    'informe-diario/categorias-recursos/',
    CATEGORIAS_ACTIVIDADES: 'informe-diario/categorias-actividades/',
    ANEXOS:                 'informe-diario/anexos/',
    STATUS_COUNTS:          'informe-diario/informes/status-counts/',
    DASHBOARD:              'informe-diario/dashboard/',
  },

  // ---------------------------------------------------------------------------
  // KAVE
  // ---------------------------------------------------------------------------
  KAVE: {
    BASE:    'kave/',
    DESIGNS: 'kave/designs/',
    QUOTE:   'kave/quote/',
    DESIGN:  'kave/design/',
  },

  // ---------------------------------------------------------------------------
  // DASHBOARD
  // ---------------------------------------------------------------------------
  DASHBOARD: {
    GENERAL: 'dashboard/',
    STATS:   'dashboard/stats/',
  },

  // ---------------------------------------------------------------------------
  // USERS
  // ---------------------------------------------------------------------------
  USERS: {
    LIST:    'users/',
    PROFILE: 'usuarios/usuarios/me/',
  },

  // ---------------------------------------------------------------------------
  // REPORTES
  // ---------------------------------------------------------------------------
  REPORTES: {
    GENERAL: 'reportes/',
  },

  // ---------------------------------------------------------------------------
  // FACTURACIÓN
  // ---------------------------------------------------------------------------
  FACTURACION: {
    FACTURAS:     'facturacion/facturas/',
    RESOLUCIONES: 'facturacion/resoluciones/',
  },

  // ---------------------------------------------------------------------------
  // PRODUCCIÓN
  // ---------------------------------------------------------------------------
  PRODUCCION: {
    ORDENES: 'produccion/ordenes/',
  },

  // ---------------------------------------------------------------------------
  // RRHH
  // ---------------------------------------------------------------------------
  RRHH: {
    EMPLEADOS: 'rrhh/empleados/',
    NOMINA:    'rrhh/nomina/',
  },

  // ---------------------------------------------------------------------------
  // FINANZAS
  // ---------------------------------------------------------------------------
  FINANZAS: {
    CUENTAS:      'finanzas/cuentas/',
    TRANSACCIONES:'finanzas/transacciones/',
  },

  // ---------------------------------------------------------------------------
  // CONTABILIDAD
  // ---------------------------------------------------------------------------
  CONTABILIDAD: {
    ASIENTOS: 'contabilidad/asientos/',
    PUC:      'contabilidad/puc/',
  },

  // ---------------------------------------------------------------------------
  // POS
  // ---------------------------------------------------------------------------
  POS: {
    VENTAS:    'pos/ventas/',
    PRODUCTOS: 'pos/productos/',
  },

  // ---------------------------------------------------------------------------
  // LOGÍSTICA
  // ---------------------------------------------------------------------------
  LOGISTICA: {
    ENVIOS:    'logistica/envios/',
    RUTAS:     'logistica/rutas/',
  },

  // ---------------------------------------------------------------------------
  // CALIDAD
  // ---------------------------------------------------------------------------
  CALIDAD: {
    INSPECCIONES: 'calidad/inspecciones/',
    NO_CONFORMIDADES: 'calidad/no-conformidades/',
  },

  // ---------------------------------------------------------------------------
  // MANTENIMIENTO
  // ---------------------------------------------------------------------------
  MANTENIMIENTO: {
    ORDENES: 'mantenimiento/ordenes/',
    EQUIPOS: 'mantenimiento/equipos/',
  },

  // ---------------------------------------------------------------------------
  // MARKETING
  // ---------------------------------------------------------------------------
  MARKETING: {
    CAMPANAS:  'marketing/campanas/',
    CONTACTOS: 'marketing/contactos/',
  },

  // ---------------------------------------------------------------------------
  // PROYECTOS (módulo independiente)
  // ---------------------------------------------------------------------------
  PROYECTOS: {
    LIST:   'proyectos/proyectos/',
    DETAIL: (id) => `proyectos/proyectos/${id}/`,
  },

  // ---------------------------------------------------------------------------
  // PLANEACION
  // ---------------------------------------------------------------------------
  PLANEACION: {
    PLANES: 'planeacion/planes/',
  },

  // ---------------------------------------------------------------------------
  // MRP
  // ---------------------------------------------------------------------------
  MRP: {
    PLANES:      'mrp/planes/',
    REQUISICION: 'mrp/requisiciones/',
  },

};

export default API;
