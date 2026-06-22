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
import { useMobileMode } from '../context/MobileModeContext';
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
const API_INFORMES      = API.INFORME_DIARIO.INFORMES;
const API_EMPLEADOS     = API.RRHH.EMPLEADOS;
const API_INSPECCIONES  = API.CALIDAD.INSPECCIONES;

const ROW1_MODULES = ['CRM', 'Proveedores', 'Operaciones', 'Interventoría'];
const ROW2_MODULES = ['Informe Diario Proy', 'Informe Semanal', 'Informe Mensual', 'Calidad', 'RRHH', 'ISO 9001'];

const modules = [
    {
        name: 'CRM',
        description: 'Gestión de relaciones con clientes',
        icon: Users,
        color: '#667eea',
        path: '/crm',
        stats: { total: 0, growth: '' }
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
        name: 'Operaciones',
        description: 'Gestión de proyectos y obras',
        icon: Wrench,
        color: '#1e293b',
        path: '/operaciones',
        stats: { total: 0, growth: '' }
    },
    {
        name: 'Interventoría',
        description: 'Contratos, visitas y hallazgos',
        icon: ClipboardList,
        color: '#7c3aed',
        path: '/interventoria',
        stats: { total: 0, growth: 'Nuevo' }
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
        name: 'Calidad',
        description: 'Gestión de calidad ISO 9001',
        icon: Shield,
        color: '#14b8a6',
        path: '/calidad',
        stats: { total: 0, growth: '' }
    },
    {
        name: 'RRHH',
        description: 'Recursos Humanos y nómina',
        icon: Users2,
        color: '#f97316',
        path: '/rrhh',
        stats: { total: 0, growth: '' }
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
// ── ModuleCard ───────────────────────────────────────────────────────────────
function ModuleCard({ module, primary, loading, selectedModule, openModule, moduleStats }) {
    return (
        <div
            onClick={() => openModule(module)}
            style={{
                background: primary ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
                borderRadius: '10px',
                padding: '0.75rem',
                border: primary ? '2px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.18)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                opacity: loading && selectedModule?.name === module.name ? 0.7 : 1
            }}
            onMouseOver={e => {
                e.currentTarget.style.background = primary ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.14)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = primary ? '0 16px 32px rgba(0,0,0,0.2)' : '0 16px 32px rgba(0,0,0,0.15)';
            }}
            onMouseOut={e => {
                e.currentTarget.style.background = primary ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={{
                width: primary ? '28px' : '26px',
                height: primary ? '28px' : '26px',
                background: module.color,
                borderRadius: primary ? '8px' : '7px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: primary ? '0.5rem' : '0.4rem',
                boxShadow: primary ? `0 4px 10px ${module.color}44` : `0 3px 8px ${module.color}33`
            }}>
                <module.icon size={primary ? 16 : 14} style={{ color: 'white' }} />
            </div>
            <h3 style={{ fontSize: primary ? '0.82rem' : '0.8rem', fontWeight: '700', color: 'white', margin: '0 0 0.2rem 0' }}>
                {module.name}
            </h3>
            <p style={{ fontSize: primary ? '0.62rem' : '0.6rem', color: 'rgba(255,255,255,0.75)', margin: '0 0 0.4rem 0', lineHeight: '1.3' }}>
                {module.description}
            </p>
            {primary ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'white' }}>
                        {moduleStats(module).total}
                    </span>
                    <span style={{ fontSize: '0.58rem', color: '#86efac', fontWeight: '600' }}>
                        {moduleStats(module).growth}
                    </span>
                </div>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.65)' }}>
                        {moduleStats(module).total} reg.
                    </span>
                    <span style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: '600' }}>
                        {moduleStats(module).growth}
                    </span>
                </div>
            )}
        </div>
    );
}

export default function Home() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isMobileMode, setMobileMode } = useMobileMode();
    const [selectedModule, setSelectedModule] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [stats, setStats] = useState({
        clientes: 0,
        cotizaciones: 0,
        pedidos: 0,

        facturas: 0,
        proveedores: 0,
        ordenes: 0,
        productos: 0,
        proyectos: 0,
        diseños: 0,
        informes: 0,
        empleados: 0,
        inspecciones: 0
    });

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 767px)');
        const handler = e => setIsMobile(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    useEffect(() => {
        fetchStats();
        const onFocus = () => fetchStats();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
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
                axiosInstance.get(API_DISEÑOS),
                axiosInstance.get(API_INFORMES),
                axiosInstance.get(API_EMPLEADOS),
                axiosInstance.get(API_INSPECCIONES)
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
                diseños: getValue(results[8]),
                informes: getValue(results[9]),
                empleados: getValue(results[10]),
                inspecciones: getValue(results[11])
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
        if (module.path === '/crm') {
            return { total: stats.clientes, growth: `${stats.cotizaciones} cotizaciones` };
        }
        if (module.path === '/productos') {
            return { total: stats.productos, growth: 'SAP MM' };
        }
        if (module.path === '/proveedores') {
            return { total: stats.proveedores, growth: 'Nuevo' };
        }
        if (module.path === '/operaciones') {
            return { total: stats.proyectos, growth: 'Proyectos' };
        }
        if (module.path === '/informe-diario-proy') {
            return { total: stats.informes, growth: 'Registros' };
        }
        if (module.path === '/rrhh') {
            return { total: stats.empleados, growth: 'Empleados' };
        }
        if (module.path === '/calidad') {
            return { total: stats.inspecciones, growth: 'Inspecciones' };
        }
        return module.stats || { total: '—', growth: '' };
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
                justifyContent: 'space-between',
                gap: '1rem',
                marginBottom: '3rem',
                flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1 }}>
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
                        <h1 style={{ margin: 0, fontSize: isMobileMode ? '1.6rem' : '2.5rem', fontWeight: 900 }}>IGGA</h1>
                        <p style={{ margin: 0, fontSize: isMobileMode ? '0.85rem' : '1.1rem', opacity: 0.8 }}>INGENIERIA Y GESTION ADMINISTRATIVA</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setMobileMode(!isMobileMode);
                        if (!isMobileMode) navigate('/informe-diario-proy');
                    }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: isMobileMode ? '0.6rem 1.2rem' : '0.75rem 1.5rem',
                        borderRadius: 50,
                        border: isMobileMode ? '2px solid #fbbf24' : 'none',
                        background: isMobileMode ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                        color: isMobileMode ? '#fbbf24' : 'white',
                        fontWeight: 700,
                        fontSize: isMobileMode ? '0.85rem' : '0.95rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: isMobileMode ? '0 0 20px rgba(251,191,36,0.3)' : 'none',
                        flexShrink: 0
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = isMobileMode ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.25)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = isMobileMode ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.15)'; }}
                >
                    <MonitorSmartphone size={isMobileMode ? 18 : 20} />
                    {isMobileMode ? 'MODO CELULAR ✓' : '📱 CELULAR'}
                </button>
            </div>

            {/* ── Layout ──────────────────────────────────────────────── */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '1.5rem',
                maxWidth: '1500px',
                margin: '0 auto',
                alignItems: 'start'
            }}>
                {/* ── COLUMNA 1: KPIs ──────────────────────────────────── */}
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'row' : 'column',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    minWidth: isMobile ? '100%' : '170px',
                    width: isMobile ? '100%' : '170px',
                    flexShrink: 0,
                }}>
                    {[
                        { icon: Users,        label: 'Clientes',    value: stats.clientes },
                        { icon: FileText,     label: 'Cotizaciones',value: stats.cotizaciones },
                        { icon: ShoppingCart, label: 'Pedidos',     value: stats.pedidos },
                        { icon: Package,      label: 'Proveedores', value: stats.proveedores },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} style={{
                            flex: isMobile ? '1 1 calc(50% - 0.75rem)' : 'none',
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
                <div style={{ flex: 1, width: isMobile ? '100%' : 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
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

                    {/* Primera fila: CRM, Proveedores, Operaciones, Interventoría */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                        gap: '0.65rem'
                    }}>
                        {filteredModules.filter(m => ROW1_MODULES.includes(m.name)).sort((a,b) => ROW1_MODULES.indexOf(a.name) - ROW1_MODULES.indexOf(b.name)).map((module) => (
                            <ModuleCard key={module.name} module={module} primary
                                loading={loading} selectedModule={selectedModule} openModule={openModule} moduleStats={moduleStats} />
                        ))}
                    </div>

                    {/* Segunda fila: Informe Diario, Informe Semanal, Informe Mensual, Calidad, RRHH, ISO 9001 */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                        gap: '0.65rem'
                    }}>
                        {filteredModules.filter(m => ROW2_MODULES.includes(m.name)).sort((a,b) => ROW2_MODULES.indexOf(a.name) - ROW2_MODULES.indexOf(b.name)).map((module) => (
                            <ModuleCard key={module.name} module={module} primary
                                loading={loading} selectedModule={selectedModule} openModule={openModule} moduleStats={moduleStats} />
                        ))}
                    </div>
                </div>

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
                    <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
                </div>
            )}
        </div>
    );
}
