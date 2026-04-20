import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home-complete';

// Importaciones de TODOS los módulos
import MRP from './pages/MRP';
import Mantenimiento from './pages/Mantenimiento';
import Compras from './pages/Compras';
import Ventas from './pages/Ventas';
import Configuracion from './pages/Configuracion';
import Dashboard from './pages/Dashboard';
import MultiEmpresa from './pages/MultiEmpresa';
import CRM from './pages/CRM';
import Calidad from './pages/Calidad';
import Activos from './pages/Activos';
import Contabilidad from './pages/Contabilidad';
import Contratos from './pages/Contratos';
import Equipos from './pages/Equipos';
import Facturacion from './pages/Facturacion';
import Finanzas from './pages/Finanzas';
import Inventario from './pages/Inventario';
import Logistica from './pages/Logistica';
import Marketing from './pages/Marketing';
import Operaciones from './pages/Operaciones';
import Planeacion from './pages/Planeacion';
import Produccion from './pages/Produccion';
import Proyectos from './pages/Proyectos';
import ProyectosPS from './pages/ProyectosPS';
import RRHH from './pages/RRHH';
import Reportes from './pages/Reportes';
import ReportesAvanzados from './pages/ReportesAvanzados';
import Tesoreria from './pages/Tesoreria';
import KAVE from './pages/KAVE';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/mrp" element={<MRP />} />
                    <Route path="/mantenimiento" element={<Mantenimiento />} />
                    <Route path="/compras" element={<Compras />} />
                    <Route path="/ventas" element={<Ventas />} />
                    <Route path="/config" element={<Configuracion />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/multi-empresa" element={<MultiEmpresa />} />
                    <Route path="/crm" element={<CRM />} />
                    <Route path="/calidad" element={<Calidad />} />
                    <Route path="/activos" element={<Activos />} />
                    <Route path="/contabilidad" element={<Contabilidad />} />
                    <Route path="/contratos" element={<Contratos />} />
                    <Route path="/equipos" element={<Equipos />} />
                    <Route path="/facturacion" element={<Facturacion />} />
                    <Route path="/finanzas" element={<Finanzas />} />
                    <Route path="/inventario" element={<Inventario />} />
                    <Route path="/logistica" element={<Logistica />} />
                    <Route path="/marketing" element={<Marketing />} />
                    <Route path="/operaciones" element={<Operaciones />} />
                    <Route path="/planeacion" element={<Planeacion />} />
                    <Route path="/produccion" element={<Produccion />} />
                    <Route path="/proyectos" element={<Proyectos />} />
                    <Route path="/proyectos-ps" element={<ProyectosPS />} />
                    <Route path="/rrhh" element={<RRHH />} />
                    <Route path="/reportes" element={<Reportes />} />
                    <Route path="/reportes-avanzados" element={<ReportesAvanzados />} />
                    <Route path="/tesoreria" element={<Tesoreria />} />
                    <Route path="/kave" element={<KAVE />} />
                    <Route path="*" element={<div style={{padding: '2rem', textAlign: 'center'}}><h2>Módulo en construcción</h2></div>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
