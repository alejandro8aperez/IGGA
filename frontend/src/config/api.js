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
    GRUPOS_MATERIAL: 'productos/grupos-material/',
    FAMILIAS: 'productos/familias/',
    TIPOS_EMPAQUE: 'productos/tipos-empaque/',
    POR_CODIGO_BARRAS: 'productos/maestro/por-codigo-barras/',
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
  // INFORME PERIODICO (Semanal / Mensual)
  // ---------------------------------------------------------------------------
  INFORME_PERIODICO: {
    SEMANALES: 'informe-periodico/informes-semanales/',
    GENERAR_SEMANAL: 'informe-periodico/informes-semanales/generar_desde_diarios/',
    SEMANAL_DETAIL: (id) => `informe-periodico/informes-semanales/${id}/`,
    MENSUALES: 'informe-periodico/informes-mensuales/',
    GENERAR_MENSUAL: 'informe-periodico/informes-mensuales/generar_desde_semanales/',
    MENSUAL_DETAIL: (id) => `informe-periodico/informes-mensuales/${id}/`,
  },

  // ---------------------------------------------------------------------------
  // INTERVENTORIA
  // ---------------------------------------------------------------------------
  INTERVENTORIA: {
    CONTRATOS: 'interventoria/contratos/',
    VISITAS:   'interventoria/visitas/',
    HALLAZGOS: 'interventoria/hallazgos/',
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
    CALCULAR_KPIS: 'kpis/kpis/calcular_todos/',
  },
  KPIS: {
    CALCULAR: 'kpis/kpis/calcular_todos/',
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
    RECETAS: 'produccion/recetas/',
    INSUMOS: 'produccion/insumos/',
    ORDENES: 'produccion/ordenes/',
    FASES:   'produccion/fases/',
    CONSUMOS:'produccion/consumos/',
    MERMAS:  'produccion/mermas/',
    COSTOS:  'produccion/costos/',
  },

  // ---------------------------------------------------------------------------
  // RRHH
  // ---------------------------------------------------------------------------
  RRHH: {
    EMPLEADOS: 'rrhh/empleados/',
    NOMINA:    'rrhh/nominas/',
  },
  NOMINA: {
    PERIODOS: 'rrhh/periodos-nomina/',
    NOMINAS:  'rrhh/nominas/',
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
    PUC:      'contabilidad/cuentas/',
  },

  // ---------------------------------------------------------------------------
  // POS
  // ---------------------------------------------------------------------------
  POS: {
    VENTAS:    'pos/ventas/',
    PRODUCTOS: 'inventario/productos/',
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
    NO_CONFORMIDADES: 'calidad/noconformidades/',
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
    CONTACTOS: 'marketing/leads/',
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
    PLANES:   'mrp/plan-maestro-produccion/',
    REQUISICION: 'mrp/requerimientos-materiales/',
  },

};

export default API;
