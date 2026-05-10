import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Routes, Route } from 'react-router-dom';
import { LayoutDashboard, LogOut, LayoutTemplate, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ERP_MODULES_NAV } from '../pages/Home-complete';

// Importación de los componentes de página para el enrutamiento directo
import HomeModerno from '../pages/Home_Moderno';
import MultiEmpresa_Moderno from '../pages/MultiEmpresa_Moderno';
import MRP_Moderno from '../pages/MRP_Moderno';
import Dashboard_Moderno from '../pages/Dashboard_Moderno';
import Ventas from '../pages/Ventas';
import CRM from '../pages/CRM';
import Inventario from '../pages/Inventario';
import Compras_Moderno from '../pages/Compras_Moderno';
import Logistica_Moderno from '../pages/Logistica_Moderno';
import RRHH from '../pages/RRHH';
import Nomina from '../pages/Nomina';
import POS from '../pages/POS';
import Facturacion from '../pages/Facturacion';
import Marketing from '../pages/Marketing';
import KAVE from '../pages/KAVE';
import Produccion from '../pages/Produccion';
import Calidad from '../pages/Calidad';
import Configuracion from '../pages/Configuracion';
import Contabilidad from '../pages/Contabilidad';
import Contratos from '../pages/Contratos';
import Equipos from '../pages/Equipos';
import FacturacionElectronica from '../pages/FacturacionElectronica';
import Finanzas from '../pages/Finanzas';
import FormatosISO9001 from '../pages/FormatosISO9001';
import Informediarioproy from '../pages/Informediarioproy';
import Mantenimiento from '../pages/Mantenimiento';
import Planeacion from '../pages/Planeacion';
import Proyectos from '../pages/Proyectos';
import FormDesignerPage from '../pages/FormDesignerPage';

// Mapeo de rutas a componentes reales para renderizado dinámico
const moduleComponentMap = {
    '/': HomeModerno,
    '/multi-empresa': MultiEmpresa_Moderno,
    '/mrp': MRP_Moderno,
    '/dashboard': Dashboard_Moderno,
    '/ventas': Ventas,
    '/crm': CRM,
    '/inventario': Inventario,
    '/compras': Compras_Moderno,
    '/logistica': Logistica_Moderno,
    '/rrhh': RRHH,
    '/nomina': Nomina,
    '/pos': POS,
    '/facturacion': Facturacion,
    '/marketing': Marketing,
    '/kave': KAVE,
    '/produccion': Produccion,
    '/calidad': Calidad,
    '/config': Configuracion,
    '/contabilidad': Contabilidad,
    '/contratos': Contratos,
    '/equipos': Equipos,
    '/facturacion-electronica': FacturacionElectronica,
    '/finanzas': Finanzas,
    '/formatos-iso9001': FormatosISO9001,
    '/informe-diario-proy': Informediarioproy,
    '/mantenimiento': Mantenimiento,
    '/planeacion': Planeacion,
    '/proyectos': Proyectos,
    '/form-designer': FormDesignerPage,
    // Rutas adicionales de ERP_MODULES_NAV que puedan variar
    '/activos': Inventario, // O el componente que corresponda
    '/operaciones': Informediarioproy,
    '/proyectos-ps': Proyectos,
    '/reportes': Dashboard_Moderno,
    '/reportes-avanzados': Dashboard_Moderno,
    '/tesoreria': Finanzas,
};

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
                <Routes>
                    {/* Ruta por defecto del Layout */}
                    <Route index element={<HomeModerno />} />
                    {/* Generar rutas dinámicas para cada módulo registrado */}
                    {ERP_MODULES_NAV.map((m) => {
                        const Component = moduleComponentMap[m.path];
                        return Component ? <Route key={m.path} path={m.path} element={<Component />} /> : null;
                    })}
                    {/* Ruta específica para el diseñador */}
                    <Route path="/form-designer" element={<FormDesignerPage />} />
                </Routes>
                {/* Mantenemos el Outlet por si App.js define rutas anidadas adicionales */}
                <Outlet />
            </main>
        </div>
    );
}
