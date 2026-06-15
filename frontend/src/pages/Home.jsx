import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';
import { 
    LayoutDashboard, Users, ShoppingCart, Package, Truck, Wrench, Settings,
    TrendingUp, BarChart3, FileText, Zap, Database, DollarSign,
    Menu, X, Plus, Edit3, Trash2, Search, Filter, Calendar,
    Clock, CheckCircle, AlertCircle, Activity, Target, Building2, FormInput,
    Factory, Shield, Users2, ClipboardList, Cog, Calculator as CalcIcon, 
    CreditCard, Megaphone, MonitorSmartphone, HeartHandshake, FolderOpen, Boxes
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API } from '../config/api';

// =============================================================================
// RUTAS API CORREGIDAS — sin API.BASE (no existe en api.js)
// =============================================================================
const API_CLIENTES      = API.CRM.CLIENTES;
const API_COTIZACIONES  = API.CRM.COTIZACIONES;
const API_PEDIDOS       = API.VENTAS.PEDIDOS;
const API_FACTURAS      = API.VENTAS.FACTURAS;
const API_PROVEEDORES   = API.COMPRAS.PROVEEDORES;
const API_ORDENES       = API.COMPRAS.ORDENES;
const API_PRODUCTOS     = API.INVENTARIOS.PRODUCTOS;
const API_PROYECTOS     = API.OPERACIONES.PROYECTOS;
const API_DISEÑOS       = API.KAVE.DESIGNS;

const PRIMARY_MODULES = ['Dashboard', 'CRM', 'Proveedores', 'Operaciones', 'Informe Diario Proy', 'Informe Semanal', 'Informe Mensual', 'Calidad', 'ISO 9001', 'RRHH'];

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
        name: 'Informe Semanal',
        description: 'Resumen semanal de obra - Interventoría',
        icon: FileText,
        color: '#8b5cf6',
        path: '/informe-semanal',
        stats: { total: 0, growth: 'Próximo' }
    },
    {
        name: 'Informe Mensual',
        description: 'Resumen mensual de obra - Interventoría',
        icon: FileText,
        color: '#a855f7',
        path: '/informe-mensual',
        stats: { total: 0, growth: 'Próximo' }
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
    },
    {
        name: 'Facturación Electrónica',
        description: 'Facturación electrónica DIAN (Colombia)',
        icon: FileText,
        color: '#0ea5e9',
        path: '/facturacion-electronica',
        stats: { total: 0, growth: 'Nuevo' }
    },
    {
        name: 'Nómina',
        description: 'Liquidación de nómina colombiana',
        icon: HeartHandshake,
        color: '#16a34a',
        path: '/nomina',
        stats: { total: 0, growth: 'Nuevo' }
    },
    {
        name: 'ISO 9001',
        description: 'Formatos y documentos ISO 9001',
        icon: FolderOpen,
        color: '#7c3aed',
        path: '/formatos-iso',
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
                axiosInstance.get(API_CLIENTES),
                axiosInstance.get(API_COTIZACIONES),
                axiosInstance.get(API_PEDIDOS),
                axiosInstance.get(API_FACTURAS),
                axiosInstance.get(API_PROVEEDORES),
                axiosInstance.get(API_ORDENES),
                axiosInstance.get(API_PRODUCTOS),
                axiosInstance.get(API_PROYECTOS),
                axiosInstance.get(API_DISEÑOS)
            ]);

            const getValue = (result) => 
                result.status === 'fulfilled' ? (result.value.data.length || 0) : 0;

            let totalProductosMaestro = getValue(results[6]);
            try {
                const resumen = await axiosInstance.get(API.PRODUCTOS.RESUMEN);
                totalProductosMaestro = resumen.data?.total_productos ?? totalProductosMaestro;
            } catch {
                /* usar conteo de inventarios si el maestro no responde */
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
            return { total: stats.productos, growth: 'SAP MM' };
        }
        if (module.path === '/proveedores') {
            return { total: stats.proveedores, growth: 'Nuevo' };
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2rem',
                marginBottom: '3rem',
                flexWrap: 'wrap'
            }}>
                <img
                    src="/logo.png"
                    alt="IGGA"
                    style={{
                        maxHeight: '120px',
                        width: 'auto',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                    }}
                />
                <div style={{ width: '2px', height: '80px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />
                <div style={{ color: 'white', textAlign: 'left' }}>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900 }}>IGGA</h1>
                    <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.8 }}>INGENIERIA Y GESTION ADMINISTRATIVA</p>
                </div>
            </div>

            {/* ── Layout 3 columnas ────────────────────────────────────── */}
            <div className="home-grid" style={{
                position: 'relative',
                zIndex: 10,
                display: 'grid',
                gridTemplateColumns: '170px 1fr 2px 1fr',
                gap: '0 1.5rem',
                maxWidth: '1500px',
                margin: '0 auto',
                alignItems: 'start'
            }}>            
                {/* ── COLUMNA 1: KPIs ──────────────────────────────────── */}
                <div className="home-kpis" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                        { icon: Users,        label: 'Clientes',    value: stats.clientes },
                        { icon: FileText,     label: 'Cotizaciones',value: stats.cotizaciones },
                        { icon: ShoppingCart, label: 'Pedidos',     value: stats.pedidos },
                        { icon: Package,      label: 'Proveedores', value: stats.proveedores },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} style={{
                            background: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '12px',
                            padding: '0.9rem 1rem',
                            border: '1px solid rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <Icon size={22} style={{ color: 'white', flexShrink: 0 }} />
                            <div>
                                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white', lineHeight: 1 }}>
                                    {value}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>
                                    {label}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── COLUMNA 2: Módulos principales ───────────────────── */}
                <div>
                    <div style={{
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        color: 'rgba(255,255,255,0.5)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginBottom: '0.6rem'
                    }}>
                        Módulos principales
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                        gap: '0.65rem'
                    }}>
                        {filteredModules.filter(m => PRIMARY_MODULES.includes(m.name)).map((module) => (
                            <div
                                key={module.name}
                                onClick={() => openModule(module)}
                                style={{
                                    background: 'rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '10px',
                                    padding: '0.75rem',
                                    border: '2px solid rgba(255,255,255,0.35)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    opacity: loading && selectedModule?.name === module.name ? 0.7 : 1
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.22)';
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.2)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{
                                    width: '28px', height: '28px', background: module.color,
                                    borderRadius: '8px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', marginBottom: '0.5rem',
                                    boxShadow: `0 4px 10px ${module.color}44`
                                }}>
                                    <module.icon size={16} style={{ color: 'white' }} />
                                </div>
                                <h3 style={{ fontSize: '0.82rem', fontWeight: '700', color: 'white', margin: '0 0 0.2rem 0' }}>
                                    {module.name}
                                </h3>
                                <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.75)', margin: '0 0 0.4rem 0', lineHeight: '1.3' }}>
                                    {module.description}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'white' }}>
                                        {moduleStats(module).total}
                                    </span>
                                    <span style={{ fontSize: '0.58rem', color: '#86efac', fontWeight: '600' }}>
                                        {moduleStats(module).growth}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── DIVISOR VERTICAL ─────────────────────────────────── */}
                <div className="home-divider" style={{
                    background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.4) 15%, rgba(255,255,255,0.4) 85%, transparent)',
                    borderRadius: '2px',
                    alignSelf: 'stretch'
                }} />

                {/* ── COLUMNA 3: Resto de módulos ───────────────────────── */}
                <div>
                    <div style={{
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        color: 'rgba(255,255,255,0.4)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginBottom: '0.6rem'
                    }}>
                        Todos los módulos
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                        gap: '0.65rem'
                    }}>
                        {filteredModules.filter(m => !PRIMARY_MODULES.includes(m.name)).map((module) => (
                            <div
                                key={module.name}
                                onClick={() => openModule(module)}
                                style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '10px',
                                    padding: '0.75rem',
                                    border: '1px solid rgba(255,255,255,0.18)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    opacity: loading && selectedModule?.name === module.name ? 0.7 : 1
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.14)';
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.15)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{
                                    width: '26px', height: '26px', background: module.color,
                                    borderRadius: '7px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', marginBottom: '0.4rem',
                                    boxShadow: `0 3px 8px ${module.color}33`
                                }}>
                                    <module.icon size={14} style={{ color: 'white' }} />
                                </div>
                                <h3 style={{ fontSize: '0.8rem', fontWeight: '700', color: 'white', margin: '0 0 0.2rem 0' }}>
                                    {module.name}
                                </h3>
                                <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.65)', margin: '0 0 0.4rem 0', lineHeight: '1.3' }}>
                                    {module.description}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.65)' }}>
                                        {moduleStats(module).total} reg.
                                    </span>
                                    <span style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: '600' }}>
                                        {moduleStats(module).growth}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
              @media (max-width: 768px) {
                .home-grid {
                  grid-template-columns: 1fr !important;
                  gap: 1rem !important;
                }
                .home-grid > .home-kpis {
                  flex-direction: row !important;
                  flex-wrap: wrap !important;
                }
                .home-grid > .home-kpis > * {
                  flex: 1 1 calc(50% - 0.75rem) !important;
                  min-width: 0 !important;
                }
                .home-grid > .home-divider {
                  display: none !important;
                }
              }
            `}</style>

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
