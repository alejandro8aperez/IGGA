import axiosInstance from '../config/axiosConfig';

/**
 * Servicio para consumir el módulo RRHH - Empleados
 * Endpoint base: /api/rrhh/empleados/
 */
const empleadoService = {
    /**
     * Obtener todos los empleados
     */
    getAll: async () => {
        const response = await axiosInstance.get('/rrhh/empleados/');
        return response.data;
    },

    /**
     * Obtener empleados ACTIVOS para dropdowns (ligero)
     * Usa el endpoint @action activos del ViewSet
     */
    getActivos: async () => {
        const response = await axiosInstance.get('/rrhh/empleados/activos/');
        return response.data;
    },

    /**
     * Obtener un empleado por ID
     */
    getById: async (id) => {
        const response = await axiosInstance.get(`/rrhh/empleados/${id}/`);
        return response.data;
    },

    /**
     * Crear empleado
     */
    create: async (data) => {
        const response = await axiosInstance.post('/rrhh/empleados/', data);
        return response.data;
    },

    /**
     * Actualizar empleado
     */
    update: async (id, data) => {
        const response = await axiosInstance.put(`/rrhh/empleados/${id}/`, data);
        return response.data;
    },

    /**
     * Eliminar empleado
     */
    delete: async (id) => {
        const response = await axiosInstance.delete(`/rrhh/empleados/${id}/`);
        return response.data;
    },

    // ── Catálogos relacionados ───────────────────────────────

    getCargos: async () => {
        const response = await axiosInstance.get('/rrhh/cargos/');
        return response.data;
    },

    getDepartamentos: async () => {
        const response = await axiosInstance.get('/rrhh/departamentos/');
        return response.data;
    },

    getEPS: async () => {
        const response = await axiosInstance.get('/rrhh/eps/');
        return response.data;
    },

    getAFP: async () => {
        const response = await axiosInstance.get('/rrhh/afp/');
        return response.data;
    },

    getARL: async () => {
        const response = await axiosInstance.get('/rrhh/arl/');
        return response.data;
    },
};

export default empleadoService;
