import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, PackageOpen, Settings, DollarSign, ShoppingCart, Briefcase, UserCheck, Truck, ShieldCheck, Megaphone, TrendingUp, Building2, Factory, LogOut } from 'lucide-react';
import axiosInstance from '../config/axiosConfig';
import Home from './pages/Home';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function Sidebar() {
    const location = useLocation();
    const { user, logoutUser } = useAuth();
    const [menuConfig, setMenuConfig] = useState({ modulos_visibles: [] });

    useEffect(() => {
        const fetchMenuConfig = async () => {
            try {
                const response = await axiosInstance.get((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '') + '/customization/menu-config/');
                setMenuConfig(response.data);
            } catch (err) {
                console.error('Error fetching menu config:', err);
            }
        };
        fetchMenuConfig();
    }, []);

    const allNavItems = [
        { path: '/', name: 'Inicio', icon: LayoutDashboard, module: 'inicio' },
        { path: '/mrp', name: 'MRP', icon: Factory, module: 'mrp' },
        { path: '/mantenimiento', name: 'Mantenimiento', icon: Settings, module: 'mantenimiento' },
        { path: '/compras', name: 'Compras', icon: ShoppingCart, module: 'compras' },
        { path: '/ventas', name: 'Ventas', icon: TrendingUp, module: 'ventas' },
        { path: '/config', name: 'Configuración', icon: Settings, module: 'configuracion' },
    ];

    const navItems = allNavItems.filter(item => {
        if (['inicio'].includes(item.module)) return true;
        if (!menuConfig.modulos_visibles || menuConfig.modulos_visibles.length === 0) {
            return true;
        }
        return menuConfig.modulos_visibles.includes(item.module);
    });

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <h2>8AMPERIOS</h2>
                </div>
                {user && (
                    <div className="user-info">
                        <span className="user-name">{user.nombre}</span>
                        <span className="user-role">{user.cargo}</span>
                        <span className="user-empresa">{user.empresa?.nombre}</span>
                    </div>
                )}
            </div>
            
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        <item.icon size={20} />
                        <span>{item.name}</span>
                    </Link>
                ))}
                
                {user && (
                    <button 
                        onClick={logoutUser}
                        className="nav-item logout-btn"
                    >
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </button>
                )}
            </nav>
        </div>
    );
}

function AppContent() {
    const location = useLocation();
    const { user } = useAuth();

    return (
        <div className={`app-layout ${location.pathname === '/' ? 'home-layout' : ''}`}>
            {location.pathname !== '/login' && <Sidebar />}
            <main className={`main-content ${location.pathname === '/' ? 'full-width' : ''}`}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    } />
                    <Route path="/mrp" element={
                        <ProtectedRoute>
                            <div>MRP Module</div>
                        </ProtectedRoute>
                    } />
                    <Route path="/mantenimiento" element={
                        <ProtectedRoute>
                            <div>Mantenimiento Module</div>
                        </ProtectedRoute>
                    } />
                    <Route path="/compras" element={
                        <ProtectedRoute>
                            <div>Compras Module</div>
                        </ProtectedRoute>
                    } />
                    <Route path="/ventas" element={
                        <ProtectedRoute>
                            <div>Ventas Module</div>
                        </ProtectedRoute>
                    } />
                    <Route path="/config" element={
                        <ProtectedRoute>
                            <div>Config Module</div>
                        </ProtectedRoute>
                    } />
                    <Route path="*" element={<div className="container"><h2>Módulo en construcción</h2></div>} />
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
