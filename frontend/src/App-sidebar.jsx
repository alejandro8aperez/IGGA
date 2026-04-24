import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Factory, Settings, ShoppingCart, TrendingUp, LogOut, User } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';

// Importaciones de módulos principales
import MRP from './pages/MRP';
import Mantenimiento from './pages/Mantenimiento';
import Compras from './pages/Compras';
import Ventas from './pages/Ventas';
import Configuracion from './pages/Configuracion';
import './index.css';

function Sidebar() {
    const location = useLocation();
    const { user, logoutUser } = useAuth();

    const modules = [
        { path: '/', name: 'Inicio', icon: LayoutDashboard },
        { path: '/mrp', name: 'MRP', icon: Factory },
        { path: '/mantenimiento', name: 'Mantenimiento', icon: Settings },
        { path: '/compras', name: 'Compras', icon: ShoppingCart },
        { path: '/ventas', name: 'Ventas', icon: TrendingUp },
        { path: '/config', name: 'Configuración', icon: Settings },
    ];

    if (!user) {
        return null;
    }

    return (
        <div style={{
            width: '250px',
            background: '#1e293b',
            color: 'white',
            padding: '1rem',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            borderRight: '1px solid #334155'
        }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                    src="/logo-8amperios-part1.svg"
                    alt="8AMPERIOS ERP - Parte 1"
                    style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff' }}
                />
                <div>
                    <h2 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>8AMPERIOS</h2>
                    <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                        {user.nombre} - {user.cargo}
                    </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                    {user.empresa?.nombre}
                </div>
            </div>
            
            <nav>
                {modules.map((module) => (
                    <a
                        key={module.path}
                        href={module.path}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            color: location.pathname === module.path ? '#f8fafc' : '#cbd5e1',
                            textDecoration: 'none',
                            borderRadius: '0.5rem',
                            marginBottom: '0.5rem',
                            background: location.pathname === module.path ? '#4f46e5' : 'transparent',
                            transition: 'all 0.2s'
                        }}
                    >
                        <module.icon size={18} />
                        <span>{module.name}</span>
                    </a>
                ))}
                
                <button
                    onClick={logoutUser}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        color: '#ef4444',
                        background: 'none',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        width: '100%',
                        marginTop: '1rem'
                    }}
                >
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                </button>
            </nav>
        </div>
    );
}

function ProtectedRoute({ children }) {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

function AppContent() {
    const location = useLocation();
    const { user } = useAuth();

    if (location.pathname === '/login') {
        return <Login />;
    }

    return (
        <div style={{ display: 'flex' }}>
            {user && <Sidebar />}
            <main style={{
                flex: 1,
                marginLeft: user ? '250px' : '0',
                padding: '2rem',
                background: '#f8fafc'
            }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/mrp" element={<ProtectedRoute><MRP /></ProtectedRoute>} />
                    <Route path="/mantenimiento" element={<ProtectedRoute><Mantenimiento /></ProtectedRoute>} />
                    <Route path="/compras" element={<ProtectedRoute><Compras /></ProtectedRoute>} />
                    <Route path="/ventas" element={<ProtectedRoute><Ventas /></ProtectedRoute>} />
                    <Route path="/config" element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />
                    <Route path="*" element={
                        <div style={{padding: '3rem', textAlign: 'center'}}>
                            <h2>Módulo en construcción</h2>
                        </div>
                    } />
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
