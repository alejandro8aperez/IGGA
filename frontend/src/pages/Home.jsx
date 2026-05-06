import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    LayoutDashboard, Users, ShoppingCart, Package, Truck, Wrench, Settings,
    TrendingUp, BarChart3, FileText, Zap, Database, DollarSign,
    Menu, X, Plus, Edit3, Trash2, Search, Filter, Calendar,
    Clock, CheckCircle, AlertCircle, Activity, Target, Building2, FormInput,
    Factory, Shield, Users2, ClipboardList, Cog, Calculator as CalcIcon, 
    CreditCard, Megaphone, MonitorSmartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API } from '../config/api';

const API_CLIENTES = API.CRM.CLIENTES;
const API_COTIZACIONES = API.CRM.COTIZACIONES;
const API_PEDIDOS = API.VENTAS.PEDIDOS;
const API_FACTURAS = `${API.BASE}/ventas/facturas/`;
const API_PROVEEDORES = API.COMPRAS.PROVEEDORES;
const API_ORDENES = API.COMPRAS.ORDENES;
const API_PRODUCTOS = API.INVENTARIOS.PRODUCTOS;
const API_PROYECTOS = `${API.BASE}/operaciones/proyectos/`;
const API_DISEÑOS = `${API.BASE}/kave/disenos/`;

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
        description: 'Control de existencias',
        icon: Database,
        color: '#8b5cf6',
        path: '/inventario',
        stats: { total: 234, growth: '+18%' }
    },
    {
        name: 'Activos',
        description: 'Gestión de activos fijos',
        icon: Settings,
        color: '#06b6d4',
        path: '/activos',
        stats: { total: 78, growth: '+3%' }
    },
    {
        name: 'Operaciones',
        description: 'Gestión de proyectos',
        icon: Wrench,
        color: '#84cc16',
        path: '/operaciones',
        stats: { total: 23, growth: '+25%' }
    },
    {
        name: 'Informe Diario Proy',
        description: 'Formato F-141-IN - Interventoría',
        icon: FileText,
        color: '#6366f1',
        path: '/informe-diario-proy',
        stats: { total: 0, growth: 'Nuevo' }
    },
    {
        name: 'Mantenimiento',
        description: 'Gestión de mantenimiento',
        icon: Wrench,
        color: '#f97316',
        path: '/mantenimiento',
        stats: { total: 34, growth: '+10%' }
    },
    {
        name: 'KAVE',
        description: 'Diseñador de transformadores',
        icon: Zap,
        color: '#a855f7',
        path: '/kave',
        stats: { total: 12, growth: '+42%' }
    },
    {
        name: 'MRP',
        description: 'Planificación de recursos',
        icon: BarChart3,
        color: '#0ea5e9',
        path: '/mrp',
        stats: { total: 156, growth: '+7%' }
    },
    {
        name: 'Finanzas',
        description: 'Gestión financiera',
        icon: DollarSign,
        color: '#22c55e',
        path: '/finanzas',
        stats: { total: 98, growth: '+11%' }
    },
    {
        name: 'Cotizador',
        description: 'Cotizaciones profesionales',
        icon: FileText,
        color: '#f43f5e',
        path: '/cotizador',
        stats: { total: 45, growth: '+20%' }
    },
    {
        name: 'Diseñador Formularios',
        description: 'Creador de formularios personalizados',
        icon: FormInput,
        color: '#14b8a6',
        path: '/form-designer',
        stats: { total: 8, growth: '+33%' }
    },
    {
        name: 'Producción',
        description: 'Control de producción y manufactura',
        icon: Factory,
        color: '#ec4899',
        path: '/produccion',
        stats: { total: 56, growth: '+12%' }
    },
    {
        name: 'Calidad',
        description: 'Gestión de calidad ISO 9001',
        icon: Shield,
        color: '#14b8a6',
        path: '/calidad',
        stats: { total: 23, growth: '+5%' }
    },
    {
        name: 'RRHH',
        description: 'Recursos Humanos y nómina',
        icon: Users2,
        color: '#f97316',
        path: '/rrhh',
        stats: { total: 45, growth: '+8%' }
    },
    {
        name: 'Reportes',
        description: 'Reportes y análisis de datos',
        icon: ClipboardList,
        color: '#64748b',
        path: '/reportes',
        stats: { total: 89, growth: '+15%' }
    },
    {
        name: 'Configuración',
        description: 'Configuración del sistema',
        icon: Cog,
        color: '#475569',
        path: '/configuracion',
        stats: { total: 12, growth: '+2%' }
    },
    {
        name: 'Contabilidad',
        description: 'Gestión contable y fiscal',
        icon: CalcIcon,
        color: '#8b5cf6',
        path: '/contabilidad',
        stats: { total: 234, growth: '+7%' }
    },
    {
        name: 'Tesorería',
        description: 'Gestión de tesorería y bancos',
        icon: DollarSign,
        color: '#06b6d4',
        path: '/tesoreria',
        stats: { total: 67, growth: '+9%' }
    },
    {
        name: 'Facturación',
        description: 'Facturación electrónica',
        icon: CreditCard,
        color: '#10b981',
        path: '/facturacion',
        stats: { total: 123, growth: '+11%' }
    },
    {
        name: 'Marketing',
        description: 'Campañas y estrategia de marketing',
        icon: Megaphone,
        color: '#f43f5e',
        path: '/marketing',
        stats: { total: 15, growth: '+25%' }
    },
    {
        name: 'POS Panadería',
        description: 'Punto de venta táctil rápido',
        icon: MonitorSmartphone,
        color: '#ec4899',
        path: '/pos',
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
                return; // No intentar peticiones reales en modo demo o sin usuario
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
                result.status === 'fulfilled' ? (result.value.data.length || 0) : 0;

            setStats({
                clientes: getValue(results[0]),
                cotizaciones: getValue(results[1]),
                pedidos: getValue(results[2]),
                facturas: getValue(results[3]),
                proveedores: getValue(results[4]),
                ordenes: getValue(results[5]),
                productos: getValue(results[6]),
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
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Pattern */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                opacity: 0.3
            }} />

            {/* Header */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                textAlign: 'center',
                marginBottom: '3rem'
            }}>
                <img
                    src="/logo-8amperios-part2.svg"
                    alt="8AMPERIOS - Conectamos Procesos"
                    style={{
                        maxWidth: '680px',
                        width: '100%',
                        height: 'auto',
                        margin: '0 auto 1.5rem auto',
                        display: 'block'
                    }}
                />
            </div>

            {/* Stats Cards */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem',
                maxWidth: '1200px',
                margin: '0 auto 3rem'
            }}>
                <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                    textAlign: 'center'
                }}>
                    <Users size={32} style={{ color: 'white', marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>
                        {stats.clientes}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                        Clientes
                    </div>
                </div>

                <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                    textAlign: 'center'
                }}>
                    <FileText size={32} style={{ color: 'white', marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>
                        {stats.cotizaciones}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                        Cotizaciones
                    </div>
                </div>

                <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                    textAlign: 'center'
                }}>
                    <ShoppingCart size={32} style={{ color: 'white', marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>
                        {stats.pedidos}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                        Pedidos
                    </div>
                </div>

                <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                    textAlign: 'center'
                }}>
                    <Package size={32} style={{ color: 'white', marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>
                        {stats.proveedores}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                        Proveedores
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                maxWidth: '600px',
                margin: '0 auto 3rem 3rem'
            }}>
                <div style={{ position: 'relative' }}>
                    <Search size={20} style={{
                        position: 'absolute',
                        left: '1.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'rgba(255,255,255,0.6)'
                    }} />
                    <input
                        type="text"
                        placeholder="Buscar módulos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem 1rem 1rem 4rem',
                            background: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '16px',
                            fontSize: '1rem',
                            color: 'white',
                            outline: 'none',
                            transition: 'all 0.3s'
                        }}
                        onFocus={(e) => {
                            e.target.style.background = 'rgba(255,255,255,0.15)';
                            e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                        }}
                        onBlur={(e) => {
                            e.target.style.background = 'rgba(255,255,255,0.1)';
                            e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                        }}
                    />
                </div>
            </div>

            {/* Modules Grid */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.2rem',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {filteredModules.map((module, index) => (
                    <div
                        key={module.name}
                        onClick={() => openModule(module)}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '16px',
                            padding: '1.2rem',
                            border: '1px solid rgba(255,255,255,0.2)',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            transform: 'translateY(0)',
                            opacity: loading && selectedModule?.name === module.name ? 0.7 : 1
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{
                            width: '45px',
                            height: '45px',
                            background: module.color,
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem',
                            boxShadow: `0 8px 20px ${module.color}33`
                        }}>
                            <module.icon size={24} style={{ color: 'white' }} />
                        </div>
                        <h3 style={{
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            color: 'white',
                            margin: '0 0 0.5rem 0'
                        }}>
                            {module.name}
                        </h3>
                        <p style={{
                            fontSize: '0.85rem',
                            color: 'rgba(255,255,255,0.8)',
                            margin: '0 0 0.8rem 0',
                            lineHeight: '1.5'
                        }}>
                            {module.description}
                        </p>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span style={{
                                fontSize: '0.9rem',
                                color: 'rgba(255,255,255,0.7)'
                            }}>
                                {module.stats.total} registros
                            </span>
                            <span style={{
                                fontSize: '0.8rem',
                                color: '#10b981',
                                fontWeight: '600'
                            }}>
                                {module.stats.growth}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Loading Overlay */}
            {loading && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid #e2e8f0',
                            borderTop: '4px solid #667eea',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 1rem'
                        }}></div>
                        <p style={{ color: '#718096', margin: 0 }}>
                            Cargando {selectedModule?.name}...
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
