import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, PackageOpen, Settings, DollarSign, ShoppingCart, Briefcase, UserCheck } from 'lucide-react';
import Inventory from './pages/Inventory';
import CRM from './pages/CRM';
import Finanzas from './pages/Finanzas';
import Compras from './pages/Compras';
import Dashboard from './pages/Dashboard';
import Operaciones from './pages/Operaciones';
import Produccion from './pages/Produccion';
import RRHH from './pages/RRHH';
import Configuracion from './pages/Configuracion';
import Reportes from './pages/Reportes';
import Facturacion from './pages/Facturacion';
import './index.css';

function Sidebar() {
    const location = useLocation();

    const navItems = [
        { path: '/', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/finanzas', name: 'Finanzas & Contab.', icon: DollarSign },
        { path: '/crm', name: 'CRM y Clientes', icon: Users },
        { path: '/inventario', name: 'Inventarios', icon: PackageOpen },
        { path: '/compras', name: 'Compras', icon: ShoppingCart },
        { path: '/operaciones', name: 'Operaciones', icon: Briefcase },
        { path: '/produccion', name: 'Producción', icon: function FactoryIcon(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M17 18h1"></path><path d="M12 18h1"></path><path d="M7 18h1"></path></svg>; } },
        { path: '/rrhh', name: 'Recursos Humanos', icon: UserCheck },
        { path: '/facturacion', name: 'Facturación FE', icon: function FileIcon(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>; } },
        { path: '/reportes', name: 'Reportes', icon: function BarChartIcon(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>; } },
        { path: '/config', name: 'Configuración', icon: Settings },
    ];

    return (
        <div className="sidebar glass-card">
            <div className="sidebar-logo">
                <h2 style={{ background: 'linear-gradient(to right, #818CF8, #C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>8AMPERIOS</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ERP Inteligente</span>
            </div>
            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                        >
                            <item.icon size={20} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

function App() {
    return (
        <Router>
            <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/crm" element={<CRM />} />
                        <Route path="/inventario" element={<Inventory />} />
                        <Route path="/finanzas" element={<Finanzas />} />
                        <Route path="/compras" element={<Compras />} />
                        <Route path="/operaciones" element={<Operaciones />} />
                        <Route path="/produccion" element={<Produccion />} />
                        <Route path="/rrhh" element={<RRHH />} />
                        <Route path="/facturacion" element={<Facturacion />} />
                        <Route path="/reportes" element={<Reportes />} />
                        <Route path="/config" element={<Configuracion />} />
                        <Route path="*" element={<div className="container"><h2>Módulo en construcción</h2></div>} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
