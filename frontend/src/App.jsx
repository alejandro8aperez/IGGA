import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Menu, LogOut, X, FileText } from 'lucide-react';

// Importaciones de componentes modernos
import Home from './pages/Home';
import Dashboard from './pages/Dashboard_Moderno';
import FormDesignerPage from './pages/FormDesignerPage';
import DemoPage from './pages/DemoPage';
import CotizadorProfesional from './components/CotizadorProfesional_Moderno';
import KAVE_Moderno from './pages/KAVE_Moderno';
import MultiEmpresa_Moderno from './pages/MultiEmpresa';
import MRP_Moderno from './pages/MRP';
import Ventas_Moderno from './pages/Ventas';
import CRM_Moderno from './pages/CRM';
import Inventario_Moderno from './pages/Inventario';
import Compras_Moderno from './pages/Compras';
import Logistica_Moderno from './pages/Logistica';
import Finanzas_Moderno from './pages/Finanzas';
import Activos from './pages/Activos';
import Operaciones from './pages/Operaciones';
import Mantenimiento from './pages/Mantenimiento';
import Produccion from './pages/Produccion';
import Calidad from './pages/Calidad';
import RRHH from './pages/RRHH';
import Reportes from './pages/Reportes';
import Configuracion from './pages/Configuracion';
import Contabilidad from './pages/Contabilidad';
import Tesoreria from './pages/Tesoreria';
import Facturacion from './pages/Facturacion';
import Marketing from './pages/Marketing';
import POS from './pages/POS';
import DemoBanner from './components/DemoBanner';
import { initializeDemoData } from './components/DemoDataSeeder';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

console.log('App.jsx loaded - MODERNIZACION ACTIVADA');

function Sidebar({ width, setWidth, isOpen, onClose }) {
    const location = useLocation();
    const { user, logoutUser } = useAuth();
    const isResizing = useRef(false);

    const navItems = [
        { path: '/', name: 'Inicio', icon: LayoutDashboard },
        { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/cotizador', name: 'Cotizador Profesional', icon: FileText },
        { path: '/form-designer', name: 'Diseñador Formularios', icon: Menu },
        { path: '/kave', name: 'KAVE', icon: LayoutDashboard },
        { path: '/multi-empresa', name: 'Multi-Empresa', icon: LayoutDashboard },
        { path: '/mrp', name: 'MRP', icon: LayoutDashboard },
        { path: '/ventas', name: 'Ventas', icon: LayoutDashboard },
        { path: '/crm', name: 'CRM', icon: LayoutDashboard },
        { path: '/inventario', name: 'Inventarios', icon: LayoutDashboard },
        { path: '/compras', name: 'Compras', icon: LayoutDashboard },
        { path: '/logistica', name: 'Logística', icon: LayoutDashboard },
        { path: '/activos', name: 'Activos', icon: LayoutDashboard },
        { path: '/operaciones', name: 'Operaciones', icon: LayoutDashboard },
        { path: '/mantenimiento', name: 'Mantenimiento', icon: LayoutDashboard },
        { path: '/finanzas', name: 'Finanzas', icon: LayoutDashboard },
        { path: '/produccion', name: 'Producción', icon: LayoutDashboard },
        { path: '/calidad', name: 'Calidad', icon: LayoutDashboard },
        { path: '/rrhh', name: 'RRHH', icon: LayoutDashboard },
        { path: '/reportes', name: 'Reportes', icon: LayoutDashboard },
        { path: '/contabilidad', name: 'Contabilidad', icon: LayoutDashboard },
        { path: '/tesoreria', name: 'Tesorería', icon: LayoutDashboard },
        { path: '/facturacion', name: 'Facturación', icon: LayoutDashboard },
        { path: '/marketing', name: 'Marketing', icon: LayoutDashboard },
        { path: '/pos', name: 'POS Panadería', icon: MonitorSmartphone },
        { path: '/configuracion', name: 'Configuración', icon: LayoutDashboard }
    ];

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing.current) return;
            const newWidth = e.clientX;
            if (newWidth >= 60 && newWidth <= 600) {
                setWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            isResizing.current = false;
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [setWidth]);

    const isCollapsed = width < 150;

    return (
        <>
            {/* Backdrop (Fondo oscuro) */}
            <div 
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9998,
                    opacity: isOpen ? 1 : 0,
                    visibility: isOpen ? 'visible' : 'hidden',
                    transition: 'all 0.3s ease-in-out'
                }}
            />

            {/* Sidebar Modal (Drawer) */}
            <div className="sidebar" style={{
                width: `${width}px`,
                background: '#1e293b',
                borderRight: '1px solid #334155',
                height: '100vh',
                position: 'fixed',
                top: '0',
                left: isOpen ? '0' : `-${width}px`,
                zIndex: 9999,
                padding: isCollapsed ? '20px 10px' : '20px',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: isResizing.current ? 'none' : 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isOpen ? '10px 0 30px rgba(0,0,0,0.5)' : 'none'
            }}>
                {/* Botón cerrar dentro del sidebar */}
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        right: '10px',
                        top: '10px',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '5px'
                    }}
                >
                    <X size={20} />
                </button>

                {/* Logo */}
                <div style={{
                    marginBottom: '2rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: isCollapsed ? '40px' : '60px',
                        height: isCollapsed ? '40px' : '60px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        fontSize: '1.5rem',
                        fontWeight: 'bold'
                    }}>
                        8A
                    </div>
                    {!isCollapsed && (
                        <div>
                            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem' }}>
                                8AMPERIOS
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8' }}>
                                ERP Moderno
                            </p>
                        </div>
                    )}
                </div>

                {/* Navegación */}
                <nav style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {navItems.map((item) => (
                            <li key={item.path} style={{ marginBottom: '0.5rem' }}>
                                <Link
                                    to={item.path}
                                    onClick={onClose}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: isCollapsed ? '0' : '1rem',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        color: location.pathname === item.path ? '#ffffff' : '#94a3b8',
                                        background: location.pathname === item.path ? '#667eea' : 'transparent',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s',
                                        justifyContent: isCollapsed ? 'center' : 'flex-start'
                                    }}
                                    onMouseOver={(e) => {
                                        if (location.pathname !== item.path) {
                                            e.currentTarget.style.background = '#334155';
                                            e.currentTarget.style.color = '#ffffff';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (location.pathname !== item.path) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = '#94a3b8';
                                        }
                                    }}
                                >
                                    <item.icon size={20} />
                                    {!isCollapsed && <span>{item.name}</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Usuario */}
                {user && !isCollapsed && (
                    <div style={{
                        borderTop: '1px solid #334155',
                        paddingTop: '1rem',
                        marginTop: 'auto'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                background: '#667eea',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold'
                            }}>
                                {user.name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                                    {user.name || 'Administrador'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                    {user.email || 'admin@8amperios.com'}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={logoutUser}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                background: 'transparent',
                                color: '#94a3b8',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#334155';
                                e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#94a3b8';
                            }}
                        >
                            <LogOut size={20} />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                )}

                {/* Resize Handle */}
                <div
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        width: '5px',
                        height: '100%',
                        background: 'transparent',
                        cursor: 'col-resize',
                        zIndex: 10
                    }}
                    onMouseDown={(e) => {
                        isResizing.current = true;
                        document.body.style.cursor = 'col-resize';
                        document.body.style.userSelect = 'none';
                        e.preventDefault();
                    }}
                />
            </div>
        </>
    );
}

function AppContent() {
    const [sidebarWidth, setSidebarWidth] = useState(280);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const location = useLocation();
    const { user } = useAuth();

    useEffect(() => {
        // Detectar modo demo por URL
        const params = new URLSearchParams(window.location.search);
        setIsDemoMode(params.get('demo') === 'true');
        
        // Inicializar datos demo si es necesario
        if (params.get('demo') === 'true') {
            initializeDemoData();
        }
    }, [location.pathname]);

    // Cerrar sidebar al cambiar de ruta
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    const showSidebarButton = location.pathname !== '/login' && location.pathname !== '/demo';

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a' }}>
            {/* Banner de Demo */}
            {isDemoMode && <DemoBanner />}

            {/* Botón Flotante para abrir el menú */}
            {showSidebarButton && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    style={{
                        position: 'fixed',
                        left: '20px',
                        top: isDemoMode ? '80px' : '20px',
                        zIndex: 9000,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        width: '45px',
                        height: '45px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Menu size={24} />
                </button>
            )}

            {showSidebarButton && (
                <Sidebar 
                    width={sidebarWidth} 
                    setWidth={setSidebarWidth} 
                    isOpen={isSidebarOpen} 
                    onClose={() => setIsSidebarOpen(false)} 
                />
            )}

            <main style={{ 
                marginLeft: '0',
                padding: '20px',
                paddingTop: showSidebarButton 
                    ? (isDemoMode ? '120px' : '80px') 
                    : (isDemoMode ? '80px' : '20px'),
                flex: 1,
                width: '100%',
                minHeight: '100vh'
            }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/demo" element={<DemoPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/cotizador" element={<CotizadorProfesional />} />
                    <Route path="/form-designer" element={<FormDesignerPage />} />
                    <Route path="/kave" element={<KAVE_Moderno />} />
                    <Route path="/multi-empresa" element={<MultiEmpresa_Moderno />} />
                    <Route path="/mrp" element={<MRP_Moderno />} />
                    <Route path="/ventas" element={<Ventas_Moderno />} />
                    <Route path="/crm" element={<CRM_Moderno />} />
                    <Route path="/inventario" element={<Inventario_Moderno />} />
                    <Route path="/compras" element={<Compras_Moderno />} />
                    <Route path="/logistica" element={<Logistica_Moderno />} />
                    <Route path="/activos" element={<Activos />} />
                    <Route path="/operaciones" element={<Operaciones />} />
                    <Route path="/mantenimiento" element={<Mantenimiento />} />
                    <Route path="/finanzas" element={<Finanzas_Moderno />} />
                    <Route path="/produccion" element={<Produccion />} />
                    <Route path="/calidad" element={<Calidad />} />
                    <Route path="/rrhh" element={<RRHH />} />
                    <Route path="/reportes" element={<Reportes />} />
                    <Route path="/configuracion" element={<Configuracion />} />
                    <Route path="/contabilidad" element={<Contabilidad />} />
                    <Route path="/tesoreria" element={<Tesoreria />} />
                    <Route path="/facturacion" element={<Facturacion />} />
                    <Route path="/marketing" element={<Marketing />} />
                    <Route path="/pos" element={<POS />} />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;
