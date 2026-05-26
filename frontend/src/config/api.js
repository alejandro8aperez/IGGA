// =============================================================================
// config/api.js — ERP 8AMPERIOS
// Central de endpoints. TODOS los módulos deben importar de aquí.
// =============================================================================

const DEFAULT_LOCAL_URL = 'http://localhost:8000/api';

// ----------------------------------------------------------------------------
// BASE URL
// ----------------------------------------------------------------------------

const BASE_URL =
    import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? DEFAULT_LOCAL_URL
        : DEFAULT_LOCAL_URL);

// Quitar slash final
const B = BASE_URL.endsWith('/')
    ? BASE_URL.slice(0, -1)
    : BASE_URL;

// Base media SIN /api
const M = B.replace('/api', '');

// =============================================================================
// ENDPOINTS
// =============================================================================

export const API = {

    // =========================================================================
    // AUTH
    // =========================================================================
    AUTH: {
        LOGIN:             `${B}/token/`,
        REFRESH:           `${B}/token/refresh/`,
        LOGOUT:            `${B}/auth/logout/`,
        ME:                `${B}/auth/me/`,
        USUARIOS:          `${B}/auth/usuarios/`,
        ROLES:             `${B}/auth/roles/`,
    },

    // =========================================================================
    // CRM
    // =========================================================================
    CRM: {
        CLIENTES:          `${B}/crm/clientes/`,
        COTIZACIONES:      `${B}/crm/cotizaciones/`,
        OPORTUNIDADES:     `${B}/crm/oportunidades/`,
        CONTACTOS:         `${B}/crm/contactos/`,
        ACTIVIDADES:       `${B}/crm/actividades/`,
    },

    // =========================================================================
    // INFORME DIARIO
    // =========================================================================
    INFORME_DIARIO: {

        // ------------------------------
        // Maestros
        // ------------------------------
        OBRAS:                  `${B}/informe-diario/obras/`,
        CATEGORIAS_RECURSOS:    `${B}/informe-diario/categorias-recursos/`,
        RECURSOS:               `${B}/informe-diario/recursos/`,
        CATEGORIAS_ACTIVIDADES: `${B}/informe-diario/categorias-actividades/`,

        // ------------------------------
        // Informes
        // ------------------------------
        INFORMES:               `${B}/informe-diario/informes/`,
        ANEXOS:                 `${B}/informe-diario/anexos/`,

        // ------------------------------
        // Dashboard
        // ------------------------------
        DASHBOARD_RESUMEN:      `${B}/informe-diario/dashboard/resumen/`,
        DASHBOARD_LLUVIA:       `${B}/informe-diario/dashboard/lluvia-mensual/`,
        DASHBOARD_PERSONAL:     `${B}/informe-diario/dashboard/personal-por-rol/`,
        STATUS_COUNTS:          `${B}/informe-diario/dashboard/status-counts/`,
    },

    // =========================================================================
    // OPERACIONES
    // =========================================================================
    OPERACIONES: {
        PROYECTOS:              `${B}/operaciones/proyectos/`,
        PROCESOS:               `${B}/operaciones/procesos/`,
        TAREAS:                 `${B}/operaciones/tareas/`,
        INDICADORES:            `${B}/operaciones/indicadores/`,
        TURNOS:                 `${B}/operaciones/turnos/`,
        INFORMES_DIARIOS:       `${B}/operaciones/informes-diarios/`,
    },

    // =========================================================================
    // RRHH
    // =========================================================================
    RRHH: {
        EMPLEADOS:              `${B}/rrhh/empleados/`,
        CONTRATOS:              `${B}/rrhh/contratos/`,
        VACACIONES:             `${B}/rrhh/vacaciones/`,
        INCAPACIDADES:          `${B}/rrhh/incapacidades/`,
        EPS:                    `${B}/rrhh/eps/`,
        AFP:                    `${B}/rrhh/afp/`,
        ARL:                    `${B}/rrhh/arl/`,
        CAJA_COMP:              `${B}/rrhh/cajas-compensacion/`,
    },

    // =========================================================================
    // INVENTARIOS
    // =========================================================================
    INVENTARIOS: {
        PRODUCTOS:              `${B}/inventarios/productos/`,
        CATEGORIAS:             `${B}/inventarios/categorias/`,
        UNIDADES_MEDIDA:        `${B}/inventarios/unidades-medida/`,
        ALMACENES:              `${B}/inventarios/almacenes/`,
        MOVIMIENTOS:            `${B}/inventarios/movimientos/`,
        STOCK_MINIMO:           `${B}/inventarios/stock-minimo/`,
        AJUSTES:                `${B}/inventarios/ajustes/`,
    },

    // =========================================================================
    // COMPRAS
    // =========================================================================
    COMPRAS: {
        PROVEEDORES:            `${B}/compras/proveedores/`,
        ORDENES:                `${B}/compras/ordenes/`,
        RECEPCIONES:            `${B}/compras/recepciones/`,
        PAGOS:                  `${B}/compras/pagos/`,
        COTIZACIONES:           `${B}/compras/cotizaciones/`,
    },

    // =========================================================================
    // CONTABILIDAD
    // =========================================================================
    CONTABILIDAD: {
        CUENTAS:                `${B}/contabilidad/cuentas/`,
        ASIENTOS:               `${B}/contabilidad/asientos/`,
        CENTROS_COSTO:          `${B}/contabilidad/centros-costo/`,
        CONCILIACION:           `${B}/contabilidad/conciliacion/`,
        BALANCE:                `${B}/contabilidad/balance/`,
        PYG:                    `${B}/contabilidad/pyg/`,
    },

    // =========================================================================
    // REPORTES
    // =========================================================================
    REPORTES: {
        AVANZADOS:              `${B}/reportes/avanzados/`,
        VENTAS:                 `${B}/reportes/ventas/`,
        COMPRAS:                `${B}/reportes/compras/`,
        FINANCIERO:             `${B}/reportes/financiero/`,
        OPERACIONES:            `${B}/reportes/operaciones/`,
        EXPORTAR:               `${B}/reportes/exportar/`,
    },

    // =========================================================================
    // MEDIA
    // =========================================================================
    MEDIA: M,

    // =========================================================================
    // BASE
    // =========================================================================
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
// Helper: validar NIT colombiano
// =============================================================================

export const validarNIT = (nit) => {

    const nitLimpio = String(nit).replace(/[.\-\s]/g, '');

    const cuerpo = nitLimpio.slice(0, -1);

    const digitoVerificacion = parseInt(
        nitLimpio.slice(-1),
        10
    );

    const factores = [
        3, 7, 13, 17, 19,
        23, 29, 37, 41, 43,
        47, 53, 59, 67, 71
    ];

    const digits = cuerpo
        .split('')
        .reverse()
        .map(Number);

    const suma = digits.reduce(
        (acc, d, i) => acc + d * factores[i],
        0
    );

    const residuo = suma % 11;

    const esperado =
        residuo > 1
            ? 11 - residuo
            : residuo;

    return digitoVerificacion === esperado;
};

export default API;
