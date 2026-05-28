```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    LayoutDashboard,
    Users,
    ShoppingCart,
    Package,
    Truck,
    Database,
    Building2,
    Boxes
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { API } from '../config/api';

// =============================================================================
// ENDPOINTS
// =============================================================================

const API_CLIENTES = API.CRM.CLIENTES;
const API_COTIZACIONES = API.CRM.COTIZACIONES;
const API_PEDIDOS = API.PEDIDOS.LIST;

// FACTURAS
const API_FACTURAS =
    `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/ventas/facturas/`;

// COMPRAS
const API_PROVEEDORES =
    `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/compras/proveedores/`;

const API_ORDENES =
    `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/compras/ordenes/`;

// INVENTARIO
const API_PRODUCTOS = API.INVENTARIO.PRODUCTOS;

// OPERACIONES
const API_PROYECTOS =
    `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/operaciones/proyectos/`;

// KAVE
const API_DISEÑOS =
    `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/kave/disenos/`;

const modules = [
    {
        name: 'Dashboard',
        description: 'Panel de control y métricas',
        icon: LayoutDashboard,
        color: '#3b82f6',
        path: '/dashboard',
        stats: { total: 24, growth: '+5%' }
    },
    {
        name: 'CRM',
        description: 'Gestión de relaciones con clientes',
        icon: Users,
        color: '#667eea',
        path: '/crm',
        stats: { total: 150, growth: '+12%' }
    },
    {
        name: 'Multi-Empresa',
        description: 'Gestión de múltiples empresas',
        icon: Building2,
        color: '#6366f1',
        path: '/multi-empresa',
        stats: { total: 3, growth: '+0%' }
    },
    {
        name: 'Ventas',
        description: 'Gestión de ventas y facturación',
        icon: ShoppingCart,
        color: '#10b981',
        path: '/ventas',
        stats: { total: 89, growth: '+8%' }
    },
    {
        name: 'Compras',
        description: 'Gestión de proveedores y compras',
        icon: Package,
        color: '#f59e0b',
        path: '/compras',
        stats: { total: 67, growth: '+15%' }
    },
    {
        name: 'Logística',
        description: 'Gestión de envíos y transporte',
        icon: Truck,
        color: '#ef4444',
        path: '/logistica',
        stats: { total: 45, growth: '+5%' }
    },
    {
        name: 'Inventario',
        description: 'Control de existencias y movimientos',
        icon: Database,
        color: '#8b5cf6',
        path: '/inventario',
        stats: { total: 234, growth: '+18%' }
    },
    {
        name: 'Productos',
        description: 'Maestro de materiales SAP — barras, empaque, MRP',
        icon: Boxes,
        color: '#7c3aed',
        path: '/productos',
        stats: { total: 0, growth: 'SAP MM' }
    },
    {
        name: 'Proveedores',
        description: 'Maestro de proveedores',
        icon: Users,
        color: '#0d9488',
        path: '/proveedores',
        stats: { total: 0, growth: 'Nuevo' }
    }
];

export default function Home() {

    const navigate = useNavigate();
    const { user } = useAuth();

    const [selectedModule, setSelectedModule] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [stats, setStats] = useState({
        clientes: 0,
        cotizaciones: 0,
        pedidos: 0,
        facturas: 0,
        proveedores: 0,
        ordenes: 0,
        productos: 0,
        proyectos: 0,
        diseños: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {

        try {

            if (!user || user.modoDemo) {
                return;
            }

            const results = await Promise.allSettled([
                axios.get(API_CLIENTES),
                axios.get(API_COTIZACIONES),
                axios.get(API_PEDIDOS),
                axios.get(API_FACTURAS),
                axios.get(API_PROVEEDORES),
                axios.get(API_ORDENES),
                axios.get(API_PRODUCTOS),
                axios.get(API_PROYECTOS),
                axios.get(API_DISEÑOS)
            ]);

            const getValue = (result) =>
                result.status === 'fulfilled'
                    ? (result.value?.data?.length || 0)
                    : 0;

            let totalProductosMaestro = getValue(results[6]);

            try {

                const resumen = await axios.get(API_PRODUCTOS);

                totalProductosMaestro =
                    resumen.data?.total_productos ??
                    totalProductosMaestro;

            } catch {

                console.warn('No se pudo cargar resumen productos');

            }

            setStats({
                clientes: getValue(results[0]),
                cotizaciones: getValue(results[1]),
                pedidos: getValue(results[2]),
                facturas: getValue(results[3]),
                proveedores: getValue(results[4]),
                ordenes: getValue(results[5]),
                productos: totalProductosMaestro,
                proyectos: getValue(results[7]),
                diseños: getValue(results[8])
            });

        } catch (error) {

            console.error('Error fetching stats:', error);

        }
    };

    const filteredModules = modules.filter(module =>
        module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const moduleStats = (module) => {

        if (module.path === '/productos') {
            return {
                total: stats.productos,
                growth: 'SAP MM'
            };
        }

        if (module.path === '/proveedores') {
            return {
                total: stats.proveedores,
                growth: 'Nuevo'
            };
        }

        return module.stats;
    };

    const openModule = (module) => {

        setSelectedModule(module);
        setLoading(true);

        setTimeout(() => {

            navigate(module.path);
            setLoading(false);

        }, 500);
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: '100vh',
            padding: '2rem'
        }}>

            <h1 style={{
                color: 'white',
                textAlign: 'center',
                marginBottom: '2rem'
            }}>
                ERP 8AMPERIOS
            </h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem'
            }}>

                {filteredModules.map((module) => (

                    <div
                        key={module.name}
                        onClick={() => openModule(module)}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            padding: '1rem',
                            cursor: 'pointer',
                            color: 'white'
                        }}
                    >

                        <module.icon
                            size={28}
                            style={{
                                marginBottom: '1rem'
                            }}
                        />

                        <h3>{module.name}</h3>

                        <p style={{
                            fontSize: '0.9rem',
                            opacity: 0.9
                        }}>
                            {module.description}
                        </p>

                        <div style={{
                            marginTop: '1rem',
                            fontSize: '0.85rem'
                        }}>
                            {moduleStats(module).total} registros
                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}
```
