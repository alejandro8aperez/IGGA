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
// BASE URL
// =============================================================================

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// =============================================================================
// ENDPOINTS
// =============================================================================

const API_CLIENTES = API.CRM.CLIENTES;

const API_COTIZACIONES = API.CRM.COTIZACIONES;

const API_PEDIDOS = API.PEDIDOS.LIST;

const API_FACTURAS = `${BASE}/api/ventas/facturas/`;

const API_PROVEEDORES = `${BASE}/api/compras/proveedores/`;

const API_ORDENES = `${BASE}/api/compras/ordenes/`;

const API_PRODUCTOS = `${BASE}/api/inventario/productos/`;

const API_PROYECTOS = `${BASE}/api/operaciones/proyectos/`;

const API_DISENOS = `${BASE}/api/kave/disenos/`;

// =============================================================================
// MODULES
// =============================================================================

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
        description: 'Maestro de materiales SAP',
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

// =============================================================================
// COMPONENT
// =============================================================================

export default function Home() {

    const navigate = useNavigate();

    const { user } = useAuth();

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
        disenos: 0
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
                axios.get(API_DISENOS)
            ]);

            const getValue = (result) =>
                result.status === 'fulfilled'
                    ? (result.value?.data?.length || 0)
                    : 0;

            setStats({
                clientes: getValue(results[0]),
                cotizaciones: getValue(results[1]),
                pedidos: getValue(results[2]),
                facturas: getValue(results[3]),
                proveedores: getValue(results[4]),
                ordenes: getValue(results[5]),
                productos: getValue(results[6]),
                proyectos: getValue(results[7]),
                disenos: getValue(results[8])
            });

        } catch (error) {

            console.error('Error fetching stats:', error);

        }
    };

    const filteredModules = modules.filter(module =>
        module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openModule = (module) => {

        setLoading(true);

        setTimeout(() => {

            navigate(module.path);

            setLoading(false);

        }, 300);
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '2rem'
            }}
        >

            <h1
                style={{
                    color: 'white',
                    textAlign: 'center',
                    marginBottom: '2rem',
                    fontSize: '2.5rem',
                    fontWeight: '700'
                }}
            >
                ERP 8AMPERIOS
            </h1>

            <div
                style={{
                    maxWidth: '500px',
                    margin: '0 auto 2rem auto'
                }}
            >
                <input
                    type="text"
                    placeholder="Buscar módulo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: 'none',
                        fontSize: '1rem'
                    }}
                />
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1.5rem'
                }}
            >
                {filteredModules.map((module) => {

                    const Icon = module.icon;

                    return (
                        <div
                            key={module.name}
                            onClick={() => openModule(module)}
                            style={{
                                background: 'rgba(255,255,255,0.12)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '16px',
                                padding: '1.5rem',
                                cursor: 'pointer',
                                color: 'white',
                                transition: '0.3s',
                                border: '1px solid rgba(255,255,255,0.15)'
                            }}
                        >

                            <Icon
                                size={32}
                                style={{
                                    marginBottom: '1rem',
                                    color: module.color
                                }}
                            />

                            <h3
                                style={{
                                    marginBottom: '0.5rem'
                                }}
                            >
                                {module.name}
                            </h3>

                            <p
                                style={{
                                    opacity: 0.9,
                                    fontSize: '0.9rem',
                                    minHeight: '40px'
                                }}
                            >
                                {module.description}
                            </p>

                            <div
                                style={{
                                    marginTop: '1rem',
                                    fontSize: '0.85rem',
                                    opacity: 0.8
                                }}
                            >
                                {module.stats.total} registros
                            </div>

                        </div>
                    );
                })}
            </div>

            {loading && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.5rem'
                    }}
                >
                    Cargando...
                </div>
            )}

        </div>
    );
}
