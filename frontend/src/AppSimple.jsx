import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, PackageOpen, Settings, DollarSign, ShoppingCart, Briefcase, UserCheck, Truck, ShieldCheck, Megaphone, TrendingUp, Building2, Factory, LogOut, Palette } from 'lucide-react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import FormDesignerPage from './pages/FormDesignerPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

function Sidebar() {
    const location = useLocation();
    const { user, logoutUser } = useAuth();

    const allNavItems = [
        { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard, module: 'dashboard' },
        { path: '/form-designer', name: 'Diseñador Formularios', icon: Palette, module: 'form_designer' },
        { path: '/', name: 'Inicio', icon: LayoutDashboard, module: 'home' }
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src="/logo-8amperios-part1.svg" alt="8AMPERIOS ERP - Parte 1" style={{ width: '40px', height: '40px' }} />
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>8AMPERIOS</h2>
                </div>
                {user && (
                    <div className="user-info">
                        <span>{user.username}</span>
                        <button onClick={logoutUser} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <LogOut size={20} />
                        </button>
                    </div>
                )}
            </div>
            <nav className="sidebar-nav">
                {allNavItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            color: location.pathname === item.path ? 'var(--primary)' : '#94A3B8',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <item.icon size={20} />
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}

function AppContent() {
    const location = useLocation();

    return (
        <div className="app-layout">
            {location.pathname !== '/' && location.pathname !== '/login' && <Sidebar />}
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/form-designer" element={<FormDesignerPage />} />
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
