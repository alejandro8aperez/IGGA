import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Menu, LogOut } from 'lucide-react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import FormDesignerPage from './pages/FormDesignerPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

function Sidebar() {
    const location = useLocation();
    const { user, logoutUser } = useAuth();

    console.log('🔍 Sidebar - Renderizando');
    console.log('🔍 Location:', location.pathname);
    console.log('🔍 User:', user);

    const navItems = [
        { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/form-designer', name: 'Diseñador Formularios', icon: Menu },
        { path: '/', name: 'Inicio', icon: LayoutDashboard }
    ];

    return (
        <div className="sidebar" style={{
            width: '280px',
            background: '#1e293b',
            borderRight: '1px solid #334155',
            height: '100vh',
            position: 'fixed',
            top: '0',
            left: '0',
            zIndex: 1000,
            padding: '20px',
            color: 'white',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="/logo-8amperios-part1.svg" alt="8AMPERIOS ERP - Parte 1" style={{ width: '44px', height: '44px' }} />
                <h2 style={{ color: 'white', margin: '0', fontSize: '1.4rem' }}>8AMPERIOS</h2>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px',
                            color: location.pathname === item.path ? '#818cf8' : '#94a3b8',
                            textDecoration: 'none',
                            borderRadius: '5px'
                        }}
                    >
                        <item.icon size={20} />
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>
            {user && (
                <button 
                    onClick={logoutUser}
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '20px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '10px',
                        cursor: 'pointer'
                    }}
                >
                    <LogOut size={16} />
                </button>
            )}
        </div>
    );
}

function AppContent() {
    const location = useLocation();
    const { user } = useAuth();

    console.log('🔍 AppContent - Renderizando');
    console.log('🔍 Location:', location.pathname);
    console.log('🔍 User:', user);

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {location.pathname !== '/login' && user && <Sidebar />}
            <main style={{ 
                marginLeft: location.pathname !== '/login' && user ? '280px' : '0',
                padding: '20px',
                flex: 1
            }}>
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
