// =============================================================================
// API Configuration for ERP-8AMPERIOS
// =============================================================================
// This file centralizes all API URLs for the frontend.
// In production (Render), set VITE_API_URL environment variable.
// In development, it defaults to http://localhost:8000/api
// =============================================================================

// =============================================================================
// PRODUCTION URL - Hardcoded for Render deployment
// =============================================================================
// Using production backend URL directly since VITE_API_URL may not be set
// In development, override this by setting VITE_API_URL in .env.local
// =============================================================================
const PRODUCTION_URL = 'https://erp-backend-a37b.onrender.com/api';
const BASE_URL = import.meta.env.VITE_API_URL || PRODUCTION_URL;

// Ensure no trailing slash for consistent URL building
const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

// =============================================================================
// API Endpoints Configuration
// =============================================================================
export const API = {
    // CRM
    CRM: {
        CLIENTES: `${cleanBaseUrl}/crm/clientes/`,
        COTIZACIONES: `${cleanBaseUrl}/crm/cotizaciones/`,
    },
    
    // Inventarios
    INVENTARIOS: {
        PRODUCTOS: `${cleanBaseUrl}/inventarios/productos/`,
        CATEGORIAS: `${cleanBaseUrl}/inventarios/categorias/`,
        ALMACENES: `${cleanBaseUrl}/inventarios/almacenes/`,
        MOVIMIENTOS: `${cleanBaseUrl}/inventarios/movimientos/`,
    },
    
    // Producción
    PRODUCCION: {
        RECETAS: `${cleanBaseUrl}/produccion/recetas/`,
        ORDENES: `${cleanBaseUrl}/produccion/ordenes/`,
        INSUMOS: `${cleanBaseUrl}/produccion/insumos/`,
    },
    
    // RRHH
    RRHH: {
        EMPLEADOS: `${cleanBaseUrl}/rrhh/empleados/`,
    },
    
    // Configuración
    CONFIGURACION: {
        EMPRESA: `${cleanBaseUrl}/configuracion/empresa/`,
        DEPARTAMENTOS: `${cleanBaseUrl}/configuracion/departamentos/`,
    },
    
    // Ventas
    VENTAS: {
        PEDIDOS: `${cleanBaseUrl}/ventas/pedidos/`,
        CLIENTES: `${cleanBaseUrl}/ventas/clientes/`,
    },
    
    // Compras
    COMPRAS: {
        PROVEEDORES: `${cleanBaseUrl}/compras/proveedores/`,
        ORDENES: `${cleanBaseUrl}/compras/ordenes/`,
    },
    
    // Contabilidad
    CONTABILIDAD: {
        CUENTAS: `${cleanBaseUrl}/contabilidad/cuentas/`,
        ASIENTOS: `${cleanBaseUrl}/contabilidad/asientos/`,
    },
    
    // Calidad
    CALIDAD: {
        DOCUMENTOS: `${cleanBaseUrl}/calidad/documentos-iso/`,
    },
    
    // MRP
    MRP: {
        PLAN_MAESTRO: `${cleanBaseUrl}/mrp/plan-maestro/`,
        BOM: `${cleanBaseUrl}/mrp/bom/`,
    },
    
    // KAVE
    KAVE: {
        TRANSFORMERS: `${cleanBaseUrl}/kave/transformers/`,
        COTIZACIONES: `${cleanBaseUrl}/kave/cotizaciones/`,
    },
    
    // Multi-Empresa
    MULTI_EMPRESA: {
        EMPRESAS: `${cleanBaseUrl}/multi-empresa/empresas/`,
    },
    
    // Reportes
    REPORTES: {
        AVANZADOS: `${cleanBaseUrl}/reportes/avanzados/`,
    },
    
    // Base URL (for custom endpoints)
    BASE: cleanBaseUrl,
};

// =============================================================================
// Helper function to build URLs with query parameters
// =============================================================================
export const buildUrl = (baseUrl, params = {}) => {
    const url = new URL(baseUrl);
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]);
        }
    });
    return url.toString();
};

export default API;
