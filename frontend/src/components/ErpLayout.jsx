import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, LayoutTemplate, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ERP_MODULES_NAV } from '../pages/Home-complete';

export default function ErpLayout() {
    const { user, logoutUser } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    return (
        <div className="app-layout erp-shell">
            {!isOpen && (
                <button
                    type="button"
                    className="erp-menu-toggle"
                    onClick={() => setIsOpen(true)}
                    aria-label="Abrir menu lateral"
                >
                    <Menu size={22} />
                </button>
            )}

            <div
                className={`erp-backdrop ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(false)}
            />

            <aside className={`erp-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="erp-sidebar-header">
                    <h2>8AMPERIOS</h2>
                    <button
                        type="button"
                        className="erp-sidebar-close"
                        onClick={() => setIsOpen(false)}
                        aria-label="Cerrar menu lateral"
                    >
                        <X size={18} />
                    </button>
                </div>
                {user && (
                    <div className="erp-user-box">
                        <div>{user.nombre}</div>
                        {user.empresa?.nombre && <div>{user.empresa.nombre}</div>}
                    </div>
                )}
                <nav className="erp-sidebar-nav">
                    <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={18} />
                        <span>Inicio</span>
                    </NavLink>
                    <NavLink to="/form-designer" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <LayoutTemplate size={18} />
                        <span>Disenador de formularios</span>
                    </NavLink>
                    {ERP_MODULES_NAV.map((m) => (
                        <NavLink key={m.path} to={m.path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <m.icon size={18} />
                            <span>{m.name}</span>
                        </NavLink>
                    ))}
                </nav>
                {user && (
                    <div className="erp-sidebar-footer">
                        <button type="button" className="nav-item logout-btn" onClick={logoutUser}>
                            <LogOut size={18} />
                            <span>Salir</span>
                        </button>
                    </div>
                )}
            </aside>

            <main className="main-content erp-main-content">
                <Outlet />
            </main>
        </div>
    );
}
