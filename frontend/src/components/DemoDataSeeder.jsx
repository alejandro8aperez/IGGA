import axios from 'axios';
import { API } from '../config/api';

const API_BASE = API.BASE;

// Datos de demostración
const demoData = {
    clientes: [
        {
            nombre: "Constructora Eléctrica Nacional S.A.",
            nit: "900.123.456-7",
            email: "contacto@constructora.com",
            telefono: "+57 1 234 5678",
            direccion: "Calle 123 #45-67, Bogotá, Colombia",
            tipo: "Corporativo"
        },
        {
            nombre: "Industria Metálica del Centro",
            nit: "800.987.654-3",
            email: "compras@metalcentro.com",
            telefono: "+57 2 345 6789",
            direccion: "Av. Industrial 123, Medellín, Colombia",
            tipo: "Industrial"
        },
        {
            nombre: "Minerales Andinos Ltda.",
            nit: "830.456.789-1",
            email: "ingenieria@mineralesandinos.com",
            telefono: "+57 4 567 8901",
            direccion: "Km 12 Vía al Mar, Barranquilla, Colombia",
            tipo: "Minero"
        },
        {
            nombre: "Energías Renovables del Valle",
            nit: "900.555.777-2",
            email: "proyectos@energiasrenovables.com",
            telefono: "+57 2 876 5432",
            direccion: "Calle Verde 456, Cali, Colombia",
            tipo: "Energía"
        },
        {
            nombre: "Automotriz del Caribe S.A.",
            nit: "860.333.999-5",
            email: "mantenimiento@automotrizcaribe.com",
            telefono: "+57 5 432 1098",
            direccion: "Via 40 #123-45, Cartagena, Colombia",
            tipo: "Automotriz"
        }
    ],
    
    productos: [
        {
            nombre: "Transformador Trifásico 75 kVA",
            codigo: "TRF-075-3F",
            descripcion: "Transformador trifásico en aceite, 75 kVA, 13.2kV/208-120V",
            unidad: "Und",
            precio_venta: 8500000,
            categoria: "Transformadores"
        },
        {
            nombre: "Transformador Monofásico 25 kVA",
            codigo: "TRF-025-1F",
            descripcion: "Transformador monofásico en aceite, 25 kVA, 7.62kV/240-120V",
            unidad: "Und",
            precio_venta: 3200000,
            categoria: "Transformadores"
        },
        {
            nombre: "Transformador Trifásico 150 kVA",
            codigo: "TRF-150-3F",
            descripcion: "Transformador trifásico en aceite, 150 kVA, 13.2kV/480-277V",
            unidad: "Und",
            precio_venta: 12500000,
            categoria: "Transformadores"
        },
        {
            nombre: "Banco de Capacitores 100 kVAR",
            codigo: "BCP-100",
            descripcion: "Banco de capacitores trifásico, 100 kVAR, 13.2kV, automático",
            unidad: "Und",
            precio_venta: 4200000,
            categoria: "Compensación"
        },
        {
            nombre: "Seccionador 15 kV",
            codigo: "SEC-015",
            descripcion: "Seccionador bajo carga, 15 kV, 630A, con fusibles",
            unidad: "Und",
            precio_venta: 2800000,
            categoria: "Aparamenta"
        },
        {
            nombre: "Pararrayos 15 kV",
            codigo: "PRX-015",
            descripcion: "Pararrayos tipo óxido de zinc, 15 kV, clase 1",
            unidad: "Und",
            precio_venta: 450000,
            categoria: "Protección"
        },
        {
            nombre: "Transformador de Corriente 200/5A",
            codigo: "TC-200-5",
            descripcion: "Transformador de corriente, 200/5A, clase 0.5, 15 kV",
            unidad: "Und",
            precio_venta: 320000,
            categoria: "Medición"
        },
        {
            nombre: "Transformador de Potencial 13.2kV/120V",
            codigo: "TP-13.2-120",
            descripcion: "Transformador de potencial, 13.2kV/120V, clase 0.3",
            unidad: "Und",
            precio_venta: 580000,
            categoria: "Medición"
        }
    ],
    
    cotizaciones: [
        {
            asunto: "Suministro de Transformadores para Planta Industrial",
            tiempo_entrega: "20 días hábiles",
            forma_pago: "50% anticipo, 50% contraentrega",
            garantia: "2 años",
            validez_oferta: "15 días",
            porcentaje_iva: 19,
            estado: "enviada",
            detalles: [
                {
                    item: 1,
                    producto: "Transformador Trifásico 75 kVA",
                    descripcion: "Transformador trifásico en aceite, 75 kVA, 13.2kV/208-120V",
                    unidad: "Und",
                    cantidad: 2,
                    valor_unitario: 8500000,
                    valor_total: 17000000
                },
                {
                    item: 2,
                    producto: "Seccionador 15 kV",
                    descripcion: "Seccionador bajo carga, 15 kV, 630A, con fusibles",
                    unidad: "Und",
                    cantidad: 2,
                    valor_unitario: 2800000,
                    valor_total: 5600000
                }
            ]
        },
        {
            asunto: "Equipos de Protección para Subestación",
            tiempo_entrega: "15 días hábiles",
            forma_pago: "Contado",
            garantia: "1 año",
            validez_oferta: "30 días",
            porcentaje_iva: 19,
            estado: "aceptada",
            detalles: [
                {
                    item: 1,
                    producto: "Pararrayos 15 kV",
                    descripcion: "Pararrayos tipo óxido de zinc, 15 kV, clase 1",
                    unidad: "Und",
                    cantidad: 6,
                    valor_unitario: 450000,
                    valor_total: 2700000
                },
                {
                    item: 2,
                    producto: "Transformador de Corriente 200/5A",
                    descripcion: "Transformador de corriente, 200/5A, clase 0.5, 15 kV",
                    unidad: "Und",
                    cantidad: 3,
                    valor_unitario: 320000,
                    valor_total: 960000
                }
            ]
        }
    ]
};

export class DemoDataSeeder {
    static async seedAll() {
        try {
            console.log('🌱 Iniciando siembra de datos de demo...');
            
            // Sembrar clientes
            await this.seedClientes();
            
            // Sembrar productos
            await this.seedProductos();
            
            // Sembrar cotizaciones
            await this.seedCotizaciones();
            
            console.log('✅ Datos de demo sembrados exitosamente');
            return true;
        } catch (error) {
            console.error('❌ Error al sembrar datos de demo:', error);
            return false;
        }
    }
    
    static async seedClientes() {
        try {
            console.log('👥 Sembrando clientes...');
            
            for (const cliente of demoData.clientes) {
                try {
                    const response = await axios.post(`${API_BASE}/crm/clientes/`, cliente);
                    console.log(`✅ Cliente creado: ${cliente.nombre}`);
                } catch (error) {
                    if (error.response?.status === 400) {
                        console.log(`⚠️ Cliente ya existe: ${cliente.nombre}`);
                    } else {
                        throw error;
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error al sembrar clientes:', error);
        }
    }
    
    static async seedProductos() {
        try {
            console.log('📦 Sembrando productos...');
            
            for (const producto of demoData.productos) {
                try {
                    const response = await axios.post(`${API_BASE}/inventarios/productos/`, producto);
                    console.log(`✅ Producto creado: ${producto.nombre}`);
                } catch (error) {
                    if (error.response?.status === 400) {
                        console.log(`⚠️ Producto ya existe: ${producto.nombre}`);
                    } else {
                        throw error;
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error al sembrar productos:', error);
        }
    }
    
    static async seedCotizaciones() {
        try {
            console.log('📄 Sembrando cotizaciones...');
            
            // Obtener clientes para asignar IDs
            const clientesResponse = await axios.get(`${API_BASE}/crm/clientes/`);
            const clientes = clientesResponse.data;
            
            for (const cotizacionData of demoData.cotizaciones) {
                try {
                    // Asignar un cliente aleatorio
                    const clienteAleatorio = clientes[Math.floor(Math.random() * clientes.length)];
                    const cotizacion = {
                        ...cotizacionData,
                        cliente: clienteAleatorio.id,
                        fecha_creacion: new Date().toISOString().split('T')[0],
                        fecha_validez: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        gran_total: cotizacionData.detalles.reduce((sum, item) => sum + item.valor_total, 0) * 1.19
                    };
                    
                    const response = await axios.post(`${API_BASE}/crm/cotizaciones/`, cotizacion);
                    console.log(`✅ Cotización creada: ${cotizacion.asunto}`);
                } catch (error) {
                    if (error.response?.status === 400) {
                        console.log(`⚠️ Cotización ya existe: ${cotizacionData.asunto}`);
                    } else {
                        throw error;
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error al sembrar cotizaciones:', error);
        }
    }
    
    static async clearDemoData() {
        try {
            console.log('🧹 Limpiando datos de demo...');
            
            // Limpiar cotizaciones
            try {
                const cotizacionesResponse = await axios.get(`${API_BASE}/crm/cotizaciones/`);
                for (const cotizacion of cotizacionesResponse.data) {
                    await axios.delete(`${API_BASE}/crm/cotizaciones/${cotizacion.id}/`);
                }
                console.log('✅ Cotizaciones eliminadas');
            } catch (error) {
                console.log('⚠️ No se pudieron eliminar cotizaciones');
            }
            
            // Limpiar productos
            try {
                const productosResponse = await axios.get(`${API_BASE}/inventarios/productos/`);
                for (const producto of productosResponse.data) {
                    await axios.delete(`${API_BASE}/inventarios/productos/${producto.id}/`);
                }
                console.log('✅ Productos eliminados');
            } catch (error) {
                console.log('⚠️ No se pudieron eliminar productos');
            }
            
            // Limpiar clientes (solo los de demo)
            try {
                const clientesResponse = await axios.get(`${API_BASE}/crm/clientes/`);
                for (const cliente of clientesResponse.data) {
                    if (demoData.clientes.some(c => c.nombre === cliente.nombre)) {
                        await axios.delete(`${API_BASE}/crm/clientes/${cliente.id}/`);
                    }
                }
                console.log('✅ Clientes de demo eliminados');
            } catch (error) {
                console.log('⚠️ No se pudieron eliminar clientes');
            }
            
            console.log('✅ Datos de demo limpiados');
        } catch (error) {
            console.error('❌ Error al limpiar datos de demo:', error);
        }
    }
}

// Función para inicializar datos de demo
export const initializeDemoData = async () => {
    try {
        const success = await DemoDataSeeder.seedAll();
        if (success) {
            console.log('🎉 Sistema de demo inicializado correctamente');
        }
        return success;
    } catch (error) {
        console.error('❌ Error al inicializar demo:', error);
        return false;
    }
};
