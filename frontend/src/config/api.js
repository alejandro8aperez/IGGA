// =============================================================================
// config/api.js — ERP 8AMPERIOS
// Central de endpoints. TODOS los módulos deben importar de aquí.
// En producción (Render) setear la variable: VITE_API_URL
// =============================================================================

const DEFAULT_LOCAL_URL = 'http://localhost:8000/api';

// En producción (Render), usar VITE_API_URL que apunta al backend
// En desarrollo local, usar localhost:8000
const BASE_URL =
    import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? DEFAULT_LOCAL_URL
        : DEFAULT_LOCAL_URL);

const B = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
const M = B.replace('/api', ''); // Base para archivos de Media (sin el prefijo /api)

// =============================================================================
// ENDPOINTS
// =============================================================================
export const API = {

    // ── Autenticación ──────────────────────────────────────────────────────────
    AUTH: {
        LOGIN:          `${B}/token/`,
        REFRESH:        `${B}/token/refresh/`,
        LOGOUT:         `${B}/auth/logout/`,
        ME:             `${B}/auth/me/`,
        USUARIOS:       `${B}/auth/usuarios/`,
        ROLES:          `${B}/auth/roles/`,
    },

    // ── CRM ───────────────────────────────────────────────────────────────────
    CRM: {
        CLIENTES:       `${B}/crm/clientes/`,
        COTIZACIONES:   `${B}/crm/cotizaciones/`,
        OPORTUNIDADES:  `${B}/crm/oportunidades/`,
        CONTACTOS:      `${B}/crm/contactos/`,
        ACTIVIDADES:    `${B}/crm/actividades/`,
    },

    // ── Ventas ────────────────────────────────────────────────────────────────
    VENTAS: {
        PEDIDOS:        `${B}/ventas/pedidos/`,
        CLIENTES:       `${B}/ventas/clientes/`,
        ORDENES:        `${B}/ventas/ordenes/`,
        FACTURAS:       `${B}/ventas/facturas/`,
        DEVOLUCIONES:   `${B}/ventas/devoluciones/`,
    },

    // ── Facturación Electrónica DIAN ──────────────────────────────────────────
    FACTURACION: {
        FACTURAS:       `${B}/facturacion/facturas/`,
        RESOLUCIONES:   `${B}/facturacion/resoluciones/`,
        REPORTES:       `${B}/facturacion/reportes/`,
        NOTAS_CREDITO:  `${B}/facturacion/notas-credito/`,
        NOTAS_DEBITO:   `${B}/facturacion/notas-debito/`,
    },

    // ── Inventarios ───────────────────────────────────────────────────────────
    INVENTARIOS: {
        PRODUCTOS:      `${B}/inventarios/productos/`,
        CATEGORIAS:     `${B}/inventarios/categorias/`,
        UNIDADES_MEDIDA: `${B}/inventarios/unidades-medida/`,
        ALMACENES:      `${B}/inventarios/almacenes/`,
        MOVIMIENTOS:    `${B}/inventarios/movimientos/`,
        STOCK_MINIMO:   `${B}/inventarios/stock-minimo/`,
        AJUSTES:        `${B}/inventarios/ajustes/`,
    },

    // ── Compras ───────────────────────────────────────────────────────────────
    COMPRAS: {
        PROVEEDORES:    `${B}/compras/proveedores/`,
        ORDENES:        `${B}/compras/ordenes/`,
        RECEPCIONES:    `${B}/compras/recepciones/`,
        PAGOS:          `${B}/compras/pagos/`,
        COTIZACIONES:   `${B}/compras/cotizaciones/`,
    },

    // ── Logística ─────────────────────────────────────────────────────────────
    LOGISTICA: {
        ENVIOS:         `${B}/logistica/envios/`,
        VEHICULOS:      `${B}/logistica/vehiculos/`,
        RUTAS:          `${B}/logistica/rutas/`,
        CONDUCTORES:    `${B}/logistica/conductores/`,
        SEGUIMIENTO:    `${B}/logistica/seguimiento/`,
    },

    // ── Producción ────────────────────────────────────────────────────────────
    PRODUCCION: {
        RECETAS:        `${B}/produccion/recetas/`,
        ORDENES:        `${B}/produccion/ordenes/`,
        INSUMOS:        `${B}/produccion/insumos/`,
        PROCESOS:       `${B}/produccion/procesos/`,
        TURNOS:         `${B}/produccion/turnos/`,
    },

    // ── MRP ───────────────────────────────────────────────────────────────────
    MRP: {
        PLAN_MAESTRO:   `${B}/mrp/plan-maestro/`,
        BOM:            `${B}/mrp/bom/`,
        DEMANDA:        `${B}/mrp/demanda/`,
        CAPACIDAD:      `${B}/mrp/capacidad/`,
    },

    // ── Mantenimiento ─────────────────────────────────────────────────────────
    MANTENIMIENTO: {
        ORDENES:        `${B}/mantenimiento/ordenes/`,
        EQUIPOS:        `${B}/mantenimiento/equipos/`,
        PREVENTIVO:     `${B}/mantenimiento/preventivo/`,
        CORRECTIVO:     `${B}/mantenimiento/correctivo/`,
        REPUESTOS:      `${B}/mantenimiento/repuestos/`,
        TECNICOS:       `${B}/mantenimiento/tecnicos/`,
    },

    // ── Activos Fijos ─────────────────────────────────────────────────────────
    ACTIVOS: {
        ACTIVOS:        `${B}/activos/activos/`,
        CATEGORIAS:     `${B}/activos/categorias/`,
        DEPRECIACION:   `${B}/activos/depreciacion/`,
        MANTENIMIENTOS: `${B}/activos/mantenimientos/`,
        UBICACIONES:    `${B}/activos/ubicaciones/`,
    },

    // ── Operaciones ───────────────────────────────────────────────────────────
    OPERACIONES: {
        PROYECTOS:      `${B}/operaciones/proyectos/`,
        PROCESOS:       `${B}/operaciones/procesos/`,
        TAREAS:         `${B}/operaciones/tareas/`,
        INDICADORES:    `${B}/operaciones/indicadores/`,
        TURNOS:         `${B}/operaciones/turnos/`,
        INFORMES_DIARIOS: `${B}/operaciones/informes-diarios/`,
    },

    // ── Informe Diario de Obra (F-141-IN) ─────────────────────────────────────
    INFORME_DIARIO: {
        OBRAS:                   `${B}/informe-diario/obras/`,
        CATEGORIAS_RECURSOS:     `${B}/informe-diario/categorias-recursos/`,
        RECURSOS:                `${B}/informe-diario/recursos/`,
        CATEGORIAS_ACTIVIDADES:  `${B}/informe-diario/categorias-actividades/`,
        INFORMES:                `${B}/informe-diario/informes/`,
        ANEXOS:                  `${B}/informe-diario/anexos/`,
        DASHBOARD_RESUMEN:       `${B}/informe-diario/dashboard/resumen/`,
        DASHBOARD_LLUVIA:        `${B}/informe-diario/dashboard/lluvia-mensual/`,
        DASHBOARD_PERSONAL:      `${B}/informe-diario/dashboard/personal-por-rol/`,
    },


    // ── RRHH ──────────────────────────────────────────────────────────────────
    RRHH: {
        EMPLEADOS:      `${B}/rrhh/empleados/`,
        CONTRATOS:      `${B}/rrhh/contratos/`,
        VACACIONES:     `${B}/rrhh/vacaciones/`,
        INCAPACIDADES:  `${B}/rrhh/incapacidades/`,
        EPS:            `${B}/rrhh/eps/`,
        AFP:            `${B}/rrhh/afp/`,
        ARL:            `${B}/rrhh/arl/`,
        CAJA_COMP:      `${B}/rrhh/cajas-compensacion/`,
    },

    // ── Nómina (colombiana) ───────────────────────────────────────────────────
    NOMINA: {
        PERIODOS:       `${B}/rrhh/periodos-nomina/`,
        NOMINAS:        `${B}/rrhh/nominas/`,
        CONCEPTOS:      `${B}/rrhh/conceptos-nomina/`,
        DETALLES:       `${B}/rrhh/detalles-nomina/`,
    },

    // ── Contabilidad ──────────────────────────────────────────────────────────
    CONTABILIDAD: {
        CUENTAS:        `${B}/contabilidad/cuentas/`,
        ASIENTOS:       `${B}/contabilidad/asientos/`,
        CENTROS_COSTO:  `${B}/contabilidad/centros-costo/`,
        CONCILIACION:   `${B}/contabilidad/conciliacion/`,
        BALANCE:        `${B}/contabilidad/balance/`,
        PYG:            `${B}/contabilidad/pyg/`,
    },

    // ── Finanzas ──────────────────────────────────────────────────────────────
    FINANZAS: {
        CUENTAS:        `${B}/finanzas/cuentas/`,
        TRANSACCIONES:  `${B}/finanzas/transacciones/`,
        PRESUPUESTOS:   `${B}/finanzas/presupuestos/`,
        FLUJO_CAJA:     `${B}/finanzas/flujo-caja/`,
    },

    // ── Tesorería ─────────────────────────────────────────────────────────────
    TESORERIA: {
        CUENTAS:        `${B}/tesoreria/cuentas/`,
        TRANSACCIONES:  `${B}/tesoreria/transacciones/`,
        EGRESOS:        `${B}/tesoreria/egresos/`,
        INGRESOS:       `${B}/tesoreria/ingresos/`,
        TRANSFERENCIAS: `${B}/tesoreria/transferencias/`,
        CONCILIACION:   `${B}/tesoreria/conciliacion/`,
    },

    // ── Calidad / ISO 9001 ────────────────────────────────────────────────────
    CALIDAD: {
        DOCUMENTOS:     `${B}/calidad/documentos-iso/`,
        AUDITORIAS:     `${B}/calidad/auditorias/`,
        NO_CONFORMIDADES: `${B}/calidad/no-conformidades/`,
        ACCIONES:       `${B}/calidad/acciones-correctivas/`,
        INDICADORES:    `${B}/calidad/indicadores/`,
    },

    // ── Marketing ─────────────────────────────────────────────────────────────
    MARKETING: {
        CAMPANAS:       `${B}/marketing/campanas/`,
        LEADS:          `${B}/marketing/leads/`,
        SEGMENTOS:      `${B}/marketing/segmentos/`,
        METRICAS:       `${B}/marketing/metricas/`,
    },

    // ── Contratos ─────────────────────────────────────────────────────────────
    CONTRATOS: {
        CONTRATOS:      `${B}/contratos/contratos/`,
        TIPOS:          `${B}/contratos/tipos/`,
        RENOVACIONES:   `${B}/contratos/renovaciones/`,
    },

    // ── Planeación ────────────────────────────────────────────────────────────
    PLANEACION: {
        PLANES:         `${B}/planeacion/planes/`,
        OBJETIVOS:      `${B}/planeacion/objetivos/`,
        METAS:          `${B}/planeacion/metas/`,
        SEGUIMIENTO:    `${B}/planeacion/seguimiento/`,
    },

    // ── Proyectos ─────────────────────────────────────────────────────────────
    PROYECTOS: {
        PROYECTOS:      `${B}/proyectos/proyectos/`,
        TAREAS:         `${B}/proyectos/tareas/`,
        HITOS:          `${B}/proyectos/hitos/`,
        RECURSOS:       `${B}/proyectos/recursos/`,
    },

    // ── Configuración ─────────────────────────────────────────────────────────
    CONFIGURACION: {
        EMPRESA:        `${B}/configuracion/empresa/`,
        DEPARTAMENTOS:  `${B}/configuracion/departamentos/`,
        PARAMETROS:     `${B}/configuracion/parametros/`,
        USUARIOS:       `${B}/configuracion/usuarios/`,
        PERMISOS:       `${B}/configuracion/permisos/`,
    },

    // ── Multi-Empresa ─────────────────────────────────────────────────────────
    MULTI_EMPRESA: {
        EMPRESAS:       `${B}/multi-empresa/empresas/`,
        CONSOLIDADO:    `${B}/multi-empresa/consolidado/`,
    },

    // ── KAVE (Transformadores) ────────────────────────────────────────────────
    KAVE: {
        TRANSFORMERS:   `${B}/kave/transformers/`,
        COTIZACIONES:   `${B}/kave/cotizaciones/`,
        CALCULADORA:    `${B}/kave/calculadora/`,
        CERTIFICADOS:   `${B}/kave/certificados/`,
    },

    // ── Reportes y KPIs ───────────────────────────────────────────────────────
    REPORTES: {
        AVANZADOS:      `${B}/reportes/avanzados/`,
        VENTAS:         `${B}/reportes/ventas/`,
        COMPRAS:        `${B}/reportes/compras/`,
        FINANCIERO:     `${B}/reportes/financiero/`,
        OPERACIONES:    `${B}/reportes/operaciones/`,
        EXPORTAR:       `${B}/reportes/exportar/`,
    },

    // ── KPIs / IA ─────────────────────────────────────────────────────────────
    KPIS: {
        CALCULAR:       `${B}/kpis/kpis/calcular_todos/`,
        PREDECIR:       `${B}/kpis/kpis/predecir_ventas/`,
        DASHBOARD:      `${B}/kpis/kpis/dashboard/`,
    },

    // ── Auditoría ─────────────────────────────────────────────────────────────
    AUDITORIA: {
        LOGS:           `${B}/auditoria/logs/`,
        ACTIVIDAD:      `${B}/auditoria/actividad/`,
    },

    // ── Notificaciones ────────────────────────────────────────────────────────
    NOTIFICACIONES: {
        ALERTAS:        `${B}/notificaciones/alertas/`,
        LEIDAS:         `${B}/notificaciones/marcar-leida/`,
    },

    // ── POS (Point of Sale) ───────────────────────────────────────────────────
    POS: {
        VENTAS:         `${B}/pos/ventas/`,
        SESIONES:       `${B}/pos/sesiones/`,
        SESION_ACTIVA:  `${B}/pos/sesiones/activa/`,
        CAJAS:          `${B}/pos/cajas/`,
    },

    // ── Media (Imágenes) ──────────────────────────────────────────────────────
    MEDIA: M,

    // ── URL base (para endpoints personalizados) ──────────────────────────────
    BASE: B,
};

// =============================================================================
// Helper: construir URL con query params
// =============================================================================
export const buildUrl = (baseUrl, params = {}) => {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
            url.searchParams.append(key, val);
        }
    });
    return url.toString();
};

// =============================================================================
// Helper: validar NIT colombiano (dígito de verificación)
// =============================================================================
export const validarNIT = (nit) => {
    const nitLimpio = String(nit).replace(/[.\-\s]/g, '');
    const cuerpo = nitLimpio.slice(0, -1);
    const digitoVerificacion = parseInt(nitLimpio.slice(-1), 10);

    const factores = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
    const digits = cuerpo.split('').reverse().map(Number);
    const suma = digits.reduce((acc, d, i) => acc + d * factores[i], 0);
    const residuo = suma % 11;
    const esperado = residuo > 1 ? 11 - residuo : residuo;

    return digitoVerificacion === esperado;
};

export default API;
