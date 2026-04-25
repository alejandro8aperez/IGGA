import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import {
    LayoutDashboard, Menu, LogOut, X, FileText, MonitorSmartphone,
    Users, ShoppingCart, Package, TrendingUp, Truck, Wrench,
    DollarSign, BookOpen, Wallet, BarChart3, Settings, Building2,
    ClipboardList, Cpu, HeartHandshake, Award, Megaphone,
    FolderOpen, Zap, Factory, MapPin, ChevronDown, ChevronRight
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DemoBanner from './components/DemoBanner';
import { initializeDemoData } from './components/DemoDataSeeder';
import './config/axiosConfig';
import './index.css';

// ─── Lazy pages ───────────────────────────────────────────────────────────────
const Home                 = lazy(() => import('./pages/Home'));
const Dashboard            = lazy(() => import('./pages/Dashboard_Moderno'));
const DemoPage             = lazy(() => import('./pages/DemoPage'));
const Login                = lazy(() => import('./pages/Login'));
const FormDesignerPage     = lazy(() => import('./pages/FormDesignerPage'));
const CotizadorProfesional = lazy(() => import('./components/CotizadorProfesional_Moderno'));
const KAVE_Moderno         = lazy(() => import('./pages/KAVE_Moderno'));
const MultiEmpresa_Moderno = lazy(() => import('./pages/MultiEmpresa'));
const MRP_Moderno          = lazy(() => import('./pages/MRP'));
const Ventas_Moderno       = lazy(() => import('./pages/Ventas'));
const CRM_Moderno          = lazy(() => import('./pages/CRM'));
const Inventario_Moderno   = lazy(() => import('./pages/Inventario'));
const Compras_Moderno      = lazy(() => import('./pages/Compras'));
const Logistica_Moderno    = lazy(() => import('./pages/Logistica'));
const Finanzas_Moderno     = lazy(() => import('./pages/Finanzas'));
const Activos              = lazy(() => import('./pages/Activos'));
const Operaciones          = lazy(() => import('./pages/Operaciones'));
const Mantenimiento        = lazy(() => import('./pages/Mantenimiento'));
const Produccion           = lazy(() => import('./pages/Produccion'));
const Calidad              = lazy(() => import('./pages/Calidad'));
const RRHH                 = lazy(() => import('./pages/RRHH'));
const Reportes             = lazy(() => import('./pages/Reportes'));
const Configuracion        = lazy(() => import('./pages/Configuracion'));
const Contabilidad         = lazy(() => import('./pages/Contabilidad'));
const Tesoreria            = lazy(() => import('./pages/Tesoreria'));
const Facturacion          = lazy(() => import('./pages/Facturacion'));
const Marketing            = lazy(() => import('./pages/Marketing'));
const POS                  = lazy(() => import('./pages/POS'));
const FormatosISO9001      = lazy(() => import('./pages/FormatosISO9001'));

// ─── Estructura del sidebar ───────────────────────────────────────────────────
const NAV_GROUPS = [
    {
        grupo: 'Principal',
        items: [
            { path: '/',             name: 'Inicio',        icon: LayoutDashboard },
            { path: '/dashboard',     name: 'Dashboard',     icon: LayoutDashboard },
            { path: '/multi-empresa', name: 'Multi-Empresa', icon: Building2 },
        ]
    },
    {
        grupo: 'Comercial',
        items: [
            { path: '/crm',       name: 'CRM',       icon: Users },
            { path: '/ventas',    name: 'Ventas',    icon: TrendingUp },
            { path: '/cotizador', name: 'Cotizador', icon: FileText },
            { path: '/marketing', name: 'Marketing', icon: Megaphone },
            { path: '/pos',       name: 'POS',       icon: MonitorSmartphone },
        ]
    },
    {
        grupo: 'Operaciones',
        items: [
            { path: '/produccion',    name: 'Producción',    icon: Factory },
            { path: '/mrp',           name: 'MRP',           icon: Cpu },
            { path: '/inventario',    name: 'Inventarios',   icon: Package },
            { path: '/compras',       name: 'Compras',       icon: ShoppingCart },
            { path: '/logistica',     name: 'Logística',     icon: Truck },
            { path: '/operaciones',   name: 'Operaciones',   icon: ClipboardList },
            { path: '/mantenimiento', name: 'Mantenimiento', icon: Wrench },
            { path: '/activos',       name: 'Activos',       icon: MapPin },
        ]
    },
    {
        grupo: 'Financiero',
        items: [
            { path: '/facturacion',  name: 'Facturación',  icon: FileText },
            { path: '/finanzas',     name: 'Finanzas',     icon: DollarSign },
            { path: '/contabilidad', name: 'Contabilidad', icon: BookOpen },
            { path: '/tesoreria',    name: 'Tesorería',    icon: Wallet },
            { path: '/reportes',     name: 'Reportes',     icon: BarChart3 },
        ]
    },
    {
        grupo: 'RRHH & Calidad',
        items: [
            { path: '/rrhh',          name: 'RRHH',         icon: HeartHandshake },
            { path: '/calidad',       name: 'Calidad',      icon: Award },
            { path: '/formatos-iso',  name: 'ISO 9001',     icon: FolderOpen },
            { path: '/form-designer', name: 'Formularios',  icon: FolderOpen },
        ]
    },
    {
        grupo: 'Clientes Especiales',
        items: [
            { path: '/kave', name: 'KAVE Transformadores', icon: Zap },
        ]
    },
    {
        grupo: 'Administración',
        items: [
            { path: '/configuracion', name: 'Configuración', icon: Settings },
        ]
    },
];

const ALL_ITEMS = NAV_GROUPS.flatMap(g => g.items);

// ─── Page loader ──────────────────────────────────────────────────────────────
function PageLoader() {
    return (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:'1rem' }}>
            <div style={{ width:'40px', height:'40px', border:'3px solid #1e3a5f', borderTopColor:'#667eea', borderRadius:'50%', animation:'erp-spin 0.8s linear infinite' }} />
            <span style={{ color:'#64748b', fontSize:'0.875rem' }}>Cargando módulo...</span>
            <style>{`@keyframes erp-spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

// ─── 404 ──────────────────────────────────────────────────────────────────────
function NotFound() {
    return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:'1rem' }}>
            <div style={{ fontSize:'5rem', fontWeight:800, color:'#1e293b' }}>404</div>
            <div style={{ color:'#64748b', fontSize:'1.1rem' }}>Módulo no encontrado</div>
            <Link to="/dashboard" style={{ marginTop:'1rem', padding:'0.75rem 1.5rem', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'white', borderRadius:'8px', textDecoration:'none', fontWeight:600 }}>
                Ir al Dashboard
            </Link>
        </div>
    );
}

// ─── Sidebar group ────────────────────────────────────────────────────────────
function SidebarGroup({ grupo, items, isCollapsed, currentPath, onClose }) {
    const hasActive = items.some(i => i.path === currentPath);
    const [open, setOpen] = useState(true);  // Siempre abierto por defecto

    return (
        <div style={{ marginBottom:'2px' }}>
            {!isCollapsed && (
                <button onClick={() => setOpen(o => !o)} style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    width:'100%', padding:'0.35rem 0.75rem', background:'none', border:'none',
                    color: hasActive ? '#a5b4fc' : '#475569', fontSize:'0.68rem', fontWeight:700,
                    letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer'
                }}>
                    {grupo}
                    {open ? <ChevronDown size={11}/> : <ChevronRight size={11}/>}
                </button>
            )}
            {(open || isCollapsed) && (
                <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                    {items.map(item => {
                        const active = currentPath === item.path;
                        return (
                            <li key={item.path} style={{ marginBottom:'2px' }}>
                                <Link to={item.path} onClick={onClose} title={isCollapsed ? item.name : undefined} style={{
                                    display:'flex', alignItems:'center',
                                    gap: isCollapsed ? 0 : '0.7rem',
                                    padding:'0.55rem 0.75rem', borderRadius:'8px',
                                    color: active ? '#fff' : '#94a3b8',
                                    background: active ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'transparent',
                                    textDecoration:'none', fontSize:'0.855rem', transition:'all 0.15s',
                                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                                    boxShadow: active ? '0 2px 8px rgba(102,126,234,0.3)' : 'none'
                                }}
                                    onMouseOver={e => { if(!active){ e.currentTarget.style.background='#1e3a5f'; e.currentTarget.style.color='#e2e8f0'; }}}
                                    onMouseOut={e => { if(!active){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#94a3b8'; }}}
                                >
                                    <item.icon size={17}/>
                                    {!isCollapsed && <span>{item.name}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
            {!isCollapsed && <div style={{ height:'6px' }}/>}
        </div>
    );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ width, setWidth, isOpen, onClose }) {
    const location = useLocation();
    const { user, logoutUser } = useAuth();
    const isResizing = useRef(false);
    const isCollapsed = width < 150;

    useEffect(() => {
        const onMove = e => { if(isResizing.current && e.clientX >= 60 && e.clientX <= 600) setWidth(e.clientX); };
        const onUp = () => { isResizing.current = false; document.body.style.cursor='default'; document.body.style.userSelect='auto'; };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    }, [setWidth]);

    return (
        <>
            <div onClick={onClose} style={{
                position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)',
                zIndex:9998, opacity: isOpen?1:0, visibility: isOpen?'visible':'hidden', transition:'all 0.3s'
            }}/>
            <div style={{
                width:`${width}px`, background:'linear-gradient(180deg,#0a1628 0%,#1e293b 100%)',
                borderRight:'1px solid #1e3a5f', height:'100vh', position:'fixed', top:0,
                left: isOpen?'0':`-${width}px`, zIndex:9999,
                padding: isCollapsed?'20px 8px':'20px 14px',
                color:'white', display:'flex', flexDirection:'column', overflow:'hidden',
                transition: isResizing.current?'none':'left 0.3s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: isOpen?'15px 0 40px rgba(0,0,0,0.6)':'none'
            }}>
                <button onClick={onClose} style={{ position:'absolute', right:10, top:10, background:'transparent', border:'none', color:'#475569', cursor:'pointer' }}>
                    <X size={18}/>
                </button>

                {/* Logo */}
                <div style={{ marginBottom:'1.5rem', textAlign:'center' }}>
                    <div style={{
                        width: isCollapsed?'36px':'52px', height: isCollapsed?'36px':'52px',
                        background:'linear-gradient(135deg,#667eea,#764ba2)', borderRadius:'12px',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        margin:'0 auto 0.6rem', fontWeight:800,
                        fontSize: isCollapsed?'0.9rem':'1.2rem',
                        boxShadow:'0 4px 15px rgba(102,126,234,0.4)'
                    }}>8A</div>
                    {!isCollapsed && (
                        <>
                            <div style={{ fontSize:'0.95rem', fontWeight:700, color:'#f1f5f9' }}>8AMPERIOS</div>
                            <div style={{ fontSize:'0.68rem', color:'#475569', marginTop:'2px' }}>Sistema ERP Empresarial</div>
                        </>
                    )}
                </div>

                {/* Nav */}
                <nav style={{ flex:1, overflowY:'auto' }}>
                    {NAV_GROUPS.map(g => (
                        <SidebarGroup key={g.grupo} grupo={g.grupo} items={g.items}
                            isCollapsed={isCollapsed} currentPath={location.pathname} onClose={onClose}/>
                    ))}
                </nav>

                {/* Usuario */}
                {user && !isCollapsed && (
                    <div style={{ borderTop:'1px solid #1e3a5f', paddingTop:'0.75rem', marginTop:'0.5rem' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem' }}>
                            <div style={{
                                width:'34px', height:'34px', background:'linear-gradient(135deg,#667eea,#764ba2)',
                                borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                                fontWeight:700, fontSize:'0.85rem', flexShrink:0
                            }}>{user.nombre?.charAt(0)?.toUpperCase()||'A'}</div>
                            <div style={{ overflow:'hidden' }}>
                                <div style={{ fontSize:'0.8rem', fontWeight:600, color:'#e2e8f0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.nombre||'Administrador'}</div>
                                <div style={{ fontSize:'0.68rem', color:'#64748b' }}>{user.cargo}</div>
                            </div>
                        </div>
                        <button onClick={logoutUser} style={{
                            display:'flex', alignItems:'center', gap:'0.75rem', width:'100%',
                            padding:'0.55rem 0.75rem', borderRadius:'8px', background:'transparent',
                            color:'#64748b', border:'none', cursor:'pointer', fontSize:'0.85rem', transition:'all 0.15s'
                        }}
                            onMouseOver={e=>{ e.currentTarget.style.background='#1e3a5f'; e.currentTarget.style.color='#f1f5f9'; }}
                            onMouseOut={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#64748b'; }}
                        >
                            <LogOut size={15}/><span>Cerrar Sesión</span>
                        </button>
                    </div>
                )}

                <div style={{ position:'absolute', right:0, top:0, width:'5px', height:'100%', cursor:'col-resize', zIndex:10 }}
                    onMouseDown={e=>{ isResizing.current=true; document.body.style.cursor='col-resize'; document.body.style.userSelect='none'; e.preventDefault(); }}/>
            </div>
        </>
    );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────
function TopBar({ onMenuClick, isDemoMode }) {
    const location = useLocation();
    const { user } = useAuth();
    const current = ALL_ITEMS.find(i => i.path === location.pathname);
    const ModuleIcon = current?.icon || LayoutDashboard;

    return (
        <div style={{
            position:'fixed', top: isDemoMode?'56px':0, left:0, right:0, height:'56px',
            background:'rgba(10,22,40,0.95)', backdropFilter:'blur(12px)',
            borderBottom:'1px solid #1e3a5f', display:'flex', alignItems:'center',
            padding:'0 1.25rem', gap:'1rem', zIndex:8000
        }}>
            <button onClick={onMenuClick} style={{
                background:'linear-gradient(135deg,#667eea,#764ba2)', color:'white', border:'none',
                borderRadius:'8px', width:'36px', height:'36px', display:'flex', alignItems:'center',
                justifyContent:'center', cursor:'pointer', flexShrink:0,
                boxShadow:'0 2px 8px rgba(102,126,234,0.4)'
            }}><Menu size={18}/></button>

            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flex:1 }}>
                <ModuleIcon size={17} color="#667eea"/>
                <span style={{ color:'#f1f5f9', fontWeight:600, fontSize:'0.9rem' }}>
                    {current?.name || 'ERP 8AMPERIOS'}
                </span>
            </div>

            {user && (
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:'0.78rem', color:'#e2e8f0', fontWeight:500 }}>{user.nombre}</div>
                        <div style={{ fontSize:'0.68rem', color:'#64748b' }}>{user.cargo}</div>
                    </div>
                    <div style={{
                        width:'32px', height:'32px', background:'linear-gradient(135deg,#667eea,#764ba2)',
                        borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                        fontWeight:700, fontSize:'0.85rem', color:'white'
                    }}>{user.nombre?.charAt(0)?.toUpperCase()||'A'}</div>
                </div>
            )}
        </div>
    );
}

// ─── App Content ──────────────────────────────────────────────────────────────
function AppContent() {
    const [sidebarWidth, setSidebarWidth] = useState(280);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const demo = params.get('demo') === 'true';
        setIsDemoMode(demo);
        if (demo) initializeDemoData();
    }, []);

    useEffect(() => { setIsSidebarOpen(false); }, [location.pathname]);

    const isPublic = ['/', '/login', '/demo'].includes(location.pathname);
    const showChrome = !isPublic;
    const P = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;
    const topPad = showChrome ? (isDemoMode ? '112px' : '76px') : (isDemoMode ? '56px' : '20px');

    return (
        <div style={{ display:'flex', minHeight:'100vh', backgroundColor:'#0f172a' }}>
            {isDemoMode && <DemoBanner/>}
            {showChrome && (
                <>
                    <TopBar onMenuClick={() => setIsSidebarOpen(true)} isDemoMode={isDemoMode}/>
                    <Sidebar width={sidebarWidth} setWidth={setSidebarWidth}
                        isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}/>
                </>
            )}
            <main style={{ flex:1, width:'100%', minHeight:'100vh', padding:'20px', paddingTop:topPad }}>
                <Suspense fallback={<PageLoader/>}>
                    <Routes>
                        <Route path="/"      element={<Home/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/demo"  element={<DemoPage/>}/>
                        <Route path="/dashboard"    element={<P><Dashboard/></P>}/>
                        <Route path="/cotizador"    element={<P><CotizadorProfesional/></P>}/>
                        <Route path="/form-designer" element={<P><FormDesignerPage/></P>}/>
                        <Route path="/kave"          element={<P><KAVE_Moderno/></P>}/>
                        <Route path="/multi-empresa" element={<P><MultiEmpresa_Moderno/></P>}/>
                        <Route path="/mrp"           element={<P><MRP_Moderno/></P>}/>
                        <Route path="/ventas"        element={<P><Ventas_Moderno/></P>}/>
                        <Route path="/crm"           element={<P><CRM_Moderno/></P>}/>
                        <Route path="/inventario"    element={<P><Inventario_Moderno/></P>}/>
                        <Route path="/compras"       element={<P><Compras_Moderno/></P>}/>
                        <Route path="/logistica"     element={<P><Logistica_Moderno/></P>}/>
                        <Route path="/activos"       element={<P><Activos/></P>}/>
                        <Route path="/operaciones"   element={<P><Operaciones/></P>}/>
                        <Route path="/mantenimiento" element={<P><Mantenimiento/></P>}/>
                        <Route path="/finanzas"      element={<P><Finanzas_Moderno/></P>}/>
                        <Route path="/produccion"    element={<P><Produccion/></P>}/>
                        <Route path="/calidad"       element={<P><Calidad/></P>}/>
                        <Route path="/rrhh"          element={<P><RRHH/></P>}/>
                        <Route path="/reportes"      element={<P><Reportes/></P>}/>
                        <Route path="/configuracion" element={<P><Configuracion/></P>}/>
                        <Route path="/contabilidad"  element={<P><Contabilidad/></P>}/>
                        <Route path="/tesoreria"     element={<P><Tesoreria/></P>}/>
                        <Route path="/facturacion"   element={<P><Facturacion/></P>}/>
                        <Route path="/marketing"     element={<P><Marketing/></P>}/>
                        <Route path="/pos"           element={<P><POS/></P>}/>
                        <Route path="/formatos-iso"  element={<P><FormatosISO9001/></P>}/>
                        <Route path="*"              element={<NotFound/>}/>
                    </Routes>
                </Suspense>
            </main>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent/>
            </Router>
        </AuthProvider>
    );
}

export default App;
